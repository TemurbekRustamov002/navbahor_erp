"use client";
import { useState, useMemo } from "react";
import { useBackendLabStore } from "@/stores/backendLabStore";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { useBackendToyStore } from "@/stores/backendToyStore";
import { useAuthStore } from "@/stores/authStore";
import { LabSample } from "@/types/lab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";
import {
  FlaskConical,
  Search,
  Filter,
  X,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  FileText,
  TrendingUp,
  Award,
  AlertCircle,
  Calendar,
  Package,
  ArrowDown
} from "lucide-react";
import { exportFilteredLabSamplesToExcel, exportQualityCertificatePDF } from "@/lib/utils/labExport";

interface ProfessionalLabResultsTableProps {
  onSampleEdit: (sample: LabSample) => void;
  onSampleApproval?: (sample: LabSample) => void;
}

export function ProfessionalLabResultsTable({ onSampleEdit, onSampleApproval }: ProfessionalLabResultsTableProps) {
  const { samples, toggleShowToSales, deleteSample, approveSample, rejectSample, fetchSamples } = useBackendLabStore();
  const { markas } = useBackendMarkaStore();
  const { toys } = useBackendToyStore();
  const { user } = useAuthStore();

  const isAdmin = user?.role === "ADMIN" || user?.role === "LAB";

  // Filters
  const [search, setSearch] = useState("");
  const [markaFilter, setMarkaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "PENDING" | "APPROVED" | "REJECTED">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const itemsPerPage = 12;

  const filteredSamples = useMemo(() => {
    return samples.filter(sample => {
      const toy = toys.find(t => t.id === (sample.toyId || sample.sourceId));

      const matchesSearch = !search ||
        (toy?.orderNo?.toString().includes(search)) ||
        (sample.markaLabel?.toLowerCase().includes(search.toLowerCase())) ||
        (sample.comment?.toLowerCase().includes(search.toLowerCase()));

      const matchesMarka = !markaFilter || sample.markaId === markaFilter;
      const matchesStatus = statusFilter === "all" || sample.status === statusFilter;

      const sampleDate = new Date(sample.createdAt).toISOString().split('T')[0];
      const matchesDateFrom = !dateFrom || sampleDate >= dateFrom;
      const matchesDateTo = !dateTo || sampleDate <= dateTo;

      return matchesSearch && matchesMarka && matchesStatus && matchesDateFrom && matchesDateTo;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [samples, toys, search, markaFilter, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredSamples.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSamples = filteredSamples.slice(startIndex, startIndex + itemsPerPage);

  const clearFilters = () => {
    setSearch("");
    setMarkaFilter("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const handleQuickApprove = async (sample: LabSample) => {
    const toyId = sample.toyId || sample.sourceId || "";
    if (!toyId) return;
    try {
      await approveSample(toyId);
    } catch (error: any) {
      console.error("Approval failed:", error);
    }
  };

  const handleQuickReject = async (sample: LabSample) => {
    const reason = prompt("Rad etish sababi:", "Sifat talablariga javob bermaydi");
    if (!reason) return;
    const toyId = sample.toyId || sample.sourceId || "";
    if (!toyId) return;
    try {
      await rejectSample(toyId, reason);
    } catch (error: any) {
      console.error("Rejection failed:", error);
    }
  };

  const handleDelete = async (sample: LabSample) => {
    if (window.confirm("Tahlilni o'chirishni tasdiqlaysizmi?")) {
      try {
        await deleteSample(sample.id);
      } catch (error: any) {
        console.error("Delete failed:", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search & Filter Bar - Advanced Glassmorphism */}
      <div className="p-8 bg-white/60 backdrop-blur-xl border border-white/60 rounded-[3rem] shadow-2xl mb-10 transition-all hover:shadow-primary/5">
        <div className="flex flex-col xl:flex-row items-center gap-6">
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary h-5 w-5" strokeWidth={2.5} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Toy #, Marka yoki Izoh qidirish..."
              className="h-14 pl-16 pr-6 rounded-2xl bg-white/50 border-slate-100 font-bold text-sm shadow-inner focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all uppercase placeholder:normal-case placeholder:text-slate-300 placeholder:font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            <div className="flex items-center gap-4 flex-1 xl:flex-none">
              <div className="relative flex-1 xl:w-60">
                <select
                  value={markaFilter}
                  onChange={(e) => setMarkaFilter(e.target.value)}
                  className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-100 font-bold text-[10px] uppercase tracking-[0.2em] outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer appearance-none shadow-sm"
                >
                  <option value="">BARCHASI (MARKA)</option>
                  {markas.map(m => <option key={m.id} value={m.id}>Marka #{m.number}</option>)}
                </select>
                <ArrowDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
              </div>

              <div className="relative flex-1 xl:w-56">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full h-14 px-6 rounded-2xl bg-white border border-slate-100 font-bold text-[10px] uppercase tracking-[0.2em] outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer appearance-none shadow-sm"
                >
                  <option value="all">BARCHASI (HOLAT)</option>
                  <option value="PENDING">KUTILMOQDA</option>
                  <option value="APPROVED">TASDIQLANGAN</option>
                  <option value="REJECTED">RAD ETILGAN</option>
                </select>
                <ArrowDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={clearFilters}
              className="h-14 w-14 rounded-2xl bg-white border border-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm active:scale-90 flex items-center justify-center shrink-0"
            >
              <X className="h-5 w-5" strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto pr-2 scrollbar-none">
        <table className="w-full border-separate border-spacing-y-4">
          <thead>
            <tr className="bg-transparent">
              {["Tahlil Ob'yekti", "Nav / Sinf", "Namlik", "Ifloslik", "Pishiqlik", "Sanasi", "Amallar"].map((h, i) => (
                <th key={i} className={cn(
                  "px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]",
                  i === 0 ? "text-left" : i === 6 ? "text-right" : "text-center"
                )}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedSamples.map((sample) => {
              const toy = toys.find(t => t.id === (sample.toyId || sample.sourceId));
              return (
                <tr key={sample.id} className="group transition-all duration-300">
                  <td className="px-8 py-6 bg-white/80 backdrop-blur-md rounded-l-[2rem] border-y border-l border-white/60 transition-all shadow-sm group-hover:bg-white group-hover:shadow-xl group-hover:shadow-primary/5">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white shadow-md border border-slate-50 text-slate-900 rounded-2xl flex items-center justify-center font-bold font-mono text-lg ring-1 ring-slate-100 transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                        #{toy?.orderNo || "???"}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-bold text-slate-900 uppercase tracking-tight">#{sample.markaLabel || "NOMA'LUM"}</span>
                          <div className={cn(
                            "px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border transition-all shadow-sm",
                            sample.status === "APPROVED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              sample.status === "REJECTED" ? "bg-rose-50 text-rose-600 border-rose-100" :
                                "bg-amber-50 text-amber-600 border-amber-100"
                          )}>
                            {sample.status}
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                          {Number(toy?.netto || 0).toFixed(1)} KG
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 bg-white/80 backdrop-blur-md border-y border-white/60 text-center transition-all shadow-sm group-hover:bg-white">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-900 tracking-tight">{sample.navi}-NAV</span>
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border shadow-sm",
                        sample.grade === "OLIY" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          sample.grade === "YAXSHI" ? "bg-blue-50 text-blue-600 border-blue-100" :
                            "bg-amber-50 text-amber-600 border-amber-100"
                      )}>
                        {sample.grade}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 bg-white/80 backdrop-blur-md border-y border-white/60 text-center transition-all shadow-sm group-hover:bg-white">
                    <span className="text-sm font-bold text-blue-500 font-mono tracking-tighter">{sample.moisture}%</span>
                  </td>
                  <td className="px-8 py-6 bg-white/80 backdrop-blur-md border-y border-white/60 text-center transition-all shadow-sm group-hover:bg-white">
                    <span className="text-sm font-bold text-rose-500 font-mono tracking-tighter">{sample.trash}%</span>
                  </td>
                  <td className="px-8 py-6 bg-white/80 backdrop-blur-md border-y border-white/60 text-center transition-all shadow-sm group-hover:bg-white">
                    <span className="text-sm font-bold text-primary font-mono tracking-tighter">{sample.strength}</span>
                  </td>
                  <td className="px-8 py-6 bg-white/80 backdrop-blur-md border-y border-white/60 text-center transition-all shadow-sm group-hover:bg-white">
                    <div className="inline-flex flex-col items-center px-3 py-1.5 bg-slate-50/50 rounded-xl border border-slate-100 shadow-inner">
                      <span className="text-[11px] font-bold text-slate-900 font-mono">
                        {new Date(sample.createdAt).toLocaleDateString("uz-UZ", { day: '2-digit', month: '2-digit' })}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 font-mono">
                        {new Date(sample.createdAt).toLocaleTimeString("uz-UZ", { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 bg-white/80 backdrop-blur-md rounded-r-[2rem] border-y border-r border-white/60 transition-all shadow-sm group-hover:bg-white">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                      {isAdmin && sample.status === "PENDING" && (
                        <>
                          <Button
                            onClick={() => handleQuickApprove(sample)}
                            className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10 border border-emerald-100 flex items-center justify-center p-0"
                          >
                            <CheckCircle2 size={18} strokeWidth={2.5} />
                          </Button>
                          <Button
                            onClick={() => handleQuickReject(sample)}
                            className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10 border border-rose-100 flex items-center justify-center p-0"
                          >
                            <XCircle size={18} strokeWidth={2.5} />
                          </Button>
                        </>
                      )}
                      {sample.status === "APPROVED" && (
                        <Button
                          onClick={() => exportQualityCertificatePDF(sample.toyId || (sample as any).sourceId || '', toy?.orderNo)}
                          title="Sifat Sertifikati (PDF)"
                          className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-500/10 border border-blue-100 flex items-center justify-center p-0"
                        >
                          <FileText size={18} strokeWidth={2.5} />
                        </Button>
                      )}
                      <Button
                        onClick={() => onSampleEdit(sample)}
                        className="h-10 w-10 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10 border border-primary/20 flex items-center justify-center p-0"
                      >
                        <Edit size={18} strokeWidth={2.5} />
                      </Button>
                      {isAdmin && (
                        <Button
                          onClick={() => handleDelete(sample)}
                          className="h-10 w-10 rounded-xl bg-slate-900 text-white hover:bg-rose-600 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center p-0"
                        >
                          <Trash2 size={18} strokeWidth={2.5} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer - Navbahor Soft UI */}
      <div className="mt-10 p-8 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/60 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp size={18} className="text-primary" />
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            MA&apos;LUMOTLAR: <span className="text-slate-900 ml-2 font-mono">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSamples.length)} / {filteredSamples.length} TAHLIL</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="h-12 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-white border border-slate-100 hover:bg-slate-50 transition-all disabled:opacity-20 shadow-sm active:scale-95"
          >
            Oldingi
          </Button>
          <div className="flex items-center gap-2 font-mono">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "w-10 h-10 rounded-xl text-[11px] font-bold transition-all border",
                  currentPage === i + 1
                    ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-110 z-10"
                    : "bg-white text-slate-400 border-slate-100 hover:bg-white hover:text-primary hover:border-primary/20"
                )}
              >
                {(i + 1).toString().padStart(2, '0')}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="h-12 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-white border border-slate-100 hover:bg-slate-50 transition-all disabled:opacity-20 shadow-sm active:scale-95"
          >
            Keyingi
          </Button>
        </div>
      </div>
    </div>
  );
}
