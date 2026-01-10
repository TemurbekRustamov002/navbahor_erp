'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CustomerCard } from '@/components/customers/CustomerCard'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { useBackendCustomerStore } from '@/stores/backendCustomerStore'
import { Customer, CustomerStats } from '@/types/customer'
import {
  Plus,
  Search,
  Users,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Filter,
  Download,
  LayoutGrid,
  List as ListIcon,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MijozlarPage() {
  const {
    customers,
    isLoading,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerStats
  } = useBackendCustomerStore()

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [customerStats, setCustomerStats] = useState<Record<string, CustomerStats>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  useEffect(() => {
    const loadStats = async () => {
      if (customers.length === 0) return

      const ids = customers.map((c: Customer) => c.id)
      try {
        const statsMap = await useBackendCustomerStore.getState().fetchCustomerStatsBatch(ids)
        setCustomerStats((prev: Record<string, CustomerStats>) => ({ ...prev, ...statsMap }))
      } catch (error) {
        console.error('Failed to load batch stats:', error)
      }
    }

    loadStats()
  }, [customers])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    fetchCustomers({ search: value })
  }

  const handleCreateCustomer = async (data: any) => {
    setIsSubmitting(true)
    try {
      await createCustomer(data)
      setShowAddForm(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateCustomer = async (data: any) => {
    if (!editingCustomer) return
    setIsSubmitting(true)
    try {
      await updateCustomer(editingCustomer.id, data)
      setEditingCustomer(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Haqiqatan ham bu mijozni o\'chirmoqchimisiz?')) return
    await deleteCustomer(customerId)
  }

  const overallStats = useMemo(() => {
    return {
      total: customers.length,
      active: customers.filter((c: Customer) => c.isActive).length,
      inactive: customers.filter((c: Customer) => !c.isActive).length
    }
  }, [customers])

  if (isLoading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-in pb-10">
      {/* Page Header - Navbahor Premium Style */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-0.5 shadow-2xl shadow-black/5 transition-all hover:shadow-primary/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
        <div className="absolute -right-24 -top-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />

        <div className="relative p-4 lg:p-5 bg-white/40 dark:bg-slate-900/40 rounded-[0.9rem]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/60 dark:bg-white/5 border border-primary/20 backdrop-blur-md">
                <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Mijozlar Markazi</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight leading-none uppercase">
                Hamkorlar va <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-700">Mijozlar</span>
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex bg-white/60 dark:bg-white/5 p-1 rounded-xl border border-white/20 backdrop-blur-md shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "h-8 px-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition-all",
                    viewMode === 'grid'
                      ? "bg-white dark:bg-slate-900 text-primary shadow-lg"
                      : "text-slate-400 hover:text-primary hover:bg-white/50"
                  )}
                >
                  <LayoutGrid className="h-3 w-3 mr-1.5" strokeWidth={2.5} />
                  Grid
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "h-8 px-3 rounded-lg font-black uppercase tracking-widest text-[8px] transition-all",
                    viewMode === 'list'
                      ? "bg-white dark:bg-slate-900 text-primary shadow-lg"
                      : "text-slate-400 hover:text-primary hover:bg-white/50"
                  )}
                >
                  <ListIcon className="h-3 w-3 mr-1.5" strokeWidth={2.5} />
                  List
                </Button>
              </div>

              <Button
                onClick={() => setShowAddForm(true)}
                className="h-10 px-5 rounded-xl bg-primary hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95 transition-all"
              >
                <Plus size={14} strokeWidth={3} />
                Qo'shish
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Jami', val: overallStats.total, icon: Users, color: 'blue' },
          { label: 'Faol', val: overallStats.active, icon: CheckCircle2, color: 'emerald' },
          { label: 'Nofaol', val: overallStats.inactive, icon: XCircle, color: 'rose' },
          { label: 'Analitika', val: 'Real-Time', icon: TrendingUp, color: 'primary' }
        ].map((s, i) => (
          <Card key={i} className="card-premium group hover:-translate-y-1 transition-all duration-500 overflow-hidden border-none shadow-lg">
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-700 group-hover:rotate-[15deg] shadow-sm",
                  s.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" :
                    s.color === 'rose' ? "bg-rose-500/10 text-rose-500" :
                      s.color === 'blue' ? "bg-blue-500/10 text-blue-500" :
                        "bg-primary/10 text-primary"
                )}>
                  <s.icon size={18} strokeWidth={2.5} />
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                  <h3 className="text-lg font-black text-foreground tracking-tight tabular-nums mt-0.5">
                    {s.val}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch gap-4">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" strokeWidth={2.5} />
          </div>
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-11 pl-11 pr-4 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border-white/20 text-xs font-bold text-foreground placeholder:text-slate-300 focus:ring-4 focus:ring-primary/5 shadow-lg transition-all border"
            placeholder="Qidiruv (Nom, STIR, Raxbar)..."
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="h-11 px-5 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/20 shadow-md font-black uppercase tracking-widest text-[8px] text-slate-500 hover:text-primary hover:border-primary/20 flex items-center gap-2"
          >
            <Filter size={12} strokeWidth={2.5} />
            SARALASH
          </Button>
          <Button
            variant="ghost"
            className="h-11 px-5 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/20 shadow-md font-black uppercase tracking-widest text-[8px] text-slate-500 hover:text-primary hover:border-primary/20 flex items-center gap-2"
          >
            <Download size={12} strokeWidth={2.5} />
            HISOBOT
          </Button>
        </div>
      </div>

      {/* Content Rendering Engine */}
      {customers.length > 0 ? (
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid'
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
            : "grid-cols-1"
        )}>
          {customers.map((customer) => (
            <div key={customer.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CustomerCard
                customer={customer}
                stats={customerStats[customer.id]}
                onEdit={setEditingCustomer}
                onDelete={handleDeleteCustomer}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 glass-card border-none shadow-xl rounded-[2rem]">
          <div className="w-20 h-20 rounded-[1.5rem] bg-primary/5 flex items-center justify-center mx-auto mb-6">
            <Users size={32} className="text-primary/20" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2 uppercase tracking-tight">Ma'lumotlar topilmadi</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-10 font-medium">
            Qidiruv natijalari bo'yicha yoki bazada mijozlar mavjud emas. Yangi hamkor qo'shish tugmasini bosing.
          </p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="h-12 px-10 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-black uppercase tracking-widest text-[10px]"
          >
            Yangi Mijoz Qo'shish
          </Button>
        </div>
      )}

      {/* Overlays / Forms */}
      {(showAddForm || editingCustomer) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500"
            onClick={() => { if (!isSubmitting) { setShowAddForm(false); setEditingCustomer(null); } }}
          />
          <div className="relative w-full max-w-4xl max-h-full overflow-y-auto scrollbar-none animate-in zoom-in-95 duration-500 rounded-[2.5rem] shadow-2xl">
            <CustomerForm
              customer={editingCustomer || undefined}
              onSave={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
              onCancel={() => {
                setShowAddForm(false)
                setEditingCustomer(null)
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Async Loading Toast */}
      {isLoading && customers.length > 0 && (
        <div className="fixed bottom-10 right-10 z-50 animate-in slide-in-from-right-10 duration-500">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-4 flex items-center gap-3">
            <RefreshCw size={14} className="text-primary animate-spin" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ma'lumotlar yangilanmoqda</span>
          </div>
        </div>
      )}
    </div>
  )
}