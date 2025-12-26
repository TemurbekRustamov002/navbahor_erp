import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MarkasService } from './markas.service';
import { MarkasController } from './markas.controller';
import { MarkaNumberingService } from './services/marka-numbering.service';
import { MarkaExportService } from './services/marka-export.service';

@Module({
  imports: [PrismaModule],
  controllers: [MarkasController],
  providers: [MarkasService, MarkaNumberingService, MarkaExportService],
  exports: [MarkasService, MarkaNumberingService, MarkaExportService],
})
export class MarkasModule {}
