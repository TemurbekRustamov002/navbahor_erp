'use client'

import { useMemo } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Permission, filterPermittedItems } from '@/lib/permissions'
import { NavigationItem } from '@/types/auth'
import {
  Home,
  Scale,
  FlaskConical,
  Package,
  Users,
  Factory,
  BarChart3,
  Settings,
  Shield,
  Tag
} from 'lucide-react'

// Navigation items with permissions
const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Bosh sahifa',
    href: '/dashboard',
    icon: Home,
    permissions: [Permission.DASHBOARD_VIEW],
  },
  {
    id: 'scale',
    label: 'Tarozi',
    href: '/dashboard/tarozi',
    icon: Scale,
    permissions: [Permission.SCALE_VIEW, Permission.SCALE_OPERATE],
  },
  {
    id: 'marka',
    label: 'Markalar',
    href: '/dashboard/marka',
    icon: Tag,
    permissions: [Permission.MARKA_VIEW],
  },
  {
    id: 'lab',
    label: 'Laboratoriya',
    href: '/dashboard/labaratoriya',
    icon: FlaskConical,
    permissions: [Permission.LAB_VIEW],
  },
  {
    id: 'warehouse',
    label: 'Ombor',
    href: '/dashboard/ombor',
    icon: Package,
    permissions: [Permission.WAREHOUSE_VIEW],
  },
  {
    id: 'customers',
    label: 'Mijozlar',
    href: '/dashboard/mijozlar',
    icon: Users,
    permissions: [Permission.CUSTOMER_VIEW],
  },
  {
    id: 'production',
    label: 'Ishlab chiqarish',
    href: '/dashboard/production',
    icon: Factory,
    permissions: [Permission.PRODUCTION_VIEW],
  },
  {
    id: 'reports',
    label: 'Hisobotlar',
    href: '/dashboard/reports',
    icon: BarChart3,
    permissions: [Permission.REPORTS_VIEW],
  },
  {
    id: 'admin',
    label: 'Administrator',
    href: '/dashboard/admin',
    icon: Shield,
    permissions: [Permission.ADMIN_USERS, Permission.ADMIN_SYSTEM],
  },
  {
    id: 'settings',
    label: 'Sozlamalar',
    href: '/dashboard/settings',
    icon: Settings,
    permissions: [Permission.SETTINGS_VIEW],
  },
]

interface PermissionBasedNavigationProps {
  children: (items: NavigationItem[]) => React.ReactNode
}

export function PermissionBasedNavigation({ children }: PermissionBasedNavigationProps) {
  const { user, hasAnyPermission } = useAuthStore()

  const permittedItems = useMemo(() => {
    if (!user) return []

    const role = String(user.role || '').toUpperCase()

    // Hard role-based visibility overrides for clarity and correctness
    // Admin: all
    let items: NavigationItem[] | null = null
    if (role === 'ADMIN') items = NAVIGATION_ITEMS

    // Large lab worker: Marka + Lab (plus dashboard/settings)
    if (!items && (role === 'LAB' || role === 'LAB_ANALYST')) {
      items = NAVIGATION_ITEMS.filter(i => ['dashboard', 'marka', 'lab', 'reports', 'settings'].includes(i.id))
    }

    // Warehouse: Warehouse + Customers (plus dashboard/settings, shipments)
    if (!items && (role === 'WAREHOUSE' || role === 'WAREHOUSE_MANAGER')) {
      items = NAVIGATION_ITEMS.filter(i => ['dashboard', 'warehouse', 'customers', 'shipments', 'settings'].includes(i.id))
    }

    // Scale operator: only Tarozi (plus dashboard/settings)
    if (!items && (role === 'SCALE' || role === 'OPERATOR')) {
      items = NAVIGATION_ITEMS.filter(i => ['dashboard', 'scale', 'settings'].includes(i.id))
    }

    // Supervisor/Sales: fallback to permission-based
    if (!items) {
      items = NAVIGATION_ITEMS.filter(item => {
        if (!item.permissions || item.permissions.length === 0) {
          return true
        }
        return hasAnyPermission(item.permissions as Permission[])
      })
    }

    // Safe fallback: always show at least Dashboard and Settings
    if (!items || items.length === 0) {
      items = NAVIGATION_ITEMS.filter(i => ['dashboard', 'settings'].includes(i.id))
    }

    return items
  }, [user, hasAnyPermission])

  return <>{children(permittedItems)}</>
}

// Role-based dashboard stats permission
export function useStatsPermissions() {
  const { hasPermission } = useAuthStore()

  return {
    canViewMarkaStats: hasPermission(Permission.MARKA_STATS),
    canViewLabStats: hasPermission(Permission.LAB_STATS),
    canViewWarehouseStats: hasPermission(Permission.WAREHOUSE_STATS),
    canViewCustomerStats: hasPermission(Permission.CUSTOMER_STATS),
    canViewProductionStats: hasPermission(Permission.PRODUCTION_STATS),
    canViewAdminStats: hasPermission(Permission.ADMIN_STATS),
  }
}

// Component-level permission checker
interface PermissionGuardProps {
  permission: Permission | Permission[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGuard({ permission, fallback = null, children }: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission } = useAuthStore()

  const hasAccess = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission)

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}