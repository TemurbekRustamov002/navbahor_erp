'use client'

import { useAuthStore } from '@/stores/authStore'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { SystemStatus } from '@/components/dashboard/SystemStatus'
import { Activity } from 'lucide-react'
import { QuickDocumentAccess } from '@/components/documents'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Xayrli tong'
    if (hour < 18) return 'Xayrli kun'
    return 'Xayrli kech'
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Brand-Level Welcome Section */}
      <div className="relative overflow-hidden rounded-[2rem] glass-card p-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/30 pointer-events-none" />
        <div className="absolute -right-24 -top-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />

        <div className="relative p-8 lg:p-10 bg-white/40 dark:bg-slate-900/40 rounded-[1.8rem]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-primary/20 backdrop-blur-md shadow-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{getWelcomeMessage()}</span>
              </div>

              <h1 className="text-3xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight">
                Xush kelibsiz, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-700">
                  {user?.fullName || user?.username}
                </span>
              </h1>

              <p className="text-muted-foreground text-sm lg:text-base font-medium max-w-lg leading-relaxed">
                Navbahor Tekstil sanoatining raqamli boshqaruv markaziga xush kelibsiz. Tizim to&apos;liq funksional holatda.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <div className="px-4 py-2 rounded-xl bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md flex items-center gap-2 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Departament:</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{user?.department || 'Markaziy'}</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md flex items-center gap-2 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Vaqt:</span>
                  <span className="text-xs font-black text-primary tabular-nums">
                    {new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden xl:block shrink-0 relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-white to-slate-50 border border-white/60 shadow-xl relative flex items-center justify-center">
                <Activity className="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>

      {/* Quick Document Access - removed per request */}
      {/* <QuickDocumentAccess /> */}

      {/* System Status */}
      <SystemStatus />
    </div>
  )
}