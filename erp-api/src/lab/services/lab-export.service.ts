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
            take: 1000 // Limit for performance
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Laboratoriya Natijalari');

        // Headers
        const headerRow = sheet.addRow(['Sana', 'Toy ID', 'Marka', 'Mahsulot', 'Navi', 'Sinf', 'Namlik %', 'Ifloslik %', 'Uzunlik', 'Mustahkamlik', 'Mikroneyr', 'Labchi']);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };

        // Data
        for (const result of results) {
            sheet.addRow([
                new Date(result.createdAt).toLocaleDateString('uz-UZ'),
                result.toy?.id.substring(0, 8),
                result.toy?.marka?.number,
                result.toy?.productType,
                result.navi,
                result.grade,
                (result as any).moisture,
                (result as any).trash,
                (result as any).lengthMm,
                (result as any).strength,
                (result as any).micronaire,
                (result as any).operatorName
            ]);
        }

        sheet.columns.forEach(col => { col.width = 15; });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Lab_Results_${Date.now()}.xlsx"`);

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
            content: [
                { text: 'SIFAT SERTIFIKATI', style: 'header', alignment: 'center', margin: [0, 0, 0, 10] },
                { text: 'CERTIFICATE OF QUALITY', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 20] },

                {
                    style: 'tableExample',
                    table: {
                        widths: ['*', '*'],
                        body: [
                            [{ text: 'Mahsulot (Product):', bold: true }, result.toy.productType],
                            [{ text: 'Marka (Batch):', bold: true }, result.toy.marka.number],
                            [{ text: 'Toy ID (Bale ID):', bold: true }, result.toy.id],
                            [{ text: 'Sana (Date):', bold: true }, new Date(result.createdAt).toLocaleDateString()]
                        ]
                    },
                    layout: 'noBorders'
                },

                { text: '\n' },

                {
                    style: 'tableExample',
                    table: {
                        widths: ['*', '*'],
                        body: [
                            [{ text: 'Navi (Type):', bold: true }, result.navi],
                            [{ text: 'Sinf (Grade):', bold: true }, result.grade],
                            [{ text: 'Namlik (Moisture):', bold: true }, `${result.moisture} %`],
                            [{ text: 'Ifloslik (Trash):', bold: true }, `${result.trash} %`],
                            [{ text: 'Mikroneyr (Mic):', bold: true }, (result as any).micronaire || '-'],
                            [{ text: 'Uzunlik (Length):', bold: true }, `${result.lengthMm} mm`],
                            [{ text: 'Mustahkamlik (Str):', bold: true }, `${result.strength} g/tex`]
                        ]
                    },
                    layout: 'lightHorizontalLines'
                },

                { text: '\n\n' },
                { text: `Operator: ${(result as any).operatorName || '-'}`, alignment: 'right' },
                { text: 'Tasdiqlandi: ___________________', alignment: 'right', margin: [0, 20, 0, 0] }
            ],
            styles: {
                header: { fontSize: 22, bold: true, color: '#1565C0' },
                subheader: { fontSize: 16, italics: true, color: '#666' },
                tableExample: { margin: [0, 5, 0, 15] }
            },
            defaultStyle: {
                font: 'Roboto'
            }
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Certificate_${result.toy.id.substring(0, 8)}.pdf`);

        pdfDoc.pipe(res);
        pdfDoc.end();
    }
}
