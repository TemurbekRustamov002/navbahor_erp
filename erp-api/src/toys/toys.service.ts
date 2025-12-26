import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductType, MarkaStatus } from '@prisma/client';
import * as QRCode from 'qrcode';

@Injectable()
export class ToysService {
  constructor(private prisma: PrismaService) { }

  async createToy(dto: { markaId: string; productType: ProductType; orderNo?: number; brutto: number; tara: number; netto: number }) {
    // Professional: Use transaction with isolation level to prevent race conditions
    return this.prisma.$transaction(async (tx) => {
      const marka = await tx.marka.findUnique({
        where: { id: dto.markaId },
        // Lock the marka record to prevent concurrent modifications if needed, 
        // though index on Toy(markaId, orderNo) will also catch it.
      });

      if (!marka) throw new BadRequestException('Marka topilmadi');
      if (marka.status !== MarkaStatus.ACTIVE) throw new BadRequestException(`Marka faol holatda emas. Status: ${marka.status}`);

      // Auto-generate orderNo inside transaction
      let orderNo = dto.orderNo;
      if (!orderNo) {
        const lastToy = await tx.toy.findFirst({
          where: { markaId: dto.markaId },
          orderBy: { orderNo: 'desc' },
          select: { orderNo: true }
        });
        orderNo = lastToy ? lastToy.orderNo + 1 : 1;
      }

      if (orderNo < 1 || orderNo > 220) throw new BadRequestException('Ochsher raqami diapazondan tashqari (1-220)');

      // Check if this orderNo already exists (double check inside tx)
      const existingToy = await tx.toy.findFirst({
        where: { markaId: dto.markaId, orderNo }
      });

      if (existingToy) {
        throw new ConflictException(`Ushbu marka uchun ${orderNo}-raqamli toy allaqachon mavjud`);
      }

      // Generate UID
      const qrUid = `MRK${marka.number}-${orderNo.toString().padStart(3, '0')}-QR`;
      const netto = +(dto.brutto - dto.tara).toFixed(2);

      const toy = await tx.toy.create({
        data: {
          qrUid,
          markaId: dto.markaId,
          productType: dto.productType,
          orderNo,
          brutto: dto.brutto,
          tara: dto.tara,
          netto,
        },
        include: {
          marka: true
        }
      });

      // Log activity inside transaction
      await tx.activityLog.create({
        data: {
          action: 'TOY_WEIGHED',
          entity: 'Toy',
          entityId: toy.id,
          actorRole: 'OPERATOR',
          diff: {
            markaNumber: toy.marka.number,
            orderNo: toy.orderNo,
            netto: toy.netto
          } as any
        }
      });

      // Update marka usage count
      await tx.marka.update({
        where: { id: dto.markaId },
        data: {
          used: { increment: 1 },
          updatedAt: new Date()
        }
      });

      return toy;
    }, {
      // Isolation level to ensure serializable-like behavior for orderNo generation
      isolationLevel: 'Serializable',
    });
  }

  async findAll(query: {
    markaId?: string;
    productType?: ProductType;
    labStatus?: string;
    withoutLabResult?: boolean;
    page: number;
    limit: number;
  }) {
    const { markaId, productType, labStatus, withoutLabResult, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (markaId) where.markaId = markaId;
    if (productType) where.productType = productType;
    if (labStatus) where.labStatus = labStatus;

    if (withoutLabResult) {
      where.labResult = null;
    }

    const [toys, total] = await this.prisma.$transaction([
      this.prisma.toy.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          marka: true,
          labResult: true,
        },
      }),
      this.prisma.toy.count({ where }),
    ]);

    return {
      items: toys,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getScaleAvailable() {
    return this.prisma.toy.findMany({
      where: {
        marka: {
          showOnScale: true,
          status: MarkaStatus.ACTIVE,
        },
      },
      include: {
        marka: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findOne(id: string) {
    const toy = await this.prisma.toy.findUnique({
      where: { id },
      include: {
        marka: true,
        labResult: true,
      },
    });

    if (!toy) throw new NotFoundException('Toy topilmadi');
    return toy;
  }

  async markPrinted(id: string) {
    const toy = await this.prisma.toy.findUnique({ where: { id } });
    if (!toy) throw new NotFoundException('Toy topilmadi');

    const updated = await this.prisma.toy.update({
      where: { id },
      data: { printed: true },
    });

    return { ok: true, printed: updated.printed };
  }

  async remove(id: string) {
    const toy = await this.prisma.toy.findUnique({
      where: { id },
      include: { marka: true }
    });

    if (!toy) throw new NotFoundException('Toy topilmadi');

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.labResult.deleteMany({ where: { toyId: id } });
        await tx.toy.delete({ where: { id } });
        await tx.marka.update({
          where: { id: toy.markaId },
          data: {
            used: { decrement: 1 },
            updatedAt: new Date()
          }
        });
      });

      return {
        success: true,
        message: 'Toy muvaffaqiyatli o\'chirildi',
      };
    } catch (error) {
      throw new BadRequestException('Toy o\'chirishda xatolik yuz berdi');
    }
  }

  async qrcodePng(qrUid: string) {
    return QRCode.toBuffer(qrUid, { margin: 0, width: 320 });
  }
}
