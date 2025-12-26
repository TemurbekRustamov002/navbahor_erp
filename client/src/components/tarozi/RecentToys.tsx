"use client";
import { useState, useEffect, useMemo } from "react";
import * as React from "react";
import { useBackendToyStore } from "@/stores/backendToyStore";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { cn } from "@/lib/utils";
import { Package, Calendar, User, Scale, Trash2, Clock, Target, History } from "lucide-react";

interface RecentToysProps {
  limit?: number;
  className?: string;
  selectedMarkaId?: string;
}

export function RecentToys({ limit = 10, className, selectedMarkaId }: RecentToysProps) {
  const { toys, deleteToy, fetchToys } = useBackendToyStore();
  const { markas } = useBackendMarkaStore();

  React.useEffect(() => {
    const interval = setInterval(() => {
      fetchToys();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchToys]);

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; toyId: string | null; isLoading: boolean }>({
    isOpen: false,
    toyId: null,
    isLoading: false
  });

  const sortedToys = useMemo(() => {
    let filtered = toys;
    if (selectedMarkaId && selectedMarkaId.trim() !== '') {
      filtered = toys.filter(toy => toy.markaId === selectedMarkaId);
    }
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  }, [toys, selectedMarkaId, limit]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.toyId) return;
    setDeleteModal(prev => ({ ...prev, isLoading: true }));
    try {
      await deleteToy(deleteModal.toyId);
      setDeleteModal({ isOpen: false, toyId: null, isLoading: false });
    } catch (error) {
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  if (sortedToys.length === 0) {
    return (
      <Card className={cn("glass-card border-white/60 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in duration-700", className)}>
        <CardHeader className="p-8 border-b border-white/40 bg-white/20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <History size={20} strokeWidth={2} className="text-primary" />
            </div>
            <CardTitle className="text-base font-bold text-slate-900 uppercase tracking-tight">So'nggi Toylar</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-10 text-center opacity-30">
          <Package className="h-16 w-16 mx-auto mb-4" />
          <p className="text-[10px] font-bold uppercase tracking-widest">Ma'lumot mavjud emas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("glass-card border-white/60 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in duration-700", className)}>
      <CardHeader className="p-8 border-b border-white/40 bg-white/20 flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <History size={20} strokeWidth={2} className="text-primary" />
          </div>
          <CardTitle className="text-base font-bold text-slate-900 uppercase tracking-tight">So'nggi Toylar</CardTitle>
        </div>
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
          {sortedToys.length} Reestr
        </span>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-4">
          {sortedToys.map((toy) => {
            const marka = markas.find(m => m.id === toy.markaId);
            return (
              <div
                key={toy.id}
                className={cn(
                  "group flex items-center justify-between p-5 rounded-2xl border transition-all duration-300",
                  "bg-white border-white/60 hover:bg-primary/[0.02] hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:translate-x-1"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm font-bold text-slate-900">#{toy.orderNo}</span>
                    <span className="w-[1px] h-3 bg-slate-200" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Marka #{marka?.number}</span>
                    <span className={cn(
                      "px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-md",
                      toy.sold ? "bg-slate-100 text-slate-500" : "bg-primary/10 text-primary"
                    )}>
                      {toy.sold ? "Sotilgan" : "Mavjud"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} strokeWidth={2} className="text-primary/60" />
                      <span className="text-[10px] font-bold tabular-nums uppercase tracking-widest">{formatDate(toy.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Target size={12} strokeWidth={2} className="text-primary/60" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{toy.productType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary font-mono tracking-tighter">
                      {toy.netto.toFixed(2)} <span className="text-[10px] text-slate-300 uppercase tracking-widest ml-1">kg</span>
                    </div>
                    <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                      B: {toy.brutto} / T: {toy.tara}
                    </div>
                  </div>

                  {!toy.sold && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteModal({ isOpen: true, toyId: toy.id, isLoading: false })}
                      className="h-9 w-9 rounded-xl bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all active:scale-95"
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {toys.length > limit && (
          <div className="mt-8 pt-6 border-t border-white/40 text-center">
            <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 transition-all">
              Barchasini ko'rish ({toys.length})
            </Button>
          </div>
        )}
      </CardContent>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, toyId: null, isLoading: false })}
        onConfirm={handleDeleteConfirm}
        title="O'chirish"
        message="Ushbu toy ma'lumotlarini o'chirmoqchimisiz?"
        confirmText="O'chirish"
        cancelText="Yo'q"
        type="danger"
        isLoading={deleteModal.isLoading}
      />
    </Card>
  );
}