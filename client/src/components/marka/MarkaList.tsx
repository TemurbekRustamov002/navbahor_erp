"use client";

import { Marka } from "@/types/marka";
import { MarkaCard } from "./MarkaCard";
import { Package, Search } from "lucide-react";

interface MarkaListProps {
  markas: Marka[];
}

export function MarkaList({ markas: filteredMarkas }: MarkaListProps) {
  if (filteredMarkas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white/20 dark:bg-white/5 backdrop-blur-2xl rounded-[2rem] border-2 border-dashed border-white/40 dark:border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-white/80 dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-black/5 dark:ring-white/10">
            <Package size={40} strokeWidth={2} className="text-primary/30 dark:text-primary/50 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Search size={16} strokeWidth={2} className="text-white" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-1">Ma'lumotlar Topilmadi</h3>
        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] max-w-[280px] text-center leading-relaxed">
          SISTEMA SKANERLASH YAKUNLANDI: QIDIRUV KRITERIYALARI BO'YICHA OBYEKTLAR ANIQLANMADI.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {filteredMarkas.map((marka) => (
        <MarkaCard key={marka.id} marka={marka} />
      ))}
    </div>
  );
}