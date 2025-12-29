import { Controller, Post, Body, Get, Param, Query, Res, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../common/guards/jwt.guard';
import type { Response } from 'express';
import { ToysService } from './toys.service';
import { ProductType } from '@prisma/client';

@ApiTags('toys')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
@Controller('toys')
export class ToysController {
  constructor(private svc: ToysService) { }

  @Get()
  @ApiOperation({ summary: 'Get all toys with filtering' })
  @ApiQuery({ name: 'markaId', required: false })
  @ApiQuery({ name: 'productType', required: false })
  @ApiQuery({ name: 'labStatus', required: false })
  @ApiQuery({ name: 'withoutLabResult', required: false, type: 'boolean' })
  @ApiQuery({ name: 'brigade', required: false })
  list(
    @Query('markaId') markaId?: string,
    @Query('productType') productType?: ProductType,
    @Query('labStatus') labStatus?: string,
    @Query('withoutLabResult') withoutLabResult?: string,
    @Query('brigade') brigade?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.svc.findAll({
      markaId,
      productType,
      labStatus,
      withoutLabResult: withoutLabResult === 'true',
      brigade,
      page: page || 1,
      limit: limit || 50,
    });
  }

  @Get('scale/available')
  @ApiOperation({ summary: 'Get toys available for scale (by visible markas)' })
  getScaleAvailable() {
    return this.svc.getScaleAvailable();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get toy by ID' })
  get(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new toy (from scale data)' })
  create(@Body() dto: {
    markaId: string;
    productType: ProductType;
    brutto: number;
    tara: number;
    netto: number;
    orderNo: number;
    operatorId?: string;
  }) {
    return this.svc.createToy(dto);
  }

  @Put(':id/print')
  @ApiOperation({ summary: 'Mark toy as printed' })
  markPrinted(@Param('id') id: string) {
    return this.svc.markPrinted(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a toy' })
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Get('qrcode/:qrUid')
  @ApiOperation({ summary: 'Generate QR code for toy' })
  async qrcode(@Param('qrUid') qrUid: string, @Res() res: Response) {
    const png = await this.svc.qrcodePng(qrUid);
    res.setHeader('Content-Type', 'image/png');
    res.send(png);
  }
}
