"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { useReportStore, ProductionItem } from "@/stores/reportStore";
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
    ChevronRight,
    ArrowRight,
    Layers
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

    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prev: typeof filters) => ({ ...prev, [name]: value }));
    };

    const handleProductTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setFilters((prev: typeof filters) => ({ ...prev, productType: e.target.value }));
    };

    return (
        <div className="space-y-8 animate-in pb-10">
            {/* Filter Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3 card-premium p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-label-premium ml-1">Boshlanish Sanasi</Label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                <Input
                                    type="date"
                                    name="startDate"
                                    className="h-12 pl-12 bg-white/50 dark:bg-slate-900/50 border-border rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                    value={filters.startDate}
                                    onChange={handleDateChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-label-premium ml-1">Tugash Sanasi</Label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                <Input
                                    type="date"
                                    name="endDate"
                                    className="h-12 pl-12 bg-white/50 dark:bg-slate-900/50 border-border rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                    value={filters.endDate}
                                    onChange={handleDateChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-label-premium ml-1">Mahsulot Turi</Label>
                            <select
                                className="w-full h-12 px-4 bg-white/50 dark:bg-slate-900/50 border border-border rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                value={filters.productType}
                                onChange={handleProductTypeChange}
                            >
                                <option value="">Barchasi</option>
                                <option value="TOLA">Tola</option>
                                <option value="LINT">Lint</option>
                                <option value="SIKLON">Siklon</option>
                                <option value="ULUK">Uluk</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="card-premium p-6 flex flex-col justify-center gap-3">
                    <Button
                        onClick={() => exportReport('pdf', filters)}
                        className="h-12 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        <FileText size={16} />
                        PDF Hisobot
                    </Button>
                    <Button
                        onClick={() => exportReport('excel', filters)}
                        variant="outline"
                        className="h-12 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                    >
                        <FileSpreadsheet size={16} />
                        Excel (Data)
                    </Button>
                </div>
            </div>

            {/* Production Matrix */}
            <Card className="card-premium overflow-hidden border-none shadow-xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-primary/5 border-b border-primary/10">
                                    <th className="px-8 py-6 text-label-premium">Sana</th>
                                    <th className="px-8 py-6 text-label-premium">Brigada</th>
                                    <th className="px-8 py-6 text-label-premium">Marka №</th>
                                    <th className="px-8 py-6 text-label-premium">Turi</th>
                                    <th className="px-8 py-6 text-label-premium">Tartib №</th>
                                    <th className="px-8 py-6 text-label-premium">Vazn</th>
                                    <th className="px-8 py-6 text-label-premium">Sinf</th>
                                    <th className="px-8 py-6 text-label-premium text-right">Holat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {productionData.map((item: ProductionItem, i: number) => (
                                    <tr key={i} className="hover:bg-primary/[0.02] transition-colors group">
                                        <td className="px-8 py-5 text-sm font-bold text-foreground">{new Date(item.date || '').toLocaleDateString()}</td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-black font-mono">
                                                {item.brigade || '-'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-black text-foreground">M-{item.marka}</td>
                                        <td className="px-8 py-5 text-sm font-medium text-muted-foreground">{item.productType}</td>
                                        <td className="px-8 py-5 text-sm font-mono-premium text-muted-foreground">#{item.toyNo}</td>
                                        <td className="px-8 py-5 text-sm font-black text-foreground font-mono">{item.netto.toFixed(1)} kg</td>
                                        <td className="px-8 py-5">
                                            <span className={cn(
                                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                                item.grade === 'OLIY' ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-white/5 text-muted-foreground"
                                            )}>
                                                {item.grade || 'NA'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className={cn(
                                                "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest gap-2",
                                                item.status === 'SHIPPED' ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", item.status === 'SHIPPED' ? "bg-amber-500" : "bg-primary")} />
                                                {item.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {productionData.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground/30">
                                                <Layers size={64} strokeWidth={1} className="mb-4" />
                                                <p className="text-[11px] font-black uppercase tracking-[0.3em]">Ma'lumotlar mavjud emas</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-8 border-t border-white/5 flex items-center justify-between bg-primary/[0.01]">
                        <p className="text-label-premium">
                            Jami: <span className="text-foreground">{productionData.length}</span> natija
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled className="h-10 px-4 rounded-xl border-border text-muted-foreground"><ChevronLeft size={16} /></Button>
                            <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-border text-foreground hover:bg-primary/5 hover:text-primary transition-all"><ChevronRight size={16} /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
