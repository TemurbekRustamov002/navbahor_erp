import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminStatsService } from '../services/admin-stats.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin/stats')
@UseGuards(JwtGuard, RolesGuard)
@Roles('ADMIN')
export class AdminStatsController {
  constructor(private readonly adminStatsService: AdminStatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get system statistics' })
  async getStats() {
    return this.adminStatsService.getSystemStats();
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard data' })
  async getDashboard() {
    return this.adminStatsService.getDashboardData();
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get performance metrics' })
  async getPerformance() {
    return this.adminStatsService.getPerformanceMetrics();
  }
}