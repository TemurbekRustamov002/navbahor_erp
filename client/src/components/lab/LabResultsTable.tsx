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
  ArrowDown
} from "lucide-react";

interface LabResultsTableProps {
  onSampleEdit: (sample: LabSample) => void;
  onSampleApproval?: (sample: LabSample) => void;
}

export function LabResultsTable({ onSampleEdit, onSampleApproval }: LabResultsTableProps) {
  const { samples, toggleShowToSales, deleteSample, approveSample, rejectSample } = useBackendLabStore();
  const { markas } = useBackendMarkaStore();
  const { toys } = useBackendToyStore();
  const { user } = useAuthStore();

  const isAdmin = user?.role === "ADMIN";

  // Filters
  const [search, setSearch] = useState("");
  const [markaFilter, setMarkaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "PENDING" | "APPROVED" | "REJECTED">("all");
  const [gradeFilter, setGradeFilter] = useState("");
  const [analystFilter, setAnalystFilter] = useState("");
  const [showToSalesFilter, setShowToSalesFilter] = useState<"all" | "yes" | "no">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Get unique values for filters
  const uniqueMarkas = Array.from(new Set(samples.map(s => s.markaId)))
    .map(id => markas.find(m => m.id === id))
    .filter(Boolean);

  const uniqueGrades = Array.from(new Set(samples.map(s => s.grade)));
  const uniqueAnalysts = Array.from(new Set(samples.map(s => s.analyst).filter(Boolean)));

  // Apply filters
  const filteredSamples = useMemo(() => {
    return samples.filter(sample => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const searchText = `${sample.markaLabel} ${sample.comment || ''} #${sample.sourceId}`.toLowerCase();
        if (!searchText.includes(searchLower)) return false;
      }

      // Marka filter
      if (markaFilter && sample.markaId !== markaFilter) return false;

      // Status filter
      if (statusFilter !== "all" && sample.status !== statusFilter) return false;

      // Grade filter
      if (gradeFilter && sample.grade !== gradeFilter) return false;

      // Analyst filter
      if (analystFilter && sample.analyst !== analystFilter) return false;

      // Show to warehouse filter
      if (showToSalesFilter === "yes" && !sample.showToWarehouse) return false;
      if (showToSalesFilter === "no" && sample.showToWarehouse) return false;

      // Date filter
      if (dateFrom && sample.createdAt < dateFrom) return false;
      if (dateTo && sample.createdAt > `${dateTo}T23:59:59`) return false;

      return true;
    });
  }, [samples, search, markaFilter, statusFilter, gradeFilter, analystFilter, showToSalesFilter, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.ceil(filteredSamples.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSamples = filteredSamples.slice(startIndex, startIndex + itemsPerPage);

  const clearFilters = () => {
    setSearch("");
    setMarkaFilter("");
    setStatusFilter("all");
    setGradeFilter("");
    setAnalystFilter("");
    setShowToSalesFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "approved": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "rejected": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING": return "Kutilmoqda";
      case "APPROVED": return "Savdoda ko'rinadi";
      case "REJECTED": return "Rad etilgan";
      default: return status;
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "Oliy": return "text-green-700 dark:text-emerald-400 bg-green-100 dark:bg-emerald-950/30 border-green-200 dark:border-emerald-800/30";
      case "Yaxshi": return "text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/30";
      case "O'rta": return "text-yellow-700 dark:text-amber-400 bg-yellow-100 dark:bg-amber-950/30 border-yellow-200 dark:border-amber-800/30";
      case "Oddiy": return "text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/30";
      case "Iflos": return "text-red-700 dark:text-rose-400 bg-red-100 dark:bg-rose-950/30 border-red-200 dark:border-rose-800/30";
      default: return "text-gray-700 dark:text-slate-400 bg-gray-100 dark:bg-slate-800/30 border-gray-200 dark:border-slate-700/30";
    }
  };

  const handleApprove = (sample: LabSample) => {
    approveSample(sample.toyId);
  };

  const handleReject = (sample: LabSample) => {
    rejectSample(sample.toyId);
  };

  const handleDelete = (sample: LabSample) => {
    if (window.confirm("Bu tahlilni o'chirishni tasdiqlaysizmi?")) {
      deleteSample(sample.toyId);
    }
  };

  return (
    <Card className="border-none shadow-2xl rounded-[3rem] bg-white/40 dark:bg-slate-900/60 dark:backdrop-blur-3xl overflow-hidden animate-in fade-in duration-700">
      <CardHeader className="p-10 border-b border-white/20 dark:border-white/5 bg-white/20 dark:bg-black/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform hover:rotate-6">
              <FlaskConical size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground dark:text-white uppercase tracking-tight leading-none mb-1">
                Laboratoriya <span className="text-primary italic">Natijalari</span>
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black text-muted-foreground/60 dark:text-slate-500 uppercase tracking-widest">
                  Jami: {filteredSamples.length} tahlil aniqlandi
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* TODO: Export */ }}
              className="h-12 px-6 rounded-xl border-white/50 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 font-black text-[10px] uppercase tracking-widest shadow-sm transition-all active:scale-95"
            >
              <Download className="h-4 w-4 mr-2 text-primary" strokeWidth={2.5} />
              Eksport (.xlsx)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-12 w-12 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 text-slate-400 dark:text-slate-600 transition-all active:scale-95"
            >
              <X size={20} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 space-y-10">
        {/* Modern Filter Engine */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {/* Search */}
          <div className="space-y-3">
            <Label className="text-[10px] font-black text-muted-foreground/50 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Qidirish</Label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Marka, izoh..."
                className="pl-12 h-12 rounded-xl bg-white/50 dark:bg-black/40 border-white/50 dark:border-white/10 text-slate-900 dark:text-white focus:border-primary focus:ring-primary/5 transition-all font-bold text-sm"
              />
            </div>
          </div>

          {[
            { label: "Marka", value: markaFilter, setter: setMarkaFilter, options: uniqueMarkas.map(m => ({ value: m?.id, label: `#${m?.number} - ${m?.ptm}` })), placeholder: "Barcha markalar" },
            { label: "Holati", value: statusFilter, setter: setStatusFilter, options: [{ value: "all", label: "Barchasi" }, { value: "PENDING", label: "Kutilmoqda" }, { value: "APPROVED", label: "Tasdiqlangan" }, { value: "REJECTED", label: "Rad etilgan" }], placeholder: "Holat" },
            { label: "Sinf (Grade)", value: gradeFilter, setter: setGradeFilter, options: uniqueGrades.map(g => ({ value: g, label: g })), placeholder: "Sinf" },
            { label: "Tahlilchi", value: analystFilter, setter: setAnalystFilter, options: uniqueAnalysts.filter(Boolean).map(a => ({ value: a, label: a })), placeholder: "Tahlilchi" },
            { label: "Sotuvga", value: showToSalesFilter, setter: setShowToSalesFilter, options: [{ value: "all", label: "Barchasi" }, { value: "yes", label: "Ko'rinadigan" }, { value: "no", label: "Yashirin" }], placeholder: "Sotuv holati" }
          ].map((filter, i) => (
            <div key={i} className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground/50 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">{filter.label}</Label>
              <div className="relative">
                <select
                  value={filter.value}
                  onChange={(e) => filter.setter(e.target.value as any)}
                  className="w-full h-12 pl-4 pr-10 rounded-xl bg-white/50 dark:bg-black/40 border-2 border-white/50 dark:border-white/5 text-slate-900 dark:text-white focus:border-primary focus:outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
                >
                  <option value="" className="dark:bg-[#0a120b]">{filter.placeholder}</option>
                  {filter.options.map((opt: any) => (
                    <option key={opt.value} value={opt.value} className="dark:bg-[#0a120b]">{opt.label}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 dark:text-white">
                  <ArrowDown size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Date Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-secondary/30 dark:bg-black/20 rounded-[2rem] border border-white/50 dark:border-white/5">
          <div className="space-y-3">
            <Label className="text-[10px] font-black text-muted-foreground/50 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Sana (Dan)</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-12 rounded-xl bg-white/50 dark:bg-black/40 border-white/50 dark:border-white/10 dark:text-white"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-black text-muted-foreground/50 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Sana (Gacha)</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-12 rounded-xl bg-white/50 dark:bg-black/40 border-white/50 dark:border-white/10 dark:text-white"
            />
          </div>
        </div>

        {/* Technical Data Table */}
        <div className="overflow-hidden rounded-[2rem] border border-white/50 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-sm shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-foreground dark:bg-slate-900 text-white dark:text-white border-b border-white/10">
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Unit # (Toy)</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Marka Protocol</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Sinf / Nav</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-center">Metrikalar (%)</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Holat (Auth)</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em]">Timestamp</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {paginatedSamples.map((sample) => {
                  const toy = toys.find(t => t.id === sample.sourceId);
                  return (
                    <tr
                      key={sample.id}
                      className="group hover:bg-white/40 dark:hover:bg-white/5 transition-all duration-300"
                    >
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="text-lg font-black text-foreground dark:text-white tabular-nums">#{toy?.orderNo || "???"}</span>
                          <span className="text-[10px] font-bold text-muted-foreground/60 dark:text-slate-500 uppercase">{Number(toy?.netto).toFixed(2)} KG</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-foreground dark:text-white uppercase">{sample.markaLabel}</span>
                          <span className="text-[10px] font-bold text-primary italic uppercase">{sample.productType}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border",
                            getGradeColor(sample.grade)
                          )}>
                            {sample.grade}
                          </span>
                          <span className="px-2 py-1 bg-secondary dark:bg-white/10 text-primary dark:text-white text-[10px] font-black rounded-lg border border-primary/10 dark:border-white/10 uppercase">
                            NAV {sample.navi}
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-center gap-4 text-center">
                          <div className="flex flex-col min-w-[60px]">
                            <span className="text-[9px] font-black text-blue-500/50 dark:text-blue-400/40">NAM</span>
                            <span className="text-sm font-black tabular-nums dark:text-white">{sample.moisture}%</span>
                          </div>
                          <div className="flex flex-col min-w-[60px]">
                            <span className="text-[9px] font-black text-rose-500/50 dark:text-rose-400/40">IFL</span>
                            <span className="text-sm font-black tabular-nums dark:text-white">{sample.trash}%</span>
                          </div>
                          <div className="flex flex-col min-w-[60px]">
                            <span className="text-[9px] font-black text-emerald-500/50 dark:text-emerald-400/40">PISH</span>
                            <span className="text-sm font-black tabular-nums dark:text-white">{sample.strength}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest",
                          sample.status === "PENDING" ? "bg-amber-500/10 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-900/30" :
                            sample.status === "APPROVED" ? "bg-emerald-500/10 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-900/30" :
                              "bg-rose-500/10 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-900/30"
                        )}>
                          {getStatusIcon(sample.status)}
                          {getStatusText(sample.status)}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-foreground dark:text-white tabular-nums">{formatDate(sample.createdAt)}</span>
                          <span className="text-[9px] font-bold text-muted-foreground/40 dark:text-slate-600 uppercase">GMT +5:00</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleShowToSales(sample.toyId)}
                            className={cn(
                              "h-10 w-10 p-0 rounded-xl transition-all",
                              sample.showToWarehouse ? "text-primary bg-primary/5" : "text-muted-foreground/30"
                            )}
                            disabled={sample.status !== "APPROVED"}
                          >
                            {sample.showToWarehouse ? <Eye size={16} /> : <EyeOff size={16} />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSampleEdit(sample)}
                            className="h-10 w-10 p-0 rounded-xl hover:bg-foreground dark:hover:bg-white hover:text-white dark:hover:text-black text-slate-400 dark:text-slate-500 transition-all"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(sample)}
                            className="h-10 w-10 p-0 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Pagination Hub */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-6 bg-white/20 dark:bg-black/20 rounded-[2rem] border border-white/20 dark:border-white/5">
            <div className="text-[11px] font-black text-muted-foreground/60 dark:text-slate-500 uppercase tracking-widest">
              SHOWING <span className="text-foreground dark:text-white">{startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredSamples.length)}</span> OF {filteredSamples.length} DATA BLOCKS
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest"
              >
                Previous Protocol
              </Button>
              <div className="px-6 py-2 bg-foreground dark:bg-white/10 text-white dark:text-white rounded-xl font-black tabular-nums text-sm shadow-lg border border-white/10">
                Phase {currentPage} / {totalPages}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest"
              >
                Next Protocol
              </Button>
            </div>
          </div>
        )}

        {filteredSamples.length === 0 && (
          <div className="text-center py-24 bg-white/10 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-white/20 dark:border-white/10">
            <FlaskConical className="h-20 w-20 mx-auto mb-6 text-muted-foreground/20 dark:text-white/10 animate-pulse" />
            <p className="text-xl font-black text-muted-foreground/40 dark:text-slate-600 uppercase tracking-widest">Tahlil natijalari topilmadi</p>
            <p className="text-[11px] font-bold text-muted-foreground/20 dark:text-slate-700 uppercase mt-2 tracking-[0.2em]">Filter parametrlarini o&apos;zgartirib ko&apos;ring</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}