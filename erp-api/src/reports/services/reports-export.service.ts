import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { ReportQueryDto } from '../dto/report-query.dto';

const fonts = {
    Roboto: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
    },
};

@Injectable()
export class ReportsExportService {
    constructor(private prisma: PrismaService) { }

    async exportProductionPDF(res: Response, query: ReportQueryDto) {
        const { startDate, endDate, productType } = query;
        const where: any = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }
        if (productType) where.productType = productType;

        const toys = await this.prisma.toy.findMany({
            where,
            include: {
                marka: true,
                labResult: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        const totalWeight = toys.reduce((acc, t) => acc + Number(t.netto), 0);
        const avgMoisture = toys.reduce((acc, t) => acc + (Number(t.labResult?.moisture) || 0), 0) / toys.length || 0;

        const printer = new PdfPrinter(fonts);

        const docDefinition: TDocumentDefinitions = {
            content: [
                {
                    columns: [
                        { text: 'NAVBAHOR.ERP', style: 'brandLogo' },
                        {
                            text: [
                                { text: 'HISOBOT / REPORT\n', style: 'reportTitle' },
                                { text: `Sana: ${new Date().toLocaleDateString('uz-UZ')}`, style: 'reportMeta' }
                            ],
                            alignment: 'right'
                        }
                    ]
                },
                { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#e2e8f0' }] },
                { text: '\n' },
                {
                    style: 'summaryCard',
                    table: {
                        widths: ['*', '*', '*'],
                        body: [
                            [
                                {
                                    stack: [
                                        { text: 'JAMI VAZN (TOTAL WEIGHT)', style: 'statLabel' },
                                        { text: `${totalWeight.toLocaleString()} kg`, style: 'statValue' }
                                    ]
                                },
                                {
                                    stack: [
                                        { text: 'TOYLAR SONI (BALE COUNT)', style: 'statLabel' },
                                        { text: `${toys.length} ta`, style: 'statValue' }
                                    ]
                                },
                                {
                                    stack: [
                                        { text: 'OʻRT. NAMLIK (AVG MOISTURE)', style: 'statLabel' },
                                        { text: `${avgMoisture.toFixed(2)} %`, style: 'statValue' }
                                    ]
                                }
                            ]
                        ]
                    },
                    layout: 'noBorders'
                },
                { text: '\n' },
                {
                    text: `Davr: ${startDate || 'Barchasi'} - ${endDate || 'Hozirgi vaqt'}`,
                    style: 'filterText'
                },
                { text: '\n' },
                {
                    style: 'tableExample',
                    table: {
                        headerRows: 1,
                        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'Sana', style: 'tableHeader' },
                                { text: 'Marka', style: 'tableHeader' },
                                { text: 'Tur', style: 'tableHeader' },
                                { text: 'Brigada', style: 'tableHeader' },
                                { text: 'T.№', style: 'tableHeader' },
                                { text: 'Vazn (kg)', style: 'tableHeader' },
                                { text: 'Sinf', style: 'tableHeader' }
                            ],
                            ...toys.map(t => [
                                { text: new Date(t.createdAt).toLocaleDateString(), style: 'tableCell' },
                                { text: String((t as any).productType), style: 'tableCell' },
                                { text: String((t as any).brigade || '-'), style: 'tableCell' },
                                { text: String((t as any).orderNo), style: 'tableCell' },
                                { text: String(t.orderNo), style: 'tableCell' },
                                { text: String(Number(t.netto).toFixed(1)), style: 'tableCellBold' },
                                { text: String(t.labResult?.grade || '-'), style: 'tableCell' }
                            ])
                        ]
                    },
                    layout: {
                        fillColor: (rowIndex) => (rowIndex === 0 ? '#4f46e5' : rowIndex % 2 === 0 ? '#f8fafc' : null),
                        hLineColor: () => '#f1f5f9',
                        vLineColor: () => '#f1f5f9'
                    }
                },
                { text: '\n\n' },
                {
                    columns: [
                        { text: 'Xulosa (Conclusion):', style: 'conclusionTitle', width: 120 },
                        {
                            text: 'Mazkur hisobot tizim tomonidan avtomatlashtirilgan holda shakllantirildi. Maʼlumotlar haqiqiyligi laboratoriya va tarozining nazorat natijalariga asoslanadi.',
                            style: 'conclusionText'
                        }
                    ]
                },
                { text: '\n\n' },
                {
                    columns: [
                        { text: 'Masʼul xodim: ___________________', style: 'signature' },
                        { text: 'M.Oʻ.: ___________________', style: 'signature', alignment: 'right' }
                    ]
                }
            ],
            styles: {
                brandLogo: { fontSize: 24, bold: true, color: '#4f46e5' },
                reportTitle: { fontSize: 18, bold: true, color: '#1e293b' },
                reportMeta: { fontSize: 10, color: '#64748b' },
                summaryCard: { margin: [0, 10, 0, 10], fillColor: '#f1f5f9' },
                statLabel: { fontSize: 8, color: '#64748b', bold: true, margin: [0, 0, 0, 4] },
                statValue: { fontSize: 16, bold: true, color: '#1e293b' },
                filterText: { fontSize: 10, italics: true, color: '#64748b' },
                tableHeader: { fontSize: 9, bold: true, color: 'white', margin: [5, 5, 5, 5] },
                tableCell: { fontSize: 9, color: '#334155', margin: [5, 5, 5, 5] },
                tableCellBold: { fontSize: 9, bold: true, color: '#1e293b', margin: [5, 5, 5, 5] },
                conclusionTitle: { fontSize: 10, bold: true },
                conclusionText: { fontSize: 10, color: '#475569', lineHeight: 1.4 },
                signature: { fontSize: 10, bold: true, margin: [0, 50, 0, 0] }
            },
            defaultStyle: { font: 'Roboto' }
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Report_${Date.now()}.pdf`);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }

    async exportInventoryExcel(res: Response, query: ReportQueryDto) {
        const { productType, status } = query;
        const where: any = {};
        if (productType) where.productType = productType;
        if (status) where.status = status;

        const items = await this.prisma.toy.findMany({
            where,
            include: {
                marka: true,
                labResult: true
            },
            orderBy: { createdAt: 'desc' }
        });

        const totalWeight = items.reduce((acc, it) => acc + Number(it.netto), 0);
        const totalBrutto = items.reduce((acc, it) => acc + Number(it.brutto), 0);

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Inventar Tahlili', {
            views: [{ state: 'frozen', ySplit: 7 }]
        });

        // --- STYLES ---
        const brandFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }; // Slate 800
        const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }; // Indigo 600
        const stripeFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        const borderStyle: Partial<ExcelJS.Borders> = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };

        // --- BRANDING & HEADER ---
        sheet.mergeCells('A1:H2');
        const titleCell = sheet.getCell('A1');
        titleCell.value = 'NAVBAHOR TEXTILE ERP - INVENTARIZATSIYA HISOBOTI';
        titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' }, name: 'Arial' };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        titleCell.fill = brandFill;

        // --- SUMMARY STATS ---
        sheet.mergeCells('A4:B4');
        sheet.getCell('A4').value = 'JAMI VAZN (NETTO):';
        sheet.getCell('A4').font = { bold: true, size: 10, color: { argb: 'FF64748B' } };
        sheet.getCell('C4').value = totalWeight;
        sheet.getCell('C4').font = { bold: true, size: 12 };
        sheet.getCell('C4').numFmt = '#,##0.0 "kg"';

        sheet.mergeCells('A5:B5');
        sheet.getCell('A5').value = 'TOYLAR SONI:';
        sheet.getCell('A5').font = { bold: true, size: 10, color: { argb: 'FF64748B' } };
        sheet.getCell('C5').value = items.length;
        sheet.getCell('C5').font = { bold: true, size: 12 };
        sheet.getCell('C5').numFmt = '#,##0 "ta"';

        sheet.getCell('E4').value = 'HISOBOТ SANASI:';
        sheet.getCell('E4').font = { bold: true, size: 10, color: { argb: 'FF64748B' } };
        sheet.getCell('F4').value = new Date().toLocaleDateString('uz-UZ');
        sheet.getCell('F4').font = { bold: true };

        // --- TABLE HEADER ---
        const headers = [
            'Sana',
            'ID (QR Kodi)',
            'Marka №',
            'Mahsulot Turi',
            'Tartib №',
            'Brigada',
            'Netto (kg)',
            'Brutto (kg)',
            'Sinf / Grade'
        ];
        const headerRow = sheet.addRow(headers);
        headerRow.height = 30;
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
            cell.fill = headerFill;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = borderStyle;
        });

        // --- DATA ROWS ---
        items.forEach((item, index) => {
            const row = sheet.addRow([
                new Date(item.createdAt).toLocaleDateString('uz-UZ'),
                item.qrUid,
                `M-${item.marka.number}`,
                item.productType,
                item.orderNo,
                (item as any).brigade || '-',
                Number(item.netto),
                Number(item.brutto),
                item.labResult?.grade || '-'
            ]);

            row.height = 20;
            if (index % 2 === 0) {
                row.eachCell(c => c.fill = stripeFill);
            }
            row.eachCell(c => {
                c.border = borderStyle;
                c.alignment = { vertical: 'middle', horizontal: 'center' };
            });
            // Specific alignment for text columns
            row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
        });

        // --- FINAL FORMATTING ---
        sheet.getColumn(1).width = 15; // Sana
        sheet.getColumn(2).width = 25; // QR
        sheet.getColumn(3).width = 12; // Marka
        sheet.getColumn(4).width = 15; // Turi
        sheet.getColumn(5).width = 10; // Tartib
        sheet.getColumn(6).width = 10; // Brigada
        sheet.getColumn(7).width = 15; // Netto
        sheet.getColumn(8).width = 15; // Brutto
        sheet.getColumn(9).width = 15; // Sinf

        // Number formats
        sheet.getColumn(7).numFmt = '#,##0.0';
        sheet.getColumn(8).numFmt = '#,##0.0';

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Navbahor_Inventory_${Date.now()}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();
    }

    async exportShipmentExcel(res: Response, query: any) {
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

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Yukxatilar Hisoboti');

        const headers = [
            'Sana', 'Qayerga', 'Kim tomonidan', 'Marka No', 'Toy No', 'Mijoz', 'Yukxati', 'Mashina', 'Haydovchi',
            'Turi', 'Netto', 'Brutto', 'Tara', 'Sinf', 'Namlik', 'Ifloslik', 'Mustahkamlik', 'Uzunlik', 'Mikroneyr'
        ];

        const headerRow = sheet.addRow(headers);
        headerRow.eachCell(cell => {
            cell.font = { bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        });

        orders.forEach(order => {
            order.items.forEach(item => {
                const toy = toyMap.get(item.toyId);
                sheet.addRow([
                    new Date(order.updatedAt).toLocaleString('uz-UZ'),
                    order.shipment?.destinationAddress || '-',
                    order.createdBy || '-',
                    toy?.marka?.number || '-',
                    item.orderNo,
                    order.customerName || order.customer?.name || '-',
                    order.number || order.shipment?.trackingNumber || '-',
                    order.shipment?.vehicleNo || '-',
                    order.shipment?.driverName || '-',
                    item.productType,
                    Number(item.netto),
                    Number(toy?.brutto || 0),
                    Number(toy?.tara || 0),
                    toy?.labResult?.grade || '-',
                    Number(toy?.labResult?.moisture || 0),
                    Number(toy?.labResult?.trash || 0),
                    Number(toy?.labResult?.strength || 0),
                    Number(toy?.labResult?.lengthMm || 0),
                    Number(toy?.labResult?.micronaire || 0)
                ]);
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Shipments_${Date.now()}.xlsx"`);
        await workbook.xlsx.write(res);
        res.end();
    }

    async exportMarkaSummaryExcel(res: Response, query: any) {
        const { department } = query;
        const where: any = {};
        if (department) where.department = department;

        const markas = await this.prisma.marka.findMany({
            where,
            include: {
                toys: {
                    include: { labResult: true },
                    orderBy: { orderNo: 'asc' }
                }
            },
            orderBy: { number: 'desc' }
        });

        const workbook = new ExcelJS.Workbook();

        markas.forEach(marka => {
            const sheetName = `Marka ${marka.number}`;
            const sheet = workbook.addWorksheet(sheetName.substring(0, 31));

            // Header Section
            sheet.mergeCells('A1:G1');
            const markaCell = sheet.getCell('A1');
            markaCell.value = `Marka №: ${marka.number} | Sex: ${marka.sex || '-'} | Brigada: ${marka.toys[0]?.brigade || '-'}`;
            markaCell.font = { bold: true, size: 14 };
            markaCell.alignment = { horizontal: 'center' };

            // Table Headers
            const headers = ['Tartib №', 'Brutto', 'Tara', 'Netto', 'Sinf', 'Namlik', 'Ifloslik', 'Mustahkamlik'];
            const headerRow = sheet.addRow(headers);
            headerRow.eachCell(cell => {
                cell.font = { bold: true };
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            });

            // Fill Toys 1 to 220
            const toyMap = new Map(marka.toys.map(t => [t.orderNo, t]));
            let totalBrutto = 0, totalTara = 0, totalNetto = 0;

            for (let i = 1; i <= 220; i++) {
                const toy = toyMap.get(i);
                if (toy) {
                    totalBrutto += Number(toy.brutto);
                    totalTara += Number(toy.tara);
                    totalNetto += Number(toy.netto);
                }

                sheet.addRow([
                    i,
                    toy ? Number(toy.brutto) : '-',
                    toy ? Number(toy.tara) : '-',
                    toy ? Number(toy.netto) : '-',
                    toy?.labResult?.grade || '-',
                    toy?.labResult?.moisture ? Number(toy.labResult.moisture) : '-',
                    toy?.labResult?.trash ? Number(toy.labResult.trash) : '-',
                    toy?.labResult?.strength ? Number(toy.labResult.strength) : '-'
                ]);
            }

            // Footer (Totals)
            const footerRow = sheet.addRow(['JAMI:', totalBrutto.toFixed(1), totalTara.toFixed(1), totalNetto.toFixed(1), '', '', '', '']);
            footerRow.eachCell(cell => {
                cell.font = { bold: true };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
            });

            sheet.getColumn(1).width = 10;
            sheet.getColumn(2).width = 12;
            sheet.getColumn(3).width = 12;
            sheet.getColumn(4).width = 12;
            sheet.getColumn(5).width = 12;
            sheet.getColumn(6).width = 12;
            sheet.getColumn(7).width = 12;
            sheet.getColumn(8).width = 15;

            sheet.autoFilter = 'A2:H2';
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Markalar_Summary_${Date.now()}.xlsx"`);
        await workbook.xlsx.write(res);
        res.end();
    }
}
