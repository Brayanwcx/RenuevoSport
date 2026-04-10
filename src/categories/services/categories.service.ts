import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from '../dtos/category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category) private categoryRepo: Repository<Category>,
    ) {}

    async findAll() {
        return this.categoryRepo.find({ order: { name: 'ASC' } });
    }

    async findOne(id: number) {
        const category = await this.categoryRepo.findOne({ where: { id } });
        if (!category) {
            throw new NotFoundException(`Category #${id} not found`);
        }
        return category;
    }

    async create(dto: CreateCategoryDto) {
        const existing = await this.categoryRepo.findOne({ where: { name: dto.name } });
        if (existing) {
            throw new BadRequestException(`Category "${dto.name}" already exists`);
        }
        const category = this.categoryRepo.create(dto);
        return this.categoryRepo.save(category);
    }

    async update(id: number, dto: UpdateCategoryDto) {
        const category = await this.findOne(id);
        if (dto.name && dto.name !== category.name) {
            const existing = await this.categoryRepo.findOne({ where: { name: dto.name } });
            if (existing) {
                throw new BadRequestException(`Category "${dto.name}" already exists`);
            }
        }
        this.categoryRepo.merge(category, dto);
        return this.categoryRepo.save(category);
    }

    async remove(id: number) {
        const category = await this.categoryRepo.findOne({
            where: { id },
            relations: ['products'],
        });
        if (!category) {
            throw new NotFoundException(`Category #${id} not found`);
        }
        if (category.products && category.products.length > 0) {
            throw new BadRequestException(
                `No se puede eliminar: hay ${category.products.length} producto(s) en esta categoría.`,
            );
        }
        return this.categoryRepo.remove(category);
    }
}
