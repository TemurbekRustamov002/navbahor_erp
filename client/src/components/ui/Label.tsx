import { cn } from '@/lib/utils'
import { LabelHTMLAttributes, forwardRef } from 'react'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> { }

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        className={cn(
          'text-[10px] font-black uppercase tracking-[0.2em] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          'text-muted-foreground/60 mb-3 block ml-1 transition-colors',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Label.displayName = 'Label'

export { Label }