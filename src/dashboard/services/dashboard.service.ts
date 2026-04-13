import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { InvoiceDetail } from '../../invoices/entities/invoice-detail.entity';
import { CashRegister } from '../../cash-register/entities/cash-register.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Product) private productRepo: Repository<Product>,
        @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
        @InjectRepository(InvoiceDetail) private detailRepo: Repository<InvoiceDetail>,
        @InjectRepository(CashRegister) private cashRegisterRepo: Repository<CashRegister>,
    ) {}

    async getStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Ventas del día
        const todaySales = await this.invoiceRepo
            .createQueryBuilder('invoice')
            .select('COUNT(invoice.id)', 'totalInvoices')
            .addSelect('COALESCE(SUM(invoice.total), 0)', 'totalSales')
            .where('invoice.createdAt >= :today', { today })
            .andWhere('invoice.status = :status', { status: 'completed' })
            .getRawOne();

        // Total de productos
        const totalProducts = await this.productRepo.count({ where: { isActive: true } });

        // Productos con stock bajo
        const lowStockCount = await this.productRepo
            .createQueryBuilder('product')
            .where('product.stock <= product.minStock')
            .andWhere('product.isActive = :active', { active: true })
            .getCount();

        // Productos sin stock
        const outOfStockCount = await this.productRepo
            .createQueryBuilder('product')
            .where('product.stock = 0')
            .andWhere('product.isActive = :active', { active: true })
            .getCount();

        // Valor total del inventario (a precio de venta)
        const inventoryValue = await this.productRepo
            .createQueryBuilder('product')
            .select('COALESCE(SUM(product.salePrice * product.stock), 0)', 'totalValue')
            .where('product.isActive = :active', { active: true })
            .getRawOne();

        // Caja actual
        const currentCashRegister = await this.cashRegisterRepo.findOne({
            where: { status: 'open' },
        });

        return {
            todaySales: {
                totalInvoices: parseInt(todaySales.totalInvoices, 10),
                totalAmount: parseFloat(todaySales.totalSales),
            },
            inventory: {
                totalProducts,
                lowStockCount,
                outOfStockCount,
                totalValue: parseFloat(inventoryValue.totalValue),
            },
            cashRegister: {
                isOpen: !!currentCashRegister,
                id: currentCashRegister?.id || null,
                openingAmount: currentCashRegister ? Number(currentCashRegister.openingAmount) : null,
            },
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

    async getRecentInvoices(limit: number = 10) {
        return this.invoiceRepo.find({
            relations: ['user', 'details'],
            where: { status: 'completed' },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    async getLowStockProducts() {
        return this.productRepo
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.brand', 'brand')
            .where('product.stock <= product.minStock')
            .andWhere('product.isActive = :active', { active: true })
            .orderBy('product.stock', 'ASC')
            .getMany();
    }

    async getSalesByDateRange(startDate: Date, endDate: Date) {
        return this.invoiceRepo
            .createQueryBuilder('invoice')
            .select('DATE(invoice.createdAt)', 'date')
            .addSelect('COUNT(invoice.id)', 'totalInvoices')
            .addSelect('COALESCE(SUM(invoice.total), 0)', 'totalSales')
            .where('invoice.createdAt >= :startDate', { startDate })
            .andWhere('invoice.createdAt <= :endDate', { endDate })
            .andWhere('invoice.status = :status', { status: 'completed' })
            .groupBy('DATE(invoice.createdAt)')
            .orderBy('DATE(invoice.createdAt)', 'ASC')
            .getRawMany();
    }
}
