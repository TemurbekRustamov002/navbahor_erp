'use client'

import { Menu, Bell, Search, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { useAuthStore } from '@/stores/authStore'
import { useLanguageStore } from '@/stores/languageStore'
import { useRouter } from 'next/navigation'

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuthStore()
  const { t } = useLanguageStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background/80 backdrop-blur-md px-4 shadow-sm sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-muted-foreground lg:hidden hover:bg-muted rounded-xl transition-colors"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center">
        {/* Search - Senior Refinement */}
        <div className="relative flex flex-1 items-center max-w-md group">
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
          <input
            id="search-field"
            className="block w-full h-10 rounded-xl border-none py-2 pl-10 pr-4 text-[13px] text-foreground bg-secondary/50 focus:bg-background ring-1 ring-inset ring-transparent focus:ring-2 focus:ring-inset focus:ring-primary/20 transition-all placeholder:text-muted-foreground placeholder:font-medium"
            placeholder={`${t('common.search')}...`}
            type="search"
            name="search"
          />
          <div className="absolute right-3 hidden sm:flex items-center gap-1 pointer-events-none select-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground bg-background border border-border rounded-md">⌘</kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground bg-background border border-border rounded-md">K</kbd>
          </div>
        </div>

        {/* Right side controls - Professional Layout */}
        <div className="flex items-center gap-x-4 ml-auto">
          {/* Notifications with Pulse */}
          <button
            type="button"
            className="relative p-2.5 text-muted-foreground hover:text-primary transition-all bg-secondary/50 hover:bg-background rounded-xl border border-transparent hover:border-border"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
            </span>
          </button>

          {/* User Profile Hook - Senior Desktop */}
          <div className="flex items-center gap-x-3 pl-4 border-l border-border">
            <div className="hidden sm:flex flex-col items-end leading-tight mr-1">
              <span className="text-[13px] font-bold text-foreground whitespace-nowrap">
                {user?.fullName || user?.username}
              </span>
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest mt-0.5">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>

            <div className="relative group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-emerald-700 p-[2px] shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
                  <span className="text-sm font-black text-primary uppercase">
                    {user?.username?.[0] || '?'}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-[11px] font-black uppercase tracking-widest h-9 px-4 rounded-xl border-border hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all dark:hover:bg-red-950/30"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              {t('auth.logout') || 'Chiqish'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
