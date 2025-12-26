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
export class CustomersExportService {
    constructor(private prisma: PrismaService) { }

    /**
     * Export all customers to Excel
     */
    async exportCustomersToExcel(res: Response) {
        const customers = await this.prisma.customer.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Mijozlar Ro\'yxati');

        // Headers
        const headerRow = sheet.addRow(['Mijoz Nomi', 'INN', 'Direktor', 'Telefon', 'Email', 'Manzil', 'Bank', 'Hiso-raqam', 'MFO', 'Status']);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };

        // Data
        customers.forEach(customer => {
            sheet.addRow([
                customer.name,
                customer.tin || '-',
                customer.director || '-',
                customer.contactPhone || '-',
                customer.contactEmail || '-',
                customer.address || '-',
                customer.bankName || '-',
                customer.bankAccount || '-',
                customer.mfo || '-',
                customer.isActive ? 'Faol' : 'Nofaol'
            ]);
        });

        sheet.columns.forEach(col => { col.width = 20; });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="Mijozlar_Royxati.xlsx"');

        await workbook.xlsx.write(res);
        res.end();
    }

    /**
     * Generate Customer Profile/Contract (PDF)
     */
    async generateCustomerProfile(res: Response, customerId: string) {
        const customer = await (this.prisma.customer as any).findUnique({
            where: { id: customerId },
            include: {
                orders: {
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!customer) throw new NotFoundException('Mijoz topilmadi');

        const printer = new PdfPrinter(fonts);

        const docDefinition: TDocumentDefinitions = {
            content: [
                { text: 'MIJOZ PASPORTI (CUSTOMER PROFILE)', style: 'header', alignment: 'center', margin: [0, 0, 0, 20] },

                {
                    style: 'tableExample',
                    table: {
                        widths: ['30%', '70%'],
                        body: [
                            [{ text: 'To\'liq nomi:', bold: true }, customer.legalName || customer.name],
                            [{ text: 'INN:', bold: true }, customer.tin || '-'],
                            [{ text: 'Direktor:', bold: true }, customer.director || '-'],
                            [{ text: 'Manzil:', bold: true }, customer.address || '-'],
                            [{ text: 'Telefon:', bold: true }, customer.contactPhone || '-'],
                            [{ text: 'Email:', bold: true }, customer.contactEmail || '-'],
                            [{ text: 'Bank:', bold: true }, customer.bankName || '-'],
                            [{ text: 'Hiso-raqam:', bold: true }, customer.bankAccount || '-'],
                            [{ text: 'MFO / OKED:', bold: true }, `${customer.mfo || '-'} / ${customer.oked || '-'}`]
                        ]
                    },
                    layout: 'lightHorizontalLines'
                },

                { text: '\nOXIRGI BUYURTMALAR\n', style: 'subheader' },

                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', '*', 'auto', 'auto'],
                        body: [
                            [{ text: '№', bold: true }, { text: 'Buyurtma No', bold: true }, { text: 'Sana', bold: true }, { text: 'Status', bold: true }],
                            ...((customer as any).orders.map((order: any, idx: number) => [
                                idx + 1,
                                order.number,
                                new Date(order.createdAt).toLocaleDateString(),
                                order.status
                            ]))
                        ]
                    }
                },

                { text: '\n\n' },
                { text: 'Sana: ' + new Date().toLocaleDateString(), alignment: 'left' },
                { text: 'Mijoz Imzosi: __________________________', alignment: 'right', margin: [0, 20, 0, 0] }
            ],
            styles: {
                header: { fontSize: 22, bold: true, color: '#2C3E50' },
                subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] },
                tableExample: { margin: [0, 5, 0, 15] }
            },
            defaultStyle: {
                font: 'Roboto'
            }
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Customer_${customer.name.replace(/\s+/g, '_')}.pdf`);

        pdfDoc.pipe(res);
        pdfDoc.end();
    }
}
