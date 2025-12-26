"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  Download,
  FileText,
  Calendar,
  HardDrive,
  CheckCircle,
  ExternalLink
} from "lucide-react";

interface DocumentDownloadCardProps {
  title: string;
  titleUz: string;
  description: string;
  fileName: string;
  fileSize: number;
  lastModified: Date;
  category: string;
  onDownload?: () => void;
}

export function DocumentDownloadCard({
  title,
  titleUz,
  description,
  fileName,
  fileSize,
  lastModified,
  category,
  onDownload
}: DocumentDownloadCardProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      production: "bg-blue-100 text-blue-700 border-blue-200",
      quality: "bg-green-100 text-green-700 border-green-200",
      warehouse: "bg-orange-100 text-orange-700 border-orange-200",
      contracts: "bg-purple-100 text-purple-700 border-purple-200",
      certificates: "bg-yellow-100 text-yellow-700 border-yellow-200",
      reports: "bg-gray-100 text-gray-700 border-gray-200"
    };
    return colors[category] || colors.reports;
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      production: "Ishlab chiqarish",
      quality: "Sifat nazorati",
      warehouse: "Ombor",
      contracts: "Shartnomalar",
      certificates: "Sertifikatlar",
      reports: "Hisobotlar"
    };
    return names[category] || category;
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // Create download link
      const a = window.document.createElement('a');
      a.href = `/hujjatlar/${encodeURIComponent(fileName)}`;
      a.download = fileName;
      a.rel = 'noopener';
      a.target = '_self';
      a.style.display = 'none';

      // Add to DOM, click, and remove
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);

      toast.success(`${titleUz} muvaffaqiyatli yuklab olindi`);

      // Call callback
      if (onDownload) {
        onDownload();
      }

    } catch (error) {
      toast.error("Hujjatni yuklab olishda xatolik yuz berdi");
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = () => {
    // Open in new tab for preview
    window.open(`/hujjatlar/${fileName}`, '_blank');
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border hover:border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(category)}`}>
            {getCategoryName(category)}
          </span>
          <FileText className="w-5 h-5 text-gray-400" />
        </div>
        <CardTitle className="text-lg leading-tight">
          {titleUz}
        </CardTitle>
        <p className="text-sm text-gray-600 line-clamp-2">
          {description}
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* File metadata */}
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{lastModified.toLocaleDateString('uz-UZ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              <span>{formatFileSize(fileSize)}</span>
            </div>
          </div>

          {/* File name */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-mono text-gray-700 break-all">
              {fileName}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1"
              size="sm"
            >
              {isDownloading ? (
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

            <Button
              onClick={handlePreview}
              variant="outline"
              size="sm"
              className="px-3"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}