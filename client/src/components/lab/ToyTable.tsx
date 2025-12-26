"use client";
import { useState, useMemo } from "react";
import { useBackendToyStore } from "@/stores/backendToyStore";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { useBackendLabStore } from "@/stores/backendLabStore";
import { Toy } from "@/types/toy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";
import {
  Package,
  Search,
  Filter,
  X,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";

interface ToyTableProps {
  onToysSelect: (toys: Toy[]) => void;
  selectedToys: Toy[];
}

export function ToyTable({ onToysSelect, selectedToys }: ToyTableProps) {
  const { toys } = useBackendToyStore();
  const { markas } = useBackendMarkaStore();
  const { getSampleByToyId } = useBackendLabStore();

  // Filters
  const [search, setSearch] = useState("");
  const [markaFilter, setMarkaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "analyzed" | "pending">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Get available toys (not sold)
  const availableToys = toys.filter(toy => !toy.sold);

  // Filter toys
  const filteredToys = useMemo(() => {
    return availableToys.filter(toy => {
      const marka = markas.find(m => m.id === toy.markaId);
      const labSample = getSampleByToyId(toy.id);

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const toyInfo = `#${toy.orderNo} ${marka?.number || ''} ${marka?.ptm || ''} ${marka?.selection || ''}`.toLowerCase();
        if (!toyInfo.includes(searchLower)) return false;
      }

      // Marka filter
      if (markaFilter && toy.markaId !== markaFilter) {
        return false;
      }

      // Status filter  
      if (statusFilter === "analyzed" && !labSample) return false;
      if (statusFilter === "pending" && labSample) return false;

      // Date filter
      if (dateFrom && toy.createdAt < dateFrom) return false;
      if (dateTo && toy.createdAt > `${dateTo}T23:59:59`) return false;

      return true;
    });
  }, [availableToys, markas, getSampleByToyId, search, markaFilter, statusFilter, dateFrom, dateTo]);

  // Unique markas for filter
  const availableMarkas = Array.from(
    new Set(availableToys.map(toy => toy.markaId))
  ).map(markaId => markas.find(m => m.id === markaId)).filter(Boolean);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isSelected = (toy: Toy) => selectedToys.some(t => t.id === toy.id);

  const handleToyToggle = (toy: Toy) => {
    if (isSelected(toy)) {
      onToysSelect(selectedToys.filter(t => t.id !== toy.id));
    } else {
      onToysSelect([...selectedToys, toy]);
    }
  };

  const handleSelectAll = () => {
    if (selectedToys.length === filteredToys.length) {
      onToysSelect([]);
    } else {
      onToysSelect(filteredToys);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setMarkaFilter("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Toy Tanlash ({filteredToys.length})
          </div>
          <div className="flex items-center gap-2">
            {selectedToys.length > 0 && (
              <span className="text-sm bg-primary text-primary-foreground px-2 py-1 rounded">
                {selectedToys.length} ta tanlangan
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-1">
            <Label>Qidirish</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Toy #, Marka..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Marka Filter */}
          <div className="space-y-1">
            <Label>Marka</Label>
            <select
              value={markaFilter}
              onChange={(e) => setMarkaFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Barcha markalar</option>
              {availableMarkas.map((marka) => (
                <option key={marka?.id} value={marka?.id}>
                  #{marka?.number} - {marka?.ptm}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <Label>Holati</Label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Barchasi</option>
              <option value="pending">Tahlilsiz</option>
              <option value="analyzed">Tahlillangan</option>
            </select>
          </div>

          {/* Date From */}
          <div className="space-y-1">
            <Label>Sana (dan)</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filteredToys.length > 0 && selectedToys.length === filteredToys.length}
              onChange={handleSelectAll}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium">Barchasini tanlash</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredToys.length} ta toy
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Tanla</th>
                  <th className="text-left p-3 font-medium">Toy #</th>
                  <th className="text-left p-3 font-medium">Marka</th>
                  <th className="text-left p-3 font-medium">Og'irlik</th>
                  <th className="text-left p-3 font-medium">Sana</th>
                  <th className="text-left p-3 font-medium">Holat</th>
                </tr>
              </thead>
              <tbody>
                {filteredToys.map((toy) => {
                  const marka = markas.find(m => m.id === toy.markaId);
                  const labSample = getSampleByToyId(toy.id);
                  const selected = isSelected(toy);

                  return (
                    <tr
                      key={toy.id}
                      className={cn(
                        "border-b hover:bg-muted/50 transition-colors cursor-pointer",
                        selected && "bg-primary/10 border-primary/30"
                      )}
                      onClick={() => handleToyToggle(toy)}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => handleToyToggle(toy)}
                          className="rounded border-gray-300"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="p-3 font-medium">#{toy.orderNo}</td>
                      <td className="p-3">
                        {marka ? (
                          <div>
                            <div className="font-medium">#{marka.number}</div>
                            <div className="text-xs text-muted-foreground">
                              {marka.ptm} • {marka.selection}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{Number(toy.netto).toFixed(2)} kg</div>
                          <div className="text-xs text-muted-foreground">
                            B: {Number(toy.brutto).toFixed(2)} - T: {Number(toy.tara).toFixed(2)}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {formatDate(toy.createdAt)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {labSample ? (
                            labSample.status === "APPROVED" ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-xs">Tasdiqlangan</span>
                              </div>
                            ) : labSample.status === "REJECTED" ? (
                              <div className="flex items-center gap-1 text-red-600">
                                <XCircle className="h-4 w-4" />
                                <span className="text-xs">Rad etilgan</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-yellow-600">
                                <Clock className="h-4 w-4" />
                                <span className="text-xs">Kutilmoqda</span>
                              </div>
                            )
                          ) : (
                            <span className="text-xs text-muted-foreground">Tahlilsiz</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredToys.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Filtr shartlariga mos toy topilmadi</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}