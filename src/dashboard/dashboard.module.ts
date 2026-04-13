import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './services/dashboard.service';
import { DashboardController } from './controllers/dashboard.controller';
import { Product } from '../products/entities/product.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoiceDetail } from '../invoices/entities/invoice-detail.entity';
import { CashRegister } from '../cash-register/entities/cash-register.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Product, Invoice, InvoiceDetail, CashRegister]),
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule {}
