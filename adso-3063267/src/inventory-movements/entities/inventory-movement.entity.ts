import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class InventoryMovement {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Product, { eager: true })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'enum', enum: ['entry', 'exit', 'adjustment'] })
    type: string;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'int' })
    previousStock: number;

    @Column({ type: 'int' })
    newStock: number;

    @Column({ type: 'varchar', length: 500 })
    reason: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    referenceType: string;

    @Column({ type: 'int', nullable: true })
    referenceId: number;

    @CreateDateColumn()
    createdAt: Date;
}
