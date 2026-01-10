"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import {
    Scale,
    Package,
    Calendar,
    Tag,
    Factory,
    Users,
    CheckCircle2,
    AlertCircle,
    ChevronLeft,
    Phone,
    MapPin,
    Building2,
    QrCode,
    FileText,
    FlaskConical
} from "lucide-react";
import { formatWeight } from "@/lib/utils/number";
import { cn } from "@/lib/utils";
import { printQualityCertificate } from "@/lib/utils/print";

export default function PublicToyView() {
    const { id } = useParams();
    const [toy, setToy] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchToy = async () => {
            try {
                setLoading(true);
                const data = await apiClient.get(`/toys/${id}`);
                setToy(data);
            } catch (err: any) {
                console.error("Failed to fetch toy:", err);
                setError("Ma'lumot topilmadi yoki xatolik yuz berdi");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchToy();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping" />
                    <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin" />
                    <Scale className="absolute inset-0 m-auto h-10 w-10 text-primary animate-pulse" />
                </div>
                <p className="text-xl font-bold tracking-widest uppercase animate-pulse">Yuklanmoqda...</p>
            </div>
        );
    }

    if (error || !toy) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                </div>
                <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Xatolik</h1>
                <p className="text-slate-400 max-w-xs">{error || "Toy haqida ma'lumot topilmadi"}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-8 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-all"
                >
                    Qayta urinish
                </button>
            </div>
        );
    }

    const dateStr = new Date(toy.createdAt).toLocaleString("uz-UZ", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-primary/30 font-sans">
            {/* Background Ornaments */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-md mx-auto py-10 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

                {/* Header Branding */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                        <Package className="h-8 w-8 text-primary" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
                            Navbahor <span className="text-primary not-italic">Tekstil</span>
                        </h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1 italic">Industrial Quality Control</p>
                    </div>
                </div>

                {/* Main Status Card */}
                <Card className="bg-white/5 backdrop-blur-2xl border-white/10 border-2 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <QrCode size={120} />
                    </div>

                    <CardContent className="p-8 space-y-8">
                        {/* ID & Number */}
                        <div className="flex justify-between items-start border-b border-white/5 pb-6">
                            <div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Identifikatsiya</p>
                                <h2 className="text-4xl font-black text-white font-mono tracking-tighter leading-none">
                                    #{toy.orderNo}
                                </h2>
                            </div>
                            <div className="bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1.5">
                                <CheckCircle2 size={12} strokeWidth={3} />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none pt-0.5">Sertifikatlangan</span>
                            </div>
                        </div>

                        {/* Main Weight Matrix */}
                        <div className="grid grid-cols-1 gap-6">
                            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center relative group">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mb-3 relative z-10 transition-colors group-hover:text-primary/70">UMUMIY (BRUTTO)</p>
                                <div className="flex items-baseline gap-2 relative z-10">
                                    <span className="text-6xl font-black text-white font-mono tracking-tighter tabular-nums drop-shadow-2xl transition-transform duration-500 group-hover:scale-110">
                                        {formatWeight(toy.brutto)}
                                    </span>
                                    <span className="text-xs font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">kg</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-5 flex flex-col items-center group/item hover:bg-white/[0.04] transition-all">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 group-hover/item:text-slate-400">SOF OG'IRLIGI (NETTO)</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl font-bold text-white font-mono tracking-tight">{formatWeight(toy.netto)}</span>
                                        <span className="text-[10px] font-bold text-slate-600">kg</span>
                                    </div>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-5 flex flex-col items-center group/item hover:bg-white/[0.04] transition-all">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 group-hover/item:text-slate-400">TARA</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl font-bold text-white font-mono tracking-tight">{formatWeight(toy.tara)}</span>
                                        <span className="text-[10px] font-bold text-slate-600">kg</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pt-2">
                            <button
                                disabled={toy.labStatus !== 'APPROVED'}
                                onClick={() => printQualityCertificate(toy)}
                                className={cn(
                                    "w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-[0.2em] transition-all",
                                    toy.labStatus === 'APPROVED'
                                        ? "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 cursor-pointer"
                                        : "bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed"
                                )}
                            >
                                <FileText size={18} />
                                Sifat Sertifikatini Yuklab Olish
                            </button>
                            {toy.labStatus !== 'APPROVED' && (
                                <p className="text-center text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-3">
                                    * Sertifikat laboratoriya tasdiqlaganidan so'ng shakllanadi
                                </p>
                            )}
                        </div>

                        {/* Technical Metadata Grid */}
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4 pt-4 border-t border-white/5">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 opacity-40">
                                    <Tag size={12} className="text-primary" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Marka No.</span>
                                </div>
                                <p className="text-sm font-black text-white tracking-tight ml-5">#{toy.marka?.number || '---'}</p>
                            </div>

                            <div className="space-y-1.5 text-right">
                                <div className="flex items-center gap-2 justify-end opacity-40">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Mahsulot Turi</span>
                                    <Tag size={12} className="text-primary" />
                                </div>
                                <p className="text-sm font-black text-white tracking-tight mr-5 uppercase">{toy.productType || 'Tola'}</p>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 opacity-40">
                                    <Factory size={12} className="text-primary" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Sex / Zavod</span>
                                </div>
                                <p className="text-sm font-black text-white tracking-tight ml-5">{toy.marka?.sex || '-'}</p>
                            </div>

                            <div className="space-y-1.5 text-right">
                                <div className="flex items-center gap-2 justify-end opacity-40">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Terim Turi</span>
                                    <Users size={12} className="text-primary" />
                                </div>
                                <p className="text-sm font-black text-white tracking-tight mr-5">{toy.marka?.pickingType || '-'}</p>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 opacity-40">
                                    <Calendar size={12} className="text-primary" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Sana va Vaqt</span>
                                </div>
                                <p className="text-[11px] font-black text-white/80 tracking-tight ml-5 leading-tight">{dateStr}</p>
                            </div>

                            <div className="space-y-1.5 text-right">
                                <div className="flex items-center gap-2 justify-end opacity-40">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Mas'ul Brigada</span>
                                    <Building2 size={12} className="text-primary" />
                                </div>
                                <p className="text-sm font-black text-white tracking-tight mr-5">{toy.brigade || '---'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Contact Info */}
                <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                <Phone className="h-4 w-4 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Bog'lanish</p>
                                <p className="text-sm font-black text-white">+998 97 953 25 293</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Manzil</p>
                                <p className="text-[11px] font-bold text-white/70 leading-relaxed uppercase tracking-tight">
                                    Navoiy viloyati, Navbahor tumani, "Paxtakor" MFY "Turon" ko'chasi № 8
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center opacity-30 group cursor-default">
                        <p className="text-[8px] font-bold uppercase tracking-[0.5em] group-hover:text-primary transition-colors">Digital Security Badge • ERP System Verified</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
