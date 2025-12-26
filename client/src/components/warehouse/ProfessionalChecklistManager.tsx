"use client";
import { useState, useEffect } from "react";
import { useChecklistStore } from "@/stores/checklistStore";
import { useBackendLabStore } from "@/stores/backendLabStore";
import { useBackendToyStore } from "@/stores/backendToyStore";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { useAuthStore } from "@/stores/authStore";
import { useAdminStore } from "@/stores/adminStore";
import { useWarehouseStore } from "@/stores/warehouseStore";
import { Checklist, ToySelectionCriteria } from "@/types/checklist";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  Plus,
  Trash2,
  Check,
  Lock,
  Download,
  Edit,
  AlertTriangle,
  Package,
  Users,
  Weight,
  Star,
  Filter,
  Search,
  Eye,
  ShoppingCart
} from "lucide-react";

interface ProfessionalChecklistManagerProps {
  workspaceId: string;
  customerId: string;
  customerName: string;
}

interface MarkaSelection {
  markaId: string;
  markaLabel: string;
  grade: string;
  quantity: number;
  maxAvailable: number;
}

export function ProfessionalChecklistManager({
  workspaceId,
  customerId,
  customerName
}: ProfessionalChecklistManagerProps) {
  const {
    currentChecklist,
    createChecklist,
    addToyToChecklist,
    removeToyFromChecklist,
    confirmChecklist,
    lockChecklist,
    requestModification,
    bulkAddToys,
    exportChecklist,
    getAvailableToysForMarka,
    createSelectionCriteria,
    getPermissions,
    setCurrentChecklist
  } = useChecklistStore();

  const { samples } = useBackendLabStore();
  const { toys } = useBackendToyStore();
  const { markas } = useBackendMarkaStore();
  const { user } = useAuthStore();
  const { createModificationRequest } = useAdminStore();
  const { setCurrentStep } = useWarehouseStore();

  const [showToySelector, setShowToySelector] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showModificationModal, setShowModificationModal] = useState(false);
  const [modificationReason, setModificationReason] = useState("");
  const [markaSelections, setMarkaSelections] = useState<MarkaSelection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Toy viewing and filtering
  const [selectedMarkaFilter, setSelectedMarkaFilter] = useState<string>("");
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>("");
  const [showAvailableToys, setShowAvailableToys] = useState(true);
  const [viewMode, setViewMode] = useState<'toys' | 'checklist'>('toys');

  // Initialize checklist if not exists
  useEffect(() => {
    if (!currentChecklist || currentChecklist.customerId !== customerId) {
      const newChecklist = createChecklist(workspaceId, customerId, customerName);
      setCurrentChecklist(newChecklist);
    }
  }, [customerId, workspaceId, customerName]);

  // Get permissions
  const permissions = currentChecklist ? getPermissions(currentChecklist, user?.role || '') : {
    canAddToys: false,
    canConfirm: false,
    canLock: false,
    canRequestModification: false,
    canApproveModification: false,
    canExport: false,
    canDelete: false
  };

  // Get approved samples grouped by marka and grade
  const getMarkaGradeOptions = () => {
    const approvedSamples = samples.filter(s => s.status === "APPROVED");
    const options: { markaId: string; markaLabel: string; grade: string; available: number }[] = [];

    markas.forEach(marka => {
      const markaLabel = `${marka.number} - ${marka.ptm}`;
      const grades = ["Oliy", "Yaxshi", "O'rta"];

      grades.forEach(grade => {
        const available = getAvailableToysForMarka(marka.id, grade, toys, approvedSamples).length;
        if (available > 0) {
          options.push({
            markaId: marka.id,
            markaLabel,
            grade,
            available
          });
        }
      });
    });

    return options;
  };

  // Get filtered toys for display
  const getFilteredToys = () => {
    const approvedSamples = samples.filter(s => s.status === "APPROVED");

    let filteredToys = toys.filter(toy => {
      // Check if toy has approved lab result
      const hasApprovedSample = approvedSamples.some(sample => sample.sourceId === toy.id);
      if (!hasApprovedSample) return false;

      // Show only available toys if filter is on
      if (showAvailableToys && (toy.sold || toy.reserved)) return false;

      // Filter by marka
      if (selectedMarkaFilter && toy.markaId !== selectedMarkaFilter) return false;

      // Filter by grade
      if (selectedGradeFilter) {
        const sample = approvedSamples.find(s => s.sourceId === toy.id);
        if (!sample || sample.grade !== selectedGradeFilter) return false;
      }

      return true;
    });

    // Group by marka
    const groupedToys = filteredToys.reduce((acc, toy) => {
      const marka = markas.find(m => m.id === toy.markaId);
      const sample = approvedSamples.find(s => s.sourceId === toy.id);

      if (!marka || !sample) return acc;

      const markaLabel = `${marka.number} - ${marka.ptm}`;

      if (!acc[markaLabel]) {
        acc[markaLabel] = {
          marka,
          toys: [],
          grades: {} as Record<string, number>
        };
      }

      acc[markaLabel].toys.push({ toy, sample });
      acc[markaLabel].grades[sample.grade] = (acc[markaLabel].grades[sample.grade] || 0) + 1;

      return acc;
    }, {} as Record<string, { marka: any; toys: any[]; grades: Record<string, number> }>);

    return groupedToys;
  };

  // Add single toy to checklist
  const handleAddSingleToy = (toyData: any) => {
    if (!currentChecklist) return;

    const { toy, sample } = toyData;
    const marka = markas.find(m => m.id === toy.markaId);

    if (marka && sample) {
      addToyToChecklist(currentChecklist.id, toy, marka, sample);
    }
  };

  // Remove single toy from checklist
  const handleRemoveSingleToy = (toyId: string) => {
    if (!currentChecklist) return;
    removeToyFromChecklist(currentChecklist.id, toyId);
  };

  // Check if toy is in checklist
  const isToyInChecklist = (toyId: string): boolean => {
    return currentChecklist?.items.some(item => item.toyId === toyId) || false;
  };

  // Add marka selection
  const addMarkaSelection = () => {
    setMarkaSelections(prev => [...prev, {
      markaId: '',
      markaLabel: '',
      grade: '',
      quantity: 1,
      maxAvailable: 0
    }]);
  };

  // Update marka selection
  const updateMarkaSelection = (index: number, field: keyof MarkaSelection, value: string | number) => {
    setMarkaSelections(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Update max available when marka/grade changes
      if (field === 'markaId' || field === 'grade') {
        const marka = markas.find(m => m.id === updated[index].markaId);
        if (marka && updated[index].grade) {
          const approvedSamples = samples.filter(s => s.status === "APPROVED");
          const available = getAvailableToysForMarka(marka.id, updated[index].grade, toys, approvedSamples);
          updated[index].maxAvailable = available.length;
          updated[index].markaLabel = `${marka.number} - ${marka.ptm}`;

          // Adjust quantity if it exceeds available
          if (updated[index].quantity > available.length) {
            updated[index].quantity = available.length;
          }
        }
      }

      return updated;
    });
  };

  // Remove marka selection
  const removeMarkaSelection = (index: number) => {
    setMarkaSelections(prev => prev.filter((_, i) => i !== index));
  };

  // Add selected toys to checklist
  const handleAddToys = () => {
    if (!currentChecklist) return;

    setIsLoading(true);
    try {
      const criteria: ToySelectionCriteria[] = markaSelections
        .filter(sel => sel.markaId && sel.grade && sel.quantity > 0)
        .map(sel => createSelectionCriteria(
          sel.markaId,
          sel.markaLabel,
          sel.grade,
          sel.quantity,
          getAvailableToysForMarka(sel.markaId, sel.grade, toys, samples.filter(s => s.status === "APPROVED"))
        ));

      bulkAddToys(currentChecklist.id, criteria, toys, markas, samples);

      // Reset selections
      setMarkaSelections([]);
      setShowToySelector(false);
    } catch (error) {
      console.error("Failed to add toys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm checklist
  const handleConfirm = () => {
    if (!currentChecklist || !user) return;
    confirmChecklist(currentChecklist.id, user.id);
    setShowConfirmModal(false);
    // Go directly to scanning step
    setCurrentStep("scanning");
  };

  // Lock checklist
  const handleLock = () => {
    if (!currentChecklist) return;
    lockChecklist(currentChecklist.id);
  };

  // Request modification
  const handleModificationRequest = () => {
    if (!currentChecklist || !user || !modificationReason.trim()) return;

    // Create admin request
    const checklistSummary = {
      totalToys: currentChecklist.totalItems,
      totalWeight: currentChecklist.totalWeight,
      markasCount: currentChecklist.summary.length,
      averageWeight: currentChecklist.totalItems > 0 ? currentChecklist.totalWeight / currentChecklist.totalItems : 0
    };

    createModificationRequest(
      currentChecklist.id,
      customerName,
      user.username,
      user.role,
      modificationReason,
      checklistSummary
    );

    // Also update checklist status
    requestModification(currentChecklist.id, modificationReason, user.id);
    setShowModificationModal(false);
    setModificationReason("");
  };

  // Export checklist
  const handleExport = async () => {
    if (!currentChecklist) return;

    setIsLoading(true);
    try {
      await exportChecklist(currentChecklist.id);
      // Files are automatically downloaded by the store function
    } catch (error) {
      console.error("Export failed:", error);
      // You could show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentChecklist) {
    return <LoadingSpinner />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'confirmed': return 'bg-primary/10 text-primary border-primary/20';
      case 'locked': return 'bg-secondary text-muted-foreground border-border';
      case 'modification_requested': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-secondary text-muted-foreground border-border';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Tayyorlanmoqda';
      case 'confirmed': return 'Tasdiqlangan';
      case 'locked': return 'Bloklangan';
      case 'modification_requested': return 'O\'zgartirish so\'ralgan';
      default: return status;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Prestigious Industrial Header & Stats */}
      <div className="relative overflow-hidden rounded-[3rem] glass-panel border border-border shadow-2xl p-10 lg:p-14">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-30" />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-12">
          <div className="flex items-center gap-10">
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center shadow-xl shadow-primary/20 ring-4 ring-background transition-transform hover:scale-105 duration-500 relative">
                <ShoppingCart className="h-10 w-10 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <h2 className="text-4xl lg:text-5xl font-black text-foreground uppercase tracking-tighter leading-none">
                  Checklist <span className="text-primary italic">Plani</span>
                </h2>
                <span className={cn(
                  "px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm backdrop-blur-md",
                  getStatusColor(currentChecklist.status)
                )}>
                  {getStatusText(currentChecklist.status)}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <p className="text-[14px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  MIJOZ: <span className="text-foreground">{customerName}</span>
                </p>
                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                <p className="font-mono-premium italic opacity-50">
                  ID: #{currentChecklist.id.substring(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* High-Fidelity Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 xl:gap-10">
            <div className="space-y-2">
              <p className="text-label-premium">Jami Toylar</p>
              <p className="text-4xl font-black text-foreground tracking-tighter tabular-nums leading-none">
                {currentChecklist.totalItems} <span className="text-xs font-bold text-muted-foreground/60 lowercase tracking-normal">dona</span>
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-label-premium">Jami Vazn</p>
              <p className="text-4xl font-black text-primary tracking-tighter tabular-nums leading-none">
                {currentChecklist.totalWeight.toFixed(1)} <span className="text-xs font-bold text-primary/60 lowercase tracking-normal">kg</span>
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-label-premium">Markalar</p>
              <p className="text-4xl font-black text-blue-600 tracking-tighter tabular-nums leading-none">
                {currentChecklist.summary.length} <span className="text-xs font-bold text-blue-600/60 lowercase tracking-normal">ta</span>
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-label-premium">Sifatlar</p>
              <p className="text-4xl font-black text-primary tracking-tighter tabular-nums leading-none">
                {currentChecklist.summary.reduce((acc, s) => acc + Object.keys(s.grades).length, 0)} <span className="text-xs font-bold text-primary/60 lowercase tracking-normal">tur</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Industrial Toolbar - Senior Polish */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-6">
        <div className="flex items-center gap-3 bg-secondary/80 p-2 rounded-[1.75rem] border border-border backdrop-blur-xl">
          <Button
            variant={viewMode === 'toys' ? 'secondary' : 'ghost'}
            onClick={() => setViewMode('toys')}
            className={cn(
              "h-14 px-8 rounded-2xl transition-all font-black text-[12px] uppercase tracking-widest gap-3",
              viewMode === 'toys' ? "bg-background text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye className="h-4 w-4" />
            Ombor Zahirasi
          </Button>
          <Button
            variant={viewMode === 'checklist' ? 'secondary' : 'ghost'}
            onClick={() => setViewMode('checklist')}
            className={cn(
              "h-14 px-8 rounded-2xl transition-all font-black text-[12px] uppercase tracking-widest gap-3",
              viewMode === 'checklist' ? "bg-background text-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ShoppingCart className="h-4 w-4" />
            Checklist ({currentChecklist.totalItems})
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {permissions.canAddToys && (
            <Button
              onClick={() => setShowToySelector(true)}
              className="h-16 px-10 rounded-2xl bg-primary text-white hover:bg-green-700 transition-all font-black text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95 border-none"
            >
              <Plus className="h-5 w-5" />
              Yangi Toy Qo&apos;shish
            </Button>
          )}

          <div className="flex items-center gap-3 bg-secondary p-2 rounded-2xl border border-border">
            {permissions.canExport && (
              <Button
                onClick={handleExport}
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-xl text-muted-foreground hover:bg-background hover:text-foreground transition-all"
                disabled={isLoading}
              >
                <Download className="h-5 w-5" />
              </Button>
            )}

            {permissions.canRequestModification && (
              <Button
                onClick={() => setShowModificationModal(true)}
                variant="ghost"
                className="h-12 px-6 rounded-xl text-muted-foreground hover:bg-amber-500 hover:text-white transition-all font-black text-[11px] uppercase tracking-widest"
              >
                O&apos;zgartirish So&apos;rash
              </Button>
            )}
          </div>

          {permissions.canConfirm && (
            <Button
              onClick={() => setShowConfirmModal(true)}
              disabled={currentChecklist.totalItems === 0}
              className="h-14 lg:h-16 px-6 lg:px-10 rounded-2xl bg-foreground text-background hover:bg-black dark:text-foreground transition-all font-black text-[10px] lg:text-[12px] uppercase tracking-[0.2em] shadow-xl active:scale-95 flex items-center gap-3 border-none whitespace-nowrap"
            >
              <Check className="h-4 w-4 lg:h-5 lg:w-5" />
              Checklistni Tasdiqlash
            </Button>
          )}

          {currentChecklist.status === 'confirmed' && (
            <Button
              onClick={handleExport}
              className="h-14 lg:h-16 px-6 lg:px-10 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all font-black text-[10px] lg:text-[12px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center gap-3 border-none whitespace-nowrap"
              disabled={isLoading}
            >
              <Download className="h-4 w-4 lg:h-5 lg:w-5" />
              Yuklab Olish
            </Button>
          )}

          {permissions.canLock && (
            <Button
              onClick={handleLock}
              className="h-16 px-8 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all font-black text-[12px] uppercase tracking-[0.2em] border border-destructive/20 shadow-xl shadow-destructive/5 group"
            >
              <Lock className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
              Qulflash
            </Button>
          )}
        </div>
      </div>

      {/* Industry Summary Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-4">
        {currentChecklist.summary.length > 0 && (
          <div className="space-y-8">
            <h4 className="flex items-center gap-3 text-label-premium">
              <Filter className="h-4 w-4 text-primary" />
              MARKALAR BO&apos;YICHA XULOSA
            </h4>
            <div className="grid gap-6">
              {currentChecklist.summary.map((summary) => (
                <div key={summary.markaId} className="group relative glass-card rounded-[2.5rem] p-8 border-none shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />

                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center shadow-inner ring-1 ring-border">
                        <span className="text-primary font-black text-xl italic tabular-nums">M</span>
                      </div>
                      <div>
                        <h5 className="text-xl font-black text-foreground uppercase tracking-tight">{summary.markaLabel}</h5>
                        <p className="font-mono-premium text-[10px] opacity-40 mt-0.5">MARKA KOD: {summary.markaId.substring(0, 6).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-primary tracking-tighter tabular-nums">{summary.totalWeight.toFixed(2)} <span className="text-[11px] font-bold text-muted-foreground lowercase">kg</span></p>
                      <p className="text-label-premium">SOF VAZN</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8 relative z-10">
                    <div className="bg-secondary/50 p-5 rounded-2xl border border-border">
                      <p className="text-label-premium mb-1.5 opacity-50">TOYLAR SONI</p>
                      <p className="text-xl font-black text-foreground tabular-nums">{summary.totalToys} <span className="text-xs font-bold text-muted-foreground">dona</span></p>
                    </div>
                    <div className="bg-secondary/50 p-5 rounded-2xl border border-border">
                      <p className="text-label-premium mb-1.5 opacity-50">O&apos;RTACHA SIFAT</p>
                      <p className="text-xl font-black text-foreground tabular-nums">{summary.averageQuality.toFixed(1)} <span className="text-xs font-bold text-muted-foreground">Pnt</span></p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 relative z-10">
                    {Object.entries(summary.grades).map(([grade, count]) => (
                      <div key={grade} className="flex items-center gap-3 px-4 py-2 bg-primary/5 rounded-xl border border-primary/20 transition-all hover:bg-primary/10">
                        <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(11,174,74,0.5)]" />
                        <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                          {grade}: <span className="text-primary tabular-nums">{count}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Items Monitor - Senior Fidelity */}
        <div className="space-y-8">
          <h4 className="flex items-center gap-3 text-label-premium">
            <Package className="h-4 w-4 text-primary" />
            TANLANGAN TOYLAR MONITORINGI
          </h4>
          <div className="glass-card rounded-[2.5rem] border-none shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
            {currentChecklist.items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-10">
                <div className="w-24 h-24 bg-secondary rounded-[2rem] flex items-center justify-center mb-8 animate-pulse">
                  <Package className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-black text-muted-foreground/30 uppercase tracking-[0.25em] mb-4">Checklist Bo&apos;sh</h3>
                <p className="text-label-premium max-w-xs mx-auto text-center">
                  Operatsiyani boshlash uchun zahiradagi toylarni checklistga yuklang
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-4 max-h-[700px] overflow-y-auto scrollbar-premium">
                {currentChecklist.items.map((item, index) => (
                  <div key={item.id} className="group flex items-center justify-between p-6 bg-secondary/50 rounded-[1.75rem] border border-border transition-all hover:bg-background hover:shadow-xl hover:shadow-slate-900/5 hover:-translate-x-1">
                    <div className="flex items-center gap-6">
                      <span className="w-12 h-12 flex items-center justify-center text-[12px] font-black text-muted-foreground font-mono bg-background rounded-xl shadow-inner border border-border">
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <p className="text-label-premium opacity-50">MARKA:</p>
                          <p className="text-[15px] font-black text-foreground uppercase tracking-tight">{item.markaLabel}</p>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Weight className="h-3 w-3 text-primary" /> {item.weight}kg</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="flex items-center gap-1.5 text-blue-600"><Star className="h-3 w-3" /> {item.grade}</span>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className="font-mono-premium opacity-50">ID: {item.toyId.substring(0, 8)}</span>
                        </div>
                      </div>
                    </div>

                    {permissions.canAddToys && (
                      <Button
                        onClick={() => removeToyFromChecklist(currentChecklist.id, item.toyId)}
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-xl text-muted-foreground/30 hover:bg-destructive/10 hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {currentChecklist.items.length > 0 && (
              <div className="p-8 border-t border-border bg-secondary/30">
                <div className="flex items-center justify-between">
                  <p className="text-label-premium">UMUMIY MONITORING ELEMENTLARI</p>
                  <p className="text-[14px] font-black text-foreground uppercase tabular-nums">{currentChecklist.totalItems} TA POZITSIYA</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toy Selector Modal - Senior Industrial Polish */}
      <Modal
        isOpen={showToySelector}
        onClose={() => setShowToySelector(false)}
        title="YANGI TOYLARNI INTEGRATSIYA QILISH"
      >
        <div className="space-y-8 p-4 lg:p-6">
          <div className="flex items-center gap-4 p-5 bg-secondary rounded-[1.5rem] border border-border">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <p className="text-label-premium opacity-70">
              Kerakli markalar bo&apos;yicha toylarni tanlang. Har bir pozitsiya uchun miqdor belgilang.
            </p>
          </div>

          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-premium">
            {markaSelections.map((selection, index) => (
              <div key={index} className="group relative bg-secondary/50 rounded-[2rem] p-8 border border-border transition-all hover:bg-background hover:shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <label className="block text-label-premium mb-3 opacity-50">Marka Klasifikatsiyasi</label>
                    <select
                      value={selection.markaId}
                      onChange={(e) => updateMarkaSelection(index, 'markaId', e.target.value)}
                      className="w-full h-14 px-6 bg-background rounded-2xl border border-border focus:ring-4 focus:ring-primary/10 transition-all font-black text-[13px] uppercase"
                    >
                      <option value="">Markani tanlang...</option>
                      {markas.map(marka => (
                        <option key={marka.id} value={marka.id}>
                          {marka.number} - {marka.ptm}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-premium mb-3 opacity-50">Sifat Kategoriyasi</label>
                    <select
                      value={selection.grade}
                      onChange={(e) => updateMarkaSelection(index, 'grade', e.target.value)}
                      className="w-full h-14 px-6 bg-background rounded-2xl border border-border focus:ring-4 focus:ring-primary/10 transition-all font-black text-[13px] uppercase"
                      disabled={!selection.markaId}
                    >
                      <option value="">Sifatni tanlang...</option>
                      <option value="Oliy">Oliy (Premium)</option>
                      <option value="Yaxshi">Yaxshi (Standart)</option>
                      <option value="O'rta">O&apos;rta (Bazaviy)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                  <div className="relative">
                    <label className="block text-label-premium mb-3 opacity-50">
                      Toy Miqdori <span className="text-primary italic">(Mavjud: {selection.maxAvailable})</span>
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max={selection.maxAvailable}
                      value={selection.quantity}
                      onChange={(e) => updateMarkaSelection(index, 'quantity', parseInt(e.target.value) || 0)}
                      disabled={selection.maxAvailable === 0}
                      className="h-14 pl-6 pr-12 rounded-2xl bg-background border-border font-black text-sm tabular-nums"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => removeMarkaSelection(index)}
                      variant="ghost"
                      className="h-14 px-8 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all font-black text-[11px] uppercase tracking-widest border border-rose-500/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      O&apos;chirish
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <Button
              onClick={addMarkaSelection}
              variant="outline"
              className="w-full h-16 rounded-[1.75rem] border-dashed border-2 border-border hover:border-primary hover:text-primary transition-all font-black text-[12px] uppercase tracking-[0.3em] gap-3"
            >
              <Plus className="h-5 w-5" />
              YANGI POZITSIYA QO&apos;SHISH
            </Button>
          </div>

          <div className="flex gap-4 pt-6 border-t border-border">
            <Button
              onClick={() => setShowToySelector(false)}
              variant="ghost"
              className="h-14 px-8 rounded-2xl text-muted-foreground font-black text-[11px] uppercase tracking-widest"
            >
              Bekor Qilish
            </Button>
            <Button
              onClick={handleAddToys}
              disabled={markaSelections.length === 0 || isLoading}
              className="flex-1 h-16 rounded-2xl bg-foreground text-background transition-all font-black text-[12px] uppercase tracking-[0.25em] shadow-2xl active:scale-95 border-none"
            >
              {isLoading ? <LoadingSpinner /> : 'TOYLARNI YUKLASH'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal - Senior Industrial Polish */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="CHECKLISTNI TASDIQLASH VA YAKUNLASH"
      >
        <div className="space-y-8 p-4 lg:p-6 bg-background">
          <div className="relative overflow-hidden bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-8">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full" />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-500 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-[13px] font-black text-amber-500 uppercase tracking-widest">DIQQAT: STRATEGIK OPERATSIYA!</p>
                <p className="text-[12px] font-bold text-muted-foreground leading-relaxed italic">
                  Tasdiqlangandan so&apos;ng checklistga yangi toylar qo&apos;shib bo&apos;lmaydi.
                  Ortga qaytish uchun tizim administratori ruxsati talab etiladi.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-border">
            <div className="p-6 bg-foreground rounded-[2rem] shadow-2xl">
              <p className="text-label-premium text-primary/50 mb-4 opacity-70">LOGISTIKA HUDUDIDAGI HOLAT</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Jami Toylar:</span>
                  <span className="text-lg font-black text-white tabular-nums">{currentChecklist.totalItems} DONA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Umumiy Sof Vazn:</span>
                  <span className="text-lg font-black text-primary tabular-nums">{currentChecklist.totalWeight.toFixed(2)} KG</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-4">
                  <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Brutto (Taxminiy):</span>
                  <span className="text-lg font-black text-white/60 tabular-nums">{(currentChecklist.totalWeight + currentChecklist.totalItems * 3.5).toFixed(1)} KG</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-secondary rounded-[2rem] border border-border">
              <p className="text-label-premium mb-4 opacity-50">SIFAT VA KLASIFIKATSIYA</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-label-premium opacity-50">Markalar Soni:</span>
                  <span className="text-lg font-black text-foreground tabular-nums">{currentChecklist.summary.length} TA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-label-premium opacity-50">O&apos;rtacha Vazn:</span>
                  <span className="text-lg font-black text-foreground tabular-nums">
                    {currentChecklist.totalItems > 0 ? (currentChecklist.totalWeight / currentChecklist.totalItems).toFixed(1) : 0} KG
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-border pt-4">
                  <span className="text-label-premium opacity-50">Operator Mas&apos;uliyati:</span>
                  <span className="text-[11px] font-black text-foreground uppercase tracking-tight">{user?.username || 'ANONIM'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => setShowConfirmModal(false)}
              variant="ghost"
              className="h-16 px-10 rounded-2xl text-muted-foreground font-black text-[11px] uppercase tracking-widest hover:bg-secondary"
            >
              Tanlashda Davom Etish
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 h-16 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-all font-black text-[13px] uppercase tracking-[0.25em] shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-3 border-none"
            >
              <Check className="h-6 w-6" /> TASDIQLAYMAN
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modification Request Modal - Senior Industrial Polish */}
      <Modal
        isOpen={showModificationModal}
        onClose={() => setShowModificationModal(false)}
        title="STRATEGIK O&apos;ZGARTIRISH SO&apos;ROVI"
      >
        <div className="space-y-8 p-4 lg:p-6 text-center bg-background">
          <div className="w-24 h-24 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
            <Edit className="h-10 w-10 text-rose-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">ADMINISTRATORGA SO&apos;ROV YUBORISH</h3>
            <p className="text-label-premium opacity-70 px-10">
              Bloklangan checklistni o&apos;zgartirish uchun asosli sabab ko&apos;rsatishingiz lozim.
            </p>
          </div>

          <div className="text-left space-y-3">
            <label className="text-label-premium px-2 opacity-50">ASOSLOVCHI SABAB (MANDATORY)</label>
            <textarea
              value={modificationReason}
              onChange={(e) => setModificationReason(e.target.value)}
              placeholder="Masalan: Marka noto'g'ri tanlanganligi sababli..."
              className="w-full h-40 p-6 bg-secondary rounded-[2rem] border border-border focus:ring-8 focus:ring-primary/10 transition-all font-bold text-[14px] resize-none placeholder:text-muted-foreground/30"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={() => setShowModificationModal(false)}
              variant="ghost"
              className="h-14 px-8 rounded-2xl text-muted-foreground font-black text-[11px] uppercase tracking-widest"
            >
              Bekor Qilish
            </Button>
            <Button
              onClick={handleModificationRequest}
              disabled={!modificationReason.trim()}
              className="flex-1 h-16 rounded-2xl bg-rose-500 text-white transition-all font-black text-[13px] uppercase tracking-[0.2em] shadow-xl shadow-rose-500/20 active:scale-95 border-none"
            >
              SO&apos;ROVNI YUBORISH
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}