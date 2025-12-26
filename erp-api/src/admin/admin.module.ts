import { Module } from '@nestjs/common';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminStatsController } from './controllers/admin-stats.controller';
import { AdminAuditController } from './controllers/admin-audit.controller';
import { AdminUsersService } from './services/admin-users.service';
import { AdminStatsService } from './services/admin-stats.service';
import { AdminAuditService } from './services/admin-audit.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminUsersController,
    AdminStatsController,
    AdminAuditController,
  ],
  providers: [
    AdminUsersService,
    AdminStatsService,
    AdminAuditService,
  ],
  exports: [
    AdminUsersService,
    AdminStatsService,
    AdminAuditService,
  ],
})
export class AdminModule {}