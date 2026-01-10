"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useWarehouseBackendStore } from "@/stores/warehouseBackendStore";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import {
    Scan,
    Smartphone,
    CheckCircle,
    AlertTriangle,
    ArrowLeft,
    Loader2,
    Package,
    User,
    LogOut,
    ChevronRight,
} from "lucide-react";

export default function MobileScannerPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, logout, isAuthenticated } = useAuthStore();
    const {
        checklists,
        fetchChecklists,
        fetchChecklistById,
        currentChecklist,
        scanToy,
        loading,
        error,
        reset,
    } = useWarehouseBackendStore();

    const [view, setView] = useState<"list" | "scan">("list");
    const [manualInput, setManualInput] = useState("");
    const [lastScan, setLastScan] = useState<{ id: string; success: boolean; msg: string } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus management for Urovo hardware wedge
    const keepFocus = useCallback(() => {
        if (view === "scan" && inputRef.current) {
            inputRef.current.focus();
        }
    }, [view]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/");
            return;
        }
        fetchChecklists();
    }, [isAuthenticated, router, fetchChecklists]);

    useEffect(() => {
        if (view === "scan") {
            keepFocus();
            const handleGlobalClick = () => keepFocus();
            window.addEventListener("click", handleGlobalClick);
            return () => window.removeEventListener("click", handleGlobalClick);
        }
    }, [view, keepFocus]);

    const handleSelectChecklist = async (id: string) => {
        try {
            await fetchChecklistById(id);
            setView("scan");
            setLastScan(null);
        } catch (err) {
            toast.error("Checklistni yuklashda xatolik");
        }
    };

    const handleScan = async (scannedCode: string) => {
        const code = scannedCode.trim();
        if (!code || !currentChecklist) return;

        try {
            // Find item in checklist
            const item = currentChecklist.items.find(
                (i: any) =>
                    i.toyId === code ||
                    i.orderNo?.toString() === code ||
                    (code.startsWith("NV-") && code === i.toy?.qrUid)
            );

            if (!item) {
                throw new Error("REESTRDA YO'Q");
            }

            if (item.scanned) {
                throw new Error("AVVAL SKANERLANGAN");
            }

            await scanToy(currentChecklist.id, item.toyId, code);
            setLastScan({ id: item.orderNo.toString(), success: true, msg: "OK" });
            setManualInput("");

            // Success Haptic/Sound placeholder
            if (window.navigator.vibrate) window.navigator.vibrate(100);

        } catch (err: any) {
            setLastScan({ id: code, success: false, msg: err.message || "XATO" });
            if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
            toast.error(err.message || "Xatolik");
            setManualInput("");
        } finally {
            keepFocus();
        }
    };

    const handleBack = () => {
        if (view === "scan") {
            setView("list");
            fetchChecklists();
        } else {
            router.push("/dashboard");
        }
    };

    if (loading && !currentChecklist && view === "list") {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="font-bold tracking-widest uppercase text-xs">Yuklanmoqda...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans select-none overflow-hidden">
            {/* Invisible scanner input gate */}
            <input
                ref={inputRef}
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan(manualInput)}
                className="fixed -top-20 opacity-0"
                autoFocus
            />

            {/* Modern Compact Header */}
            <header className="h-14 bg-slate-900 border-b border-white/5 flex items-center justify-between px-4 shrink-0 shadow-lg relative z-20">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="h-9 w-9 text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-sm font-black tracking-tight text-white uppercase">
                            {view === "list" ? "Active Checklists" : `Scan: ${currentChecklist?.code?.split("-")[1] || "CL"}`}
                        </h1>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">RT40 ONLINE</span>
                        </div>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { logout(); router.push("/"); }}
                    className="h-9 w-9 text-red-400/70"
                >
                    <LogOut className="h-4 w-4" />
                </Button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-4 relative">
                {view === "list" ? (
                    <div className="space-y-3">
                        {checklists.filter(cl => cl.status === 'READY').length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                                <Package className="h-12 w-12 mb-4 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest">Faol checklistlar yo'q</p>
                                <Button
                                    variant="outline"
                                    onClick={() => fetchChecklists()}
                                    className="mt-6 border-white/10 text-slate-400"
                                >
                                    Yangilash
                                </Button>
                            </div>
                        ) : (
                            checklists
                                .filter(cl => cl.status === 'READY')
                                .map((cl) => (
                                    <div
                                        key={cl.id}
                                        onClick={() => handleSelectChecklist(cl.id)}
                                        className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 active:scale-[0.98] transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Scan className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white">{cl.order?.customer?.name || "Noma'lum Mijoz"}</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5">
                                                    #{cl.code?.split("-")[1]} • {cl.items?.length || 0} dona
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-700 group-active:text-primary" />
                                    </div>
                                ))
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        {/* Scan Status Area (Large for RT40 feedback) */}
                        <div className={cn(
                            "rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col items-center justify-center p-8 mb-6",
                            !lastScan ? "bg-slate-900 border-white/10" :
                                lastScan.success ? "bg-emerald-500/10 border-emerald-500/50" : "bg-red-500/10 border-red-500/50"
                        )}>
                            {!lastScan ? (
                                <>
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                        <Scan className="h-10 w-10 text-slate-400" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Skaner kutilyapti</p>
                                </>
                            ) : (
                                <>
                                    <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg",
                                        lastScan.success ? "bg-emerald-500" : "bg-red-500"
                                    )}>
                                        {lastScan.success ? <CheckCircle className="text-white h-8 w-8" /> : <AlertTriangle className="text-white h-8 w-8" />}
                                    </div>
                                    <p className="text-4xl font-black text-white font-mono mb-1">#{lastScan.id}</p>
                                    <p className={cn(
                                        "text-[10px] font-black uppercase tracking-[0.2em]",
                                        lastScan.success ? "text-emerald-400" : "text-red-400"
                                    )}>{lastScan.msg}</p>
                                </>
                            )}
                        </div>

                        {/* Progress Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Skanerlandi</p>
                                <p className="text-2xl font-black text-white font-mono leading-none">
                                    {currentChecklist?.items?.filter((i: any) => i.scanned).length || 0}
                                </p>
                            </div>
                            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Jami</p>
                                <p className="text-2xl font-black text-white font-mono leading-none">
                                    {currentChecklist?.items?.length || 0}
                                </p>
                            </div>
                        </div>

                        {/* Large Progress Bar */}
                        <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-4 mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Progress</span>
                                <span className="text-[10px] font-bold text-primary">
                                    {currentChecklist ? Math.round((currentChecklist.items.filter((i: any) => i.scanned).length / currentChecklist.items.length) * 100) : 0}%
                                </span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${currentChecklist ? (currentChecklist.items.filter((i: any) => i.scanned).length / currentChecklist.items.length) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Items List - Marka and Toy Info */}
                        <div className="flex-1 min-h-0 flex flex-col mb-4">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Checklist Tarkibi</h3>
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                {[...(currentChecklist?.items || [])].sort((a, b) => (a.scanned === b.scanned ? 0 : a.scanned ? 1 : -1)).map((item: any) => (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-xl border transition-all",
                                            item.scanned
                                                ? "bg-emerald-500/5 border-emerald-500/20 opacity-60"
                                                : "bg-slate-900 border-white/5 shadow-lg shadow-black/20"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black font-mono",
                                                item.scanned ? "bg-emerald-500 text-white" : "bg-primary/20 text-primary"
                                            )}>
                                                {item.scanned ? <CheckCircle className="h-4 w-4" /> : item.orderNo}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-white">MARKA: {item.marka?.number || item.toy?.marka?.number || '?'}</p>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                                                    TOY: #{item.orderNo} • {item.netto} kg
                                                </p>
                                            </div>
                                        </div>
                                        {!item.scanned && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-auto grid grid-cols-1 gap-3">
                            {currentChecklist?.status === 'SCANNED' && (
                                <Button
                                    onClick={handleBack}
                                    className="h-14 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs"
                                >
                                    Done / Ro'yxatga Qaytish
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer Branding */}
            <footer className="h-8 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm border-t border-white/5">
                <p className="text-[8px] font-bold text-slate-700 uppercase tracking-[0.3em]">NAVBAHOR RT40 CLIENT v1.0</p>
            </footer>
        </div>
    );
}
