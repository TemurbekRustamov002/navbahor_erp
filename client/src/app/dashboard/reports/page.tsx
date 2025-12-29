"use client";
import { useState, useEffect } from "react";
import { useReportStore } from "@/stores/reportStore";
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
  Layers
} from "lucide-react";

export default function ReportsPage() {
  const { stats, fetchDashboardStats, exportReport, isLoading } = useReportStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'production' | 'inventory' | 'shipments' | 'markas'>('dashboard');

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Allowed roles check
  const allowedRoles = ['ADMIN', 'ACCOUNTANT', 'WAREHOUSE_MANAGER', 'WAREHOUSE', 'LAB', 'LAB_ANALYST', 'SUPERVISOR'];
  const isAuthorized = user && allowedRoles.includes(user.role);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <BarChart3 size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Kirish taqiqlangan</h1>
          <p className="text-slate-500">Sizda hisobotlarni ko'rish uchun yetarli huquqlar mavjud emas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col animate-in fade-in duration-500">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-[1.2rem] bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <BarChart3 size={24} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight leading-none">Hisobotlar Markazi</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                  Analitika va Monitoring
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-12 bg-slate-100 rounded-xl p-1 flex items-center gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={cn(
                  "px-4 h-10 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === 'dashboard' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
              >
                <LayoutDashboard size={14} />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('production')}
                className={cn(
                  "px-4 h-10 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === 'production' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
              >
                <FileText size={14} />
                Ishlab Chiqarish
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={cn(
                  "px-4 h-10 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === 'inventory' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
              >
                <Package size={14} />
                Inventar
              </button>
              <button
                onClick={() => setActiveTab('shipments')}
                className={cn(
                  "px-4 h-10 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === 'shipments' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
              >
                <Truck size={14} />
                Yukxatilar
              </button>
              <button
                onClick={() => setActiveTab('markas')}
                className={cn(
                  "px-4 h-10 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === 'markas' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
              >
                <Layers size={14} />
                Markalar
              </button>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                if (activeTab === 'dashboard') fetchDashboardStats();
              }}
              disabled={isLoading}
              className="h-12 w-12 rounded-xl border-slate-200 bg-white text-slate-600 hover:text-indigo-600 active:scale-95 shadow-sm p-0 flex items-center justify-center"
            >
              <RefreshCw size={20} className={cn(isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto w-full px-8 py-10 space-y-10">
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ReportStats stats={stats} />
            <ReportCharts stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-xl shadow-black/5 rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                  <CardTitle className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Sifat Ko'rsatkichlari Taqsimoti</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinf (Grade)</th>
                          <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Soni</th>
                          <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Foiz</th>
                          <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Holat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {stats?.quality?.map((q: any, i: number) => {
                          const total = stats.quality.reduce((a: any, b: any) => a + b.count, 0);
                          const percentage = Math.round((q.count / total) * 100);
                          return (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                  <span className="text-sm font-bold text-slate-700">{q.grade}</span>
                                </div>
                              </td>
                              <td className="px-8 py-4 text-center">
                                <span className="text-sm font-mono font-bold text-slate-600">{q.count} ta</span>
                              </td>
                              <td className="px-8 py-4 text-center">
                                <div className="flex items-center justify-center gap-3">
                                  <div className="flex-1 max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-indigo-500 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-500">{percentage}%</span>
                                </div>
                              </td>
                              <td className="px-8 py-4 text-right">
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Yuqori</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl shadow-black/5 rounded-[2.5rem] bg-indigo-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <BarChart3 size={120} />
                </div>
                <CardHeader className="p-8">
                  <CardTitle className="text-[12px] font-black text-indigo-200 uppercase tracking-[0.2em]">Tezkor Eksport</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6 relative z-10">
                  <p className="text-sm font-medium text-indigo-100 leading-relaxed">
                    Barcha boʻlimlar boʻyicha oylik konsolidatsiyalashgan hisobotni bir marta bosish orqali yuklab oling.
                  </p>
                  <div className="space-y-3 pt-4">
                    <Button
                      onClick={() => exportReport('pdf')}
                      className="w-full h-14 bg-white text-indigo-600 hover:bg-slate-50 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3"
                    >
                      <Download size={18} />
                      PDF Hisobot Yuklash
                    </Button>
                    <Button
                      onClick={() => exportReport('excel')}
                      className="w-full h-14 bg-indigo-500 text-white hover:bg-indigo-400 border-none rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3"
                    >
                      <FileSpreadsheet size={18} />
                      Excel (Data dump)
                    </Button>
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
      </main>
    </div>
  );
}
