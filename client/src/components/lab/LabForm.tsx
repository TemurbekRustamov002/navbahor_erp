"use client";
import { useState, useEffect } from "react";
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
import { FlaskConical, Save, Search } from "lucide-react";

const GRADE_OPTIONS: LabGradeUz[] = ["OLIY", "YAXSHI", "ORTA", "ODDIY", "IFLOS"];

export function LabForm() {
  const { upsertByToy, getSampleByToyId, createSample } = useBackendLabStore();
  const { toys, fetchToys } = useBackendToyStore();
  const { markas, fetchMarkas } = useBackendMarkaStore();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();

  // Load data on component mount
  useEffect(() => {
    console.log('🔄 LabForm: Loading toys and markas...');
    fetchToys();
    fetchMarkas();
    console.log('📊 Current markas count:', markas?.length || 0);
    console.log('🧸 Current toys count:', toys?.length || 0);
  }, [fetchToys, fetchMarkas]);

  // Debug markas data
  useEffect(() => {
    console.log('🏷️ Markas data updated:', markas?.length || 0, 'items');
    if (markas && markas.length > 0) {
      console.log('First marka:', markas[0]);
    }
  }, [markas]);

  // Debug toys data  
  useEffect(() => {
    console.log('🧸 Toys data updated:', toys?.length || 0, 'items');
    if (toys && toys.length > 0) {
      console.log('First toy:', toys[0]);
    }
  }, [toys]);

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

  // Get available toys (not sold)
  const availableToys = toys.filter(toy => !toy.sold);
  const selectedToy = toys.find(toy => toy.id === selectedToyId);
  const selectedMarka = selectedToy ? markas.find(m => m.id === selectedToy.markaId) : null;

  // Load existing sample data when toy is selected
  useEffect(() => {
    if (selectedToyId) {
      const existingSample = getSampleByToyId(selectedToyId);
      if (existingSample) {
        setMoisture(existingSample.moisture);
        setTrash(existingSample.trash);
        setNavi(existingSample.navi);
        setGrade(existingSample.grade);
        setStrength(existingSample.strength);
        setLengthMm(existingSample.lengthMm);
        setComment(existingSample.comment || "");
      }
    }
  }, [selectedToyId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    // Create or update lab sample
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
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5" />
          Laboratoriya Tahlili
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Toy Selection */}
          <div className="space-y-2">
            <Label htmlFor="toy">Toy tanlang</Label>
            <select
              id="toy"
              value={selectedToyId}
              onChange={(e) => setSelectedToyId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Toy tanlang...</option>
              {availableToys.map((toy) => {
                const marka = markas.find(m => m.id === toy.markaId);
                const existingSample = getSampleByToyId(toy.id);
                return (
                  <option key={toy.id} value={toy.id}>
                    #{toy.orderNo} - {Number(toy.netto).toFixed(2)}kg
                    {marka ? ` - Marka #${marka.number}` : ""}
                    {existingSample ? " ✓" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Selected Toy Info */}
          {selectedToy && selectedMarka && (
            <div className="p-3 bg-muted rounded-md text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="font-medium">Toy #{selectedToy.orderNo}</div>
                  <div>Netto: {Number(selectedToy.netto).toFixed(2)} kg</div>
                  <div>Yaratildi: {new Date(selectedToy.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="font-medium">Marka #{selectedMarka.number}</div>
                  <div>PTM: {selectedMarka.ptm}</div>
                  <div>Selection: {selectedMarka.selection}</div>
                </div>
              </div>
            </div>
          )}

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
            disabled={!selectedToyId}
          >
            <Save className="h-4 w-4 mr-2" />
            Tahlilni Saqlash
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}