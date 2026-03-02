import { User } from 'src/users/entities/user.entity';
import { 
    Column, 
    Entity, 
    ManyToMany, 
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    name;

    @Column({ type: 'varchar', length: 255 })
    description;

    @ManyToMany(() => User, user => user.roles)
    users: User[];
}
