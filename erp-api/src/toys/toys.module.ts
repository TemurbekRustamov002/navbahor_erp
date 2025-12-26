import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ToysService } from './toys.service';
import { ToysController } from './toys.controller';

@Module({
  imports: [PrismaModule],
  providers: [ToysService],
  controllers: [ToysController],
  exports: [ToysService],
})
export class ToysModule {}
