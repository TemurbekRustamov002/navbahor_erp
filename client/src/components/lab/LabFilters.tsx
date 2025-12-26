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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtrlar
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetLabFilter}
            className="h-8 px-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Qidirish</Label>
          <Input
            id="search"
            placeholder="Marka, izoh yoki ID..."
            value={labFilter.search}
            onChange={(e) => setLabFilter({ search: e.target.value })}
          />
        </div>

        {/* Product Types */}
        <div className="space-y-2">
          <Label>Mahsulot turlari</Label>
          <div className="grid grid-cols-2 gap-2">
            {productTypes.map((type) => (
              <Button
                key={type}
                variant={labFilter.productTypes.includes(type) ? "default" : "outline"}
                size="sm"
                onClick={() => handleProductTypeToggle(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Holati</Label>
          <div className="space-y-2">
            <Button
              variant={labFilter.status === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setLabFilter({ status: "all" })}
              className="w-full justify-start"
            >
              Barchasi
            </Button>
            <Button
              variant={labFilter.status === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setLabFilter({ status: "pending" })}
              className="w-full justify-start"
            >
              Kutilmoqda
            </Button>
            <Button
              variant={labFilter.status === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setLabFilter({ status: "approved" })}
              className="w-full justify-start"
            >
              Tasdiqlangan
            </Button>
            <Button
              variant={labFilter.status === "rejected" ? "default" : "outline"}
              size="sm"
              onClick={() => setLabFilter({ status: "rejected" })}
              className="w-full justify-start"
            >
              Rad etilgan
            </Button>
          </div>
        </div>

        {/* Sales Visibility */}
        <div className="space-y-2">
          <Label>Sotuvga ko'rinishi</Label>
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
                className="w-full justify-start"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Analyst Filter */}
        {analysts.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="analyst">Tahlilchi</Label>
            <select
              id="analyst"
              value={labFilter.analyst || ""}
              onChange={(e) => setLabFilter({ analyst: e.target.value || undefined })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Barcha tahlilchilar</option>
              {analysts.map((analyst) => (
                <option key={analyst} value={analyst}>
                  {analyst}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Range */}
        <div className="space-y-2">
          <Label>Sana oralig'i</Label>
          <div className="space-y-2">
            <Input
              type="date"
              value={labFilter.dateFrom || ""}
              onChange={(e) => setLabFilter({ dateFrom: e.target.value || undefined })}
            />
            <Input
              type="date"
              value={labFilter.dateTo || ""}
              onChange={(e) => setLabFilter({ dateTo: e.target.value || undefined })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}