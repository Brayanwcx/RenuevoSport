import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';
import { InvoiceDetail } from '../entities/invoice-detail.entity';
import { CreateInvoiceDto } from '../dtos/invoice.dto';
import { ProductsService } from '../../products/services/products.service';
import { InventoryMovementsService } from '../../inventory-movements/services/inventory-movements.service';
import { CashRegisterService } from '../../cash-register/services/cash-register.service';
import { User } from '../../users/entities/user.entity';

const TAX_RATE = 0.19; // IVA 19%

@Injectable()
export class InvoicesService {
    constructor(
        @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
        @InjectRepository(InvoiceDetail) private detailRepo: Repository<InvoiceDetail>,
        private productsService: ProductsService,
        private inventoryMovementsService: InventoryMovementsService,
        private cashRegisterService: CashRegisterService,
    ) {}

    async findAll() {
        return this.invoiceRepo.find({
            relations: ['user', 'details', 'details.product'],
            order: { createdAt: 'DESC' },
        });
    }

    async findRecent(limit: number = 10) {
        return this.invoiceRepo.find({
            relations: ['user', 'details', 'details.product'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    async findOne(id: number) {
        const invoice = await this.invoiceRepo.findOne({
            where: { id },
            relations: ['user', 'details', 'details.product'],
        });
        if (!invoice) {
            throw new NotFoundException(`Invoice #${id} not found`);
        }
        return invoice;
    }

    async create(dto: CreateInvoiceDto, user: User) {
        // 1. Generar número de factura
        const invoiceNumber = await this.generateInvoiceNumber();

        // 2. Procesar cada detalle
        const details: InvoiceDetail[] = [];
        let subtotal = 0;

        for (const item of dto.details) {
            const product = await this.productsService.findOne(item.productId);

            // Verificar stock
            if (Number(product.stock) < item.quantity) {
                throw new BadRequestException(
                    `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${item.quantity}`,
                );
            }

            const itemSubtotal = Number(product.salePrice) * item.quantity;
            subtotal += itemSubtotal;

            const detail = this.detailRepo.create({
                product,
                productName: product.name,
                quantity: item.quantity,
                unitPrice: product.salePrice,
                subtotal: itemSubtotal,
            });
            details.push(detail);
        }

        // 3. Calcular totales
        const tax = subtotal * TAX_RATE;
        const total = subtotal + tax;

        // 4. Crear factura
        const invoice = this.invoiceRepo.create({
            invoiceNumber,
            customerName: dto.customerName,
            customerDoc: dto.customerDoc,
            user,
            subtotal,
            tax,
            total,
            paymentMethod: dto.paymentMethod,
            status: 'completed',
            notes: dto.notes,
            details,
        });

        const savedInvoice = await this.invoiceRepo.save(invoice);

        // 5. Descontar stock y registrar movimientos de inventario
        for (const item of dto.details) {
            const product = await this.productsService.findOne(item.productId);
            await this.productsService.updateStock(product.id, -item.quantity);
            await this.inventoryMovementsService.createAutoMovement(
                product,
                user,
                'exit',
                item.quantity,
                `Venta - Factura ${invoiceNumber}`,
                'invoice',
                savedInvoice.id,
            );
        }

        // 6. Registrar movimiento de caja si paga en efectivo
        if (dto.paymentMethod === 'cash') {
            await this.cashRegisterService.addSaleMovement(total, invoiceNumber, user);
        }

        return savedInvoice;
    }

    async cancel(id: number, user: User) {
        const invoice = await this.findOne(id);

        if (invoice.status === 'cancelled') {
            throw new BadRequestException('Esta factura ya está cancelada');
        }

        // Devolver stock
        for (const detail of invoice.details) {
            await this.productsService.updateStock(detail.product.id, detail.quantity);
            await this.inventoryMovementsService.createAutoMovement(
                detail.product,
                user,
                'entry',
                detail.quantity,
                `Anulación - Factura ${invoice.invoiceNumber}`,
                'invoice_cancel',
                invoice.id,
            );
        }

        invoice.status = 'cancelled';
        return this.invoiceRepo.save(invoice);
    }

    async getTodaySales() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const result = await this.invoiceRepo
            .createQueryBuilder('invoice')
            .select('COUNT(invoice.id)', 'totalInvoices')
            .addSelect('COALESCE(SUM(invoice.total), 0)', 'totalSales')
            .where('invoice.createdAt >= :today', { today })
            .andWhere('invoice.status = :status', { status: 'completed' })
            .getRawOne();

        return {
            totalInvoices: parseInt(result.totalInvoices, 10),
            totalSales: parseFloat(result.totalSales),
        };
    }

    async getTopProducts(limit: number = 10) {
        return this.detailRepo
            .createQueryBuilder('detail')
            .select('detail.productName', 'productName')
            .addSelect('detail.product_id', 'productId')
            .addSelect('SUM(detail.quantity)', 'totalSold')
            .addSelect('SUM(detail.subtotal)', 'totalRevenue')
            .innerJoin('detail.invoice', 'invoice')
            .where('invoice.status = :status', { status: 'completed' })
            .groupBy('detail.product_id')
            .addGroupBy('detail.productName')
            .orderBy('SUM(detail.quantity)', 'DESC')
            .limit(limit)
            .getRawMany();
    }

    private async generateInvoiceNumber(): Promise<string> {
        const lastInvoice = await this.invoiceRepo
            .createQueryBuilder('invoice')
            .orderBy('invoice.id', 'DESC')
            .getOne();

        const nextNumber = lastInvoice ? lastInvoice.id + 1 : 1;
        return `FAC-${String(nextNumber).padStart(6, '0')}`;
    }
}
