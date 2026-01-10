import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import * as QRCode from 'qrcode';

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

  async exportMarkasToExcel(res: Response, markaIds: string[] | undefined, options: MarkaExportOptions) {
    const where: any = {};

    if (markaIds && markaIds.length > 0) {
      where.id = { in: markaIds };
    } else {
      // Build where clause from options
      if (options.productTypes && options.productTypes.length > 0) {
        where.productType = { in: options.productTypes };
      }
      if (options.statuses && options.statuses.length > 0) {
        where.status = { in: options.statuses };
      }
      if (options.dateRange) {
        where.createdAt = {};
        if (options.dateRange.from) where.createdAt.gte = options.dateRange.from;
        if (options.dateRange.to) where.createdAt.lte = options.dateRange.to;
      }
    }

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
    const sheet = workbook.addWorksheet('Markalar Ro\'yxati', {
      views: [{ state: 'frozen', ySplit: 5 }]
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

    // --- HEADER SECTION ---
    sheet.mergeCells('A1:J2');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'NAVBAHOR TEXTILE ERP - MARKALAR HISOBOTI';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = brandFill;

    sheet.getCell('A4').value = 'JAMI MARKALAR:';
    sheet.getCell('A4').font = { bold: true, color: { argb: 'FF64748B' } };
    sheet.getCell('B4').value = markas.length;
    sheet.getCell('B4').font = { bold: true };

    sheet.getCell('D4').value = 'EKSPORT SANASI:';
    sheet.getCell('D4').font = { bold: true, color: { argb: 'FF64748B' } };
    sheet.getCell('E4').value = new Date().toLocaleDateString('uz-UZ');

    // --- TABLE HEADERS ---
    const headers = [
      '№',
      'Marka Raqami',
      'Mahsulot Turi',
      'Bo\'lim / Sex',
      'Seleksiya',
      'PTM',
      'Status',
      'Jami Toylar',
      'Ishlatilgan',
      'Yaratilgan Sana'
    ];

    if (options.includeToys) {
      headers.push('Toy №', 'Netto (kg)', 'Sinf (Grade)');
    }

    const headerRow = sheet.addRow(headers);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      cell.fill = headerFill;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = borderStyle;
    });

    // --- DATA ---
    let rowIdx = 1;
    for (const marka of markas) {
      const baseData = [
        rowIdx++,
        `M-${marka.number}`,
        marka.productType,
        `${marka.department} / ${marka.sex || '-'}`,
        marka.selection || '-',
        marka.ptm || '-',
        marka.status,
        marka._count.toys,
        marka.used,
        new Date(marka.createdAt).toLocaleDateString('uz-UZ')
      ];

      if (options.includeToys && marka.toys) {
        if (marka.toys.length === 0) {
          const row = sheet.addRow([...baseData, '-', '-', '-']);
          row.eachCell(c => { c.border = borderStyle; c.alignment = { vertical: 'middle', horizontal: 'center' }; });
        } else {
          for (const toy of marka.toys) {
            const row = sheet.addRow([
              ...baseData,
              toy.orderNo,
              Number(toy.netto),
              (toy as any).labResult?.grade || '-'
            ]);
            row.eachCell(c => { c.border = borderStyle; c.alignment = { vertical: 'middle', horizontal: 'center' }; });
          }
        }
      } else {
        const row = sheet.addRow(baseData);
        row.eachCell(c => { c.border = borderStyle; c.alignment = { vertical: 'middle', horizontal: 'center' }; });
      }
    }

    // --- COL WIDTHS ---
    sheet.columns.forEach((col, i) => {
      col.width = i === 1 ? 15 : i === 3 ? 20 : 12;
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Markalar_${Date.now()}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  }

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

    if (!marka) throw new Error('Marka topilmadi');

    const qrData = `MARKA:${marka.number}:${marka.id}:${marka.pickingType || '-'}:${marka.sex || '-'}`;
    const qrCodeDataURL = await QRCode.toDataURL(qrData);

    const printer = new PdfPrinter(fonts);
    const docDefinition: TDocumentDefinitions = {
      content: [
        {
          columns: [
            {
              stack: [
                { text: 'NAVBAHOR TEXTILE', style: 'header', color: '#4f46e5' },
                { text: 'MARKA PASPORTI (PASSPORT)', style: 'subheader' }
              ]
            },
            {
              image: qrCodeDataURL,
              width: 80,
              alignment: 'right'
            }
          ]
        },
        { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 1, lineColor: '#e2e8f0' }] },
        { text: '\n' },
        {
          style: 'tableExample',
          table: {
            widths: ['*', '*'],
            body: [
              [{ text: 'Marka Raqami:', bold: true }, String(`M-${marka.number}`)],
              [{ text: 'Mahsulot Turi:', bold: true }, String(marka.productType)],
              [{ text: 'Bo\'lim / Sex:', bold: true }, String(`${marka.department} / ${marka.sex || '-'}`)],
              [{ text: 'Seleksiya / PTM:', bold: true }, String(`${marka.selection || '-'} / ${marka.ptm || '-'}`)],
              [{ text: 'Jami Toylar:', bold: true }, String(marka._count.toys)],
              [{ text: 'Status:', bold: true }, String(marka.status)],
              [{ text: 'Yaratilgan Sana:', bold: true }, String(new Date(marka.createdAt).toLocaleString('uz-UZ'))]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 20]
        },
        { text: 'TOYLAR RO\'YXATI', style: 'sectionHeader', margin: [0, 10, 0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', '*', 'auto'],
            body: [
              [
                { text: '№', style: 'tableHeader' },
                { text: 'Toy ID', style: 'tableHeader' },
                { text: 'Brigada', style: 'tableHeader' },
                { text: 'Netto (kg)', style: 'tableHeader' },
                { text: 'Sinf (Grade)', style: 'tableHeader' },
                { text: 'Sana', style: 'tableHeader' }
              ],
              ...marka.toys.map(toy => [
                String(toy.orderNo),
                String(toy.qrUid),
                String((toy as any).brigade || '-'),
                String(Number(toy.netto).toFixed(1)),
                String((toy as any).labResult?.grade || '-'),
                String(new Date(toy.createdAt).toLocaleDateString('uz-UZ'))
              ])
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => (rowIndex === 0 ? '#4f46e5' : null),
          }
        },
        { text: '\n\n' },
        {
          columns: [
            { text: 'Mas\'ul nazoratchi:', bold: true },
            { text: 'Imzo: __________________________', alignment: 'right' }
          ]
        }
      ],
      styles: {
        header: { fontSize: 24, bold: true },
        subheader: { fontSize: 14, bold: true, color: '#64748b' },
        sectionHeader: { fontSize: 12, bold: true },
        tableHeader: { bold: true, color: 'white' }
      },
      defaultStyle: { font: 'Roboto' }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Marka_${marka.number}.pdf`);
    pdfDoc.pipe(res);
    pdfDoc.end();
  }

  async generateMarkaQRCode(markaId: string): Promise<string> {
    const marka = await this.prisma.marka.findUnique({ where: { id: markaId } });
    if (!marka) throw new Error('Marka topilmadi');
    const qrData = `MARKA:${marka.number}:${marka.id}:${marka.pickingType || '-'}:${marka.sex || '-'}`;
    return await QRCode.toDataURL(qrData);
  }

  /**
   * Professional Industrial ZPL Label for Marka
   */
  async generateMarkaLabel(markaId: string): Promise<string> {
    const marka = await this.prisma.marka.findUnique({
      where: { id: markaId },
      include: { _count: { select: { toys: true } } }
    });
    if (!marka) throw new Error('Marka topilmadi');

    const qrData = `MARKA:${marka.number}:${marka.id}:${marka.pickingType || '-'}:${marka.sex || '-'}`;
    const date = new Date(marka.createdAt).toLocaleDateString('uz-UZ');

    let zpl = `^XA\n`;
    zpl += `^CF0,40\n`;
    zpl += `^FO50,50^FDNAVBAHOR TEXTILE^FS\n`;
    zpl += `^CF0,60\n`;
    zpl += `^FO50,110^FDMARKA M-${marka.number}^FS\n`;
    zpl += `^CF0,30\n`;
    zpl += `^FO50,180^FDTuri: ${marka.productType}^FS\n`;
    zpl += `^FO50,220^FDSex: ${marka.department} / ${marka.sex || '-'}^FS\n`;
    zpl += `^FO50,260^FDSana: ${date}^FS\n`;
    zpl += `^FO50,300^FDStatus: ${marka.status}^FS\n`;

    // QR Code
    zpl += `^FO500,100^BQN,2,6^FDLA,${qrData}^FS\n`;
    zpl += `^FO500,280^A0N,20,20^FDSCAN ME^FS\n`;

    zpl += `^XZ`;
    return zpl;
  }
}
