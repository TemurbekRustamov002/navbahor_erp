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

    /**
     * Generate Packing List (Excel) for a Shipment
     */
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

        if (!shipment) throw new NotFoundException('Shipment topilmadi');

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Packing List');

        // Title
        sheet.mergeCells('A1:H1');
        sheet.getCell('A1').value = `PACKING LIST - ${shipment.trackingNumber}`;
        sheet.getCell('A1').font = { size: 16, bold: true };
        sheet.getCell('A1').alignment = { horizontal: 'center' };

        // Info
        sheet.addRow(['Mijoz:', shipment.order.customerName || 'N/A']);
        sheet.addRow(['Haydovchi:', shipment.driverName]);
        sheet.addRow(['Transport:', `${shipment.vehicleNo} (${shipment.vehicleType})`]);
        sheet.addRow(['Sana:', shipment.loadedAt ? new Date(shipment.loadedAt).toLocaleDateString() : 'N/A']);
        sheet.addRow([]);

        // Headers
        const headerRow = sheet.addRow(['№', 'Toy ID', 'Marka', 'Class', 'Netto (kg)', 'Brutto (kg)', 'Namlik %', 'Ifloslik %']);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };

        // Data
        let totalNetto = 0;
        let totalBrutto = 0;

        shipment.order.items.forEach((item, index) => {
            const labData = item.labData as any || {};
            const netto = Number(item.netto);
            const brutto = netto + 1.2; // Approx brutto if not stored

            totalNetto += netto;
            totalBrutto += brutto;

            sheet.addRow([
                index + 1,
                item.toyId.substring(0, 8),
                item.markaId ? 'See Marka' : '-', // Optimize if needed
                item.productType,
                netto,
                brutto.toFixed(2),
                labData.mic || '-',
                labData.trash || '-'
            ]);
        });

        // Totals
        const totalRow = sheet.addRow(['JAMI', '', '', '', totalNetto.toFixed(2), totalBrutto.toFixed(2), '', '']);
        totalRow.font = { bold: true };

        // Adjust widths
        sheet.columns = [
            { width: 5 }, { width: 15 }, { width: 15 }, { width: 10 }, { width: 15 }, { width: 15 }, { width: 10 }, { width: 10 }
        ];

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="PackingList_${shipment.trackingNumber}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();
    }

    /**
     * Generate Waybill (Yuk Xati) PDF
     */
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

        if (!shipment) throw new NotFoundException('Shipment topilmadi');

        const totalWeight = shipment.order.items.reduce((sum, item) => sum + Number(item.netto), 0);
        const totalCount = shipment.order.items.length;

        const printer = new PdfPrinter(fonts);

        const docDefinition: TDocumentDefinitions = {
            content: [
                { text: 'YUK XATI (WAYBILL)', style: 'header', alignment: 'center', margin: [0, 0, 0, 20] },

                {
                    columns: [
                        {
                            width: '*',
                            text: [
                                { text: 'Yuboruvchi:\n', bold: true },
                                'NAVBAHOR TEXTILE MCHJ\n',
                                'O\'zbekiston, Namangan vil., Navbahor tumani\n',
                                'Tel: +998 90 123 45 67'
                            ]
                        },
                        {
                            width: '*',
                            text: [
                                { text: 'Qabul Qiluvchi:\n', bold: true },
                                `${shipment.order.customerName}\n`,
                                `Manzil: ${shipment.destinationAddress || 'Ko\'rsatilmagan'}\n`
                            ]
                        }
                    ]
                },

                { text: '\n' },

                {
                    style: 'tableExample',
                    table: {
                        widths: ['*', '*'],
                        body: [
                            [{ text: 'Yuk Xati Raqami:', bold: true }, shipment.forwarder || '-'],
                            [{ text: 'Kuzatuv Raqami:', bold: true }, shipment.trackingNumber || '-'],
                            [{ text: 'Sana:', bold: true }, shipment.loadedAt ? new Date(shipment.loadedAt).toLocaleDateString() : '-'],
                            [{ text: 'Transport:', bold: true }, `${shipment.vehicleNo} (${shipment.vehicleType})`],
                            [{ text: 'Haydovchi:', bold: true }, `${shipment.driverName} (${shipment.driverPhone})`],
                            [{ text: 'Guvohnoma:', bold: true }, shipment.driverLicense || '-']
                        ]
                    }
                },

                { text: '\nYUK TAVSIFI\n', style: 'subheader' },

                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            [{ text: 'Mahsulot Nomi', bold: true }, { text: 'Soni (dona)', bold: true }, { text: 'Sof Og\'irligi (kg)', bold: true }, { text: 'Brutto Og\'irligi (kg)', bold: true }],
                            ['Paxta Tolasi (Cotton Fiber)', totalCount, totalWeight.toFixed(2), (totalWeight * 1.02).toFixed(2)] // Approx brutto for summary
                        ]
                    },
                    layout: 'lightHorizontalLines'
                },

                { text: '\n\n\n' },

                {
                    columns: [
                        {
                            width: '*',
                            text: 'Yuboruvchi Imzosi:\n\n__________________________'
                        },
                        {
                            width: '*',
                            text: 'Haydovchi Imzosi:\n\n__________________________'
                        },
                        {
                            width: '*',
                            text: 'Qabul Qiluvchi Imzosi:\n\n__________________________'
                        }
                    ]
                }
            ],
            styles: {
                header: { fontSize: 22, bold: true },
                subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
                tableExample: { margin: [0, 5, 0, 15] }
            },
            defaultStyle: {
                font: 'Roboto'
            }
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Waybill_${shipment.trackingNumber}.pdf`);

        pdfDoc.pipe(res);
        pdfDoc.end();
    }
}
