'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useBackendCustomerStore } from '@/stores/backendCustomerStore'
import { Customer, CustomerStats, CustomerReport, CustomerDocument } from '@/types/customer'
import {
  ArrowLeft, Users, Phone, MapPin, Building, Calendar, FileText, Download,
  BarChart3, Package, TrendingUp, Clock, Edit, Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CustomerDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string

  const {
    getCustomerStats,
    getCustomerReports,
    getCustomerDocuments,
    findCustomerById,
    fetchCustomerById
  } = useBackendCustomerStore()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'reports' | 'documents'>('info')
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [reports, setReports] = useState<CustomerReport[]>([])
  const [documents, setDocuments] = useState<CustomerDocument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (customerId) {
      loadCustomerData(customerId)
    }
  }, [customerId])

  const loadCustomerData = async (id: string) => {
    setLoading(true)
    try {
      // First check if customer exists in store, then fetch if not or to refresh
      let customerData = findCustomerById(id)
      if (!customerData) {
        customerData = await fetchCustomerById(id)
      }

      if (customerData) {
        setCustomer(customerData)
      }

      // Load stats
      const statsData = await getCustomerStats(id)
      setStats(statsData)

      // Load reports
      const reportsData = await getCustomerReports(id)
      setReports(reportsData)

      // Load documents
      const documentsData = await getCustomerDocuments(id)
      setDocuments(documentsData)
    } catch (error) {
      console.error('Error loading customer data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleEdit = () => {
    router.push(`/dashboard/mijozlar/${customerId}/tahrirlash`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Ma'lumotlar yuklanmoqda..." />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Orqaga
          </Button>
        </div>
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Mijoz topilmadi
              </h3>
              <p className="text-gray-600">
                Ko'rsatilgan mijoz mavjud emas yoki o'chirilgan
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0fdf4] animate-in fade-in duration-700 pb-20">
      {/* Navbahor Premium Header */}
      <div className="sticky top-0 z-30 border-b border-slate-100 bg-white/85 backdrop-blur-md px-8 py-5 shadow-sm border border-white/60 mb-10">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center p-0"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            </Button>

            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-lg shadow-primary/5">
                <Building size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight leading-none mb-2">{customer.name}</h1>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-slate-100 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none font-mono">STIR: {customer.tin}</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Faol Hamkor</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleEdit}
            className="h-12 px-8 rounded-2xl bg-slate-900 border border-slate-900 text-white font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/20 flex items-center gap-3 transition-all active:scale-95"
          >
            <Edit className="h-4 w-4" strokeWidth={3} />
            Ma'lumotlarni Tahrirlash
          </Button>
        </div>
      </div>

      <div className="px-8 lg:px-12 max-w-[1700px] mx-auto space-y-10">
        {/* Navigation Tabs - Modern Design */}
        <div className="flex items-center bg-white/60 p-1.5 rounded-2xl border border-white/60 shadow-xl shadow-slate-200/40 w-fit">
          {[
            { id: 'info', label: 'Profil Ma\'lumotlari', icon: Users },
            { id: 'reports', label: 'Analitik Hisobotlar', icon: FileText },
            { id: 'documents', label: 'Elektron Hujjatlar', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "h-11 px-6 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all flex items-center gap-3",
                activeTab === tab.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
              )}
            >
              <tab.icon className="h-3.5 w-3.5" strokeWidth={2.5} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Section */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Detailed Info Card */}
            <Card className="lg:col-span-2 border-none bg-white/85 backdrop-blur-md rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-white/60">
              <div className="p-10 lg:p-12">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                    <Users size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Asosiy Hamkor Ma'lumotlari</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="flex flex-col gap-2 pl-4 border-l-2 border-primary/20">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Mas'ul Shaxs (Rahbar)</span>
                      <p className="text-xl font-bold text-slate-900 uppercase tracking-tight leading-snug">
                        {customer.contactName || customer.director || 'Nomalum'}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pl-4 border-l-2 border-primary/20">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Bog'lanish Telefontori</span>
                      <p className="text-xl font-bold text-slate-900 font-mono tracking-tighter tabular-nums leading-none">
                        {customer.contactPhone}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pl-4 border-l-2 border-primary/20">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Elektron Pochta</span>
                      <p className="text-sm font-bold text-primary lowercase tracking-tight">
                        {customer.contactEmail || 'pochta kiritilmagan'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex flex-col gap-2 pl-4 border-l-2 border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Yuridik Manzil</span>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed uppercase">
                        {customer.address}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pl-4 border-l-2 border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Bazaga qo'shilgan sana</span>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-slate-300" strokeWidth={2.5} />
                        <p className="text-sm font-bold text-slate-900 uppercase tracking-widest font-mono">
                          {new Date(customer.createdAt).toLocaleDateString('uz-UZ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {customer.notes && (
                  <div className="mt-12 p-8 rounded-3xl bg-slate-50 border border-slate-100 border-dashed">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ichki tizim qaydlari</h4>
                    </div>
                    <p className="text-[13px] font-medium text-slate-600 leading-relaxed italic italic">
                      "{customer.notes}"
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Premium Stats Grid */}
            <div className="space-y-6">
              {stats && (
                <div className="grid grid-cols-1 gap-6">
                  {[
                    { label: 'Jami Buyurtmalar', val: stats.totalOrders, icon: Package, color: 'blue', unit: 'ta' },
                    { label: 'Umumiy Yuklangan Hajm', val: stats.totalVolume.toFixed(1), icon: TrendingUp, color: 'emerald', unit: 't' },
                    { label: 'O\'rtacha Partiya Hajmi', val: stats.averageOrderValue.toFixed(1), icon: BarChart3, color: 'purple', unit: 't' }
                  ].map((s, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:scale-[1.02] transition-all">
                      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                        <s.icon size={80} strokeWidth={1} />
                      </div>
                      <div className="relative z-10">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 leading-none">{s.label}</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-4xl font-bold text-slate-900 font-mono tracking-tighter leading-none">{s.val}</p>
                          <span className="text-sm font-bold text-slate-300 uppercase">{s.unit}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="bg-slate-900 rounded-[2rem] p-8 shadow-xl shadow-slate-900/10 text-white relative flex flex-col justify-between h-48 group hover:scale-[1.02] transition-all">
                    <div className="flex items-center justify-between">
                      <Clock className="h-6 w-6 text-white/40" strokeWidth={2.5} />
                      <div className="px-3 py-1 bg-white/10 rounded-lg backdrop-blur-md">
                        <span className="text-[8px] font-bold uppercase tracking-widest">Oxirgi harakat</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-3xl font-bold font-mono tracking-tighter leading-none mb-2">
                        {stats.lastOrderDate ? new Date(stats.lastOrderDate).toLocaleDateString('uz-UZ') : 'Noma\'lum'}
                      </p>
                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Oxirgi buyurtma berilgan sana</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 bg-primary rounded-full" />
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Analitik Hisobotlar Markazi</h3>
              </div>
              <Button className="h-12 px-8 rounded-2xl bg-primary hover:bg-[#047857] text-white font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20 flex items-center gap-3 transition-all active:scale-95">
                <Plus className="h-4 w-4" strokeWidth={3} />
                Yangi Hisobot Yaratish
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <div key={report.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-xl shadow-slate-200/30 group hover:border-primary/20 transition-all hover:bg-primary/[0.01]">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <FileText size={24} strokeWidth={2.5} />
                    </div>
                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono">
                      ID: #{report.id}
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 uppercase tracking-tight leading-snug mb-3">{report.title}</h4>
                  <p className="text-[12px] font-medium text-slate-400 mb-8 line-clamp-2">{report.description}</p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {new Date(report.createdAt).toLocaleDateString('uz-UZ')}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl bg-slate-50 hover:bg-primary/10 hover:text-primary transition-all">
                        <Download size={14} strokeWidth={2.5} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {reports.length === 0 && (
                <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-40">
                  <div className="w-20 h-20 rounded-[2rem] border-2 border-dashed border-slate-300 mb-6 flex items-center justify-center">
                    <FileText size={32} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Hozircha hisobotlar yo'q</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 bg-primary rounded-full" />
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Elektron Hujjatlar Arxiv</h3>
              </div>
              <Button className="h-12 px-8 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-slate-900/20 flex items-center gap-3 transition-all active:scale-95">
                <Plus className="h-4 w-4" strokeWidth={3} />
                Hujjat Yuklash
              </Button>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/40 overflow-hidden divide-y divide-slate-50">
              {documents.map((doc) => (
                <div key={doc.id} className="p-8 hover:bg-slate-50 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-8">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-primary/5 group-hover:text-primary transition-all">
                      <FileText size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-1">{doc.title}</h4>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{doc.fileName}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{formatFileSize(doc.fileSize)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-10">
                    <div className="flex flex-col items-end mr-6">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Yuklangan sana</span>
                      <span className="text-[11px] font-bold text-slate-500 font-mono tracking-widest mt-1">
                        {new Date(doc.uploadedAt).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-primary hover:border-primary/20 transition-all flex items-center justify-center p-0">
                        <Download size={18} strokeWidth={2.5} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="py-32 flex flex-col items-center justify-center opacity-40">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Hujjatlar arxivi bo'sh</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
