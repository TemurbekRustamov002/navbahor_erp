"use client";
import { useState } from "react";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { useAuthStore } from "@/stores/authStore";
import { ProductType, SexType } from "@/types/marka";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";
import { Plus, ChevronDown, CheckCircle, AlertCircle, Loader2, Tag, FlaskConical, Target, Zap, Settings, ArrowRight } from "lucide-react";

const PTM_OPTIONS = ["Asosiy PTM", "Qo'shimcha PTM", "PTM-3", "Boshqa"];
const COTTON_SELECTIONS = [
  "S-6524", "Bukhara-102", "Namangan-77", "Andijan-36", "C-4727",
  "Surxon-14", "Namangan-34", "Bukhara-6", "Samarkand-86",
  "Tashkent-1", "Fergana-15", "Kashkadarya-4", "Navoi-2020"
];

export function MarkaForm({ onSuccess }: { onSuccess?: () => void }) {
  const { createMarka } = useBackendMarkaStore();
  const { user } = useAuthStore();

  const [productType, setProductType] = useState<ProductType>("TOLA");
  const [sex, setSex] = useState<SexType>("VALIKLI");
  const [ptm, setPtm] = useState("");
  const [ptmOther, setPtmOther] = useState("");
  const [selection, setSelection] = useState("");
  const [number, setNumber] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalPTM = ptm === "Boshqa" ? ptmOther : ptm;
    setError(""); setSuccess("");
    if (!number || !finalPTM.trim() || !selection.trim()) return setError("Barcha maydonlarni to'ldiring");

    setLoading(true);
    try {
      await createMarka({
        number: Number(number),
        productType,
        sex: productType === "TOLA" ? sex : undefined,
        selection,
        ptm: finalPTM,
        pickingType: "mashina",
      });
      setSuccess(`${number}-marka tizimga kiritildi`);
      setNumber(""); setPtm(""); setSelection("");
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-white dark:bg-[#111912]/80 dark:backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header - Solid & Clean */}
      <div className="px-8 py-6 border-b border-slate-100 dark:border-white/10 bg-white dark:bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#0bae4a] text-white rounded-xl flex items-center justify-center shadow-md shadow-[#0bae4a]/20">
            <Tag size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">Yangi Marka</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Parametrik Registratsiya</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/10">
          <span className="w-2 h-2 rounded-full bg-[#0bae4a] animate-pulse" />
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tizim Faol</span>
        </div>
      </div>

      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">

          {/* Section 1: Classification (Chips Style) */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Mahsulot Turi</Label>
                <div className="flex flex-wrap gap-2">
                  {(['TOLA', 'LINT', 'SIKLON', 'ULUK'] as ProductType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setProductType(type)}
                      className={cn(
                        "flex-1 md:flex-none px-4 h-10 rounded-lg text-xs font-bold transition-all border",
                        productType === type
                          ? "bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white shadow-md"
                          : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {productType === 'TOLA' && (
                <div className="space-y-2.5 animate-in fade-in slide-in-from-left-2 duration-300">
                  <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Ishlab Chiqarish Turi</Label>
                  <div className="flex gap-2">
                    {(['ARRALI', 'VALIKLI'] as SexType[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSex(s)}
                        className={cn(
                          "flex-1 h-10 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-2",
                          sex === s
                            ? "bg-[#0bae4a] text-white border-[#0bae4a] shadow-md shadow-[#0bae4a]/20"
                            : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20"
                        )}
                      >
                        {s === 'ARRALI' ? 'Arrali' : 'Valikli'}
                        {sex === s && <CheckCircle size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-white/10 w-full" />

          {/* Section 2: Data Entry (High Contrast Inputs) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">Marka Raqami</Label>
              <div className="relative group">
                <Zap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0bae4a] transition-colors" size={18} />
                <Input
                  type="number"
                  placeholder="---"
                  value={number}
                  onChange={(e) => setNumber(e.target.value ? Number(e.target.value) : "")}
                  className="h-12 pl-10 bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-black/60 focus:border-[#0bae4a] focus:ring-1 focus:ring-[#0bae4a] transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">PTM Konfiguratsiyasi</Label>
              <div className="relative group">
                <FlaskConical className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0bae4a] transition-colors" size={18} />
                <select
                  value={ptm}
                  onChange={(e) => setPtm(e.target.value)}
                  className="w-full h-12 pl-10 pr-10 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-bold rounded-xl appearance-none focus:bg-white dark:focus:bg-black/60 focus:border-[#0bae4a] focus:ring-1 focus:ring-[#0bae4a] outline-none transition-all cursor-pointer"
                >
                  <option value="" className="dark:bg-[#111912]">Tanlanmagan</option>
                  {PTM_OPTIONS.map(opt => <option key={opt} value={opt} className="dark:bg-[#111912]">{opt}</option>)}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
              {ptm === "Boshqa" && (
                <Input
                  placeholder="Nomini kiriting..."
                  value={ptmOther}
                  onChange={(e) => setPtmOther(e.target.value)}
                  className="mt-2 h-10 bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white animate-in slide-in-from-top-1"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">Seleksiya Navi</Label>
              <div className="relative group">
                <Settings className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0bae4a] transition-colors" size={18} />
                <select
                  value={selection}
                  onChange={(e) => setSelection(e.target.value)}
                  className="w-full h-12 pl-10 pr-10 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-bold rounded-xl appearance-none focus:bg-white dark:focus:bg-black/60 focus:border-[#0bae4a] focus:ring-1 focus:ring-[#0bae4a] outline-none transition-all cursor-pointer"
                >
                  <option value="" className="dark:bg-[#111912]">Tanlanmagan</option>
                  {COTTON_SELECTIONS.map(opt => <option key={opt} value={opt} className="dark:bg-[#111912]">{opt}</option>)}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          {/* Messages & Actions */}
          <div className="pt-2">
            {(error || success) && (
              <div className={cn(
                "mb-4 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-bottom-1",
                error ? "bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/20" : "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20"
              )}>
                {error ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                <span>{error || success}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#0bae4a] hover:bg-[#09963f] text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-[#0bae4a]/25 dark:shadow-[#0bae4a]/10 active:scale-[0.99] flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin opacity-80" />
                  <span>Jarayonda...</span>
                </>
              ) : (
                <>
                  <Plus size={18} strokeWidth={3} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                  <span>Markani Saqlash</span>
                  <ArrowRight size={18} className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}