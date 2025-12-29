"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useBackendLabStore } from "@/stores/backendLabStore";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { useBackendToyStore } from "@/stores/backendToyStore";
import { LabStatus } from "@/types/lab";
import { useAuthStore } from "@/stores/authStore";
import { LabSample } from "@/types/lab";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import {
  FlaskConical,
  Search,
  Filter,
  X,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Settings,
  RefreshCw
} from "lucide-react";

interface LabResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSampleEdit?: (sample: LabSample) => void;
}

export function LabResultsModal({ isOpen, onClose, onSampleEdit }: LabResultsModalProps) {
  const { samples, toggleShowToSales, deleteSample, approveSample, rejectSample } = useBackendLabStore();
  const { markas } = useBackendMarkaStore();
  const { toys } = useBackendToyStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  // Modal states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Improved action handlers with error handling and loading states
  const handleToggleShowToSales = useCallback(async (toyId: string) => {
    try {
      setIsLoading(true);
      await toggleShowToSales(toyId);
      toast.success("Savdo ko'rsatish holati o'zgartirildi");
    } catch (error) {
      toast.error("Xatolik yuz berdi", {
        title: "Savdo holati o'zgartirishda muammo",
        action: {
          label: "Qayta urinish",
          onClick: () => handleToggleShowToSales(toyId)
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, [toggleShowToSales, toast]);

  const handleDeleteSample = useCallback(async (toyId: string) => {
    if (!window.confirm("Haqiqatan ham bu tahlilni o'chirmoqchimisiz?")) {
      return;
    }

    try {
      setIsDeleting(toyId);
      await deleteSample(toyId);
      toast.success("Tahlil muvaffaqiyatli o'chirildi");
    } catch (error) {
      toast.error("Tahlilni o'chirishda xatolik yuz berdi", {
        action: {
          label: "Qayta urinish",
          onClick: () => handleDeleteSample(toyId)
        }
      });
    } finally {
      setIsDeleting(null);
    }
  }, [deleteSample, toast]);

  const handleStatusUpdate = useCallback(async (sample: LabSample, status: LabStatus) => {
    try {
      setIsLoading(true);
      if (status === "APPROVED") {
        await approveSample(sample.toyId);
      } else if (status === "REJECTED") {
        const reason = window.prompt("Rad etish sababi:");
        await rejectSample(sample.toyId, reason || undefined);
      }
      toast.success("Holat muvaffaqiyatli yangilandi");
    } catch (error) {
      toast.error("Holatni yangilashda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  }, [approveSample, rejectSample, toast]);

  // Filters
  const [search, setSearch] = useState("");
  const [markaFilter, setMarkaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [gradeFilter, setGradeFilter] = useState("");
  const [analystFilter, setAnalystFilter] = useState("");
  const [showToSalesFilter, setShowToSalesFilter] = useState<"all" | "yes" | "no">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Get unique values for filters
  const uniqueMarkas = Array.from(new Set(samples.map(s => s.markaId)))
    .map(id => markas.find(m => m.id === id))
    .filter(Boolean);

  const uniqueGrades = Array.from(new Set(samples.map(s => s.grade)));
  const uniqueAnalysts = Array.from(new Set(samples.map(s => s.analyst).filter(Boolean)));

  // Check if user is admin
  const isAdmin = user?.role === "ADMIN";

  // Apply filters
  const filteredSamples = useMemo(() => {
    return samples.filter(sample => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const marka = markas.find(m => m.id === sample.markaId);
        const markaLabel = marka ?
          (marka.productType === 'TOLA' ? `${marka.sex} ${marka.number}` : `${marka.productType} ${marka.number}`) : '';

        if (!markaLabel.toLowerCase().includes(searchLower) &&
          !sample.grade.toLowerCase().includes(searchLower) &&
          !sample.analyst?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Marka filter
      if (markaFilter && sample.markaId !== markaFilter) return false;

      // Status filter
      if (statusFilter !== "all" && sample.status !== statusFilter.toUpperCase()) return false;

      // Grade filter
      if (gradeFilter && sample.grade !== gradeFilter) return false;

      // Analyst filter
      if (analystFilter && sample.analyst !== analystFilter) return false;

      // Show to warehouse filter
      if (showToSalesFilter === "yes" && !sample.showToWarehouse) return false;
      if (showToSalesFilter === "no" && sample.showToWarehouse) return false;

      // Date filter
      if (dateFrom && sample.createdAt < dateFrom) return false;
      if (dateTo && sample.createdAt > dateTo) return false;

      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [samples, markas, search, markaFilter, statusFilter, gradeFilter, analystFilter, showToSalesFilter, dateFrom, dateTo]);

  // Paginated samples
  const totalPages = Math.ceil(filteredSamples.length / itemsPerPage);
  const paginatedSamples = filteredSamples.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "APPROVED": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "REJECTED": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING": return "Kutilmoqda";
      case "APPROVED": return "Tasdiqlangan";
      case "REJECTED": return "Rad etilgan";
      default: return status;
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "OLIY": return "text-green-700 dark:text-emerald-400 bg-green-100 dark:bg-emerald-950/30 border-green-200 dark:border-emerald-800/30";
      case "YAXSHI": return "text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/30";
      case "ORTA": return "text-yellow-700 dark:text-amber-400 bg-yellow-100 dark:bg-amber-950/30 border-yellow-200 dark:border-amber-800/30";
      case "ODDIY": return "text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/30";
      case "IFLOS": return "text-red-700 dark:text-rose-400 bg-red-100 dark:bg-rose-950/30 border-red-200 dark:border-rose-800/30";
      default: return "text-gray-700 dark:text-slate-400 bg-gray-100 dark:bg-slate-800/30 border-gray-200 dark:border-slate-700/30";
    }
  };

  const handleEdit = useCallback((sample: LabSample) => {
    if (!isAdmin || !onSampleEdit) return;
    onSampleEdit(sample);
  }, [isAdmin, onSampleEdit]);

  // Reset filters handler
  const handleResetFilters = useCallback(() => {
    setSearch("");
    setMarkaFilter("");
    setStatusFilter("all");
    setGradeFilter("");
    setAnalystFilter("");
    setShowToSalesFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  }, []);

  // Export handler placeholder
  const handleExport = useCallback(() => {
    toast.info("Eksport funksiyasi tez orada qo'shiladi");
  }, [toast]);

  return (
    <>
      {/* Main Modal using professional Modal component */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Laboratoriya Tahlillari"
        description={`${filteredSamples.length} ta tahlil natijasi`}
        size="full"
        className="max-w-7xl"
        closeOnEscape={!showFilterModal}
        isLoading={isLoading}
        ariaLabelledBy="results-modal-title"
        showCloseButton={false}
      >
        {/* Professional Header with Actions */}
        <div className="flex items-center justify-between p-6 border-b border-border dark:border-white/10 bg-muted/30 dark:bg-black/40">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground dark:text-slate-500">
                Jami natijalar: {samples.length} | Ko'rsatilgan: {filteredSamples.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="flex items-center gap-2 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
              Tozalash
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              disabled={isLoading}
            >
              <Filter className="h-4 w-4" />
              Filtrlar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-2 dark:bg-white/5 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              disabled={isLoading}
            >
              <Download className="h-4 w-4" />
              Eksport
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 dark:text-slate-500 dark:hover:text-white"
              disabled={isLoading}
              aria-label="Modalni yopish"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Search */}
        <div className="p-4 border-b bg-muted/50 dark:bg-black/20 border-border dark:border-white/5">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-slate-600" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Marka, sinf yoki analitik nomi bo'yicha qidirish..."
              className="pl-10 dark:bg-black/40 dark:border-white/10 dark:text-white"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col dark:bg-black/10">
          {/* Results Table */}
          <div className="flex-1 overflow-auto p-4">
            {paginatedSamples.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Hech qanday natija topilmadi</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b dark:border-white/10">
                      <th className="text-left p-3 font-medium dark:text-slate-400">Marka</th>
                      <th className="text-left p-3 font-medium dark:text-slate-400">Sinf</th>
                      <th className="text-left p-3 font-medium dark:text-slate-400">Namlik</th>
                      <th className="text-left p-3 font-medium dark:text-slate-400">Axloq</th>
                      <th className="text-left p-3 font-medium dark:text-slate-400">Mustahkamlik</th>
                      <th className="text-left p-3 font-medium dark:text-slate-400">Uzunlik</th>
                      <th className="text-left p-3 font-medium dark:text-slate-400">Analitik</th>
                      <th className="text-left p-3 font-medium dark:text-slate-400">Holat</th>
                      <th className="text-left p-3 font-medium dark:text-slate-400">Sana</th>
                      <th className="text-left p-3 font-medium dark:text-slate-400">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSamples.map((sample) => {
                      const marka = markas.find(m => m.id === sample.markaId);
                      const markaLabel = marka ?
                        (marka.productType === 'TOLA' ? `${marka.sex} ${marka.number}` : `${marka.productType} ${marka.number}`) : 'N/A';

                      return (
                        <tr key={sample.id} className="border-b dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5">
                          <td className="p-3 dark:text-white">{markaLabel}</td>
                          <td className="p-3">
                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium border", getGradeColor(sample.grade))}>
                              {sample.grade}
                            </span>
                          </td>
                          <td className="p-3 dark:text-white">{sample.moisture}%</td>
                          <td className="p-3 dark:text-white">{sample.trash}%</td>
                          <td className="p-3 dark:text-white">{sample.strength}</td>
                          <td className="p-3 dark:text-white">{sample.lengthMm}mm</td>
                          <td className="p-3 dark:text-white">{sample.analyst || '-'}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(sample.status)}
                              <span className="text-sm dark:text-white">{getStatusText(sample.status)}</span>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground dark:text-slate-500">
                            {formatDate(sample.createdAt)}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {/* Show/Hide Toggle */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleShowToSales(sample.toyId)}
                                disabled={isLoading || isDeleting === sample.toyId}
                                className="h-8 w-8 p-0 dark:text-slate-500 dark:hover:text-white"
                                aria-label={sample.showToWarehouse ? "Savdodan yashirish" : "Savdoda ko'rsatish"}
                              >
                                {sample.showToWarehouse ?
                                  <Eye className="h-4 w-4" /> :
                                  <EyeOff className="h-4 w-4" />
                                }
                              </Button>

                              {/* Edit - Admin only */}
                              {isAdmin && onSampleEdit && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(sample)}
                                  disabled={isLoading || isDeleting === sample.toyId}
                                  className="h-8 w-8 p-0 dark:text-slate-500 dark:hover:text-white"
                                  aria-label="Tahlilni tahrirlash"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}

                              {/* Delete - Admin only */}
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSample(sample.toyId)}
                                  disabled={isLoading || isDeleting === sample.toyId}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                  aria-label="Tahlilni o'chirish"
                                >
                                  {isDeleting === sample.toyId ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t dark:border-white/10 dark:bg-black/20">
              <div className="text-sm text-muted-foreground dark:text-slate-500">
                {filteredSamples.length} natijadan {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredSamples.length)} ko'rsatilmoqda
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="dark:bg-white/5 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  Oldingi
                </Button>
                <span className="text-sm dark:text-white">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                  className="dark:bg-white/5 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  Keyingi
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Filter Modal using professional Modal component */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filtrlar"
        description="Tahlil natijalarini filtrlash uchun parametrlarni tanlang"
        size="lg"
        closeOnEscape={true}
      >
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Marka Filter */}
            <div>
              <Label htmlFor="markaFilter">Marka</Label>
              <select
                id="markaFilter"
                value={markaFilter}
                onChange={(e) => setMarkaFilter(e.target.value)}
                className="w-full mt-1 p-2 border border-input rounded-md bg-background dark:bg-black/40 dark:border-white/10 dark:text-white"
              >
                <option value="">Barchasi</option>
                {uniqueMarkas.map((marka) => (
                  <option key={marka?.id} value={marka?.id}>
                    {marka?.productType === 'TOLA' ? `${marka?.sex} ${marka?.number}` : `${marka?.productType} ${marka?.number}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <Label htmlFor="statusFilter">Holat</Label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "pending" | "approved" | "rejected")}
                className="w-full mt-1 p-2 border border-input rounded-md bg-background dark:bg-black/40 dark:border-white/10 dark:text-white"
              >
                <option value="all">Barchasi</option>
                <option value="pending">Kutilmoqda</option>
                <option value="approved">Tasdiqlangan</option>
                <option value="rejected">Rad etilgan</option>
              </select>
            </div>

            {/* Grade Filter */}
            <div>
              <Label htmlFor="gradeFilter">Sinf</Label>
              <select
                id="gradeFilter"
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full mt-1 p-2 border border-input rounded-md bg-background dark:bg-black/40 dark:border-white/10 dark:text-white"
              >
                <option value="">Barchasi</option>
                {uniqueGrades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Show to Sales Filter */}
            <div>
              <Label htmlFor="showToSalesFilter">Savdoda ko'rsatish</Label>
              <select
                id="showToSalesFilter"
                value={showToSalesFilter}
                onChange={(e) => setShowToSalesFilter(e.target.value as "all" | "yes" | "no")}
                className="w-full mt-1 p-2 border border-input rounded-md bg-background dark:bg-black/40 dark:border-white/10 dark:text-white"
              >
                <option value="all">Barchasi</option>
                <option value="yes">Ha</option>
                <option value="no">Yo'q</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleResetFilters}
            >
              Tozalash
            </Button>
            <Button onClick={() => setShowFilterModal(false)}>
              Yopish
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}