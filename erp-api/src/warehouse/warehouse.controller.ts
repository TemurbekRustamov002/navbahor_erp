import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Res
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../common/guards/jwt.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { OrdersService } from './orders.service';
import { ChecklistsService } from './checklists.service';
import { WarehouseExportService } from './services/warehouse-export.service';
import { CreateShipmentDto, CompleteShipmentDto } from './dto';

@ApiTags('warehouse')
@Controller('warehouse')
export class WarehouseController {
  constructor(
    private ordersService: OrdersService,
    private checklistsService: ChecklistsService,
    private exportSvc: WarehouseExportService
  ) { }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Warehouse module health check' })
  health() {
    return { ok: true, module: 'warehouse', status: 'operational' };
  }

  // Orders Management
  @Public()
  @Get('orders')
  @ApiOperation({ summary: 'Get all warehouse orders' })
  async getOrders(@Query() query: any) {
    return this.ordersService.findAll(query);
  }

  @Public()
  @Get('orders/:id')
  @ApiOperation({ summary: 'Get warehouse order by ID' })
  async getOrder(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Public()
  @Post('orders')
  @ApiOperation({ summary: 'Create new warehouse order' })
  async createOrder(@Body() createOrderDto: { customerId: string }) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Public()
  @Put('orders/:id/items')
  @ApiOperation({ summary: 'Add toys to warehouse order' })
  async addOrderItems(
    @Param('id') orderId: string,
    @Body() body: { toyIds: string[] }
  ) {
    return this.ordersService.addItems(orderId, body.toyIds);
  }

  @Delete('orders/:id')
  @Roles('ADMIN', 'WAREHOUSE')
  @ApiOperation({ summary: 'Delete warehouse order' })
  async deleteOrder(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  // Checklists Management  
  @Public()
  @Post('orders/:orderId/checklist')
  @ApiOperation({ summary: 'Create checklist for order' })
  async createChecklist(@Param('orderId') orderId: string) {
    return this.checklistsService.createFromOrder(orderId);
  }

  @Public()
  @Get('checklists/:id')
  @ApiOperation({ summary: 'Get checklist by ID' })
  async getChecklist(@Param('id') id: string) {
    return this.checklistsService.findOne(id);
  }

  @Public()
  @Put('checklists/:id/scan')
  @ApiOperation({ summary: 'Scan toy in checklist' })
  async scanToy(
    @Param('id') checklistId: string,
    @Body() body: { toyId: string; qrCode: string }
  ) {
    return this.checklistsService.scanToy(checklistId, body.toyId, body.qrCode);
  }

  @Public()
  @Put('checklists/:id/complete')
  @ApiOperation({ summary: 'Complete checklist and prepare shipment' })
  async completeChecklist(@Param('id') id: string) {
    return this.checklistsService.complete(id);
  }

  // Shipment Management
  @Get('shipments')
  @Roles('ADMIN', 'WAREHOUSE')
  @ApiOperation({ summary: 'Get all shipments' })
  async getShipments(@Query() query: any) {
    return this.ordersService.getAllShipments(query);
  }

  @Get('shipments/:id')
  @Roles('ADMIN', 'WAREHOUSE')
  @ApiOperation({ summary: 'Get shipment by ID' })
  async getShipment(@Param('id') id: string) {
    return this.ordersService.getShipment(id);
  }

  @Post('shipments')
  @Roles('ADMIN', 'WAREHOUSE')
  @ApiOperation({ summary: 'Create shipment and mark toys as shipped' })
  @ApiResponse({ status: 201, description: 'Shipment created successfully' })
  async createShipment(@Body() shipmentDto: CreateShipmentDto) {
    return this.ordersService.createShipment(shipmentDto);
  }

  @Put('shipments/:id/complete')
  @Roles('ADMIN', 'WAREHOUSE')
  @ApiOperation({ summary: 'Complete shipment - mark toys as delivered' })
  @ApiResponse({ status: 200, description: 'Shipment completed successfully' })
  async completeShipment(
    @Param('id') id: string,
    @Body() completeDto?: CompleteShipmentDto
  ) {
    return this.ordersService.completeShipment(id, completeDto);
  }

  @Public()
  @Get('shipments/track/:trackingNumber')
  @ApiOperation({ summary: 'Track shipment by tracking number (public)' })
  async trackShipment(@Param('trackingNumber') trackingNumber: string) {
    return this.ordersService.trackShipment(trackingNumber);
  }

  @Roles('ADMIN', 'WAREHOUSE')
  @Get('shipments/:id/export/waybill')
  @ApiOperation({ summary: 'Export Waybill (Yuk Xati) PDF' })
  async exportWaybill(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    try {
      await this.exportSvc.generateWaybill(res, id);
    } catch (error) {
      res.status(500).json({ error: 'Waybill generation failed', message: error.message });
    }
  }

  @Roles('ADMIN', 'WAREHOUSE')
  @Get('shipments/:id/export/packing-list')
  @ApiOperation({ summary: 'Export Packing List (Excel)' })
  async exportPackingList(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    try {
      await this.exportSvc.generatePackingList(res, id);
    } catch (error) {
      res.status(500).json({ error: 'Packing list generation failed', message: error.message });
    }
  }

  // Toys ready for warehouse
  @Public()
  @Get('toys/ready')
  @ApiOperation({ summary: 'Get toys ready for warehouse' })
  @ApiResponse({ status: 200, description: 'Ready toys grouped by marka' })
  async getReadyToys() {
    console.log('🔍 API: Getting ready toys from database...');

    const readyToys = await this.ordersService.getReadyToys();

    console.log('✅ API: Ready toys count:', readyToys.length);
    return readyToys;
  }
}