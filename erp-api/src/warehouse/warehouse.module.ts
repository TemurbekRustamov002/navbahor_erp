import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WarehouseController } from './warehouse.controller';
import { OrdersService } from './orders.service';
import { ChecklistsService } from './checklists.service';
import { WarehouseExportService } from './services/warehouse-export.service';

@Module({
  imports: [PrismaModule],
  controllers: [WarehouseController],
  providers: [OrdersService, ChecklistsService, WarehouseExportService],
  exports: [OrdersService, ChecklistsService, WarehouseExportService],
})
export class WarehouseModule { }
