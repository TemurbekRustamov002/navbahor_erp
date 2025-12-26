'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import {
  Scale,
  FlaskConical,
  Package,
  Warehouse,
  Users,
  FileText,
  Plus,
  Eye,
  ArrowRight
} from 'lucide-react'

const quickActions: Record<string, any[]> = {
  ADMIN: [
    {
      title: 'Tizim monitori',
      description: 'Barcha modullar holatini ko\'rish',
      icon: Eye,
      action: '/dashboard/monitor',
      color: 'bg-indigo-500 shadow-indigo-200'
    },
    {
      title: 'Hisobot yaratish',
      description: 'Yangi hisobot generatsiya qilish',
      icon: FileText,
      action: '/dashboard/reports/create',
      color: 'bg-emerald-500 shadow-emerald-200'
    },
    {
      title: 'Foydalanuvchi qo\'shish',
      description: 'Yangi operator yoki mutaxassis',
      icon: Plus,
      action: '/dashboard/admin/users/create',
      color: 'bg-violet-500 shadow-violet-200'
    }
  ],
  OPERATOR: [
    {
      title: 'Yangi o\'lchash',
      description: 'Tarozi orqali o\'lchash',
      icon: Scale,
      action: '/dashboard/tarozi',
      color: 'bg-blue-500 shadow-blue-200'
    },
    {
      title: 'Bugungi natijalar',
      description: 'O\'lchash natijalarini ko\'rish',
      icon: Eye,
      action: '/dashboard/tarozi/results',
      color: 'bg-teal-500 shadow-teal-200'
    }
  ],
  LAB_ANALYST: [
    {
      title: 'Yangi test',
      description: 'Namuna uchun yangi test',
      icon: FlaskConical,
      action: '/dashboard/labaratoriya/test',
      color: 'bg-pink-500 shadow-pink-200'
    },
    {
      title: 'Test natijalari',
      description: 'Barcha test natijalari',
      icon: Eye,
      action: '/dashboard/labaratoriya/results',
      color: 'bg-cyan-500 shadow-cyan-200'
    }
  ],
  WAREHOUSE_MANAGER: [
    {
      title: 'Mahsulot qabuli',
      description: 'Yangi qabul qilish',
      icon: Plus,
      action: '/dashboard/ombor/receive',
      color: 'bg-amber-500 shadow-amber-200'
    },
    {
      title: 'Jo\'natishlar',
      description: 'Bugungi jo\'natishlar',
      icon: Package,
      action: '/dashboard/ombor/shipments',
      color: 'bg-lime-500 shadow-lime-200'
    }
  ],
  PRODUCTION_MANAGER: [
    {
      title: 'Rejalar',
      description: 'Ishlab chiqarish rejasi',
      icon: Package,
      action: '/dashboard/production/plans',
      color: 'bg-rose-500 shadow-rose-200'
    },
    {
      title: 'Samaradorlik',
      description: 'Tahlil va monitoring',
      icon: Eye,
      action: '/dashboard/production/efficiency',
      color: 'bg-orange-500 shadow-orange-200'
    }
  ],
  CUSTOMER_MANAGER: [
    {
      title: 'Yangi mijoz',
      description: 'Mijoz qo\'shish',
      icon: Plus,
      action: '/dashboard/mijozlar/create',
      color: 'bg-sky-500 shadow-sky-200'
    },
    {
      title: 'Mijozlar',
      description: 'Barcha mijozlar',
      icon: Users,
      action: '/dashboard/mijozlar',
      color: 'bg-emerald-500 shadow-emerald-200'
    }
  ]
}

export function QuickActions() {
  const { user } = useAuthStore()
  const router = useRouter()

  const userActions = user?.role ? quickActions[user.role.toUpperCase()] || [] : []

  const handleActionClick = (action: string) => {
    router.push(action)
  }

  return (
    <Card className="card-premium h-full border-none shadow-xl">
      <CardHeader className="border-b border-border p-5">
        <CardTitle className="text-label-premium flex items-center gap-2">
          <div className="w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(11,174,74,0.5)]" />
          Tezkor harakatlar
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="space-y-1">
          {userActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action.action)}
              className="w-full flex items-center p-4 hover:bg-primary/[0.03] rounded-2xl transition-all duration-300 group text-left"
            >
              <div className={cn(
                "p-3 rounded-xl text-white shadow-md transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-primary/20 bg-primary"
              )}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <h4 className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  {action.title}
                </h4>
                <p className="text-[11px] font-medium text-muted-foreground mt-1 line-clamp-1 italic opacity-70">
                  {action.description}
                </p>
              </div>
              <div className="ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}