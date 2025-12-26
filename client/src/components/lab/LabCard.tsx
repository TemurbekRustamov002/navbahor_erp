"use client";
import { useState } from "react";
import { useBackendLabStore } from "@/stores/backendLabStore";
import { LabSample } from "@/types/lab";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  FlaskConical,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  Calendar,
  Award,
  User
} from "lucide-react";

interface LabCardProps {
  sample: LabSample;
}

export function LabCard({ sample }: LabCardProps) {
  const { toggleShowToSales, deleteSample, approveSample, rejectSample } = useBackendLabStore();
  const [showDetails, setShowDetails] = useState(false);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "APPROVED": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "REJECTED": return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      default: return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return Clock;
      case "APPROVED": return CheckCircle;
      case "REJECTED": return XCircle;
      default: return FlaskConical;
    }
  };

  const StatusIcon = getStatusIcon(sample.status);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleApprove = () => {
    approveSample(sample.toyId);
  };

  const handleReject = () => {
    const reason = prompt("Rad etish sababi:", "Sifat talablariga javob bermaydi");
    if (reason) rejectSample(sample.toyId, reason);
  };

  const handleDelete = () => {
    if (window.confirm("Bu tahlilni o'chirishni tasdiqlaysizmi?")) {
      deleteSample(sample.id);
    }
  };

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-500 border-none rounded-3xl bg-white/40 backdrop-blur-xl shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
      sample.showToSales && "ring-2 ring-primary/20"
    )}>
      <div className="absolute top-0 left-0 w-2 h-full bg-primary/20" />

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-foreground text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
              <FlaskConical size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground uppercase tracking-tight leading-none mb-1">
                {sample.markaLabel}
              </h3>
              <div className="flex items-center gap-2">
                <StatusIcon className={cn("h-3 w-3", sample.status === "PENDING" ? "text-amber-500" : "text-primary")} />
                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                  {sample.status === "PENDING" ? "NAVBATDA" : "TASDIQLANGAN"}
                </span>
              </div>
            </div>
          </div>

          <span className={cn(
            "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/20 shadow-sm transition-all",
            getStatusStyle(sample.status)
          )}>
            {sample.status}
          </span>
        </div>

        {/* Technical Data Hub */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "NAM", value: sample.moisture + "%", color: "text-blue-500" },
            { label: "IFL", value: sample.trash + "%", color: "text-rose-500" },
            { label: "STR", value: sample.strength, color: "text-emerald-500" },
            { label: "LEN", value: sample.lengthMm, color: "text-primary" }
          ].map((metric, i) => (
            <div key={i} className="p-3 bg-secondary/50 rounded-2xl border border-white/50 group-hover:bg-white transition-colors">
              <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">{metric.label}</p>
              <p className={cn("text-lg font-black tabular-nums leading-none", metric.color)}>{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between border-t border-white/20 pt-5 mt-auto">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-lg cursor-pointer hover:bg-white transition-colors"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Award className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-black text-foreground uppercase">{sample.grade}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-lg">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-black text-muted-foreground uppercase">{formatDate(sample.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {sample.status === "PENDING" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleApprove}
                className="h-10 w-10 p-0 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
              >
                <CheckCircle size={18} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleShowToSales(sample.id)}
              className={cn(
                "h-10 w-10 p-0 rounded-xl transition-all shadow-sm",
                sample.showToSales ? "text-primary bg-primary/10" : "text-muted-foreground"
              )}
            >
              {sample.showToSales ? <Eye size={18} /> : <EyeOff size={18} />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-10 w-10 p-0 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>

        {/* Details Dropdown */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-white/20 space-y-2 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
              <User className="h-3 w-3" />
              <span>Tahlilchi: {sample.analyst || "Noma'lum"}</span>
            </div>
            {sample.comment && (
              <div className="p-3 bg-white/50 rounded-xl border border-white/50">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Izoh</p>
                <p className="text-xs font-medium text-foreground">{sample.comment}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}