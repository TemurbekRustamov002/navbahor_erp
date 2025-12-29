import { useState, useEffect } from "react";
import { useReportStore } from "@/stores/reportStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
    Search,
    Filter,
    Download,
    FileSpreadsheet,
    FileText,
    Calendar,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ReportProduction() {
    const { productionData, fetchProductionReport, exportReport, isLoading } = useReportStore();
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        productType: ""
    });

    useEffect(() => {
        fetchProductionReport(filters);
    }, [fetchProductionReport, filters]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Search & Filters HUD */}
            <div className="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-black/5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Boshlanish Sanasi</Label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                            <Input
                                type="date"
                                className="h-12 pl-12 bg-slate-50/50 border-slate-200 rounded-xl text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tugash Sanasi</Label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                            <Input
                                type="date"
                                className="h-12 pl-12 bg-slate-50/50 border-slate-200 rounded-xl text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mahsulot Turi</Label>
                        <select
                            className="w-full h-12 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 transition-all focus:outline-none"
                            value={filters.productType}
                            onChange={(e) => setFilters({ ...filters, productType: e.target.value })}
                        >
                            <option value="">Barchasi</option>
                            <option value="TOLA">Tola</option>
                            <option value="LINT">Lint</option>
                            <option value="SIKLON">Siklon</option>
                            <option value="ULUK">Uluk</option>
                        </select>
                    </div>
                    <div className="flex items-end gap-3">
                        <Button
                            onClick={() => exportReport('pdf', filters)}
                            className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20"
                        >
                            <FileText size={16} className="mr-2" />
                            PDF
                        </Button>
                        <Button
                            onClick={() => exportReport('excel', filters)}
                            variant="outline"
                            className="flex-1 h-12 border-slate-200 bg-white text-emerald-600 hover:text-emerald-700 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-sm"
                        >
                            <FileSpreadsheet size={16} className="mr-2" />
                            Excel
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Table Matrix */}
            <Card className="border-none shadow-xl shadow-black/5 rounded-[2.5rem] bg-white overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sana</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Brigada</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Marka №</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Turi</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tartib №</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vazn (Netto)</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinf (Grade)</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Holat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {productionData.map((item, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5 text-sm font-bold text-slate-600">{new Date(item.createdAt).toLocaleDateString()}</td>
                                        <td className="px-8 py-5 text-sm font-black text-indigo-500 font-mono italic">{item.brigade || '-'}</td>
                                        <td className="px-8 py-5 text-sm font-black text-slate-900">M-{item.markaNumber}</td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                {item.productType}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-mono font-bold text-slate-500">#{item.orderNo}</td>
                                        <td className="px-8 py-5 text-sm font-black text-slate-900 font-mono">{item.netto.toFixed(1)} kg</td>
                                        <td className="px-8 py-5">
                                            <span className={cn(
                                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                                item.grade === 'OLIY' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                                            )}>
                                                {item.grade || 'NA'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                item.status === 'SHIPPED' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                                            )}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination HUD */}
                    <div className="p-8 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Koʻrsatilmoqda: <span className="text-slate-900">{productionData.length}</span> / {productionData.length} natija
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled className="h-10 px-4 rounded-xl border-slate-200 text-slate-400"><ChevronLeft size={16} /></Button>
                            <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-slate-200 text-slate-900"><ChevronRight size={16} /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
