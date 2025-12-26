"use client";
import { DocumentLibrary } from "@/components/documents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  FileText, 
  Factory, 
  CheckCircle, 
  Package,
  Award,
  BarChart3,
  Download,
  TrendingUp
} from "lucide-react";

export default function HujjatlarPage() {
  const stats = [
    {
      title: "Jami hujjatlar",
      value: "6",
      icon: FileText,
      color: "text-blue-600 bg-blue-100"
    },
    {
      title: "Ishlab chiqarish",
      value: "3",
      icon: Factory,
      color: "text-green-600 bg-green-100"
    },
    {
      title: "Sifat nazorati",
      value: "1",
      icon: CheckCircle,
      color: "text-yellow-600 bg-yellow-100"
    },
    {
      title: "Ombor hujjatlari",
      value: "2",
      icon: Package,
      color: "text-purple-600 bg-purple-100"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Hujjatlar</h1>
        <p className="text-gray-600 mt-2">
          Korxonaning barcha zaruriy hujjatlari va shablonlari
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Tez harakatlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Factory className="w-8 h-8 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-blue-900">Ishlab chiqarish hisobotlari</h4>
                  <p className="text-sm text-blue-700">2025-yil uchun barcha hisobotlar</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-900">Sifat xulosalari</h4>
                  <p className="text-sm text-green-700">Tola sifati bo'yicha xulosalar</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-orange-600" />
                <div>
                  <h4 className="font-semibold text-orange-900">Ombor hujjatlari</h4>
                  <p className="text-sm text-orange-700">Nakladnoylar va hisobotlar</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Library */}
      <DocumentLibrary 
        showSearch={true}
        showFilters={true}
        compactMode={false}
        onDocumentDownload={(document) => {
          console.log('Document downloaded:', document.nameUz);
        }}
      />
    </div>
  );
}