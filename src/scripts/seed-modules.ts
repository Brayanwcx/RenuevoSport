/**
 * Script para insertar los módulos del sistema en la base de datos.
 * Ejecutar con: npx ts-node -r tsconfig-paths/register src/scripts/seed-modules.ts
 *
 * Estos módulos se asignan a los roles para controlar el acceso a cada sección.
 */
import { AppDataSource } from '../database/data-source';
import { ModuleEntity } from '../modules/entities/module.entity';

const SYSTEM_MODULES = [
    { name: 'users', description: 'Gestión de usuarios del sistema' },
    { name: 'roles', description: 'Gestión de roles y permisos' },
    { name: 'modules', description: 'Gestión de módulos del sistema' },
    { name: 'categories', description: 'Gestión de categorías de productos' },
    { name: 'brands', description: 'Gestión de marcas deportivas' },
    { name: 'products', description: 'Gestión de productos e inventario' },
    { name: 'invoices', description: 'Facturación y ventas' },
    { name: 'cash-register', description: 'Caja registradora - apertura, cierre y movimientos' },
    { name: 'inventory-movements', description: 'Movimientos de inventario - entradas, salidas, ajustes' },
    { name: 'dashboard', description: 'Panel de estadísticas y reportes' },
];

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log('📦 Conexión a la base de datos establecida');

        const moduleRepo = AppDataSource.getRepository(ModuleEntity);

        for (const mod of SYSTEM_MODULES) {
            const existing = await moduleRepo.findOne({ where: { name: mod.name } });
            if (!existing) {
                await moduleRepo.save(moduleRepo.create(mod));
                console.log(`  ✅ Módulo "${mod.name}" creado`);
            } else {
                console.log(`  ⏭️  Módulo "${mod.name}" ya existe`);
            }
        }

        console.log('\n🎉 Seed de módulos completado exitosamente');
        await AppDataSource.destroy();
    } catch (error) {
        console.error('❌ Error ejecutando seed:', error);
        process.exit(1);
    }
}

seed();
