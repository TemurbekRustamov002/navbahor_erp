import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LabGrade, LabStatus } from '@prisma/client';

@Injectable()
export class LabService {
  constructor(private prisma: PrismaService) { }

  async upsertSample(dto: {
    toyId: string;
    moisture: number;
    trash: number;
    navi: number;
    grade: LabGrade;
    strength: number;
    lengthMm: number;
    comment?: string;
  }) {
    const toy = await this.prisma.toy.findUnique({ where: { id: dto.toyId } });
    if (!toy) throw new NotFoundException('Toy topilmadi');

    return this.prisma.labResult.upsert({
      where: { toyId: dto.toyId },
      create: {
        toyId: dto.toyId,
        moisture: dto.moisture,
        trash: dto.trash,
        navi: dto.navi,
        grade: dto.grade,
        strength: dto.strength,
        lengthMm: dto.lengthMm,
        comment: dto.comment,
        status: LabStatus.PENDING,
      },
      update: {
        moisture: dto.moisture,
        trash: dto.trash,
        navi: dto.navi,
        grade: dto.grade,
        strength: dto.strength,
        lengthMm: dto.lengthMm,
        comment: dto.comment,
        status: LabStatus.PENDING,
      },
    });
  }

  async bulkUpsertSamples(dto: {
    toyIds: string[];
    moisture: number;
    trash: number;
    navi: number;
    grade: LabGrade;
    strength: number;
    lengthMm: number;
    comment?: string;
  }) {
    const { toyIds, ...data } = dto;

    // We use a transaction to ensure atomicity
    return this.prisma.$transaction(
      toyIds.map((toyId) =>
        this.prisma.labResult.upsert({
          where: { toyId },
          create: {
            toyId,
            ...data,
            status: LabStatus.PENDING,
          },
          update: {
            ...data,
            status: LabStatus.PENDING,
          },
        })
      )
    );
  }

  async getResults(query: {
    status?: LabStatus;
    markaId?: string;
    page: number;
    limit: number;
  }) {
    const { status, markaId, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (markaId) {
      where.toy = { markaId };
    }

    const [results, total] = await this.prisma.$transaction([
      this.prisma.labResult.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          toy: {
            include: {
              marka: true,
            },
          },
        },
      }),
      this.prisma.labResult.count({ where }),
    ]);

    return {
      items: results,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getResult(toyId: string) {
    const result = await this.prisma.labResult.findUnique({
      where: { toyId },
      include: {
        toy: {
          include: {
            marka: true,
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundException('Lab natijasi topilmadi');
    }

    return result;
  }

  async getStats() {
    const [total, pending, approved, rejected] = await this.prisma.$transaction([
      this.prisma.labResult.count(),
      this.prisma.labResult.count({ where: { status: LabStatus.PENDING } }),
      this.prisma.labResult.count({ where: { status: LabStatus.APPROVED } }),
      this.prisma.labResult.count({ where: { status: LabStatus.REJECTED } }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
    };
  }

  async approve(toyId: string) {
    const sample = await this.prisma.labResult.findUnique({
      where: { toyId },
      include: { toy: { include: { marka: true } } }
    });
    if (!sample) throw new NotFoundException('Lab namunasi topilmadi');

    await this.prisma.$transaction([
      this.prisma.labResult.update({
        where: { toyId },
        data: { status: LabStatus.APPROVED, showToWarehouse: true },
      }),
      this.prisma.toy.update({
        where: { id: toyId },
        data: { labStatus: LabStatus.APPROVED, readyForWarehouse: true },
      }),
      this.prisma.activityLog.create({
        data: {
          action: 'LAB_APPROVED',
          entity: 'LabResult',
          entityId: sample.id,
          actorRole: 'LAB_ANALYST',
          diff: {
            toyId: sample.toyId,
            markaNumber: sample.toy.marka.number,
            orderNo: sample.toy.orderNo,
            grade: sample.grade
          } as any
        }
      })
    ]);

    return { ok: true };
  }

  async reject(toyId: string, reason?: string) {
    const sample = await this.prisma.labResult.findUnique({ where: { toyId } });
    if (!sample) throw new NotFoundException('Lab namunasi topilmadi');

    await this.prisma.$transaction([
      this.prisma.labResult.update({
        where: { toyId },
        data: {
          status: LabStatus.REJECTED,
          showToWarehouse: false,
          comment: reason ? `${sample.comment || ''}\nRad etildi: ${reason}` : sample.comment
        },
      }),
      this.prisma.toy.update({
        where: { id: toyId },
        data: { labStatus: LabStatus.REJECTED, readyForWarehouse: false },
      }),
      this.prisma.activityLog.create({
        data: {
          action: 'LAB_REJECTED',
          entity: 'LabResult',
          entityId: sample.id,
          actorRole: 'LAB_ANALYST',
          diff: { toyId, reason } as any
        }
      })
    ]);

    return { ok: true };
  }

  async toggleWarehouse(toyId: string) {
    const sample = await this.prisma.labResult.findUnique({ where: { toyId } });
    if (!sample) throw new NotFoundException('Lab namunasi topilmadi');

    const updated = await this.prisma.labResult.update({
      where: { toyId },
      data: { showToWarehouse: !sample.showToWarehouse },
    });

    return { ok: true, showToWarehouse: updated.showToWarehouse };
  }

  async deleteSample(toyId: string) {
    const sample = await this.prisma.labResult.findUnique({ where: { toyId } });
    if (!sample) throw new NotFoundException('Lab namunasi topilmadi');

    await this.prisma.$transaction([
      this.prisma.labResult.delete({ where: { toyId } }),
      this.prisma.toy.update({
        where: { id: toyId },
        data: { labStatus: LabStatus.PENDING, readyForWarehouse: false } // Reset toy status
      })
    ]);

    return { ok: true };
  }
}
