'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useState } from 'react'
import { 
  Package, 
  PackageCheck, 
  Truck, 
  QrCode, 
  Search, 
  Plus, 
  Edit,
  Printer,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Filter
} from 'lucide-react'

const packagingData = [
  {
    id: 'PKG-001',
    batchNumber: 'BATCH-2024-001',
    productType: 'Tola A sinf',
    quantity: 250,
    packageSize: 'Standart (50kg)',
    packagesCount: 5,
    status: 'packaging',
    qrCode: 'QR-PKG-001-2024',
    startTime: '2024-01-20 08:00',
    estimatedCompletion: '2024-01-20 10:30',
    operator: 'Karimov A.',
    qualityCheck: 'pending'
  },
  {
    id: 'PKG-002', 
    batchNumber: 'BATCH-2024-002',
    productType: 'Lint B sinf',
    quantity: 180,
    packageSize: 'Kichik (25kg)',
    packagesCount: 7,
    status: 'completed',
    qrCode: 'QR-PKG-002-2024',
    startTime: '2024-01-20 06:00',
    estimatedCompletion: '2024-01-20 08:00',
    operator: 'Toshmatov B.',
    qualityCheck: 'approved'
  },
  {
    id: 'PKG-003',
    batchNumber: 'BATCH-2024-003', 
    productType: 'Siklon mahsuloti',
    quantity: 320,
    packageSize: 'Katta (100kg)',
    packagesCount: 3,
    status: 'quality_check',
    qrCode: 'QR-PKG-003-2024',
    startTime: '2024-01-20 09:00',
    estimatedCompletion: '2024-01-20 12:00',
    operator: 'Rahimova C.',
    qualityCheck: 'in_progress'
  }
]

const packageSizes = [
  { name: 'Kichik (25kg)', capacity: 25, code: 'SM' },
  { name: 'Standart (50kg)', capacity: 50, code: 'ST' }, 
  { name: 'Katta (100kg)', capacity: 100, code: 'LG' },
  { name: 'Maxsus (75kg)', capacity: 75, code: 'SP' }
]

export default function PackagesPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [showNewPackageForm, setShowNewPackageForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'packaging': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800' 
      case 'quality_check': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'packaging': return 'Qadoqlanmoqda'
      case 'completed': return 'Yakunlandi'
      case 'quality_check': return 'Sifat nazorati'
      default: return 'Noma\'lum'
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'approved': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'in_progress': return 'text-blue-600'
      case 'rejected': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const filteredPackages = packagingData.filter(pkg => 
    filterStatus === 'all' || pkg.status === filterStatus
  )

  const stats = {
    totalPackages: packagingData.length,
    inProgress: packagingData.filter(p => p.status === 'packaging').length,
    completed: packagingData.filter(p => p.status === 'completed').length,
    qualityCheck: packagingData.filter(p => p.status === 'quality_check').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Qadoqlash</h1>
          <p className="text-gray-600 mt-1">Tayyor mahsulot qadoqlash va yuborish</p>
        </div>
        <Button 
          onClick={() => setShowNewPackageForm(true)}
          className="bg-nb-green hover:bg-nb-green/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yangi qadoqlash
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Jami paketlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalPackages}</div>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Package className="w-4 h-4 mr-1" />
              Barcha paketlar
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Jarayonda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Clock className="w-4 h-4 mr-1" />
              Qadoqlanmoqda
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Yakunlangan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <CheckCircle className="w-4 h-4 mr-1" />
              Tayyor
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sifat nazorati</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.qualityCheck}</div>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Tekshiruvda
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtrlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="status-filter">Holat:</Label>
              <select 
                id="status-filter"
                className="border rounded px-3 py-1 text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Barchasi</option>
                <option value="packaging">Qadoqlanmoqda</option>
                <option value="quality_check">Sifat nazorati</option>
                <option value="completed">Yakunlangan</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Qidirish (ID, batch, operator...)"
                className="w-64"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Qadoqlash ro'yxati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPackages.map((pkg) => (
              <div 
                key={pkg.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPackage(pkg.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-nb-green/10 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-nb-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{pkg.id}</h3>
                      <p className="text-sm text-gray-600">{pkg.batchNumber}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pkg.status)}`}>
                    {getStatusText(pkg.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Mahsulot:</span>
                    <p className="font-medium">{pkg.productType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Miqdor:</span>
                    <p className="font-medium">{pkg.quantity} kg</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Paketlar:</span>
                    <p className="font-medium">{pkg.packagesCount} × {pkg.packageSize}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Operator:</span>
                    <p className="font-medium">{pkg.operator}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Boshlandi: {pkg.startTime}</span>
                    <span>Tugash: {pkg.estimatedCompletion}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${getQualityColor(pkg.qualityCheck)}`}>
                      Sifat: {pkg.qualityCheck === 'approved' ? 'Tasdiqlangan' : 
                              pkg.qualityCheck === 'pending' ? 'Kutilmoqda' : 
                              pkg.qualityCheck === 'in_progress' ? 'Jarayonda' : 'Rad etilgan'}
                    </span>
                    <Button size="sm" variant="outline" className="text-xs">
                      <QrCode className="w-3 h-3 mr-1" />
                      QR
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Printer className="w-3 h-3 mr-1" />
                      Chop
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Package Sizes Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Paket o'lchamlari
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {packageSizes.map((size) => (
              <div key={size.code} className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold text-nb-green">{size.capacity}kg</div>
                <div className="text-sm text-gray-600">{size.name}</div>
                <div className="text-xs text-gray-500 mt-1">Kod: {size.code}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}