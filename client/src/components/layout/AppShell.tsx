'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { DynamicLayout } from './DynamicLayout'
import { useSidebarStore } from '@/stores/sidebarStore'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { isExpanded, isHovered } = useSidebarStore()
  const isTaroziPage = pathname === '/dashboard/tarozi'

  const shouldShowExpanded = isExpanded || isHovered

  if (isTaroziPage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
        <main className="h-screen w-screen overflow-hidden">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DynamicLayout />

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out min-h-screen",
          shouldShowExpanded ? "lg:pl-64" : "lg:pl-16"
        )}
        id="main-content"
      >
        {/* Mobile menu button (Floating) */}
        <button
          type="button"
          className="fixed top-4 left-4 z-40 p-2.5 text-muted-foreground lg:hidden bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg transition-all active:scale-90"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <div className="w-6 h-6 flex flex-col justify-center gap-1">
            <div className="w-full h-0.5 bg-slate-900 rounded-full" />
            <div className="w-full h-0.5 bg-slate-900 rounded-full" />
            <div className="w-full h-0.5 bg-slate-900 rounded-full" />
          </div>
        </button>

        {/* Page content */}
        <main className="p-3 bg-gray-50 dark:bg-gray-950 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}