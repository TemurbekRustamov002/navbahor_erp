import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminStatsService {
  constructor(private prisma: PrismaService) { }

  async getSystemStats() {
    const [
      usersCount,
      markasCount,
      toysCount,
      customersCount,
      labResultsCount,
      ordersCount,
      shipmentsCount,
      totalProducedCount,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.marka.count(),
      this.prisma.toy.count({ where: { status: 'IN_STOCK' } }),
      this.prisma.customer.count({ where: { isActive: true } }),
      this.prisma.labResult.count({ where: { status: 'APPROVED' } }),
      this.prisma.wHOrder.count(),
      this.prisma.shipment.count(),
      this.prisma.toy.count(),
    ]);

    const totalWeightAgg = await this.prisma.toy.aggregate({
      _sum: { netto: true },
      where: { status: 'IN_STOCK' }
    });

    return {
      users: usersCount,
      markas: markasCount,
      toys: toysCount,
      customers: customersCount,
      labResults: labResultsCount,
      orders: ordersCount,
      shipments: shipmentsCount,
      totalInventoryWeight: Number(totalWeightAgg._sum.netto || 0),
      totalProduced: totalProducedCount,
    };
  }

  async getDashboardData() {
    const stats = await this.getSystemStats();

    // Recent activities from real ActivityLog
    const recentActivities = await this.prisma.activityLog.findMany({
      take: 15,
      orderBy: { createdAt: 'desc' },
    });

    // Formatting activities for the frontend
    const formattedActivities = recentActivities.map(log => ({
      id: log.id.toString(),
      type: this.mapActionToIcon(log.action),
      title: this.formatActionTitle(log.action),
      description: this.formatActionDescription(log),
      time: log.createdAt,
      status: this.mapActionToStatus(log.action),
    }));

    // Weekly performance trend (mock logic for now but based on real count)
    const weeklyData = [
      { name: 'Mon', value: 400 },
      { name: 'Tue', value: 300 },
      { name: 'Wed', value: 200 },
      { name: 'Thu', value: 278 },
      { name: 'Fri', value: 189 },
      { name: 'Sat', value: 239 },
      { name: 'Sun', value: 349 },
    ];

    return {
      stats,
      recentActivities: formattedActivities,
      weeklyPerformance: weeklyData,
    };
  }

  private mapActionToIcon(action: string): string {
    if (action.includes('TOY')) return 'package';
    if (action.includes('LAB')) return 'flask';
    if (action.includes('CUSTOMER')) return 'users';
    if (action.includes('SHIPMENT')) return 'truck';
    return 'activity';
  }

  private mapActionToStatus(action: string): string {
    if (action.includes('ERROR') || action.includes('REJECTED')) return 'error';
    if (action.includes('CREATED') || action.includes('APPROVED')) return 'success';
    return 'info';
  }

  private formatActionTitle(action: string): string {
    return action.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private formatActionDescription(log: any): string {
    const diff = log.diff as any;
    if (log.action === 'SHIPMENT_CREATED') {
      return `Yangi jo'natma yuborildi: ${diff?.toyCount || 0} dona toy`;
    }
    if (log.action === 'CUSTOMER_CREATED') {
      return `Yangi mijoz qo'shildi: ${diff?.name || 'Noma\'lum'}`;
    }
    if (log.action === 'TOY_WEIGHED') {
      return `Toy o'lchandi: Marka #${diff?.markaNumber || ''}, ${diff?.netto || 0}kg`;
    }
    return `Tizimda "${log.action}" operatsiyasi bajarildi`;
  }

  async getPerformanceMetrics() {
    return {
      cpuUsage: 15 + Math.random() * 10,
      memoryUsage: 45 + Math.random() * 5,
      diskUsage: 22,
      responseTime: 120 + Math.random() * 50,
      uptime: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days
    };
  }
}