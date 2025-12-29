"use client";
import { useUIStore } from "@/stores/uiStore";
import { useBackendLabStore } from "@/stores/backendLabStore";
import { useLanguageStore } from "@/stores/languageStore";
import { ProductType } from "@/types/marka";
import { LabStatus } from "@/types/lab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";
import { Filter, X } from "lucide-react";

export function LabFilters() {
  const { labFilter, setLabFilter, resetLabFilter } = useUIStore();
  const { samples } = useBackendLabStore();
  const { t } = useLanguageStore();

  const productTypes: ProductType[] = ["TOLA", "LINT", "SIKLON", "ULUK"];
  const statuses: LabStatus[] = ["PENDING", "APPROVED", "REJECTED"];

  // Get unique analysts
  const analysts = Array.from(new Set(
    samples.map(s => s.analyst).filter(Boolean)
  )) as string[];

  const handleProductTypeToggle = (type: ProductType) => {
    const current = labFilter.productTypes;
    const newTypes = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    setLabFilter({ productTypes: newTypes });
  };

  return (
    <Card className="border-none shadow-xl rounded-[2rem] bg-white/40 dark:bg-slate-900/60 dark:backdrop-blur-xl overflow-hidden">
      <CardHeader className="border-b border-white/20 dark:border-white/5 bg-white/20 dark:bg-black/20">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground dark:text-white">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-sm font-black uppercase tracking-tight">Filtrlar</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetLabFilter}
            className="h-8 w-8 p-0 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-600 transition-all"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-[10px] font-black text-muted-foreground/50 dark:text-slate-500 uppercase tracking-widest ml-1">Qidirish</Label>
          <Input
            id="search"
            placeholder="Marka, izoh yoki ID..."
            value={labFilter.search}
            onChange={(e) => setLabFilter({ search: e.target.value })}
            className="h-10 rounded-xl bg-white/50 dark:bg-black/40 border-white/50 dark:border-white/10 dark:text-white dark:placeholder:text-slate-700"
          />
        </div>

        {/* Product Types */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/50 dark:text-slate-500 uppercase tracking-widest ml-1">Mahsulot turlari</Label>
          <div className="grid grid-cols-2 gap-2">
            {productTypes.map((type) => (
              <Button
                key={type}
                variant={labFilter.productTypes.includes(type) ? "default" : "outline"}
                size="sm"
                onClick={() => handleProductTypeToggle(type)}
                className={cn(
                  "capitalize h-9 rounded-xl font-bold transition-all",
                  labFilter.productTypes.includes(type)
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-white/50 dark:bg-white/5 border-white/50 dark:border-white/10 text-slate-600 dark:text-slate-400"
                )}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/50 dark:text-slate-500 uppercase tracking-widest ml-1">Holati</Label>
          <div className="space-y-2">
            {[
              { id: "all", label: "Barchasi" },
              { id: "pending", label: "Kutilmoqda" },
              { id: "approved", label: "Tasdiqlangan" },
              { id: "rejected", label: "Rad etilgan" }
            ].map((s) => (
              <Button
                key={s.id}
                variant={labFilter.status === s.id ? "default" : "outline"}
                size="sm"
                onClick={() => setLabFilter({ status: s.id as any })}
                className={cn(
                  "w-full justify-start h-9 px-4 rounded-xl font-bold transition-all",
                  labFilter.status === s.id
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-white/50 dark:bg-white/5 border-white/50 dark:border-white/10 text-slate-600 dark:text-slate-400"
                )}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Sales Visibility */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/50 dark:text-slate-500 uppercase tracking-widest ml-1">Sotuvga ko'rinishi</Label>
          <div className="space-y-2">
            {[
              { value: "all", label: "Barchasi" },
              { value: "only", label: "Faqat ko'rinadigan" },
              { value: "hidden", label: "Faqat yashirin" },
            ].map(({ value, label }) => (
              <Button
                key={value}
                variant={labFilter.showToSales === value ? "default" : "outline"}
                size="sm"
                onClick={() => setLabFilter({ showToSales: value as any })}
                className={cn(
                  "w-full justify-start h-9 px-4 rounded-xl font-bold transition-all",
                  labFilter.showToSales === value
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-white/50 dark:bg-white/5 border-white/50 dark:border-white/10 text-slate-600 dark:text-slate-400"
                )}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Analyst Filter */}
        {analysts.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="analyst" className="text-[10px] font-black text-muted-foreground/50 dark:text-slate-500 uppercase tracking-widest ml-1">Tahlilchi</Label>
            <select
              id="analyst"
              value={labFilter.analyst || ""}
              onChange={(e) => setLabFilter({ analyst: e.target.value || undefined })}
              className="flex h-10 w-full rounded-xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-black/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 dark:text-white transition-all appearance-none cursor-pointer"
            >
              <option value="" className="dark:bg-[#111912]">Barcha tahlilchilar</option>
              {analysts.map((analyst) => (
                <option key={analyst} value={analyst} className="dark:bg-[#111912]">
                  {analyst}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-muted-foreground/50 dark:text-slate-500 uppercase tracking-widest ml-1">Sana oralig'i</Label>
          <div className="space-y-2">
            <Input
              type="date"
              value={labFilter.dateFrom || ""}
              onChange={(e) => setLabFilter({ dateFrom: e.target.value || undefined })}
              className="h-10 rounded-xl bg-white/50 dark:bg-black/40 border-white/50 dark:border-white/10 dark:text-white"
            />
            <Input
              type="date"
              value={labFilter.dateTo || ""}
              onChange={(e) => setLabFilter({ dateTo: e.target.value || undefined })}
              className="h-10 rounded-xl bg-white/50 dark:bg-black/40 border-white/50 dark:border-white/10 dark:text-white"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}