'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  DollarSign,
  Activity,
  Scale,
  FlaskConical,
  LucideIcon
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useDashboardStore } from '@/stores/dashboardStore'

interface StatItem {
  title: string
  value: string
  unit: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: LucideIcon
  color: string
  bgColor: string
}



export function StatsGrid() {
  const { user } = useAuthStore()
  const stats = useDashboardStore(state => state.stats)
  const fetchDashboardData = useDashboardStore(state => state.fetchDashboardData)
  const isLoading = useDashboardStore(state => state.isLoading)

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (isLoading && !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-40 bg-white/50 rounded-3xl border border-slate-100" />
        ))}
      </div>
    )
  }

  // Map backend stats to UI tiles based on role
  const getRoleStats = (): StatItem[] => {
    if (!stats) return []

    switch (user?.role) {
      case 'ADMIN':
        return [
          {
            title: 'Hajm (Ombor)',
            value: stats.totalInventoryWeight.toLocaleString(),
            unit: 'kg',
            change: '+12%',
            changeType: 'increase',
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          },
          {
            title: 'Mijozlar',
            value: stats.customers.toString(),
            unit: 'ta',
            change: '+4',
            changeType: 'increase',
            icon: Users,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          },
          {
            title: 'Sotilgan (Jo\'natma)',
            value: stats.shipments.toString(),
            unit: 'ta',
            change: '+8.5%',
            changeType: 'increase',
            icon: DollarSign,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
          },
          {
            title: 'Foydalanuvchilar',
            value: stats.users.toString(),
            unit: 'kishi',
            change: '-2%',
            changeType: 'decrease',
            icon: Activity,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
          }
        ]
      case 'WAREHOUSE_MANAGER':
        return [
          {
            title: 'Ombordagi zaxira',
            value: stats.totalInventoryWeight.toLocaleString(),
            unit: 'kg',
            change: '-340kg',
            changeType: 'decrease',
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          },
          {
            title: 'Toylar soni',
            value: stats.toys.toString(),
            unit: 'dona',
            change: '+56',
            changeType: 'increase',
            icon: Package,
            color: 'text-primary',
            bgColor: 'bg-primary/5'
          },
          {
            title: 'Bugun yuborildi',
            value: stats.shipments.toString(),
            unit: 'ta',
            change: '+3',
            changeType: 'increase',
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          },
          {
            title: 'Faol Orderlar',
            value: stats.orders.toString(),
            unit: 'ta',
            change: '+2',
            changeType: 'increase',
            icon: Scale,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          }
        ]
      default:
        // Generic stats for others
        return [
          {
            title: 'Jami Markalar',
            value: stats.markas.toString(),
            unit: 'ta',
            change: '+2',
            changeType: 'increase',
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          },
          {
            title: 'Jami Toylar',
            value: stats.toys.toString(),
            unit: 'dona',
            change: '+45',
            changeType: 'increase',
            icon: Scale,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          }
        ]
    }
  }

  const userStats = getRoleStats()

  if (userStats.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-700">
      {userStats.map((stat: StatItem, index: number) => (
        <Card key={index} className="card-premium group hover:-translate-y-2 transition-all duration-500 overflow-hidden border-none shadow-xl">
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:rotate-[15deg] shadow-md",
                "bg-primary/10 text-primary"
              )}>
                <stat.icon className="h-7 w-7" />
              </div>
              <div className={cn(
                "flex items-center px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest",
                stat.changeType === 'increase'
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
              )}>
                {stat.changeType === 'increase' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {stat.change}
              </div>
            </div>

            <div className="mt-8">
              <p className="text-label-premium">
                {stat.title}
              </p>
              <div className="flex items-baseline mt-2 gap-1.5">
                <h3 className="text-3xl font-black text-foreground tracking-tight tabular-nums">
                  {stat.value}
                </h3>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest italic opacity-70">
                  {stat.unit}
                </span>
              </div>
            </div>

            {/* Premium Progress Indicator */}
            <div className="mt-6 relative h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out shadow-sm bg-gradient-to-r from-primary to-emerald-400"
              )} style={{ width: '65%' }} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
