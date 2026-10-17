import { cn } from './cn'

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-16 text-center', className)}>
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Icon size={22} />
        </div>
      )}
      <div>
        <h3 className="font-medium text-ink">{title}</h3>
        {description && <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}
