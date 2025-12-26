import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

export interface MarkaExportOptions {
  format: 'pdf' | 'excel';
  includeDetails?: boolean;
  includeToys?: boolean;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  productTypes?: string[];
  statuses?: string[];
}

const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
};

@Injectable()
export class MarkaExportService {
  constructor(private prisma: PrismaService) { }

  /**
   * Export markas to Excel format with corporate styling
   */
  async exportMarkasToExcel(res: Response, markaIds: string[] | undefined, options: MarkaExportOptions) {
    const where = markaIds ? { id: { in: markaIds } } : {};

    const markas = await this.prisma.marka.findMany({
      where,
      include: {
        toys: options?.includeToys ? {
          include: { labResult: true },
          orderBy: { orderNo: 'asc' }
        } : false,
        _count: { select: { toys: true } }
      },
      orderBy: { number: 'asc' }
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Navbahor ERP';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Markalar');

    // Headers
    const headers = [
      'Marka Raqami',
      'Mahsulot Turi',
      'Sex',
      'Bo\'lim',
      'Seleksiya',
      'PTM',
      'Status',
      'Jami Toylar',
      'Ishlatilgan',
      'Yaratilgan Sana'
    ];

    if (options.includeToys) {
      headers.push('Toy ID', 'Toy №', 'Netto', 'Brutto', 'Lab Class');
    }

    const headerRow = sheet.addRow(headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2C3E50' } // Corporate Blue
    };

    // Auto-filter
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: headers.length }
    };

    // Data
    for (const marka of markas) {
      const baseRow = [
        marka.number,
        marka.productType,
        marka.sex,
        marka.department,
        marka.selection || '-',
        marka.ptm || '-',
        marka.status,
        marka._count.toys,
        marka.used,
        new Date(marka.createdAt).toLocaleDateString('uz-UZ')
      ];

      if (options.includeToys && marka.toys && markas.length < 500) { // Limit details for huge exports
        if (marka.toys.length === 0) {
          sheet.addRow([...baseRow, '', '', '', '', '']);
        } else {
          for (const toy of marka.toys) {
            sheet.addRow([
              ...baseRow,
              toy.id.substring(0, 8),
              toy.orderNo,
              Number(toy.netto),
              Number(toy.brutto),
              (toy as any).labResult?.grade || 'N/A'
            ]);
          }
        }
      } else {
        sheet.addRow(baseRow);
      }
    }

    // Adjust columns
    sheet.columns.forEach(column => {
      column.width = 15;
      column.alignment = { wrapText: true, vertical: 'middle', horizontal: 'left' };
    });

    // Formatting totals row if needed (omitted for brevity)

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Markalar_Export_${Date.now()}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Export single High-Quality PDF Report for Marka
   */
  async exportMarkaDetailsPdf(res: Response, markaId: string) {
    const marka = await this.prisma.marka.findUnique({
      where: { id: markaId },
      include: {
        toys: {
          include: { labResult: true },
          orderBy: { orderNo: 'asc' }
        },
        _count: { select: { toys: true } }
      }
    });

    if (!marka) {
      throw new Error('Marka topilmadi');
    }

    const printer = new PdfPrinter(fonts);

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'NAVBAHOR TEXTILE', style: 'header', alignment: 'center', color: '#1565C0', margin: [0, 0, 0, 10] },
        { text: 'MARKA PASPORTI', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 20] },

        // Marka Info Table
        {
          style: 'tableExample',
          table: {
            widths: ['*', '*'],
            body: [
              [{ text: 'Marka Raqami:', bold: true }, marka.number],
              [{ text: 'Mahsulot Turi:', bold: true }, marka.productType],
              [{ text: 'Sex / Bo\'lim:', bold: true }, `${marka.sex} / ${marka.department}`],
              [{ text: 'Seleksiya:', bold: true }, marka.selection || '-'],
              [{ text: 'PTM:', bold: true }, marka.ptm || '-'],
              [{ text: 'Jami Toylar:', bold: true }, marka._count.toys.toString()],
              [{ text: 'Status:', bold: true }, marka.status],
              [{ text: 'Sana:', bold: true }, new Date(marka.createdAt).toLocaleDateString('uz-UZ')]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 20]
        },

        { text: 'Toylar Ro\'yxati', style: 'sectionHeader', margin: [0, 10, 0, 10] },

        // Toys Table
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', '*', '*', 'auto'],
            body: [
              [
                { text: '№', style: 'tableHeader' },
                { text: 'ID', style: 'tableHeader' },
                { text: 'Netto (kg)', style: 'tableHeader' },
                { text: 'Brutto (kg)', style: 'tableHeader' },
                { text: 'Lab Class', style: 'tableHeader' },
                { text: 'Sana', style: 'tableHeader' }
              ],
              ...marka.toys.map(toy => [
                toy.orderNo.toString(),
                toy.id.substring(0, 8),
                Number(toy.netto).toFixed(2),
                Number(toy.brutto).toFixed(2),
                (toy as any).labResult?.grade || '-',
                new Date(toy.createdAt).toLocaleDateString('uz-UZ')
              ])
            ]
          },
          layout: {
            fillColor: function (rowIndex: number) {
              return (rowIndex === 0) ? '#CCCCCC' : null;
            }
          }
        },

        { text: '\n\n' },
        { text: 'Imzo: __________________________', alignment: 'right', margin: [0, 40, 40, 0] }
      ],
      styles: {
        header: { fontSize: 22, bold: true },
        subheader: { fontSize: 16, bold: true },
        sectionHeader: { fontSize: 14, bold: true, color: '#444' },
        tableHeader: { bold: true, fontSize: 12, color: 'black' },
        tableExample: { margin: [0, 5, 0, 15] }
      },
      defaultStyle: {
        font: 'Roboto'
      }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Marka_${marka.number}_Passport.pdf`);

    pdfDoc.pipe(res);
    pdfDoc.end();
  }

  async generateMarkaQRCode(markaId: string): Promise<string> {
    const marka = await this.prisma.marka.findUnique({
      where: { id: markaId }
    });

    if (!marka) {
      throw new Error('Marka topilmadi');
    }

    // Simplified QR code - base64 placeholder
    const qrData = `MARKA:${marka.number}:${marka.productType}:${marka.id}`;
    const base64QR = Buffer.from(qrData).toString('base64');
    return `data:image/png;base64,${base64QR}`;
  }

  // Keep existing Label Generator (ZPL)
  async generateMarkaLabel(markaId: string): Promise<string> {
    const marka = await this.prisma.marka.findUnique({
      where: { id: markaId },
      include: { _count: { select: { toys: true } } }
    });

    if (!marka) {
      throw new Error('Marka topilmadi');
    }

    const qrCodeData = `MARKA:${marka.number}:${marka.productType}:${marka.id}`;

    let labelContent = `^XA\n`; // Start label
    labelContent += `^MMT\n`; // Set media type
    labelContent += `^PW400\n`; // Set print width
    labelContent += `^LL200\n`; // Set label length
    labelContent += `^FO50,20^A0N,30,30^FD MARKA ${marka.number}^FS\n`;
    labelContent += `^FO50,60^A0N,20,20^FD${marka.productType}^FS\n`;
    labelContent += `^FO200,60^A0N,20,20^FD${marka.sex}^FS\n`;
    if (marka.selection) labelContent += `^FO50,85^A0N,15,15^FDSel: ${marka.selection}^FS\n`;
    labelContent += `^FO50,110^A0N,15,15^FDSig'im: ${marka.used}/${marka.capacity}^FS\n`;
    labelContent += `^FO200,110^A0N,15,15^FD${marka.status}^FS\n`;
    labelContent += `^FO280,20^BQN,2,4^FDLA,${qrCodeData}^FS\n`;
    const date = new Date(marka.createdAt).toLocaleDateString('uz-UZ');
    labelContent += `^FO50,135^A0N,12,12^FD${date}^FS\n`;
    labelContent += `^XZ\n`; // End label
    return labelContent;
  }
}
