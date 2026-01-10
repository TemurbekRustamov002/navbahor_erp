import QRCode from 'qrcode';
import { apiClient } from '../api';

interface ToyPrintData {
  id: string;
  orderNo: string;
  markaNumber: string;
  productType: string;
  netto: number;
  brutto: number;
  tara: number;
  createdAt: string;
  ptm?: string;
  selection?: string;
  brigade?: string;
  pickingType?: string;
  sex?: string;
}

interface PrintOptions {
  method?: 'browser' | 'backend' | 'auto';
  printerIp?: string;
  printerPort?: number;
  printerName?: string;
}

const DEFAULT_PRINTER_CONFIG = {
  // No default IP to prevent network timeouts when using USB.
  // For network printing, printerIp should be explicitly provided in options.
  ip: '',
  port: 9100,
  name: 'Godex G500' // Also matches 'Godex EZPL Driver' in logic
};

const formatKg = (v: any) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
};

/**
 * Generate a compact JSON for QR code to include rich metadata
 */
function generateToyQRData(toy: ToyPrintData): string {
  return JSON.stringify({
    id: toy.id,
    no: toy.orderNo,
    m: toy.markaNumber,
    t: toy.productType,
    w: toy.netto,
    comp: "NAVBAHOR TEKSTIL",
    tel: "+9989795325293",
    addr: "NAVOIY VILOYATI, NAVBAHOR TUMANI, \"PAXTAKOR\" MFY \"TURON\" KO'CHASI № 8"
  });
}

/**
 * Generate TSPL commands for industrial thermal printers (Godex, TSC)
 */
export function generateTSPLCommands(toy: ToyPrintData, qrCodeData?: string): string {
  const commands: string[] = [];
  const finalQR = qrCodeData || generateToyQRData(toy);

  // size in mm
  commands.push('SIZE 100 mm, 100 mm');
  commands.push('GAP 3 mm, 0');
  commands.push('DIRECTION 1,0');
  commands.push('REFERENCE 0,0');
  commands.push('CLS');

  // Header
  commands.push('TEXT 40,40,"3",0,1,1,"NAVBAHOR TEKSTIL"');

  // QR Code - moved to right side for industrial look
  // QRCODE x, y, ECC Level, cell width, mode, rotation, "data"
  commands.push(`QRCODE 550,40,M,8,A,0,"${qrCodeData || toy.id}"`);

  // Data - Organized in 2 columns for professional look and space saving
  commands.push(`TEXT 40,100,"4",0,1,1,"TOY: #${toy.orderNo}"`);

  // Column 1
  commands.push(`TEXT 40,170,"2",0,1,1,"Marka: ${toy.markaNumber}"`);
  commands.push(`TEXT 40,210,"2",0,1,1,"Zavod: ${toy.sex || '-'}"`);
  commands.push(`TEXT 40,250,"2",0,1,1,"Terim: ${toy.pickingType || '-'}"`);

  // Column 2
  commands.push(`TEXT 300,170,"2",0,1,1,"Tur: ${toy.productType}"`);
  if (toy.ptm) commands.push(`TEXT 300,210,"2",0,1,1,"PTM: ${toy.ptm}"`);
  if (toy.selection) commands.push(`TEXT 300,250,"2",0,1,1,"Nav: ${toy.selection}"`);

  if (toy.brigade) {
    commands.push(`TEXT 40,290,"2",0,1,1,"Brigada: ${toy.brigade}"`);
  }

  // Weight section (pushed down slightly)
  commands.push(`TEXT 40,340,"3",0,1,1,"Brutto: ${formatKg(toy.brutto)} kg"`);
  commands.push(`TEXT 40,390,"2",0,1,1,"Netto: ${formatKg(toy.netto)} kg"`);

  // Footer Date
  const dateStr = new Date(toy.createdAt).toLocaleDateString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  commands.push(`TEXT 40,460,"1",0,1,1,"Sana: ${dateStr}"`);

  commands.push('PRINT 1,1');
  return commands.join('\n');
}

export async function printToyLabelVerbose(toy: ToyPrintData, options?: PrintOptions): Promise<{ success: boolean; message?: string; tried?: string }> {
  const method = options?.method || 'browser';

  if (method === 'browser') {
    await showPrintPreview(toy);
    return { success: true, message: 'Oyna ochildi' };
  }

  try {
    const res = await apiClient.post<{ success: boolean; message?: string; tried?: string }>(`/printing/toy-label`, {
      toy,
      options: {
        transport: 'auto',
        host: options?.printerIp || DEFAULT_PRINTER_CONFIG.ip,
        port: options?.printerPort || DEFAULT_PRINTER_CONFIG.port,
        windowsPrinterName: options?.printerName || DEFAULT_PRINTER_CONFIG.name
      }
    });

    if (res.success) return { success: true, message: res.message };

    // Fallback to browser if backend fails in 'auto' mode
    if (method === 'auto') {
      await showPrintPreview(toy);
      return { success: true, message: 'Backend failed, fallback to browser print', tried: 'backend -> browser' };
    }

    return { success: false, message: res.message || 'Printing failed' };
  } catch (e: any) {
    console.error('Print error:', e);
    // Silent fail over to preview
    await showPrintPreview(toy);
    return { success: true, message: 'Connection error, using browser print' };
  }
}

/**
 * Standard Print Label - Simplified
 */
export async function printToyLabel(toy: ToyPrintData, options?: PrintOptions): Promise<boolean> {
  const result = await printToyLabelVerbose(toy, options);
  return result.success;
}

/**
 * Advanced Print Preview (Browser Fallback)
 */
async function showPrintPreview(toy: ToyPrintData) {
  try {
    const qrText = generateToyQRData(toy);
    const qrDataURL = await QRCode.toDataURL(qrText, { margin: 1, width: 250 });
    const dateStr = new Date(toy.createdAt).toLocaleString('uz-UZ', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page { 
            size: 100mm 100mm; 
            margin: 0; 
          }
          
          body { 
            margin: 0; 
            padding: 0; 
            font-family: 'Segoe UI', Arial, sans-serif; 
            -webkit-print-color-adjust: exact;
            width: 100mm;
            height: 100mm;
            overflow: hidden;
            background: white;
            display: flex;
            justify-content: center;
          }

          .container {
            width: 100mm;
            height: 98mm; /* Slightly less than 100 to be safe */
            padding: 4mm 6mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
          }

          .header {
            text-align: center;
            border-bottom: 2px solid black;
            padding-bottom: 1.5mm;
            margin-bottom: 3mm;
          }

          .company-name {
            font-size: 16pt;
            font-weight: 900;
            margin: 0;
            letter-spacing: 0.5px;
          }

          .main-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .info-block {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 1mm;
          }

          .right-column {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 35mm;
          }

          .toy-id {
            font-size: 20pt;
            font-weight: 900;
            margin: -1mm 0 1mm 0;
            text-align: center;
          }

          .sub-data {
            font-size: 11pt;
            font-weight: 700;
            color: black;
            line-height: 1.2;
          }

          .qr-block {
            width: 32mm;
            height: 32mm;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #777;
            border-radius: 2mm;
          }

          .qr-block img {
            width: 30mm;
            height: 30mm;
          }

          .info-grid {
            display: flex;
            flex-direction: column;
            gap: 1.5mm;
            margin-top: 1mm;
          }

          /* Tizimli ma'lumotlar jadvali */
          .data-table {
            margin-top: 3mm;
            width: 100%;
            border-collapse: collapse;
          }
          
          .data-table td {
            border: 1px solid black;
            padding: 1.5mm 2mm;
            font-size: 10pt;
          }

          .weight-section {
            margin-top: 3mm;
            border: 2px solid black;
            padding: 3mm;
            text-align: center;
            border-radius: 1mm;
          }

          .netto-val {
            font-size: 34pt;
            font-weight: 900;
            line-height: 1;
          }

          .netto-label {
            font-size: 10pt;
            font-weight: 700;
            margin-top: 1mm;
            text-transform: uppercase;
          }

          .secondary-weights {
            display: flex;
            justify-content: space-around;
            margin-top: 1.5mm;
            font-size: 10pt;
            font-weight: 700;
            border-top: 1px solid black;
            padding-top: 1.5mm;
          }

          .footer {
            margin-top: auto;
            text-align: center;
            font-size: 10pt;
            font-weight: 800;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="company-name">NAVBAHOR TEKSTIL</h1>
          </div>

          <div class="main-content">
            <div class="info-block">
              <div class="info-grid">
                <div class="sub-data">Marka raqami: <b>${toy.markaNumber || '---'}</b></div>
                <div class="sub-data">Mahsulot turi: <b>${toy.productType || 'TOLA'}</b></div>
                ${toy.selection ? `<div class="sub-data">Seleksiya navi: <b>${toy.selection}</b></div>` : ''}
                <div class="sub-data">Terim turi: <b>${toy.pickingType || '-'}</b></div>
                <div class="sub-data">Zavod: <b>${toy.sex || '-'}</b></div>
                ${toy.ptm ? `<div class="sub-data">PTM: <b>${toy.ptm}</b></div>` : ''}
                ${toy.brigade ? `<div class="sub-data">Brigada raqami: <b>${toy.brigade}</b></div>` : ''}
              </div>
            </div>
            <div class="right-column">
              <h2 class="toy-id">TOY: #${toy.orderNo || '---'}</h2>
              <div class="qr-block">
                <img src="${qrDataURL}" />
              </div>
            </div>
          </div>

          <div class="weight-section">
            <div class="netto-val">${formatKg(toy.brutto)} KG</div>
            <div class="netto-label">BRUTTO VAZN</div>
            
            <div class="secondary-weights">
              <span>Netto: ${formatKg(toy.netto)} kg</span>
              <span>Tara: ${formatKg(toy.tara)} kg</span>
            </div>
          </div>

          <div class="footer">
            SANA: ${dateStr}
          </div>
        </div>
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 400);
          }
        </script>
      </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  } catch (err) {
    console.error('Preview error:', err);
  }
}

/**
 * Bulk Print Preview for Checklist (User can Save as PDF)
 */
export async function printChecklistLabels(toys: ToyPrintData[]) {
  try {
    const pages = await Promise.all(toys.map(async (toy) => {
      const qrText = generateToyQRData(toy);
      const qrDataURL = await QRCode.toDataURL(qrText, { margin: 1, width: 250 });
      const dateStr = new Date(toy.createdAt).toLocaleString('uz-UZ', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      return `
        <div class="page-break">
          <div class="container">
            <div class="header">
              <h1 class="company-name">NAVBAHOR TEKSTIL</h1>
            </div>

            <div class="main-content">
              <div class="info-block">
                <div class="info-grid">
                  <div class="sub-data">Marka: <b>${toy.markaNumber}</b></div>
                  <div class="sub-data">Tur: <b>${toy.productType}</b></div>
                  ${toy.selection ? `<div class="sub-data">Nav: <b>${toy.selection}</b></div>` : ''}
                  <div class="sub-data">Terim: <b>${toy.pickingType || '-'}</b></div>
                  <div class="sub-data">Zavod: <b>${toy.sex || '-'}</b></div>
                  ${toy.ptm ? `<div class="sub-data">PTM: <b>${toy.ptm}</b></div>` : ''}
                  ${toy.brigade ? `<div class="sub-data">Brigada: <b>${toy.brigade}</b></div>` : ''}
                </div>
              </div>
              <div class="right-column">
                <h2 class="toy-id">TOY: #${toy.orderNo}</h2>
                <div class="qr-block">
                  <img src="${qrDataURL}" />
                </div>
              </div>
            </div>

            <div class="weight-section">
              <div class="netto-val">${formatKg(toy.brutto)} KG</div>
              <div class="netto-label">BRUTTO VAZN</div>
              
              <div class="secondary-weights">
                <span>Netto: ${formatKg(toy.netto)} kg</span>
                <span>Tara: ${formatKg(toy.tara)} kg</span>
              </div>
            </div>

            <div class="footer">
              SANA: ${dateStr}
            </div>
          </div>
        </div>
      `;
    }));

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Checklist Labels</title>
        <style>
          @page { 
            size: 100mm 100mm; 
            margin: 0; 
          }
          
          body { 
            margin: 0; 
            padding: 0; 
            font-family: 'Segoe UI', Arial, sans-serif; 
            -webkit-print-color-adjust: exact;
            background: white;
          }

          .page-break {
            page-break-after: always;
            width: 100mm;
            height: 100mm;
            overflow: hidden;
            display: flex;
            justify-content: center;
          }

          .container {
            width: 100mm;
            height: 98mm;
            padding: 4mm 6mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
          }

          .header {
            text-align: center;
            border-bottom: 2px solid black;
            padding-bottom: 1.5mm;
            margin-bottom: 3mm;
          }

          .company-name {
            font-size: 16pt;
            font-weight: 900;
            margin: 0;
            letter-spacing: 0.5px;
          }

          .main-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }

          .info-block {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 1mm;
          }

          .toy-id {
            font-size: 20pt;
            font-weight: 900;
            margin: 0 0 1mm 0;
          }

          .sub-data {
            font-size: 11pt;
            font-weight: 700;
            color: black;
            line-height: 1.2;
          }

          .qr-block {
            width: 32mm;
            height: 32mm;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #777;
            border-radius: 2mm;
          }

          .qr-block img {
            width: 30mm;
            height: 30mm;
          }

          .right-column {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 35mm;
          }

          .weight-section {
            margin-top: 3mm;
            border: 2px solid black;
            padding: 3mm;
            text-align: center;
            border-radius: 1mm;
          }

          .netto-val {
            font-size: 34pt;
            font-weight: 900;
            line-height: 1;
          }

          .netto-label {
            font-size: 10pt;
            font-weight: 700;
            margin-top: 1mm;
            text-transform: uppercase;
          }

          .secondary-weights {
            display: flex;
            justify-content: space-around;
            margin-top: 1.5mm;
            font-size: 10pt;
            font-weight: 700;
            border-top: 1px solid black;
            padding-top: 1.5mm;
          }

          .footer {
            margin-top: auto;
            text-align: center;
            padding-top: 2mm;
            font-size: 10pt;
            font-weight: 800;
          }
        </style>
      </head>
      <body>
        ${pages.join('')}
        <script>
          window.onload = () => {
            window.print();
            // setTimeout(() => window.close(), 1000);
          }
        </script>
      </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  } catch (err) {
    console.error('Bulk Preview error:', err);
  }
}
