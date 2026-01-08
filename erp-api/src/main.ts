import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Global configuration
  app.setGlobalPrefix('api/v1');

  // CORS configuration for Production Security
  const allowedOrigins = [
    'https://erp.bhr.uz',
    'http://localhost:3100',
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Temporarily allow all for debugging if needed, or stick to list
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'idempotency-key'],
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('ERP System API')
    .setDescription('Professional Cotton Factory ERP System Backend API')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT token kiriting',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('auth', 'Authentication & Authorization')
    .addTag('users', 'User Management')
    .addTag('customers', 'Customer Management')
    .addTag('markas', 'Marka (Production Batches)')
    .addTag('toys', 'Toys (Cotton Bales)')
    .addTag('lab', 'Laboratory Management')
    .addTag('warehouse', 'Warehouse & Orders')
    .addTag('admin', 'Admin Operations')
    .addTag('scale', 'Scale Integration')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
    },
  });

  // main.ts
  const port = configService.get<number>('PORT') || 8080;
  await app.listen(port, '0.0.0.0'); // 0.0.0.0 — bu Docker tashqaridan so'rov qabul qilishi uchun shart!

  logger.log(`🚀 ERP API Server running on port ${port}`);
  logger.log(`🌍 Environment: ${configService.get<string>('NODE_ENV')}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`🔗 API Base URL: http://localhost:${port}/api/v1`);
}

bootstrap().catch((error) => {
  Logger.error('❌ Error starting server', error, 'Bootstrap');
  process.exit(1);
});
