"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { useBackendToyStore } from "@/stores/backendToyStore";
import { useLanguageStore } from "@/stores/languageStore";
import { useScaleProfessional } from "@/lib/hooks/useScale";
import { WS_URL } from "@/lib/api";
import { ScaleDisplay } from "./ScaleDisplay";
import { ToyForm } from "./ToyForm";
import { EnhancedRecentToys } from "./EnhancedRecentToys";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Scale,
  Settings,
  History,
  Maximize2,
  Minimize2,
  LogOut,
  Monitor,
  Package,
  Activity,
  ArrowLeft,
  Terminal,
  Cpu,
  RefreshCw,
  Sun,
  Moon
} from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";

export default function TaroziPage() {
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();
  const { toys, fetchToys } = useBackendToyStore();
  const { markas, fetchMarkas } = useBackendMarkaStore();

  const [selectedMarkaId, setSelectedMarkaId] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wsUrl, setWsUrl] = useState(WS_URL || "ws://localhost:8080");

  const {
    currentReading,
    isConnected,
    hardwareConnectedCount,
    connect,
    connectLocalSerial,
    isSerialConnected,
  } = useScaleProfessional();

  useEffect(() => {
    fetchToys({});
    fetchMarkas({}, false);
  }, [fetchToys, fetchMarkas]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => {
        console.error(`Error: ${e.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayToys = toys.filter(t => new Date(t.createdAt).toDateString() === today);
    const weight = todayToys.reduce((sum, toy) => sum + (Number(toy.brutto) || 0), 0);
    const activeMarkers = markas.filter(m => m.status === "ACTIVE" && m.showOnScale !== false);

    return {
      todayCount: todayToys.length,
      todayWeight: weight,
      activeMarkasCount: activeMarkers.length
    };
  }, [toys, markas]);

  const activeMarkas = useMemo(() =>
    markas.filter(m => m.status === "ACTIVE" && m.showOnScale !== false),
    [markas]);

  return (
    <div className="h-screen overflow-hidden bg-[#f0fdf4] dark:bg-[#0a120b] flex flex-col select-none animate-in fade-in duration-500">
      {/* Premium Industrial Header */}
      <header className="flex-shrink-0 bg-white/80 dark:bg-black/40 backdrop-blur-lg border-b border-white/50 dark:border-white/10 shadow-xl shadow-black/5 relative z-50">
        <div className="w-full px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="group flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition-all shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/5 dark:bg-white/5 flex items-center justify-center border border-primary/10 dark:border-white/10 transition-transform group-hover:-translate-x-1">
                <ArrowLeft className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
              </div>
              <span className="hidden sm:inline"></span>
            </button>

            <div className="w-[1px] h-6 bg-slate-200 dark:bg-white/10" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 text-primary border border-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Scale className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                  Tarozi <span className="text-primary italic">Terminali</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-primary animate-pulse" : "bg-destructive")} />
                  <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{isConnected ? 'ONLAYN' : 'OFFLINE'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-6 px-6 border-x border-slate-100 dark:border-white/5">
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">BUGUN</p>
                <p className="text-sm font-black text-slate-900 dark:text-white font-mono leading-none">{stats.todayCount} TOY</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">VAZN</p>
                <p className="text-sm font-black text-slate-900 dark:text-white font-mono leading-none">{(stats.todayWeight / 1000).toFixed(2)} TN</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => connect()}
                className={cn(
                  "h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  isConnected ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                )}
              >
                <RefreshCw size={10} className={cn(!isConnected && "animate-spin")} />
                SYNC
              </button>
              <button onClick={() => connectLocalSerial()} className={cn("h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", isSerialConnected ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500")}>USB</button>
              <button onClick={toggleFullscreen} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-primary transition-all">
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button onClick={() => setShowSettings(!showSettings)} className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all", showSettings ? "bg-slate-900 dark:bg-white text-white dark:text-black" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500")}>
                <Settings size={14} className={cn(showSettings && "rotate-90")} />
              </button>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-primary transition-all"
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-[#0a120b] border-b dark:border-white/10 p-4 animate-in slide-in-from-top-2 shadow-2xl">
            <div className="max-w-2xl mx-auto flex items-center gap-4">
              <div className="flex-1">
                <Input value={wsUrl} onChange={(e) => setWsUrl(e.target.value)} className="h-9 font-mono text-xs font-bold bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 dark:text-white" />
              </div>
              <Button size="sm" onClick={() => setShowSettings(false)}>Yopish</Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Terminal Dashboard */}
      <main className="flex-1 p-3 flex flex-col min-h-0 relative overflow-hidden">
        <div className="flex-1 grid grid-cols-12 gap-3 min-h-0 relative z-10">
          {/* Left Column: Industrial Control Units */}
          <div className="col-span-12 xl:col-span-4 flex flex-col gap-3 min-h-0 shrink-0">
            <ScaleDisplay weight={currentReading?.weight || 0} isStable={currentReading?.isStable || false} isConnected={isConnected} />
            <ToyForm
              currentWeight={currentReading?.weight || 0}
              isStable={currentReading?.isStable || false}
              isConnected={isConnected}
              isSerialConnected={isSerialConnected}
              hardwareConnectedCount={hardwareConnectedCount}
              activeMarkas={activeMarkas}
              onMarkaChange={setSelectedMarkaId}
              className="flex-1 min-h-0"
            />
          </div>

          {/* Right Column: Dynamic Data Matrix */}
          <div className="col-span-12 xl:col-span-8 flex flex-col min-h-0">
            <Card className="flex-1 overflow-hidden flex flex-col bg-white/80 dark:bg-slate-900/60 backdrop-blur-lg border border-white/50 dark:border-white/10 rounded-[2rem] shadow-xl shadow-black/5">
              <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-white/40 dark:border-white/5 bg-white/20 dark:bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 text-primary border border-primary/10 rounded-lg flex items-center justify-center">
                    <History size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Xronologiya</h2>
                    <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Monitoring</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/10 rounded-full">
                  <span className="w-1 h-1 bg-primary rounded-full animate-ping" />
                  <span className="text-[8px] font-black text-primary dark:text-primary/80 uppercase tracking-widest">LIVE</span>
                </div>
              </div>

              <div className="flex-1 min-h-0 p-2 overflow-y-auto scrollbar-none">
                <EnhancedRecentToys selectedMarkaId={selectedMarkaId} />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}