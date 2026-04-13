import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    ParseIntPipe,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from '../services/invoices.service';
import { CreateInvoiceDto } from '../dtos/invoice.dto';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { ModulesGuard } from '../../auth/guards/modules.guard.guard';
import { Modules } from '../../auth/decorators/modules.decorator';

@ApiBearerAuth()
@Modules('invoices')
@UseGuards(JwtAuthGuard, ModulesGuard)
@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) {}

    @Post()
    @ApiOperation({ summary: 'Crear una factura (vender)' })
    create(@Body() dto: CreateInvoiceDto, @Req() req: any) {
        return this.invoicesService.create(dto, req.user);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las facturas' })
    findAll() {
        return this.invoicesService.findAll();
    }

    @Get('recent')
    @ApiOperation({ summary: 'Obtener las últimas 10 facturas' })
    findRecent() {
        return this.invoicesService.findRecent();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una factura por ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.invoicesService.findOne(id);
    }

    @Patch(':id/cancel')
    @ApiOperation({ summary: 'Anular una factura (devuelve stock)' })
    cancel(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.invoicesService.cancel(id, req.user);
    }
}
