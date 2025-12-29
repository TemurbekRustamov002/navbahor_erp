"use client";
import { useMemo } from "react";
import { formatWeight } from '@/lib/utils/number';
import { useWarehouseBackendStore } from "@/stores/warehouseBackendStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import {
  ClipboardCheck,
  Package,
  Scale,
  CheckCircle2,
  Clock,
  Printer,
  ArrowRight,
  Timer,
  List
} from "lucide-react";

export function ChecklistManager() {
  const { currentChecklist, currentOrder, setCurrentStep, loading } = useWarehouseBackendStore();
  const { toast } = useToast();

  const handleStartScanning = () => {
    if (!currentChecklist || !currentChecklist.items?.length) {
      toast.error("Checklist bo'sh yoki topilmadi");
      return;
    }
    setCurrentStep("scanning");
  };

  const status = useMemo(() => {
    const total = currentChecklist?.items?.length || 0;
    const scanned = currentChecklist?.items?.filter(i => i.scanned).length || 0;
    return {
      total,
      scanned,
      percent: total > 0 ? (scanned / total) * 100 : 0
    };
  }, [currentChecklist]);

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-transparent p-8 lg:p-10 overflow-y-auto scrollbar-none">
      <div className="max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-700">
        {/* Navbahor Premium Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary shadow-xl shadow-primary/5 flex items-center justify-center border border-primary/20">
              <ClipboardCheck className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Checklist <span className="text-primary italic">Nazorati</span></h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none">Buyurtma ID: #{currentOrder?.id?.slice(-8).toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-12 px-6 rounded-xl border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 font-bold uppercase tracking-widest text-[9px] hover:bg-slate-50 dark:hover:bg-white/10 dark:text-slate-200 transition-all">
              <Printer className="h-4 w-4 mr-2" strokeWidth={3} /> Chiqarish
            </Button>
            <Button
              onClick={handleStartScanning}
              className="h-12 px-8 rounded-xl bg-primary text-white font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:bg-[#047857] active:scale-95 transition-all"
            >
              Skanerlash <ArrowRight className="h-4 w-4 ml-2" strokeWidth={3} />
            </Button>
          </div>
        </div>

        {/* Soft UI Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-8 rounded-3xl border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-200/30 dark:shadow-black/20 group hover:scale-[1.02] transition-all duration-500">
            <div className="flex justify-between items-start mb-6">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">Jami Toylar</p>
              <div className="p-2.5 rounded-xl bg-primary/5 dark:bg-primary/20 text-primary">
                <Package size={18} strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter">{status.total.toString().padStart(2, '0')}</p>
              <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">Dona</p>
            </div>
          </Card>

          <Card className="p-8 rounded-3xl border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-200/30 dark:shadow-black/20 group hover:scale-[1.02] transition-all duration-500">
            <div className="flex justify-between items-start mb-6">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">Skanerlandi</p>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={18} strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-emerald-600 font-mono tracking-tighter">{status.scanned.toString().padStart(2, '0')}</p>
              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Dona</p>
            </div>
          </Card>

          <Card className="p-8 rounded-3xl border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-200/30 dark:shadow-black/20 group hover:scale-[1.02] transition-all duration-500 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl opacity-40" />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">Jarayon %</p>
              <div className="p-2.5 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                <Timer size={18} strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex items-center gap-5 relative z-10">
              <p className="text-4xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter leading-none">{status.percent.toFixed(0)}%</p>
              <div className="flex-1 h-2.5 bg-slate-50 dark:bg-white/10 rounded-full overflow-hidden shadow-inner border border-slate-100/50 dark:border-white/5">
                <div
                  className="h-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${status.percent}%` }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Premium Item List Table */}
        <Card className="border-slate-100 dark:border-white/5 shadow-2xl rounded-3xl bg-white dark:bg-slate-900/60 overflow-hidden animate-in fade-in duration-1000">
          <div className="p-6 lg:p-8 border-b border-slate-50 dark:border-white/5 flex items-center justify-between bg-white/40 dark:bg-white/5">
            <h3 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.25em] flex items-center gap-3">
              <List size={16} className="text-primary" strokeWidth={2.5} /> Checklist Elementlari
            </h3>
            <div className="px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 text-[9px] font-bold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest border border-slate-100 dark:border-white/5">
              TOTAL: {status.total} ITEMS
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/20 dark:bg-white/5">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-b border-slate-50 dark:border-white/5">Toy #</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-b border-slate-50 dark:border-white/5">Netto</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-b border-slate-50 dark:border-white/5">Skan Holati</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-b border-slate-50 dark:border-white/5">Vaqti</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-b border-slate-50 dark:border-white/5 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {currentChecklist?.items?.map((item) => (
                  <tr key={item.id} className="group hover:bg-primary/[0.01] dark:hover:bg-white/5 transition-colors duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-white dark:bg-white/5 shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center font-bold text-slate-900 dark:text-white font-mono text-base group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                          #{item.orderNo}
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">Toy Elementi</p>
                          <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest leading-none mt-1.5 font-mono">ID: {item.toyId.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Scale size={14} className="text-primary/40" strokeWidth={2.5} />
                        <span className="text-sm font-bold text-slate-900 dark:text-white font-mono italic">{item.netto ? formatWeight(item.netto, 'kg', 1) : "0.0 KG"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all duration-500",
                        item.scanned
                          ? "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20"
                          : "bg-slate-50 dark:bg-white/5 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-white/5"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", item.scanned ? "bg-emerald-500 scale-125" : "bg-slate-200 dark:bg-slate-700")} />
                        {item.scanned ? "Skanlandi" : "Kutilmoqda"}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono italic">
                        {item.scannedAt ? new Date(item.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Button variant="ghost" className="h-9 w-9 p-0 rounded-lg text-slate-200 dark:text-slate-700 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all">
                        <Printer size={16} strokeWidth={2.5} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div >
  );
}