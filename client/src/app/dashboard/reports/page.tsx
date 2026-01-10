"use client";

import { useState, useEffect } from "react";
import { useReportStore, DashboardStats } from "@/stores/reportStore";
import { ReportStats } from "@/components/reports/ReportStats";
import { ReportCharts } from "@/components/reports/ReportCharts";
import { ReportProduction } from "@/components/reports/ReportProduction";
import { ReportInventory } from "@/components/reports/ReportInventory";
import { ReportShipments } from "@/components/reports/ReportShipments";
import { ReportMarkaSummary } from "@/components/reports/ReportMarkaSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  FileText,
  BarChart3,
  Package,
  RefreshCw,
  LayoutDashboard,
  Download,
  FileSpreadsheet,
  Truck,
  Layers,
  ArrowRight
} from "lucide-react";

type TabId = 'dashboard' | 'production' | 'inventory' | 'shipments' | 'markas';

export default function ReportsPage() {
  const { stats, fetchDashboardStats, exportReport, isLoading } = useReportStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Allowed roles check
  const allowedRoles = ['ADMIN', 'ACCOUNTANT', 'WAREHOUSE_MANAGER', 'WAREHOUSE', 'LAB', 'LAB_ANALYST', 'SUPERVISOR'];
  const isAuthorized = user && allowedRoles.includes(user.role);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto">
            <BarChart3 size={32} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Kirish taqiqlangan</h1>
          <p className="text-muted-foreground">Sizda hisobotlarni ko'rish uchun yetarli huquqlar mavjud emas.</p>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'production', label: 'Ishlab Chiqarish', icon: FileText },
    { id: 'inventory', label: 'Inventar', icon: Package },
    { id: 'shipments', label: 'Yukxatilar', icon: Truck },
    { id: 'markas', label: 'Markalar', icon: Layers },
  ];

  return (
    <div className="space-y-8 animate-in pb-10">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-[2rem] glass-card p-1 shadow-2xl shadow-black/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />

        <div className="relative p-6 lg:p-8 bg-white/40 dark:bg-slate-900/40 rounded-[1.8rem]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-white/5 border border-primary/20 backdrop-blur-md">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Hisobotlar Markazi</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Analitika va <span className="text-primary">Monitoring</span>
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                Tizimning umumiy faoliyati va ishlab chiqarish ko'rsatkichlari tahlili.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => fetchDashboardStats()}
                disabled={isLoading}
                className="h-12 w-12 rounded-xl bg-white/60 dark:bg-white/5 border-white/20 hover:bg-white transition-all shadow-sm p-0"
              >
                <RefreshCw size={20} className={cn("text-primary", isLoading && "animate-spin")} />
              </Button>

              <div className="h-12 bg-white/60 dark:bg-white/5 border border-white/20 backdrop-blur-md rounded-xl p-1 flex items-center gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-4 h-10 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                      activeTab === tab.id
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-slate-500 hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    <tab.icon size={14} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'dashboard' && stats && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <ReportStats stats={stats} />
          <ReportCharts stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 card-premium overflow-hidden border-none shadow-xl">
              <CardHeader className="p-8 border-b border-white/10 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-label-premium">Sifat Ko'rsatkichlari Taqsimoti</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Mahsulot sinflari bo'yicha ulush</p>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-primary/5">
                        <th className="px-8 py-4 text-left text-label-premium">Sinf (Grade)</th>
                        <th className="px-8 py-4 text-center text-label-premium">Soni</th>
                        <th className="px-8 py-4 text-center text-label-premium">Ulush (Foiz)</th>
                        <th className="px-8 py-4 text-right text-label-premium">Holat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {stats.quality.map((q, i) => {
                        const total = stats.quality.reduce((a, b) => a + b.count, 0);
                        const percentage = total > 0 ? Math.round((q.count / total) * 100) : 0;
                        return (
                          <tr key={i} className="hover:bg-primary/[0.02] transition-colors">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                  {q.grade}
                                </div>
                                <span className="text-sm font-bold text-foreground">Sinf {q.grade}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-center">
                              <span className="text-sm font-mono-premium text-foreground">{q.count.toLocaleString()} ta</span>
                            </td>
                            <td className="px-8 py-5 text-center">
                              <div className="flex items-center justify-center gap-3">
                                <div className="flex-1 max-w-[120px] h-2 bg-secondary rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all duration-1000"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-[11px] font-black text-primary tabular-nums">{percentage}%</span>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <span className={cn(
                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                percentage > 50 ? "bg-emerald-500/10 text-emerald-600" : percentage > 20 ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600"
                              )}>
                                {percentage > 50 ? 'Yuqori' : percentage > 20 ? 'Normal' : 'Past'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {stats.quality.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-8 py-10 text-center text-muted-foreground italic text-sm">
                            Sifat ma'lumotlari mavjud emas
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium bg-primary text-white overflow-hidden relative border-none shadow-2xl shadow-primary/20">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <BarChart3 size={160} />
              </div>
              <CardHeader className="p-8 relative z-10">
                <CardTitle className="text-[11px] font-black text-white/70 uppercase tracking-[0.2em]">Ma'lumotlarni Eksport qilish</CardTitle>
                <h2 className="text-2xl font-bold mt-2">Hisobot Yuklash</h2>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6 relative z-10">
                <p className="text-sm font-medium text-white/80 leading-relaxed">
                  Barcha boʻlimlar boʻyicha oylik konsolidatsiyalashgan hisobotni bir marta bosish orqali yuklab oling.
                </p>

                <div className="space-y-4 pt-4">
                  <Button
                    onClick={() => exportReport('pdf')}
                    className="w-full h-14 bg-white text-primary hover:bg-slate-50 border-none rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-xl transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    <Download size={18} />
                    PDF Formatsida Yuklash
                  </Button>
                  <Button
                    onClick={() => exportReport('excel')}
                    className="w-full h-14 bg-primary-foreground/20 text-white hover:bg-primary-foreground/30 border border-white/20 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 backdrop-blur-sm transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    <FileSpreadsheet size={18} />
                    Excel (XLSX) Formatda
                  </Button>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[10px] font-bold text-white/60 uppercase tracking-widest">
                  <span>Oxirgi yangilanish:</span>
                  <span className="tabular-nums">{new Date().toLocaleDateString('uz-UZ')}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'production' && <ReportProduction />}
      {activeTab === 'inventory' && <ReportInventory />}
      {activeTab === 'shipments' && <ReportShipments />}
      {activeTab === 'markas' && <ReportMarkaSummary />}
    </div>
  );
}
