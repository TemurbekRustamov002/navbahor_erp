import { Controller, Post, Body, Put, Param, Get, Query, Patch, Delete, BadRequestException, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../common/guards/jwt.guard';
import { Public } from '../common/decorators/public.decorator';
import { LabService } from './lab.service';
import { LabExportService } from './services/lab-export.service';
import { LabGrade, LabStatus } from '@prisma/client';

@ApiTags('lab')
@ApiBearerAuth('JWT-auth')
@Controller('lab')
export class LabController {
  constructor(
    private svc: LabService,
    private exportSvc: LabExportService
  ) { }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check for lab service' })
  health() {
    return { status: 'ok', service: 'lab', timestamp: new Date().toISOString() };
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Export lab results to Excel' })
  async exportExcel(@Query() query: any, @Res() res: Response) {
    try {
      await this.exportSvc.exportResultsToExcel(res, query);
    } catch (error) {
      res.status(500).json({ error: 'Export failed', message: error.message });
    }
  }

  @Get('results/:toyId/export/certificate')
  @ApiOperation({ summary: 'Export Quality Certificate (PDF)' })
  async exportCertificate(@Param('toyId') toyId: string, @Res() res: Response) {
    try {
      await this.exportSvc.generateCertificate(res, toyId);
    } catch (error) {
      res.status(500).json({ error: 'Certificate generation failed', message: error.message });
    }
  }

  @Get('results')
  @ApiOperation({ summary: 'Get all lab results with filtering' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'markaId', required: false })
  getResults(
    @Query('status') status?: LabStatus,
    @Query('markaId') markaId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.svc.getResults({
      status,
      markaId,
      page: page || 1,
      limit: limit || 20,
    });
  }

  @Get('results/:toyId')
  @ApiOperation({ summary: 'Get lab result for specific toy' })
  getResult(@Param('toyId') toyId: string) {
    return this.svc.getResult(toyId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get lab statistics' })
  getStats() {
    return this.svc.getStats();
  }

  @Post('sample')
  @ApiOperation({ summary: 'Create or update lab sample' })
  upsertSample(@Body() dto: {
    toyId: string;
    moisture: number;
    trash: number;
    navi: number;
    grade: LabGrade;
    strength: number;
    lengthMm: number;
    micronaire?: number;
    operatorName?: string;
    comment?: string;
  }) {
    // Validate grade enum
    const validGrades = ['OLIY', 'YAXSHI', 'ORTA', 'ODDIY', 'IFLOS'];
    if (!validGrades.includes(dto.grade)) {
      throw new BadRequestException(`Invalid grade: ${dto.grade}. Valid options: ${validGrades.join(', ')}`);
    }

    return this.svc.upsertSample(dto);
  }

  @Post('bulk-samples')
  @ApiOperation({ summary: 'Create or update multiple lab samples' })
  bulkUpsertSamples(@Body() dto: {
    toyIds: string[];
    moisture: number;
    trash: number;
    navi: number;
    grade: LabGrade;
    strength: number;
    lengthMm: number;
    micronaire?: number;
    operatorName?: string;
    comment?: string;
  }) {
    // Validate grade enum
    const validGrades = ['OLIY', 'YAXSHI', 'ORTA', 'ODDIY', 'IFLOS'];
    if (!validGrades.includes(dto.grade)) {
      throw new BadRequestException(`Invalid grade: ${dto.grade}. Valid options: ${validGrades.join(', ')}`);
    }

    return this.svc.bulkUpsertSamples(dto);
  }

  @Put(':toyId/approve')
  @ApiOperation({ summary: 'Approve lab result' })
  approve(@Param('toyId') toyId: string) {
    return this.svc.approve(toyId);
  }

  @Put(':toyId/reject')
  @ApiOperation({ summary: 'Reject lab result' })
  reject(@Param('toyId') toyId: string, @Body('reason') reason?: string) {
    return this.svc.reject(toyId, reason);
  }

  @Patch('results/:toyId/toggle-warehouse')
  @ApiOperation({ summary: 'Toggle warehouse visibility' })
  toggleWarehouse(@Param('toyId') toyId: string) {
    return this.svc.toggleWarehouse(toyId);
  }

  @Delete('results/:toyId')
  @ApiOperation({ summary: 'Delete lab sample' })
  delete(@Param('toyId') toyId: string) {
    return this.svc.deleteSample(toyId);
  }
}
