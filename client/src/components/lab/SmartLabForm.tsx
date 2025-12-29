"use client";
import { useState, useEffect, useMemo } from "react";
import { v4 as uuid } from "uuid";
import { useBackendLabStore } from "@/stores/backendLabStore";
import { useBackendToyStore } from "@/stores/backendToyStore";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
import { LabSample, LabGradeUz } from "@/types/lab";
import { Toy } from "@/types/toy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";
import {
  FlaskConical,
  Save,
  Package,
  Search,
  CheckSquare,
  Square,
  Filter,
  Users,
  Target,
  Clock,
  ArrowDown,
  Edit,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

const GRADE_OPTIONS: LabGradeUz[] = ["OLIY", "YAXSHI", "ORTA", "ODDIY", "IFLOS"];

export function SmartLabForm() {
  const { toys, fetchToys } = useBackendToyStore();
  const { markas, fetchMarkas } = useBackendMarkaStore();
  const { samples } = useBackendLabStore();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();

  // Form state
  const [selectedMarkaId, setSelectedMarkaId] = useState("");
  const [selectedToyIds, setSelectedToyIds] = useState<string[]>([]);
  const [moisture, setMoisture] = useState<number | "">(8.5);
  const [trash, setTrash] = useState<number | "">(2.0);
  const [navi, setNavi] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [grade, setGrade] = useState<LabGradeUz>("YAXSHI");
  const [strength, setStrength] = useState<number | "">(28.5);
  const [lengthMm, setLengthMm] = useState<number | "">(28);
  const [micronaire, setMicronaire] = useState<number | "">(4.2);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI state
  const [toySearch, setToySearch] = useState("");

  // Filter toys for selected marka
  const filteredToys = useMemo(() => {
    if (!selectedMarkaId) return [];

    let result = toys.filter(toy =>
      toy.markaId === selectedMarkaId &&
      !toy.sold &&
      !samples.some(s => (s.toyId === toy.id || s.sourceId === toy.id))
    );

    // Search filter
    if (toySearch) {
      const search = toySearch.toLowerCase();
      result = result.filter(toy =>
        toy.orderNo.toString().includes(search) ||
        toy.id.toLowerCase().includes(search)
      );
    }

    return result.sort((a, b) => b.orderNo - a.orderNo);
  }, [toys, selectedMarkaId, toySearch]);

  const availableMarkas = useMemo(() => {
    // Create a Set of toy IDs that already have a lab sample
    const sampledToyIds = new Set(samples.map(s => s.toyId || s.sourceId).filter(Boolean));

    // Identify Marka IDs that have at least one applicable toy (unsold and not sampled)
    const markasWithUnsampledToys = new Set<string>();
    for (const toy of toys) {
      if (!toy.sold && !sampledToyIds.has(toy.id)) {
        markasWithUnsampledToys.add(toy.markaId);
      }
    }

    return markas
      .filter(m => m.status === "ACTIVE" && markasWithUnsampledToys.has(m.id))
      .sort((a, b) => a.number - b.number);
  }, [markas, toys, samples]);

  const selectedMarka = markas.find(m => m.id === selectedMarkaId);

  const handleToyToggle = (toyId: string) => {
    setSelectedToyIds(prev =>
      prev.includes(toyId)
        ? prev.filter(id => id !== toyId)
        : [...prev, toyId]
    );
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedToyIds.length === filteredToys.length) {
      setSelectedToyIds([]);
    } else {
      setSelectedToyIds(filteredToys.map(toy => toy.id));
    }
  };

  useEffect(() => {
    fetchMarkas({ status: "ACTIVE" });
  }, [fetchMarkas]);

  useEffect(() => {
    if (selectedMarkaId) {
      fetchToys({ markaId: selectedMarkaId });
      setSelectedToyIds([]);
    }
  }, [selectedMarkaId, fetchToys]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!selectedMarkaId || selectedToyIds.length === 0) {
        setError("Marka va kamida bitta toy tanlang");
        return;
      }

      const sampleData = {
        toyIds: selectedToyIds,
        moisture: Number(moisture),
        trash: Number(trash),
        navi: Number(navi) as any,
        grade,
        strength: Number(strength),
        lengthMm: Number(lengthMm),
        micronaire: Number(micronaire),
        operatorName: user?.fullName || user?.username || "LAB-EXPERT",
        comment: comment.trim() || undefined,
      };

      await useBackendLabStore.getState().bulkCreateSamples(sampleData);

      // Reset
      setSelectedToyIds([]);
      setComment("");
    } catch (err: any) {
      console.error("Lab sample creation error:", err);
      setError(err.message || "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="relative overflow-hidden rounded-3xl bg-white/85 dark:bg-slate-900/60 dark:backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl shadow-primary/5 flex flex-col h-full min-h-[900px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Navbahor Brand Header - Glassmorphism */}
      <div className="relative p-6 lg:p-8 border-b border-slate-100 dark:border-white/5 bg-white/40 dark:bg-black/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none opacity-50" />

        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center transition-all hover:scale-105">
              <FlaskConical size={28} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-none uppercase">
                Yangi <span className="text-primary italic">Tahlil</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Labaratoriya Protokoli Entry</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-500 mb-0.5">Tahlilchi</p>
              <div className="flex items-center gap-3 justify-end">
                <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{user?.username || "LAB-EXPERT"}</p>
                <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center border border-primary/20 dark:border-primary/40">
                  <Users size={16} strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 lg:p-10 bg-[#f0fdf4]/30 dark:bg-black/10">
        <form id="smart-lab-form" onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-12">
          {/* Section 01: Marka Selection Engine */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
            <div className="xl:col-span-4 space-y-4 lg:sticky lg:top-0">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 flex items-center justify-center bg-primary/10 text-primary rounded-2xl text-lg font-bold shadow-sm border border-primary/5">01</div>
                <div>
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 leading-none mb-1.5">Hazirlik Bosqichi</h3>
                  <p className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">Marka Tanlash</p>
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-tighter border-l-2 border-primary/20 pl-4 py-1">
                Tahlil jarayonini boshlash uchun texnologik marka kodini tanlang.
              </p>
            </div>

            <div className="xl:col-span-8 space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none z-10">
                  <Filter size={18} className="text-primary" strokeWidth={2} />
                </div>
                <select
                  value={selectedMarkaId}
                  onChange={(e) => setSelectedMarkaId(e.target.value)}
                  className="w-full h-12 pl-12 pr-10 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm uppercase tracking-tight focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none outline-none shadow-sm"
                >
                  <option value="" className="dark:bg-[#111912]">-- MARKA REESTRINI TANLANG --</option>
                  {availableMarkas.map((m) => (
                    <option key={m.id} value={m.id} className="dark:bg-[#111912]">
                      Marka #{m.number} — {m.ptm}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-center pointer-events-none text-slate-400">
                  <ArrowDown size={16} strokeWidth={2} />
                </div>
              </div>

              {selectedMarka && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="relative bg-white/85 dark:bg-white/5 dark:backdrop-blur-md border border-white/60 dark:border-white/10 shadow-lg shadow-primary/5 rounded-2xl p-5 flex items-center gap-5 overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Target size={48} strokeWidth={1} className="text-primary" />
                    </div>
                    <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0 transition-all hover:scale-105">
                      <Target size={22} strokeWidth={2} />
                    </div>
                    <div className="relative space-y-0.5">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">Tanlangan Batch</p>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight uppercase">
                        #{selectedMarka.number} <span className="text-slate-300 dark:text-slate-700 mx-2">•</span> {selectedMarka.ptm}
                      </h4>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-white/5" />

          {/* Section 02: Toy Architecture Grid */}
          {selectedMarkaId && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start animate-in zoom-in-95 duration-700">
              <div className="xl:col-span-4 space-y-4 lg:sticky lg:top-0">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 flex items-center justify-center bg-primary/10 text-primary rounded-2xl text-lg font-bold shadow-sm border border-primary/5">02</div>
                  <div>
                    <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 leading-none mb-1.5">Birliklar Tanlovi</h3>
                    <p className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">Toylar Reestri</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-3xl p-5 space-y-4 shadow-xl shadow-slate-200/50 dark:shadow-none">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">Aniqlangan</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white font-mono tracking-tighter tabular-nums leading-none">{filteredToys.length}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-50 dark:border-white/5 pt-4">
                      <p className="text-[9px] uppercase font-bold tracking-widest text-primary">Tanlangan</p>
                      <p className="text-lg font-bold text-primary dark:text-emerald-400 font-mono tracking-tighter tabular-nums leading-none">{selectedToyIds.length}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSelectAll}
                    className="w-full h-11 rounded-xl border border-primary/10 dark:border-white/10 font-bold text-[9px] uppercase tracking-[0.2em] bg-primary/5 dark:bg-white/5 text-primary dark:text-white hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm"
                  >
                    {selectedToyIds.length === filteredToys.length ? "Bekor Qilish" : "Barchasini Tanlash"}
                  </Button>
                </div>
              </div>

              <div className="xl:col-span-8 flex flex-col gap-6">
                <div className="relative group">
                  <Input
                    value={toySearch}
                    onChange={(e) => setToySearch(e.target.value)}
                    className="h-12 pl-12 rounded-xl bg-white dark:bg-black/40 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm shadow-sm focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 placeholder:normal-case placeholder:font-medium"
                    placeholder="Toy kodini qidiring..."
                  />
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" strokeWidth={2.5} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-none">
                  {filteredToys.map((toy) => {
                    const isSelected = selectedToyIds.includes(toy.id);
                    return (
                      <button
                        key={toy.id}
                        type="button"
                        onClick={() => handleToyToggle(toy.id)}
                        className={cn(
                          "group relative h-20 flex flex-col items-center justify-center rounded-xl transition-all border duration-300 active:scale-95",
                          isSelected
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105 z-10"
                            : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 text-slate-900 dark:text-white hover:border-primary/40 dark:hover:border-primary/40 hover:bg-primary/[0.02] dark:hover:bg-white/10"
                        )}
                      >
                        <span className={cn("text-lg font-bold font-mono tracking-tighter leading-none mb-0.5", isSelected ? "" : "group-hover:text-primary dark:group-hover:text-white")}>
                          #{toy.orderNo}
                        </span>
                        <span className={cn("text-[8px] font-bold uppercase tracking-widest opacity-60", isSelected ? "text-white/70" : "text-slate-400 dark:text-slate-500")}>
                          {Number(toy.netto).toFixed(1)} <span className="lowercase">kg</span>
                        </span>
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-900 rounded-full border border-white flex items-center justify-center shadow-lg animate-in zoom-in-75">
                            <CheckSquare size={10} className="text-white" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Section 03: Metric Calibration Engine */}
          {selectedToyIds.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start animate-in slide-in-from-bottom-8 duration-500">
              <div className="xl:col-span-4 space-y-4 lg:sticky lg:top-0">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 flex items-center justify-center bg-primary/10 text-primary rounded-2xl text-lg font-bold shadow-sm border border-primary/5">03</div>
                  <div>
                    <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 leading-none mb-1.5">Tahlil Parametrlari</h3>
                    <p className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">O'lchovlar</p>
                  </div>
                </div>
                <div className="relative p-5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                    O'lchov asboblaridan olingan aniq ko'rsatkichlarni kiriting.
                  </p>
                </div>
              </div>

              <div className="xl:col-span-8 space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { id: "moisture", label: "Namlik (%)", value: moisture, setter: setMoisture, icon: Clock, color: "text-blue-500" },
                    { id: "trash", label: "Ifloslik (%)", value: trash, setter: setTrash, icon: FlaskConical, color: "text-rose-500" },
                    { id: "micronaire", label: "Mikroneyr", value: micronaire, setter: setMicronaire, icon: Target, color: "text-amber-500" },
                    { id: "strength", label: "Pishiqlik", value: strength, setter: setStrength, icon: Target, color: "text-emerald-500" },
                    { id: "length", label: "Uzunlik (MM)", value: lengthMm, setter: setLengthMm, icon: Package, color: "text-primary" }
                  ].map((input) => (
                    <div key={input.id} className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 underline decoration-primary/20 underline-offset-4 ml-1 flex items-center gap-2 mb-3">
                        <input.icon size={12} className={input.color} strokeWidth={2.5} />
                        {input.label}
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={input.value}
                        onChange={(e) => input.setter(e.target.value ? Number(e.target.value) : "")}
                        className="h-12 py-3 px-4 rounded-xl font-mono font-bold text-sm bg-white dark:bg-black/40 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white focus:ring-8 focus:ring-primary/5 transition-all shadow-sm"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1">Nav Tanlovi (1-5)</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setNavi(n as any)}
                          className={cn(
                            "flex-1 h-12 rounded-xl text-lg font-bold transition-all border outline-none active:scale-90",
                            navi === n
                              ? "bg-primary text-white border-primary shadow-lg shadow-primary/30"
                              : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:border-primary/40 dark:hover:border-primary/40"
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1">Sinf (Grade)</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {GRADE_OPTIONS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGrade(g)}
                          className={cn(
                            "h-12 rounded-xl text-[9px] font-bold tracking-widest transition-all uppercase border outline-none active:scale-95",
                            grade === g
                              ? "bg-slate-900 dark:bg-white dark:text-black text-white border-slate-900 dark:border-white shadow-xl"
                              : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-white/20"
                          )}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                    <Edit size={12} className="text-primary" strokeWidth={2} />
                    Labaratoriya Izohi
                  </Label>
                  <div className="relative group">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full min-h-[100px] py-3 px-4 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 font-medium text-sm text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none shadow-sm outline-none"
                      placeholder="Qo'shimcha tahlil ma'lumotlari..."
                    />
                    <div className="absolute bottom-3 right-4 flex items-center gap-2 text-slate-200 group-focus-within:text-primary/20 transition-colors">
                      <span className="text-[8px] font-bold uppercase tracking-[0.2em]">LOG ENTRY</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-8 bg-rose-500/10 border-2 border-rose-500/20 rounded-[2rem] flex items-center justify-center gap-4 animate-shake shadow-lg">
              <AlertTriangle className="h-6 w-6 text-rose-500" />
              <div className="text-left">
                <p className="text-rose-500 text-lg font-black uppercase tracking-tight">XATOLIK</p>
                <p className="text-[12px] font-bold text-rose-400 uppercase tracking-widest">{error}</p>
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="flex-shrink-0 p-6 lg:p-8 border-t border-slate-100 dark:border-white/5 bg-white/40 dark:bg-black/20">
        <Button
          form="smart-lab-form"
          type="submit"
          disabled={selectedToyIds.length === 0 || isSubmitting}
          className="relative w-full h-14 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/30 transition-all hover:bg-[#047857] hover:translate-y-[-2px] active:scale-95 disabled:opacity-20 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-3">
              <RefreshCw className="h-4 w-4 animate-spin" />
              SAQLANMOQDA...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <Save size={18} strokeWidth={2} />
              {selectedToyIds.length > 0 ? (
                <span className="flex items-center gap-3">
                  TANLANGAN {selectedToyIds.length} TA TOYNI SAQLASH
                </span>
              ) : "TAHLILNI SAQLASH"}
            </div>
          )}
        </Button>
      </div>
    </Card>
  );
}
