'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import {
  Warehouse,
  Scale,
  Users,
  TestTube,
  Factory,
  Settings,
  BarChart3,
  Package,
  Smartphone
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const services = [
  {
    id: 'dashboard',
    title: 'Bosh sahifa',
    description: 'Umumiy statistika va tizim holati',
    icon: BarChart3,
    color: 'bg-blue-500',
    route: '/dashboard',
    isActive: true
  },
  {
    id: 'tarozi',
    title: 'Tarozi',
    description: 'Mahsulot tortish va nazorat',
    icon: Scale,
    color: 'bg-green-500',
    route: '/dashboard/tarozi',
    isActive: true
  },
  {
    id: 'mijozlar',
    title: 'Mijozlar',
    description: 'Mijozlar bazasi boshqaruvi',
    icon: Users,
    color: 'bg-purple-500',
    route: '/dashboard/mijozlar',
    isActive: true
  },
  {
    id: 'labaratoriya',
    title: 'Laboratoriya',
    description: 'Sifat nazorati va test natijalari',
    icon: TestTube,
    color: 'bg-orange-500',
    route: '/dashboard/labaratoriya',
    isActive: true
  },
  {
    id: 'ombor',
    title: 'Ombor',
    description: 'Inventar va zaxira boshqaruvi',
    icon: Warehouse,
    color: 'bg-indigo-500',
    route: '/dashboard/ombor',
    isActive: true
  },
  {
    id: 'production',
    title: 'Ishlab chiqarish',
    description: 'Ishlab chiqarish jarayonlari',
    icon: Factory,
    color: 'bg-red-500',
    route: '/dashboard/production',
    isActive: true
  },
  {
    id: 'packages',
    title: 'Qadoqlash',
    description: 'Tayyor mahsulot qadoqlash',
    icon: Package,
    color: 'bg-yellow-500',
    route: '/dashboard/packages',
    isActive: true
  },
  {
    id: 'reports',
    title: 'Hisobotlar',
    description: 'Tizim hisobotlari va tahlil',
    icon: BarChart3,
    color: 'bg-cyan-500',
    route: '/dashboard/reports',
    isActive: true
  },
  {
    id: 'admin',
    title: 'Administrator',
    description: 'Tizim va foydalanuvchilar boshqaruvi',
    icon: Settings,
    color: 'bg-red-500',
    route: '/dashboard/admin',
    isActive: true,
    adminOnly: true
  },
  {
    id: 'settings',
    title: 'Sozlamalar',
    description: 'Tizim va profil sozlamalari',
    icon: Settings,
    color: 'bg-gray-500',
    route: '/dashboard/settings',
    isActive: true
  },
  {
    id: 'scanner',
    title: 'Mobil Skaner',
    description: 'Qurilmalar uchun soddalashtirilgan terminal interfeysi',
    icon: Smartphone,
    color: 'bg-slate-900',
    route: '/scanner',
    isActive: true
  }
]

export function ServiceGrid() {
  const router = useRouter()
  const { user } = useAuthStore()

  const handleServiceClick = (service: typeof services[0]) => {
    if (service.isActive) {
      router.push(service.route)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {services.filter(service => !service.adminOnly || user?.role === 'ADMIN').map((service) => {
        const IconComponent = service.icon
        return (
          <Card
            key={service.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${service.isActive ? 'hover:border-nb-green' : 'opacity-60 cursor-not-allowed'
              }`}
            onClick={() => handleServiceClick(service)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${service.color} text-white`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-semibold text-gray-900 truncate">
                    {service.title}
                  </CardTitle>
                  {!service.isActive && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Tez orada
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-gray-600 leading-relaxed">
                {service.description}
              </p>
              <div className="mt-3">
                <Button
                  variant={service.isActive ? "default" : "secondary"}
                  size="sm"
                  className="w-full text-xs"
                  disabled={!service.isActive}
                >
                  {service.isActive ? 'Ochish' : 'Ishlab chiqilmoqda'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}