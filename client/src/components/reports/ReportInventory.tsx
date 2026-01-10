"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { useReportStore, InventoryItem } from "@/stores/reportStore";
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

    const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev: typeof filters) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-8 animate-in pb-10">
            {/* Filter Section */}
            <div className="card-premium p-6 flex flex-col md:flex-row items-end gap-6 shadow-xl">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div className="space-y-2">
                        <Label className="text-label-premium ml-1">Mahsulot Turi</Label>
                        <select
                            name="productType"
                            className="w-full h-12 px-4 bg-white/50 dark:bg-slate-900/50 border border-border rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                            value={filters.productType}
                            onChange={handleFilterChange}
                        >
                            <option value="">Barchasi</option>
                            <option value="TOLA">Tola</option>
                            <option value="LINT">Lint</option>
                            <option value="SIKLON">Siklon</option>
                            <option value="ULUK">Uluk</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-label-premium ml-1">Zaxira Holati</Label>
                        <select
                            name="status"
                            className="w-full h-12 px-4 bg-white/50 dark:bg-slate-900/50 border border-border rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                            value={filters.status}
                            onChange={handleFilterChange}
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
                    disabled={isLoading}
                    className="h-12 px-8 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                    <FileSpreadsheet size={18} />
                    Excelga Eksport
                </Button>
            </div>

            {/* Inventory Data Matrix */}
            <Card className="card-premium overflow-hidden border-none shadow-xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-primary/5 border-b border-primary/10">
                                    <th className="px-8 py-6 text-label-premium">ID / Toy №</th>
                                    <th className="px-8 py-6 text-label-premium">Marka №</th>
                                    <th className="px-8 py-6 text-label-premium">Tur</th>
                                    <th className="px-8 py-6 text-label-premium">Vazn</th>
                                    <th className="px-8 py-6 text-label-premium">Holat</th>
                                    <th className="px-8 py-6 text-label-premium text-right">Amal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {inventoryData.map((item: InventoryItem, i: number) => (
                                    <tr key={i} className="hover:bg-primary/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground">#{item.toyNo}</span>
                                                {/* @ts-ignore */}
                                                <span className="text-[10px] font-mono text-muted-foreground">{item.qrUid || item.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-black text-foreground">M-{item.marka}</td>
                                        <td className="px-8 py-5 text-sm font-medium text-muted-foreground">{item.productType}</td>
                                        <td className="px-8 py-5 text-sm font-black text-foreground font-mono">{item.netto.toFixed(1)} kg</td>
                                        <td className="px-8 py-5">
                                            <div className={cn(
                                                "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest gap-2",
                                                item.status === 'IN_STOCK' ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-white/5 text-muted-foreground"
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", item.status === 'IN_STOCK' ? "bg-emerald-500" : "bg-muted-foreground")} />
                                                {item.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                                                <Search size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {inventoryData.length === 0 && (
                        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground/30">
                            <Database size={64} strokeWidth={1} className="mb-4" />
                            <p className="text-[11px] font-black uppercase tracking-[0.3em]">Maʼlumot mavjud emas</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
