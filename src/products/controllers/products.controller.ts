import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    ParseIntPipe,
    HttpCode,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from '../services/products.service';
import { CreateProductDto, UpdateProductDto } from '../dtos/product.dto';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { ModulesGuard } from '../../auth/guards/modules.guard.guard';
import { Modules } from '../../auth/decorators/modules.decorator';

@ApiBearerAuth()
@Modules('products')
@UseGuards(JwtAuthGuard, ModulesGuard)
@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @ApiOperation({ summary: 'Crear un producto' })
    create(@Body() dto: CreateProductDto) {
        return this.productsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los productos' })
    findAll() {
        return this.productsService.findAll();
    }

    @Get('low-stock')
    @ApiOperation({ summary: 'Obtener productos con stock bajo' })
    findLowStock() {
        return this.productsService.findLowStock();
    }

    @Get('search')
    @ApiOperation({ summary: 'Buscar productos por nombre, SKU o código de barras' })
    @ApiQuery({ name: 'q', required: true, description: 'Término de búsqueda' })
    search(@Query('q') query: string) {
        return this.productsService.search(query);
    }

    @Get('barcode/:barcode')
    @ApiOperation({ summary: 'Buscar producto por código de barras' })
    findByBarcode(@Param('barcode') barcode: string) {
        return this.productsService.findByBarcode(barcode);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un producto por ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un producto' })
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
        return this.productsService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({ summary: 'Eliminar un producto' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.remove(id);
    }
}
