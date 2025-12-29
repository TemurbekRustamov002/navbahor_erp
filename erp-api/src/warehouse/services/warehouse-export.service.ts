import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

const fonts = {
    Roboto: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
    },
};

@Injectable()
export class WarehouseExportService {
    constructor(private prisma: PrismaService) { }

    async generatePackingList(res: Response, shipmentId: string) {
        const shipment = await this.prisma.shipment.findUnique({
            where: { id: shipmentId },
            include: {
                order: {
                    include: {
                        items: true
                    }
                }
            }
        });

        if (!shipment) throw new NotFoundException('Yuklov topilmadi');

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Packing List', {
            views: [{ state: 'frozen', ySplit: 8 }]
        });

        // --- STYLES ---
        const brandFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
        const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
        const stripeFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        const borderStyle: Partial<ExcelJS.Borders> = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };

        // --- HEADER ---
        sheet.mergeCells('A1:H2');
        const titleCell = sheet.getCell('A1');
        titleCell.value = 'NAVBAHOR TEXTILE ERP - PACKING LIST (OʻRAMLAR ROʻYXATI)';
        titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        titleCell.fill = brandFill;

        // --- INFO SECTION ---
        sheet.getCell('A4').value = 'MIJOZ:';
        sheet.getCell('A4').font = { bold: true, color: { argb: 'FF64748B' } };
        sheet.getCell('B4').value = shipment.order.customerName || 'N/A';

        sheet.getCell('A5').value = 'HAYDOVCHI:';
        sheet.getCell('A5').font = { bold: true, color: { argb: 'FF64748B' } };
        sheet.getCell('B5').value = shipment.driverName;

        sheet.getCell('D4').value = 'TRANSPORT:';
        sheet.getCell('D4').font = { bold: true, color: { argb: 'FF64748B' } };
        sheet.getCell('E4').value = `${shipment.vehicleNo} (${shipment.vehicleType})`;

        sheet.getCell('D5').value = 'KUZATUV №:';
        sheet.getCell('D5').font = { bold: true, color: { argb: 'FF64748B' } };
        sheet.getCell('E5').value = shipment.trackingNumber;

        sheet.getCell('G4').value = 'SANA:';
        sheet.getCell('G4').font = { bold: true, color: { argb: 'FF64748B' } };
        sheet.getCell('H4').value = shipment.loadedAt ? new Date(shipment.loadedAt).toLocaleDateString('uz-UZ') : '';

        // --- TABLE HEADERS ---
        const headers = ['№', 'Toy ID (QR)', 'Marka', 'Mahsulot Turi', 'Netto (kg)', 'Brutto (kg)', 'Namlik %', 'Ifloslik %'];
        const headerRow = sheet.addRow(headers);
        headerRow.height = 25;
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
            cell.fill = headerFill;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = borderStyle;
        });

        // --- DATA ---
        let totalNetto = 0;
        let totalBrutto = 0;

        shipment.order.items.forEach((item, index) => {
            const netto = Number(item.netto);
            const brutto = netto + 1.2;
            totalNetto += netto;
            totalBrutto += brutto;

            const row = sheet.addRow([
                index + 1,
                item.toyId,
                item.markaId ? `M-${item.markaId.split('-')[0]}` : '-',
                item.productType,
                netto,
                Number(brutto.toFixed(2)),
                (item.labData as any)?.mic || '-',
                (item.labData as any)?.trash || '-'
            ]);

            row.eachCell((c, i) => {
                c.border = borderStyle;
                c.alignment = { vertical: 'middle', horizontal: 'center' };
                if (index % 2 === 0) c.fill = stripeFill;
            });
        });

        // --- TOTALS ---
        const footerRow = sheet.addRow(['JAMI', '', '', '', totalNetto, Number(totalBrutto.toFixed(2)), '', '']);
        footerRow.eachCell(c => {
            c.font = { bold: true, size: 11 };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        });

        // --- FINAL TOUCHES ---
        sheet.columns.forEach((col, i) => {
            col.width = i === 1 ? 25 : i === 0 ? 5 : 12;
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="PackingList_${shipment.trackingNumber}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();
    }

    async generateWaybill(res: Response, shipmentId: string) {
        const shipment = await this.prisma.shipment.findUnique({
            where: { id: shipmentId },
            include: {
                order: {
                    include: {
                        items: true
                    }
                }
            }
        });

        if (!shipment) throw new NotFoundException('Yuklov topilmadi');

        const totalWeight = shipment.order.items.reduce((sum, item) => sum + Number(item.netto), 0);
        const totalCount = shipment.order.items.length;

        const printer = new PdfPrinter(fonts);

        const docDefinition: TDocumentDefinitions = {
            content: [
                {
                    columns: [
                        { text: 'NAVBAHOR TEXTILE ERP', style: 'brandLogo' },
                        { text: 'YUK XATI / WAYBILL', style: 'header', alignment: 'right' }
                    ]
                },
                { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#e2e8f0' }] },
                { text: '\n\n' },
                {
                    columns: [
                        {
                            width: '*',
                            stack: [
                                { text: 'YUBORUVCHI (SENDER):', style: 'infoLabel' },
                                { text: 'NAVBAHOR TEXTILE MCHJ', style: 'infoValue' },
                                { text: 'O\'zbekiston, Namangan vil., Navbahor tumani', style: 'infoText' },
                                { text: 'Tel: +998 69 123 45 67', style: 'infoText' }
                            ]
                        },
                        {
                            width: '*',
                            stack: [
                                { text: 'QABUL QILUVCHI (CONSIGNEE):', style: 'infoLabel' },
                                { text: shipment.order.customerName || 'N/A', style: 'infoValue' },
                                { text: `Manzil: ${shipment.destinationAddress || '-'}`, style: 'infoText' }
                            ]
                        }
                    ]
                },
                { text: '\n\n' },
                {
                    style: 'tableExample',
                    table: {
                        widths: ['*', '*', '*', '*'],
                        body: [
                            [
                                { text: 'Tracking №', style: 'tableHeader' },
                                { text: 'Sana', style: 'tableHeader' },
                                { text: 'Transport №', style: 'tableHeader' },
                                { text: 'Haydovchi', style: 'tableHeader' }
                            ],
                            [
                                String(shipment.trackingNumber || '-'),
                                shipment.loadedAt ? new Date(shipment.loadedAt).toLocaleDateString('uz-UZ') : '-',
                                String(shipment.vehicleNo || '-'),
                                String(shipment.driverName || '-')
                            ]
                        ]
                    }
                },
                { text: '\n\n' },
                { text: 'YUK TAVSIFI / CARGO DESCRIPTION', style: 'sectionHeader' },
                {
                    table: {
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'Mahsulot Nomi', style: 'tableHeader' },
                                { text: 'Soni (Toy)', style: 'tableHeader' },
                                { text: 'Netto (kg)', style: 'tableHeader' },
                                { text: 'Brutto (kg)', style: 'tableHeader' }
                            ],
                            [
                                'Paxta Tolasi (Cotton Fiber)',
                                totalCount.toString(),
                                totalWeight.toFixed(1),
                                (totalWeight + (totalCount * 1.2)).toFixed(1)
                            ]
                        ]
                    }
                },
                { text: '\n\n\n\n' },
                {
                    columns: [
                        { stack: [{ text: 'Yuboruvchi:', style: 'signLabel' }, { text: '\n\n__________________', style: 'signLine' }] },
                        { stack: [{ text: 'Haydovchi:', style: 'signLabel' }, { text: '\n\n__________________', style: 'signLine' }] },
                        { stack: [{ text: 'Qabul qiluvchi:', style: 'signLabel' }, { text: '\n\n__________________', style: 'signLine' }] }
                    ]
                }
            ],
            styles: {
                brandLogo: { fontSize: 18, bold: true, color: '#4f46e5' },
                header: { fontSize: 18, bold: true, color: '#1e293b' },
                sectionHeader: { fontSize: 10, bold: true, margin: [0, 10, 0, 5], color: '#64748b' },
                infoLabel: { fontSize: 8, color: '#64748b', bold: true },
                infoValue: { fontSize: 12, bold: true, margin: [0, 2, 0, 2] },
                infoText: { fontSize: 10, color: '#475569' },
                tableHeader: { fontSize: 10, bold: true, fillColor: '#f8fafc', margin: [5, 5, 5, 5] },
                signLabel: { fontSize: 10, bold: true },
                signLine: { fontSize: 12 }
            },
            defaultStyle: { font: 'Roboto' }
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Waybill_${shipment.trackingNumber}.pdf`);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }
}
