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
export class LabExportService {
    constructor(private prisma: PrismaService) { }

    /**
     * Export Lab Results to Excel
     */
    async exportResultsToExcel(res: Response, query: any) {
        const { from, to, status } = query;
        const where: any = {};
        if (status) where.status = status;
        if (from && to) {
            where.createdAt = {
                gte: new Date(from),
                lte: new Date(to)
            };
        }

        const results = await this.prisma.labResult.findMany({
            where,
            include: {
                toy: {
                    include: { marka: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 2000 // Increased limit
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Laboratoriya Natijalari');

        // Styles
        const headerStyle: Partial<ExcelJS.Style> = {
            font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }, // Slate-800
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }
        };

        // Headers
        const headerLabels = [
            'Sana', 'Toy ID', 'Marka No', 'Mahsulot', 'Navi', 'Sinf',
            'Namlik (%)', 'Ifloslik (%)', 'Mikroneyr', 'Uzunlik (mm)',
            'Mustahkamlik', 'Tahlilchi', 'Izoh'
        ];
        const headerRow = sheet.addRow(headerLabels);
        headerRow.height = 25;
        headerRow.eachCell((cell) => {
            cell.style = headerStyle as ExcelJS.Style;
        });

        // Data
        results.forEach(result => {
            const row = sheet.addRow([
                new Date(result.createdAt).toLocaleDateString('uz-UZ'),
                result.toy?.orderNo || result.toyId.substring(0, 8),
                result.toy?.marka?.number,
                result.toy?.productType,
                result.navi,
                result.grade,
                Number(result.moisture),
                Number(result.trash),
                Number((result as any).micronaire || 0),
                Number(result.lengthMm),
                Number(result.strength),
                (result as any).operatorName || '-',
                result.comment || ''
            ]);
            row.alignment = { vertical: 'middle', horizontal: 'left' };
        });

        // Auto filter and column widths
        sheet.autoFilter = { from: 'A1', to: { row: 1, column: headerLabels.length } };
        sheet.columns = [
            { width: 15 }, // Sana
            { width: 12 }, // Toy ID
            { width: 12 }, // Marka No
            { width: 15 }, // Mahsulot
            { width: 8 },  // Navi
            { width: 10 }, // Sinf
            { width: 12 }, // Namlik
            { width: 12 }, // Ifloslik
            { width: 12 }, // Mikroneyr
            { width: 15 }, // Uzunlik
            { width: 15 }, // Mustahkamlik
            { width: 20 }, // Tahlilchi
            { width: 30 }, // Izoh
        ];

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Navbahor_Lab_${Date.now()}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();
    }

    /**
     * Generate Quality Certificate (PDF)
     */
    async generateCertificate(res: Response, toyId: string) {
        const result = await this.prisma.labResult.findUnique({
            where: { toyId: toyId },
            include: {
                toy: {
                    include: { marka: true }
                }
            }
        });

        if (!result) throw new NotFoundException('Laboratoriya natijasi topilmadi');

        const printer = new PdfPrinter(fonts);

        const docDefinition: TDocumentDefinitions = {
            pageSize: 'A5',
            pageOrientation: 'portrait',
            pageMargins: [30, 30, 30, 30],
            content: [
                // Header with simulated logo area
                {
                    columns: [
                        {
                            text: 'NAVBAHOR TEKSTIL',
                            style: 'brand',
                            width: '*'
                        },
                        {
                            text: 'LABORATORIYA\nHISOBOTI',
                            style: 'reportTitle',
                            alignment: 'right',
                            width: 'auto'
                        }
                    ]
                },
                { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 360, y2: 5, lineWidth: 2, lineColor: '#1e293b' }] },
                { text: '\n' },

                { text: 'SIFAT SERTIFIKATI / QUALITY CERTIFICATE', style: 'header', alignment: 'center', margin: [0, 10, 0, 15] },

                // Info Section
                {
                    style: 'infoTable',
                    table: {
                        widths: ['auto', '*'],
                        body: [
                            [{ text: 'Mahsulot / Product:', style: 'label' }, { text: String(result.toy.productType), style: 'value' }],
                            [{ text: 'Marka / Batch:', style: 'label' }, { text: `M-${result.toy.marka.number}`, style: 'value' }],
                            [{ text: 'Toy № / Bale No:', style: 'label' }, { text: String(result.toy.orderNo), style: 'value' }],
                            [{ text: 'Sana / Date:', style: 'label' }, { text: new Date(result.createdAt).toLocaleDateString('uz-UZ'), style: 'value' }]
                        ]
                    },
                    layout: 'noBorders'
                },

                { text: '\n' },
                { text: 'TAHLIL NATIJALARI / ANALYSIS RESULTS', style: 'sectionHeader' },
                { canvas: [{ type: 'line', x1: 0, y1: 2, x2: 150, y2: 2, lineWidth: 1, lineColor: '#cbd5e1' }] },
                { text: '\n' },

                // Results Table
                {
                    style: 'resultsTable',
                    table: {
                        widths: ['*', '*'],
                        body: [
                            [{ text: 'Navi (Type)', style: 'tableLabel' }, { text: String(result.navi), style: 'tableValue' }],
                            [{ text: 'Sinf (Grade)', style: 'tableLabel' }, { text: String(result.grade), style: 'tableValue' }],
                            [{ text: 'Namlik (Moisture)', style: 'tableLabel' }, { text: `${result.moisture} %`, style: 'tableValue' }],
                            [{ text: 'Ifloslik (Trash)', style: 'tableLabel' }, { text: `${result.trash} %`, style: 'tableValue' }],
                            [{ text: 'Mikroneyr (Mic)', style: 'tableLabel' }, { text: String((result as any).micronaire || '-'), style: 'tableValue' }],
                            [{ text: 'Uzunlik (Length)', style: 'tableLabel' }, { text: `${result.lengthMm} mm`, style: 'tableValue' }],
                            [{ text: 'Mustahkamlik (Strength)', style: 'tableLabel' }, { text: `${result.strength} g/tex`, style: 'tableValue' }]
                        ]
                    },
                    layout: {
                        hLineWidth: (i) => (i === 0 || i === 7 ? 0 : 0.5),
                        vLineWidth: () => 0,
                        hLineColor: () => '#e2e8f0',
                        paddingTop: () => 6,
                        paddingBottom: () => 6,
                    }
                },

                { text: '\n\n' },
                {
                    columns: [
                        {
                            stack: [
                                { text: 'MAS\'UL SHAXS / RESPONSIBLE:', style: 'footerLabel' },
                                { text: (result as any).operatorName || 'LAB-EXPERT', style: 'footerValue' }
                            ]
                        },
                        {
                            stack: [
                                { text: 'TASDIQLANDI / APPROVED:', style: 'footerLabel', alignment: 'right' },
                                { text: '\n___________________', alignment: 'right' }
                            ]
                        }
                    ]
                }
            ],
            styles: {
                brand: { fontSize: 14, bold: true, color: '#0f172a' },
                reportTitle: { fontSize: 10, bold: true, color: '#64748b' },
                header: { fontSize: 16, bold: true, color: '#1e293b' },
                sectionHeader: { fontSize: 10, bold: true, color: '#334155' },
                label: { fontSize: 10, color: '#64748b', bold: true },
                value: { fontSize: 10, color: '#0f172a', bold: true },
                tableLabel: { fontSize: 10, color: '#475569', margin: [0, 2, 0, 2] },
                tableValue: { fontSize: 11, bold: true, color: '#0f172a', alignment: 'right' },
                footerLabel: { fontSize: 8, color: '#94a3b8', bold: true },
                footerValue: { fontSize: 10, bold: true, color: '#1e293b', margin: [0, 2, 0, 0] }
            },
            defaultStyle: {
                font: 'Roboto'
            }
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Certificate_${result.toy.orderNo || result.toy.id.substring(0, 8)}.pdf`);

        pdfDoc.pipe(res);
        pdfDoc.end();
    }
}
