import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateInventoryMovementDto {
    @IsInt()
    @Type(() => Number)
    @ApiProperty({ example: 1, description: 'ID del producto' })
    readonly productId: number;

    @IsEnum(['entry', 'exit', 'adjustment'])
    @IsNotEmpty()
    @ApiProperty({
        example: 'entry',
        enum: ['entry', 'exit', 'adjustment'],
        description: 'Tipo: entrada, salida o ajuste',
    })
    readonly type: string;

    @IsInt()
    @Min(1)
    @Type(() => Number)
    @ApiProperty({ example: 10, description: 'Cantidad (siempre positivo, el tipo define la dirección)' })
    readonly quantity: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Compra a proveedor Nike' })
    readonly reason: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: 'purchase' })
    readonly referenceType?: string;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    @ApiPropertyOptional({ example: 1 })
    readonly referenceId?: number;
}
