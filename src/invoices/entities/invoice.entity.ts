import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InvoiceDetail } from './invoice-detail.entity';

@Entity()
export class Invoice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50, unique: true })
    invoiceNumber: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    customerName: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    customerDoc: string;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    subtotal: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    tax: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    total: number;

    @Column({ type: 'enum', enum: ['cash', 'card', 'transfer'], default: 'cash' })
    paymentMethod: string;

    @Column({ type: 'enum', enum: ['completed', 'cancelled'], default: 'completed' })
    status: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => InvoiceDetail, detail => detail.invoice, { cascade: true, eager: true })
    details: InvoiceDetail[];
}
