"use client";
import { useState, useMemo } from "react";
import { useBackendToyStore } from "@/stores/backendToyStore";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { cn } from "@/lib/utils";
import { printToyLabelVerbose } from "@/lib/utils/print";
import {
  Package,
  Printer,
  Trash2,
  RefreshCw,
  Clock,
  Target,
  FlaskConical,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

interface EnhancedRecentToysProps {
  selectedMarkaId?: string;
}

export function EnhancedRecentToys({ selectedMarkaId }: EnhancedRecentToysProps) {
  const { toys, deleteToy } = useBackendToyStore();
  const { markas } = useBackendMarkaStore();
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [printingToyId, setPrintingToyId] = useState<string | null>(null);

  const sortedToys = useMemo(() => {
    let filteredToys = toys;
    if (selectedMarkaId && selectedMarkaId.trim() !== '') {
      filteredToys = toys.filter(toy => toy.markaId === selectedMarkaId);
    }
    return filteredToys.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [toys, selectedMarkaId]);

  const totalPages = Math.ceil(sortedToys.length / itemsPerPage);
  const paginatedToys = sortedToys.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; toyId: string | null; isLoading: boolean }>({
    isOpen: false,
    toyId: null,
    isLoading: false
  });

  const handleDeleteConfirm = async () => {
    if (!deleteModal.toyId) return;
    setDeleteModal(prev => ({ ...prev, isLoading: true }));
    try {
      await deleteToy(deleteModal.toyId);
      toast.success("Obyekt o'chirildi");
      setDeleteModal({ isOpen: false, toyId: null, isLoading: false });
    } catch (error) {
      toast.error("Xatolik yuz berdi");
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handlePrint = async (toyId: string) => {
    const toy = toys.find(t => t.id === toyId);
    if (!toy) return;
    const marka = markas.find(m => m.id === toy.markaId);

    setPrintingToyId(toyId);
    try {
      const result = await printToyLabelVerbose({
        id: toy.id,
        orderNo: toy.orderNo.toString(),
        markaNumber: marka?.number.toString() || '???',
        productType: toy.productType,
        netto: toy.netto,
        brutto: toy.brutto,
        tara: toy.tara,
        createdAt: toy.createdAt,
        ptm: marka?.ptm,
        selection: marka?.selection
      }, { method: 'browser' });

      if (result.success) toast.success(`Toy #${toy.orderNo} chop etildi`);
    } catch (e) {
      toast.error("Chop etishda xato");
    } finally {
      setPrintingToyId(null);
    }
  };

  if (sortedToys.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-primary/10 mb-6 group transition-all hover:bg-primary/10">
          <Package size={40} strokeWidth={1} className="text-primary/30 group-hover:scale-110 transition-transform" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Xronologiya Bo'sh</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-[240px] text-center italic">
          Hozirda registratsiya qilingan obyeklar aniqlanmadi
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Table-like Dashboard Structure */}
      <div className="flex-1 overflow-y-auto scrollbar-none space-y-2 pr-1">
        {paginatedToys.map((toy) => {
          const marka = markas.find(m => m.id === toy.markaId);
          const isPrinting = printingToyId === toy.id;

          return (
            <div
              key={toy.id}
              className={cn(
                "group relative bg-white/60 backdrop-blur-xl border border-white/40 p-2.5 lg:p-3 rounded-xl transition-all duration-300 flex items-center gap-4",
                "hover:bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:translate-x-1"
              )}
            >
              {/* Vertical Color Indicator */}
              <div className={cn(
                "w-1 h-8 rounded-full shrink-0 shadow-sm transition-all duration-500",
                toy.sold ? "bg-slate-200" : (toy.productType === 'TOLA' ? "bg-primary" : "bg-blue-500")
              )} />

              <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                {/* ID & Marka Info */}
                <div className="col-span-12 lg:col-span-3 flex flex-col items-start gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-slate-900 leading-none">#{toy.orderNo}</span>
                    <span className="text-[8px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase font-mono">M#{marka?.number}</span>
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(toy.createdAt)}</p>
                </div>

                {/* Weight Parameters */}
                <div className="col-span-12 lg:col-span-3 flex items-center gap-6 border-x border-slate-100 px-4">
                  <div className="flex flex-col">
                    <span className="text-base font-black font-mono text-primary tabular-nums tracking-tighter leading-none">{Number(toy.netto).toFixed(2)}</span>
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">NETTO KG</span>
                  </div>
                  <div className="flex flex-col opacity-40">
                    <span className="text-[10px] font-bold font-mono text-slate-600 leading-none">B: {toy.brutto}</span>
                    <span className="text-[10px] font-bold font-mono text-slate-600 leading-none mt-1">T: {toy.tara}</span>
                  </div>
                </div>

                {/* Status & Lab Info */}
                <div className="col-span-12 lg:col-span-4 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                    <Target size={12} strokeWidth={2} className="text-primary/40" />
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight">{toy.productType}</span>
                  </div>
                  {toy.labStatus && (
                    <div className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-lg border animate-in zoom-in-95",
                      toy.labStatus === "APPROVED" ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                        toy.labStatus === "REJECTED" ? "bg-destructive/5 border-destructive/10 text-destructive" :
                          "bg-amber-50 border-amber-100 text-amber-600"
                    )}>
                      {toy.labStatus === "APPROVED" ? <ShieldCheck size={12} strokeWidth={2} /> : <FlaskConical size={12} strokeWidth={2} />}
                      <span className="text-[8px] font-black uppercase tracking-widest">{toy.labStatus}</span>
                    </div>
                  )}
                </div>

                {/* Actions HUD */}
                <div className="col-span-12 lg:col-span-2 flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePrint(toy.id)}
                    disabled={isPrinting}
                    className="h-8 w-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all active:scale-95"
                  >
                    {isPrinting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" strokeWidth={2} /> : <Printer size={16} strokeWidth={2} />}
                  </Button>
                  {!toy.sold && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteModal({ isOpen: true, toyId: toy.id, isLoading: false })}
                      className="h-8 w-8 rounded-lg bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all active:scale-95"
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination HUD Utility */}
      <div className="flex-shrink-0 pt-4 mt-1 border-t border-white/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            <RefreshCw size={12} strokeWidth={2} className="text-slate-400" />
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Jami: {sortedToys.length}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white active:scale-95 transition-all text-slate-600"
          >
            <ChevronLeft size={12} strokeWidth={2} />
          </Button>
          <span className="text-[10px] font-black text-slate-900 bg-white/60 px-3 py-1.5 rounded-lg border border-white/50 tabular-nums">
            {currentPage} <span className="text-slate-300 mx-1">/</span> {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white active:scale-95 transition-all text-slate-600"
          >
            <ChevronRight size={12} strokeWidth={2} />
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(p => ({ ...p, isOpen: false }))}
        onConfirm={handleDeleteConfirm}
        title="O'chirish"
        message="Haqiqatdan ham ushbu toy ma'lumotlarini o'chirmoqchimisiz?"
        confirmText="O'chirish"
        cancelText="Yo'q"
        type="danger"
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
}
