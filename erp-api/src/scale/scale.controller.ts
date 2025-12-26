import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user';
import { Role, MarkaDepartment } from '@prisma/client';
import { ScaleService } from './scale.service';
import { 
  CreateScaleDto, 
  UpdateScaleConfigDto, 
  ScaleReadingDto, 
  StartScaleSessionDto,
  DepartmentScalesDto 
} from './dto/scale.dto';

@ApiTags('Scale Management')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('scales')
export class ScaleController {
  private readonly logger = new Logger(ScaleController.name);

  constructor(private scaleService: ScaleService) {}

  // Scale Configuration Endpoints
  @Post('config')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Create new scale configuration' })
  @ApiResponse({ status: 201, description: 'Scale configuration created' })
  async createScaleConfig(@Body() dto: CreateScaleDto) {
    return this.scaleService.createScaleConfig(dto);
  }

  @Get('config')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERATOR)
  @ApiOperation({ summary: 'Get all scale configurations' })
  async getScaleConfigs() {
    return this.scaleService.getScaleConfigs();
  }

  @Put('config/:id')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Update scale configuration' })
  async updateScaleConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScaleConfigDto,
  ) {
    return this.scaleService.updateScaleConfig(id, dto);
  }

  // Department-specific scale access
  @Get('department/:department')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERATOR)
  @ApiOperation({ summary: 'Get scales for specific department with active markas' })
  @ApiResponse({ status: 200, type: DepartmentScalesDto })
  async getScalesForDepartment(
    @Param('department') department: MarkaDepartment,
  ) {
    return this.scaleService.getScalesWithActiveMarkas(department);
  }

  // Scale Reading Endpoints
  @Post(':scaleId/reading')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERATOR)
  @ApiOperation({ summary: 'Record new scale reading' })
  @ApiResponse({ status: 201, description: 'Reading recorded successfully' })
  async recordReading(
    @Param('scaleId', ParseUUIDPipe) scaleId: string,
    @Body() dto: ScaleReadingDto,
    @CurrentUser() user: any,
  ) {
    try {
      const reading = await this.scaleService.recordReading(scaleId, dto);
      
      this.logger.log(`Reading recorded: ${dto.weight}kg by ${user.username}`);
      
      return {
        success: true,
        data: reading,
        message: 'Reading recorded successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to record reading: ${error.message}`);
      throw error;
    }
  }

  // Manual Weight Input (when scale is disconnected)
  @Post('manual/reading')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERATOR)
  @ApiOperation({ summary: 'Record manual weight reading when scale is offline' })
  @ApiResponse({ status: 201, description: 'Manual reading recorded successfully' })
  async recordManualReading(
    @Body() dto: { weight: number; markaId?: string; unit?: string },
    @CurrentUser() user: any,
  ) {
    try {
      // Create a virtual scale reading for manual input
      const manualReading = {
        id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        scaleId: 'manual_input',
        weight: dto.weight,
        isStable: true, // Manual input is always considered stable
        unit: dto.unit || 'kg',
        markaId: dto.markaId,
        sessionId: `manual_session_${Date.now()}`,
        timestamp: new Date(),
      };
      
      this.logger.log(`Manual reading recorded: ${dto.weight}kg by ${user.username}`);
      
      return {
        success: true,
        data: manualReading,
        message: 'Manual reading recorded successfully',
        isManual: true,
      };
    } catch (error) {
      this.logger.error(`Failed to record manual reading: ${error.message}`);
      throw error;
    }
  }

  @Get(':scaleId/latest')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERATOR)
  @ApiOperation({ summary: 'Get latest reading from scale' })
  async getLatestReading(@Param('scaleId', ParseUUIDPipe) scaleId: string) {
    const reading = await this.scaleService.getLatestReading(scaleId);
    
    if (!reading) {
      return {
        success: true,
        data: null,
        message: 'No readings found',
      };
    }

    return {
      success: true,
      data: reading,
      message: 'Latest reading retrieved',
    };
  }

  @Get(':scaleId/history')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERATOR)
  @ApiOperation({ summary: 'Get reading history for scale' })
  async getReadingHistory(
    @Param('scaleId', ParseUUIDPipe) scaleId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 100,
    @Query('markaId') markaId?: string,
  ) {
    const readings = await this.scaleService.getReadingHistory(scaleId, limit, markaId);
    
    return {
      success: true,
      data: readings,
      count: readings.length,
      message: 'Reading history retrieved',
    };
  }

  // Scale Session Management
  @Post(':scaleId/session/start')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERATOR)
  @ApiOperation({ summary: 'Start scale session (conflict prevention)' })
  async startSession(
    @Param('scaleId', ParseUUIDPipe) scaleId: string,
    @Body() dto: StartScaleSessionDto,
    @CurrentUser() user: any,
  ) {
    const canStart = await this.scaleService.startScaleSession(scaleId, dto.sessionId);
    
    if (!canStart) {
      throw new BadRequestException(
        'Cannot start session: Another scale in this department is currently active'
      );
    }

    this.logger.log(`Scale session started: ${scaleId} by ${user.username}`);
    
    return {
      success: true,
      sessionId: dto.sessionId,
      message: 'Scale session started successfully',
    };
  }

  @Post(':scaleId/heartbeat')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERATOR)
  @ApiOperation({ summary: 'Update scale heartbeat' })
  async updateHeartbeat(@Param('scaleId', ParseUUIDPipe) scaleId: string) {
    await this.scaleService.updateScaleHeartbeat(scaleId);
    
    return {
      success: true,
      message: 'Heartbeat updated',
      timestamp: new Date(),
    };
  }

  // System Health
  @Post('health/check')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Check all scale connections' })
  async checkConnections() {
    await this.scaleService.checkScaleConnections();
    
    const configs = await this.scaleService.getScaleConfigs();
    
    return {
      success: true,
      data: configs.map(config => ({
        id: config.id,
        name: config.name,
        department: config.department,
        connectionStatus: config.connectionStatus,
        lastHeartbeat: config.lastHeartbeat,
        isActive: config.isActive,
      })),
      message: 'Connection status updated',
    };
  }

  // Quick status check for operators
  @Get('status/overview')
  @Roles(Role.ADMIN, Role.SUPERVISOR, Role.OPERATOR)
  @ApiOperation({ summary: 'Get overview of all scales status' })
  async getOverview() {
    const configs = await this.scaleService.getScaleConfigs();
    
    const overview = {
      totalScales: configs.length,
      connectedScales: configs.filter(c => c.connectionStatus === 'connected').length,
      activeScales: configs.filter(c => c.isActive).length,
      byDepartment: {
        ARRALI_SEX: configs.filter(c => c.department === 'ARRALI_SEX').length,
        VALIKLI_SEX: configs.filter(c => c.department === 'VALIKLI_SEX').length,
        UNIVERSAL: configs.filter(c => c.department === 'UNIVERSAL').length,
      },
      scales: configs.map(config => ({
        id: config.id,
        name: config.name,
        department: config.department,
        connectionStatus: config.connectionStatus,
        isActive: config.isActive,
        lastHeartbeat: config.lastHeartbeat,
      })),
    };

    return {
      success: true,
      data: overview,
      message: 'Scale overview retrieved',
    };
  }
}