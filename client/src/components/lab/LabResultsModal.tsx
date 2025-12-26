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
  const handleToggleShowToSales = useCallback(async (sampleId: string) => {
    try {
      setIsLoading(true);
      await toggleShowToSales(sampleId);
      toast.success("Savdo ko'rsatish holati o'zgartirildi");
    } catch (error) {
      toast.error("Xatolik yuz berdi", {
        title: "Savdo holati o'zgartirishda muammo",
        action: {
          label: "Qayta urinish",
          onClick: () => handleToggleShowToSales(sampleId)
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, [toggleShowToSales, toast]);

  const handleDeleteSample = useCallback(async (sampleId: string) => {
    if (!window.confirm("Haqiqatan ham bu tahlilni o'chirmoqchimisiz?")) {
      return;
    }

    try {
      setIsDeleting(sampleId);
      await deleteSample(sampleId);
      toast.success("Tahlil muvaffaqiyatli o'chirildi");
    } catch (error) {
      toast.error("Tahlilni o'chirishda xatolik yuz berdi", {
        action: {
          label: "Qayta urinish",
          onClick: () => handleDeleteSample(sampleId)
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

      // Show to sales filter
      if (showToSalesFilter === "yes" && !sample.showToSales) return false;
      if (showToSalesFilter === "no" && sample.showToSales) return false;

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
      case "OLIY": return "text-green-700 bg-green-100";
      case "YAXSHI": return "text-blue-700 bg-blue-100";
      case "ORTA": return "text-yellow-700 bg-yellow-100";
      case "ODDIY": return "text-orange-700 bg-orange-100";
      case "IFLOS": return "text-red-700 bg-red-100";
      default: return "text-gray-700 bg-gray-100";
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
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">
                Jami natijalar: {samples.length} | Ko'rsatilgan: {filteredSamples.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
              Tozalash
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <Filter className="h-4 w-4" />
              Filtrlar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <Download className="h-4 w-4" />
              Eksport
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              disabled={isLoading}
              aria-label="Modalni yopish"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Search */}
        <div className="p-4 border-b bg-muted/50 border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Marka, sinf yoki analitik nomi bo'yicha qidirish..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
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
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Marka</th>
                      <th className="text-left p-3 font-medium">Sinf</th>
                      <th className="text-left p-3 font-medium">Namlik</th>
                      <th className="text-left p-3 font-medium">Axloq</th>
                      <th className="text-left p-3 font-medium">Mustahkamlik</th>
                      <th className="text-left p-3 font-medium">Uzunlik</th>
                      <th className="text-left p-3 font-medium">Analitik</th>
                      <th className="text-left p-3 font-medium">Holat</th>
                      <th className="text-left p-3 font-medium">Sana</th>
                      <th className="text-left p-3 font-medium">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSamples.map((sample) => {
                      const marka = markas.find(m => m.id === sample.markaId);
                      const markaLabel = marka ?
                        (marka.productType === 'TOLA' ? `${marka.sex} ${marka.number}` : `${marka.productType} ${marka.number}`) : 'N/A';

                      return (
                        <tr key={sample.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">{markaLabel}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(sample.grade)}`}>
                              {sample.grade}
                            </span>
                          </td>
                          <td className="p-3">{sample.moisture}%</td>
                          <td className="p-3">{sample.trash}%</td>
                          <td className="p-3">{sample.strength}</td>
                          <td className="p-3">{sample.lengthMm}mm</td>
                          <td className="p-3">{sample.analyst || '-'}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(sample.status)}
                              <span className="text-sm">{getStatusText(sample.status)}</span>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {formatDate(sample.createdAt)}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {/* Show/Hide Toggle */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleShowToSales(sample.id)}
                                disabled={isLoading || isDeleting === sample.id}
                                className="h-8 w-8 p-0"
                                aria-label={sample.showToSales ? "Savdodan yashirish" : "Savdoda ko'rsatish"}
                              >
                                {sample.showToSales ?
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
                                  disabled={isLoading || isDeleting === sample.id}
                                  className="h-8 w-8 p-0"
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
                                  onClick={() => handleDeleteSample(sample.id)}
                                  disabled={isLoading || isDeleting === sample.id}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  aria-label="Tahlilni o'chirish"
                                >
                                  {isDeleting === sample.id ? (
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
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                {filteredSamples.length} natijadan {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredSamples.length)} ko'rsatilmoqda
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  Oldingi
                </Button>
                <span className="text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
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
                className="w-full mt-1 p-2 border border-input rounded-md bg-background"
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
                className="w-full mt-1 p-2 border border-input rounded-md bg-background"
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
                className="w-full mt-1 p-2 border border-input rounded-md bg-background"
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
                className="w-full mt-1 p-2 border border-input rounded-md bg-background"
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