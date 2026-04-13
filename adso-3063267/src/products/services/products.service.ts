import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto, UpdateProductDto } from '../dtos/product.dto';
import { CategoriesService } from '../../categories/services/categories.service';
import { BrandsService } from '../../brands/services/brands.service';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product) private productRepo: Repository<Product>,
        private categoriesService: CategoriesService,
        private brandsService: BrandsService,
    ) {}

    async findAll() {
        return this.productRepo.find({
            relations: ['category', 'brand'],
            order: { name: 'ASC' },
        });
    }

    async findOne(id: number) {
        const product = await this.productRepo.findOne({
            where: { id },
            relations: ['category', 'brand'],
        });
        if (!product) {
            throw new NotFoundException(`Product #${id} not found`);
        }
        return product;
    }

    async findByBarcode(barcode: string) {
        const product = await this.productRepo.findOne({
            where: { barcode },
            relations: ['category', 'brand'],
        });
        if (!product) {
            throw new NotFoundException(`Product with barcode "${barcode}" not found`);
        }
        return product;
    }

    async search(query: string) {
        return this.productRepo.find({
            where: [
                { name: Like(`%${query}%`) },
                { sku: Like(`%${query}%`) },
                { barcode: Like(`%${query}%`) },
            ],
            relations: ['category', 'brand'],
        });
    }

    async findLowStock() {
        return this.productRepo
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.brand', 'brand')
            .where('product.stock <= product.minStock')
            .andWhere('product.isActive = :active', { active: true })
            .orderBy('product.stock', 'ASC')
            .getMany();
    }

    async create(dto: CreateProductDto) {
        const { categoryId, brandId, ...productData } = dto;

        // Verificar SKU único
        const existingSku = await this.productRepo.findOne({ where: { sku: dto.sku } });
        if (existingSku) {
            throw new BadRequestException(`SKU "${dto.sku}" already exists`);
        }

        // Verificar barcode único si viene
        if (dto.barcode) {
            const existingBarcode = await this.productRepo.findOne({ where: { barcode: dto.barcode } });
            if (existingBarcode) {
                throw new BadRequestException(`Barcode "${dto.barcode}" already exists`);
            }
        }

        const category = await this.categoriesService.findOne(categoryId);
        const brand = await this.brandsService.findOne(brandId);

        const product = this.productRepo.create({
            ...productData,
            category,
            brand,
        });
        return this.productRepo.save(product);
    }

    async update(id: number, dto: UpdateProductDto) {
        const product = await this.findOne(id);
        const { categoryId, brandId, ...productData } = dto;

        if (dto.sku && dto.sku !== product.sku) {
            const existingSku = await this.productRepo.findOne({ where: { sku: dto.sku } });
            if (existingSku) {
                throw new BadRequestException(`SKU "${dto.sku}" already exists`);
            }
        }

        if (dto.barcode && dto.barcode !== product.barcode) {
            const existingBarcode = await this.productRepo.findOne({ where: { barcode: dto.barcode } });
            if (existingBarcode) {
                throw new BadRequestException(`Barcode "${dto.barcode}" already exists`);
            }
        }

        if (categoryId) {
            product.category = await this.categoriesService.findOne(categoryId);
        }
        if (brandId) {
            product.brand = await this.brandsService.findOne(brandId);
        }

        this.productRepo.merge(product, productData);
        return this.productRepo.save(product);
    }

    async updateStock(id: number, quantity: number) {
        const product = await this.findOne(id);
        product.stock = product.stock + quantity;
        if (product.stock < 0) {
            throw new BadRequestException(
                `Stock insuficiente para "${product.name}". Disponible: ${product.stock - quantity}`,
            );
        }
        return this.productRepo.save(product);
    }

    async remove(id: number) {
        const product = await this.findOne(id);
        return this.productRepo.remove(product);
    }
}
