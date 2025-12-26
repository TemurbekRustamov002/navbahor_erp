import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) { }

  async list({ s, page, size }: { s: string; page: number; size: number }) {
    const where: Prisma.CustomerWhereInput = s ? {
      OR: [
        { name: { contains: s, mode: 'insensitive' } },
        { legalName: { contains: s, mode: 'insensitive' } },
        { tin: { contains: s } },
        { contactName: { contains: s, mode: 'insensitive' } },
        { director: { contains: s, mode: 'insensitive' } }
      ]
    } : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        skip: (page - 1) * size,
        take: size,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.customer.count({ where }),
    ]);
    return { items, total, page, size };
  }

  async get(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async create(dto: CreateCustomerDto) {
    // Duplicate check by TIN (if provided)
    if (dto.tin) {
      const existing = await this.prisma.customer.findUnique({ where: { tin: dto.tin } });
      if (existing) {
        throw new ConflictException(`Mijoz ushbu STIR (${dto.tin}) bilan allaqachon mavjud: ${existing.name}`);
      }
    }

    const data: Prisma.CustomerCreateInput = {
      name: dto.name,
      legalName: dto.legalName,
      tin: dto.tin,
      address: dto.address,
      director: dto.director,
      bankName: dto.bankName,
      bankAccount: dto.bankAccount,
      mfo: dto.mfo,
      oked: dto.oked,
      contactName: dto.contactName,
      contactPhone: dto.contactPhone,
      contactEmail: dto.contactEmail,
      notes: dto.notes,
      isActive: dto.isActive ?? true,
    };
    const customer = await this.prisma.customer.create({ data });

    // Log activity
    await this.prisma.activityLog.create({
      data: {
        action: 'CUSTOMER_CREATED',
        entity: 'Customer',
        entityId: customer.id,
        actorRole: 'CUSTOMER_MANAGER',
        diff: { name: customer.name, tin: customer.tin } as any
      }
    });

    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    try {
      const data: Prisma.CustomerUpdateInput = {
        name: dto.name,
        legalName: dto.legalName,
        tin: dto.tin,
        address: dto.address,
        director: dto.director,
        bankName: dto.bankName,
        bankAccount: dto.bankAccount,
        mfo: dto.mfo,
        oked: dto.oked,
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
        contactEmail: dto.contactEmail,
        notes: dto.notes,
        isActive: dto.isActive,
      };
      return await this.prisma.customer.update({ where: { id }, data });
    } catch {
      throw new NotFoundException('Customer not found');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.customer.delete({ where: { id } });
      return { ok: true };
    } catch {
      throw new NotFoundException('Customer not found');
    }
  }

  async getStats(id: string) {
    const totalOrders = await this.prisma.wHOrder.count({
      where: { customerId: id }
    });

    const volumeAgg = await this.prisma.wHItem.aggregate({
      _sum: { netto: true },
      where: {
        order: { customerId: id }
      }
    });

    const totalVolume = Number(volumeAgg._sum.netto || 0);

    const lastOrder = await this.prisma.wHOrder.findFirst({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' }
    });

    const averageOrderValue = totalOrders > 0 ? totalVolume / totalOrders : 0;

    return {
      totalOrders,
      totalVolume,
      lastOrderDate: lastOrder?.createdAt || null,
      averageOrderValue
    };
  }

  async getReports(id: string) {
    return this.prisma.customerReport.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getBatchStats(ids: string[]) {
    // 1. Get total orders count per customer
    const ordersCount = await this.prisma.wHOrder.groupBy({
      by: ['customerId'],
      _count: { id: true },
      where: {
        customerId: { in: ids }
      }
    });

    // 2. Get total volume per customer (via items)
    // Prisma group by on related fields is tricky, better to do aggregate or raw query for performance on N items
    // Or just fetch items with order.customerId

    // For batching volume, we can use a raw query or iterate (if page size is small like 20)
    // Iterating 20 lightweight agg queries is better than 1 massive join sometimes, but let's try a smarter way.
    // Actually, simple aggregation loop for just 20 IDs is acceptable compared to N HTTP requests.
    // OR:
    /* 
      const volumeData = await this.prisma.wHItem.findMany({
        where: { order: { customerId: { in: ids } } },
        select: { netto: true, order: { select: { customerId: true } } }
      });
      // Then reduce... but this returns ALL items, bad if many items.
    */

    // Let's stick to doing parallel promises for the volumes, it's backend-side so latency is minimal (microseconds between db/app)
    // compared to HTTP latency.

    // Optimized: Promise.all for aggregations
    const stats = await Promise.all(ids.map(async (id) => {
      const orderCount = ordersCount.find(o => o.customerId === id)?._count.id || 0;

      const volumeAgg = await this.prisma.wHItem.aggregate({
        _sum: { netto: true },
        where: { order: { customerId: id } }
      });

      const lastOrder = await this.prisma.wHOrder.findFirst({
        where: { customerId: id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      });

      const totalVolume = Number(volumeAgg._sum.netto || 0);

      return {
        id,
        totalOrders: orderCount,
        totalVolume,
        lastOrderDate: lastOrder?.createdAt || null,
        averageOrderValue: orderCount > 0 ? totalVolume / orderCount : 0
      };
    }));

    // Convert array to object map for easy access
    return stats.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
  }

  async getDocuments(id: string) {
    return this.prisma.customerDocument.findMany({
      where: { customerId: id },
      orderBy: { uploadedAt: 'desc' }
    });
  }

  async createReport(customerId: string, data: any) {
    // Determine reportData type or structure if needed, currently passing as any to Json
    return this.prisma.customerReport.create({
      data: {
        customerId,
        title: data.title,
        description: data.description,
        reportData: data.reportData || {},
      }
    });
  }

  async uploadDocument(customerId: string, data: any) {
    return this.prisma.customerDocument.create({
      data: {
        customerId,
        title: data.title,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: +data.fileSize,
      }
    });
  }
}
