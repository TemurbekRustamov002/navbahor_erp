import { Controller, Get, Post, Put, Patch, Delete, Param, Query, Body, Res } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import type { Response } from 'express';
import { MarkasService } from './markas.service';
import { MarkaExportService } from './services/marka-export.service';
import { MarkaStatus, ProductType } from '@prisma/client';
import { CreateMarkaDto, UpdateMarkaDto, MarkaQueryDto } from './dto/marka.dto';

@ApiTags('markas')
@Controller('markas')
export class MarkasController {
  constructor(
    private svc: MarkasService,
    private exportSvc: MarkaExportService
  ) { }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check for markas service' })
  health() {
    return { status: 'ok', service: 'markas', timestamp: new Date().toISOString() };
  }

  @Roles('ADMIN', 'SCALE', 'LAB', 'WAREHOUSE')
  @Get()
  @ApiOperation({ summary: 'Get all markas with filtering' })
  list(@Query() query: MarkaQueryDto) {
    return this.svc.findAll(query);
  }

  @Roles('ADMIN', 'SCALE', 'LAB', 'WAREHOUSE', 'PRODUCTION_MANAGER', 'SUPERVISOR', 'OPERATOR')
  @Get('options')
  @ApiOperation({ summary: 'Get unique marka options' })
  async getOptions() {
    const opts = await this.svc.getOptions();
    return {
      ptm: opts.ptm.sort(),
      pickingType: opts.pickingType.sort(),
      selection: opts.selection.sort()
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get marka statistics' })
  getStats() {
    return this.svc.getStats();
  }

  @Roles('ADMIN', 'SCALE', 'LAB', 'WAREHOUSE')
  @Get(':id')
  @ApiOperation({ summary: 'Get marka by ID' })
  get(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Roles('ADMIN', 'SCALE', 'LAB', 'WAREHOUSE')
  @Get(':id/toys')
  @ApiOperation({ summary: 'Get toys for specific marka' })
  getMarkaToys(@Param('id') id: string) {
    return this.svc.getMarkaToys(id);
  }

  @Roles('ADMIN', 'SCALE', 'LAB', 'WAREHOUSE')
  @Post()
  @ApiOperation({ summary: 'Create new marka' })
  create(@Body() dto: CreateMarkaDto) {
    return this.svc.create(dto);
  }

  @Roles('ADMIN', 'SCALE', 'LAB', 'WAREHOUSE')
  @Put(':id')
  @ApiOperation({ summary: 'Update marka' })
  update(@Param('id') id: string, @Body() dto: UpdateMarkaDto) {
    return this.svc.update(id, dto);
  }

  @Roles('ADMIN', 'SCALE', 'LAB', 'WAREHOUSE')
  @Patch(':id/toggle-scale')
  @ApiOperation({ summary: 'Toggle marka scale visibility' })
  toggleScale(@Param('id') id: string) {
    return this.svc.toggleScale(id);
  }

  @Roles('ADMIN', 'SCALE', 'LAB', 'WAREHOUSE')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update marka status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.svc.updateStatus(id, status);
  }

  @Roles('ADMIN', 'SCALE', 'LAB', 'WAREHOUSE')
  @Patch('bulk/show-on-scale')
  @ApiOperation({ summary: 'Enable showOnScale for all ACTIVE markas' })
  enableScaleForActiveMarkas() {
    return this.svc.enableScaleForActiveMarkas();
  }

  @Roles('ADMIN', 'SCALE', 'LAB', 'WAREHOUSE')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete marka (with orphaned data protection)' })
  async delete(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  // Export endpoints
  @Public()
  @Get('export/excel')
  @ApiOperation({ summary: 'Export markas to Excel format' })
  async exportExcel(@Query() query: MarkaQueryDto, @Res() res: Response) {
    await this.exportSvc.exportMarkasToExcel(res, undefined, {
      format: 'excel',
      includeDetails: true,
      includeToys: String(query.withUntestedToys) === 'true' || query.withUntestedToys === true,
      productTypes: query.productType ? [query.productType] : undefined,
      statuses: query.status ? [query.status] : undefined,
    });
  }

  @Public()
  @Get(':id/export/pdf')
  @ApiOperation({ summary: 'Export detailed marka passport (PDF)' })
  async exportMarkaPassport(@Param('id') id: string, @Res() res: Response) {
    await this.exportSvc.exportMarkaDetailsPdf(res, id);
  }

  @Roles('ADMIN', 'SCALE', 'LAB', 'WAREHOUSE')
  @Get(':id/qr-code')
  @ApiOperation({ summary: 'Generate QR code for marka' })
  async getMarkaQRCode(@Param('id') id: string) {
    try {
      const qrCodeDataURL = await this.exportSvc.generateMarkaQRCode(id);
      return { qrCode: qrCodeDataURL };
    } catch (error) {
      return { error: 'QR code generation failed', message: error.message };
    }
  }

  @Public()
  @Get(':id/label')
  @ApiOperation({ summary: 'Generate label for marka' })
  async getMarkaLabel(@Param('id') id: string, @Res() res: Response) {
    try {
      const labelContent = await this.exportSvc.generateMarkaLabel(id);
      const filename = `marka-${id}-label.zpl`;

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      return res.send(labelContent);
    } catch (error) {
      return res.status(500).json({ error: 'Label generation failed', message: error.message });
    }
  }

  @Public()
  @Post('export/excel/selected')
  @ApiOperation({ summary: 'Export selected markas to Excel' })
  async exportSelectedExcel(@Body('markaIds') markaIds: string[], @Res() res: Response) {
    await this.exportSvc.exportMarkasToExcel(res, markaIds, {
      format: 'excel',
      includeDetails: true,
      includeToys: true
    });
  }
}
