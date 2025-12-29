import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChecklistsService {
  constructor(private prisma: PrismaService) { }

  async createFromOrder(orderId: string) {
    const order = await this.prisma.wHOrder.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'TARKIB_TANLANGAN') {
      throw new BadRequestException('Order must have selected items first');
    }

    if (order.items.length === 0) {
      throw new BadRequestException('Order has no items');
    }

    // Generate unique checklist code
    const checklistCode = `CL-${order.number}-${Date.now()}`;

    // Create checklist
    const checklist = await this.prisma.wHChecklist.create({
      data: {
        orderId: order.id,
        code: checklistCode,
        status: 'READY'
      }
    });

    // Create checklist items
    await this.prisma.$transaction(
      order.items.map(item =>
        this.prisma.wHChecklistItem.create({
          data: {
            checklistId: checklist.id,
            toyId: item.toyId,
            scanned: false
          }
        })
      )
    );

    // Update order status
    await this.prisma.wHOrder.update({
      where: { id: orderId },
      data: { status: 'TSD_CHECKLIST' }
    });

    return this.findOne(checklist.id);
  }

  async findOne(id: string) {
    const checklist = await this.prisma.wHChecklist.findUnique({
      where: { id },
      include: {
        order: {
          include: { items: true }
        },
        items: true
      }
    });

    if (!checklist) {
      throw new NotFoundException('Checklist not found');
    }

    // Manual join because relations are missing or incomplete in the current schema
    const toyIds = checklist.items.map(i => i.toyId);
    const toys = await this.prisma.toy.findMany({
      where: { id: { in: toyIds } },
      include: { marka: true }
    });

    const enrichedItems = checklist.items.map(item => {
      const toy = toys.find(t => t.id === item.toyId);
      const whItem = checklist.order.items.find(oi => oi.toyId === item.toyId);

      return {
        ...item,
        toy: toy ? {
          ...toy,
          brutto: toy.brutto.toNumber ? toy.brutto.toNumber() : toy.brutto,
          netto: toy.netto.toNumber ? toy.netto.toNumber() : toy.netto,
          tara: toy.tara.toNumber ? toy.tara.toNumber() : toy.tara,
          marka: toy.marka
        } : null,
        // Carry over snapshot data from whItem for robustness
        netto: whItem?.netto || toy?.netto,
        orderNo: whItem?.orderNo || toy?.orderNo,
        productType: whItem?.productType || toy?.productType,
        marka: toy?.marka || { number: '?' }
      };
    });

    return {
      ...checklist,
      items: enrichedItems
    };
  }

  async scanToy(checklistId: string, toyId: string, qrCode: string) {
    const checklist = await this.findOne(checklistId);

    if (checklist.status !== 'READY' && checklist.status !== 'SCANNED') {
      throw new BadRequestException('Checklist is not ready for scanning');
    }

    const item = checklist.items.find(i => i.toyId === toyId);
    if (!item) {
      throw new BadRequestException('Toy not found in checklist');
    }

    if (item.scanned) {
      throw new BadRequestException('Toy already scanned');
    }

    // Update checklist item
    await this.prisma.wHChecklistItem.update({
      where: { id: item.id },
      data: {
        scanned: true,
        scannedAt: new Date()
      }
    });

    // Check if all items are scanned
    const totalItems = checklist.items.length;
    const scannedCount = checklist.items.filter(i => i.scanned).length + 1;

    // Update checklist status if all scanned
    if (scannedCount === totalItems) {
      await this.prisma.wHChecklist.update({
        where: { id: checklistId },
        data: { status: 'SCANNED' }
      });
    }

    return this.findOne(checklistId);
  }

  async complete(id: string) {
    const checklist = await this.findOne(id);

    if (checklist.status !== 'SCANNED') {
      throw new BadRequestException('Checklist must be fully scanned first');
    }

    // Check if all items are actually scanned
    const allScanned = checklist.items.every(item => item.scanned);
    if (!allScanned) {
      throw new BadRequestException('Not all items are scanned');
    }

    // Update checklist and order status
    await this.prisma.$transaction([
      this.prisma.wHChecklist.update({
        where: { id },
        data: { status: 'APPROVED' }
      }),
      this.prisma.wHOrder.update({
        where: { id: checklist.orderId },
        data: { status: 'YUKLASH_TAYYOR' }
      })
    ]);

    return { success: true, message: 'Checklist completed successfully' };
  }
}