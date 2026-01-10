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
    <div className="h-full min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col animate-in fade-in duration-500">
      {/* Sticky Premium Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20 shadow-sm">
            <FlaskConical className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none uppercase">
              Laboratoriya
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sifat Nazorati</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportAll}
            disabled={isLoading || isExporting || stats_data.total === 0}
            variant="ghost"
            className="h-9 px-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-[9px] font-bold uppercase tracking-widest"
          >
            <Download className={cn("h-3.5 w-3.5 mr-2", isExporting && "animate-bounce")} strokeWidth={2.5} />
            Export
          </Button>

          <Button
            disabled={isLoading}
            variant="outline"
            onClick={handleRefresh}
            className="w-9 h-9 rounded-lg border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-0"
          >
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5 text-slate-500",
                isLoading && "animate-spin text-primary"
              )}
              strokeWidth={2.5}
            />
          </Button>

          <Button
            onClick={() => router.push("/dashboard/labaratoriya/natijalar")}
            className="h-9 px-5 bg-primary text-white hover:bg-green-700 rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-md shadow-primary/20"
          >
            <Table className="h-3.5 w-3.5 mr-2" strokeWidth={2.5} />
            Monitor
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-none p-5 space-y-5">
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Jami Analizlar", value: stats_data.total, unit: "ta", icon: FileText, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", progress: 100 },
            { label: "Navbatda", value: stats_data.pending, unit: "ta", icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", progress: (stats_data.pending / (stats_data.total || 1)) * 100 },
            { label: "Tasdiqlandi", value: stats_data.approved, unit: "ta", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", progress: stats_data.approvalRate },
            { label: "Sifat Indeksi", value: stats_data.approvalRate, unit: "%", icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20", progress: stats_data.approvalRate }
          ].map((stat, i) => (
            <Card key={i} className="border border-slate-200 dark:border-white/5 shadow-sm bg-white dark:bg-gray-900 rounded-2xl hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</span>
                    <span className="text-[10px] font-bold text-slate-400">{stat.unit}</span>
                  </div>
                </div>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                  <stat.icon size={20} strokeWidth={2.5} />
                </div>
              </CardContent>
              <div className="h-1 w-full bg-slate-50 dark:bg-white/5 mt-0 overflow-hidden rounded-b-2xl">
                <div className={cn("h-full transition-all duration-1000", stat.color.replace('text', 'bg'))} style={{ width: `${stat.progress}%` }} />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Creation Form Area */}
          <div className="xl:col-span-8">
            <SmartLabForm />
          </div>

          {/* Recent Analyses Monitor - Professional List */}
          <div className="xl:col-span-4 flex flex-col gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-white/5 p-5 shadow-sm h-full">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                So'nggi Tahlillar
              </h3>
              <button
                onClick={() => router.push("/dashboard/labaratoriya/natijalar")}
                className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wide"
              >
                Ko'rish
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[800px] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10 pr-1">
              {recentSamples.length > 0 ? (
                recentSamples.map((sample, idx) => {
                  const toy = toys.find(t => t.id === (sample.toyId || sample.sourceId));
                  return (
                    <div
                      key={sample.id}
                      onClick={() => handleSampleEdit(sample)}
                      className="group relative bg-slate-50 dark:bg-gray-950/50 hover:bg-slate-100 dark:hover:bg-gray-800 border border-slate-200 dark:border-white/5 rounded-xl p-3 cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white dark:bg-gray-900 border border-slate-200 dark:border-white/10 rounded-lg flex items-center justify-center text-xs font-black text-slate-900 dark:text-white font-mono">
                            #{toy?.orderNo || "?"}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-900 dark:text-white leading-none">{sample.markaLabel}</p>
                            <p className="text-[9px] font-medium text-slate-400 mt-0.5">{new Date(sample.createdAt).toLocaleTimeString("uz-UZ", { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border",
                          sample.status === "APPROVED" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                            sample.status === "REJECTED" ? "bg-rose-50 text-rose-600 border-rose-200" :
                              "bg-amber-50 text-amber-600 border-amber-200"
                        )}>
                          {sample.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-1">
                        <div className="bg-white dark:bg-gray-900 p-1.5 rounded border border-slate-100 dark:border-white/5 text-center">
                          <span className="block text-[7px] text-slate-400 font-bold">NAM</span>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{sample.moisture}%</span>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-1.5 rounded border border-slate-100 dark:border-white/5 text-center">
                          <span className="block text-[7px] text-slate-400 font-bold">IFL</span>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{sample.trash}%</span>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-1.5 rounded border border-slate-100 dark:border-white/5 text-center">
                          <span className="block text-[7px] text-slate-400 font-bold">NAV</span>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{sample.navi}-N</span>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-1.5 rounded border border-slate-100 dark:border-white/5 text-center">
                          <span className="block text-[7px] text-slate-400 font-bold">SINF</span>
                          <span className="text-[10px] font-bold text-primary">{sample.grade}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 opacity-50">
                  <FlaskConical className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Tahlillar yo'q</p>
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
    </div>
  );
}
