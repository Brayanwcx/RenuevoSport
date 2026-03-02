import { Role } from 'src/roles/entities/role.entity';
import { 
    Column, 
    Entity, 
    JoinTable, 
    ManyToMany, 
    PrimaryGeneratedColumn, 
} from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name;

    @Column({ type: 'varchar', length: 255 })
    lastName;

    @Column({ type: 'varchar', length: 255 })
    docType;

    @Column({ type: 'varchar', length: 255 })
    docNumber;

    @Column({ type: 'varchar', length: 55 })
    miTest;

    @Column({ type: 'varchar', length: 255 })
    miTest2;

    @ManyToMany(() => Role, role => role.users)
    @JoinTable({
        name: 'user_roles'
    })
    roles: Role[];
}
