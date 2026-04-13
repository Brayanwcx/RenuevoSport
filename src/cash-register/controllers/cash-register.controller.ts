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
import { CashRegisterService } from '../services/cash-register.service';
import {
    OpenCashRegisterDto,
    CloseCashRegisterDto,
    CreateCashMovementDto,
} from '../dtos/cash-register.dto';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { ModulesGuard } from '../../auth/guards/modules.guard.guard';
import { Modules } from '../../auth/decorators/modules.decorator';

@ApiBearerAuth()
@Modules('cash-register')
@UseGuards(JwtAuthGuard, ModulesGuard)
@ApiTags('Cash Register')
@Controller('cash-register')
export class CashRegisterController {
    constructor(private readonly cashRegisterService: CashRegisterService) {}

    @Post('open')
    @ApiOperation({ summary: 'Abrir caja registradora' })
    open(@Body() dto: OpenCashRegisterDto, @Req() req: any) {
        return this.cashRegisterService.open(dto, req.user);
    }

    @Post('close')
    @ApiOperation({ summary: 'Cerrar caja registradora' })
    close(@Body() dto: CloseCashRegisterDto, @Req() req: any) {
        return this.cashRegisterService.close(dto, req.user);
    }

    @Post('movement')
    @ApiOperation({ summary: 'Registrar movimiento de efectivo (entrada/salida)' })
    addMovement(@Body() dto: CreateCashMovementDto, @Req() req: any) {
        return this.cashRegisterService.addMovement(dto, req.user);
    }

    @Get('current')
    @ApiOperation({ summary: 'Obtener la caja abierta actualmente' })
    findCurrent() {
        return this.cashRegisterService.findCurrentOpen();
    }

    @Get()
    @ApiOperation({ summary: 'Obtener historial de cajas' })
    findAll() {
        return this.cashRegisterService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalle de una caja por ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.cashRegisterService.findOne(id);
    }
}
