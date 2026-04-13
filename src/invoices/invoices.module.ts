import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceDetail } from './entities/invoice-detail.entity';
import { InvoicesService } from './services/invoices.service';
import { InvoicesController } from './controllers/invoices.controller';
import { ProductsModule } from '../products/products.module';
import { InventoryMovementsModule } from '../inventory-movements/inventory-movements.module';
import { CashRegisterModule } from '../cash-register/cash-register.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Invoice, InvoiceDetail]),
        ProductsModule,
        InventoryMovementsModule,
        CashRegisterModule,
    ],
    controllers: [InvoicesController],
    providers: [InvoicesService],
    exports: [InvoicesService],
})
export class InvoicesModule {}
