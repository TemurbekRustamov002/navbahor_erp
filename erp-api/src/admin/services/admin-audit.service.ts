import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminAuditService {
  constructor(private prisma: PrismaService) {}

  async getAuditLogs(query: {
    page: number;
    limit: number;
    entity?: string;
    action?: string;
    actorId?: string;
  }) {
    const { page, limit, entity, action, actorId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ActivityLogWhereInput = {};

    if (entity) {
      where.entity = entity;
    }

    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }

    if (actorId) {
      where.actorId = actorId;
    }

    const [logsRaw, total] = await this.prisma.$transaction([
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    // Serialize BigInt and Date safely for JSON response
    const logs = logsRaw.map((l: any) => ({
      id: l.id?.toString?.() ?? String(l.id),
      actorId: l.actorId ?? null,
      actorRole: l.actorRole ?? null,
      action: l.action,
      entity: l.entity,
      entityId: l.entityId ?? null,
      diff: l.diff ?? null,
      ip: l.ip ?? null,
      createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
    }));

    return {
      logs,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getEntities() {
    const entities = await this.prisma.activityLog.findMany({
      distinct: ['entity'],
      select: { entity: true },
    });

    return entities.map(e => e.entity).filter(Boolean);
  }

  async getActions() {
    const actions = await this.prisma.activityLog.findMany({
      distinct: ['action'],
      select: { action: true },
    });

    return actions.map(a => a.action).filter(Boolean);
  }

  async createAuditLog(data: {
    actorId?: string;
    actorRole?: string;
    action: string;
    entity: string;
    entityId?: string;
    diff?: any;
    ip?: string;
  }) {
    return this.prisma.activityLog.create({
      data,
    });
  }
}