import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors();

  // Validación global
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Configuración Swagger
  const config = new DocumentBuilder()
    .setTitle('Tienda Deportiva API')
    .setDescription('API para gestión de inventario, facturación y caja de tienda deportiva')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Autenticación y login')
    .addTag('Users', 'Gestión de usuarios')
    .addTag('Roles', 'Gestión de roles')
    .addTag('Modules', 'Módulos del sistema')
    .addTag('Categories', 'Categorías de productos')
    .addTag('Brands', 'Marcas deportivas')
    .addTag('Products', 'Productos e inventario')
    .addTag('Invoices', 'Facturación y ventas')
    .addTag('Cash Register', 'Caja registradora')
    .addTag('Inventory Movements', 'Movimientos de inventario')
    .addTag('Dashboard', 'Estadísticas y reportes')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
