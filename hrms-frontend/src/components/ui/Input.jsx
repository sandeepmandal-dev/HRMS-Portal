import { forwardRef } from 'react'
import { cn } from './cn'

/** Standard text input with an optional label and inline validation message. */
const Input = forwardRef(({ className, label, error, hint, id, required, ...props }, ref) => {
  const inputId = id || props.name

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink-soft">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'h-10 w-full rounded-lg border bg-white px-3 text-sm text-ink placeholder:text-slate-400',
          'transition-shadow duration-150 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500',
          error ? 'border-rose-400' : 'border-slate-200',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
})
Input.displayName = 'Input'

export default Input
