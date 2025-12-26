"use client";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import { useBackendLabStore } from "@/stores/backendLabStore";
import { useBackendToyStore } from "@/stores/backendToyStore";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
import { LabSample, LabGradeUz } from "@/types/lab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";
import { FlaskConical, Save, Plus, Package } from "lucide-react";

const GRADE_OPTIONS: LabGradeUz[] = ["OLIY", "YAXSHI", "ORTA", "ODDIY", "IFLOS"];

export function CompactLabForm() {
  const { upsertByToy, getSampleByToyId } = useBackendLabStore();
  const { toys } = useBackendToyStore();
  const { markas } = useBackendMarkaStore();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();

  // Form state
  const [selectedToyId, setSelectedToyId] = useState("");
  const [moisture, setMoisture] = useState<number | "">(8.5);
  const [trash, setTrash] = useState<number | "">(2.0);
  const [navi, setNavi] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [grade, setGrade] = useState<LabGradeUz>("YAXSHI");
  const [strength, setStrength] = useState<number | "">(28.5);
  const [lengthMm, setLengthMm] = useState<number | "">(28);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get available toys (not sold)
  const availableToys = toys.filter(toy => !toy.sold);
  const selectedToy = toys.find(toy => toy.id === selectedToyId);
  const selectedMarka = selectedToy ? markas.find(m => m.id === selectedToy.markaId) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!selectedToyId) {
        setError("Toy tanlang");
        return;
      }

      if (!selectedToy || !selectedMarka) {
        setError("Tanlangan toy yoki marka topilmadi");
        return;
      }

      // Validation
      if (moisture === "" || trash === "" || strength === "" || lengthMm === "") {
        setError("Barcha raqamli maydonlarni to'ldiring");
        return;
      }

      // Create lab sample
      const labSample: LabSample = {
        id: uuid(),
        toyId: selectedToyId,
        sourceType: "toy",
        sourceId: selectedToyId,
        productType: selectedToy.productType,
        markaId: selectedToy.markaId,
        markaLabel: `#${selectedMarka.number} - ${selectedMarka.ptm}`,
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

      upsertByToy(labSample);

      // Reset form
      setSelectedToyId("");
      setMoisture(8.5);
      setTrash(2.0);
      setNavi(3);
      setGrade("YAXSHI");
      setStrength(28.5);
      setLengthMm(28);
      setComment("");
      setError("");

    } catch (err) {
      setError("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FlaskConical className="h-5 w-5" />
          Tezkor Tahlil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Toy Selection - Compact */}
          <div className="space-y-2">
            <Label htmlFor="toy" className="text-sm">Toy</Label>
            <select
              id="toy"
              value={selectedToyId}
              onChange={(e) => setSelectedToyId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Toy tanlang...</option>
              {availableToys.slice(0, 50).map((toy) => {
                const marka = markas.find(m => m.id === toy.markaId);
                const existingSample = getSampleByToyId(toy.id);
                return (
                  <option key={toy.id} value={toy.id}>
                    #{toy.orderNo} - {Number(toy.netto).toFixed(1)}kg
                    {marka ? ` - #${marka.number}` : ""}
                    {existingSample ? " ✓" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Selected Toy Info - Compact */}
          {selectedToy && selectedMarka && (
            <div className="p-3 bg-muted/50 rounded-md text-xs">
              <div className="flex justify-between">
                <span><strong>#{selectedMarka.number}</strong> - {selectedMarka.ptm}</span>
                <span>{Number(selectedToy.netto).toFixed(2)} kg</span>
              </div>
            </div>
          )}

          {/* Lab Parameters - Compact Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="moisture" className="text-xs">Namlik %</Label>
              <Input
                id="moisture"
                type="number"
                step="0.1"
                value={moisture}
                onChange={(e) => setMoisture(e.target.value ? Number(e.target.value) : "")}
                className="h-8 text-sm"
                placeholder="8.5"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="trash" className="text-xs">Ifloslik %</Label>
              <Input
                id="trash"
                type="number"
                step="0.1"
                value={trash}
                onChange={(e) => setTrash(e.target.value ? Number(e.target.value) : "")}
                className="h-8 text-sm"
                placeholder="2.0"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="strength" className="text-xs">Pishiqlik</Label>
              <Input
                id="strength"
                type="number"
                step="0.1"
                value={strength}
                onChange={(e) => setStrength(e.target.value ? Number(e.target.value) : "")}
                className="h-8 text-sm"
                placeholder="28.5"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="length" className="text-xs">Uzunlik mm</Label>
              <Input
                id="length"
                type="number"
                step="0.1"
                value={lengthMm}
                onChange={(e) => setLengthMm(e.target.value ? Number(e.target.value) : "")}
                className="h-8 text-sm"
                placeholder="28"
              />
            </div>
          </div>

          {/* Navi - Compact */}
          <div className="space-y-2">
            <Label className="text-xs">Navi</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant={navi === n ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNavi(n as 1 | 2 | 3 | 4 | 5)}
                  className="flex-1 h-8 text-xs"
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>

          {/* Grade - Compact */}
          <div className="space-y-2">
            <Label className="text-xs">Sinf</Label>
            <div className="grid grid-cols-3 gap-1">
              {GRADE_OPTIONS.map((gradeOption) => (
                <Button
                  key={gradeOption}
                  type="button"
                  variant={grade === gradeOption ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGrade(gradeOption)}
                  className="h-8 text-xs"
                >
                  {gradeOption}
                </Button>
              ))}
            </div>
          </div>

          {/* Comment - Compact */}
          <div className="space-y-1">
            <Label htmlFor="comment" className="text-xs">Izoh</Label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Qo'shimcha izohlar..."
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              rows={2}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-9"
            disabled={!selectedToyId || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="text-xs">Saqlanmoqda...</span>
              </div>
            ) : (
              <>
                <Save className="h-3 w-3 mr-2" />
                <span className="text-xs">Tahlilni Saqlash</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}