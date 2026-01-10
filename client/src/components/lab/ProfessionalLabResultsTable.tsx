"use client";
import { useState, useMemo } from "react";
import { useBackendLabStore } from "@/stores/backendLabStore";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { useBackendToyStore } from "@/stores/backendToyStore";
import { useAuthStore } from "@/stores/authStore";
import { LabSample, LabStatus } from "@/types/lab";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import {
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Filter,
  Package,
  Activity,
  Award,
  Clock,
  ArrowRight,
  Layers,
  CheckSquare,
  Square,
  Zap,
  MoreVertical,
  FlaskConical
} from "lucide-react";
import { exportQualityCertificatePDF } from "@/lib/utils/labExport";

interface ProfessionalLabResultsTableProps {
  onSampleEdit: (sample: LabSample) => void;
  onSampleApproval?: (sample: LabSample) => void;
}

export function ProfessionalLabResultsTable({ onSampleEdit, onSampleApproval }: ProfessionalLabResultsTableProps) {
  const {
    samples,
    deleteSample,
    approveSample,
    rejectSample,
    bulkApproveSamples,
    bulkRejectSamples
  } = useBackendLabStore();
  const { markas } = useBackendMarkaStore();
  const { user } = useAuthStore();

  const isAdmin = user?.role === "ADMIN" || user?.role === "LAB";

  // State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LabStatus>("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedToyIds, setSelectedToyIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Derive grouped data
  const { toys } = useBackendToyStore();

  const groupedData = useMemo(() => {
    // 1. Enrich and Filter
    const enriched = samples.map(sample => {
      const relatedToy = sample.toy || toys.find((t: any) => t.id === sample.toyId);
      return {
        ...sample,
        toy: relatedToy,
        // Ensure we have a markaId to group by
        markaId: sample.markaId || relatedToy?.markaId || "UNKNOWN"
      };
    });

    const filtered = enriched.filter(sample => {
      const matchesSearch = !search ||
        (sample.toy?.orderNo?.toString().includes(search)) ||
        (sample.markaLabel?.toLowerCase().includes(search.toLowerCase())) ||
        (sample.comment?.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === "all" || sample.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // 2. Group by Marka
    const groups: Record<string, {
      markaId: string;
      markaLabel: string;
      productType: string;
      samples: LabSample[];
      stats: {
        avgMoisture: number;
        avgTrash: number;
        avgStrength: number;
        avgMic: number;
        count: number;
        pending: number;
      }
    }> = {};

    filtered.forEach(sample => {
      const gKey = sample.markaId || "UNKNOWN";
      if (!groups[gKey]) {
        const markaInfo = markas.find(m => m.id === sample.markaId);
        groups[gKey] = {
          markaId: sample.markaId || "",
          markaLabel: sample.markaLabel || (markaInfo ? `Marka #${markaInfo.number}` : "NOMA'LUM MARKA"),
          productType: sample.toy?.productType || "TOLA",
          samples: [],
          stats: { avgMoisture: 0, avgTrash: 0, avgStrength: 0, avgMic: 0, count: 0, pending: 0 }
        };
      }
      groups[gKey].samples.push(sample);
    });

    // 3. Calculate Stats and Sort Groups
    Object.values(groups).forEach(group => {
      const count = group.samples.length;
      group.stats.count = count;
      group.stats.pending = group.samples.filter(s => s.status === "PENDING").length;
      group.stats.avgMoisture = group.samples.reduce((sum, s) => sum + s.moisture, 0) / count;
      group.stats.avgTrash = group.samples.reduce((sum, s) => sum + s.trash, 0) / count;
      group.stats.avgStrength = group.samples.reduce((sum, s) => sum + s.strength, 0) / count;
      group.stats.avgMic = group.samples.reduce((sum, s) => sum + (s.micronaire || 0), 0) / count;

      // Sort samples in group by orderNo
      group.samples.sort((a, b) => (b.toy?.orderNo || 0) - (a.toy?.orderNo || 0));
    });

    return Object.values(groups).sort((a, b) => b.markaLabel.localeCompare(a.markaLabel));
  }, [samples, search, statusFilter]);

  // Handlers
  const toggleGroup = (markaId: string) => {
    const next = new Set(expandedGroups);
    if (next.has(markaId)) next.delete(markaId);
    else next.add(markaId);
    setExpandedGroups(next);
  };

  const toggleSelectAllInGroup = (markaId: string, samples: LabSample[]) => {
    const next = new Set(selectedToyIds);
    const allInGroupSelected = samples.every(s => next.has(s.toyId));

    samples.forEach(s => {
      if (allInGroupSelected) next.delete(s.toyId);
      else next.add(s.toyId);
    });
    setSelectedToyIds(next);
  };

  const toggleSelectSample = (toyId: string) => {
    const next = new Set(selectedToyIds);
    if (next.has(toyId)) next.delete(toyId);
    else next.add(toyId);
    setSelectedToyIds(next);
  };

  const handleBatchApprove = async () => {
    if (!isAdmin || selectedToyIds.size === 0) return;
    if (!confirm(`${selectedToyIds.size} ta namunani TASDIQLASHNI xohlaysizmi?`)) return;

    setIsProcessing(true);
    try {
      await bulkApproveSamples(Array.from(selectedToyIds));
      setSelectedToyIds(new Set());
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchReject = async () => {
    if (!isAdmin || selectedToyIds.size === 0) return;
    const reason = prompt(`${selectedToyIds.size} ta namunani RAD ETISH sababi:`, "Sifat talabiga javob bermaydi");
    if (reason === null) return;

    setIsProcessing(true);
    try {
      await bulkRejectSamples(Array.from(selectedToyIds), reason);
      setSelectedToyIds(new Set());
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 relative pb-24">
      {/* Header Search & Meta Stats */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between p-6 bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-3xl border border-white/60 dark:border-white/10 shadow-sm">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary h-5 w-5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Marka yoki Toy raqami orqali qidirish..."
            className="h-12 pl-14 pr-6 rounded-2xl bg-white dark:bg-black/20 border-slate-100 dark:border-white/10 text-sm font-bold tracking-tight uppercase"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-12 px-6 rounded-2xl bg-white dark:bg-white/10 border border-slate-100 dark:border-white/10 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-primary/20 transition-all"
          >
            <option value="all">BARCHA HOLATLAR</option>
            <option value="PENDING">KUTILMOQDA</option>
            <option value="APPROVED">TASDIQLANGAN</option>
            <option value="REJECTED">RAD ETILGAN</option>
          </select>

          <div className="h-12 px-6 rounded-2xl bg-primary/10 flex items-center gap-3 border border-primary/20">
            <FlaskConical className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{samples.length} TAHLIL</span>
          </div>
        </div>
      </div>

      {/* Grouped Content Area */}
      <div className="space-y-6 overflow-auto max-h-[calc(100vh-350px)] pr-2 scrollbar-none">
        {groupedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Package size={48} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="text-sm font-bold uppercase tracking-widest">Ma&apos;lumot topilmadi</p>
          </div>
        ) : (
          groupedData.map((group) => {
            const isExpanded = expandedGroups.has(group.markaId);
            const allSelected = group.samples.every(s => selectedToyIds.has(s.toyId));
            const someSelected = group.samples.some(s => selectedToyIds.has(s.toyId)) && !allSelected;

            return (
              <div key={group.markaId} className="group/marka overflow-hidden rounded-[2rem] border border-slate-100 dark:border-white/5 transition-all">
                {/* Group Header */}
                <div
                  className={cn(
                    "flex flex-col md:flex-row items-center gap-6 p-6 transition-all cursor-pointer",
                    isExpanded ? "bg-slate-50 dark:bg-white/5" : "bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-white/5"
                  )}
                  onClick={() => toggleGroup(group.markaId)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectAllInGroup(group.markaId, group.samples);
                        }}
                        className="text-primary transition-transform active:scale-90"
                      >
                        {allSelected ? <CheckSquare size={22} /> : someSelected ? <Zap size={22} className="fill-primary" /> : <Square size={22} />}
                      </button>
                    )}
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Layers size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1 flex items-center gap-2">
                        Marka {group.markaLabel}
                        {group.stats.pending > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[8px]">{group.stats.pending}</span>}
                      </h3>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                        {group.productType} • {group.stats.count} TOY • O&apos;RT. PISHIQLIK: {group.stats.avgStrength.toFixed(1)}
                      </p>
                    </div>
                  </div>

                  {/* Group Stats Bubble */}
                  <div className="hidden xl:flex items-center gap-8 px-8 border-x border-slate-200 dark:border-white/10">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{group.stats.avgMoisture.toFixed(1)}%</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">NAMLIK</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{group.stats.avgTrash.toFixed(1)}%</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">IFLOSLIK</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{group.stats.avgMic.toFixed(1)}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">MIC</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {isAdmin && group.stats.pending > 0 && !isExpanded && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          bulkApproveSamples(group.samples.filter(s => s.status === "PENDING").map(s => s.toyId));
                        }}
                        className="h-10 px-6 rounded-xl bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
                      >
                        Barchasini Tasdiqlash
                      </Button>
                    )}
                    <div className={cn("transition-transform duration-300", isExpanded ? "rotate-180" : "")}>
                      <ChevronDown size={20} className="text-slate-300" />
                    </div>
                  </div>
                </div>

                {/* Expanded Item List */}
                {isExpanded && (
                  <div className="bg-white dark:bg-black/20 border-t border-slate-100 dark:border-white/5 divide-y divide-slate-50 dark:divide-white/5 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/50 dark:bg-white/[0.02] text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="col-span-3 flex items-center gap-4">TOY RAQAMI</div>
                      <div className="col-span-2 text-center">NAV / SINF</div>
                      <div className="col-span-1 text-center">NAMLIK</div>
                      <div className="col-span-1 text-center">IFLOSLIK</div>
                      <div className="col-span-1 text-center">PISHIQLIK</div>
                      <div className="col-span-1 text-center">MIC</div>
                      <div className="col-span-3 text-right">AMALLAR</div>
                    </div>
                    {group.samples.map(sample => (
                      <div key={sample.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors">
                        <div className="col-span-3 flex items-center gap-4">
                          {isAdmin && (
                            <button onClick={() => toggleSelectSample(sample.toyId)} className="text-slate-300 dark:text-slate-700 hover:text-primary transition-colors">
                              {selectedToyIds.has(sample.toyId) ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
                            </button>
                          )}
                          <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 font-mono font-black text-sm shadow-sm ring-4 ring-slate-100 dark:ring-white/5">
                            #{sample.toy?.orderNo || "???"}
                          </div>
                          <div className="flex flex-col">
                            <span className={cn(
                              "text-[8px] font-black uppercase px-2 py-0.5 rounded-full w-fit",
                              sample.status === "APPROVED" ? "bg-emerald-100/50 text-emerald-600" :
                                sample.status === "REJECTED" ? "bg-rose-100/50 text-rose-600" : "bg-amber-100/50 text-amber-600"
                            )}>
                              {sample.status === "APPROVED" ? "TASDIQLANGAN" : sample.status === "REJECTED" ? "RAD ETILGAN" : "KUTILMOQDA"}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{sample.toy?.qrUid.slice(-6)}</span>
                          </div>
                        </div>

                        <div className="col-span-2 text-center">
                          <div className="text-[11px] font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">{sample.navi}-NAV</div>
                          <div className="text-[8px] font-bold text-primary tracking-[0.2em]">{sample.grade}</div>
                        </div>

                        <div className="col-span-1 text-center font-mono font-bold text-[13px] text-blue-500 tracking-tighter">{sample.moisture}%</div>
                        <div className="col-span-1 text-center font-mono font-bold text-[13px] text-rose-500 tracking-tighter">{sample.trash}%</div>
                        <div className="col-span-1 text-center font-mono font-bold text-[13px] text-primary tracking-tighter">{sample.strength}</div>
                        <div className="col-span-1 text-center font-mono font-bold text-[13px] text-amber-500 tracking-tighter">{sample.micronaire || '-'}</div>

                        <div className="col-span-3 flex items-center justify-end gap-2">
                          {isAdmin && sample.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => approveSample(sample.toyId)}
                                className="h-9 w-9 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-inner"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  const r = prompt("Rad etish sababi:", "Sifat javob bermaydi");
                                  if (r) rejectSample(sample.toyId, r);
                                }}
                                className="h-9 w-9 bg-rose-500/10 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-white transition-all shadow-inner"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => onSampleEdit(sample)}
                            className="h-9 w-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-inner"
                          >
                            <Edit size={16} />
                          </button>
                          {sample.status === "APPROVED" && (
                            <button
                              onClick={() => exportQualityCertificatePDF(sample.toyId, sample.toy?.orderNo)}
                              className="h-9 w-9 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-inner"
                            >
                              <FileText size={16} />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => { if (confirm("O'chirishni xohlaysizmi?")) deleteSample(sample.toyId); }}
                              className="h-9 w-9 bg-slate-100 dark:bg-white/5 text-slate-400 hover:bg-rose-600 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-inner"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Batch Actions Bar */}
      {selectedToyIds.size > 0 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-12 duration-500 w-full max-w-2xl px-6">
          <div className="h-20 bg-slate-900 dark:bg-white shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] dark:shadow-[0_24px_48px_-12px_rgba(255,255,255,0.1)] rounded-[2.5rem] flex items-center justify-between px-8 text-white dark:text-slate-900 border-4 border-white/10 dark:border-black/5">
            <div className="flex items-center gap-6">
              <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-primary/40">
                {selectedToyIds.size}
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest opacity-80">Tanlangan Namunalar</p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedToyIds(new Set())}
                className="h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 dark:hover:bg-black/5 transition-all"
              >
                Bekor qilish
              </button>
              <div className="w-[1px] h-8 bg-white/20 dark:bg-black/10 mx-2" />
              <Button
                disabled={isProcessing}
                onClick={handleBatchReject}
                className="h-12 px-6 rounded-2xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20"
              >
                Rad etish
              </Button>
              <Button
                disabled={isProcessing}
                onClick={handleBatchApprove}
                className="h-12 px-6 rounded-2xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
              >
                Tasdiqlash
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
