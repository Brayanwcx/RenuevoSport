import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryMovement } from '../entities/inventory-movement.entity';
import { CreateInventoryMovementDto } from '../dtos/inventory-movement.dto';
import { ProductsService } from '../../products/services/products.service';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Injectable()
export class InventoryMovementsService {
    constructor(
        @InjectRepository(InventoryMovement)
        private movementRepo: Repository<InventoryMovement>,
        private productsService: ProductsService,
    ) {}

    async findAll() {
        return this.movementRepo.find({
            relations: ['product', 'user'],
            order: { createdAt: 'DESC' },
            take: 100,
        });
    }

    async findByProduct(productId: number) {
        return this.movementRepo.find({
            where: { product: { id: productId } },
            relations: ['product', 'user'],
            order: { createdAt: 'DESC' },
        });
    }

    async create(dto: CreateInventoryMovementDto, user: User) {
        const product = await this.productsService.findOne(dto.productId);
        const previousStock = Number(product.stock);

        let quantityChange: number;
        if (dto.type === 'entry') {
            quantityChange = dto.quantity;
        } else if (dto.type === 'exit') {
            quantityChange = -dto.quantity;
            if (previousStock + quantityChange < 0) {
                throw new BadRequestException(
                    `Stock insuficiente para "${product.name}". Disponible: ${previousStock}`,
                );
            }
        } else {
            // adjustment: la cantidad puede ser positiva (agregar) o se usa tal cual
            quantityChange = dto.quantity;
        }

        // Actualizar stock del producto
        await this.productsService.updateStock(product.id, quantityChange);
        const newStock = previousStock + quantityChange;

        // Registrar movimiento
        const movement = this.movementRepo.create({
            product,
            user,
            type: dto.type,
            quantity: dto.quantity,
            previousStock,
            newStock,
            reason: dto.reason,
            referenceType: dto.referenceType,
            referenceId: dto.referenceId,
        });
        return this.movementRepo.save(movement);
    }

    // Método interno para registrar movimientos automáticos (desde facturas)
    async createAutoMovement(
        product: Product,
        user: User,
        type: string,
        quantity: number,
        reason: string,
        referenceType?: string,
        referenceId?: number,
    ) {
        const previousStock = Number(product.stock);
        const quantityChange = type === 'exit' ? -quantity : quantity;
        const newStock = previousStock + quantityChange;

        const movement = this.movementRepo.create({
            product,
            user,
            type,
            quantity,
            previousStock,
            newStock,
            reason,
            referenceType,
            referenceId,
        });
        return this.movementRepo.save(movement);
    }
}
