import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { InventoryMovementsService } from './services/inventory-movements.service';
import { InventoryMovementsController } from './controllers/inventory-movements.controller';
import { ProductsModule } from '../products/products.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([InventoryMovement]),
        ProductsModule,
    ],
    controllers: [InventoryMovementsController],
    providers: [InventoryMovementsService],
    exports: [InventoryMovementsService],
})
export class InventoryMovementsModule {}
