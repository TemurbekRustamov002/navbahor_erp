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
  List as ListIcon
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

      const ids = customers.map(c => c.id)
      // Only fetch stats for IDs we haven't loaded yet? Or refresh all? Refetching all is safer for "list" view updates
      // Optimized: one call

      try {
        const statsMap = await useBackendCustomerStore.getState().fetchCustomerStatsBatch(ids)
        setCustomerStats(prev => ({ ...prev, ...statsMap }))
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
      active: customers.filter(c => c.isActive).length,
      inactive: customers.filter(c => !c.isActive).length
    }
  }, [customers])

  if (isLoading && customers.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-label-compact animate-pulse">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#f0fdf4] overflow-hidden animate-in fade-in duration-700">
      {/* Navbahor Premium Header - Glassmorphism */}
      <div className="flex-shrink-0 border-b border-slate-100 bg-white/85 backdrop-blur-md px-8 py-5 z-20 shadow-sm border border-white/60">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center transition-all hover:scale-105 shadow-sm">
              <Users className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight leading-none">Mijozlar <span className="text-primary italic">Boshqaruvi</span></h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">Hamkorlar bazasi va operatsion statuslar</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100/50 p-1.5 rounded-xl border border-slate-200 shadow-inner">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={cn(
                  "h-9 px-4 rounded-lg font-bold uppercase tracking-widest text-[9px] transition-all",
                  viewMode === 'grid'
                    ? "bg-white text-primary shadow-lg border border-slate-200"
                    : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5 mr-2" strokeWidth={2.5} />
                Grid
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(
                  "h-9 px-4 rounded-lg font-bold uppercase tracking-widest text-[9px] transition-all",
                  viewMode === 'list'
                    ? "bg-white text-primary shadow-lg border border-slate-200"
                    : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                )}
              >
                <ListIcon className="h-3.5 w-3.5 mr-2" strokeWidth={2.5} />
                List
              </Button>
            </div>

            <Button
              onClick={() => setShowAddForm(true)}
              className="h-12 px-8 rounded-2xl bg-primary hover:bg-[#047857] text-white font-bold uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20 flex items-center gap-3 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" strokeWidth={3} />
              Mijoz Qo'shish
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 lg:px-12 py-10 scrollbar-none">
        <div className="max-w-[1700px] mx-auto space-y-10">

          {/* Enhanced Stats Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Jami Mijozlar', val: overallStats.total, icon: Users, color: 'blue', desc: 'Bazadagi jami hamkorlar' },
              { label: 'Faol Hamkorlar', val: overallStats.active, icon: CheckCircle2, color: 'emerald', desc: 'Shartnomasi bor mijozlar' },
              { label: 'Nofaol Status', val: overallStats.inactive, icon: XCircle, color: 'rose', desc: 'Vaqtincha to\'xtatilgan' },
              { label: 'Oylik Hajm', val: 'Real-Time', icon: TrendingUp, color: 'primary', desc: 'Yuklashlar tahlili' }
            ].map((s, i) => (
              <div key={i} className="group relative overflow-hidden rounded-[2rem] bg-white border border-slate-100 p-8 shadow-xl shadow-slate-200/50 transition-all hover:scale-[1.02] hover:shadow-2xl">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <s.icon size={80} strokeWidth={1} />
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center border",
                      s.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        s.color === 'rose' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                          s.color === 'blue' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                            "bg-primary/10 text-primary border-primary/20"
                    )}>
                      <s.icon size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase leading-none">{s.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-slate-900 font-mono tracking-tighter tabular-nums leading-none">{s.val}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search & Filter Station */}
          <div className="flex flex-col xl:flex-row items-center gap-6">
            <div className="flex-1 w-full relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" strokeWidth={2.5} />
              </div>
              <Input
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-16 pl-16 pr-8 rounded-3xl bg-white border-slate-100 text-lg font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium focus:ring-8 focus:ring-primary/5 shadow-xl shadow-slate-200/30 transition-all border"
                placeholder="Mijoz nomi, STIR yoki Raxbar bo'yicha qidirish..."
              />
            </div>

            <div className="flex items-center gap-4 w-full xl:w-auto">
              <Button variant="ghost" className="h-16 px-8 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-200/30 font-bold uppercase tracking-widest text-[10px] text-slate-500 hover:text-primary hover:border-primary/20 flex items-center gap-3">
                <Filter className="h-4 w-4" strokeWidth={2.5} />
                Filtrlar
              </Button>
              <Button variant="ghost" className="h-16 px-8 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-200/30 font-bold uppercase tracking-widest text-[10px] text-slate-500 hover:text-primary hover:border-primary/20 flex items-center gap-3">
                <Download className="h-4 w-4" strokeWidth={2.5} />
                HISOBOT (PDF)
              </Button>
            </div>
          </div>

          {/* Main Grid/List View Engine */}
          {customers.length > 0 ? (
            <div className={cn(
              "grid gap-8 pb-20",
              viewMode === 'grid'
                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
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
            <div className="py-32 flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-[2rem] bg-white border border-slate-100 flex items-center justify-center text-slate-200 mb-8 shadow-xl shadow-slate-200/50">
                <Users size={48} strokeWidth={1} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight mb-2">Mijozlar Ma'lumotlar Bazasida yo'q</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-10 max-w-[400px] text-center">
                Qidiruv natija bermadi yoki bazada mijozlar mavjud emas. Yangi hamkor qo'shish tugmasini bosing.
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-[0.25em] text-[10px] shadow-2xl shadow-slate-900/20 active:scale-95 transition-all"
              >
                Yangi Mijoz Qo'shish
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Overlays */}
      {(showAddForm || editingCustomer) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500"
            onClick={() => { if (!isSubmitting) { setShowAddForm(false); setEditingCustomer(null); } }}
          />
          <div className="relative w-full max-w-4xl max-h-full overflow-y-auto scrollbar-none animate-in zoom-in-95 duration-500">
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

      {isLoading && customers.length > 0 && (
        <div className="fixed bottom-10 right-10 z-50 animate-in slide-in-from-right-10 duration-500">
          <div className="bg-white border border-slate-100 shadow-2xl rounded-2xl p-5 flex items-center gap-4 transition-all hover:scale-105">
            <div className="relative">
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Yangilanmoqda...</span>
          </div>
        </div>
      )}
    </div>
  )
}