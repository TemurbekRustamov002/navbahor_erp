"use client";
"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { useReportStore, MarkaSummaryItem } from "@/stores/reportStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import {
    FileSpreadsheet,
    Package,
    ArrowRight,
    Search,
    RefreshCw,
    Filter,
    Layers,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ReportMarkaSummary() {
    const { markaSummaryData, fetchMarkaSummaryReport, exportMarkaSummary, isLoading } = useReportStore();
    const [department, setDepartment] = useState("");

    useEffect(() => {
        fetchMarkaSummaryReport({ department });
    }, [fetchMarkaSummaryReport, department]);

    const handleDepartmentChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setDepartment(e.target.value);
    };

    return (
        <div className="space-y-8 animate-in pb-10">
            {/* Action HUD */}
            <div className="card-premium p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-foreground">Markalar Umumiy Tahlili</h2>
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        Ishlab chiqarilgan markalar bo'yicha sifat ko'rsatkichlari dinamikasi
                    </p>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex flex-col gap-1.5 min-w-[200px]">
                        <Label className="text-label-premium ml-1">Sex bo'yicha saralash</Label>
                        <select
                            className="h-11 px-4 bg-white/50 dark:bg-slate-900/50 border border-border rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                            value={department}
                            onChange={handleDepartmentChange}
                        >
                            <option value="">Barcha Sexlar</option>
                            <option value="ARRALI_SEX">Arrali Sex</option>
                            <option value="VALIKLI_SEX">Valikli Sex</option>
                        </select>
                    </div>

                    <Button
                        onClick={() => exportMarkaSummary({ department })}
                        disabled={isLoading}
                        className="h-11 px-6 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 flex items-center gap-2 mt-auto"
                    >
                        <FileSpreadsheet size={16} />
                        Eksport (Excel)
                    </Button>
                </div>
            </div>

            {/* Marka Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {markaSummaryData.map((marka: MarkaSummaryItem, idx: number) => (
                    <Card key={idx} className="card-premium group hover:-translate-y-1 transition-all duration-500 overflow-hidden border-none shadow-xl">
                        <CardContent className="p-0">
                            <div className="p-6 border-b border-white/5 bg-primary/[0.03]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-[1.2rem] bg-primary/10 text-primary flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                                            <Layers size={22} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-foreground">M-{marka.number}</h3>
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest">
                                                {marka.department}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{marka.productType}</p>
                                        <div className="mt-1 flex items-center justify-end gap-1 text-[9px] font-bold text-muted-foreground uppercase">
                                            <span>Sex: {marka.sex || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/50 dark:bg-white/5 p-4 rounded-2xl border border-white/10">
                                        <p className="text-label-premium mb-1">Toylar Soni</p>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-xl font-black text-foreground font-mono">{marka.toyCount}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground">/ 220</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/50 dark:bg-white/5 p-4 rounded-2xl border border-white/10">
                                        <p className="text-label-premium mb-1">Jami Netto</p>
                                        <p className="text-xl font-black text-primary font-mono">{marka.totalNetto.toFixed(1)} <span className="text-[10px] font-bold">kg</span></p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-label-premium ml-1">Sifat Tahlili (Namuna)</p>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-xl">
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Brigada</span>
                                            <span className="text-[10px] font-black text-primary font-mono">{marka.toys?.[0]?.brigade || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Sinf</span>
                                            <span className="text-[10px] font-black text-emerald-600 uppercase">{marka.toys?.[0]?.grade || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button variant="ghost" className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 group/btn border border-dashed border-border hover:border-primary/20 transition-all">
                                        Batafsil ma'lumot
                                        <ChevronRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-primary/[0.01] border-t border-white/5 flex items-center justify-center gap-2">
                                <FileSpreadsheet size={12} className="text-primary/40" />
                                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                                    Individual sheet generation enabled
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {markaSummaryData.length === 0 && !isLoading && (
                <div className="text-center py-24 glass-card border-none shadow-xl">
                    <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                        <Package className="h-10 w-10 text-primary/20" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Ma'lumotlar topilmadi</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Tanlangan departament yoki sex bo'yicha hech qanday marka ma'lumotlari shakllantirilmagan.
                    </p>
                    <Button
                        onClick={() => setDepartment("")}
                        className="mt-8 h-10 px-8 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-black uppercase tracking-widest text-[10px]"
                    >
                        Filtrni tozalash
                    </Button>
                </div>
            )}
        </div>
    );
}
