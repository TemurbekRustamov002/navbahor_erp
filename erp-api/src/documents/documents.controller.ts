import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query,
  Res,
  NotFoundException,
  UseGuards,
  HttpStatus 
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtGuard } from '../common/guards/jwt.guard';
import { DocumentsService } from './documents.service';
import { DownloadDocumentDto } from './dto/download-document.dto';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller('documents')
@UseGuards(JwtGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async getAllDocuments(@Query('category') category?: string) {
    return this.documentsService.getAllDocuments(category);
  }

  @Get(':id')
  async getDocumentById(@Param('id') id: string) {
    return this.documentsService.getDocumentById(id);
  }

  @Get('search/:query')
  async searchDocuments(@Param('query') query: string) {
    return this.documentsService.searchDocuments(query);
  }

  @Post('download')
  async requestDownload(@Body() downloadDto: DownloadDocumentDto) {
    return this.documentsService.requestDownload(downloadDto);
  }

  @Get('download/:fileName')
  async downloadFile(
    @Param('fileName') fileName: string,
    @Res() res: Response,
    @Query('customerId') customerId?: string,
    @Query('markaId') markaId?: string,
    @Query('orderId') orderId?: string
  ) {
    try {
      // Resolve file path (relative to project root)
      const filePath = join(process.cwd(), '..', 'hujjatlar', fileName);
      
      if (!existsSync(filePath)) {
        throw new NotFoundException('Hujjat topilmadi');
      }

      // Log download attempt
      await this.documentsService.logDownload(fileName, {
        customerId,
        markaId,
        orderId,
        timestamp: new Date(),
        userAgent: res?.req?.headers['user-agent']
      });

      // Set proper headers for Excel files
      const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
      if (isExcel) {
        res.setHeader(
          'Content-Type', 
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
      } else {
        res.setHeader('Content-Type', 'application/octet-stream');
      }

      // Set download headers
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

      // Send file
      return res.sendFile(filePath);
      
    } catch (error) {
      console.error('Download error:', error);
      if (res && !res.headersSent) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Hujjatni yuklab olishda xatolik yuz berdi',
          error: error.message
        });
      }
      throw error;
    }
  }

  @Get('stats/overview')
  async getDocumentStats() {
    return this.documentsService.getDocumentStats();
  }
}