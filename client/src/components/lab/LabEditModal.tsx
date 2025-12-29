"use client";
import { useState, useEffect, useCallback } from "react";
import { useBackendLabStore } from "@/stores/backendLabStore";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { useBackendToyStore } from "@/stores/backendToyStore";
import { LabSample, LabGradeUz } from "@/types/lab";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { FlaskConical, Save, X, Package } from "lucide-react";

const GRADE_OPTIONS: LabGradeUz[] = ["OLIY", "YAXSHI", "ORTA", "ODDIY", "IFLOS"];

interface LabEditModalProps {
  sample: LabSample | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LabEditModal({ sample, isOpen, onClose }: LabEditModalProps) {
  const { updateSample } = useBackendLabStore();
  const { markas } = useBackendMarkaStore();
  const { toys } = useBackendToyStore();

  // Form state
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

  // Load sample data when modal opens
  useEffect(() => {
    if (sample && isOpen) {
      setMoisture(sample.moisture);
      setTrash(sample.trash);
      setNavi(sample.navi);
      setGrade(sample.grade);
      setStrength(sample.strength);
      setLengthMm(sample.lengthMm);
      setMicronaire(sample.micronaire || 4.2);
      setComment(sample.comment || "");
      setError("");
    }
  }, [sample, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sample) return;

    setIsSubmitting(true);
    try {
      // Validation
      if (moisture === "" || trash === "" || strength === "" || lengthMm === "") {
        setError("Barcha raqamli maydonlarni to'ldiring");
        return;
      }

      // Update sample
      const updates = {
        moisture: Number(moisture),
        trash: Number(trash),
        navi,
        grade,
        strength: Number(strength),
        lengthMm: Number(lengthMm),
        micronaire: Number(micronaire),
        comment: comment.trim() || undefined,
      };

      const toyId = sample.toyId || sample.sourceId || "";
      await updateSample(toyId, updates);
      onClose();
    } catch (err: any) {
      console.error("Error updating lab sample:", err);
      setError(err.message || "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !sample) return null;

  const toyId = sample.toyId || sample.sourceId;
  const toy = toys.find(t => t.id === toyId);
  const markaId = sample.markaId || toy?.markaId;
  const marka = markas.find(m => m.id === markaId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal */}
      <div className="relative bg-white/85 dark:bg-slate-900/95 backdrop-blur-md w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/60 dark:border-white/10 animate-in fade-in zoom-in-95 duration-300">
        {/* Navbahor Modal Header */}
        <div className="relative flex items-center justify-between p-8 lg:p-10 border-b border-slate-100 dark:border-white/5 bg-white/40 dark:bg-black/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          <div className="relative flex items-center gap-5">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-primary/20">
              <FlaskConical size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase leading-none">Tahlilni <span className="text-primary italic">Tahrirlash</span></h2>
              <div className="flex items-center gap-3 mt-2.5">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100/50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                    MK #{marka?.number || "---"}
                  </span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                <span className="text-[10px] font-bold text-primary dark:text-emerald-400 uppercase tracking-[0.2em] font-mono leading-none">
                  TOY #{toy?.orderNo || "—"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-all active:scale-95 shadow-sm"
            disabled={isSubmitting}
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Form Body - Soft UI */}
        <div className="p-8 lg:p-10 overflow-y-auto max-h-[70vh] bg-slate-50/10 dark:bg-black/10">
          <form id="edit-lab-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Namlik", value: moisture, setter: setMoisture, unit: "%" },
                { label: "Ifloslik", value: trash, setter: setTrash, unit: "%" },
                { label: "Mikroneyr", value: micronaire, setter: setMicronaire, unit: "" },
                { label: "Pishiqlik", value: strength, setter: setStrength, unit: "" },
                { label: "Uzunlik", value: lengthMm, setter: setLengthMm, unit: "MM" }
              ].map((inp, i) => (
                <div key={i} className="space-y-2.5">
                  <Label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 underline decoration-primary/10 underline-offset-4">{inp.label}</Label>
                  <div className="relative group">
                    <Input
                      type="number"
                      step="0.1"
                      value={inp.value}
                      onChange={(e) => inp.setter(e.target.value ? Number(e.target.value) : "")}
                      className="h-12 py-3 px-4 text-sm font-bold font-mono rounded-xl bg-white dark:bg-black/40 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white focus:ring-8 focus:ring-primary/5 transition-all shadow-sm"
                    />
                    {inp.unit && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-200 uppercase tracking-widest">{inp.unit}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3.5">
              <Label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nav Tanlovi (1-5)</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNavi(n as 1 | 2 | 3 | 4 | 5)}
                    className={cn(
                      "flex-1 h-12 rounded-xl text-lg font-bold transition-all border outline-none active:scale-90",
                      navi === n
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                        : "bg-white dark:bg-white/5 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-white/5 hover:border-primary/20 dark:hover:border-primary/40 hover:text-primary transition-all shadow-sm"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3.5">
              <Label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Sinf (Grade)</Label>
              <div className="grid grid-cols-5 gap-2">
                {GRADE_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    className={cn(
                      "h-12 rounded-xl text-[8.5px] font-bold tracking-[0.1em] transition-all uppercase border outline-none active:scale-95",
                      grade === g
                        ? "bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-xl"
                        : "bg-white dark:bg-white/5 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 shadow-sm transition-all"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tahlilchi Izohi</Label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full min-h-[100px] py-4 px-5 text-sm font-medium bg-white dark:bg-black/40 border border-slate-100 dark:border-white/10 rounded-2xl dark:text-white focus:ring-8 focus:ring-primary/5 focus:outline-none transition-all resize-none shadow-sm placeholder:text-slate-200 dark:placeholder:text-slate-700"
                placeholder="Marshrut yoki maxsus ko'rsatmalar..."
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/10 rounded-2xl text-rose-500 text-[10px] font-bold uppercase tracking-widest text-center animate-in shake duration-500">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Navbahor Modal Footer */}
        <div className="flex items-center gap-3 p-6 lg:p-8 border-t border-slate-100 dark:border-white/5 bg-white/40 dark:bg-black/20">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95 transition-all"
          >
            Bekor Qilish
          </Button>
          <Button
            form="edit-lab-form"
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] h-12 rounded-xl bg-primary hover:bg-[#047857] text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/30 transition-all active:scale-95"
          >
            {isSubmitting ? "Saqlanmoqda..." : "O'zgarishlarni Saqlash"}
          </Button>
        </div>
      </div>
    </div>
  );
}
