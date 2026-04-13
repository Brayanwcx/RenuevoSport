import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    ParseIntPipe,
    HttpCode,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BrandsService } from '../services/brands.service';
import { CreateBrandDto, UpdateBrandDto } from '../dtos/brand.dto';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { ModulesGuard } from '../../auth/guards/modules.guard.guard';
import { Modules } from '../../auth/decorators/modules.decorator';

@ApiBearerAuth()
@Modules('brands')
@UseGuards(JwtAuthGuard, ModulesGuard)
@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
    constructor(private readonly brandsService: BrandsService) {}

    @Post()
    @ApiOperation({ summary: 'Crear una marca' })
    create(@Body() dto: CreateBrandDto) {
        return this.brandsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las marcas' })
    findAll() {
        return this.brandsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una marca por ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.brandsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una marca' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBrandDto) {
        return this.brandsService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({ summary: 'Eliminar una marca' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.brandsService.remove(id);
    }
}
