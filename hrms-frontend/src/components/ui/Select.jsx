import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from './cn'

/** Native select styled to match Input — kept native for accessibility and mobile support. */
const Select = forwardRef(
  ({ className, label, error, required, children, placeholder, id, ...props }, ref) => {
    const selectId = id || props.name

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-ink-soft">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'h-10 w-full appearance-none rounded-lg border bg-white pl-3 pr-9 text-sm text-ink',
              'transition-shadow duration-150 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500',
              error ? 'border-rose-400' : 'border-slate-200',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

export default Select
