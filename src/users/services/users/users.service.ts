import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from 'src/users/dtos/user.dto';
import { RolesService } from 'src/roles/services/roles.service';

@Injectable()
export class UsersService {

    users: User[] = [];
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        private rolesService: RolesService,
    ) { }

    async findAll() {
        return await this.userRepo.find({ relations: ['roles'] });
        // this.users = await this.userRepo.find();
        // return this.users;
    }

    async findOne(userId: number) {
        const user = await this.userRepo.findOne({ 
            where: { id: userId },
            relations: ['roles'] 
        });
        if (!user) {
            throw new NotFoundException(`User #${userId} not found`);
        }
        return user;
    }

    // createUser(payload: CreateUserDto){
    //     const newUser = this.userRepo.create(payload);
    //     return this.userRepo.save(newUser);
    // }

    async create(createUserDto: CreateUserDto) {
        const { roleIds, ...userData } = createUserDto;

        // Usamos el método findByIds de RolesService
        const roles = await this.rolesService.findByIds(roleIds);

        // Validamos que se hayan encontrado todos los roles solicitados
        if (roles.length !== roleIds.length) {
            throw new NotFoundException('Some roles were not found');
        }

        const newUser = this.userRepo.create({
            ...userData,
            roles, // Aquí se asigna el array de objetos Role a la relación ManyToMany
        });

        return this.userRepo.save(newUser);
    }

    async updateUser(id: number, updateUserDto: any) {
        const { roleIds, ...userData } = updateUserDto;

        // Buscamos el usuario primero (incluyendo sus roles actuales)
        const user = await this.userRepo.findOne({
            where: { id },
            relations: ['roles']
        });

        if (!user) throw new NotFoundException('User not found');

        // Si vienen nuevos roles, los actualizamos
        if (roleIds) {
            const roles = await this.rolesService.findByIds(roleIds);
            if (roles.length !== roleIds.length) {
                throw new NotFoundException('Some roles were not found');
            }
            user.roles = roles;
        }

        this.userRepo.merge(user, userData);
        return this.userRepo.save(user);
    }

    // async updateUser(id: number, payloadUpdated: UpdateUserDto) {
    //     const user = await this.userRepo.findOne({ where: { id } });
    //     if (!user) {
    //         throw new NotFoundException(`User #${id} not found`);
    //     }
    //     this.userRepo.merge(user, payloadUpdated);
    // }

    deleteUser(idUser: number) {
        return this.userRepo.delete(idUser);
    }
}
