"use client";
import { LabSample } from "@/types/lab";
import { LabCard } from "./LabCard";

interface LabListProps {
  samples: LabSample[];
}

export function LabList({ samples }: LabListProps) {
  if (samples.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="text-4xl mb-4">🧪</div>
        <div className="text-lg font-medium mb-2">Laboratoriya tahlillari topilmadi</div>
        <div className="text-sm">Yangi tahlil qilish uchun toy tanlang va forma to'ldiring</div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {samples.map((sample) => (
        <LabCard key={sample.id} sample={sample} />
      ))}
    </div>
  );
}