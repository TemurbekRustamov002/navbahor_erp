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
import { Plus, ChevronDown, CheckCircle, AlertCircle, Loader2, Settings, Tag, FlaskConical, Target, Zap } from "lucide-react";

const PTM_OPTIONS = ["Asosiy PTM", "Qo'shimcha PTM", "PTM-3", "Boshqa"];
const COTTON_SELECTIONS = [
  "S-6524", "Bukhara-102", "Namangan-77", "Andijan-36", "C-4727",
  "Surxon-14", "Namangan-34", "Bukhara-6", "Samarkand-86",
  "Tashkent-1", "Fergana-15", "Kashkadarya-4", "Navoi-2020"
];

interface MarkaFormProps {
  onSuccess?: () => void;
}

export function MarkaForm({ onSuccess }: MarkaFormProps) {
  const { createMarka } = useBackendMarkaStore();
  const { user } = useAuthStore();

  const [productType, setProductType] = useState<ProductType>("TOLA");
  const [sex, setSex] = useState<SexType>("VALIKLI");
  const [ptm, setPtm] = useState("");
  const [ptmOther, setPtmOther] = useState("");
  const [selection, setSelection] = useState("");
  const [showSelectionDropdown, setShowSelectionDropdown] = useState(false);
  const [pickingType, setPickingType] = useState<"qol" | "mashina">("mashina");
  const [number, setNumber] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAdmin = user?.role === "ADMIN";

  function validateMarkaNumber(num: number, type: ProductType, sexType?: SexType): string | null {
    if (type === "TOLA") {
      if (!sexType) return "TOLA uchun sex tanlanishi shart";
      if (sexType === "ARRALI" && (num < 1 || num > 200)) return "Arrali sex uchun raqam 1-200 oraliqda bo'lishi kerak";
      if (sexType === "VALIKLI" && (num < 201 || num > 400)) return "Valikli sex uchun raqam 201-400 oraliqda bo'lishi kerak";
    }
    if (num < 1 || num > 9999) return "Marka raqami 1-9999 oraliqda bo'lishi kerak";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalPTM = ptm === "Boshqa" ? ptmOther : ptm;
    setError("");
    setSuccess("");

    if (!number) return setError("Marka raqami majburiy");
    if (!finalPTM.trim()) return setError("PTM qiymati majburiy");
    if (!selection.trim()) return setError("Seleksiya navi majburiy");
    if (productType === "TOLA" && !sex) return setError("TOLA uchun sex majburiy");

    const numberError = validateMarkaNumber(Number(number), productType, sex);
    if (numberError) return setError(numberError);

    setLoading(true);
    try {
      await createMarka({
        number: Number(number),
        productType,
        sex: productType === "TOLA" ? sex : undefined,
        selection,
        ptm: finalPTM,
        pickingType,
      });

      setSuccess(`✅ ${number}-marka muvaffaqiyatli yaratildi!`);
      setNumber("");
      setPtm("");
      setPtmOther("");
      setSelection("");
      setShowSelectionDropdown(false);
      onSuccess?.();
    } catch (error: any) {
      setError(error.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-lg border border-white/50 rounded-[2.5rem] shadow-xl shadow-black/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-10 border-b border-white/40 bg-white/20 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/10 transition-transform hover:scale-110 duration-500">
            <Tag size={24} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Parametrik Registratsiya</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Yangi Markani Tizimga Kiritish</p>
          </div>
        </div>
        <Target size={30} strokeWidth={1} className="text-primary/10" />
      </div>

      <CardContent className="p-10">
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* Main Attributes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Product Type Matrix */}
            <div className="space-y-4">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Mahsulot Turi</Label>
              <div className="grid grid-cols-2 gap-3">
                {(['TOLA', 'LINT', 'SIKLON', 'ULUK'] as ProductType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setProductType(type)}
                    className={cn(
                      "h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all active:scale-95",
                      productType === type
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                        : "bg-slate-50/50 border-transparent text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Sex Selector (Only for TOLA) */}
            {productType === 'TOLA' && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Ishlab Chiqarish Bo'limi</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(['ARRALI', 'VALIKLI'] as SexType[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSex(s)}
                      className={cn(
                        "h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all active:scale-95",
                        sex === s
                          ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20"
                          : "bg-slate-50/50 border-transparent text-slate-500 hover:bg-slate-100"
                      )}
                    >
                      {s === 'ARRALI' ? 'Arrali Sex' : 'Valikli Sex'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-full h-[1px] bg-slate-100" />

          {/* Technical Data Entry */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Marka Raqami</Label>
              <div className="relative group">
                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} strokeWidth={2} />
                <Input
                  type="number"
                  placeholder="Masalan: 201"
                  value={number}
                  onChange={(e) => setNumber(e.target.value ? Number(e.target.value) : "")}
                  className="h-14 pl-12 bg-slate-50 border-none rounded-xl font-mono text-base font-bold text-slate-900 focus:ring-4 focus:ring-primary/5 transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">PTM Konfiguratsiyasi</Label>
              <div className="relative group">
                <FlaskConical className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} strokeWidth={2} />
                <select
                  value={ptm}
                  onChange={(e) => setPtm(e.target.value)}
                  className="w-full h-14 pl-12 pr-10 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-900 appearance-none focus:ring-4 focus:ring-primary/5 transition-all"
                >
                  <option value="">PTM Tanlang</option>
                  {PTM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
              {ptm === "Boshqa" && (
                <Input
                  placeholder="PTM nomini kiriting"
                  value={ptmOther}
                  onChange={(e) => setPtmOther(e.target.value)}
                  className="h-12 bg-white border-slate-200 rounded-xl text-xs font-bold animate-in slide-in-from-top-2"
                />
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Seleksiya Navi</Label>
              <div className="relative group">
                <Settings className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} strokeWidth={2} />
                <select
                  value={selection}
                  onChange={(e) => setSelection(e.target.value)}
                  className="w-full h-14 pl-12 pr-10 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-900 appearance-none focus:ring-4 focus:ring-primary/5 transition-all"
                >
                  <option value="">Seleksiya Tanlang</option>
                  {COTTON_SELECTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>
          </div>

          {/* Feedback & Submission Console */}
          <div className="space-y-6 pt-6">
            {(error || success) && (
              <div className={cn(
                "p-5 rounded-2xl flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-300 border",
                error ? "bg-destructive/5 border-destructive/10 text-destructive" : "bg-emerald-50 border-emerald-100 text-emerald-600"
              )}>
                {error ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                <p className="text-[11px] font-bold uppercase tracking-widest">{error || success}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-16 rounded-[1.2rem] bg-primary text-white font-bold uppercase tracking-[0.3em] text-xs shadow-xl shadow-primary/20 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-4"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Tizimga Saqlanmoqda...</span>
                </>
              ) : (
                <>
                  <Plus size={20} strokeWidth={2.5} />
                  <span>Markani Tasdiqlash va Yaratish</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}