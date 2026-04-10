import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { BrandsService } from './services/brands.service';
import { BrandsController } from './controllers/brands.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Brand])],
    controllers: [BrandsController],
    providers: [BrandsService],
    exports: [BrandsService],
})
export class BrandsModule {}
