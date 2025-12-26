"use client";
import { DocumentDownloadCard } from "./DocumentDownloadCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FolderOpen, TrendingUp, Download } from "lucide-react";
import Link from "next/link";

const FEATURED_DOCUMENTS = [
  {
    id: 'navbahor-production-2025-v4',
    title: 'НАВБАХОР 2025 йил ишлаб чиқариш махсулотлар (4)',
    titleUz: 'Navbahor 2025-yil ishlab chiqarish mahsulotlari',
    description: 'Eng yangi ishlab chiqarish mahsulotlari ro\'yxati',
    fileName: 'НАВБАХОР_2025_йил_ишлаб_чикариш_маҳсулотлар (4).xlsx',
    fileSize: 2066559,
    lastModified: new Date('2025-12-03T14:23:43'),
    category: 'production'
  },
  {
    id: 'tola-nakladnoy-2025-v4',
    title: 'УМУМИЙ ТОЛА НАКЛАДНОЙ 2025 (4)',
    titleUz: 'Umumiy tola nakladnoysi 2025',
    description: 'Tola bo\'yicha umumiy nakladnoy hujjati',
    fileName: 'УМУМИЙ ТОЛА НАКЛАДНОЙ 2025 (4).xlsx',
    fileSize: 316526,
    lastModified: new Date('2025-12-03T14:23:42'),
    category: 'warehouse'
  },
  {
    id: 'valikli-zavod-otves',
    title: 'Валикли завод ОТВЕС',
    titleUz: 'Valikli zavod tortish hisoboti',
    description: 'Valikli zavodining tortish hisoboti',
    fileName: 'Валикли завод_ОТВЕС_2025_й_ (3).xlsx',
    fileSize: 521732,
    lastModified: new Date('2025-12-03T14:23:41'),
    category: 'production'
  }
];

export function QuickDocumentAccess() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <CardTitle>Mashhur hujjatlar</CardTitle>
          </div>
          <Link href="/dashboard/hujjatlar">
            <Button variant="outline" size="sm">
              <FolderOpen className="w-4 h-4 mr-2" />
              Barcha hujjatlar
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {FEATURED_DOCUMENTS.map((doc) => (
            <DocumentDownloadCard
              key={doc.id}
              title={doc.title}
              titleUz={doc.titleUz}
              description={doc.description}
              fileName={doc.fileName}
              fileSize={doc.fileSize}
              lastModified={doc.lastModified}
              category={doc.category}
              onDownload={() => {
                console.log(`Downloaded: ${doc.titleUz}`);
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}