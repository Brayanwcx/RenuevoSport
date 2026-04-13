import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Brand } from '../../brands/entities/brand.entity';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    sku: string;

    @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
    barcode: string;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    purchasePrice: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    salePrice: number;

    @Column({ type: 'int', default: 0 })
    stock: number;

    @Column({ type: 'int', default: 5 })
    minStock: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    size: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    color: string;

    @ManyToOne(() => Category, category => category.products, { eager: true })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @ManyToOne(() => Brand, brand => brand.products, { eager: true })
    @JoinColumn({ name: 'brand_id' })
    brand: Brand;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
