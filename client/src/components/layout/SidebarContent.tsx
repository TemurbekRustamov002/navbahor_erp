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
      {/* Logo Section - Slimmer */}
      <div className="flex h-16 shrink-0 items-center px-1">
        <div className="flex items-center group cursor-pointer w-full">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shadow-sm border border-primary/20 group-hover:scale-105 transition-all">
            <Scale className="h-5 w-5 text-primary" />
          </div>
          <div className={cn(
            "ml-3 transition-all duration-300 overflow-hidden",
            isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
          )}>
            <h2 className="text-lg font-black tracking-tight text-foreground whitespace-nowrap">
              NAVBAHOR<span className="text-primary">.ERP</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Navigation - Senior UI Polish */}
      <nav className="flex-1 mt-6 px-1">
        <ul role="list" className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-x-3 rounded-xl p-3 transition-all duration-300 font-medium text-sm',
                    isActive
                      ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                    !isExpanded && 'justify-center mx-1 px-2'
                  )}
                  title={!isExpanded ? item.name : undefined}
                >
                  {/* Active Indicator Bar
                  {isActive && (
                    <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full -translate-x-3" />
                  )} */}

                  <item.icon className={cn(
                    'h-5 w-10 shrink-0 transition-transform duration-300 group-hover:scale-110',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )} />

                  <span className={cn(
                    "transition-all duration-300 whitespace-nowrap ",
                    isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 w-0"
                  )}>
                    {item.name}
                  </span>

                  {/* Notification Dot Placeholder or Status
                  {isActive && isExpanded && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-lg shadow-primary/50" />
                  )} */}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Refined Account & Actions Section */}
      <div className="mt-auto pt-6 border-t border-border pb-6 space-y-4">
        {/* App Actions - Notifications, Theme, Lang */}
        <div className={cn(
          "flex items-center glass-panel rounded-xl p-1.5 shadow-sm gap-1",
          isExpanded ? "justify-between" : "flex-col justify-center"
        )}>
          <div className={cn("flex gap-1", !isExpanded && "flex-col")}>
            <ThemeToggle size="sm" />
            <LanguageToggle />
          </div>

          <div className={cn("flex gap-1", !isExpanded && "flex-col")}>
            <button
              className="relative p-2 text-muted-foreground hover:text-primary transition-all bg-secondary/50 hover:bg-background rounded-lg border border-transparent hover:border-border"
              title="Bildirishnomalar"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </button>

            <button
              onClick={() => logout()}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
              title="Chiqish"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className={cn(
          "relative group transition-all duration-300",
          isExpanded ? "bg-card border border-border p-3 rounded-2xl shadow-sm" : "p-1"
        )}>
          <div className={cn("flex items-center", !isExpanded && "justify-center")}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-lg shadow-primary/20 ring-2 ring-background shrink-0">
              <span className="text-xs font-black text-white uppercase">{user?.username?.[0] || '?'}</span>
            </div>
            {isExpanded && (
              <div className="ml-3 min-w-0">
                <p className="text-sm font-bold text-foreground truncate leading-none">
                  {user?.fullName || user?.username}
                </p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1.5 leading-none">
                  {user?.role}
                </p>
              </div>
            )}
          </div>

          {isExpanded && (
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Settings className="w-3.5 h-3.5 text-muted-foreground hover:text-primary cursor-pointer" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
