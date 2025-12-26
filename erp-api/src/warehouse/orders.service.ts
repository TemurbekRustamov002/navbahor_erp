import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShipmentDto, CompleteShipmentDto } from './dto';

const nextNumber = (n: number) =>
  `WH-${new Date().getFullYear()}/${String(n).padStart(4, '0')}`;

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) { }

  async createOrder(createOrderDto: { customerId: string }) {
    // Generate unique order number
    const orderNumber = `WH-${Date.now()}`;

    // Validate customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: createOrderDto.customerId }
    });

    if (!customer) {
      throw new NotFoundException(`Mijoz topilmadi (ID: ${createOrderDto.customerId})`);
    }

    const order = await this.prisma.wHOrder.create({
      data: {
        number: orderNumber,
        status: 'MIJOZ_TANLANGAN',
        customer: {
          connect: { id: createOrderDto.customerId }
        }
      },
      include: {
        items: true,
        checklist: {
          include: { items: true }
        }
      }
    });

    return order;
  }

  async addItems(orderId: string, toyIds: string[]) {
    const order = await this.findOne(orderId);

    if (order.status !== 'MIJOZ_TANLANGAN') {
      throw new BadRequestException('Order must be in customer selected state');
    }

    // Get toys with marka and lab info
    const toys = await this.prisma.toy.findMany({
      where: {
        id: { in: toyIds },
        readyForWarehouse: true
      },
      include: {
        marka: true,
        labResult: true
      }
    });

    if (toys.length !== toyIds.length) {
      throw new BadRequestException('Some toys not found or not ready for warehouse');
    }

    // Create warehouse items with Lab Snapshot
    await this.prisma.$transaction(
      toys.map((toy, index) =>
        this.prisma.wHItem.create({
          data: {
            orderId,
            toyId: toy.id,
            markaId: toy.markaId,
            productType: toy.productType,
            orderNo: index + 1,
            netto: toy.netto,
            // Create snapshot of lab data to preserve history after toy deletion
            labData: toy.labResult ? {
              grade: toy.labResult.grade,
              mic: toy.labResult.moisture, // naming convention check: moisture?
              trash: toy.labResult.trash,
              strength: toy.labResult.strength,
              length: toy.labResult.lengthMm,
              id: toy.labResult.id
            } : {}
          }
        })
      )
    );

    // Update order status
    await this.prisma.wHOrder.update({
      where: { id: orderId },
      data: { status: 'TARKIB_TANLANGAN' }
    });

    return this.findOne(orderId);
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 20, status, customerId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const [orders, total] = await Promise.all([
      this.prisma.wHOrder.findMany({
        where,
        include: {
          items: true,
          checklist: {
            include: { items: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      this.prisma.wHOrder.count({ where })
    ]);

    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.wHOrder.findUnique({
      where: { id },
      include: {
        items: true,
        checklist: {
          include: { items: true }
        }
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getReadyToys() {
    const toys = await this.prisma.toy.findMany({
      where: {
        readyForWarehouse: true,
        labStatus: 'APPROVED',
        status: 'IN_STOCK'
      },
      include: {
        marka: true,
        labResult: true
      },
      orderBy: [
        { marka: { number: 'asc' } },
        { orderNo: 'asc' }
      ]
    });

    // Group by marka
    const groupedByMarka = toys.reduce((acc, toy) => {
      const markaKey = toy.markaId;
      if (!acc[markaKey]) {
        acc[markaKey] = {
          marka: {
            id: toy.marka.id,
            number: toy.marka.number,
            productType: toy.marka.productType,
            status: toy.marka.status,
            ptm: (toy.marka as any).ptm
          },
          toys: []
        };
      }
      acc[markaKey].toys.push(toy);
      return acc;
    }, {} as Record<string, { marka: any, toys: any[] }>);

    return Object.values(groupedByMarka);
  }

  async createShipment(shipmentDto: CreateShipmentDto) {
    console.log('🚚 Service: Creating shipment...', shipmentDto);

    const { orderId, driver, waybillNumber, notes, customerId, customerName, documents } = shipmentDto;

    // Get all toys from the order transaction check
    const orderItems = await this.prisma.wHItem.findMany({
      where: { orderId },
      include: {
        order: true
      }
    });

    if (orderItems.length === 0) {
      throw new BadRequestException('No toys found in this order');
    }

    // Start transaction to ensure data consistency
    const result = await this.prisma.$transaction(async (prisma) => {
      // Generate tracking number
      const trackingNumber = `TRK-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

      // Create shipment record with proper fields
      const shipment = await prisma.shipment.create({
        data: {
          orderId,
          vehicleNo: driver.vehicleNumber,
          vehicleType: driver.vehicleType,
          driverName: `${driver.firstName} ${driver.lastName}`,
          driverPhone: driver.phone,
          driverLicense: driver.licenseNumber,
          forwarder: waybillNumber, // Waybill number
          trackingNumber: trackingNumber,
          destinationAddress: notes, // Store notes here or create dedicated notes field? Schema says "notes" moved to WHOrder? No, WHOrder has notes. Shipment expects address. Let's put minimal address or keep notes.
          documents: documents as any, // Cast to JSON
          loadedAt: new Date(),
          plannedDate: shipmentDto.plannedDeliveryDate ? new Date(shipmentDto.plannedDeliveryDate) : null
        }
      });

      // Update order notes if provided
      if (notes) {
        await prisma.wHOrder.update({
          where: { id: orderId },
          data: { notes: notes, status: 'YUKLANDI' }
        });
      } else {
        await prisma.wHOrder.update({
          where: { id: orderId },
          data: { status: 'YUKLANDI' }
        });
      }

      const toyIds = orderItems.map(item => item.toyId);

      // Auditing Requirement: Mark toys as SHIPPED instead of deleting
      await prisma.toy.updateMany({
        where: {
          id: { in: toyIds }
        },
        data: {
          status: 'SHIPPED',
          readyForWarehouse: false
        }
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          action: 'SHIPMENT_CREATED',
          entity: 'Shipment',
          entityId: shipment.id,
          actorRole: 'WAREHOUSE_MANAGER', // Can be dynamic from context later
          diff: {
            orderId,
            trackingNumber,
            toyCount: toyIds.length
          } as any
        }
      });

      return {
        shipment,
        shippedCount: toyIds.length,
        toyIds,
        trackingNumber
      };
    });

    console.log(`✅ Service: Shipment created, ${result.shippedCount} toys marked as SHIPPED`);

    return {
      shipment: result.shipment,
      trackingNumber: result.trackingNumber,
      shippedToys: result.shippedCount,
      message: `Shipment yaratildi va ${result.shippedCount} ta toy "SHIPPED" holatiga o'tkazildi`,
      estimatedDelivery: shipmentDto.plannedDeliveryDate || null
    };
  }

  async getAllShipments(query: any = {}) {
    const { page = 1, limit = 20, status, customerId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (customerId) where.order = { customerId };

    const [shipments, total] = await Promise.all([
      this.prisma.shipment.findMany({
        where,
        include: {
          order: {
            include: {
              items: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      this.prisma.shipment.count({ where })
    ]);

    return {
      shipments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getShipment(id: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: true
          }
        }
      }
    });

    if (!shipment) {
      throw new NotFoundException('Shipment topilmadi');
    }

    return shipment;
  }

  async completeShipment(shipmentId: string, completeDto?: CompleteShipmentDto) {
    console.log('🏁 Service: Completing shipment...', shipmentId);

    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId }
    });

    if (!shipment) {
      throw new NotFoundException('Shipment topilmadi');
    }

    // Mark shipment as delivered
    const updateData: any = {
      approvedAt: completeDto?.deliveredAt ? new Date(completeDto.deliveredAt) : new Date()
    };

    if (completeDto?.deliveryNotes) {
      updateData.destinationAddress = `${shipment.destinationAddress || ''}\n\nYetkazish izohi: ${completeDto.deliveryNotes}`;
    }

    await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: updateData
    });

    console.log('✅ Service: Shipment marked as delivered');

    return {
      message: 'Shipment yakunlandi va yetkazib berilgan deb belgilandi. Toylar allaqachon bazadan olib tashlangan.'
    };
  }

  async trackShipment(trackingNumber: string) {
    // Search directly by trackingNumber or forwarder (waybill)
    const shipment = await this.prisma.shipment.findFirst({
      where: {
        OR: [
          { trackingNumber: trackingNumber },
          { forwarder: trackingNumber }
        ]
      },
      include: {
        order: {
          include: {
            items: true
          }
        }
      }
    });

    if (!shipment) {
      throw new NotFoundException('Tracking raqami bo\'yicha shipment topilmadi');
    }

    // Determine status based on dates
    let status = 'shipped';
    let statusText = 'Yuborildi';

    if (shipment.approvedAt) {
      status = 'delivered';
      statusText = 'Yetkazildi';
    } else if (shipment.loadedAt) {
      status = 'in_transit';
      statusText = 'Yo\'lda';
    }

    // Calculate progress
    let progress = 25;
    if (status === 'in_transit') progress = 75;
    if (status === 'delivered') progress = 100;

    return {
      trackingNumber: shipment.trackingNumber,
      status,
      statusText,
      progress,
      shipment: {
        id: shipment.id,
        waybillNumber: shipment.forwarder,
        vehicleNumber: shipment.vehicleNo,
        vehicleType: shipment.vehicleType,
        driverName: shipment.driverName,
        driverPhone: shipment.driverPhone,
        shippedAt: shipment.loadedAt,
        deliveredAt: shipment.approvedAt,
        estimatedDelivery: shipment.plannedDate,
        destination: shipment.destinationAddress || 'N/A',
        documents: shipment.documents
      },
      order: {
        number: shipment.order.number,
        totalItems: shipment.order.items?.length || 0,
        customerName: shipment.order.customerName,
        notes: shipment.order.notes
      },
      timeline: [
        {
          status: 'created',
          title: 'Buyurtma yaratildi',
          date: shipment.order.createdAt,
          completed: true
        },
        {
          status: 'shipped',
          title: 'Yuborildi',
          date: shipment.loadedAt,
          completed: !!shipment.loadedAt
        },
        {
          status: 'delivered',
          title: 'Yetkazildi',
          date: shipment.approvedAt,
          completed: !!shipment.approvedAt
        }
      ]
    };
  }


  canDelete(status: string) {
    // ✅ KATTA HARFLAR
    return ['QORALAMA', 'MIJOZ_TANLANGAN', 'TARKIB_TANLANGAN', 'TSD_CHECKLIST'].includes(status);
  }

  async remove(orderId: string) {
    const order = await this.prisma.wHOrder.findUnique({
      where: { id: orderId },
      include: { checklist: { include: { items: true } } }
    });

    if (!order || !this.canDelete(order.status)) {
      throw new BadRequestException('Delete blocked by status');
    }

    if (order.checklist?.items?.some(i => i.scanned)) {
      throw new BadRequestException('Checklist scanned started');
    }

    await this.prisma.wHOrder.delete({ where: { id: orderId } });
    return { ok: true };
  }
}