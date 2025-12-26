import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LabService } from './lab.service';
import { LabController } from './lab.controller';
import { LabExportService } from './services/lab-export.service';

@Module({
  imports: [PrismaModule],
  controllers: [LabController],
  providers: [LabService, LabExportService],
  exports: [LabService, LabExportService],
})
export class LabModule { }
