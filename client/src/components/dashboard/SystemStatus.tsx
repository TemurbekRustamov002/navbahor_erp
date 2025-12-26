'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const systemModules = [
  {
    name: 'Tarozi tizimi',
    status: 'online',
    lastUpdate: '2 daqiqa oldin',
    description: 'CAS CI-200A tarozi bilan bog\'langan',
    uptime: '99.8%'
  },
  {
    name: 'Laboratoriya',
    status: 'online',
    lastUpdate: '5 daqiqa oldin',
    description: 'Barcha test qurilmalari faol',
    uptime: '98.5%'
  },
  {
    name: 'Ombor tizimi',
    status: 'online',
    lastUpdate: '1 daqiqa oldin',
    description: 'Inventar va jo\'natishlar tizimi',
    uptime: '99.2%'
  },
  {
    name: 'Ma\'lumotlar bazasi',
    status: 'online',
    lastUpdate: '30 soniya oldin',
    description: 'PostgreSQL server',
    uptime: '99.9%'
  },
  {
    name: 'WebSocket',
    status: 'maintenance',
    lastUpdate: '10 daqiqa oldin',
    description: 'Real-time ma\'lumotlar almashinuvi',
    uptime: '97.8%'
  },
  {
    name: 'API Gateway',
    status: 'online',
    lastUpdate: '1 daqiqa oldin',
    description: 'Mikroservislar aloqasi',
    uptime: '99.5%'
  }
]

const statusConfig = {
  online: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    text: 'Faol'
  },
  maintenance: {
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    text: 'Texnik xizmat'
  },
  offline: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    text: 'O\'chiq'
  },
  warning: {
    icon: AlertCircle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    text: 'Ogohlantirish'
  }
}

export function SystemStatus() {
  return (
    <Card className="card-premium shadow-premium overflow-hidden">
      <CardHeader className="border-b border-slate-100 dark:border-white/5 p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-black tracking-widest flex items-center gap-3 uppercase text-slate-900 dark:text-white">
            <div className="w-1.5 h-6 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            Tizim holati
          </CardTitle>
          <div className="flex items-center space-x-2 bg-emerald-500/10 dark:bg-emerald-500/20 px-4 py-1.5 rounded-full border border-emerald-500/20">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <span className="text-[11px] font-black uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-400">Normal</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 bg-slate-50/30 dark:bg-transparent">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systemModules.map((module, index) => {
            const config = statusConfig[module.status as keyof typeof statusConfig]
            const StatusIcon = config.icon

            return (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-primary/20 dark:hover:border-primary/20 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Decorative background pulse */}
                <div className={cn(
                  "absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-2xl",
                  config.bgColor.replace('bg-', 'bg-')
                )} />

                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight text-sm">{module.name}</h4>
                  <div className={`p-2.5 rounded-xl ${config.bgColor} shadow-sm border border-white dark:border-white/5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                    <StatusIcon className={`h-5 w-5 ${config.color}`} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-label-premium text-[10px]">Uptime darajasi</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">{module.uptime}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-1500 group-hover:opacity-100 opacity-90"
                        style={{ width: module.uptime }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-2 border-t border-slate-100 dark:border-white/5 mt-4">
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
                      {module.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{module.lastUpdate}</span>
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border border-white dark:border-white/5 shadow-sm",
                        config.bgColor,
                        config.color
                      )}>{config.text}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
