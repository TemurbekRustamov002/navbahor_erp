"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useWarehouseBackendStore } from "@/stores/warehouseBackendStore";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { safeNumber } from '@/lib/utils/number';
import { printChecklistLabels } from "@/lib/utils/print";
import {
  Scan,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Filter,
  Clock,
  Printer,
  List
} from "lucide-react";

export function ScannerInterface() {
  const {
    currentChecklist,
    currentOrder,
    scanToy,
    setCurrentStep,
    loading,
    error
  } = useWarehouseBackendStore();
  const { toast } = useToast();

  const [manualInput, setManualInput] = useState("");
  const [showManualList, setShowManualList] = useState(false); // Default false for Urovo focus
  const [isConnected, setIsConnected] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<Array<{
    toyId: string;
    orderNo: number;
    timestamp: string;
    success: boolean;
    error?: string;
  }>>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const keepFocus = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    keepFocus();
    const handleGlobalClick = () => keepFocus();
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [keepFocus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnected(true);
      toast.success("Industrial Urovo Skaner: ONLINE");
    }, 1500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleScan = async (scannedCode: string) => {
    // 1. Tozalash - barcha ko'rinmas belgilarni olib tashlaymiz
    let code = scannedCode.replace(/[\x00-\x1F\x7F-\x9F]/g, "").trim();
    if (!code) return;

    console.log('🔍 Raw scan received:', code);

    // 2. JSON parsing logikasi
    try {
      if (code.startsWith('{') || code.startsWith('[')) {
        const parsed = JSON.parse(code);
        const extractedId = parsed.id || parsed.toyId || parsed.uid || parsed._id;
        if (extractedId) code = extractedId;
      }
    } catch (e) { }

    // 3. Hybrid format splitting (ID#URL)
    if (code.includes('#')) {
      const parts = code.split('#');
      if (parts[0].length >= 10) code = parts[0].trim();
    }

    // 4. URL extraction (Agar hali ham ID topilmagan bo'lsa)
    if (code.includes('/toy/')) {
      const parts = code.split('/toy/');
      const possibleId = parts[parts.length - 1].split(/[?#]/)[0];
      if (possibleId && possibleId.length >= 10) code = possibleId;
    }

    // 5. Final Fallback - UUID Regex
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = code.match(uuidRegex);
    if (match) code = match[0];

    console.log('🎯 Final parsed ID:', code);

    if (!currentChecklist) {
      toast.error("Tizim hatoligi: Checklist topilmadi");
      return;
    }

    try {
      const item = currentOrder?.items?.find(item =>
        item.toyId === code ||
        item.orderNo?.toString() === code ||
        (code.startsWith('QR-') && code.split('-')[2] === item.orderNo?.toString().padStart(3, '0'))
      );

      if (!item) {
        throw new Error("REESTRDA MAVJUD EMAS");
      }

      const alreadyScanned = currentChecklist.items?.some(i => i.toyId === item.toyId && i.scanned);
      if (alreadyScanned) {
        throw new Error("AVVAL SKANERLANGAN");
      }

      await scanToy(currentChecklist.id, item.toyId, code);
      setLastScanTime(new Date().toISOString());

      setScanHistory(prev => [{
        toyId: item.toyId,
        orderNo: item.orderNo!,
        timestamp: new Date().toISOString(),
        success: true
      }, ...prev]);

      // Play success sound if possible
      // const audio = new Audio('/sounds/beep.mp3'); audio.play().catch();

      setManualInput("");
      keepFocus();

    } catch (err: any) {
      const msg = err.message || "Xatolik";
      toast.error(msg);
      // Play error sound
      // const audio = new Audio('/sounds/error.mp3'); audio.play().catch();

      setScanHistory(prev => [{
        toyId: code,
        orderNo: 0,
        timestamp: new Date().toISOString(),
        success: false,
        error: msg
      }, ...prev]);
      setManualInput("");
      keepFocus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan(manualInput);
    }
  };

  const handleDownloadLabels = async () => {
    if (!currentChecklist || !currentChecklist.items) return;

    // Convert ChecklistItems to ToyPrintData format
    // identifying missing info from currentOrder if needed
    const printData = currentChecklist.items.map(item => {
      // Robust extraction: prefer toy relation, fallback to direct properties
      const netto = safeNumber(item.netto) || safeNumber(item.toy?.netto) || 0;
      const brutto = safeNumber(item.toy?.brutto) || safeNumber(item.brutto) || 0;
      const tara = safeNumber(item.toy?.tara) || safeNumber(item.tara) || 0;
      const orderNo = item.toy?.orderNo || item.orderNo || (item as any).order_no || '0';
      const markaNo = item.marka?.number || item.markaNo || (item as any).marka_no || '?';

      return {
        id: item.toyId,
        orderNo: orderNo.toString(),
        markaNumber: markaNo.toString(),
        productType: item.productType || item.marka?.productType || 'TOLA',
        netto,
        brutto,
        tara,
        createdAt: item.toy?.createdAt || new Date().toISOString(),
        ptm: item.marka?.ptm || '',
        selection: item.marka?.selection || '',
        brigade: item.toy?.brigade || (item as any).brigade || ''
      };
    });

    await printChecklistLabels(printData);
  };

  const status = useMemo(() => {
    const total = currentChecklist?.items?.length || 0;
    const scanned = currentChecklist?.items?.filter(i => i.scanned).length || 0;
    return { total, scanned, isComplete: total > 0 && scanned === total };
  }, [currentChecklist]);

  const progress = status.total > 0 ? (status.scanned / status.total) * 100 : 0;

  return (
    <div className="h-full flex flex-col xl:flex-row bg-transparent overflow-hidden select-none">
      {/* Strategic Invisible Input Gateway */}
      <input
        ref={inputRef}
        type="text"
        value={manualInput}
        onChange={(e) => setManualInput(e.target.value)}
        onKeyDown={handleKeyPress}
        className="fixed -top-10 opacity-0 pointer-events-none"
        autoFocus
      />

      {/* Main Scanner Hub (Scales for Desktop / Mobile) */}
      <div className="flex-1 flex flex-col p-4 md:p-8 lg:p-10 relative overflow-hidden bg-slate-50/20 dark:bg-black/20">

        {/* Mobile/Urovo Header */}
        <div className="flex flex-col gap-4 mb-6 md:mb-12 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 shadow-sm border border-slate-100 dark:border-white/10 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-primary" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none uppercase">Urovo <span className="text-primary italic">Skaner</span></h2>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                  {currentChecklist?.items?.[0]?.marka?.number ? `Marka #${currentChecklist.items[0].marka.number}` : 'Tayyor'}
                </p>
              </div>
            </div>

            <div className={cn(
              "px-4 py-2 rounded-xl border backdrop-blur-md transition-all duration-700 shadow-sm flex items-center gap-2",
              isConnected ? "border-primary/10 bg-white dark:bg-white/5 dark:border-primary/20" : "border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/20"
            )}>
              <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-primary animate-pulse" : "bg-red-500")} />
              <span className={cn("text-[8px] font-bold uppercase tracking-widest leading-none", isConnected ? "text-slate-900 dark:text-white" : "text-red-600 dark:text-red-400")}>
                {isConnected ? "ALOKA BOR" : "ALOKA YO'Q"}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowManualList(!showManualList)}
              className={cn(
                "flex-1 h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 flex items-center justify-center border",
                showManualList ? "bg-slate-100 dark:bg-white/10" : "bg-white dark:bg-transparent"
              )}
            >
              <List className="h-4 w-4" />
              Ro&apos;yxat ({status.total - status.scanned})
            </button>
            <Button
              variant="outline"
              onClick={handleDownloadLabels}
              className="h-12 w-12 px-0 rounded-xl"
              title="QR Kodlarni Yuklab Olish"
            >
              <Printer className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </Button>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 flex flex-col relative z-10">
          {showManualList ? (
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Kutilayotgan Toylar</h3>
                <span className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">{status.total - status.scanned} ta</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {currentChecklist?.items?.filter(i => !i.scanned).map((item, idx) => (
                  <div key={item.toyId} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-white/10 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {item.orderNo}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">Toy #{item.orderNo}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{item.toyId?.substring(0, 8)}...</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleScan(item.toyId)}
                      className="h-8 text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/5 dark:bg-primary/20 hover:bg-primary/10"
                    >
                      Kiritish
                    </Button>
                  </div>
                ))}
                {currentChecklist?.items?.filter(i => !i.scanned).length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500">
                    <CheckCircle className="h-8 w-8 mb-2 opacity-20" />
                    <span className="text-xs font-bold uppercase tracking-widest">Barchasi Skanerlandi</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
              {/* Hero Scan Indicator - Optimized for Urovo Screen */}
              <div className="relative w-full max-w-xs aspect-square bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-slate-50 dark:border-white/5 flex flex-col items-center justify-center group overflow-hidden">
                <div className={cn(
                  "absolute inset-0 opacity-10 transition-colors duration-500",
                  scanHistory[0]?.success ? "bg-primary" : "bg-slate-100 dark:bg-white/10"
                )} />

                <div className="relative z-10 text-center space-y-2">
                  {scanHistory[0]?.success ? (
                    <>
                      <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/30 mb-2 animate-in bounce-in">
                        <CheckCircle className="text-white h-8 w-8" strokeWidth={3} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Muvaffaqiyatli</p>
                      <p className="text-5xl font-black text-slate-900 font-mono tracking-tighter">
                        #{scanHistory[0].orderNo}
                      </p>
                      <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 font-mono">
                        {new Date(scanHistory[0].timestamp).toLocaleTimeString()}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                        <Scan className="text-slate-300 h-10 w-10" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Skanerlang</p>
                      <p className="text-sm font-medium text-slate-300 italic">Barkodni kameraga tuting</p>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-xs space-y-3">
                <div className="flex justify-between items-end px-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Jarayon</span>
                  <span className="text-xl font-black text-primary font-mono">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner border border-slate-200 dark:border-white/10">
                  <div className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(11,174,74,0.4)]" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {status.scanned} / {status.total} Dona
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="mt-6">
          {status.isComplete ? (
            <Button
              onClick={() => setCurrentStep("shipment")}
              className="w-full h-16 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-[0.25em] text-[12px] shadow-xl hover:bg-black active:scale-95 transition-all animate-in slide-in-from-bottom-4"
            >
              Yakunlash va Jo&apos;natish <ArrowRight className="h-5 w-5 ml-3" />
            </Button>
          ) : (
            <div className="text-center p-4">
              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest opacity-50">Navbahor ERP Urovo Client v1.0</p>
            </div>
          )}
        </div>
      </div>

      {/* History Sidebar (Hidden on small screens/Urovo, visible on desktop) */}
      <div className="hidden xl:flex w-[400px] bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-white/10 p-8 flex-col">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Clock className="h-4 w-4" /> Oxirgi Harakatlar
        </h3>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {scanHistory.map((scan, i) => (
            <div key={i} className={cn(
              "p-4 rounded-2xl border flex items-center justify-between",
              scan.success ? "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10" : "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20"
            )}>
              <div>
                <p className={cn("font-bold text-sm", scan.success ? "text-slate-900 dark:text-white" : "text-red-600 dark:text-red-400")}>
                  {scan.success ? `Toy #${scan.orderNo}` : "Xato"}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {new Date(scan.timestamp).toLocaleTimeString()}
                </p>
              </div>
              {scan.success ? (
                <CheckCircle className="h-5 w-5 text-primary" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
