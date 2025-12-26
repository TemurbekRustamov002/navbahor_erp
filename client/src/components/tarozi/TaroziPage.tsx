"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { useBackendToyStore } from "@/stores/backendToyStore";
import { useLanguageStore } from "@/stores/languageStore";
import { useScaleProfessional } from "@/lib/hooks/useScale";
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
  RefreshCw
} from "lucide-react";

export default function TaroziPage() {
  const router = useRouter();
  const { toys, fetchToys } = useBackendToyStore();
  const { markas, fetchMarkas } = useBackendMarkaStore();

  const [selectedMarkaId, setSelectedMarkaId] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wsUrl, setWsUrl] = useState("ws://localhost:8081/scale");

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
    <div className="h-screen overflow-hidden bg-[#f0fdf4] flex flex-col select-none animate-in fade-in duration-500">
      {/* Premium Industrial Header */}
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-lg border-b border-white/50 shadow-xl shadow-black/5 relative z-50">
        <div className="w-full px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="group flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-all shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 transition-transform group-hover:-translate-x-1">
                <ArrowLeft className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
              </div>
              <span className="hidden sm:inline"></span>
            </button>

            <div className="w-[1px] h-6 bg-slate-200" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 text-primary border border-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Scale className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none uppercase">
                  Tarozi <span className="text-primary italic">Terminali</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-primary animate-pulse" : "bg-destructive")} />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{isConnected ? 'ONLAYN' : 'OFFLINE'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-6 px-6 border-x border-slate-100">
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">BUGUN</p>
                <p className="text-sm font-black text-slate-900 font-mono leading-none">{stats.todayCount} TOY</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">VAZN</p>
                <p className="text-sm font-black text-slate-900 font-mono leading-none">{(stats.todayWeight / 1000).toFixed(2)} TN</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => connect()}
                className={cn(
                  "h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  isConnected ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                )}
              >
                <RefreshCw size={10} className={cn(!isConnected && "animate-spin")} />
                SYNC
              </button>
              <button onClick={() => connectLocalSerial()} className={cn("h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", isSerialConnected ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>USB</button>
              <button onClick={toggleFullscreen} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button onClick={() => setShowSettings(!showSettings)} className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all", showSettings ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400")}>
                <Settings size={14} className={cn(showSettings && "rotate-90")} />
              </button>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="absolute top-full left-0 right-0 z-50 bg-white border-b p-4 animate-in slide-in-from-top-2 shadow-2xl">
            <div className="max-w-2xl mx-auto flex items-center gap-4">
              <div className="flex-1">
                <Input value={wsUrl} onChange={(e) => setWsUrl(e.target.value)} className="h-9 font-mono text-xs font-bold" />
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
              hardwareConnectedCount={hardwareConnectedCount}
              activeMarkas={activeMarkas}
              onMarkaChange={setSelectedMarkaId}
              className="flex-1 min-h-0"
            />
          </div>

          {/* Right Column: Dynamic Data Matrix */}
          <div className="col-span-12 xl:col-span-8 flex flex-col min-h-0">
            <Card className="flex-1 overflow-hidden flex flex-col bg-white/80 backdrop-blur-lg border border-white/50 rounded-[2rem] shadow-xl shadow-black/5">
              <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-white/40 bg-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 text-primary border border-primary/10 rounded-lg flex items-center justify-center">
                    <History size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none">Xronologiya</h2>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Monitoring</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 border border-primary/20 rounded-full">
                  <span className="w-1 h-1 bg-primary rounded-full animate-ping" />
                  <span className="text-[8px] font-black text-primary uppercase tracking-widest">LIVE</span>
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
