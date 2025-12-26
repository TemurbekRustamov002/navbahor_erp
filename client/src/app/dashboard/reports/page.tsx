'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useState } from 'react'
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  BarChart3, 
  PieChart,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react'

const reportTypes = [
  {
    id: 'production',
    title: 'Ishlab chiqarish hisoboti',
    description: 'Kunlik, haftalik va oylik ishlab chiqarish ma\'lumotlari',
    icon: BarChart3,
    color: 'bg-blue-500'
  },
  {
    id: 'sales',
    title: 'Sotuv hisoboti', 
    description: 'Mijozlar, buyurtmalar va daromad tahlili',
    icon: DollarSign,
    color: 'bg-green-500'
  },
  {
    id: 'inventory',
    title: 'Ombor hisoboti',
    description: 'Inventar holati va harakatlar tarixи',
    icon: Package,
    color: 'bg-purple-500'
  },
  {
    id: 'quality',
    title: 'Sifat hisoboti',
    description: 'Laboratoriya testlari va sifat ko\'rsatkichlari',
    icon: CheckCircle,
    color: 'bg-orange-500'
  },
  {
    id: 'users',
    title: 'Foydalanuvchilar hisoboti',
    description: 'Foydalanuvchi faolligi va tizimga kirish statistikasi',
    icon: Users,
    color: 'bg-indigo-500'
  },
  {
    id: 'performance',
    title: 'Samaradorlik hisoboti',
    description: 'Tizim va jarayon samaradorligi tahlili',
    icon: TrendingUp,
    color: 'bg-red-500'
  }
]

const recentReports = [
  {
    id: 'RPT-001',
    title: 'Yanvar oyi ishlab chiqarish hisoboti',
    type: 'production',
    createdAt: '2024-01-20 09:30',
    createdBy: 'Admin',
    size: '2.4 MB',
    status: 'completed'
  },
  {
    id: 'RPT-002',
    title: 'Haftalik sifat nazorati',
    type: 'quality', 
    createdAt: '2024-01-19 16:15',
    createdBy: 'Rahimov C.',
    size: '890 KB',
    status: 'completed'
  },
  {
    id: 'RPT-003',
    title: 'Mijozlar sotuv hisoboti',
    type: 'sales',
    createdAt: '2024-01-18 14:20',
    createdBy: 'Toshmatova B.',
    size: '1.8 MB', 
    status: 'completed'
  }
]

export default function ReportsPage() {
  const [selectedReportType, setSelectedReportType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = async () => {
    if (!selectedReportType) return
    
    setIsGenerating(true)
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGenerating(false)
    
    // Here you would typically call an API to generate the report
    alert('Hisobot muvaffaqiyatli yaratildi!')
  }

  const getReportTypeColor = (type: string) => {
    const reportType = reportTypes.find(t => t.id === type)
    return reportType?.color || 'bg-gray-500'
  }

  const getReportTypeName = (type: string) => {
    const reportType = reportTypes.find(t => t.id === type)
    return reportType?.title || type
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hisobotlar</h1>
          <p className="text-gray-600 mt-1">Tizim hisobotlarini yaratish va boshqarish</p>
        </div>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Yangi hisobot yaratish
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Report Type Selection */}
            <div>
              <Label className="text-base font-medium mb-4 block">Hisobot turini tanlang:</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportTypes.map((reportType) => {
                  const IconComponent = reportType.icon
                  return (
                    <div
                      key={reportType.id}
                      onClick={() => setSelectedReportType(reportType.id)}
                      className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                        selectedReportType === reportType.id 
                          ? 'border-nb-green bg-nb-green/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg ${reportType.color} text-white`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{reportType.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{reportType.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Date Range */}
            {selectedReportType && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFrom">Boshlanish sanasi</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo">Tugash sanasi</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Generate Button */}
            {selectedReportType && (
              <div className="flex justify-end">
                <Button 
                  onClick={handleGenerateReport}
                  disabled={isGenerating || !dateFrom || !dateTo}
                  loading={isGenerating}
                  className="bg-nb-green hover:bg-nb-green/90"
                >
                  {isGenerating ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Hisobot yaratilmoqda...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Hisobot yaratish
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            So'nggi hisobotlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getReportTypeColor(report.type)} text-white`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{report.title}</h3>
                      <p className="text-sm text-gray-600">{report.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Tayyor
                    </span>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Yuklash
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="text-gray-500">Turi:</span>
                    <p className="font-medium">{getReportTypeName(report.type)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Yaratildi:</span>
                    <p className="font-medium">{report.createdAt}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Yaratuvchi:</span>
                    <p className="font-medium">{report.createdBy}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Hajmi:</span>
                    <p className="font-medium">{report.size}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Bu oy yaratilgan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">47</div>
            <div className="text-sm text-green-600">+12% o'tgan oyga nisbatan</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Jami hisobotlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">234</div>
            <div className="text-sm text-gray-600">Barcha vaqt davomida</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Eng ko'p ishlatiladigan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">Ishlab chiqarish</div>
            <div className="text-sm text-gray-600">Hisobot turi</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}