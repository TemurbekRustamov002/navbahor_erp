"use client";
import { useState } from "react";
import { WarehouseWorkflow } from "@/components/warehouse/WarehouseWorkflow";
import { MultiWarehouseLayout } from "@/components/warehouse/MultiWarehouseLayout";
import { Button } from "@/components/ui/Button";
import { Warehouse, Users, Layers, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WarehousePage() {
  const [viewMode, setViewMode] = useState<'single' | 'multi'>('single');

  return (
    <div className="h-screen flex flex-col bg-[#f0fdf4] overflow-hidden animate-in fade-in duration-700">
      {/* Navbahor Premium Navigation Header - Glassmorphism */}
      <div className="flex-shrink-0 border-b border-slate-100 bg-white/85 backdrop-blur-md px-6 py-4 z-20 shadow-sm border border-white/60">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center transition-all hover:scale-105 shadow-sm">
              <Warehouse className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Ombor <span className="text-primary italic">Terminali</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{viewMode === 'single' ? "Standard Operatsion Tizimi" : "Multi-Terminal Faol"}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100/50 p-1.5 rounded-xl border border-slate-200 shadow-inner">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('single')}
                className={cn(
                  "h-9 px-5 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-all",
                  viewMode === 'single'
                    ? "bg-white text-primary shadow-lg border border-slate-200"
                    : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                )}
              >
                <Users className="h-4 w-4 mr-2" strokeWidth={2} />
                Single
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={true}
                className="h-9 px-5 rounded-lg font-bold uppercase tracking-widest text-[10px] text-slate-300 flex items-center gap-2"
              >
                <Lock className="h-3.5 w-3.5" strokeWidth={2} />
                Multi
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Terminal View */}
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        {viewMode === 'single' ? (
          <WarehouseWorkflow />
        ) : (
          <MultiWarehouseLayout />
        )}
      </div>
    </div>
  );
}
