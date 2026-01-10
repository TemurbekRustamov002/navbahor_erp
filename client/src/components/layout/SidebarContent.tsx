'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useLanguageStore } from '@/stores/languageStore'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageToggle } from '@/components/ui/LanguageSelector'
import {
  Home, BarChart3, Package, Package2, Users, Settings, Scale, FlaskConical,
  Warehouse, ShoppingCart, FileText, Activity, Shield, FolderOpen, LogOut, Bell
} from 'lucide-react'
import { Permission, hasPermission } from '@/lib/permissions'

const getNavigation = (t: (key: string) => string) => [
  {
    name: t('nav.dashboard') || 'Dashboard',
    href: '/dashboard',
    icon: Home,
    permission: Permission.DASHBOARD_VIEW
  },
  {
    name: t('nav.marka') || 'Markalar',
    href: '/dashboard/marka',
    icon: Package,
    permission: Permission.MARKA_VIEW
  },
  {
    name: t('nav.scale') || 'Tarozi',
    href: '/dashboard/tarozi',
    icon: Scale,
    permission: Permission.SCALE_VIEW
  },
  {
    name: t('nav.lab') || 'Laboratoriya',
    href: '/dashboard/labaratoriya',
    icon: FlaskConical,
    permission: Permission.LAB_VIEW
  },
  {
    name: t('nav.warehouse') || 'Ombor',
    href: '/dashboard/ombor',
    icon: Warehouse,
    permission: Permission.WAREHOUSE_VIEW
  },
  {
    name: t('nav.customers') || 'Mijozlar',
    href: '/dashboard/mijozlar',
    icon: Users,
    permission: Permission.CUSTOMER_VIEW
  },
  {
    name: t('nav.reports') || 'Hisobotlar',
    href: '/dashboard/reports',
    icon: FileText,
    permission: Permission.REPORTS_VIEW
  },
  {
    name: t('nav.admin') || 'Admin',
    href: '/dashboard/admin',
    icon: Shield,
    permission: Permission.ADMIN_SYSTEM
  },
  {
    name: t('nav.settings') || 'Sozlamalar',
    href: '/dashboard/settings',
    icon: Settings,
    permission: Permission.SETTINGS_VIEW
  }
]

interface SidebarContentProps {
  isExpanded?: boolean
  isCollapsed?: boolean
  isHovered?: boolean
}

export function SidebarContent({ isExpanded = true, isCollapsed = false, isHovered = false }: SidebarContentProps) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { t } = useLanguageStore()

  const navigation = getNavigation(t)
  const filteredNavigation = navigation.filter(item => user && hasPermission(user.role as any, item.permission))

  return (
    <div className="flex flex-col h-full">
      {/* Logo Section - Clean & Centered */}
      <div className="flex h-16 shrink-0 items-center justify-center">
        <div className="flex items-center group cursor-pointer">
          <div className="w-10 h-10 bg-primary/10 rounded-[14px] flex items-center justify-center shadow-sm border border-primary/20 group-hover:bg-primary/20 transition-all duration-500">
            <Scale className="h-5 w-5 text-primary" />
          </div>
          {isExpanded && (
            <div className="ml-3 transition-opacity duration-500">
              <h2 className="text-lg font-black tracking-tighter text-foreground whitespace-nowrap">
                NAVBAHOR<span className="text-primary">.ERP</span>
              </h2>
            </div>
          )}
        </div>
      </div>

      {/* Navigation - Senior UI Polish */}
      <nav className="flex-1 mt-8">
        <ul role="list" className="space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name} className="flex justify-center">
                <Link
                  href={item.href}
                  className={cn(
                    'group relative flex items-center rounded-xl transition-all duration-300 font-medium text-sm',
                    isExpanded
                      ? 'w-full gap-x-3 p-3'
                      : 'w-10 h-10 justify-center',
                    isActive
                      ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                  )}
                  title={!isExpanded ? item.name : undefined}
                >
                  {/* Active Indicator Bar - Left */}
                  {isActive && isExpanded && (
                    <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full -translate-x-2" />
                  )}

                  <item.icon className={cn(
                    'h-5 w-5 shrink-0 transition-all duration-300',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-foreground group-hover:scale-110'
                  )} />

                  <span className={cn(
                    "transition-all duration-500 whitespace-nowrap overflow-hidden",
                    isExpanded ? "opacity-100 translate-x-0 w-auto ml-1" : "opacity-0 -translate-x-10 w-0"
                  )}>
                    {item.name}
                  </span>

                  {/* Active Glow for collapsed mode */}
                  {isActive && !isExpanded && (
                    <div className="absolute inset-0 bg-primary/20 rounded-xl animate-pulse -z-10" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Refined Account & Actions Section */}
      <div className="mt-auto pt-6 border-t border-border/50 pb-6 space-y-4">
        {/* App Actions - Notifications, Theme, Lang */}
        <div className={cn(
          "flex items-center rounded-2xl p-1.5 gap-1 transition-all duration-300",
          isExpanded ? "bg-muted/30 justify-between px-2" : "flex-col justify-center bg-transparent"
        )}>
          <div className={cn("flex gap-1", !isExpanded && "flex-col items-center")}>
            <ThemeToggle size="sm" />
            <LanguageToggle />
          </div>

          <div className={cn("flex gap-1", !isExpanded && "flex-col items-center mt-2")}>
            {/* <button
              className="relative p-2 text-muted-foreground hover:text-primary transition-all rounded-xl hover:bg-background"
              title="Bildirishnomalar"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
              </span>
            </button> */}

            <button
              onClick={() => logout()}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
              title="Chiqish"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className={cn(
          "relative group transition-all duration-300 overflow-hidden",
          isExpanded ? "bg-card border border-border/50 p-2.5 rounded-2xl shadow-sm hover:border-primary/30" : "flex justify-center"
        )}>
          <div className={cn("flex items-center w-full", !isExpanded && "justify-center")}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/80 to-emerald-700 flex items-center justify-center shadow-lg shadow-primary/10 ring-1 ring-white/10 shrink-0">
              <span className="text-xs font-black text-white uppercase">{user?.username?.[0] || '?'}</span>
            </div>
            {isExpanded && (
              <div className="ml-3 min-w-0">
                <p className="text-sm font-bold text-foreground truncate leading-none">
                  {user?.fullName || user?.username}
                </p>
                <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mt-1.5 leading-none">
                  {user?.role}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
