"use client";
import { useState, useEffect, useMemo } from "react";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
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

  return (
    <div className="min-h-screen bg-[#f0fdf4] flex flex-col animate-in fade-in duration-500">
      {/* Premium Navigation Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/50 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <button
              onClick={() => router.push('/dashboard')}
              className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 transition-transform group-hover:-translate-x-1">
                <ArrowLeft size={18} strokeWidth={2} />
              </div>
              Bosh Sahifa
            </button>

            <div className="w-[1px] h-8 bg-slate-200" />

            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-[1.2rem] bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                <Package size={24} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight leading-none">Mahsulot Markalari</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Jonli Inventarizatsiya
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-8 mr-6 px-8 border-x border-slate-100">
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Jami Markalar</p>
                <p className="text-xl font-bold text-slate-900 font-mono tracking-tighter leading-none">{markas.length}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Faol Markalar</p>
                <p className="text-xl font-bold text-primary font-mono tracking-tighter leading-none">{markas.filter(m => m.status === 'ACTIVE').length}</p>
              </div>
            </div>

            <Button
              onClick={() => setShowForm(!showForm)}
              className={cn(
                "h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center gap-3",
                showForm
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                  : "bg-primary text-white shadow-xl shadow-primary/20 hover:bg-green-700"
              )}
            >
              {showForm ? <Plus size={18} className="rotate-45" /> : <Plus size={18} />}
              {showForm ? "Yopish" : "Yangi Marka"}
            </Button>

            <Button
              variant="outline"
              onClick={() => exportAllMarkasToExcel()}
              className="h-12 px-6 rounded-xl border-white/50 bg-white/60 backdrop-blur-md text-emerald-600 hover:text-emerald-700 active:scale-95 shadow-sm flex items-center gap-3"
            >
              <FileSpreadsheet size={18} />
              <span className="hidden md:inline">Excelga Yuklash</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => fetchMarkas()}
              disabled={isLoading}
              className="h-12 w-12 rounded-xl border-white/50 bg-white/60 backdrop-blur-md text-slate-600 hover:text-primary active:scale-95 shadow-sm p-0 flex items-center justify-center"
            >
              <RefreshCw size={20} className={cn(isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard Layout */}
      <main className="max-w-[1600px] mx-auto w-full px-8 py-10 space-y-10">

        {/* Parametric Input Section */}
        {showForm && (
          <div className="animate-in slide-in-from-top-6 fade-in duration-500">
            <MarkaForm onSuccess={() => { setShowForm(false); fetchMarkas(); }} />
          </div>
        )}

        {/* Global Control HUD */}
        <div className="bg-white/80 backdrop-blur-lg border border-white/50 rounded-[2.5rem] p-8 shadow-xl shadow-black/5 flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in duration-700">
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} strokeWidth={2} />
            <Input
              placeholder="Markani qidirish (ID, Mahsulot turi, PTM)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-15 pl-16 pr-10 bg-slate-50/50 border-none rounded-2xl text-[13px] font-bold text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="h-15 px-6 bg-white/40 border border-white/60 rounded-2xl flex items-center gap-4 shadow-sm">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                  statusFilter === 'ALL' ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Barchasi
              </button>
              <div className="w-[1px] h-4 bg-slate-200" />
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all",
                  statusFilter === 'ACTIVE' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:bg-emerald-50"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", statusFilter === 'ACTIVE' ? "bg-white" : "bg-emerald-500")} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Faol</span>
              </button>
              <button
                onClick={() => setStatusFilter('PAUSED')}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all",
                  statusFilter === 'PAUSED' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "text-slate-500 hover:bg-amber-50"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", statusFilter === 'PAUSED' ? "bg-white" : "bg-amber-500")} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Pauza</span>
              </button>
              <button
                onClick={() => setStatusFilter('CLOSED')}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all",
                  statusFilter === 'CLOSED' ? "bg-slate-500 text-white shadow-lg shadow-slate-500/20" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", statusFilter === 'CLOSED' ? "bg-white" : "bg-slate-300")} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Yopiq</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Grid Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {filteredMarkas.length > 0 ? (
            filteredMarkas.map((marka) => (
              <MarkaCard key={marka.id} marka={marka} />
            ))
          ) : (
            <div className="col-span-full py-20 bg-white/40 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center opacity-60">
              <Database size={60} strokeWidth={1} className="text-slate-300 mb-6 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">Ma'lumotlar Topilmadi</h3>
              <p className="text-[11px] font-medium text-slate-400 mt-2 italic">Tizimda sizning so'rovingiz bo'yicha hech qanday obyekt aniqlanmadi</p>
            </div>
          )}
        </div>

        {/* Dynamic Pagination HUD */}
        {filteredMarkas.length > 0 && (
          <div className="pt-10 flex items-center justify-between border-t border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                <Monitor size={18} strokeWidth={2} className="text-primary" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">REESTR MONITORING: <span className="text-primary">{filteredMarkas.length} OBYEKT</span></p>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" disabled className="h-12 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest opacity-30">Oldingi</Button>
              <div className="flex items-center gap-2">
                <span className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-900 shadow-sm">1</span>
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-slate-400">2</span>
                <span className="text-slate-300">...</span>
              </div>
              <Button variant="ghost" className="h-12 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 transition-all">Keyingi <ChevronRight size={14} className="ml-2" /></Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
