import { useState, useEffect } from "react";
import { useReportStore } from "@/stores/reportStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
    Search,
    Package,
    Download,
    FileSpreadsheet,
    ChevronLeft,
    ChevronRight,
    Database
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ReportInventory() {
    const { inventoryData, fetchInventoryReport, exportReport, isLoading } = useReportStore();
    const [filters, setFilters] = useState({
        productType: "",
        status: ""
    });

    useEffect(() => {
        fetchInventoryReport(filters);
    }, [fetchInventoryReport, filters]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-black/5 flex flex-col md:flex-row items-end gap-6">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
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
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zaxira Holati</Label>
                        <select
                            className="w-full h-12 px-4 bg-slate-50/50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 transition-all focus:outline-none"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="">Barcha Holatlar</option>
                            <option value="IN_STOCK">Omborda</option>
                            <option value="RESERVED">Bron qilingan</option>
                            <option value="SHIPPED">Yuklangan</option>
                        </select>
                    </div>
                </div>
                <Button
                    onClick={() => exportReport('excel', filters)}
                    className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-600/20"
                >
                    <FileSpreadsheet size={18} className="mr-2" />
                    Excelga Eksport
                </Button>
            </div>

            <Card className="border-none shadow-xl shadow-black/5 rounded-[2.5rem] bg-white overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID (QR)</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Marka №</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Brigada</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tur</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vazn</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Holat</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {inventoryData.map((item, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5 text-xs font-mono font-bold text-slate-500">{item.qrUid}</td>
                                        <td className="px-8 py-5 text-sm font-black text-slate-900">M-{item.markaNumber}</td>
                                        <td className="px-8 py-5 text-sm font-black text-indigo-500 font-mono italic">{item.brigade || '-'}</td>
                                        <td className="px-8 py-5 text-sm">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                {item.productType}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-black text-slate-900 font-mono">{item.netto.toFixed(1)} kg</td>
                                        <td className="px-8 py-5">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                item.status === 'IN_STOCK' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                                            )}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                                                <Search size={14} className="text-slate-400" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {inventoryData.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                            <Database size={48} strokeWidth={1} className="mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Maʼlumot mavjud emas</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
