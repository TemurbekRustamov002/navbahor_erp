"use client";
import { useState, useMemo, useEffect } from "react";
import { formatWeight, safeNumber, safeToFixed } from '@/lib/utils/number';
import { useWarehouseBackendStore } from '@/stores/warehouseBackendStore';
import { useBackendLabStore } from "@/stores/backendLabStore";
import { useBackendToyStore } from "@/stores/backendToyStore";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import {
  Package,
  Search,
  CheckCircle2,
  Plus,
  Scale,
  Star,
  Filter,
  Eye
} from "lucide-react";

export function ToysByBrands() {
  const { selectedCustomer, setCurrentStep, currentOrder, addItemsToOrder, createChecklist, readyToys, fetchReadyToys } = useWarehouseBackendStore();
  const { samples } = useBackendLabStore();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedToys, setSelectedToys] = useState<string[]>([]);
  const [brandFilters, setBrandFilters] = useState<Record<string, string>>({});

  // Sinhronlash: agar orderda toylar bo'lsa, ularni tanlangan deb belgilaymiz
  useEffect(() => {
    if (currentOrder?.items?.length && selectedToys.length === 0) {
      setSelectedToys(currentOrder.items.map(i => i.toyId));
    }
  }, [currentOrder]);

  // Use readyToys from warehouse backend store
  const approvedToys = readyToys.flatMap(group => group.toys);

  const toysByBrands = useMemo(() => {
    return readyToys
      .filter(group => group.marka && group.toys && group.toys.length > 0)
      .map(group => ({
        key: `${group.marka?.number || 'unknown'}-${group.marka?.productType || 'unknown'}`,
        marka: group.marka,
        grade: group.toys[0]?.labResult?.grade || "N/A",
        toys: group.toys,
        totalWeight: group.toys.reduce((sum: number, toy: any) => sum + (safeNumber(toy.netto)), 0),
        avgWeight: group.toys.length > 0 ? group.toys.reduce((sum: number, toy: any) => sum + (safeNumber(toy.netto)), 0) / group.toys.length : 0
      }));
  }, [readyToys]);

  const filteredBrands = toysByBrands.filter(brand => {
    const markaNumber = brand.marka?.number?.toString() || '';
    const markaProductType = brand.marka?.productType?.toLowerCase() || '';
    const markaPtm = brand.marka?.ptm?.toLowerCase() || '';
    const searchLower = search.toLowerCase();

    const matchesSearch = markaNumber.includes(search) ||
      markaProductType.includes(searchLower) ||
      markaPtm.includes(searchLower);

    const matchesGrade = selectedGrade === "all" || brand.grade === selectedGrade;

    return matchesSearch && matchesGrade;
  });

  const handleToySelect = (toyId: string, isSelected: boolean) => {
    setSelectedToys(prev =>
      isSelected
        ? [...prev, toyId]
        : prev.filter(id => id !== toyId)
    );
  };

  const handleBrandSelectAll = (brandToys: any[], select: boolean) => {
    const toyIds = brandToys.map(toy => toy.id);
    setSelectedToys(prev =>
      select
        ? [...prev.filter(id => !toyIds.includes(id)), ...toyIds]
        : prev.filter(id => !toyIds.includes(id))
    );
  };

  const handleCreateChecklist = async () => {
    if (selectedToys.length === 0) {
      toast.error("Kamida bitta toy tanlang");
      return;
    }

    if (!selectedCustomer || !currentOrder) {
      toast.error("Mijoz yoki order tanlanmagan");
      return;
    }

    try {
      await addItemsToOrder(currentOrder.id, selectedToys);
      toast.success(`${selectedToys.length} ta toy order'ga qo'shildi`);

      await createChecklist(currentOrder.id);
      toast.success("Checklist yaratildi");

      setSelectedToys([]);
      setCurrentStep("checklist");
    } catch (error: any) {
      toast.error(error.message || "Xatolik yuz berdi");
    }
  };

  const getGradeStyles = (grade: string) => {
    switch (grade) {
      case "OLIY": return "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20";
      case "YAXSHI": return "bg-blue-500 text-white shadow-lg shadow-blue-500/20";
      case "ORTA": return "bg-amber-500 text-white shadow-lg shadow-amber-500/20";
      case "IFLOS": return "bg-red-500 text-white shadow-lg shadow-red-500/20";
      default: return "bg-slate-500 text-white shadow-lg shadow-slate-500/20";
    }
  };

  const selectedToysCount = selectedToys.length;
  const selectedToysWeight = selectedToys.reduce((sum, toyId) => {
    const toy = approvedToys.find(t => t.id === toyId);
    return sum + (safeNumber(toy?.netto) || 0);
  }, 0);

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Navbahor Premium Header - Glassmorphism */}
      <div className="flex-shrink-0 border-b border-slate-100 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-md p-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20">
                <Package size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Mavjud <span className="text-primary italic">Toylar</span></h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{selectedCustomer?.name} uchun tasdiqlangan toylar ro&apos;yxati</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-4">
            <div className="relative group min-w-[320px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" strokeWidth={2.5} />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Marka raqami yoki turi..."
                className="pl-12 h-12 rounded-xl bg-white/50 dark:bg-slate-900/50 border-slate-100 dark:border-white/10 focus:bg-white dark:focus:bg-slate-900 focus:border-primary/20 transition-all font-bold text-[11px] uppercase tracking-wider placeholder:normal-case shadow-inner dark:text-white"
              />
            </div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="h-12 px-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest focus:border-primary/20 outline-none transition-all shadow-sm"
            >
              <option value="all">Barcha Sinflar</option>
              <option value="OLIY">Oliy Sifat</option>
              <option value="YAXSHI">Yaxshi Sifat</option>
              <option value="ORTA">O&apos;rta Sifat</option>
              <option value="IFLOS">Iflos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-10 scrollbar-none bg-slate-50/30 dark:bg-black/20">
        <div className="max-w-7xl mx-auto space-y-10">
          {filteredBrands.map((brand) => {
            const brandFilter = brandFilters[brand.key] || 'all';
            const displayToys = brand.toys.filter(t => brandFilter === 'all' || t.labResult?.grade === brandFilter);

            const brandToyIds = displayToys.map(toy => toy.id);
            const selectedFromBrand = brandToyIds.filter(id => selectedToys.includes(id)).length;
            const allBrandSelected = displayToys.length > 0 && selectedFromBrand === displayToys.length;

            return (
              <div key={brand.key} className="relative animate-in fade-in duration-700">
                <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-black/20 hover:shadow-slate-300/50 transition-all duration-500">
                  {/* Brand Card Header */}
                  <div className="p-8 border-b border-slate-50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 dark:bg-white/5">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 shadow-md border border-slate-50 dark:border-white/5 flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" strokeWidth={2.5} />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-4">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase leading-none">MK #{brand.marka.number}</h3>
                          <div className={cn("px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest leading-none shadow-sm", getGradeStyles(brand.grade))}>
                            {brand.grade}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            {brand.marka.productType}
                          </div>
                          <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            <span className="text-primary">{brand.toys.length}</span> TOY / {formatWeight(brand.totalWeight, 'kg', 1)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 leading-none">Tanlangan</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter leading-none">
                          {selectedFromBrand.toString().padStart(2, '0')}<span className="text-slate-200 dark:text-slate-700 mx-1">/</span>{brand.toys.length.toString().padStart(2, '0')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={brandFilters[brand.key] || 'all'}
                          onChange={(e) => setBrandFilters(prev => ({ ...prev, [brand.key]: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                          className="h-10 px-3 pr-8 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider focus:border-primary/20 outline-none transition-all cursor-pointer hover:bg-white dark:hover:bg-white/5"
                        >
                          <option value="all">Barcha Siflarlar</option>
                          <option value="OLIY">Oliy</option>
                          <option value="YAXSHI">Yaxshi</option>
                          <option value="ORTA">O&apos;rta</option>
                          <option value="IFLOS">Iflos</option>
                        </select>
                        <Button
                          variant={allBrandSelected ? "default" : "outline"}
                          onClick={() => handleBrandSelectAll(displayToys, !allBrandSelected)}
                          className={cn(
                            "h-10 px-6 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all duration-300",
                            allBrandSelected
                              ? "bg-slate-900 dark:bg-white dark:text-slate-900 text-white shadow-lg"
                              : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-primary/20"
                          )}
                        >
                          {allBrandSelected ? <CheckCircle2 className="h-4 w-4 mr-2" strokeWidth={3} /> : <Plus className="h-4 w-4 mr-2" strokeWidth={3} />}
                          {allBrandSelected ? "Tanlandi" : "Barchasi"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Toys Grid - Soft UI Items */}
                  <div className="p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 bg-slate-50/30 dark:bg-black/20">
                    {displayToys.map((toy) => {
                      const isSelected = selectedToys.includes(toy.id);
                      return (
                        <div
                          key={toy.id}
                          onClick={() => handleToySelect(toy.id, !isSelected)}
                          className={cn(
                            "relative group/toy p-5 rounded-[1.5rem] border transition-all duration-300 cursor-pointer overflow-hidden",
                            isSelected
                              ? "bg-primary border-primary shadow-xl shadow-primary/20 scale-[1.05]"
                              : "bg-white dark:bg-slate-900 border-slate-50 dark:border-white/5 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1"
                          )}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <span className={cn("text-lg font-bold font-mono tracking-tighter leading-none", isSelected ? "text-white" : "text-slate-900 dark:text-white")}>
                              #{toy.orderNo}
                            </span>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-primary shadow-lg animate-in zoom-in">
                                <CheckCircle2 size={12} strokeWidth={4} />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className={cn("text-[8px] font-bold uppercase tracking-[0.2em]", isSelected ? "text-white/50" : "text-slate-400 dark:text-slate-500")}>Netto</div>
                            <div className={cn("text-base font-bold font-mono leading-none tracking-tight text-nowrap", isSelected ? "text-white" : "text-slate-900 dark:text-white group-hover/toy:text-primary")}>
                              {formatWeight(toy.netto, 'kg', 1)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredBrands.length === 0 && (
            <div className="py-24 text-center bg-white dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 rounded-[3rem] shadow-inner">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900/40 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Package size={32} className="text-slate-200 dark:text-slate-700" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none uppercase">Toylar Topilmadi</h3>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-3 mb-10 max-w-xs mx-auto">Hech qanday tasdiqlangan toy topilmadi</p>
              <Button onClick={() => { setSearch(""); setSelectedGrade("all") }} variant="outline" className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-[9px] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10">
                Filtrni Tozalash
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Navbahor Floating Action Bar */}
      {selectedToysCount > 0 && (
        <div className="fixed bottom-12 left-1/2 lg:left-[calc(50%+160px)] -translate-x-1/2 w-full max-w-3xl px-8 animate-in slide-in-from-bottom-8 duration-700 z-50">
          <div className="bg-slate-900/95 dark:bg-black/90 backdrop-blur-xl p-4 pl-10 rounded-[2rem] shadow-2xl flex items-center justify-between gap-10 border border-white/10">
            <div className="flex items-center gap-10">
              <div className="flex flex-col">
                <p className="text-[9px] font-bold text-primary uppercase tracking-[0.3em] mb-1.5 leading-none">Tanlandi</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-2xl font-bold text-white font-mono leading-none">{selectedToysCount.toString().padStart(2, '0')}</p>
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest leading-none">TA TOY</span>
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col">
                <p className="text-[9px] font-bold text-primary uppercase tracking-[0.3em] mb-1.5 leading-none">Vazni</p>
                <p className="text-2xl font-bold text-white font-mono leading-none">{formatWeight(selectedToysWeight, 'kg', 1)}</p>
              </div>
            </div>
            <Button
              onClick={handleCreateChecklist}
              size="lg"
              className="h-14 px-10 rounded-2xl bg-primary hover:bg-[#047857] text-white font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 active:scale-95 transition-all"
            >
              <CheckCircle2 className="h-4 w-4 mr-3" strokeWidth={3} />
              Checklist Yaratish
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
