import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { CashRegister } from './cash-register.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class CashMovement {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => CashRegister, cashRegister => cashRegister.movements)
    @JoinColumn({ name: 'cash_register_id' })
    cashRegister: CashRegister;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'enum', enum: ['income', 'expense'] })
    type: string;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column({ type: 'varchar', length: 500 })
    reason: string;

    @CreateDateColumn()
    createdAt: Date;
}
