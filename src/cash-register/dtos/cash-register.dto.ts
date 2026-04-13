import { IsNumber, IsNotEmpty, IsOptional, IsString, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class OpenCashRegisterDto {
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @ApiProperty({ example: 100000, description: 'Monto inicial de apertura de caja' })
    readonly openingAmount: number;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: 'Apertura de caja turno mañana' })
    readonly notes?: string;
}

export class CloseCashRegisterDto {
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @ApiProperty({ example: 350000, description: 'Monto real en caja al cerrar' })
    readonly closingAmount: number;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: 'Cierre sin novedades' })
    readonly notes?: string;
}

export class CreateCashMovementDto {
    @IsEnum(['income', 'expense'])
    @IsNotEmpty()
    @ApiProperty({ example: 'expense', enum: ['income', 'expense'], description: 'Tipo: entrada o salida de efectivo' })
    readonly type: string;

    @IsNumber()
    @Min(0.01)
    @Type(() => Number)
    @ApiProperty({ example: 50000 })
    readonly amount: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Pago de domicilio proveedor' })
    readonly reason: string;
}
