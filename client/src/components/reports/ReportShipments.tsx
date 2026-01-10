"use client";
"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { useReportStore, ShipmentItem } from "@/stores/reportStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
    Search,
    Download,
    FileSpreadsheet,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Truck,
    MapPin,
    User as UserIcon,
    Hash,
    Scale,
    Droplets,
    Wind,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ReportShipments() {
    const { shipmentData, fetchShipmentReport, exportShipments, isLoading } = useReportStore();
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
    });

    useEffect(() => {
        fetchShipmentReport(filters);
    }, [fetchShipmentReport, filters]);

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const headers = [
        { label: "Sana", icon: <Calendar size={14} /> },
        { label: "Qayerga", icon: <MapPin size={14} /> },
        { label: "Mas'ul", icon: <UserIcon size={14} /> },
        { label: "Mijoz", icon: <UserIcon size={14} /> },
        { label: "Yukxati", icon: <Hash size={14} /> },
        { label: "Mashina", icon: <Truck size={14} /> },
        { label: "Marka №" },
        { label: "Toy №" },
        { label: "Vazn", icon: <Scale size={14} /> },
        { label: "Sinf" },
        { label: "Namlik", icon: <Droplets size={14} /> },
        { label: "Ifloslik", icon: <Wind size={14} /> },
        { label: "Mustahkamlik" }
    ];

    return (
        <div className="space-y-8 animate-in pb-10">
            {/* Filter Section */}
            <div className="card-premium p-6 flex flex-col md:flex-row items-end gap-6 shadow-xl">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div className="space-y-2">
                        <Label className="text-label-premium ml-1">Boshlanish Sanasi</Label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                            <Input
                                type="date"
                                name="startDate"
                                className="h-12 pl-12 bg-white/50 dark:bg-slate-900/50 border-border rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                value={filters.startDate}
                                onChange={handleFilterChange}
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
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>
                </div>
                <Button
                    onClick={() => exportShipments(filters)}
                    disabled={isLoading}
                    className="h-12 px-8 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                    <FileSpreadsheet size={18} />
                    Excel (Batafsil)
                </Button>
            </div>

            {/* Shipments Ledger */}
            <Card className="card-premium overflow-hidden border-none shadow-xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[1500px]">
                            <thead>
                                <tr className="bg-primary/5 border-b border-primary/10">
                                    {headers.map((h, i) => (
                                        <th key={i} className="px-6 py-6 text-label-premium whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-primary/60">{h.icon}</span>
                                                {h.label}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {shipmentData.map((item: ShipmentItem, i: number) => (
                                    <tr key={i} className="hover:bg-primary/[0.02] transition-colors group">
                                        <td className="px-6 py-5 text-sm font-bold text-foreground whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-5 text-sm font-semibold text-foreground">{item.destination}</td>
                                        <td className="px-6 py-5 text-sm font-medium text-muted-foreground">{item.createdBy}</td>
                                        <td className="px-6 py-5 text-sm font-black text-foreground">{item.customer}</td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-black font-mono">
                                                {item.waybill}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium text-muted-foreground">{item.vehicle}</td>
                                        <td className="px-6 py-5 text-sm font-black text-foreground">M-{item.markaNumber}</td>
                                        <td className="px-6 py-5 text-sm font-mono-premium text-muted-foreground">#{item.orderNo}</td>
                                        <td className="px-6 py-5 text-sm font-black text-foreground font-mono">{item.netto.toFixed(1)} kg</td>
                                        <td className="px-6 py-5">
                                            <span className={cn(
                                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                                item.grade === 'OLIY' ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-white/5 text-muted-foreground"
                                            )}>
                                                {item.grade || 'NA'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-foreground">{item.moisture}%</td>
                                        <td className="px-6 py-5 text-sm font-bold text-foreground">{item.trash}%</td>
                                        <td className="px-6 py-5 text-sm font-bold text-foreground italic opacity-70">{item.strength}</td>
                                    </tr>
                                ))}
                                {shipmentData.length === 0 && (
                                    <tr>
                                        <td colSpan={13} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground/30">
                                                <Truck size={64} strokeWidth={1} className="mb-4" />
                                                <p className="text-[11px] font-black uppercase tracking-[0.3em]">Yukxatilar topilmadi</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Summary */}
                    <div className="p-8 border-t border-white/5 bg-primary/[0.01]">
                        <p className="text-label-premium">
                            Jami yuklangan: <span className="text-foreground">{shipmentData.length}</span> dona yukxati
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
