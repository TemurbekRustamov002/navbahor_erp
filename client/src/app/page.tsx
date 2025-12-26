'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { LoginForm } from '@/components/auth/LoginForm'
import { ServiceGrid } from '@/components/dashboard/ServiceGrid'
import { useEffect } from 'react'

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Agar user login qilgan bo'lsa, dashboard'ga yo'naltirish
    if (isAuthenticated && user) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, router])

  if (isAuthenticated) {
    return null // Loading state while redirecting
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex flex-col items-center justify-center p-6">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo & Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center group cursor-default">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-500">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 rounded-xl">
                <div className="w-4 h-4 bg-white rounded-sm animate-pulse" />
              </div>
            </div>
            <div className="ml-5 text-left">
              <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase">
                NAVBAHOR<span className="text-primary">.ERP</span>
              </h1>
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.3em] opacity-80 mt-1">
                Industrial Textile Solutions
              </p>
            </div>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="transform hover:scale-[1.01] transition-transform duration-500">
          <LoginForm />
        </div>

        {/* System Highlights */}
        <div className="mt-10 grid grid-cols-2 gap-4">
          <div className="glass-card bg-white/60 p-5 rounded-3xl group hover:shadow-lg transition-all duration-300">
            <h3 className="text-foreground font-black text-sm uppercase tracking-wider mb-1 group-hover:text-primary transition-colors">8 Modul</h3>
            <p className="text-muted-foreground text-[11px] font-bold uppercase">To'liq integrallashgan</p>
          </div>
          <div className="glass-card bg-white/60 p-5 rounded-3xl group hover:shadow-lg transition-all duration-300 text-right">
            <h3 className="text-foreground font-black text-sm uppercase tracking-wider mb-1 group-hover:text-blue-600 transition-colors">v1.2.0</h3>
            <p className="text-muted-foreground text-[11px] font-bold uppercase">Zamonaviy va Tezkor</p>
          </div>
        </div>

        {/* Legal/Footer */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
            © 2024 NAVBAHOR TEKSTIL GROUP • PRO EDITION
          </p>
        </div>
      </div>
    </div>
  )
}