import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomersExportService } from './services/customers-export.service';

@Module({
  imports: [PrismaModule],
  providers: [CustomersService, CustomersExportService],
  controllers: [CustomersController],
  exports: [CustomersService, CustomersExportService],
})
export class CustomersModule { }
