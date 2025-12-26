"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBackendLabStore } from "@/stores/backendLabStore";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { useBackendToyStore } from "@/stores/backendToyStore";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
import { LabSample } from "@/types/lab";
import { SmartLabForm } from "./SmartLabForm";
import { LabEditModal } from "./LabEditModal";
import { SimpleApprovalModal } from "./SimpleApprovalModal";
import { exportAllLabSamplesToExcel, exportFilteredLabSamplesToExcel } from "@/lib/utils/labExport";
// import { ProfessionalLabResultsTable } from "./ProfessionalLabResultsTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/utils";
import {
  FlaskConical,
  Table,
  BarChart3,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  AlertTriangle,
  Download,
} from "lucide-react";

export default function LabPage() {
  const router = useRouter();

  const {
    samples,
    fetchSamples,
    fetchStats,
    stats,
    isLoading,
    error,
  } = useBackendLabStore();

  const { markas, fetchMarkas } = useBackendMarkaStore();
  const { toys, fetchToys } = useBackendToyStore();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();

  const [editingSample, setEditingSample] = useState<LabSample | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sampleForApproval, setSampleForApproval] = useState<LabSample | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    fetchSamples({}, false);
    fetchStats();
    fetchMarkas({ status: "ACTIVE" });
    fetchToys();
  }, []);

  const handleSampleEdit = (sample: LabSample) => {
    if (!isAdmin) return;
    setEditingSample(sample);
    setIsEditModalOpen(true);
  };

  const handleRefresh = () => {
    fetchSamples({}, true);
    fetchStats();
    fetchMarkas({ status: "ACTIVE" });
    fetchToys();
  };

  const handleExportAll = async () => {
    try {
      setIsExporting(true);
      await exportAllLabSamplesToExcel();
    } catch (error: any) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Statistics calculation
  const stats_data = {
    total: samples.length,
    pending: samples.filter(s => s.status === "PENDING").length,
    approved: samples.filter(s => s.status === "APPROVED").length,
    rejected: samples.filter(s => s.status === "REJECTED").length,
    approvalRate: samples.length > 0
      ? Math.round((samples.filter(s => s.status === "APPROVED").length / samples.length) * 100)
      : 0
  };

  const recentSamples = [...samples]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="h-full space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 min-h-screen bg-transparent p-6 lg:p-10 overflow-y-auto scrollbar-none">
      {/* Navbahor Premium Header - Enhanced Glassmorphism */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 border-b border-white/20 pb-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-[1.8rem] flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/5 transition-all hover:scale-105">
            <FlaskConical className="h-8 w-8" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">
              Laboratoriya <span className="text-primary italic">Nazorati</span>
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-primary/10 rounded-lg">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">NAVBAHOR TEKSTIL</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Sifat tahlili va Texnologik Monitoring</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={handleExportAll}
            disabled={isLoading || isExporting || stats_data.total === 0}
            className="h-12 px-6 bg-white/50 border-white/60 text-slate-600 hover:bg-white hover:text-slate-900 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm active:scale-95"
          >
            <Download className={cn("h-4 w-4 mr-2 text-primary", isExporting && "animate-bounce")} strokeWidth={2.5} />
            Excel Export
          </Button>

          <Button
            disabled={isLoading}
            variant="outline"
            onClick={handleRefresh}
            className="w-12 h-12 rounded-xl bg-white/50 border-white/60 hover:bg-white transition-all shadow-sm active:scale-90"
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                isLoading ? "animate-spin text-primary" : "text-slate-400"
              )}
              strokeWidth={3}
            />
          </Button>

          <Button
            onClick={() => router.push("/dashboard/labaratoriya/natijalar")}
            className="h-12 px-8 bg-primary text-white hover:bg-[#047857] rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95"
          >
            <Table className="h-4 w-4 mr-2" strokeWidth={2.5} />
            Monitor
          </Button>
        </div>
      </div>

      {/* Navbahor Polish Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Jami Analizlar", value: stats_data.total, unit: "Tahlil", icon: FileText, color: "primary", progress: 100 },
          { label: "Kutilayotgan", value: stats_data.pending, unit: "Navbat", icon: Clock, color: "amber", progress: (stats_data.pending / (stats_data.total || 1)) * 100 },
          { label: "Tasdiqlangan", value: stats_data.approved, unit: "Yaroqli", icon: CheckCircle2, color: "emerald", progress: stats_data.approvalRate },
          { label: "Sifat KPI", value: stats_data.approvalRate, unit: "% Index", icon: BarChart3, color: "indigo", progress: stats_data.approvalRate }
        ].map((stat, i) => (
          <Card key={i} className="relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 bg-white/80 backdrop-blur-md border-white/80 rounded-[2.25rem] shadow-xl shadow-primary/5 border">
            <CardContent className="p-7">
              <div className="flex items-center justify-between mb-6">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shadow-sm border",
                  stat.color === "primary" ? "bg-primary/5 text-primary border-primary/10" :
                    stat.color === "amber" ? "bg-amber-50 text-amber-600 border-amber-100" :
                      stat.color === "emerald" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        "bg-indigo-50 text-indigo-600 border-indigo-100"
                )}>
                  <stat.icon size={22} strokeWidth={2.5} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5">{stat.label}</p>
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span className="text-3xl font-bold text-slate-900 font-mono tracking-tighter">
                      {stat.value.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{stat.unit}</span>
                  </div>
                </div>
              </div>
              <div className="relative h-2 w-full bg-slate-100/50 rounded-full overflow-hidden shadow-inner border border-white">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out",
                    stat.color === "primary" ? "bg-primary" :
                      stat.color === "amber" ? "bg-amber-500" :
                        stat.color === "emerald" ? "bg-emerald-500" :
                          "bg-indigo-500"
                  )}
                  style={{ width: `${stat.progress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        {/* Creation Form Area */}
        <div className="xl:col-span-8">
          <SmartLabForm />
        </div>

        {/* Recent Analyses Monitor - Navbahor Polish */}
        <div className="xl:col-span-4 space-y-8 h-full bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/60 p-8 shadow-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10 px-2">
            <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" strokeWidth={2.5} />
              So&apos;nggi Tahlillar
            </h3>
            <button
              onClick={() => router.push("/dashboard/labaratoriya/natijalar")}
              className="px-4 py-1.5 rounded-xl bg-primary/5 text-[10px] font-bold text-primary uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              Hamma <span className="text-xs ml-1">→</span>
            </button>
          </div>

          <div className="space-y-4 max-h-[850px] overflow-y-auto pr-2 scrollbar-none relative z-10">
            {recentSamples.length > 0 ? (
              recentSamples.map((sample, idx) => {
                const toy = toys.find(t => t.id === (sample.toyId || sample.sourceId));
                return (
                  <Card
                    key={sample.id}
                    className="group relative overflow-hidden bg-white/60 backdrop-blur-md border-white/80 rounded-[2rem] shadow-sm cursor-pointer hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 transform hover:-translate-x-2 border animate-in slide-in-from-right-8"
                    style={{ animationDelay: `${idx * 100}ms` }}
                    onClick={() => handleSampleEdit(sample)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white shadow-md border border-slate-50 text-slate-900 rounded-2xl flex items-center justify-center font-bold font-mono text-lg ring-1 ring-slate-100 transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
                            #{toy?.orderNo || "—"}
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Marka</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                                {sample.markaLabel || "Noma'lum"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className={cn(
                          "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all shadow-sm",
                          sample.status === "APPROVED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            sample.status === "REJECTED" ? "bg-rose-50 text-rose-600 border-rose-100" :
                              "bg-amber-50 text-amber-600 border-amber-100"
                        )}>
                          {sample.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 mb-6">
                        {[
                          { l: "NAM", v: (sample.moisture || 0) + "%", c: "text-blue-500" },
                          { l: "IFL", v: (sample.trash || 0) + "%", c: "text-rose-500" },
                          { l: "NAV", v: (sample.navi || 1) + "-NAV", c: "text-slate-900" },
                          { l: "PISH", v: sample.strength || "—", c: "text-primary" },
                          { l: "UZUN", v: (sample.lengthMm || 0) + "mm", c: "text-slate-600" },
                          { l: "SINF", v: sample.grade || "OLIY", c: "text-primary" }
                        ].map((m, i) => (
                          <div key={i} className="bg-slate-50/50 p-2.5 rounded-[1.2rem] border border-white/60 text-center transition-all group-hover:border-primary/20">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">{m.l}</p>
                            <p className={cn("text-[11px] font-mono font-bold truncate tracking-tighter", m.c)}>{m.v}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-50 pt-5">
                        <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50/80 rounded-xl border border-slate-100 shadow-inner">
                          <Clock className="w-3.5 h-3.5 text-primary/60" strokeWidth={2.5} />
                          <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">
                            {new Date(sample.createdAt).toLocaleTimeString("uz-UZ", { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-primary font-bold text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                          Tahrirlash <span className="text-xs">→</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-20 rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/40 backdrop-blur-sm">
                <FlaskConical className="h-16 w-16 text-slate-200 mx-auto mb-6 animate-pulse" strokeWidth={1.5} />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Hozircha laboratoriya<br />tahlillari aniqlanmadi</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Polish Modals */}
      {isAdmin && (
        <>
          <LabEditModal
            sample={editingSample}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
          />
          <SimpleApprovalModal
            sample={sampleForApproval}
            isOpen={isApprovalModalOpen}
            onClose={() => setIsApprovalModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}
