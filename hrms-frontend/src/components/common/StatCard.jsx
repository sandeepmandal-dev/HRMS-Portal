import { motion } from 'framer-motion'
import { cn } from '../ui/cn'

/**
 * A metric card. `variant="hero"` renders the large, dashboard-leading treatment;
 * `variant="compact"` renders the smaller secondary metric used alongside it.
 */
export default function StatCard({ icon: Icon, label, value, sublabel, trend, variant = 'compact', tone = 'ink', delay = 0 }) {
  const toneClasses = {
    ink: 'bg-ink-900 text-white',
    indigo: 'bg-indigo-500 text-white',
    paper: 'bg-white text-ink border border-slate-200',
  }

  if (variant === 'hero') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
        className={cn('relative overflow-hidden rounded-2xl p-6', toneClasses[tone])}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-sm text-white/70">
            {Icon && <Icon size={16} />}
            <span>{label}</span>
          </div>
          <p className="mt-3 font-display text-display-md font-semibold tabular-nums">{value}</p>
          {sublabel && <p className="mt-2 text-sm text-white/60">{sublabel}</p>}
        </div>
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-10 -right-2 h-32 w-32 rounded-full bg-white/5" />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-slate-200 bg-white p-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        {Icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-500">
            <Icon size={14} />
          </div>
        )}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold text-ink tabular-nums">{value}</p>
      {trend && (
        <p className={cn('mt-1 text-xs font-medium', trend.positive ? 'text-emerald-600' : 'text-rose-600')}>
          {trend.label}
        </p>
      )}
      {sublabel && !trend && <p className="mt-1 text-xs text-slate-400">{sublabel}</p>}
    </motion.div>
  )
}
