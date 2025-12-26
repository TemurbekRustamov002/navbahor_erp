import { markasService } from '../services/markas.service';
import { downloadFile } from './export';

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
 * Export all markas to Excel
 */
export async function exportAllMarkasToExcel(): Promise<void> {
  try {
    const blob = await markasService.exportMarkasToExcel();
    const filename = `markalar-${new Date().toISOString().split('T')[0]}.xlsx`;
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Excel eksport qilishda xatolik yuz berdi');
  }
}

/**
 * Export filtered markas to Excel
 */
export async function exportFilteredMarkasToExcel(filters: any): Promise<void> {
  try {
    const query = {
      productType: filters.productTypes?.length === 1 ? filters.productTypes[0] : undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
    };

    const blob = await markasService.exportMarkasToExcel(query);
    const filename = `filtrlangan-markalar-${new Date().toISOString().split('T')[0]}.xlsx`;
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Filtered export failed:', error);
    throw new Error('Filtrlangan markalarni eksport qilishda xatolik yuz berdi');
  }
}

/**
 * Export selected markas to Excel
 */
export async function exportSelectedMarkasToExcel(markaIds: string[]): Promise<void> {
  try {
    if (markaIds.length === 0) {
      throw new Error('Hech qanday marka tanlanmagan');
    }

    const blob = await markasService.exportSelectedMarkasToExcel(markaIds);
    const filename = `tanlangan-markalar-${markaIds.length}-${new Date().toISOString().split('T')[0]}.xlsx`;
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Selected export failed:', error);
    throw new Error('Tanlangan markalarni eksport qilishda xatolik yuz berdi');
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