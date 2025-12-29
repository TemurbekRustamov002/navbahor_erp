'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn, formatDateTime } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useDashboardStore, Activity as ActivityType } from '@/stores/dashboardStore'
import { useRouter } from 'next/navigation'
import {
  Scale,
  FlaskConical,
  Package,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Truck
} from 'lucide-react'

const iconMap = {
  package: Package,
  flask: FlaskConical,
  users: Users,
  truck: Truck,
  activity: Clock,
  scale: Scale
}

const statusIcons = {
  success: CheckCircle,
  warning: AlertCircle,
  error: AlertCircle,
  info: Clock
}

export function RecentActivity() {
  const recentActivities = useDashboardStore(state => state.recentActivities)
  const fetchDashboardData = useDashboardStore(state => state.fetchDashboardData)

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return (
    <Card className="card-premium h-full border-none shadow-xl">
      <CardHeader className="border-b border-border p-5">
        <CardTitle className="text-label-premium flex items-center gap-2">
          <div className="w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(11,174,74,0.5)]" />
          So&apos;nggi faoliyat
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="space-y-1">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => {
              const StatusIcon = statusIcons[activity.status as keyof typeof statusIcons] || Clock
              const Icon = iconMap[activity.type as keyof typeof iconMap] || Clock

              return (
                <div key={activity.id} className="group relative flex items-start p-4 hover:bg-primary/[0.03] rounded-2xl transition-all duration-300 cursor-default">
                  <div className={cn(
                    "mt-0.5 p-3 rounded-xl border border-white/10 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                    activity.status === 'success' ? 'bg-primary/10 text-primary' :
                      activity.status === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                        activity.status === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="ml-5 flex-1 min-w-0 border-b border-border pb-4 last:border-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[14px] font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {activity.title}
                      </p>
                      <div className="flex items-center ml-3 bg-secondary px-2.5 py-1 rounded-lg border border-border whitespace-nowrap">
                        <StatusIcon className={cn(
                          "h-3.5 w-3.5 mr-1.5",
                          activity.status === 'success' ? 'text-primary' :
                            activity.status === 'warning' ? 'text-amber-500' :
                              activity.status === 'error' ? 'text-destructive' : 'text-primary'
                        )} />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {formatDateTime(activity.time)}
                        </span>
                      </div>
                    </div>
                    <p className="text-[13px] font-medium text-muted-foreground mt-2 leading-relaxed italic opacity-70">
                      {activity.description}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              Hozircha faoliyat yo'q
            </div>
          )}
        </div>

        <div className="p-4 mt-2">
          <Button variant="outline" className="w-full h-12 rounded-xl border-border hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all">
            Barcha faoliyatni ko&apos;rish
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
