/**
 * Script para crear el usuario administrador inicial + roles + módulos.
 * Ejecutar con: npm run seed:admin
 */
import { AppDataSource } from '../database/data-source';
import { ModuleEntity } from '../modules/entities/module.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

const SYSTEM_MODULES = [
    { name: 'users', description: 'Gestión de usuarios del sistema' },
    { name: 'roles', description: 'Gestión de roles y permisos' },
    { name: 'modules', description: 'Gestión de módulos del sistema' },
    { name: 'categories', description: 'Gestión de categorías de productos' },
    { name: 'brands', description: 'Gestión de marcas deportivas' },
    { name: 'products', description: 'Gestión de productos e inventario' },
    { name: 'invoices', description: 'Facturación y ventas' },
    { name: 'cash-register', description: 'Caja registradora' },
    { name: 'inventory-movements', description: 'Movimientos de inventario' },
    { name: 'dashboard', description: 'Panel de estadísticas y reportes' },
];

const CAJERO_MODULES = ['products', 'invoices', 'cash-register', 'dashboard'];

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log('📦 Conexión a la base de datos establecida\n');

        const moduleRepo = AppDataSource.getRepository(ModuleEntity);
        const roleRepo = AppDataSource.getRepository(Role);
        const userRepo = AppDataSource.getRepository(User);

        // 1. Crear módulos
        console.log('--- Creando módulos ---');
        const allModules: ModuleEntity[] = [];
        for (const mod of SYSTEM_MODULES) {
            let existing = await moduleRepo.findOne({ where: { name: mod.name } });
            if (!existing) {
                existing = await moduleRepo.save(moduleRepo.create(mod));
                console.log(`  ✅ Módulo "${mod.name}" creado`);
            } else {
                console.log(`  ⏭️  Módulo "${mod.name}" ya existe`);
            }
            allModules.push(existing);
        }

        // 2. Crear rol Administrador
        console.log('\n--- Creando roles ---');
        let adminRole = await roleRepo.findOne({ where: { name: 'Administrador' } });
        if (!adminRole) {
            adminRole = roleRepo.create({
                name: 'Administrador',
                description: 'Acceso total a todos los módulos del sistema',
                modules: allModules,
            });
            adminRole = await roleRepo.save(adminRole);
            console.log('  ✅ Rol "Administrador" creado con todos los módulos');
        } else {
            console.log('  ⏭️  Rol "Administrador" ya existe');
        }

        // 3. Crear rol Cajero
        const cajeroModules = allModules.filter(m => CAJERO_MODULES.includes(m.name));
        let cajeroRole = await roleRepo.findOne({ where: { name: 'Cajero' } });
        if (!cajeroRole) {
            cajeroRole = roleRepo.create({
                name: 'Cajero',
                description: 'Acceso a facturación, productos, caja y dashboard',
                modules: cajeroModules,
            });
            cajeroRole = await roleRepo.save(cajeroRole);
            console.log(`  ✅ Rol "Cajero" creado con módulos: ${CAJERO_MODULES.join(', ')}`);
        } else {
            console.log('  ⏭️  Rol "Cajero" ya existe');
        }

        // 4. Crear usuario administrador
        console.log('\n--- Creando usuario administrador ---');
        const adminEmail = 'admin@tienda.com';
        let adminUser = await userRepo.findOne({ where: { email: adminEmail } });
        if (!adminUser) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            adminUser = userRepo.create({
                name: 'Admin',
                lastName: 'Sistema',
                docType: 'CC',
                docNumber: '0000000000',
                email: adminEmail,
                password: hashedPassword,
                isActive: true,
                roles: [adminRole],
            });
            adminUser = await userRepo.save(adminUser);
            console.log('  ✅ Usuario administrador creado:');
            console.log(`     📧 Email: ${adminEmail}`);
            console.log('     🔑 Password: admin123');
        } else {
            console.log('  ⏭️  Usuario administrador ya existe');
        }

        console.log('\n🎉 Seed completado exitosamente');
        console.log('\n📋 Resumen:');
        console.log(`   - ${SYSTEM_MODULES.length} módulos del sistema`);
        console.log('   - 2 roles: Administrador, Cajero');
        console.log(`   - 1 usuario admin: ${adminEmail} / admin123`);

        await AppDataSource.destroy();
    } catch (error) {
        console.error('❌ Error ejecutando seed:', error);
        process.exit(1);
    }
}

seed();
