import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportQueryDto } from './dto/report-query.dto';
import { ProductType, ToyStatus, LabGrade } from '@prisma/client';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getDashboardStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // 1. Total Production by ProductType (Current Month)
        const production = await this.prisma.toy.groupBy({
            by: ['productType'],
            where: {
                createdAt: { gte: startOfMonth },
            },
            _count: true,
            _sum: {
                netto: true,
            },
        });

        // 2. Inventory Status
        const inventory = await this.prisma.toy.groupBy({
            by: ['status'],
            _count: true,
            _sum: {
                netto: true,
            },
        });

        // 3. Quality Grades Distribution
        const quality = await this.prisma.labResult.groupBy({
            by: ['grade'],
            _count: true,
        });

        // 4. Recent Shipments (Daily for last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const shipments = await this.prisma.toy.findMany({
            where: {
                status: ToyStatus.SHIPPED,
                updatedAt: { gte: sevenDaysAgo },
            },
            select: {
                updatedAt: true,
                netto: true,
            },
            orderBy: { updatedAt: 'asc' },
        });

        // Process shipments into daily totals
        const dailyShipments = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const total = shipments
                .filter(s => s.updatedAt.toISOString().split('T')[0] === dateStr)
                .reduce((sum, s) => sum + Number(s.netto), 0);

            return { date: dateStr, total };
        }).reverse();

        return {
            production: production.map(p => ({
                type: p.productType,
                count: p._count,
                weight: Number(p._sum.netto || 0),
            })),
            inventory: inventory.map(i => ({
                status: i.status,
                count: i._count,
                weight: Number(i._sum.netto || 0),
            })),
            quality: quality.map(q => ({
                grade: q.grade,
                count: q._count,
            })),
            recentShipments: dailyShipments,
        };
    }

    async getProductionReport(query: ReportQueryDto) {
        const { startDate, endDate, productType, markaId } = query;

        const where: any = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }
        if (productType) where.productType = productType;
        if (markaId) where.markaId = markaId;

        const toys = await this.prisma.toy.findMany({
            where,
            include: {
                marka: true,
                labResult: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return toys.map(toy => ({
            id: toy.id,
            qrUid: toy.qrUid,
            markaNumber: toy.marka.number,
            productType: toy.productType,
            orderNo: toy.orderNo,
            netto: Number(toy.netto),
            status: toy.status,
            grade: toy.labResult?.grade,
            brigade: toy.brigade,
            createdAt: toy.createdAt,
        }));
    }

    async getInventoryReport(query: ReportQueryDto) {
        const { productType, status } = query;

        const where: any = {};
        if (productType) where.productType = productType;
        if (status) where.status = status;

        const inventory = await this.prisma.toy.findMany({
            where,
            include: {
                marka: true,
            },
            orderBy: { productType: 'asc' },
        });

        return inventory.map(item => ({
            id: item.id,
            qrUid: item.qrUid,
            markaNumber: item.marka.number,
            productType: item.productType,
            netto: Number(item.netto),
            status: item.status,
            brigade: item.brigade,
            createdAt: item.createdAt,
        }));
    }

    async getShipmentReport(query: any) {
        const { startDate, endDate } = query;

        const where: any = {
            status: 'YUKLANDI',
        };

        if (startDate || endDate) {
            where.updatedAt = {};
            if (startDate) where.updatedAt.gte = new Date(startDate);
            if (endDate) where.updatedAt.lte = new Date(endDate);
        }

        const orders = await this.prisma.wHOrder.findMany({
            where,
            include: {
                shipment: true,
                customer: true,
                items: true,
            },
            orderBy: { updatedAt: 'desc' },
        });

        const toyIds = orders.flatMap(o => o.items.map(i => i.toyId));
        const toys = await this.prisma.toy.findMany({
            where: { id: { in: toyIds } },
            include: {
                marka: true,
                labResult: true,
            }
        });

        const toyMap = new Map(toys.map(t => [t.id, t]));

        const report: any[] = [];
        for (const order of orders) {
            for (const item of order.items) {
                const toy = toyMap.get(item.toyId);

                report.push({
                    id: item.id,
                    date: order.updatedAt,
                    destination: order.shipment?.destinationAddress || '-',
                    createdBy: order.createdBy || '-',
                    markaNumber: toy?.marka?.number || '-',
                    markaId: toy?.markaId,
                    orderNo: item.orderNo,
                    customer: order.customerName || order.customer?.name || '-',
                    waybill: order.number || order.shipment?.trackingNumber || '-',
                    vehicle: order.shipment?.vehicleNo || '-',
                    driver: order.shipment?.driverName || '-',
                    productType: item.productType,
                    netto: Number(item.netto),
                    brutto: Number(toy?.brutto || 0),
                    tara: Number(toy?.tara || 0),
                    grade: toy?.labResult?.grade || '-',
                    moisture: Number(toy?.labResult?.moisture || 0),
                    trash: Number(toy?.labResult?.trash || 0),
                    strength: Number(toy?.labResult?.strength || 0),
                    lengthMm: Number(toy?.labResult?.lengthMm || 0),
                    micronaire: Number(toy?.labResult?.micronaire || 0),
                });
            }
        }
        return report;
    }

    async getMarkaSummaryReport(query: any) {
        const { markaId, department } = query;

        const where: any = {};
        if (markaId) where.id = markaId;
        if (department) where.department = department;

        const markas = await this.prisma.marka.findMany({
            where,
            include: {
                toys: {
                    include: {
                        labResult: true
                    },
                    orderBy: { orderNo: 'asc' }
                }
            },
            orderBy: { number: 'desc' }
        });

        return markas.map(marka => ({
            id: marka.id,
            number: marka.number,
            department: marka.department,
            sex: marka.sex,
            productType: marka.productType,
            toyCount: marka.toys.length,
            totalNetto: marka.toys.reduce((sum, t) => sum + Number(t.netto), 0),
            toys: marka.toys.map(toy => ({
                orderNo: toy.orderNo,
                brutto: Number(toy.brutto),
                tara: Number(toy.tara),
                netto: Number(toy.netto),
                brigade: toy.brigade,
                grade: toy.labResult?.grade,
                moisture: Number(toy.labResult?.moisture || 0),
                trash: Number(toy.labResult?.trash || 0),
                strength: Number(toy.labResult?.strength || 0),
            }))
        }));
    }
}
