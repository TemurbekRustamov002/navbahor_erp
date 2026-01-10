"use client";
import { useState, useEffect, useMemo } from "react";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { Marka } from "@/types/marka";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  Tag,
  Download,
  Filter,
  ArrowLeft,
  ChevronRight,
  Database,
  Monitor,
  FileSpreadsheet
} from "lucide-react";
import { useRouter } from "next/navigation";
import { MarkaCard } from "./MarkaCard";
import { MarkaForm } from "./MarkaForm";
import { exportAllMarkasToExcel } from "@/lib/utils/markaExport";

export default function MarkaPage() {
  const router = useRouter();
  const { markas, fetchMarkas, isLoading } = useBackendMarkaStore();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'CLOSED'>('ALL');

  useEffect(() => {
    fetchMarkas({}, false);
  }, [fetchMarkas]);

  const filteredMarkas = useMemo(() => {
    let list = markas;

    if (statusFilter !== 'ALL') {
      list = list.filter(m => m.status === statusFilter);
    }

    return list.filter(m =>
      m.number.toString().includes(searchQuery) ||
      m.productType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.ptm?.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [markas, searchQuery, statusFilter]);

  const counts = useMemo(() => ({
    ALL: markas.length,
    ACTIVE: markas.filter(m => m.status === 'ACTIVE').length,
    PAUSED: markas.filter(m => m.status === 'PAUSED').length,
    CLOSED: markas.filter(m => m.status === 'CLOSED').length,
  }), [markas]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col animate-in fade-in duration-500">
      {/* Ultra-Slim Premium Header */}
      <header className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                <Package size={18} strokeWidth={2.5} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Markalar</h1>
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Control Panel</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-6 ml-2 pl-6 border-l border-slate-200 dark:border-white/5">
              <div className="text-left">
                <p className="text-[6.5px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Jami</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white font-mono leading-none">{markas.length}</p>
              </div>
              <div className="text-left">
                <p className="text-[6.5px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Faol</p>
                <p className="text-xs font-bold text-primary font-mono leading-none">{markas.filter((m: Marka) => m.status === 'ACTIVE').length}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowForm(!showForm)}
              className={cn(
                "h-9 px-4 rounded-lg font-bold uppercase tracking-widest text-[9px] transition-all active:scale-95 flex items-center gap-2",
                showForm
                  ? "bg-slate-950 text-white"
                  : "bg-primary text-white shadow-md shadow-primary/10 hover:bg-green-700"
              )}
            >
              {showForm ? <Plus size={12} className="rotate-45" /> : <Plus size={12} />}
              <span>{showForm ? "Yopish" : "Yangi"}</span>
            </Button>

            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await exportAllMarkasToExcel();
                } catch (error: any) {
                  console.error('Export error:', error);
                }
              }}
              className="h-9 px-3 rounded-lg border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-widest active:scale-95 flex items-center gap-2"
            >
              <FileSpreadsheet size={14} />
              <span className="hidden md:inline">Eksport</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => fetchMarkas()}
              disabled={isLoading}
              className="h-9 w-9 rounded-lg border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-primary active:scale-95 p-0 flex items-center justify-center"
            >
              <RefreshCw size={14} className={cn(isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard Layout */}
      <main className="max-w-[1600px] mx-auto w-full px-5 py-5 space-y-6">

        {/* Parametric Input Section */}
        {showForm && (
          <div className="animate-in slide-in-from-top-6 fade-in duration-500">
            <MarkaForm onSuccess={() => { setShowForm(false); fetchMarkas(); }} />
          </div>
        )}

        {/* Floating Search & Status HUD */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" size={16} strokeWidth={2.5} />
            </div>
            <Input
              placeholder="Markani qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 pl-11 pr-4 bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/5 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center p-1 bg-slate-100/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl shadow-inner">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={cn(
                "px-4 h-9 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                statusFilter === 'ALL'
                  ? "bg-slate-900 dark:bg-white dark:text-black text-white shadow-md shadow-black/10"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10"
              )}
            >
              <span>Barchasi</span>
              <span className={cn("px-1.5 py-0.5 rounded-md text-[8px]", statusFilter === 'ALL' ? "bg-white/20 dark:bg-black/10" : "bg-slate-200 dark:bg-white/10")}>{counts.ALL}</span>
            </button>
            <div className="w-[1px] h-3 bg-slate-200 dark:bg-white/10 mx-1" />
            <div className="flex items-center gap-0.5">
              {[
                { id: 'ACTIVE', label: 'Faol', color: 'bg-emerald-500' },
                { id: 'PAUSED', label: 'Pauza', color: 'bg-amber-500' },
                { id: 'CLOSED', label: 'Yopiq', color: 'bg-slate-500' }
              ].map((status) => (
                <button
                  key={status.id}
                  onClick={() => setStatusFilter(status.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-3 h-9 rounded-lg transition-all",
                    statusFilter === status.id
                      ? "bg-white dark:bg-white/10 shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  )}
                >
                  <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]", status.color)} />
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-widest",
                    statusFilter === status.id ? "text-slate-900 dark:text-white" : "text-slate-500"
                  )}>{status.label}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-md text-[8px] font-bold",
                    statusFilter === status.id ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white" : "bg-slate-200/50 dark:bg-white/5 text-slate-400"
                  )}>
                    {counts[status.id as keyof typeof counts]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Grid Matrix - Optimized for 4-5 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredMarkas.length > 0 ? (
            filteredMarkas.map((marka) => (
              <MarkaCard key={marka.id} marka={marka} />
            ))
          ) : (
            <div className="col-span-full py-20 bg-white/20 dark:bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-dashed border-white/40 dark:border-white/10 flex flex-col items-center justify-center opacity-80">
              <Database size={60} strokeWidth={1} className="text-slate-300 dark:text-slate-700 mb-6 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Ma'lumotlar Topilmadi</h3>
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-600 mt-2 italic">Tizimda sizning so'rovingiz bo'yicha hech qanday obyekt aniqlanmadi</p>
            </div>
          )}
        </div>

        {/* Dynamic Pagination HUD */}
        {filteredMarkas.length > 0 && (
          <div className="pt-10 flex items-center justify-between border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                <Monitor size={18} strokeWidth={2} className="text-primary" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">REESTR MONITORING: <span className="text-primary">{filteredMarkas.length} OBYEKT</span></p>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" disabled className="h-12 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest opacity-30">Oldingi</Button>
              <div className="flex items-center gap-2">
                <span className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white shadow-sm">1</span>
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-slate-400 dark:text-slate-600">2</span>
                <span className="text-slate-300 dark:text-slate-800">...</span>
              </div>
              <Button variant="ghost" className="h-12 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 transition-all">Keyingi <ChevronRight size={14} className="ml-2" /></Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
