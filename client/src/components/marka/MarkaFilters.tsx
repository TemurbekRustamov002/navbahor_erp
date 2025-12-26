"use client";

import { useUIStore } from "@/stores/uiStore";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search, Calendar, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const PRODUCT_TYPES = [
  { value: "TOLA", label: "Tola" },
  { value: "LINT", label: "Lint" },
  { value: "SIKLON", label: "Siklon" },
  { value: "ULUK", label: "Uluk" }
];

const STATUSES = [
  { value: "all", label: "Barchasi" },
  { value: "ACTIVE", label: "Faol" },
  { value: "PAUSED", label: "Pauza" },
  { value: "CLOSED", label: "Yopiq" }
];

export function MarkaFilters() {
  const { markaFilter, setMarkaFilter } = useUIStore();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Search and Status Selection */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-2">
          <Label className="text-[10px] font-bold text-foreground uppercase tracking-widest ml-1">Qidiruv</Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} strokeWidth={2} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              value={markaFilter.search}
              onChange={(e) => setMarkaFilter({ search: e.target.value })}
              placeholder="Marka raqami yoki PTM bo'yicha..."
              className="pl-11 py-3 px-4 h-12 bg-white/80 border-border rounded-xl focus:ring-primary/20 transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-foreground uppercase tracking-widest ml-1">Holat</Label>
          <div className="flex p-1 bg-secondary rounded-xl border border-border shadow-inner">
            {STATUSES.map(status => (
              <button
                key={status.value}
                onClick={() => setMarkaFilter({ status: status.value as any })}
                className={cn(
                  "px-6 h-10 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                  markaFilter.status === status.value
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:text-primary hover:bg-white/50"
                )}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Filters Housing */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2 p-1 bg-secondary rounded-xl border border-border">
          {PRODUCT_TYPES.map(type => {
            const isActive = markaFilter.productTypes.includes(type.value as any);
            return (
              <button
                key={type.value}
                onClick={() => {
                  const newTypes = isActive
                    ? markaFilter.productTypes.filter(t => t !== type.value)
                    : [...markaFilter.productTypes, type.value as any];
                  setMarkaFilter({ productTypes: newTypes });
                }}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                  isActive
                    ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {type.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 flex items-center justify-end gap-4">
          <div className="flex items-center gap-3 px-4 h-12 bg-white/80 rounded-xl border border-border group-focus-within:border-primary transition-all">
            <Calendar size={16} strokeWidth={2} className="text-muted-foreground" />
            <input
              type="date"
              value={markaFilter.dateFrom || ""}
              onChange={(e) => setMarkaFilter({ dateFrom: e.target.value })}
              className="bg-transparent text-xs font-mono text-foreground focus:outline-none cursor-pointer"
            />
            <span className="text-border">|</span>
            <input
              type="date"
              value={markaFilter.dateTo || ""}
              onChange={(e) => setMarkaFilter({ dateTo: e.target.value })}
              className="bg-transparent text-xs font-mono text-foreground focus:outline-none cursor-pointer"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setMarkaFilter({
              search: "",
              productTypes: [],
              status: "all",
              sex: "all",
              showOnScale: "all"
            })}
            className="h-12 px-6 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5 text-xs font-bold uppercase tracking-widest active:scale-95 transition-all"
          >
            Filtrni tozalash
          </Button>
        </div>
      </div>
    </div>
  );
}