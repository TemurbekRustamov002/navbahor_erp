"use client";
import { useState, useMemo } from "react";
import { DocumentsService } from "@/lib/services/documents.service";
import { DocumentTemplate, DocumentCategory, DOCUMENT_CATEGORIES } from "@/types/document";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { 
  Download, 
  Search, 
  Filter, 
  FileText, 
  Factory,
  CheckCircle,
  Package,
  Award,
  BarChart3,
  Calendar,
  HardDrive,
  User
} from "lucide-react";

const CATEGORY_ICONS = {
  production: Factory,
  quality: CheckCircle,
  warehouse: Package,
  contracts: FileText,
  certificates: Award,
  reports: BarChart3
};

interface DocumentLibraryProps {
  selectedCategory?: DocumentCategory;
  showSearch?: boolean;
  showFilters?: boolean;
  compactMode?: boolean;
  onDocumentDownload?: (document: DocumentTemplate) => void;
}

export function DocumentLibrary({
  selectedCategory,
  showSearch = true,
  showFilters = true,
  compactMode = false,
  onDocumentDownload
}: DocumentLibraryProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | "all">(
    selectedCategory || "all"
  );
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Get filtered documents
  const documents = useMemo(() => {
    let result = DocumentsService.getDocumentTemplates();

    // Filter by category
    if (filterCategory !== "all") {
      result = result.filter(doc => doc.category === filterCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      result = DocumentsService.searchDocuments(searchQuery);
    }

    // Sort by last modified (newest first)
    return result.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );
  }, [filterCategory, searchQuery]);

  const handleDownload = async (document: DocumentTemplate) => {
    try {
      setIsDownloading(document.id);
      
      // Check permissions (simplified for now)
      const userPermissions = ["PRODUCTION_READ", "LAB_READ", "WAREHOUSE_READ"]; // Get from auth store
      if (!DocumentsService.hasPermission(document, userPermissions)) {
        toast.error("Bu hujjatni yuklab olish uchun ruxsatingiz yo'q");
        return;
      }

      // Generate download URL
      const downloadUrl = await DocumentsService.downloadDocument({
        documentId: document.id
      });

      // Create download link via service URL (handles encoding)
      const a = window.document.createElement('a');
      a.href = downloadUrl;
      a.download = document.fileName;
      a.rel = 'noopener';
      a.target = '_self';
      a.style.display = 'none';
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);

      toast.success(`${document.nameUz} muvaffaqiyatli yuklab olindi`);
      
      // Call callback if provided
      if (onDocumentDownload) {
        onDocumentDownload(document);
      }
      
    } catch (error) {
      toast.error("Hujjatni yuklab olishda xatolik yuz berdi");
      console.error("Download error:", error);
    } finally {
      setIsDownloading(null);
    }
  };

  const getCategoryIcon = (category: DocumentCategory) => {
    const IconComponent = CATEGORY_ICONS[category] || FileText;
    return <IconComponent className="w-4 h-4" />;
  };

  const getCategoryColor = (category: DocumentCategory) => {
    const colors = {
      production: "bg-blue-100 text-blue-700 border-blue-200",
      quality: "bg-green-100 text-green-700 border-green-200",
      warehouse: "bg-orange-100 text-orange-700 border-orange-200",
      contracts: "bg-purple-100 text-purple-700 border-purple-200",
      certificates: "bg-yellow-100 text-yellow-700 border-yellow-200",
      reports: "bg-gray-100 text-gray-700 border-gray-200"
    };
    return colors[category] || colors.reports;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hujjatlar kutubxonasi</h2>
          <p className="text-gray-600">Barcha zaruriy hujjatlarni yuklab oling</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <HardDrive className="w-4 h-4" />
          <span>{documents.length} ta hujjat</span>
        </div>
      </div>

      {/* Filters */}
      {(showSearch || showFilters) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              {showSearch && (
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Hujjat nomi yoki tavsifi bo'yicha qidirish..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              {/* Category Filter */}
              {showFilters && (
                <div className="lg:w-64">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as DocumentCategory | "all")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Barcha kategoriyalar</option>
                    {DOCUMENT_CATEGORIES.map(category => (
                      <option key={category.key} value={category.key}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents Grid */}
      <div className={cn(
        "grid gap-4",
        compactMode 
          ? "grid-cols-1 lg:grid-cols-2" 
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}>
        {documents.map((document) => (
          <Card key={document.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryIcon(document.category)}
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full border",
                    getCategoryColor(document.category)
                  )}>
                    {DOCUMENT_CATEGORIES.find(cat => cat.key === document.category)?.name}
                  </span>
                </div>
              </div>
              <CardTitle className="text-lg leading-tight">
                {document.nameUz}
              </CardTitle>
              <p className="text-sm text-gray-600 line-clamp-2">
                {document.description}
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {/* File info */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(document.lastModified).toLocaleDateString('uz-UZ')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HardDrive className="w-4 h-4" />
                    <span>{DocumentsService.formatFileSize(document.fileSize)}</span>
                  </div>
                </div>

                {/* Download stats */}
                {document.downloadCount > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Download className="w-4 h-4" />
                    <span>{document.downloadCount} marta yuklab olingan</span>
                  </div>
                )}

                {/* Download button */}
                <Button
                  onClick={() => handleDownload(document)}
                  disabled={isDownloading === document.id}
                  className="w-full"
                  size="sm"
                >
                  {isDownloading === document.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Yuklanmoqda...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Yuklab olish
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {documents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Hujjatlar topilmadi
            </h3>
            <p className="text-gray-600">
              {searchQuery ? 
                "Qidiruv bo'yicha hech qanday hujjat topilmadi. Boshqa kalit so'zlar bilan urinib ko'ring." :
                "Hozircha bu kategoriyada hujjatlar mavjud emas."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}