"use client";
import { useState } from "react";
import { useBackendLabStore } from "@/stores/backendLabStore";
import { LabSample, LabStatus } from "@/types/lab";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleApprovalModalProps {
  sample: LabSample | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SimpleApprovalModal({ sample, isOpen, onClose }: SimpleApprovalModalProps) {
  const { approveSample, rejectSample } = useBackendLabStore();
  const [isLoading, setIsLoading] = useState(false);

  if (!sample) return null;

  const handleStatusUpdate = async (status: LabStatus) => {
    setIsLoading(true);
    try {
      const toyId = sample.toyId || sample.sourceId || "";
      if (!toyId) {
        console.error("Xatolik: Toy ID topilmadi!");
        return;
      }

      if (status === "APPROVED") {
        await approveSample(toyId);
      } else if (status === "REJECTED") {
        await rejectSample(toyId, "Admin tomonidan rad etildi");
      }
      onClose();
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case "OLIY": return "bg-emerald-500/10 text-emerald-600";
      case "YAXSHI": return "bg-blue-500/10 text-blue-600";
      case "ORTA": return "bg-yellow-500/10 text-yellow-600";
      case "ODDIY": return "bg-orange-500/10 text-orange-600";
      default: return "bg-red-500/10 text-red-600";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isLoading && onClose()}
      />

      {/* Modal */}
      <div className="relative bg-white/85 backdrop-blur-md w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/60 animate-in fade-in zoom-in-95 duration-300">
        {/* Navbahor Modal Header */}
        <div className="relative p-6 lg:p-8 border-b border-slate-100 bg-white/40">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center transition-all">
              <CheckCircle2 size={24} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase">Tahlilni <span className="text-primary italic">Tasdiqlash</span></h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest font-mono">LAB-PROTOCOL: TOY #{sample.toy?.orderNo || "—"}</p>
            </div>
          </div>
        </div>

        {/* Info Content - Soft UI */}
        <div className="p-6 lg:p-8 space-y-6 bg-[#f0fdf4]/20">
          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full" />
              {sample.markaLabel || "BATCH DATA"}
            </h3>

            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              {[
                { l: "Namlik", v: sample.moisture + "%", c: "text-blue-500" },
                { l: "Ifloslik", v: sample.trash + "%", c: "text-rose-500" },
                { l: "Navi", v: sample.navi + "-NAV", c: "text-slate-900" },
                { l: "Sinf", v: sample.grade, c: "text-primary" }
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.l}</p>
                  <p className={cn("text-lg font-bold font-mono tracking-tighter", item.c)}>{item.v}</p>
                </div>
              ))}
            </div>

            {sample.comment && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ekspert Izohi</p>
                <div className="text-sm font-medium italic text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  &ldquo;{sample.comment}&rdquo;
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => handleStatusUpdate("APPROVED")}
              disabled={isLoading || sample.status === "APPROVED"}
              className="h-14 rounded-xl bg-primary hover:bg-[#047857] text-white text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-primary/30 transition-all active:scale-95"
            >
              <CheckCircle2 size={18} className="mr-3" strokeWidth={2} />
              TASDIQLASH VA QABUL QILISH
            </Button>

            <Button
              onClick={() => handleStatusUpdate("REJECTED")}
              disabled={isLoading || sample.status === "REJECTED"}
              variant="ghost"
              className="h-14 rounded-xl border border-rose-100 bg-rose-50/50 text-rose-600 hover:bg-rose-100 text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95"
            >
              <XCircle size={18} className="mr-3" strokeWidth={2} />
              RAD ETISH (SIFATSIZ)
            </Button>
          </div>
        </div>

        {/* Navbahor Modal Footer */}
        <div className="p-6 bg-white border-t border-slate-100 flex justify-center">
          <Button
            onClick={onClose}
            variant="ghost"
            className="h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-slate-900 transition-all hover:bg-slate-50 active:scale-95"
            disabled={isLoading}
          >
            Yopish / Bekor Qilish
          </Button>
        </div>
      </div>
    </div>
  );
}
