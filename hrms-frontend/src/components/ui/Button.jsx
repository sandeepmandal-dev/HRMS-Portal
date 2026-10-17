import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from './cn'

const VARIANTS = {
  primary: 'bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700 shadow-sm',
  secondary: 'bg-white text-ink border border-slate-200 hover:bg-slate-50 active:bg-slate-100',
  ghost: 'text-ink hover:bg-slate-100 active:bg-slate-200',
  danger: 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 active:bg-rose-100',
  dangerSolid: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm',
}

const SIZES = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-[15px] gap-2',
}

/**
 * Base action button. Variants map to intent (primary action, secondary, ghost, destructive),
 * not to arbitrary color choices, so usage stays consistent across the app.
 */
const Button = forwardRef(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export default Button
