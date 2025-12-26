'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useState } from 'react'
import { 
  Package, 
  Factory, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  BarChart3
} from 'lucide-react'

const productionLines = [
  {
    id: 'LINE-001',
    name: 'Asosiy Qayta Ishlash Liniyasi',
    status: 'active',
    efficiency: 94.2,
    todayProduction: 2450,
    target: 2600,
    operators: 8,
    lastMaintenance: '2024-01-15',
    issues: []
  },
  {
    id: 'LINE-002', 
    name: 'Siklon Ajratish Liniyasi',
    status: 'maintenance',
    efficiency: 0,
    todayProduction: 0,
    target: 800,
    operators: 0,
    lastMaintenance: '2024-01-20',
    issues: ['Conveyor belt replacement']
  },
  {
    id: 'LINE-003',
    name: 'Tola Tozalash Liniyasi',
    status: 'active',
    efficiency: 87.5,
    todayProduction: 1680,
    target: 1920,
    operators: 6,
    lastMaintenance: '2024-01-10',
    issues: ['Minor vibration in Unit-3']
  }
]

const currentShifts = [
  {
    id: 'SHIFT-001',
    name: 'Ertalabki Smena',
    time: '06:00 - 14:00',
    status: 'active',
    workers: 24,
    supervisor: 'Abdulla Karimov',
    production: 1250
  },
  {
    id: 'SHIFT-002',
    name: 'Kunlik Smena', 
    time: '14:00 - 22:00',
    status: 'upcoming',
    workers: 26,
    supervisor: 'Gulnora Rahimova',
    production: 0
  },
  {
    id: 'SHIFT-003',
    name: 'Tungi Smena',
    time: '22:00 - 06:00',
    status: 'completed',
    workers: 20,
    supervisor: 'Bobur Ergashev',
    production: 1200
  }
]

export default function ProductionPage() {
  const [selectedLine, setSelectedLine] = useState(productionLines[0])
  const [newOrder, setNewOrder] = useState({
    productType: 'tola',
    quantity: '',
    priority: 'normal',
    deadline: ''
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'maintenance': return 'text-yellow-600 bg-yellow-100'
      case 'stopped': return 'text-red-600 bg-red-100'
      case 'upcoming': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Faol'
      case 'maintenance': return 'Ta\'mirlash'
      case 'stopped': return 'To\'xtatilgan'
      case 'upcoming': return 'Keyingi'
      case 'completed': return 'Yakunlangan'
      default: return 'Noma\'lum'
    }
  }

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Creating production order:', newOrder)
    alert('Ishlab chiqarish buyurtmasi yaratildi!')
    setNewOrder({
      productType: 'tola',
      quantity: '',
      priority: 'normal', 
      deadline: ''
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ishlab Chiqarish</h1>
        <p className="text-gray-600 mt-2">Ishlab chiqarish liniyalari va jarayonlar boshqaruvi</p>
      </div>

      {/* Production Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-50">
                <Factory className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Bugungi Ishlab Chiqarish</p>
                <p className="text-2xl font-bold text-gray-900">4,130 kg</p>
                <p className="text-xs text-green-600">+12% kechaga nisbatan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-50">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">O'rtacha Samaradorlik</p>
                <p className="text-2xl font-bold text-gray-900">90.9%</p>
                <p className="text-xs text-blue-600">Maqsad: 85%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-50">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Faol Ishchilar</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
                <p className="text-xs text-purple-600">3 smenada</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-yellow-50">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Texnik To'xtatishlar</p>
                <p className="text-2xl font-bold text-gray-900">45 min</p>
                <p className="text-xs text-yellow-600">Bugun</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Lines & New Order */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Lines */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ishlab Chiqarish Liniyalari</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productionLines.map((line) => (
                  <div 
                    key={line.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedLine.id === line.id ? 'border-nb-green bg-green-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedLine(line)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Factory className="h-5 w-5 text-gray-600" />
                        <h3 className="font-medium text-gray-900">{line.name}</h3>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(line.status)}`}>
                        {getStatusText(line.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Samaradorlik</p>
                        <p className="font-medium">{line.efficiency}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Bugungi ishlab chiqarish</p>
                        <p className="font-medium">{line.todayProduction} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Operatorlar</p>
                        <p className="font-medium">{line.operators} kishi</p>
                      </div>
                    </div>

                    {line.issues.length > 0 && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-yellow-800 font-medium">Muammolar:</p>
                          {line.issues.map((issue, index) => (
                            <p key={index} className="text-xs text-yellow-700">{issue}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Production Order */}
        <Card>
          <CardHeader>
            <CardTitle>Yangi Buyurtma</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <Label htmlFor="productType">Mahsulot Turi</Label>
                <select
                  id="productType"
                  value={newOrder.productType}
                  onChange={(e) => setNewOrder({...newOrder, productType: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="tola">Tola</option>
                  <option value="lint">Lint</option>
                  <option value="siklon">Siklon</option>
                  <option value="uluk">Uluk</option>
                </select>
              </div>

              <div>
                <Label htmlFor="quantity">Miqdor (kg)</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newOrder.quantity}
                  onChange={(e) => setNewOrder({...newOrder, quantity: e.target.value})}
                  placeholder="Masalan: 1000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="priority">Muhimlik Darajasi</Label>
                <select
                  id="priority"
                  value={newOrder.priority}
                  onChange={(e) => setNewOrder({...newOrder, priority: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="low">Past</option>
                  <option value="normal">O'rtacha</option>
                  <option value="high">Yuqori</option>
                  <option value="urgent">Shoshilinch</option>
                </select>
              </div>

              <div>
                <Label htmlFor="deadline">Muddat</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newOrder.deadline}
                  onChange={(e) => setNewOrder({...newOrder, deadline: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full">
                <Package className="mr-2 h-4 w-4" />
                Buyurtma Yaratish
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Current Shifts */}
      <Card>
        <CardHeader>
          <CardTitle>Smenalar Holati</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentShifts.map((shift) => (
              <div key={shift.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{shift.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shift.status)}`}>
                    {getStatusText(shift.status)}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vaqt:</span>
                    <span className="font-medium">{shift.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ishchilar:</span>
                    <span className="font-medium">{shift.workers} kishi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Supervisor:</span>
                    <span className="font-medium">{shift.supervisor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ishlab chiqarish:</span>
                    <span className="font-medium">{shift.production} kg</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}