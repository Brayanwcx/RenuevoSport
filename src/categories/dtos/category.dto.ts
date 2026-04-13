import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { PartialType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Calzado Deportivo' })
    readonly name: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: 'Zapatos y zapatillas para deporte' })
    readonly description?: string;

    @IsBoolean()
    @IsOptional()
    @ApiPropertyOptional({ default: true })
    readonly isActive?: boolean;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
