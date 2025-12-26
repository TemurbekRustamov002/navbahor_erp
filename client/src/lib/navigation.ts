import { 
  BarChart3, 
  Scale, 
  Users, 
  TestTube, 
  Warehouse, 
  Factory, 
  Package, 
  FileText, 
  Settings, 
  Shield,
  FolderOpen,
  Truck
} from 'lucide-react'

export interface NavItem {
  id: string
  title: string
  href: string
  icon: any
  description: string
  isActive: boolean
  adminOnly?: boolean
  requiredRoles?: string[]
}

export const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    title: 'Bosh sahifa',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Umumiy statistika va tizim holati',
    isActive: true
  },
  {
    id: 'scale',
    title: 'Tarozi',
    href: '/dashboard/tarozi',
    icon: Scale,
    description: 'Mahsulot tortish va nazorat',
    isActive: true,
    requiredRoles: ['admin', 'operator', 'scale_operator']
  },
  {
    id: 'customers',
    title: 'Mijozlar',
    href: '/dashboard/mijozlar',
    icon: Users,
    description: 'Mijozlar bazasi boshqaruvi',
    isActive: true,
    requiredRoles: ['admin', 'customer_manager', 'sales']
  },
  {
    id: 'laboratory',
    title: 'Laboratoriya',
    href: '/dashboard/labaratoriya',
    icon: TestTube,
    description: 'Sifat nazorati va test natijalari',
    isActive: true,
    requiredRoles: ['admin', 'lab_analyst', 'quality_control']
  },
  {
    id: 'warehouse',
    title: 'Ombor',
    href: '/dashboard/ombor',
    icon: Warehouse,
    description: 'Inventar va zaxira boshqaruvi',
    isActive: true,
    requiredRoles: ['admin', 'warehouse_manager', 'inventory']
  },
  {
    id: 'shipments',
    title: 'Yuboruvlar',
    href: '/dashboard/shipments',
    icon: Truck,
    description: 'Shipment va yetkazib berish boshqaruvi',
    isActive: true,
    requiredRoles: ['admin', 'warehouse_manager', 'logistics']
  },
  {
    id: 'production',
    title: 'Ishlab chiqarish',
    href: '/dashboard/production',
    icon: Factory,
    description: 'Ishlab chiqarish jarayonlari',
    isActive: true,
    requiredRoles: ['admin', 'production_manager', 'operator']
  },
  {
    id: 'packaging',
    title: 'Qadoqlash',
    href: '/dashboard/packages',
    icon: Package,
    description: 'Tayyor mahsulot qadoqlash',
    isActive: true,
    requiredRoles: ['admin', 'packaging_operator', 'production_manager']
  },
  {
    id: 'reports',
    title: 'Hisobotlar',
    href: '/dashboard/reports',
    icon: FileText,
    description: 'Tizim hisobotlari va tahlil',
    isActive: true,
    requiredRoles: ['admin', 'manager', 'analyst']
  },
  {
    id: 'documents',
    title: 'Hujjatlar',
    href: '/dashboard/hujjatlar',
    icon: FolderOpen,
    description: 'Hujjatlar kutubxonasi va shablon fayllar',
    isActive: true,
    requiredRoles: ['admin', 'manager', 'production_manager', 'lab_analyst', 'warehouse_manager']
  },
  {
    id: 'admin',
    title: 'Administrator',
    href: '/dashboard/admin',
    icon: Shield,
    description: 'Tizim va foydalanuvchilar boshqaruvi',
    isActive: true,
    adminOnly: true,
    requiredRoles: ['admin']
  },
  {
    id: 'settings',
    title: 'Sozlamalar',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Tizim va profil sozlamalari',
    isActive: true
  }
]

export function getAccessibleNavItems(userRole?: string): NavItem[] {
  if (!userRole) return []

  return navigationItems.filter(item => {
    // Allow access if no specific roles required
    if (!item.requiredRoles && !item.adminOnly) return true
    
    // Admin has access to everything
    if (userRole === 'admin') return true
    
    // Check admin-only items
    if (item.adminOnly) return false
    
    // Check role-based access
    if (item.requiredRoles) {
      return item.requiredRoles.includes(userRole)
    }
    
    return true
  })
}

export function getNavItemByPath(pathname: string): NavItem | undefined {
  return navigationItems.find(item => item.href === pathname)
}

export function isPathAccessible(pathname: string, userRole?: string): boolean {
  const navItem = getNavItemByPath(pathname)
  if (!navItem) return false
  
  const accessibleItems = getAccessibleNavItems(userRole)
  return accessibleItems.some(item => item.href === pathname)
}