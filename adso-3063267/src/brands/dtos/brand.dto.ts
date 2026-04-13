import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { PartialType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrandDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Nike' })
    readonly name: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: 'https://example.com/nike-logo.png' })
    readonly logoUrl?: string;

    @IsBoolean()
    @IsOptional()
    @ApiPropertyOptional({ default: true })
    readonly isActive?: boolean;
}

export class UpdateBrandDto extends PartialType(CreateBrandDto) {}
