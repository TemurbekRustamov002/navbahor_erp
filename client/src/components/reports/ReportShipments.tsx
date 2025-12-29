"use client";
import { useState, useEffect } from "react";
import { useReportStore } from "@/stores/reportStore";
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
    Hash
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

    const headers = [
        { label: "Sana", icon: <Calendar size={14} /> },
        { label: "Qayerga", icon: <MapPin size={14} /> },
        { label: "Kim tomonidan", icon: <UserIcon size={14} /> },
        { label: "Mijoz", icon: <UserIcon size={14} /> },
        { label: "Yukxati", icon: <Hash size={14} /> },
        { label: "Mashina", icon: <Truck size={14} /> },
        { label: "Marka №" },
        { label: "Toy №" },
        { label: "Vazn (Netto)" },
        { label: "Sinf" },
        { label: "Namlik (%)" },
        { label: "Ifloslik (%)" },
        { label: "Mustahkamlik" }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Search & Filters HUD */}
            <div className="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-black/5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Boshlanish Sanasi</Label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                            <input
                                type="date"
                                className="w-full h-12 pl-12 bg-slate-100/50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tugash Sanasi</Label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                            <input
                                type="date"
                                className="w-full h-12 pl-12 bg-slate-100/50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex items-end gap-3">
                        <Button
                            onClick={() => exportShipments(filters)}
                            className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-600/20"
                        >
                            <FileSpreadsheet size={16} className="mr-2" />
                            Excelga Yuklash
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Table Matrix */}
            <Card className="border-none shadow-xl shadow-black/5 rounded-[2.5rem] bg-white overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1500px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {headers.map((h, i) => (
                                        <th key={i} className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {h.icon}
                                                {h.label}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {shipmentData.map((item, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5 text-sm font-bold text-slate-600">{new Date(item.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-5 text-sm font-semibold text-slate-700">{item.destination}</td>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-500">{item.createdBy}</td>
                                        <td className="px-6 py-5 text-sm font-black text-slate-900">{item.customer}</td>
                                        <td className="px-6 py-5 text-sm font-mono font-bold text-indigo-600">{item.waybill}</td>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-700">{item.vehicle}</td>
                                        <td className="px-6 py-5 text-sm font-black text-slate-900">M-{item.markaNumber}</td>
                                        <td className="px-6 py-5 text-sm font-mono font-bold text-slate-500">#{item.orderNo}</td>
                                        <td className="px-6 py-5 text-sm font-black text-slate-900 font-mono">{item.netto.toFixed(1)} kg</td>
                                        <td className="px-6 py-5">
                                            <span className={cn(
                                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                                item.grade === 'OLIY' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                                            )}>
                                                {item.grade || 'NA'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-slate-600">{item.moisture}%</td>
                                        <td className="px-6 py-5 text-sm font-bold text-slate-600">{item.trash}%</td>
                                        <td className="px-6 py-5 text-sm font-bold text-slate-600">{item.strength}</td>
                                    </tr>
                                ))}
                                {shipmentData.length === 0 && (
                                    <tr>
                                        <td colSpan={13} className="px-8 py-20 text-center text-slate-400 font-medium">
                                            Yukxatilar topilmadi
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination HUD */}
                    <div className="p-8 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Koʻrsatilmoqda: <span className="text-slate-900">{shipmentData.length}</span> natija
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
