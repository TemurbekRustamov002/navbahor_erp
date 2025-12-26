import { labService } from '../services/lab.service';
import { downloadFile } from './export';
import * as XLSX from 'xlsx';

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
 * Convert lab data to XLSX workbook blob with better design
 */
function convertLabDataToExcel(samples: any[]): Blob {
  // Headers (Uzbek, user friendly)
  const headers = [
    'ID',
    "To'y ID",
    'QR UID',
    'Tartib raqami',
    'Mahsulot turi',
    'Marka',
    'Namlik (%)',
    'Ifloslik (%)',
    'Navi',
    'Sinf',
    'Pishiqligi',
    'Uzunlik (mm)',
    'Izoh',
    'Holati',
    'Omborga ko\'rinishi',
    'Yaratilgan sana',
    'Yangilangan sana',
    'Tahlilchi',
    'Tasdiqlagan'
  ];

  // Prepare rows (Array of Arrays)
  const rows: any[][] = [headers];

  for (const sample of samples) {
    rows.push([
      sample.id ?? '',
      sample.toyId ?? '',
      sample.toy?.qrUid ?? '',
      sample.toy?.orderNo ?? '',
      sample.toy?.productType ?? sample.productType ?? '',
      sample.toy?.markaLabel ?? sample.markaLabel ?? sample.toy?.markaId ?? sample.markaId ?? '',
      typeof sample.moisture === 'number' ? sample.moisture : (sample.moisture ? Number(sample.moisture) : ''),
      typeof sample.trash === 'number' ? sample.trash : (sample.trash ? Number(sample.trash) : ''),
      sample.navi ?? '',
      sample.grade ?? '',
      typeof sample.strength === 'number' ? sample.strength : (sample.strength ? Number(sample.strength) : ''),
      typeof sample.lengthMm === 'number' ? sample.lengthMm : (sample.lengthMm ? Number(sample.lengthMm) : ''),
      sample.comment ?? '',
      getStatusText(sample.status),
      sample.showToWarehouse ? 'Ha' : 'Yo\'q',
      sample.createdAt ? new Date(sample.createdAt) : '',
      sample.updatedAt ? new Date(sample.updatedAt) : '',
      sample.analyst ?? '',
      sample.approver ?? ''
    ]);
  }

  // Create worksheet and workbook
  const ws = XLSX.utils.aoa_to_sheet(rows, { cellDates: true });

  // Column widths (wch ~ character width)
  ws['!cols'] = [
    { wch: 10 }, // ID
    { wch: 10 }, // Toy ID
    { wch: 18 }, // QR UID
    { wch: 14 }, // Tartib raqami
    { wch: 16 }, // Mahsulot turi
    { wch: 18 }, // Marka
    { wch: 12 }, // Namlik
    { wch: 12 }, // Ifloslik
    { wch: 10 }, // Navi
    { wch: 10 }, // Sinf
    { wch: 12 }, // Pishiqligi
    { wch: 12 }, // Uzunlik
    { wch: 24 }, // Izoh
    { wch: 16 }, // Holati
    { wch: 18 }, // Omborga ko'rinishi
    { wch: 18 }, // Yaratilgan sana
    { wch: 18 }, // Yangilangan sana
    { wch: 14 }, // Tahlilchi
    { wch: 14 }, // Tasdiqlagan
  ];

  // AutoFilter for all headers
  const totalRows = rows.length;
  const lastCol = XLSX.utils.encode_col(headers.length - 1); // e.g. R
  ws['!autofilter'] = { ref: `A1:${lastCol}${totalRows}` } as any;

  // Number/date formats: set z property where possible
  // Find column indices for numeric and date columns
  const colIndex = {
    moisture: 6, // 0-based index in headers
    trash: 7,
    strength: 10,
    lengthMm: 11,
    createdAt: 15,
    updatedAt: 16,
  };

  for (let r = 1; r < totalRows; r++) {
    // Moisture, Trash: show with 2 decimals
    for (const key of ['moisture', 'trash'] as const) {
      const c = colIndex[key];
      const cellRef = XLSX.utils.encode_cell({ r, c });
      const cell = ws[cellRef];
      if (cell && typeof cell.v === 'number') {
        cell.z = '0.00';
      }
    }
    // Strength and Length: integer or one decimal
    for (const c of [colIndex.strength, colIndex.lengthMm]) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      const cell = ws[cellRef];
      if (cell && typeof cell.v === 'number') {
        cell.z = '0.0';
      }
    }
    // Dates: dd.mm.yyyy HH:MM
    for (const c of [colIndex.createdAt, colIndex.updatedAt]) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      const cell = ws[cellRef];
      if (cell && (cell.v instanceof Date)) {
        cell.z = 'dd.mm.yyyy hh:mm';
        cell.t = 'd';
      }
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Lab Natijalar');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellDates: true });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Get status text in Uzbek
 */
function getStatusText(status: string): string {
  switch (status) {
    case 'PENDING': return 'Kutilmoqda';
    case 'APPROVED': return 'Tasdiqlangan';
    case 'REJECTED': return 'Rad etilgan';
    default: return status || '';
  }
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Export all lab samples to Excel (Backend)
 */
export async function exportAllLabSamplesToExcel(): Promise<void> {
  try {
    const blob = await labService.exportResultsToExcel();
    const filename = `laboratoriya-natijalar-${new Date().toISOString().split('T')[0]}.xlsx`;
    downloadBlob(blob, filename);
  } catch (error: any) {
    console.error('Export failed:', error);
    throw new Error(error.message || 'Eksport qilishda xatolik yuz berdi');
  }
}

/**
 * Export filtered lab samples to Excel (Backend)
 */
export async function exportFilteredLabSamplesToExcel(filters: any): Promise<void> {
  try {
    const query: any = {
      status: filters.status !== 'all' ? filters.status : undefined,
      from: filters.dateFrom,
      to: filters.dateTo
    };

    const blob = await labService.exportResultsToExcel(query);
    const filename = `filtr-lab-natijalar-${new Date().toISOString().split('T')[0]}.xlsx`;
    downloadBlob(blob, filename);
  } catch (error: any) {
    console.error('Filtered export failed:', error);
    throw new Error(error.message || 'Ma\'lumotlarni eksport qilishda xatolik yuz berdi');
  }
}

/**
 * Export Quality Certificate PDF
 */
export async function exportQualityCertificatePDF(toyId: string, orderNo?: number): Promise<void> {
  try {
    const blob = await labService.exportCertificatePDF(toyId);
    const filename = `sertifikat-${orderNo || toyId.substring(0, 8)}.pdf`;
    downloadBlob(blob, filename);
  } catch (error: any) {
    console.error('Certificate export failed:', error);
    throw new Error(error.message || 'Sertifikat yuklashda xatolik');
  }
}

/**
 * Export selected lab samples to Excel
 */
export async function exportSelectedLabSamplesToExcel(sampleIds: string[]): Promise<void> {
  try {
    if (sampleIds.length === 0) {
      throw new Error('Hech qanday namuna tanlanmagan');
    }

    // Fetch all samples and filter by selected IDs
    const response = await labService.getAllSamples({ limit: 10000 });
    const selectedSamples = response.items.filter(sample =>
      sampleIds.includes(sample.id)
    );

    if (selectedSamples.length === 0) {
      throw new Error('Tanlangan namunalar topilmadi');
    }

    const blob = convertLabDataToExcel(selectedSamples);
    const filename = `tanlangan-lab-natijalar-${selectedSamples.length}-${new Date().toISOString().split('T')[0]}.xlsx`;
    downloadBlob(blob, filename);
  } catch (error: any) {
    console.error('Selected export failed:', error);
    throw new Error(error.message || 'Tanlangan ma\'lumotlarni eksport qilishda xatolik yuz berdi');
  }
}

/**
 * Export lab samples by marka to Excel
 */
export async function exportLabSamplesByMarkaToExcel(markaId: string): Promise<void> {
  try {
    const samples = await labService.getSamplesByMarka(markaId);

    if (samples.length === 0) {
      throw new Error('Bu marka bo\'yicha ma\'lumotlar topilmadi');
    }

    const blob = convertLabDataToExcel(samples);
    const filename = `marka-${markaId}-lab-natijalar-${new Date().toISOString().split('T')[0]}.xlsx`;
    downloadBlob(blob, filename);
  } catch (error: any) {
    console.error('Marka export failed:', error);
    throw new Error(error.message || 'Marka bo\'yicha ma\'lumotlarni eksport qilishda xatolik yuz berdi');
  }
}

/**
 * Generate filename with timestamp
 */
export function generateLabExportFilename(prefix: string, extension: string, suffix?: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const suffixPart = suffix ? `-${suffix}` : '';
  return `${prefix}${suffixPart}-${timestamp}.${extension}`;
}