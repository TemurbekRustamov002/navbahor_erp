import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CustomersService } from './customers.service';
import { CustomersExportService } from './services/customers-export.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/create-customer.dto';
import { JwtGuard } from '../common/guards/jwt.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(
    private svc: CustomersService,
    private exportSvc: CustomersExportService
  ) { }

  @Get('export/excel')
  @Roles('ADMIN', 'SALES')
  async exportExcel(@Res() res: Response) {
    try {
      await this.exportSvc.exportCustomersToExcel(res);
    } catch (error) {
      res.status(500).json({ error: 'Export failed', message: error.message });
    }
  }

  @Get(':id/export/pdf')
  @Roles('ADMIN', 'SALES')
  async exportProfile(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.exportSvc.generateCustomerProfile(res, id);
    } catch (error) {
      res.status(500).json({ error: 'Export failed', message: error.message });
    }
  }

  @Get()
  list(@Query('search') s = '', @Query('page') page = 1, @Query('size') size = 20) {
    return this.svc.list({ s, page: +page, size: +size });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.get(id);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.svc.getStats(id);
  }

  @Get(':id/reports')
  getReports(@Param('id') id: string) {
    return this.svc.getReports(id);
  }

  @Get(':id/documents')
  getDocuments(@Param('id') id: string) {
    return this.svc.getDocuments(id);
  }

  @Roles('ADMIN', 'SALES', 'WAREHOUSE')
  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.svc.create(dto);
  }

  @Post('stats/batch')
  getBatchStats(@Body() data: { ids: string[] }) {
    return this.svc.getBatchStats(data.ids);
  }

  @Roles('ADMIN', 'SALES')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.svc.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Roles('ADMIN', 'SALES')
  @Post(':id/reports')
  createReport(@Param('id') id: string, @Body() data: any) {
    return this.svc.createReport(id, data);
  }

  @Roles('ADMIN', 'SALES')
  @Post(':id/documents')
  uploadDocument(@Param('id') id: string, @Body() data: any) {
    return this.svc.uploadDocument(id, data);
  }
}
