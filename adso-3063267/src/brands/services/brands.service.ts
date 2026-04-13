import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { CreateBrandDto, UpdateBrandDto } from '../dtos/brand.dto';

@Injectable()
export class BrandsService {
    constructor(
        @InjectRepository(Brand) private brandRepo: Repository<Brand>,
    ) {}

    async findAll() {
        return this.brandRepo.find({ order: { name: 'ASC' } });
    }

    async findOne(id: number) {
        const brand = await this.brandRepo.findOne({ where: { id } });
        if (!brand) {
            throw new NotFoundException(`Brand #${id} not found`);
        }
        return brand;
    }

    async create(dto: CreateBrandDto) {
        const existing = await this.brandRepo.findOne({ where: { name: dto.name } });
        if (existing) {
            throw new BadRequestException(`Brand "${dto.name}" already exists`);
        }
        const brand = this.brandRepo.create(dto);
        return this.brandRepo.save(brand);
    }

    async update(id: number, dto: UpdateBrandDto) {
        const brand = await this.findOne(id);
        if (dto.name && dto.name !== brand.name) {
            const existing = await this.brandRepo.findOne({ where: { name: dto.name } });
            if (existing) {
                throw new BadRequestException(`Brand "${dto.name}" already exists`);
            }
        }
        this.brandRepo.merge(brand, dto);
        return this.brandRepo.save(brand);
    }

    async remove(id: number) {
        const brand = await this.brandRepo.findOne({
            where: { id },
            relations: ['products'],
        });
        if (!brand) {
            throw new NotFoundException(`Brand #${id} not found`);
        }
        if (brand.products && brand.products.length > 0) {
            throw new BadRequestException(
                `No se puede eliminar: hay ${brand.products.length} producto(s) con esta marca.`,
            );
        }
        return this.brandRepo.remove(brand);
    }
}
