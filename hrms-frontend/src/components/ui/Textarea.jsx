import { forwardRef } from 'react'
import { cn } from './cn'

const Textarea = forwardRef(({ className, label, error, required, id, ...props }, ref) => {
  const textareaId = id || props.name

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-ink-soft">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={3}
        className={cn(
          'w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-400',
          'transition-shadow duration-150 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500',
          error ? 'border-rose-400' : 'border-slate-200',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
})
Textarea.displayName = 'Textarea'

export default Textarea
