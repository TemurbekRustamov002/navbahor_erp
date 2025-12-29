import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsExportService } from './services/reports-export.service';
import { ReportQueryDto } from './dto/report-query.dto';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';

@Controller('reports')
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService,
        private readonly exportService: ReportsExportService,
    ) { }

    @Get('dashboard')
    getDashboardStats() {
        return this.reportsService.getDashboardStats();
    }

    @Get('production')
    getProductionReport(@Query() query: ReportQueryDto) {
        return this.reportsService.getProductionReport(query);
    }

    @Get('inventory')
    getInventoryReport(@Query() query: ReportQueryDto) {
        return this.reportsService.getInventoryReport(query);
    }

    @Get('shipments')
    getShipmentReport(@Query() query: any) {
        return this.reportsService.getShipmentReport(query);
    }

    @Get('marka-summary')
    getMarkaSummaryReport(@Query() query: any) {
        return this.reportsService.getMarkaSummaryReport(query);
    }

    @Public()
    @Get('export-pdf')
    exportPDF(@Query() query: ReportQueryDto, @Res() res: Response) {
        return this.exportService.exportProductionPDF(res, query);
    }

    @Public()
    @Get('export-excel')
    exportExcel(@Query() query: ReportQueryDto, @Res() res: Response) {
        return this.exportService.exportInventoryExcel(res, query);
    }

    @Public()
    @Get('export-shipments')
    exportShipments(@Query() query: any, @Res() res: Response) {
        return this.exportService.exportShipmentExcel(res, query);
    }

    @Public()
    @Get('export-marka-summary')
    exportMarkaSummary(@Query() query: any, @Res() res: Response) {
        return this.exportService.exportMarkaSummaryExcel(res, query);
    }
}
