"use client";

import { useEffect, useState, useMemo } from "react";
import { useBackendToyStore } from "@/stores/backendToyStore";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Loader2,
  Table as TableIcon,
  X,
  Package,
  Weight,
  FlaskConical,
  CheckCircle2,
  FileSpreadsheet,
  Search,
  Lock,
  AlertTriangle,
  FileCheck,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';
import { formatWeight, safeSum } from "@/lib/utils/number";
import { useToast } from "@/components/ui/Toast";

interface MarkaToysModalProps {
  markaId: string | null;
  markaName: string;
  onClose: () => void;
}

export function MarkaToysModal({ markaId, markaName, onClose }: MarkaToysModalProps) {
  const { toys, fetchToys, isLoading } = useBackendToyStore();
  const { updateStatus, getMarkaById } = useBackendMarkaStore();
  const { toast } = useToast();

  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'SOLD'>('ALL');

  const currentMarka = useMemo(() =>
    markaId ? getMarkaById(markaId) : null,
    [markaId, getMarkaById]
  );

  useEffect(() => {
    if (markaId) {
      fetchToys({ markaId });
    }
  }, [markaId, fetchToys]);

  // Enhanced Filter Logic
  const filteredToys = useMemo(() => {
    let list = toys.filter(t => t.markaId === markaId);

    // Status Filter
    if (statusFilter === 'AVAILABLE') list = list.filter(t => t.status !== 'SHIPPED');
    if (statusFilter === 'SOLD') list = list.filter(t => t.status === 'SHIPPED');

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t =>
        (t.orderNo?.toString() || "").includes(q) ||
        (t.labStatus?.toLowerCase() || "").includes(q) ||
        (t.id?.toLowerCase() || "").includes(q)
      );
    }

    return list.sort((a, b) => b.orderNo - a.orderNo);
  }, [toys, markaId, searchQuery, statusFilter]);

  const handleExport = () => {
    try {
      setExporting(true);
      const data = filteredToys.map(t => ({
        'Toy ID': t.id,
        'Raqam': t.orderNo,
        'Brutto (kg)': t.brutto,
        'Netto (kg)': t.netto,
        'Lab Holati': t.labStatus,
        'Holati': t.status === 'SHIPPED' ? 'SOTILGAN' : 'OMBORDA',
        'Sana': new Date(t.createdAt).toLocaleString()
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Toys");
      XLSX.writeFile(wb, `Marka_${markaName}_Reestri.xlsx`);
      toast.success("Hujjat muvaffaqiyatli yuklab olindi");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Eksport qilishda xatolik yuz berdi");
    } finally {
      setExporting(false);
    }
  };

  const handleCloseMarka = async () => {
    if (!markaId) return;
    setIsClosing(true);
    try {
      await updateStatus(markaId, 'CLOSED');
      toast.success("Marka muvaffaqiyatli yopildi");
    } catch (error: any) {
      toast.error(error.message || "Markani yopishda xatolik");
    } finally {
      setIsClosing(false);
    }
  };

  const totalWeight = safeSum(filteredToys, 'brutto');
  const availableToysCount = filteredToys.filter(t => t.status === 'IN_STOCK' || t.status === 'RESERVED').length;
  const isMarkaFull = (currentMarka?.toyCount || filteredToys.length) >= 220;
  const isClosed = currentMarka?.status === 'CLOSED';

  return (
    <Modal
      isOpen={!!markaId}
      onClose={onClose}
      className="w-full max-w-6xl md:w-[95vw] lg:w-[90vw] p-0 overflow-hidden rounded-[2rem] md:rounded-[3rem] border-white/50 bg-white/95 backdrop-blur-3xl shadow-2xl h-[92vh] flex flex-col transition-all duration-300"
    >
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 p-6 md:p-8 border-b border-slate-100 bg-white/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-primary text-white rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-primary/30 shrink-0 transform hover:rotate-3 transition-transform">
            <TableIcon size={32} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
              Marka <span className="text-primary italic">Reestri</span>
            </h2>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-mono font-bold tracking-widest shadow-lg shadow-black/10">
                #{markaName}
              </div>
              <div className="w-[1px] h-3 bg-slate-300" />
              <div className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5",
                isClosed ? "bg-slate-100 text-slate-500 border border-slate-200" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
              )}>
                <span className={cn("w-2 h-2 rounded-full", isClosed ? "bg-slate-400" : "bg-emerald-500 animate-pulse")} />
                {isClosed ? 'YOPILGAN' : 'FAOL'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {!isClosed && (
            <Button
              onClick={handleCloseMarka}
              disabled={isClosing}
              className={cn(
                "h-14 px-8 rounded-2xl transition-all duration-300 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2.5 shadow-xl",
                isMarkaFull
                  ? "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20 active:scale-95"
                  : "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200 shadow-amber-500/10 active:scale-95"
              )}
            >
              {isClosing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock size={18} strokeWidth={2.5} />}
              Markani Yopish
            </Button>
          )}

          <button
            onClick={onClose}
            className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 active:scale-90 transition-all shrink-0 group ml-2"
          >
            <X size={24} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 bg-gradient-to-b from-slate-50/50 to-white scroll-smooth scrollbar-thin scrollbar-thumb-slate-200">

        {/* Search and Filters Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-6 space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qidiruv Tizimi</label>
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} strokeWidth={2.5} />
              <Input
                placeholder="Toy raqami, laboratoriya holati orqali qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-16 pl-14 pr-6 bg-white border-2 border-slate-100 focus:border-primary/30 rounded-2xl text-[13px] font-bold shadow-sm focus:ring-8 focus:ring-primary/5 transition-all"
              />
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Statik Holat Filteri</label>
            <div className="flex p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 shadow-inner h-16">
              {[
                { label: 'Barchasi', value: 'ALL' },
                { label: 'Omborda', value: 'AVAILABLE' },
                { label: 'Sotilgan', value: 'SOLD' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value as any)}
                  className={cn(
                    "flex-1 h-full rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    statusFilter === opt.value
                      ? "bg-white text-primary shadow-lg shadow-black/5 border border-slate-100"
                      : "text-slate-400 hover:text-slate-600 hover:bg-white/40"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {isMarkaFull && !isClosed && (
            <div className="lg:col-span-3 h-16 bg-red-50 border border-red-100 rounded-2xl px-6 flex items-center gap-4 animate-in slide-in-from-right-10 shadow-lg shadow-red-500/5">
              <AlertTriangle className="text-red-500 shrink-0" size={24} strokeWidth={2.5} />
              <div>
                <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">Marka Rezervi To'lgan</p>
                <p className="text-[11px] font-bold text-red-600 leading-tight">220 ta toyga yetdi. Yopish shart!</p>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Monitoring Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Jami Toylar', value: filteredToys.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
            { label: 'Filtrlangan Vazn', value: `${formatWeight(totalWeight)} kg`, icon: Weight, color: 'text-primary', bg: 'bg-emerald-50', border: 'border-emerald-100' },
            { label: 'Mavjud Zaxira', value: availableToysCount, icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
            { label: 'Sifat Tekshiruvi', value: filteredToys.filter(t => t.labStatus === 'APPROVED').length, icon: FlaskConical, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' }
          ].map((stat, i) => (
            <div key={i} className={cn("p-6 bg-white rounded-3xl border-2 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300", stat.border)}>
              <div className="flex items-center gap-5">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner", stat.bg)}>
                  <stat.icon size={26} strokeWidth={2} className={stat.color} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-900 tracking-tighter leading-none font-mono">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Industrial Grade Data Matrix */}
        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-100">
                  {['Toy Raqami', 'Ombor Holati', 'Brutto Og\'irlik', 'Netto Og\'irlik', 'Lab Analizi', 'Yaratilgan Sana'].map((h, i) => (
                    <th key={i} className="py-6 px-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-32 text-center">
                      <div className="relative inline-block">
                        <Loader2 className="h-14 w-14 text-primary animate-spin mx-auto opacity-20" />
                        <Loader2 className="h-10 w-10 text-primary animate-spin absolute inset-0 m-auto" />
                      </div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-8">Ma'lumotlar yuklanmoqda...</p>
                    </td>
                  </tr>
                ) : filteredToys.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-32 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Markada toylar topilmadi</p>
                      <p className="text-[10px] font-medium text-slate-300 mt-2 italic">Qidiruv yoki filter parametrlarini o'zgartirib ko'ring</p>
                    </td>
                  </tr>
                ) : (
                  filteredToys.map((toy) => (
                    <tr key={toy.id} className="hover:bg-primary/[0.03] transition-all duration-300 group">
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">#</div>
                          <span className="font-mono text-base font-black text-slate-900 leading-none">#{toy.orderNo}</span>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2",
                          toy.status !== 'SHIPPED'
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", toy.status !== 'SHIPPED' ? "bg-emerald-500" : "bg-slate-400")} />
                          {toy.status !== 'SHIPPED' ? 'OMBORDA' : 'SOTILGAN'}
                        </span>
                      </td>
                      <td className="py-6 px-8">
                        <span className="text-base font-bold text-slate-900 tabular-nums font-mono">{formatWeight(toy.brutto)} <span className="text-[10px] font-black text-slate-400">KG</span></span>
                      </td>
                      <td className="py-6 px-8">
                        <span className="text-base font-bold text-slate-900 tabular-nums font-mono">{formatWeight(toy.netto)} <span className="text-[10px] font-black text-slate-400">KG</span></span>
                      </td>
                      <td className="py-6 px-8">
                        <span className={cn(
                          "text-[10px] font-black px-4 py-2 rounded-xl uppercase inline-flex items-center gap-2 border shadow-sm",
                          toy.labStatus === 'APPROVED' ? "bg-white text-emerald-600 border-emerald-100" :
                            toy.labStatus === 'REJECTED' ? "bg-white text-red-600 border-red-100" :
                              "bg-white text-slate-400 border-slate-100"
                        )}>
                          {toy.labStatus === 'APPROVED' ? <FileCheck size={14} strokeWidth={2.5} /> : <FlaskConical size={14} strokeWidth={2.5} />}
                          {toy.labStatus || 'KUTILMOQDA'}
                        </span>
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">{new Date(toy.createdAt).toLocaleDateString()}</span>
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{new Date(toy.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Persistent Action Footer HUD */}
      <div className="flex-shrink-0 p-6 md:p-10 border-t-2 border-slate-100 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.02)] flex flex-col md:flex-row justify-between items-center gap-8 z-10">
        <div className="flex flex-col items-center md:items-start">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Tizim Ma'lumotlari: Navbahor Tekstil ERP</p>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic flex items-center gap-2">
            <CheckCircle2 size={12} className="text-primary" /> Barcha toy ma'lumotlari tarozi va laboratoriya orqali tasdiqlangan
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="hidden lg:flex items-center gap-4 mr-6 px-6 border-r-2 border-slate-100">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Reestr Hajmi</p>
              <p className="text-lg font-black text-slate-900 font-mono italic">{(totalWeight / 1000).toFixed(2)} TN</p>
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={exporting || filteredToys.length === 0}
            className="w-full md:w-auto h-16 px-10 rounded-[1.5rem] bg-slate-900 text-white hover:bg-black shadow-2xl shadow-slate-900/40 active:scale-95 transition-all text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4"
          >
            {exporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileSpreadsheet size={22} strokeWidth={2.5} />}
            Eksport Qilish (.xlsx)
          </Button>
        </div>
      </div>
    </Modal>
  );
}