"use client";
import { useMultiWarehouseStore } from "@/stores/multiWarehouseStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  Users,
  Package,
  ClipboardCheck,
  Scan,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  RefreshCw
} from "lucide-react";

export function WorkspaceStats() {
  const {
    workspaceTabs,
    customerWorkspaces,
    getWorkspaceStats,
    cleanupInactiveTabs
  } = useMultiWarehouseStore();

  const stats = getWorkspaceStats();

  // Calculate additional metrics
  const statusCounts = workspaceTabs.reduce((acc, tab) => {
    acc[tab.status] = (acc[tab.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getEfficiency = () => {
    if (stats.totalItems === 0) return 0;
    return Math.round((stats.scannedItems / stats.totalItems) * 100);
  };

  const getActiveWorkspaces = () => {
    return workspaceTabs.filter(tab =>
      ['active', 'checklist_ready', 'scanning', 'completed'].includes(tab.status)
    ).length;
  };

  const getRecentActivity = () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    return workspaceTabs.filter(tab => tab.lastActivity > oneHourAgo).length;
  };

  return (
    <div className="bg-background p-8 border-b border-border">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
        {/* Total Workspaces */}
        <div className="glass-card p-6 rounded-[2rem] border-none shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group bg-white/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
              <Users size={18} />
            </div>
            <span className="text-label-premium opacity-40">Jami</span>
          </div>
          <div className="text-3xl font-black text-foreground tracking-tighter tabular-nums">{stats.totalTabs}</div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">workspace</div>
        </div>

        {/* Active Workspaces */}
        <div className="glass-card p-6 rounded-[2rem] border-none shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group bg-white/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <Clock size={18} />
            </div>
            <span className="text-label-premium opacity-40">Faol</span>
          </div>
          <div className="text-3xl font-black text-primary tracking-tighter tabular-nums">{getActiveWorkspaces()}</div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">ishlamoqda</div>
        </div>

        {/* Total Checklists */}
        <div className="glass-card p-6 rounded-[2rem] border-none shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group bg-white/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
              <ClipboardCheck size={18} />
            </div>
            <span className="text-label-premium opacity-40">Checklist</span>
          </div>
          <div className="text-3xl font-black text-foreground tracking-tighter tabular-nums">{stats.totalChecklists}</div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">yaratilgan</div>
        </div>

        {/* Total Items */}
        <div className="glass-card p-6 rounded-[2rem] border-none shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group bg-white/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all duration-500">
              <Package size={18} />
            </div>
            <span className="text-label-premium opacity-40">Toylar</span>
          </div>
          <div className="text-3xl font-black text-foreground tracking-tighter tabular-nums">{stats.totalItems}</div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">jarayonda</div>
        </div>

        {/* Scanned Items */}
        <div className="glass-card p-6 rounded-[2rem] border-none shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group bg-white/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
              <Scan size={18} />
            </div>
            <span className="text-label-premium opacity-40">Skanerlash</span>
          </div>
          <div className="text-3xl font-black text-foreground tracking-tighter tabular-nums">{stats.scannedItems}</div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">tasdiqlangan</div>
        </div>

        {/* Pending Items */}
        <div className="glass-card p-6 rounded-[2rem] border-none shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group bg-white/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all duration-500">
              <Clock size={18} />
            </div>
            <span className="text-label-premium opacity-40">Qolgan</span>
          </div>
          <div className="text-3xl font-black text-foreground tracking-tighter tabular-nums">{stats.pendingItems}</div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">kutilmoqda</div>
        </div>

        {/* Efficiency */}
        <div className="glass-card p-6 rounded-[2rem] border-none shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group bg-white/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
              <TrendingUp size={18} />
            </div>
            <span className="text-label-premium opacity-40">Natija</span>
          </div>
          <div className="text-3xl font-black text-emerald-600 tracking-tighter tabular-nums">{getEfficiency()}<span className="text-sm opacity-30">%</span></div>
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">tayyorlandi</div>
        </div>

        {/* Controls */}
        <div className="glass-card p-3 rounded-[2rem] border-none shadow-sm overflow-hidden relative group bg-secondary/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={cleanupInactiveTabs}
            className="w-full h-full flex flex-col items-center justify-center gap-3 hover:bg-destructive text-foreground hover:text-white transition-all duration-500 rounded-[1.5rem]"
          >
            <div className="p-3 bg-white/80 rounded-xl group-hover:bg-transparent transition-colors">
              <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-700" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Tozalash</span>
          </Button>
        </div>
      </div>

      {/* Status breakdown */}
      {Object.keys(statusCounts).length > 0 && (
        <div className="mt-8 flex flex-wrap items-center gap-8 px-4 bg-secondary/10 py-4 rounded-2xl border border-border/50">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Ish jarayoni holati:</span>
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center gap-3 group cursor-pointer">
              <div className={cn(
                "w-3 h-3 rounded-full shadow-lg group-hover:scale-150 transition-all duration-300",
                status === 'active' && "bg-blue-500 shadow-blue-500/20",
                status === 'checklist_ready' && "bg-primary shadow-primary/20",
                status === 'scanning' && "bg-amber-500 shadow-amber-500/20",
                status === 'completed' && "bg-purple-500 shadow-purple-500/20",
                status === 'shipped' && "bg-slate-400 shadow-slate-400/20"
              )} />
              <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">
                {status.replace('_', ' ')}: <span className="text-foreground ml-1">{count}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}