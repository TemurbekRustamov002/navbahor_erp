'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Customer, CustomerStats } from '@/types/customer'
import {
  Phone,
  MapPin,
  Building2,
  Edit,
  Trash2,
  Briefcase,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomerCardProps {
  customer: Customer;
  stats?: CustomerStats;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
}

export function CustomerCard({ customer, stats, onEdit, onDelete }: CustomerCardProps) {
  const router = useRouter()

  const handleViewDetails = () => {
    router.push(`/dashboard/mijozlar/${customer.id}`)
  }

  return (
    <Card className="group relative border-none bg-white/85 backdrop-blur-md rounded-[2.5rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-white/60">
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 blur-[80px] -z-10 rounded-full transition-colors duration-700",
        customer.isActive ? "bg-emerald-500/10" : "bg-slate-200/50"
      )} />

      <CardContent className="p-8 lg:p-10">
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center gap-5">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110",
              customer.isActive
                ? "bg-primary text-white shadow-primary/20"
                : "bg-slate-100 text-slate-400 shadow-sm border border-slate-200"
            )}>
              <Building2 size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors leading-none">
                {customer.name}
              </h3>
              <div className="flex items-center gap-3 mt-3">
                <span className={cn(
                  "inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-[0.1em] shadow-sm border",
                  customer.isActive
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-slate-50 text-slate-400 border-slate-100"
                )}>
                  {customer.isActive ? (
                    <><ShieldCheck className="h-3 w-3 mr-1.5 stroke-[3]" /> Faol Hamkor</>
                  ) : (
                    <><ShieldAlert className="h-3 w-3 mr-1.5 stroke-[3]" /> Nofaol</>
                  )}
                </span>
                {customer.tin && (
                  <div className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none font-mono">STIR: {customer.tin}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(customer)}
              className="h-10 w-10 p-0 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
            >
              <Edit size={16} strokeWidth={2.5} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(customer.id)}
              className="h-10 w-10 p-0 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-500/20 transition-all shadow-sm"
            >
              <Trash2 size={16} strokeWidth={2.5} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="space-y-4">
            {customer.director && (
              <div className="flex flex-col gap-1.5 pl-3 border-l-2 border-primary/20">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">Rahbar</span>
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-tight truncate flex items-center gap-2">
                  {customer.director}
                </p>
              </div>
            )}
            {customer.contactPhone && (
              <div className="flex flex-col gap-1.5 pl-3 border-l-2 border-primary/20">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">Bog'lanish</span>
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-tight tabular-nums flex items-center gap-2">
                  {customer.contactPhone}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {customer.bankName && (
              <div className="flex flex-col gap-1.5 pl-3 border-l-2 border-slate-200">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">Bank</span>
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-tight truncate">
                  {customer.bankName}
                </p>
              </div>
            )}
            {customer.address && (
              <div className="flex flex-col gap-1.5 pl-3 border-l-2 border-slate-200">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">Manzil</span>
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-tight truncate">
                  {customer.address}
                </p>
              </div>
            )}
          </div>
        </div>

        {stats && (
          <div className="bg-slate-50/50 rounded-3xl p-6 mb-8 flex justify-between items-center border border-slate-100 group-hover:bg-primary/[0.02] transition-colors">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-900 font-mono tracking-tighter tabular-nums leading-none">
                {stats.totalOrders}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2.5 leading-none">Jami Shartnomalar</span>
            </div>
            <div className="w-px h-10 bg-slate-200/50" />
            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold text-primary font-mono tracking-tighter tabular-nums leading-none">
                {stats?.totalVolume?.toFixed(1) || '0.0'}
                <span className="text-sm font-bold opacity-30 ml-1">TONNA</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2.5 leading-none">Umumiy Hajm</span>
            </div>
          </div>
        )}

        <Button
          onClick={handleViewDetails}
          variant="default"
          className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-primary shadow-2xl shadow-slate-900/10 transition-all flex items-center justify-center gap-3 group/btn"
        >
          Mijoz Profilini ko'rish
          <ChevronRight className="transition-transform duration-300 group-hover/btn:translate-x-2" size={16} strokeWidth={3} />
        </Button>
      </CardContent>
    </Card>
  )
}