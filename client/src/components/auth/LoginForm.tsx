'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Alert } from '@/components/ui/Alert'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { LoginRequest } from '@/types/auth'
import { Loader2, Eye, EyeOff, Users, AlertCircle } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!formData.username || !formData.password) {
      return
    }

    try {
      const credentials: LoginRequest = {
        username: formData.username,
        password: formData.password
      }
      const success = await login(credentials)

      if (success) {
        router.push('/dashboard')
      }
    } catch (err) {
      // Error handling already done in authStore
    }
  }

  return (
    <div className="glass-card rounded-[2.5rem] shadow-2xl p-8 md:p-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-foreground tracking-tight mb-2">Tizimga kirish</h2>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest opacity-80">Hisobingizga kiring</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Foydalanuvchi nomi</Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Users size={18} />
            </div>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Username"
              required
              disabled={isLoading}
              className="pl-12 h-14 bg-white/50 border-input text-foreground rounded-2xl focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Parol</Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Eye size={18} />
            </div>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="pl-12 pr-12 h-14 bg-white/50 border-input text-foreground rounded-2xl focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              checked={formData.remember}
              onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
              className="w-4 h-4 text-primary bg-white border-input rounded focus:ring-primary/20 focus:ring-offset-0"
              disabled={isLoading}
            />
            <Label htmlFor="remember" className="ml-2 text-xs font-bold text-muted-foreground cursor-pointer">
              Meni eslab qol
            </Label>
          </div>
          <button type="button" className="text-xs font-bold text-primary hover:text-emerald-600 transition-colors">
            Parolni unutdingizmi?
          </button>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 rounded-2xl bg-primary hover:bg-emerald-600 text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/30 active:scale-[0.98] transition-all"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Tekshirilmoqda...</span>
            </div>
          ) : (
            'Kirish'
          )}
        </Button>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl animate-fade-in">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle size={18} />
              <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
