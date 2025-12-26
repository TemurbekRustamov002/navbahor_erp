"use client";
import { useState } from "react";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { Marka } from "@/types/marka";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { MarkaToysModal } from "./MarkaToysModal";
import { downloadMarkaLabel, exportMarkaPassportPDF } from "@/lib/utils/markaExport";
import {
  Package,
  Play,
  Pause,
  List,
  Target,
  FlaskConical,
  Award,
  Clock,
  ChevronRight,
  Monitor,
  QrCode,
  Box,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Lock,
  Unlock,
  FileText
} from "lucide-react";

interface MarkaCardProps {
  marka: Marka;
}

export function MarkaCard({ marka }: MarkaCardProps) {
  const { toggleScale, updateStatus } = useBackendMarkaStore();
  const [showToysModal, setShowToysModal] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ACTIVE": return { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", icon: CheckCircle2, label: "Faol" };
      case "PAUSED": return { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", icon: AlertCircle, label: "Pauza" };
      case "CLOSED": return { color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100", icon: XCircle, label: "Yopiq" };
      default: return { color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-100", icon: Clock, label: status };
    }
  };

  const status = getStatusConfig(marka.status);
  const progressPercentage = (marka.used / (marka.capacity || 220)) * 100;

  return (
    <Card className="group relative bg-white/80 backdrop-blur-lg border border-white/50 rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:translate-y-[-4px] animate-in fade-in duration-500">
      <CardContent className="p-0 flex flex-col h-full">

        {/* Header Block */}
        <div className="p-8 pb-6 flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className={cn(
              "w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-all duration-500 shadow-sm border border-transparent group-hover:border-primary/20",
              marka.status === "ACTIVE" ? "bg-primary/5 text-primary" : "bg-slate-50 text-slate-400"
            )}>
              <Package size={24} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl font-bold font-mono text-slate-900 tracking-tighter">#{marka.number}</span>
                <div className={cn("px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5", status.bg, status.color, status.border)}>
                  <status.icon size={10} strokeWidth={2.5} />
                  {status.label}
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{marka.productType} Markasi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportMarkaPassportPDF(marka.id, marka.number)}
              title="PDF Passportni Yuklash"
              className="w-10 h-10 rounded-xl bg-primary/5 text-primary hover:bg-primary/20 transition-all active:scale-95 flex items-center justify-center p-0"
            >
              <FileText size={18} strokeWidth={2} />
            </button>
            <button
              onClick={() => downloadMarkaLabel(marka.id, marka.number)}
              title="QR Yorliqni Yuklash"
              className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all active:scale-95 flex items-center justify-center p-0"
            >
              <QrCode size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Technical Specification Matrix (Dashed Environment) */}
        <div className="px-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Target size={8} strokeWidth={2.5} /> PTM Qiymati
              </p>
              <span className="text-xs font-bold text-slate-900 font-mono italic">{marka.ptm || "Noma'lum"}</span>
            </div>
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Award size={8} strokeWidth={2.5} /> Seleksiya
              </p>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">{marka.selection || "ODDIY"}</span>
            </div>
          </div>

          {/* Production Load Engine */}
          <div className="bg-slate-50/50 rounded-2xl border border-white/60 p-5 shadow-inner">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Marka Yuklanishi</span>
              <span className="text-[10px] font-bold font-mono text-primary italic">{marka.used} / {marka.capacity} toy</span>
            </div>
            <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden backdrop-blur-sm p-[2px]">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(11,174,74,0.3)]",
                  progressPercentage > 90 ? "bg-amber-500" : "bg-primary"
                )}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action HUD Console */}
        <div className="mt-8 p-6 bg-slate-50/50 border-t border-white/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowToysModal(true)}
              className="h-10 px-4 rounded-xl text-slate-600 hover:bg-white hover:text-primary transition-all font-bold text-[9px] uppercase tracking-widest"
            >
              <List size={14} strokeWidth={2} className="mr-2" /> Reestr
            </Button>
            <div className="w-[1px] h-4 bg-slate-200 mx-1" />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleScale(marka.id)}
              className={cn(
                "h-10 px-4 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all",
                marka.showOnScale ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:bg-slate-100"
              )}
            >
              {marka.showOnScale ? <Monitor size={14} className="mr-2" /> : <Monitor size={14} className="mr-2 opacity-40" />}
              Tarozi
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {marka.status === 'ACTIVE' ? (
              <Button
                size="sm"
                onClick={() => updateStatus(marka.id, 'PAUSED')}
                className="h-10 w-10 p-0 rounded-xl bg-amber-100 text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm active:scale-95"
                title="Vaqtincha to'xtatish"
              >
                <Pause size={16} strokeWidth={2.5} />
              </Button>
            ) : marka.status === 'PAUSED' ? (
              <Button
                size="sm"
                onClick={() => updateStatus(marka.id, 'ACTIVE')}
                className="h-10 w-10 p-0 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95"
                title="Faollashtirish"
              >
                <Play size={16} strokeWidth={2.5} />
              </Button>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200" title="Yopilgan">
                <Lock size={16} strokeWidth={2.5} />
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <MarkaToysModal
        markaId={showToysModal ? marka.id : null}
        markaName={marka.number.toString()}
        onClose={() => setShowToysModal(false)}
      />
    </Card>
  );
}
