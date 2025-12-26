'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { PermissionBasedNavigation } from '@/components/navigation/PermissionBasedNavigation'
import { NavigationItem } from '@/types/auth'
import { LogOut, User, Settings } from 'lucide-react'

export function SidebarWithPermissions() {
  const pathname = usePathname()
  const { user, logout, isDemoMode, backendConnected } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  if (!user) return null

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-nb-green to-nb-blue rounded-lg flex items-center justify-center text-white font-bold text-sm">
            NB
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Navbahor ERP</h1>
            <p className="text-xs text-gray-500">
              {isDemoMode ? 'Demo rejimi' : 'Professional'}
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.fullName}
            </p>
            <p className="text-xs text-gray-500">
              {user.role.replace('_', ' ')}
            </p>
          </div>
        </div>
        
        {/* Connection Status */}
        <div className="mt-2 flex items-center justify-between">
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            backendConnected
              ? "bg-green-100 text-green-800"
              : "bg-orange-100 text-orange-800"
          )}>
            {backendConnected ? 'Backend' : 'Demo'}
          </div>
          <div className="text-xs text-gray-400">
            {user.username}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <PermissionBasedNavigation>
          {(permittedItems: NavigationItem[]) => (
            <nav className="space-y-1 px-3">
              {permittedItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-nb-green text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          )}
        </PermissionBasedNavigation>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 p-4 space-y-2">
        <Link
          href="/dashboard/settings"
          className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <Settings className="mr-3 h-5 w-5" />
          Sozlamalar
        </Link>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Chiqish
        </button>
      </div>
    </div>
  )
}