import { Module } from '@nestjs/common';
import { ScaleController } from './scale.controller';
import { ScaleService } from './scale.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ScaleGateway } from './scale.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [ScaleController],
  providers: [ScaleService, ScaleGateway],
  exports: [ScaleService],
})
export class ScaleModule { }