import {
    Controller,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { ModulesGuard } from '../../auth/guards/modules.guard.guard';
import { Modules } from '../../auth/decorators/modules.decorator';

@ApiBearerAuth()
@Modules('dashboard')
@UseGuards(JwtAuthGuard, ModulesGuard)
@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('stats')
    @ApiOperation({ summary: 'Obtener estadísticas generales (ventas del día, inventario, caja)' })
    getStats() {
        return this.dashboardService.getStats();
    }

    @Get('top-products')
    @ApiOperation({ summary: 'Obtener los productos más vendidos' })
    getTopProducts() {
        return this.dashboardService.getTopProducts();
    }

    @Get('recent-invoices')
    @ApiOperation({ summary: 'Obtener las últimas facturas' })
    getRecentInvoices() {
        return this.dashboardService.getRecentInvoices();
    }

    @Get('low-stock')
    @ApiOperation({ summary: 'Obtener productos con stock bajo' })
    getLowStockProducts() {
        return this.dashboardService.getLowStockProducts();
    }

    @Get('sales-report')
    @ApiOperation({ summary: 'Reporte de ventas por rango de fechas' })
    @ApiQuery({ name: 'startDate', required: true, example: '2026-01-01' })
    @ApiQuery({ name: 'endDate', required: true, example: '2026-12-31' })
    getSalesReport(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.dashboardService.getSalesByDateRange(
            new Date(startDate),
            new Date(endDate),
        );
    }
}
