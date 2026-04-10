import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CashMovement } from './cash-movement.entity';

@Entity()
export class CashRegister {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'opened_by' })
    openedBy: User;

    @ManyToOne(() => User, { eager: true, nullable: true })
    @JoinColumn({ name: 'closed_by' })
    closedBy: User;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    openingAmount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    closingAmount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    expectedAmount: number;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    difference: number;

    @Column({ type: 'enum', enum: ['open', 'closed'], default: 'open' })
    status: string;

    @CreateDateColumn()
    openedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    closedAt: Date;

    @Column({ type: 'varchar', length: 500, nullable: true })
    notes: string;

    @OneToMany(() => CashMovement, movement => movement.cashRegister)
    movements: CashMovement[];
}
