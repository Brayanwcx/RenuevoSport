import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsNumber,
    IsInt,
    Min,
} from 'class-validator';
import { PartialType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Balón de fútbol Adidas Champions League' })
    readonly name: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: 'Balón oficial réplica de la Champions League' })
    readonly description?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'BAL-ADI-001' })
    readonly sku: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: '7702000000123' })
    readonly barcode?: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @ApiProperty({ example: 45000 })
    readonly purchasePrice: number;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @ApiProperty({ example: 89900 })
    readonly salePrice: number;

    @IsInt()
    @Min(0)
    @Type(() => Number)
    @ApiProperty({ example: 25 })
    readonly stock: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    @ApiPropertyOptional({ example: 5 })
    readonly minStock?: number;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: 'M' })
    readonly size?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: 'Blanco/Rojo' })
    readonly color?: string;

    @IsInt()
    @Type(() => Number)
    @ApiProperty({ example: 1, description: 'ID de la categoría' })
    readonly categoryId: number;

    @IsInt()
    @Type(() => Number)
    @ApiProperty({ example: 1, description: 'ID de la marca' })
    readonly brandId: number;

    @IsBoolean()
    @IsOptional()
    @ApiPropertyOptional({ default: true })
    readonly isActive?: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
