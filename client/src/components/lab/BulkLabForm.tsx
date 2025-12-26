"use client";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import { useBackendLabStore } from "@/stores/backendLabStore";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
import { LabSample, LabGradeUz } from "@/types/lab";
import { Toy } from "@/types/toy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";
import { FlaskConical, Save, Users } from "lucide-react";

const GRADE_OPTIONS: LabGradeUz[] = ["OLIY", "YAXSHI", "ORTA", "ODDIY", "IFLOS"];

interface BulkLabFormProps {
  selectedToys: Toy[];
  onComplete: () => void;
}

export function BulkLabForm({ selectedToys, onComplete }: BulkLabFormProps) {
  const { createSample } = useBackendLabStore();
  const { markas } = useBackendMarkaStore();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();

  // Form state
  const [moisture, setMoisture] = useState<number | "">(8.5);
  const [trash, setTrash] = useState<number | "">(2.0);
  const [navi, setNavi] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [grade, setGrade] = useState<LabGradeUz>("YAXSHI");
  const [strength, setStrength] = useState<number | "">(28.5);
  const [lengthMm, setLengthMm] = useState<number | "">(28);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (moisture === "" || trash === "" || strength === "" || lengthMm === "") {
        setError("Barcha raqamli maydonlarni to'ldiring");
        return;
      }

      if (selectedToys.length === 0) {
        setError("Kamida bitta toy tanlang");
        return;
      }

      // Create lab samples for all selected toys
      for (const toy of selectedToys) {
        const marka = markas.find(m => m.id === toy.markaId);
        if (!marka) continue;

        const labSample: LabSample = {
          id: uuid(),
          toyId: toy.id,
          sourceType: "toy",
          sourceId: toy.id,
          productType: toy.productType,
          markaId: toy.markaId,
          markaLabel: `#${marka.number} - ${marka.ptm}`,
          moisture: Number(moisture),
          trash: Number(trash),
          navi,
          grade,
          strength: Number(strength),
          lengthMm: Number(lengthMm),
          comment: comment.trim() || undefined,
          status: "PENDING",
          showToSales: false,
          showToWarehouse: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          analyst: user?.fullName || user?.username || null,
          approver: null,
        };

        await createSample({
          toyId: toy.id,
          moisture: Number(moisture),
          trash: Number(trash),
          navi,
          grade,
          strength: Number(strength),
          lengthMm: Number(lengthMm),
          comment: comment.trim() || undefined,
        });
      }

      // Reset form and notify
      setMoisture(8.5);
      setTrash(2.0);
      setNavi(3);
      setGrade("YAXSHI");
      setStrength(28.5);
      setLengthMm(28);
      setComment("");
      setError("");

      onComplete();

    } catch (err: any) {
      console.error("BulkLabForm error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Xatolik yuz berdi. Qaytadan urinib ko'ring."
      );
    } finally {
      setIsSubmitting(false);
    }

  };

  // Group toys by marka for display
  const toysByMarka = selectedToys.reduce((acc, toy) => {
    const marka = markas.find(m => m.id === toy.markaId);
    const key = marka ? `${marka.number}-${marka.ptm}` : "unknown";
    if (!acc[key]) {
      acc[key] = { marka, toys: [] };
    }
    acc[key].toys.push(toy);
    return acc;
  }, {} as Record<string, { marka: any; toys: Toy[] }>);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5" />
          Umumiy Laboratoriya Tahlili
          <span className="ml-2 bg-primary text-primary-foreground text-sm px-2 py-1 rounded">
            {selectedToys.length} ta toy
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selected Toys Info */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Tanlangan Toylar</Label>
            <div className="border rounded-lg p-4 bg-muted/50 max-h-40 overflow-y-auto">
              {Object.entries(toysByMarka).map(([key, { marka, toys }]) => (
                <div key={key} className="mb-3 last:mb-0">
                  <div className="font-medium text-sm mb-1">
                    {marka ? `Marka #${marka.number} - ${marka.ptm}` : "Noma'lum marka"}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {toys.map(toy => (
                      <span key={toy.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        #{toy.orderNo}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {toys.length} ta toy •
                    Jami: {toys.reduce((sum, toy) => sum + Number(toy.netto), 0).toFixed(2)} kg
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lab Analysis Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Moisture */}
            <div className="space-y-2">
              <Label htmlFor="moisture">Namlik (%)</Label>
              <Input
                id="moisture"
                type="number"
                step="0.1"
                value={moisture}
                onChange={(e) => setMoisture(e.target.value ? Number(e.target.value) : "")}
                placeholder="8.5"
              />
            </div>

            {/* Trash */}
            <div className="space-y-2">
              <Label htmlFor="trash">Ifloslik (%)</Label>
              <Input
                id="trash"
                type="number"
                step="0.1"
                value={trash}
                onChange={(e) => setTrash(e.target.value ? Number(e.target.value) : "")}
                placeholder="2.0"
              />
            </div>

            {/* Strength */}
            <div className="space-y-2">
              <Label htmlFor="strength">Pishiqligi</Label>
              <Input
                id="strength"
                type="number"
                step="0.1"
                value={strength}
                onChange={(e) => setStrength(e.target.value ? Number(e.target.value) : "")}
                placeholder="28.5"
              />
            </div>

            {/* Length */}
            <div className="space-y-2">
              <Label htmlFor="length">Uzunlik (mm)</Label>
              <Input
                id="length"
                type="number"
                step="0.1"
                value={lengthMm}
                onChange={(e) => setLengthMm(e.target.value ? Number(e.target.value) : "")}
                placeholder="28"
              />
            </div>
          </div>

          {/* Navi Selection */}
          <div className="space-y-2">
            <Label>Navi</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant={navi === n ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNavi(n as 1 | 2 | 3 | 4 | 5)}
                  className="flex-1"
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>

          {/* Grade Selection */}
          <div className="space-y-2">
            <Label>Sinf</Label>
            <div className="grid grid-cols-2 gap-2">
              {GRADE_OPTIONS.map((gradeOption) => (
                <Button
                  key={gradeOption}
                  type="button"
                  variant={grade === gradeOption ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGrade(gradeOption)}
                >
                  {gradeOption}
                </Button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Izoh (ixtiyoriy)</Label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Qo'shimcha izohlar..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={3}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={selectedToys.length === 0 || isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting
              ? "Saqlanmoqda..."
              : `${selectedToys.length} ta Toy uchun Tahlilni Saqlash`
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}