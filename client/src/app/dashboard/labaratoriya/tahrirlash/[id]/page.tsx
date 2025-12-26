"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useBackendLabStore } from "@/stores/backendLabStore";
import { useBackendMarkaStore } from "@/stores/backendMarkaStore";
import { useBackendToyStore } from "@/stores/backendToyStore";
import { useAuthStore } from "@/stores/authStore";
import { LabSample, LabGradeUz } from "@/types/lab";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { FlaskConical, Save, ArrowLeft, Package } from "lucide-react";

const GRADE_OPTIONS: LabGradeUz[] = ["OLIY", "YAXSHI", "ORTA", "ODDIY", "IFLOS"];

export default function LabEditPage() {
  const router = useRouter();
  const params = useParams();
  const sampleId = params.id as string;
  
  const { samples, updateSample } = useBackendLabStore();
  const { markas } = useBackendMarkaStore();
  const { toys } = useBackendToyStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  // Form state
  const [moisture, setMoisture] = useState<number | "">(8.5);
  const [trash, setTrash] = useState<number | "">(2.0);
  const [navi, setNavi] = useState<1|2|3|4|5>(3);
  const [grade, setGrade] = useState<LabGradeUz>("YAXSHI");
  const [strength, setStrength] = useState<number | "">(28.5);
  const [lengthMm, setLengthMm] = useState<number | "">(28);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get sample data
  const sample = samples.find(s => s.id === sampleId);
  const isAdmin = user?.role === "ADMIN";

  // Load sample data when component mounts
  useEffect(() => {
    if (sample) {
      setMoisture(sample.moisture);
      setTrash(sample.trash);
      setNavi(sample.navi);
      setGrade(sample.grade);
      setStrength(sample.strength);
      setLengthMm(sample.lengthMm);
      setComment(sample.comment || "");
    }
  }, [sample]);

  // Check if user has permission
  useEffect(() => {
    if (!isAdmin) {
      toast.error("Bu sahifaga kirish uchun admin huquqi kerak");
      router.push('/dashboard/labaratoriya');
    }
  }, [isAdmin, router, toast]);

  // Check if sample exists
  useEffect(() => {
    if (!sample && sampleId) {
      toast.error("Tahlil topilmadi");
      router.push('/dashboard/labaratoriya/natijalar');
    }
  }, [sample, sampleId, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!moisture || !trash || !strength || !lengthMm) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }

    if (moisture < 0 || moisture > 15) {
      setError("Namlik 0-15% oralig'ida bo'lishi kerak");
      return;
    }

    if (trash < 0 || trash > 10) {
      setError("Axloq 0-10% oralig'ida bo'lishi kerak");
      return;
    }

    if (strength < 20 || strength > 50) {
      setError("Mustahkamlik 20-50 oralig'ida bo'lishi kerak");
      return;
    }

    if (lengthMm < 20 || lengthMm > 40) {
      setError("Uzunlik 20-40mm oralig'ida bo'lishi kerak");
      return;
    }

    try {
      setIsSubmitting(true);

      const updatedSample: LabSample = {
        ...sample!,
        moisture: Number(moisture),
        trash: Number(trash),
        navi,
        grade,
        strength: Number(strength),
        lengthMm: Number(lengthMm),
        comment: comment.trim(),
        analyst: user?.fullName || user?.username || "Admin",
        updatedAt: new Date().toISOString(),
      };

      await updateSample(sample!.id, updatedSample);
      toast.success("Tahlil muvaffaqiyatli yangilandi");
      router.push('/dashboard/labaratoriya/natijalar');
    } catch (error) {
      console.error("Error updating sample:", error);
      toast.error("Tahlilni yangilashda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    router.push('/dashboard/labaratoriya/natijalar');
  };

  if (!sample || !isAdmin) {
    return null;
  }

  const toy = toys.find(t => t.id === sample.sourceId);
  const marka = markas.find(m => m.id === sample.markaId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Orqaga
              </Button>
              <div className="flex items-center gap-3">
                <FlaskConical className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-semibold">Laboratoriya Tahlilini Tahrirlash</h1>
                  <p className="text-sm text-muted-foreground">
                    {sample.markaLabel} • Toy #{toy?.orderNo}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Sample Info Card */}
        <div className="bg-card rounded-lg border p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Namuna Ma'lumotlari</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Marka:</span>
              <div className="font-medium">{sample.markaLabel}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Toy raqami:</span>
              <div className="font-medium">#{toy?.orderNo || 'N/A'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Yaratilgan:</span>
              <div className="font-medium">{new Date(sample.createdAt).toLocaleString('uz-UZ')}</div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-card rounded-lg border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Moisture */}
              <div>
                <Label htmlFor="moisture">Namlik (%)</Label>
                <Input
                  id="moisture"
                  type="number"
                  step="0.1"
                  min="0"
                  max="15"
                  value={moisture}
                  onChange={(e) => setMoisture(e.target.value ? Number(e.target.value) : "")}
                  placeholder="8.5"
                  disabled={isSubmitting}
                />
              </div>

              {/* Trash */}
              <div>
                <Label htmlFor="trash">Axloq (%)</Label>
                <Input
                  id="trash"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={trash}
                  onChange={(e) => setTrash(e.target.value ? Number(e.target.value) : "")}
                  placeholder="2.0"
                  disabled={isSubmitting}
                />
              </div>

              {/* Strength */}
              <div>
                <Label htmlFor="strength">Mustahkamlik</Label>
                <Input
                  id="strength"
                  type="number"
                  step="0.1"
                  min="20"
                  max="50"
                  value={strength}
                  onChange={(e) => setStrength(e.target.value ? Number(e.target.value) : "")}
                  placeholder="28.5"
                  disabled={isSubmitting}
                />
              </div>

              {/* Length */}
              <div>
                <Label htmlFor="length">Uzunlik (mm)</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  min="20"
                  max="40"
                  value={lengthMm}
                  onChange={(e) => setLengthMm(e.target.value ? Number(e.target.value) : "")}
                  placeholder="28"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Navi Selection */}
            <div>
              <Label>Navi</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Button
                    key={n}
                    type="button"
                    variant={navi === n ? "default" : "outline"}
                    onClick={() => setNavi(n as 1|2|3|4|5)}
                    disabled={isSubmitting}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>

            {/* Grade Selection */}
            <div>
              <Label>Sinf</Label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2">
                {GRADE_OPTIONS.map((gradeOption) => (
                  <Button
                    key={gradeOption}
                    type="button"
                    variant={grade === gradeOption ? "default" : "outline"}
                    onClick={() => setGrade(gradeOption)}
                    disabled={isSubmitting}
                    className="text-sm"
                  >
                    {gradeOption}
                  </Button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <Label htmlFor="comment">Izoh (ixtiyoriy)</Label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Qo'shimcha izohlar..."
                disabled={isSubmitting}
                className="w-full mt-1 p-2 border border-input rounded-md bg-background min-h-[80px] resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Saqlash
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}