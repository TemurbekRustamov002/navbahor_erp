import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuditService } from '../services/admin-audit.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin/audit')
@UseGuards(JwtGuard, RolesGuard)
@Roles('ADMIN')
export class AdminAuditController {
  constructor(private readonly adminAuditService: AdminAuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs' })
  async getAuditLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('entity') entity?: string,
    @Query('action') action?: string,
    @Query('actorId') actorId?: string,
  ) {
    return this.adminAuditService.getAuditLogs({
      page: page || 1,
      limit: limit || 20,
      entity,
      action,
      actorId,
    });
  }

  @Get('entities')
  @ApiOperation({ summary: 'Get audit entities list' })
  async getEntities() {
    return this.adminAuditService.getEntities();
  }

  @Get('actions')
  @ApiOperation({ summary: 'Get audit actions list' })
  async getActions() {
    return this.adminAuditService.getActions();
  }
}