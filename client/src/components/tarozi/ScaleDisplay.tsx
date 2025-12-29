'use client'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { formatWeight } from '@/lib/utils/weight'
import { Wifi, WifiOff, Activity, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react'

interface ScaleDisplayProps {
  weight: number
  isStable: boolean
  isConnected: boolean
  className?: string
}

export function ScaleDisplay({ weight, isStable, isConnected, className }: ScaleDisplayProps) {
  const [lastWeight, setLastWeight] = useState(0)
  const [delta, setDelta] = useState(0)

  useEffect(() => {
    if (isStable && Math.abs(weight - lastWeight) > 0.1) {
      setDelta(weight - lastWeight)
      setLastWeight(weight)
    }
  }, [weight, isStable, lastWeight])

  return (
    <div className={cn(
      "relative overflow-hidden rounded-[2.5rem] bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-xl shadow-black/5 animate-in fade-in slide-in-from-bottom-4 duration-500",
      isConnected ? "opacity-100" : "opacity-60 grayscale",
      className
    )}>
      {/* Visual Header */}
      <div className="px-6 py-3 border-b border-white/40 dark:border-white/5 bg-white/20 dark:bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Activity size={16} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">Onlayn Tarozi</h3>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 leading-none">Jonli Rejim</p>
          </div>
        </div>

        <div className={cn(
          "px-3 py-1 rounded-full flex items-center gap-1.5 border transition-colors",
          isConnected ? "bg-primary/5 dark:bg-primary/10 border-primary/20 text-primary dark:text-primary/90" : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
        )}>
          {isConnected ? <Wifi size={12} strokeWidth={2} /> : <WifiOff size={12} strokeWidth={2} />}
          <span className="text-[9px] font-bold uppercase tracking-widest">{isConnected ? "ONLINE" : "OFFLINE"}</span>
        </div>
      </div>

      <div className="p-2 space-y-2">
        {/* Main Digital Display */}
        <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-3 border border-primary/10 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_100%)] opacity-[0.03] pointer-events-none" />

          <div className="flex items-baseline gap-1.5 relative z-10">
            <span className={cn(
              "text-4xl md:text-5xl font-mono font-bold tracking-tighter tabular-nums transition-all duration-500",
              isConnected ? (isStable ? "text-primary" : "text-amber-500 animate-pulse") : "text-slate-300 dark:text-slate-700"
            )}>
              {formatWeight(weight, 'kg', 2)}
            </span>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">kg</span>
          </div>

          {/* Delta Indicator */}
          {isConnected && isStable && Math.abs(delta) > 0.01 && (
            <div className={cn(
              "absolute top-2 right-3 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest animate-in slide-in-from-right-4 duration-500",
              delta > 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            )}>
              {delta > 0 ? <ArrowUpRight size={8} strokeWidth={3} /> : <ArrowDownRight size={8} strokeWidth={3} />}
              <span>{delta > 0 ? "+" : ""}{formatWeight(delta, 'kg', 2)}</span>
            </div>
          )}
        </div>

        {/* Status Hubs */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-white/40 rounded-lg border border-white/60 shadow-sm flex items-center gap-2 transition-all">
            <div className={cn(
              "w-6 h-6 rounded flex items-center justify-center shrink-0 transition-all",
              isStable ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600 animate-pulse"
            )}>
              <div className={cn("w-1 h-1 rounded-full", isStable ? "bg-emerald-500" : "bg-amber-500")} />
            </div>
            <div className="min-w-0">
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Status</p>
              <h4 className="text-[9px] font-bold text-slate-900 uppercase tracking-tight truncate leading-none">
                {isStable ? 'Ok' : '...'}
              </h4>
            </div>
          </div>

          <div className="p-2 bg-white/40 rounded-lg border border-white/60 shadow-sm flex items-center gap-2 transition-all">
            <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Info size={12} strokeWidth={3} />
            </div>
            <div className="min-w-0">
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Xotira</p>
              <h4 className="text-[9px] font-bold text-slate-900 uppercase tracking-tight font-mono truncate leading-none">
                {formatWeight(lastWeight, 'kg', 2)}
              </h4>
            </div>
          </div>
        </div>

        {/* Industrial Signal Progress */}
        <div className="space-y-1 pt-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
              <div key={i} className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-700",
                isConnected && i <= (isStable ? 12 : 9) ? "bg-primary shadow-sm shadow-primary/20" : "bg-slate-200"
              )} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}