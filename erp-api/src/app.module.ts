import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Configuration
import { ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { validate } from './config/env.validation';

// Core Modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { MarkasModule } from './markas/markas.module';
import { ToysModule } from './toys/toys.module';
import { LabModule } from './lab/lab.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { DocumentsModule } from './documents/documents.module';
import { AdminModule } from './admin/admin.module';
import { ScaleModule } from './scale/scale.module';
import { RedisModule } from './common/redis/redis.module';
import { GodexService } from './printing/godex.service';
import { PrintingController } from './printing/printing.controller';

// Guards and Interceptors
import { JwtGuard } from './common/guards/jwt.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    // Global Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
      validate,
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      useFactory: () => [{
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
      }],
    }),

    // Queue Management
    // BullModule.forRootAsync({
    //   useFactory: () => ({
    //     connection: {
    //       host: process.env.REDIS_HOST || 'localhost',
    //       port: parseInt(process.env.REDIS_PORT || '6379', 10),
    //       password: process.env.REDIS_PASSWORD,
    //     },
    //   }),
    // }),

    // JWT Module for Global Guards
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>('JWT_SECRET')!,
        signOptions: {
          expiresIn: '24h'
        },
      }),
      inject: [ConfigService],
    }),

    // Core Business Modules
    PrismaModule,
    AuthModule,
    UsersModule,
    CustomersModule,
    MarkasModule,
    ToysModule,
    LabModule,
    WarehouseModule,
    DocumentsModule,
    AdminModule,
    ScaleModule,
    RedisModule,
    ReportsModule,
  ],
  controllers: [AppController, PrintingController],
  providers: [
    AppService,
    GodexService,

    // Global Guards - JWT Authentication first
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Global Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
  ],
})
export class AppModule { }
