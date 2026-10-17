import { Loader2 } from 'lucide-react'
import { cn } from './cn'

export default function Spinner({ className, size = 20 }) {
  return <Loader2 className={cn('animate-spin text-indigo-500', className)} size={size} />
}

export function PageSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex h-full min-h-[240px] w-full flex-col items-center justify-center gap-3 text-slate-400">
      <Spinner size={28} />
      <p className="text-sm">{label}</p>
    </div>
  )
}
