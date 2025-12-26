import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'error' | 'info'
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const icons: Record<string, any> = {
      default: Info,
      info: Info,
      destructive: XCircle,
      error: XCircle,
      success: CheckCircle,
      warning: AlertCircle,
    }

    const Icon = icons[variant] ?? Info

    return (
      <div
        className={cn(
          'relative w-full rounded-2xl border-2 p-5 flex items-start gap-4 transition-all duration-300',
          {
            'border-primary/20 bg-primary/5 text-foreground shadow-lg shadow-primary/5': variant === 'default' || variant === 'info',
            'border-rose-200 bg-rose-50 text-rose-900 shadow-lg shadow-rose-500/5': variant === 'destructive' || variant === 'error',
            'border-emerald-200 bg-emerald-50 text-emerald-900 shadow-lg shadow-emerald-500/5': variant === 'success',
            'border-amber-200 bg-amber-50 text-amber-900 shadow-lg shadow-amber-500/5': variant === 'warning',
          },
          className
        )}
        ref={ref}
        {...props}
      >
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
          {
            'bg-primary/10 text-primary': variant === 'default' || variant === 'info',
            'bg-rose-100 text-rose-600': variant === 'destructive' || variant === 'error',
            'bg-emerald-100 text-emerald-600': variant === 'success',
            'bg-amber-100 text-amber-600': variant === 'warning',
          }
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 pt-2">
          <div className="text-[13px] font-black uppercase tracking-tight">{children}</div>
        </div>
      </div>
    )
  }
)
Alert.displayName = 'Alert'

export { Alert }