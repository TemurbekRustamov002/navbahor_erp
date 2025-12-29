"use client";
import { useState, useEffect } from "react";
import { useReportStore } from "@/stores/reportStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import {
    FileSpreadsheet,
    Package,
    ArrowRight,
    Search,
    RefreshCw,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ReportMarkaSummary() {
    const { markaSummaryData, fetchMarkaSummaryReport, exportMarkaSummary, isLoading } = useReportStore();
    const [department, setDepartment] = useState("");

    useEffect(() => {
        fetchMarkaSummaryReport({ department });
    }, [fetchMarkaSummaryReport, department]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/80 backdrop-blur-lg border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-black/5">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900">Markalar Bo'yicha Umumiy Hisobot</h2>
                    <p className="text-sm text-slate-500 font-medium">Barcha markalar va ularning sifat ko'rsatkichlari tahlili</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sex Filteri</Label>
                        <select
                            className="h-12 px-4 bg-slate-100/50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        >
                            <option value="">Barcha Sexlar</option>
                            <option value="ARRALI_SEX">Arrali Sex</option>
                            <option value="VALIKLI_SEX">Valikli Sex</option>
                        </select>
                    </div>

                    <Button
                        onClick={() => exportMarkaSummary({ department })}
                        disabled={isLoading}
                        className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                    >
                        <FileSpreadsheet size={18} />
                        Excelga Yuklash (Barcha Markalar)
                    </Button>
                </div>
            </div>

            {/* Marka Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {markaSummaryData.map((marka, idx) => (
                    <Card key={idx} className="border-none shadow-xl shadow-black/5 rounded-[2rem] bg-white overflow-hidden group hover:shadow-indigo-500/10 transition-all">
                        <CardContent className="p-0">
                            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900">Marka M-{marka.number}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{marka.department}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{marka.productType}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sex: {marka.sex || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-3 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Toylar Soni</p>
                                        <p className="text-lg font-black text-slate-900 font-mono">{marka.toyCount} / 220</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jami Netto</p>
                                        <p className="text-lg font-black text-emerald-600 font-mono">{marka.totalNetto.toFixed(1)} kg</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sifat Ko'rsatkichlari (O'rtacha)</p>
                                    <div className="flex flex-wrap gap-2">
                                        {/* Simplified metrics */}
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            Brigada: {marka.toys[0]?.brigade || '-'}
                                        </span>
                                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            Sinf: {marka.toys[0]?.grade || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 text-center">
                                <p className="text-[9px] font-bold text-slate-400 italic">
                                    Excel faylda ushbu marka uchun alohida varoq (sheet) yaratiladi
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {markaSummaryData.length === 0 && !isLoading && (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                    <Package className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                    <h3 className="text-lg font-bold text-slate-400">Markalar topilmadi</h3>
                    <p className="text-sm text-slate-300">Tanlangan sex bo'yicha ma'lumotlar mavjud emas</p>
                </div>
            )}
        </div>
    );
}
