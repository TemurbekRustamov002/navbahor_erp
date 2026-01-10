import { Injectable, Logger } from '@nestjs/common';
import * as net from 'net';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

export type TransportMode = 'network' | 'serial' | 'windows' | 'auto';

export interface ToyPrintData {
  id: string;
  orderNo: string;
  markaNumber: string;
  productType: string;
  netto: number;
  brutto: number;
  tara?: number;
  createdAt: string;
  ptm?: string;
  selection?: string;
  pickingType?: string;
  sex?: string;
  brigade?: string;
}

export interface PrintOptions {
  transport?: TransportMode;
  host?: string;
  port?: number;
  serialPath?: string;
  baudRate?: number;
  windowsPrinterName?: string;
}

@Injectable()
export class GodexService {
  private readonly logger = new Logger(GodexService.name);

  private generateEZPL(toy: ToyPrintData): string {
    const formatKg = (v: any) => {
      const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
      return Number.isFinite(n) ? n.toFixed(2) : '0.00';
    };

    const dateStr = new Date(toy.createdAt).toLocaleString('uz-UZ', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // 100mm x 100mm Kvadrat dizayni (812x812 dots at 203 DPI)
    // Layout: Header Top, Split Middle (Left: Details, Right: TOY# + QR), Bottom: Weight

    return [
      '^Q100,3',          // Balandlik 100mm
      '^W100',            // Kenglik 100mm
      '^H12',             // Issiqlik
      '^P1',
      '^S3',
      '^AD',
      '^L',

      // 1. Header Section
      'AH,60,30,1,1,0,0,NAVBAHOR TEKSTIL',
      'LO,60,90,680,8',                     // Header Divider Line

      // 2. Left Column: Details List
      // Start Y = 120, Spacing ~40 dots per item
      `AD,60,120,1,1,0,0,MARKA: ${toy.markaNumber}`,
      `AD,60,160,1,1,0,0,MAHSULOT: ${toy.productType}`,
      `AD,60,200,1,1,0,0,NAV: ${toy.selection || '-'}`,
      `AD,60,240,1,1,0,0,TERIM: ${toy.pickingType || '-'}`,
      `AD,60,280,1,1,0,0,ZAVOD: ${toy.sex || '-'}`,
      `AD,60,320,1,1,0,0,PTM: ${toy.ptm || '-'}`,
      `AD,60,360,1,1,0,0,BRIGADA: ${toy.brigade || '-'}`,

      // 3. Right Column: TOY ID + QR Code
      // "TOY: #..." aligned with QR column
      `AH,460,120,1,1,0,0,TOY: #${toy.orderNo}`,
      // QR Code positioned below TOY#
      `W460,170,QR,M,12,0,M2,0,${toy.id}`,

      // 4. Weight Section
      'LO,60,440,680,5',                   // Middle Divider Line
      `AH,60,470,2,4,0,0,${formatKg(toy.netto)} KG`,
      'AD,60,600,1,1,0,0,NETTO VAZNI (SOF VAZN)',

      `AD,60,660,1,1,0,0,Brutto: ${formatKg(toy.brutto)} KG`,

      // 5. Footer Section
      'LO,60,730,680,3',                   // Footer Divider Line
      `AC,60,760,1,1,0,0,ID: ${toy.id}`,
      `AC,60,800,1,1,0,0,SANA: ${dateStr}`,

      'E'
    ].join('\r\n') + '\r\n';
  }

  async printLabel(
    toy: ToyPrintData,
    opts: PrintOptions = {}
  ): Promise<{ success: boolean; message: string }> {
    const transport: TransportMode =
      opts.transport || (process.env.PRINTER_MODE as TransportMode) || 'windows';

    this.logger.log(`Printing Label (EZPL) via ${transport}`);

    if (transport === 'windows' || transport === 'auto') {
      const printerName =
        opts.windowsPrinterName ||
        process.env.WINDOWS_PRINTER_NAME ||
        'Godex G500';

      const ezpl = this.generateEZPL(toy);
      const tempId = Math.random().toString(36).substring(7);
      const tempFilePath = path.join(os.tmpdir(), `label_${tempId}.txt`);
      const psScriptPath = path.join(process.cwd(), 'print_raw.ps1');

      try {
        // MUHIM: Faylni ASCII kodirovkasid yozamiz, BOM belgisi bo'lmasligi shart
        fs.writeFileSync(tempFilePath, ezpl, { encoding: 'ascii' });

        const { stdout, stderr } = await execAsync(
          `powershell -ExecutionPolicy Bypass -File "${psScriptPath}" "${printerName}" "${tempFilePath}"`
        );

        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

        if (stdout.includes('SUCCESS')) {
          this.logger.log(`RAW sent successfully to ${printerName}`);
          return { success: true, message: `Chop etishga yuborildi (USB: ${printerName})` };
        } else {
          this.logger.error(`PowerShell FAILED. Out: ${stdout}, Err: ${stderr}`);
          return { success: false, message: `Chop etishda xatolik (PS)` };
        }
      } catch (e: any) {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        this.logger.error(`Print exception: ${e.message}`);
        return { success: false, message: `Server xatosi: ${e.message}` };
      }
    }

    return { success: false, message: `"${transport}" rejimi hozircha qo'llab-quvvatlanmaydi` };
  }

  async checkStatus(
    opts: PrintOptions = {}
  ): Promise<{ mode: TransportMode; reachable: boolean; message: string; details?: any }> {
    const mode: TransportMode = opts.transport || (process.env.PRINTER_MODE as TransportMode) || 'windows';

    if (mode === 'windows' || mode === 'auto') {
      const name = opts.windowsPrinterName || process.env.WINDOWS_PRINTER_NAME || 'Godex G500';

      try {
        const { stdout } = await execAsync('powershell "Get-Printer | Select-Object Name | ConvertTo-Json"');
        const printersRaw = JSON.parse(stdout);
        const printerList = Array.isArray(printersRaw) ? printersRaw.map(p => p.Name) : [printersRaw.Name];

        const found = printerList.some(n => n.includes(name) || name.includes(n));
        return {
          mode,
          reachable: found,
          message: found ? `Printer tayyor: ${name}` : `Printer topilmadi: ${name}`,
          details: { availablePrinters: printerList }
        };
      } catch (e) {
        return { mode, reachable: false, message: 'Printerlar ro\'yxatini olib bo\'lmadi', details: {} };
      }
    }

    return { mode, reachable: false, message: 'Noma\'lum rejim', details: {} };
  }
}