import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsEnum,
    IsArray,
    ArrayNotEmpty,
    ValidateNested,
    IsInt,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class InvoiceDetailDto {
    @IsInt()
    @Type(() => Number)
    @ApiProperty({ example: 1, description: 'ID del producto' })
    readonly productId: number;

    @IsInt()
    @Min(1)
    @Type(() => Number)
    @ApiProperty({ example: 2, description: 'Cantidad' })
    readonly quantity: number;
}

export class CreateInvoiceDto {
    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: 'Juan Pérez', description: 'Nombre del comprador (opcional)' })
    readonly customerName?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: '1234567890', description: 'Documento del comprador (opcional)' })
    readonly customerDoc?: string;

    @IsEnum(['cash', 'card', 'transfer'])
    @IsNotEmpty()
    @ApiProperty({ example: 'cash', enum: ['cash', 'card', 'transfer'] })
    readonly paymentMethod: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: 'Cliente frecuente' })
    readonly notes?: string;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => InvoiceDetailDto)
    @ApiProperty({
        type: [InvoiceDetailDto],
        description: 'Lista de productos con cantidades',
        example: [
            { productId: 1, quantity: 2 },
            { productId: 3, quantity: 1 },
        ],
    })
    readonly details: InvoiceDetailDto[];
}
