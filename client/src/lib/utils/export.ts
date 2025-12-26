import { Checklist, ChecklistItem } from "@/types/checklist";
import * as XLSX from 'xlsx';

// Generate QR code data (simplified - in real app would use qrcode library)
export function generateQRCode(toyId: string): string {
  return `QR-${toyId}-${Date.now()}`;
}

// Generate QR codes file content
export function generateQRCodesContent(checklist: Checklist): string {
  const header = `QR KODLAR - ${checklist.customerName}\n`;
  const date = `Sana: ${new Date(checklist.createdAt).toLocaleDateString('uz-UZ')}\n`;
  const separator = `${'='.repeat(50)}\n\n`;

  const items = checklist.items.map((item, index) => {
    return `${index + 1}. TOY #${item.toyId}\n` +
      `   QR Kod: ${item.qrCode}\n` +
      `   Marka: ${item.markaLabel}\n` +
      `   Vazn: ${item.weight} kg\n` +
      `   Sifat: ${item.grade}\n` +
      `   Qo'shilgan: ${new Date(item.addedAt).toLocaleString('uz-UZ')}\n` +
      `   ${'-'.repeat(40)}\n`;
  }).join('');

  const footer = `\nJAMI: ${checklist.totalItems} dona toy\n` +
    `JAMI VAZN: ${checklist.totalWeight.toFixed(2)} kg\n` +
    `YARATILGAN: ${new Date(checklist.createdAt).toLocaleString('uz-UZ')}\n`;

  return header + date + separator + items + footer;
}

// Generate checklist summary content
export function generateSummaryContent(checklist: Checklist): string {
  const header = `CHECKLIST HISOBOTI\n`;
  const customerInfo = `Mijoz: ${checklist.customerName}\n` +
    `Sana: ${new Date(checklist.createdAt).toLocaleDateString('uz-UZ')}\n` +
    `Status: ${getStatusText(checklist.status)}\n`;

  const separator = `${'='.repeat(60)}\n\n`;

  // Summary by marka
  const markaSummary = `MARKALAR BO'YICHA XULOSE:\n` +
    `${'-'.repeat(40)}\n` +
    checklist.summary.map(summary => {
      const gradesText = Object.entries(summary.grades)
        .map(([grade, count]) => `${grade}: ${count} dona`)
        .join(', ');

      return `Marka: ${summary.markaLabel}\n` +
        `  - Jami toylar: ${summary.totalToys} dona\n` +
        `  - Jami vazn: ${summary.totalWeight.toFixed(2)} kg\n` +
        `  - O'rtacha sifat: ${summary.averageQuality.toFixed(1)}\n` +
        `  - Sinflar: ${gradesText}\n`;
    }).join('\n');

  // Detailed items list
  const detailedItems = `\n\nBATAFSIL RO'YXAT:\n` +
    `${'-'.repeat(40)}\n` +
    checklist.items.map((item, index) =>
      `${index + 1}. ${item.markaLabel} | ${item.weight}kg | ${item.grade} | ID: ${item.toyId}`
    ).join('\n');

  // Total summary
  const totalSummary = `\n\nJAMI XULOSE:\n` +
    `${'-'.repeat(40)}\n` +
    `Jami toylar soni: ${checklist.totalItems} dona\n` +
    `Jami vazn: ${checklist.totalWeight.toFixed(2)} kg\n` +
    `O'rtacha vazn: ${(checklist.totalWeight / checklist.totalItems).toFixed(2)} kg/toy\n` +
    `Markalar soni: ${checklist.summary.length} ta\n` +
    `Yaratuvchi: ${checklist.createdBy}\n` +
    `Yaratilgan vaqt: ${new Date(checklist.createdAt).toLocaleString('uz-UZ')}\n`;

  if (checklist.confirmedAt) {
    totalSummary + `Tasdiqlangan vaqt: ${new Date(checklist.confirmedAt).toLocaleString('uz-UZ')}\n`;
  }

  if (checklist.notes) {
    totalSummary + `Izoh: ${checklist.notes}\n`;
  }

  return header + customerInfo + separator + markaSummary + detailedItems + totalSummary;
}

// Get status text in Uzbek
function getStatusText(status: string): string {
  switch (status) {
    case 'draft': return 'Tayyorlanmoqda';
    case 'confirmed': return 'Tasdiqlangan';
    case 'locked': return 'Bloklangan';
    case 'modification_requested': return 'O\'zgartirish so\'ralgan';
    default: return status;
  }
}

// Download file helper
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
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

// Download Blob helper (for xlsx, pdf, etc.)
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Export single document by key
export type WarehouseDocKey = 'waybill' | 'invoice' | 'packing' | 'quality' | 'transport' | 'product_list' | 'finance' | 'lab';

export function exportSingleDocument(checklist: Checklist, key: WarehouseDocKey): Blob {
  const map: Record<WarehouseDocKey, string> = {
    waybill: 'Yol_varagi',
    transport: 'Transport_hujjati',
    invoice: 'Hisob_faktura',
    finance: 'Moliyaviy_hujjat',
    packing: 'Qadoqlash_varaqasi',
    product_list: 'Mahsulot_royxati',
    quality: 'Sifat_guvohnomasi',
    lab: 'Lab_tahlili'
  };
  return exportDocumentsWorkbook(checklist, { includeSheets: [map[key]] });
}

// Generate filename with date and customer
export function generateFilename(checklist: Checklist, type: 'qr' | 'summary'): string {
  const date = new Date(checklist.createdAt).toISOString().split('T')[0];
  const customerName = checklist.customerName.replace(/[^a-zA-Z0-9]/g, '_');
  const prefix = type === 'qr' ? 'qr-kodlar' : 'checklist';

  return `${prefix}-${customerName}-${date}.txt`;
}

// Export checklist as XLSX workbook for various document types
export function exportDocumentsWorkbook(checklist: Checklist, options?: { includeSheets?: string[] }): Blob {
  const wb = XLSX.utils.book_new();
  const sheets = new Set(options?.includeSheets || [
    'Yol_varagi',
    'Transport_hujjati',
    'Hisob_faktura',
    'Moliyaviy_hujjat',
    'Qadoqlash_varaqasi',
    'Mahsulot_royxati',
    'Sifat_guvohnomasi',
    'Lab_tahlili'
  ]);

  // Common info
  const date = new Date(checklist.createdAt);
  const headerInfo = {
    mijoz: checklist.customerName,
    sana: date.toLocaleDateString('uz-UZ'),
    jamiToylar: checklist.totalItems,
    jamiVaznKg: Number(checklist.totalWeight?.toFixed?.(2) ?? checklist.totalWeight),
    holat: checklist.status
  };

  // 1) Yo'l varag'i (Waybill)
  if (sheets.has('Yol_varagi')) {
    const ws = XLSX.utils.aoa_to_sheet([
      ['YO\'L VARAG\'I'],
      ['Mijoz', headerInfo.mijoz],
      ['Sana', headerInfo.sana],
      ['Jami toylar', headerInfo.jamiToylar],
      ['Jami vazn (kg)', headerInfo.jamiVaznKg],
      [],
      ['#', 'Toy ID', 'Marka', 'Vazn (kg)', 'Sifat']
    ]);

    checklist.items.forEach((item, idx) => {
      XLSX.utils.sheet_add_aoa(ws, [[
        idx + 1,
        item.toyId,
        item.markaLabel,
        Number(item.weight),
        item.grade
      ]], { origin: -1 });
    });

    ws['!cols'] = [{ wch: 4 }, { wch: 12 }, { wch: 25 }, { wch: 12 }, { wch: 10 }];
    ws['!autofilter'] = { ref: `A7:E${7 + checklist.items.length}` } as any;
    XLSX.utils.book_append_sheet(wb, ws, 'Yol_varagi');
  }

  // 2) Transport hujjati
  if (sheets.has('Transport_hujjati')) {
    const ws = XLSX.utils.aoa_to_sheet([
      ['TRANSPORT HUJJATI'],
      ['Mijoz', headerInfo.mijoz],
      ['Sana', headerInfo.sana],
      ['Transport turi', 'Yuk mashinasi'],
      ['Haydovchi', '—'],
      [],
      ['#', 'Toy ID', 'Marka', 'Vazn (kg)']
    ]);

    checklist.items.forEach((item, idx) => {
      XLSX.utils.sheet_add_aoa(ws, [[idx + 1, item.toyId, item.markaLabel, Number(item.weight)]], { origin: -1 });
    });

    ws['!cols'] = [{ wch: 4 }, { wch: 12 }, { wch: 25 }, { wch: 12 }];
    ws['!autofilter'] = { ref: `A7:D${7 + checklist.items.length}` } as any;
    XLSX.utils.book_append_sheet(wb, ws, 'Transport_hujjati');
  }

  // 3) Hisob-faktura (Invoice)
  if (sheets.has('Hisob_faktura')) {
    const rows: any[][] = [
      ['HISOB-FAKTURA'],
      ['Mijoz', headerInfo.mijoz],
      ['Sana', headerInfo.sana],
      [],
      ['#', 'Mahsulot', 'Miqdor (dona)', 'Vazn (kg)', 'Narx', 'Jami']
    ];

    // Aggregate by marka
    const markaMap = new Map<string, { count: number; weight: number }>();
    for (const it of checklist.items) {
      const key = it.markaLabel;
      const aggr = markaMap.get(key) || { count: 0, weight: 0 };
      aggr.count += 1;
      aggr.weight += Number(it.weight) || 0;
      markaMap.set(key, aggr);
    }

    let grandTotal = 0;
    Array.from(markaMap.entries()).forEach(([marka, aggr]) => {
      const price = 0; // Narx hozircha 0 (backenddan olish mumkin)
      const total = price * aggr.weight;
      grandTotal += total;
      rows.push([rows.length - 4, marka, aggr.count, Number(aggr.weight.toFixed(2)), price, total]);
    });
    rows.push([]);
    rows.push(['JAMI', '', '', '', '', grandTotal]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 4 }, { wch: 30 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 14 }];
    ws['!autofilter'] = { ref: `A5:F${5 + markaMap.size}` } as any;
    XLSX.utils.book_append_sheet(wb, ws, 'Hisob_faktura');
  }

  // 4) Moliyaviy hujjat (summary)
  if (sheets.has('Moliyaviy_hujjat')) {
    const ws = XLSX.utils.aoa_to_sheet([
      ['MOLIYAVIY HUJJAT'],
      ['Mijoz', headerInfo.mijoz],
      ['Sana', headerInfo.sana],
      ['Jami toylar', headerInfo.jamiToylar],
      ['Jami vazn (kg)', headerInfo.jamiVaznKg],
      [],
      ['#', 'Marka', 'Soni', 'Vazn (kg)']
    ]);

    const markaMap = new Map<string, { count: number; weight: number }>();
    checklist.items.forEach(it => {
      const key = it.markaLabel;
      const aggr = markaMap.get(key) || { count: 0, weight: 0 };
      aggr.count += 1; aggr.weight += Number(it.weight) || 0;
      markaMap.set(key, aggr);
    });

    let idx = 1;
    Array.from(markaMap.entries()).forEach(([marka, aggr]) => {
      XLSX.utils.sheet_add_aoa(ws, [[idx++, marka, aggr.count, Number(aggr.weight.toFixed(2))]], { origin: -1 });
    });

    ws['!cols'] = [{ wch: 4 }, { wch: 30 }, { wch: 10 }, { wch: 12 }];
    ws['!autofilter'] = { ref: `A7:D${6 + markaMap.size}` } as any;
    XLSX.utils.book_append_sheet(wb, ws, 'Moliyaviy_hujjat');
  }

  // 5) Qadoqlash varaqasi (Packing list)
  if (sheets.has('Qadoqlash_varaqasi')) {
    const ws = XLSX.utils.aoa_to_sheet([
      ['QADOQLASH VARAQASI'],
      ['Mijoz', headerInfo.mijoz],
      ['Sana', headerInfo.sana],
      [],
      ['#', 'Paket', 'Toy ID', 'Marka', 'Vazn (kg)']
    ]);

    // Paketlash: har 10 ta item bitta paket deb faraz qilamiz (keyin backenddan real paket id bilan almashtiriladi)
    checklist.items.forEach((item, i) => {
      const paket = Math.floor(i / 10) + 1;
      XLSX.utils.sheet_add_aoa(ws, [[i + 1, `P-${paket}`, item.toyId, item.markaLabel, Number(item.weight)]], { origin: -1 });
    });

    ws['!cols'] = [{ wch: 4 }, { wch: 10 }, { wch: 12 }, { wch: 28 }, { wch: 12 }];
    ws['!autofilter'] = { ref: `A5:E${5 + checklist.items.length}` } as any;
    XLSX.utils.book_append_sheet(wb, ws, 'Qadoqlash_varaqasi');
  }

  // 6) Mahsulot ro'yxati (Product list)
  if (sheets.has('Mahsulot_royxati')) {
    const ws = XLSX.utils.aoa_to_sheet([
      ["MAHSULOT RO'YXATI"],
      ['Mijoz', headerInfo.mijoz],
      ['Sana', headerInfo.sana],
      [],
      ['#', 'Toy ID', 'Marka', 'Vazn (kg)', 'Sifat', 'QR Kod']
    ]);

    checklist.items.forEach((item, idx) => {
      XLSX.utils.sheet_add_aoa(ws, [[idx + 1, item.toyId, item.markaLabel, Number(item.weight), item.grade, item.qrCode]], { origin: -1 });
    });

    ws['!cols'] = [{ wch: 4 }, { wch: 12 }, { wch: 25 }, { wch: 12 }, { wch: 10 }, { wch: 20 }];
    ws['!autofilter'] = { ref: `A5:F${5 + checklist.items.length}` } as any;
    XLSX.utils.book_append_sheet(wb, ws, 'Mahsulot_royxati');
  }

  // 7) Sifat guvohnomasi (Quality certificate)
  if (sheets.has('Sifat_guvohnomasi')) {
    const ws = XLSX.utils.aoa_to_sheet([
      ['SIFAT GUVOHNOMASI'],
      ['Mijoz', headerInfo.mijoz],
      ['Sana', headerInfo.sana],
      [],
      ['#', 'Toy ID', 'Marka', 'Sifat']
    ]);

    checklist.items.forEach((item, idx) => {
      XLSX.utils.sheet_add_aoa(ws, [[idx + 1, item.toyId, item.markaLabel, item.grade]], { origin: -1 });
    });

    ws['!cols'] = [{ wch: 4 }, { wch: 12 }, { wch: 25 }, { wch: 16 }];
    ws['!autofilter'] = { ref: `A5:D${5 + checklist.items.length}` } as any;
    XLSX.utils.book_append_sheet(wb, ws, 'Sifat_guvohnomasi');
  }

  // 8) Lab tahlili (Lab analysis) - agar backend labdan agg kerak bo'lsa keyin kengaytiramiz
  if (sheets.has('Lab_tahlili')) {
    const ws = XLSX.utils.aoa_to_sheet([
      ['LAB TAHLILI'],
      ['Mijoz', headerInfo.mijoz],
      ['Sana', headerInfo.sana],
      [],
      ['#', 'Toy ID', 'Marka', 'Namlik (%)', 'Ifloslik (%)', 'Uzunlik (mm)', 'Pishiqligi']
    ]);

    // Hozircha checklist itemlarida lab fieldlar yo'q, keyin backenddan enrich qilinadi
    checklist.items.forEach((item, idx) => {
      XLSX.utils.sheet_add_aoa(ws, [[idx + 1, item.toyId, item.markaLabel, '', '', '', '']], { origin: -1 });
    });

    ws['!cols'] = [{ wch: 4 }, { wch: 12 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 }];
    ws['!autofilter'] = { ref: `A5:G${5 + checklist.items.length}` } as any;
    XLSX.utils.book_append_sheet(wb, ws, 'Lab_tahlili');
  }

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

// Validate checklist before export
export function validateChecklistForExport(checklist: Checklist): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (checklist.items.length === 0) {
    errors.push('Checklist bo\'sh - hech qanday toy tanlanmagan');
  }

  if (checklist.totalWeight <= 0) {
    errors.push('Umumiy vazn noto\'g\'ri');
  }

  if (!checklist.customerName || checklist.customerName.trim() === '') {
    errors.push('Mijoz nomi ko\'rsatilmagan');
  }

  // Check for duplicate toys
  const toyIds = checklist.items.map(item => item.toyId);
  const uniqueToyIds = new Set(toyIds);
  if (toyIds.length !== uniqueToyIds.size) {
    errors.push('Checklistda takrorlangan toylar mavjud');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}