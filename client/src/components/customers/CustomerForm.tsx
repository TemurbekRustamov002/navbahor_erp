'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Customer, CreateCustomerDto, UpdateCustomerDto } from '@/types/customer'
import {
  Building2,
  User,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomerFormProps {
  customer?: Customer;
  onSave: (data: CreateCustomerDto | UpdateCustomerDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CustomerForm({ customer, onSave, onCancel, isLoading }: CustomerFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    legalName: customer?.legalName || '',
    tin: customer?.tin || '',
    address: customer?.address || '',
    director: customer?.director || '',
    bankName: customer?.bankName || '',
    bankAccount: customer?.bankAccount || '',
    mfo: customer?.mfo || '',
    oked: customer?.oked || '',
    contactName: customer?.contactName || '',
    contactPhone: customer?.contactPhone || '',
    contactEmail: customer?.contactEmail || '',
    notes: customer?.notes || '',
    isActive: customer?.isActive ?? true
  })

  const totalSteps = 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < totalSteps) {
      setStep(step + 1);
      return;
    }

    const cleanData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value !== '' && value !== null)
    )
    onSave(cleanData as any)
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="border-none shadow-2xl rounded-[3rem] bg-white/90 backdrop-blur-xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/60">
      {/* Premium Multi-step Header */}
      <div className="p-10 lg:p-12 border-b border-slate-100 bg-white/40 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center shadow-lg shadow-primary/5 transition-all hover:scale-105">
              <Building2 size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight leading-none">
                {customer ? 'Mijozni' : 'Yangi'} <span className="text-primary italic">{customer ? 'Tahrirlash' : 'Mijoz'}</span>
              </h2>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">
                  {step === 1 ? 'Korxona Ma\'lumotlari' : step === 2 ? 'Moliyaviy Rekvizitlar' : 'Aloqa va Manzil'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={cn(
                  "h-1.5 rounded-full transition-all duration-700",
                  step === s ? "bg-primary w-12" : step > s ? "bg-emerald-500 w-6" : "bg-slate-100 w-6"
                )} />
              ))}
            </div>
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
              Bosqich {step} — 0{totalSteps}
            </span>
          </div>
        </div>
      </div>

      <CardContent className="p-10 lg:p-12 bg-slate-50/20">
        <form onSubmit={handleSubmit} className="space-y-10 max-w-4xl mx-auto">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-8 duration-500">
              <div className="space-y-3 col-span-2">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2 mb-3">
                  Mijoz Nomi (Brend) *
                </Label>
                <div className="relative group">
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    placeholder="Masalan: Paxta Sanoat MCHJ"
                    className="h-16 rounded-2xl bg-white border-slate-100 focus:ring-8 focus:ring-primary/5 transition-all font-bold text-lg group-hover:bg-white shadow-sm"
                  />
                  <Building2 className="absolute right-6 top-1/2 -translate-y-1/2 text-primary opacity-20 group-focus-within:opacity-100 transition-opacity" size={24} strokeWidth={2.5} />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">To'liq Yuridik Nomi</Label>
                <Input
                  value={formData.legalName}
                  onChange={(e) => handleChange('legalName', e.target.value)}
                  placeholder="Nizom bo'yicha nomi"
                  className="h-14 rounded-2xl bg-white border-slate-100 font-bold placeholder:font-normal placeholder:text-slate-300 shadow-sm focus:ring-4 focus:ring-primary/5 transition-all"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">STIR (INN)</Label>
                <Input
                  value={formData.tin}
                  onChange={(e) => handleChange('tin', e.target.value)}
                  placeholder="9 ta raqam"
                  maxLength={9}
                  className="h-14 rounded-2xl bg-white border-slate-100 font-bold tabular-nums shadow-sm focus:ring-4 focus:ring-primary/5 transition-all letter-spacing-widest"
                />
              </div>

              <div className="space-y-3 col-span-2">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rahbar (Direktor F.I.SH)</Label>
                <div className="relative group">
                  <Input
                    value={formData.director}
                    onChange={(e) => handleChange('director', e.target.value)}
                    placeholder="Masalan: Karimov Ahmad..."
                    className="h-14 rounded-2xl bg-white border-slate-100 font-bold shadow-sm focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                  <User className="absolute right-5 top-1/2 -translate-y-1/2 text-primary opacity-20" size={20} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-8 duration-500">
              <div className="space-y-3 col-span-2">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Xizmat Ko'rsatuvchi Bank</Label>
                <div className="relative group">
                  <Input
                    value={formData.bankName}
                    onChange={(e) => handleChange('bankName', e.target.value)}
                    placeholder="Bank nomini kiriting..."
                    className="h-16 rounded-2xl bg-white border-slate-100 font-bold shadow-sm focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                  <CreditCard className="absolute right-6 top-1/2 -translate-y-1/2 text-primary opacity-20" size={24} />
                </div>
              </div>

              <div className="space-y-3 col-span-2">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Hisob-Raqam (20 belgi)</Label>
                <Input
                  value={formData.bankAccount}
                  onChange={(e) => handleChange('bankAccount', e.target.value)}
                  placeholder="20208000..."
                  maxLength={20}
                  className="h-14 rounded-2xl bg-white border-slate-100 font-bold font-mono tracking-widest tabular-nums shadow-sm focus:ring-4 focus:ring-primary/5 transition-all"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">MFO</Label>
                <Input
                  value={formData.mfo}
                  onChange={(e) => handleChange('mfo', e.target.value)}
                  placeholder="00XXX"
                  maxLength={5}
                  className="h-14 rounded-2xl bg-white border-slate-100 font-bold font-mono shadow-sm focus:ring-4 focus:ring-primary/5 transition-all"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">OKED</Label>
                <Input
                  value={formData.oked}
                  onChange={(e) => handleChange('oked', e.target.value)}
                  placeholder="12345"
                  className="h-14 rounded-2xl bg-white border-slate-100 font-bold font-mono shadow-sm focus:ring-4 focus:ring-primary/5 transition-all"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-8 duration-500">
              <div className="space-y-3 col-span-2">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Yuridik va Pochta Manzili</Label>
                <div className="relative group">
                  <Input
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Viloyat, shahar, tuman, ko'cha..."
                    className="h-14 rounded-2xl bg-white border-slate-100 font-bold pl-12 shadow-sm focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} strokeWidth={2.5} />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bog'lanish Uchun Tel.</Label>
                <div className="relative group">
                  <Input
                    value={formData.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                    placeholder="+998"
                    className="h-14 rounded-2xl bg-white border-slate-100 font-bold pl-12 shadow-sm focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} strokeWidth={2.5} />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail (Pochta)</Label>
                <div className="relative group">
                  <Input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    placeholder="partner@example.com"
                    className="h-14 rounded-2xl bg-white border-slate-100 font-bold pl-12 shadow-sm focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} strokeWidth={2.5} />
                </div>
              </div>

              <div className="space-y-3 col-span-2">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tizim Uchun Izohlar</Label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Mijoz bilan ishlashning maxsus shartlari..."
                  className="w-full h-32 p-6 rounded-3xl bg-white border border-slate-100 font-medium focus:ring-8 focus:ring-primary/5 transition-all resize-none text-sm outline-none shadow-sm placeholder:text-slate-200"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-12 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={step === 1 ? onCancel : () => setStep(step - 1)}
              className="h-14 px-10 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              {step === 1 ? 'Bekor Qilish' : <><ChevronLeft className="mr-2" size={18} strokeWidth={3} /> Orqaga</>}
            </Button>

            <Button
              type="submit"
              disabled={isLoading || (step === 1 && !formData.name.trim())}
              className="h-14 px-12 rounded-2xl bg-primary hover:bg-[#047857] text-white font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 active:scale-95 transition-all flex items-center gap-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                step === totalSteps ? (
                  <>Mijozni Saqlash <CheckCircle2 className="ml-2" size={18} strokeWidth={3} /></>
                ) : (
                  <>Davom Etish <ChevronRight className="ml-2" size={18} strokeWidth={3} /></>
                )
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}