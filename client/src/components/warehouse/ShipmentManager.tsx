"use client";
import { useState, useMemo, useEffect } from "react";
import { formatWeight, safeNumber } from '@/lib/utils/number';
import { useWarehouseBackendStore } from "@/stores/warehouseBackendStore";
import { apiClient } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import {
  Truck,
  CheckCircle2,
  FileText,
  Send,
  User,
  Package,
  Printer,
  Download
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { PrintableWaybill } from "./PrintableWaybill";

export function ShipmentManager() {
  const fetchOrders = useWarehouseBackendStore(state => state.fetchOrders);
  const { toast } = useToast();

  const currentChecklist = useWarehouseBackendStore(state => state.currentChecklist);
  const currentOrder = useWarehouseBackendStore(state => state.currentOrder);
  const finalizeShipment = useWarehouseBackendStore(state => state.finalizeShipment);
  const loading = useWarehouseBackendStore(state => state.loading);

  // Stable setter to update the store without triggering infinite loop
  const updateChecklist = (checklist: any) => useWarehouseBackendStore.setState({ currentChecklist: checklist });

  const [driverName, setDriverName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [showWaybill, setShowWaybill] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Auto-refresh checklist data once to ensure all weights and relations are loaded
  useEffect(() => {
    if (currentChecklist?.id && !isSyncing) {
      setIsSyncing(true);
      apiClient.get(`/warehouse/checklists/${currentChecklist.id}`)
        .then(res => {
          const checklist = res.data || res;
          if (checklist && checklist.items) {
            updateChecklist(checklist);
          }
        })
        .catch(err => console.error('Failed to sync checklist:', err))
        .finally(() => setIsSyncing(false));
    }
  }, [currentChecklist?.id]); // Only dependency is ID

  const summary = useMemo(() => {
    const items = currentChecklist?.items || [];
    const totalWeight = items.reduce((sum, item) => {
      // Robust weight detection: item.netto or item.toy.netto or snake_case variants
      const w = safeNumber(item.netto) ||
        safeNumber(item.toy?.netto) ||
        safeNumber((item as any).netto_weight) ||
        safeNumber((item as any).toy?.netto_weight) ||
        safeNumber((item as any).weight) || 0;
      return sum + w;
    }, 0);

    return {
      count: items.length,
      weight: totalWeight,
      scanned: items.filter(i => i.scanned).length
    };
  }, [currentChecklist]);

  const handleFinalize = async () => {
    if (!driverName || !vehicleNumber) {
      toast.error("Haydovchi ismi va mashina raqami talab qilinadi");
      return;
    }

    if (!currentChecklist) return;

    try {
      await finalizeShipment(currentChecklist.id, {
        driverName,
        vehicleNumber,
        notes
      });
      toast.success("Yuk muvaffaqiyatli jo'natildi!");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('waybill-content');
    if (!printContent) return;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Yuk Xati - ${vehicleNumber}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @media print {
                body { padding: 0; margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = () => {
                window.print();
                window.close();
              };
            </script>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent p-8 lg:p-10 overflow-y-auto scrollbar-none animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto w-full space-y-8 pb-20">
        {/* Navbahor Premium Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 shadow-xl flex items-center justify-center border border-slate-50 dark:border-white/10 transition-all hover:scale-105 duration-500">
            <Truck className="h-6 w-6 text-primary" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none uppercase">Yukni <span className="text-primary italic">Rasmiylashtirish</span></h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Logistika va Yakuniy Sifat Nazorati</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Shipment Summary Card - Navbahor Fidelity */}
          <div className="xl:col-span-5 space-y-8">
            <Card className="border-slate-800 shadow-2xl rounded-3xl bg-slate-900 overflow-hidden relative group transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-60" />
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-[100px]" />

              <div className="relative p-8 lg:p-10 space-y-10 z-10">
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5">
                    <h3 className="text-white/30 text-[9px] font-bold uppercase tracking-[0.3em]">Yuklama Parametrlari</h3>
                    <p className="text-xl font-bold text-white tracking-tight uppercase leading-none">Logistika Summarisi</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                    <Package size={20} className="text-white/40" strokeWidth={2} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest leading-none mb-2.5">Jami Toylar</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-bold text-white font-mono tracking-tighter leading-none">{summary.count.toString().padStart(2, '0')}</p>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] leading-none mb-0.5">Dona</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest leading-none mb-2.5">Skanerlandi</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-bold text-primary font-mono tracking-tighter leading-none">{summary.scanned.toString().padStart(2, '0')}</p>
                      <p className="text-[9px] font-bold text-primary/30 uppercase tracking-[0.2em] leading-none mb-0.5">Dona</p>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-white/5 relative">
                  <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest leading-none mb-4">Umumiy Og&apos;irlik (Netto)</p>
                  <div className="flex items-center gap-5">
                    <p className="text-5xl font-bold font-mono tracking-tighter text-white tabular-nums leading-none">
                      {formatWeight(summary.weight, 'kg', 1).replace(/ [a-zA-Z]+$/, '')}
                    </p>
                    <div className="px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/20 leading-none">
                      KILOGRAMM
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl transition-all hover:bg-white/10">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center shadow-inner">
                    <CheckCircle2 className="text-emerald-500" size={22} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white tracking-tight uppercase leading-none">Tayyorlik Holati</p>
                    <p className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-widest mt-2 leading-none">Verifikatsiya Yakunlandi</p>
                  </div>
                </div>
              </div>
            </Card>

            <Button
              variant="ghost"
              onClick={() => setShowWaybill(true)}
              className="w-full h-14 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-sm font-bold uppercase tracking-widest text-[9px] text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:border-primary/20 dark:hover:border-primary/30 transition-all flex items-center justify-center gap-3"
            >
              <FileText className="h-4 w-4" strokeWidth={3} />
              Yuk Xatini Preview / Chop Etish
            </Button>
          </div>

          {/* Logistics Info Form - Navbahor Soft UI */}
          <div className="xl:col-span-7 space-y-10">
            <Card className="border-slate-100 dark:border-white/5 shadow-xl rounded-3xl bg-white dark:bg-slate-900/60 p-8 lg:p-10 relative overflow-hidden transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.02] rounded-bl-full pointer-events-none" />

              <h3 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.25em] mb-10 flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-primary/5 dark:bg-primary/20 flex items-center justify-center">
                  <Truck size={16} className="text-primary" strokeWidth={3} />
                </div>
                Transport va Ekspeditor Ma&apos;lumotlari
              </h3>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      Haydovchi <span className="text-primary italic">F.I.SH</span>
                    </label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" strokeWidth={3} />
                      <Input
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        placeholder="Azizov Anvar..."
                        className="h-14 pl-12 pr-6 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border-slate-100 dark:border-white/10 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm uppercase placeholder:normal-case placeholder:font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      Davlat <span className="text-primary italic">Raqami</span>
                    </label>
                    <div className="relative group">
                      <Truck className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" strokeWidth={3} />
                      <Input
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        placeholder="01 777 ABC"
                        className="h-14 pl-12 pr-6 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border-slate-100 dark:border-white/10 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm uppercase font-mono placeholder:normal-case placeholder:font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                    Qo&apos;shimcha <span className="text-primary italic">Izohlar</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Marshrut yoki maxsus ko'rsatmalar..."
                    className="w-full h-32 p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-white/10 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/5 transition-all font-medium text-sm outline-none resize-none placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner dark:text-white"
                  />
                </div>
              </div>
            </Card>

            <Button
              onClick={handleFinalize}
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-primary text-white font-bold uppercase tracking-[0.25em] text-[11px] shadow-2xl shadow-primary/20 hover:bg-[#047857] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Yukovani Yakunlash va Jo&apos;natish
                  <Send className="h-5 w-5 transition-transform group-hover:translate-x-2 group-hover:-translate-y-1 text-primary" strokeWidth={3} />
                </>
              )}
            </Button>
          </div>
        </div>

        <Modal
          isOpen={showWaybill}
          onClose={() => setShowWaybill(false)}
          size="xl"
          title="Yuk Xati (Waybill) Preview"
        >
          <div className="p-8 bg-white dark:bg-slate-950">
            <div className="mb-8 flex justify-end gap-3 no-print">
              <Button variant="ghost" className="h-11 px-6 rounded-xl font-bold uppercase text-[9px] tracking-widest text-slate-400 hover:text-slate-600" onClick={() => setShowWaybill(false)}>
                Bekor Qilish
              </Button>
              <Button className="h-11 px-8 rounded-xl bg-slate-900 text-white font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-slate-900/20" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-3" strokeWidth={3} /> Chop Etish
              </Button>
            </div>
            <div className="border border-slate-100 dark:border-white/5 rounded-3xl shadow-inner bg-white dark:bg-white p-10 min-h-[800px] overflow-hidden text-slate-900">
              {currentChecklist && (
                <PrintableWaybill
                  data={{
                    date: new Date().toISOString(),
                    customerName: currentOrder?.customerName || 'Noma\'lum Mijoz',
                    driverName: driverName || 'HAYDOVCHI TANLANMAGAN',
                    vehicleNumber: vehicleNumber || 'TRANS RAQAMI YO\'Q',
                    items: currentChecklist.items,
                    totalWeight: summary.weight,
                    notes: notes
                  }}
                />
              )}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}