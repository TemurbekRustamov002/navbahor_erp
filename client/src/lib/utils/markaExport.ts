import { markasService } from '../services/markas.service';
import { downloadFile } from './export';
import * as XLSX from 'xlsx';
import type { Marka } from '@/types/marka';

/**
 * Generate Excel workbook for markas
 */
function generateMarkasExcelWorkbook(markas: Marka[]): Blob {
  const wb = XLSX.utils.book_new();

  // Prepare data for Excel
  const data = markas.map((marka, index) => ({
    '#': index + 1,
    'Raqam': marka.number,
    'Mahsulot turi': marka.productType,
    'Sex': marka.sex || '-',
    'Bo\'lim': marka.department,
    'Seleksiya': marka.selection || '-',
    'PTM': marka.ptm || '-',
    'Terim turi': marka.pickingType || '-',
    'Sig\'im': marka.capacity,
    'Ishlatilgan': marka.used,
    'Qolgan': marka.capacity - marka.used,
    'Status': marka.status,
    'Tarozida ko\'rinadi': marka.showOnScale ? 'Ha' : 'Yo\'q',
    'Izoh': marka.notes || '-',
    'Yaratgan': marka.createdBy || '-',
    'Yaratilgan sana': new Date(marka.createdAt).toLocaleDateString('uz-UZ'),
    'Yangilangan sana': new Date(marka.updatedAt).toLocaleDateString('uz-UZ')
  }));

  // Create worksheet with title
  const dataArray = XLSX.utils.sheet_to_json(data, { header: 1 }) as any[][];
  const ws = XLSX.utils.aoa_to_sheet([
    ['MAHSULOT MARKALARI RO\'YXATI'], // Title row
    [], // Empty row for spacing
    ...dataArray // Data rows
  ]);

  // Merge title cells
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 16 } }); // Merge A1:Q1 for title

  // Style the title
  const titleCell = ws['A1'];
  if (titleCell) {
    titleCell.s = {
      font: {
        bold: true,
        sz: 16,
        color: { rgb: "FFFFFFFF" }
      },
      fill: { fgColor: { rgb: "FF2E7D32" } }, // Professional green
      alignment: { horizontal: "center", vertical: "center" }
    };
  }

  // Set title row height
  if (!ws['!rows']) ws['!rows'] = [];
  ws['!rows'][0] = { hpt: 30 };
  ws['!rows'][1] = { hpt: 10 }; // Spacing row

  // Set optimized column widths for professional readability
  ws['!cols'] = [
    { wch: 6 },   // #
    { wch: 10 },  // Raqam
    { wch: 18 },  // Mahsulot turi
    { wch: 8 },   // Sex
    { wch: 12 },  // Bo'lim
    { wch: 12 },  // Seleksiya
    { wch: 12 },  // PTM
    { wch: 14 },  // Terim turi
    { wch: 10 },  // Sig'im
    { wch: 12 },  // Ishlatilgan
    { wch: 10 },  // Qolgan
    { wch: 12 },  // Status
    { wch: 18 },  // Tarozida ko'rinadi
    { wch: 25 },  // Izoh
    { wch: 15 },  // Yaratgan
    { wch: 18 },  // Yaratilgan sana
    { wch: 18 }   // Yangilangan sana
  ];

  // Add autofilter (headers in row 3, data starts row 4)
  if (data.length > 0) {
    ws['!autofilter'] = { ref: `A3:Q${data.length + 3}` };
  }

  // Enhanced header styling for professional look (headers are now in row 3, 0-indexed as 2)
  const headerRange = XLSX.utils.decode_range('A3:Q3');
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 2, c: col });
    if (ws[cellAddress]) {
      ws[cellAddress].s = {
        font: {
          bold: true,
          sz: 11,
          color: { rgb: "FF000000" }
        },
        fill: { fgColor: { rgb: "FFE3F2FD" } }, // Light blue background
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
          top: { style: "medium", color: { rgb: "FF1976D2" } },
          bottom: { style: "medium", color: { rgb: "FF1976D2" } },
          left: { style: "thin", color: { rgb: "FF1976D2" } },
          right: { style: "thin", color: { rgb: "FF1976D2" } }
        }
      };
    }
  }

  // Add borders to all data cells (starting from row 4, 0-indexed as 3)
  for (let row = 3; row <= data.length + 2; row++) {
    for (let col = 0; col < 17; col++) { // Q column is 16 (0-indexed)
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!ws[cellAddress]) continue;

      ws[cellAddress].s = {
        ...ws[cellAddress].s,
        border: {
          top: { style: "thin", color: { rgb: "FFBDBDBD" } },
          bottom: { style: "thin", color: { rgb: "FFBDBDBD" } },
          left: { style: "thin", color: { rgb: "FFBDBDBD" } },
          right: { style: "thin", color: { rgb: "FFBDBDBD" } }
        },
        alignment: { vertical: "center" }
      };
    }
  }

  // Set row heights
  ws['!rows'][2] = { hpt: 35 }; // Header row height

  XLSX.utils.book_append_sheet(wb, ws, 'Markalar');

  // Generate blob
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Download file from blob
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Export all markas to Excel (using Backend)
 */
export async function exportAllMarkasToExcel(): Promise<void> {
  try {
    const blob = await markasService.exportMarkasToExcel();
    const dateStr = new Date().toLocaleDateString('uz-UZ').replace(/\./g, '-');
    const filename = `Mahsulot_Markalari_Royxati_${dateStr}.xlsx`;
    downloadBlob(blob, filename);
  } catch (error: any) {
    console.error('Export failed:', error);
    const errorMessage = error.message || 'Excel eksport qilishda xatolik yuz berdi';
    throw new Error(errorMessage);
  }
}

/**
 * Export filtered markas to Excel (using Backend)
 */
export async function exportFilteredMarkasToExcel(filters: any): Promise<void> {
  try {
    const query: any = {
      productType: filters.productType,
      status: filters.status !== 'ALL' && filters.status !== 'all' ? filters.status : undefined,
    };

    const blob = await markasService.exportMarkasToExcel(query);
    const dateStr = new Date().toLocaleDateString('uz-UZ').replace(/\./g, '-');
    const filename = `Filtrlangan_Markalar_${dateStr}.xlsx`;
    downloadBlob(blob, filename);
  } catch (error: any) {
    console.error('Filtered export failed:', error);
    const errorMessage = error.message || 'Filtrlangan markalarni eksport qilishda xatolik yuz berdi';
    throw new Error(errorMessage);
  }
}

/**
 * Export selected markas to Excel (using Backend)
 */
export async function exportSelectedMarkasToExcel(markaIds: string[]): Promise<void> {
  try {
    if (markaIds.length === 0) {
      throw new Error('Hech qanday marka tanlanmagan');
    }

    const blob = await markasService.exportSelectedMarkasToExcel(markaIds);
    const dateStr = new Date().toLocaleDateString('uz-UZ').replace(/\./g, '-');
    const filename = `Tanlangan_Markalar_${markaIds.length}ta_${dateStr}.xlsx`;
    downloadBlob(blob, filename);
  } catch (error: any) {
    console.error('Selected export failed:', error);
    const errorMessage = error.message || 'Tanlangan markalarni eksport qilishda xatolik yuz berdi';
    throw new Error(errorMessage);
  }
}

/**
 * Export single marka passport to PDF
 */
export async function exportMarkaPassportPDF(markaId: string, markaNumber?: number): Promise<void> {
  try {
    const blob = await markasService.exportMarkaPassportPDF(markaId);
    const filename = `marka-${markaNumber || markaId}-passport-${new Date().toISOString().split('T')[0]}.pdf`;
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Marka passport export failed:', error);
    throw new Error('Marka pasportini yaratishda xatolik yuz berdi');
  }
}

/**
 * Download marka label
 */
export async function downloadMarkaLabel(markaId: string, markaNumber?: number): Promise<void> {
  try {
    const blob = await markasService.downloadMarkaLabel(markaId);
    const filename = `marka-${markaNumber || markaId}-label-${new Date().toISOString().split('T')[0]}.zpl`;
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Marka label download failed:', error);
    throw new Error('Marka yorlig\'ini yuklab olishda xatolik yuz berdi');
  }
}

/**
 * Get marka QR code as data URL
 */
export async function getMarkaQRCode(markaId: string): Promise<string> {
  try {
    const result = await markasService.getMarkaQRCode(markaId);
    return result.qrCode;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('QR kod yaratishda xatolik yuz berdi');
  }
}

/**
 * Generate filename with timestamp
 */
export function generateExportFilename(prefix: string, extension: string, suffix?: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const suffixPart = suffix ? `-${suffix}` : '';
  return `${prefix}${suffixPart}-${timestamp}.${extension}`;
}