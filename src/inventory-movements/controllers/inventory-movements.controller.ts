import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    ParseIntPipe,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryMovementsService } from '../services/inventory-movements.service';
import { CreateInventoryMovementDto } from '../dtos/inventory-movement.dto';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { ModulesGuard } from '../../auth/guards/modules.guard.guard';
import { Modules } from '../../auth/decorators/modules.decorator';

@ApiBearerAuth()
@Modules('inventory-movements')
@UseGuards(JwtAuthGuard, ModulesGuard)
@ApiTags('Inventory Movements')
@Controller('inventory-movements')
export class InventoryMovementsController {
    constructor(private readonly movementsService: InventoryMovementsService) {}

    @Post()
    @ApiOperation({ summary: 'Registrar movimiento de inventario manual' })
    create(@Body() dto: CreateInventoryMovementDto, @Req() req: any) {
        return this.movementsService.create(dto, req.user);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los movimientos de inventario' })
    findAll() {
        return this.movementsService.findAll();
    }

    @Get('product/:productId')
    @ApiOperation({ summary: 'Obtener movimientos de un producto específico' })
    findByProduct(@Param('productId', ParseIntPipe) productId: number) {
        return this.movementsService.findByProduct(productId);
    }
}
