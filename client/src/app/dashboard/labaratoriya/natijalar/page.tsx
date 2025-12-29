"use client";
import { useState, useEffect } from "react";
import { useBackendLabStore } from "@/stores/backendLabStore";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { useBackendToyStore } from "@/stores/backendToyStore";
import { useAuthStore } from "@/stores/authStore";
import { LabSample } from "@/types/lab";
import { ProfessionalLabResultsTable } from "@/components/lab/ProfessionalLabResultsTable";
import { LabEditModal } from "@/components/lab/LabEditModal";
import { SimpleApprovalModal } from "@/components/lab/SimpleApprovalModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, RefreshCw, AlertTriangle, FlaskConical, Download, Table } from "lucide-react";
import { exportAllLabSamplesToExcel, exportFilteredLabSamplesToExcel } from "@/lib/utils/labExport";
import { cn } from "@/lib/utils";

export default function LabResultsPage() {
  const { samples, fetchSamples, isLoading, error } = useBackendLabStore();
  const { fetchMarkas } = useBackendMarkaStore();
  const { fetchToys } = useBackendToyStore();
  const { user } = useAuthStore();

  const [editingSample, setEditingSample] = useState<LabSample | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sampleForApproval, setSampleForApproval] = useState<LabSample | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const isAdmin = user?.role === "ADMIN" || user?.role === "LAB";

  useEffect(() => {
    fetchSamples({}, false);
    fetchMarkas({ status: "ACTIVE" });
    fetchToys();
  }, [fetchSamples, fetchMarkas, fetchToys]);

  const handleRefresh = () => {
    fetchSamples({}, true);
    fetchMarkas({ status: "ACTIVE" });
    fetchToys();
  };

  const handleSampleEdit = (sample: LabSample) => {
    if (!isAdmin) return;
    setEditingSample(sample);
    setIsEditModalOpen(true);
  };

  const handleSampleApproval = (sample: LabSample) => {
    if (!isAdmin) return;
    setSampleForApproval(sample);
    setIsApprovalModalOpen(true);
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

  return (
    <div className="min-h-screen bg-[#f0fdf4] dark:bg-[#0a120b] p-6 lg:p-12 animate-in fade-in duration-700">
      {/* Structural Header - Navbahor Brand */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="group h-11 px-5 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-500 dark:text-slate-500 hover:text-primary dark:hover:text-emerald-400 transition-all font-bold text-[11px] uppercase tracking-widest flex items-center gap-3 rounded-xl border border-white/60 dark:border-white/10 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Laboratoriya Paneli
          </Button>

          <div className="space-y-3">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center transition-all hover:scale-105 shadow-sm border border-primary/20">
                <Table className="h-8 w-8" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">
                  Tahlillar <span className="text-primary italic">Reestri</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] ml-1">
                  Kompleks sifat nazorati va texnologik monitoring
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportAll}
            disabled={isLoading || isExporting || samples.length === 0}
            className="h-12 px-6 rounded-xl bg-white dark:bg-white/5 text-slate-900 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all font-bold text-[11px] uppercase tracking-widest shadow-sm flex items-center gap-3"
          >
            <Download className={cn("h-4 w-4", isExporting && "animate-bounce text-primary")} />
            {isExporting ? "Eksport..." : "Eksport (.xlsx)"}
          </Button>

          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-12 w-12 rounded-xl bg-primary text-white hover:bg-[#0bae4a]/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center active:scale-90"
          >
            <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} strokeWidth={2.5} />
          </Button>
        </div>
      </div>

      {/* Main Content High-Fidelity Container */}
      <div className="bg-white/85 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl shadow-xl shadow-primary/5 border border-white/60 dark:border-white/10 overflow-hidden min-h-[700px] animate-in slide-in-from-bottom-6 duration-700">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[600px] space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/10 dark:border-white/5 border-t-primary rounded-full animate-spin" />
              <FlaskConical className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-[12px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] animate-pulse mb-1">Ma&apos;lumotlar yuklanmoqda</p>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-600 uppercase tracking-widest">Iltimos kuting...</p>
            </div>
          </div>
        ) : (
          <div className="h-full">
            <ProfessionalLabResultsTable
              onSampleEdit={handleSampleEdit}
              onSampleApproval={handleSampleApproval}
            />
          </div>
        )}
      </div>

      {/* Modals - Standard Backend Integration */}
      {isAdmin && (
        <>
          <LabEditModal
            sample={editingSample}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingSample(null);
            }}
          />
          <SimpleApprovalModal
            sample={sampleForApproval}
            isOpen={isApprovalModalOpen}
            onClose={() => {
              setIsApprovalModalOpen(false);
              setSampleForApproval(null);
            }}
          />
        </>
      )}
    </div>
  );
}
