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
  FileText,
  Tag,
  Truck,
  Settings
} from "lucide-react";

interface MarkaCardProps {
  marka: Marka;
}

export function MarkaCard({ marka }: MarkaCardProps) {
  const { toggleScale, updateStatus } = useBackendMarkaStore();
  const [showToysModal, setShowToysModal] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ACTIVE": return { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20", icon: CheckCircle2, label: "Faol" };
      case "PAUSED": return { color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/20", icon: AlertCircle, label: "Pauza" };
      case "CLOSED": return { color: "text-slate-700 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-500/10", border: "border-slate-200 dark:border-slate-500/20", icon: XCircle, label: "Yopiq" };
      default: return { color: "text-slate-500 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-500/10", border: "border-slate-200 dark:border-slate-500/20", icon: Clock, label: status };
    }
  };

  const status = getStatusConfig(marka.status);
  const progressPercentage = (marka.used / (marka.capacity || 220)) * 100;

  return (
    <Card className="group relative bg-white/50 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/70 dark:border-white/10 rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:translate-y-[-4px] animate-in fade-in duration-500">
      <CardContent className="p-0 flex flex-col h-full">

        {/* Header Block - Compact */}
        <div className="p-3 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 shadow-sm border border-transparent group-hover:border-primary/30",
              marka.status === "ACTIVE" ? "bg-primary/10 dark:bg-primary/20 text-primary" : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400"
            )}>
              <Package size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-lg font-black font-mono text-slate-900 dark:text-white tracking-tighter">#{marka.number}</span>
                <div className={cn("px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5", status.bg, status.color, status.border)}>
                  <status.icon size={9} strokeWidth={3} />
                  {status.label}
                </div>
              </div>
              <p className="text-[9px] font-black text-primary/70 dark:text-primary/60 uppercase tracking-widest">{marka.productType} BO'LIMI</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => exportMarkaPassportPDF(marka.id, marka.number)}
              title="PDF Passport"
              className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-all active:scale-95 flex items-center justify-center"
            >
              <FileText size={16} strokeWidth={2} />
            </button>
            <button
              onClick={() => downloadMarkaLabel(marka.id, marka.number)}
              title="QR Yorliq"
              className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 flex items-center justify-center"
            >
              <QrCode size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Technical Data Grid - Compact 2x2 */}
        <div className="px-3 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            {/* PTM nomi */}
            <div className="p-3 bg-white/60 dark:bg-white/[0.03] rounded-xl border border-slate-200/60 dark:border-white/5 shadow-sm transition-all hover:border-primary/30">
              <p className="text-[7px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.12em] mb-1 flex items-center gap-1.5">
                <FlaskConical size={9} className="text-primary/60" /> PTM nomi
              </p>
              <p className="text-[11px] font-bold text-slate-900 dark:text-slate-200 truncate leading-tight">{marka.ptm || "---"}</p>
            </div>

            {/* Seleksiya navi */}
            <div className="p-3 bg-white/60 dark:bg-white/[0.03] rounded-xl border border-slate-200/60 dark:border-white/5 shadow-sm transition-all hover:border-primary/30">
              <p className="text-[7px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.12em] mb-1 flex items-center gap-1.5">
                <Settings size={9} className="text-primary/60" /> Seleksiya navi
              </p>
              <p className="text-[11px] font-bold text-slate-900 dark:text-slate-200 truncate leading-tight">{marka.selection || "---"}</p>
            </div>

            {/* Terim turi */}
            <div className="p-3 bg-white/60 dark:bg-white/[0.03] rounded-xl border border-slate-200/60 dark:border-white/5 shadow-sm transition-all hover:border-primary/30">
              <p className="text-[7px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.12em] mb-1 flex items-center gap-1.5">
                <Target size={9} className="text-primary/60" /> Terim turi
              </p>
              <p className="text-[11px] font-bold text-slate-900 dark:text-slate-200 truncate leading-tight">{marka.pickingType || "---"}</p>
            </div>

            {/* Mahsulot turi */}
            <div className="p-3 bg-white/60 dark:bg-white/[0.03] rounded-xl border border-slate-200/60 dark:border-white/5 shadow-sm transition-all hover:border-primary/30">
              <p className="text-[7px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.12em] mb-1 flex items-center gap-1.5">
                <Tag size={9} className="text-primary/60" /> Mahsulot turi
              </p>
              <p className="text-[11px] font-bold text-slate-900 dark:text-slate-200 truncate leading-tight">{marka.productType}</p>
            </div>
          </div>

          {/* Load Engine - Slimmer */}
          <div className="bg-slate-50/50 dark:bg-black/30 rounded-xl border border-slate-200/60 dark:border-white/5 p-3.5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.1em]">Yuklanish jarayoni</span>
              <span className="text-[9px] font-black font-mono text-primary italic">{marka.used} / {marka.capacity} toy</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  progressPercentage > 90 ? "bg-amber-500" : "bg-primary"
                )}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action HUD Console - Compact */}
        <div className="mt-2 p-4 bg-slate-50/50 dark:bg-black/50 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowToysModal(true)}
              className="flex-1 h-9 px-0 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-primary transition-all font-bold text-[8px] uppercase tracking-[0.15em] shadow-sm"
            >
              <List size={12} strokeWidth={2.5} className="mr-1.5 opacity-60" /> REESTR
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleScale(marka.id)}
              className={cn(
                "flex-1 h-9 px-0 rounded-lg text-[8px] font-bold uppercase tracking-[0.15em] transition-all",
                marka.showOnScale
                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-500/20"
                  : "text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-primary"
              )}
            >
              <Monitor size={12} className={cn("mr-1.5", marka.showOnScale ? "opacity-100" : "opacity-40")} /> TAROZI
            </Button>
          </div>

          <div className="flex items-center ml-1">
            {marka.status === 'ACTIVE' ? (
              <Button
                size="sm"
                onClick={() => updateStatus(marka.id, 'PAUSED')}
                className="h-9 w-9 p-0 rounded-lg bg-amber-100/80 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/20 transition-all shadow-sm active:scale-95"
                title="Pauza"
              >
                <Pause size={14} strokeWidth={2.5} />
              </Button>
            ) : marka.status === 'PAUSED' ? (
              <Button
                size="sm"
                onClick={() => updateStatus(marka.id, 'ACTIVE')}
                className="h-9 w-9 p-0 rounded-lg bg-emerald-100/80 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/20 transition-all shadow-sm active:scale-95"
                title="Faollashtirish"
              >
                <Play size={14} strokeWidth={2.5} />
              </Button>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-white/10" title="Yopilgan">
                <Lock size={14} strokeWidth={2.5} />
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
