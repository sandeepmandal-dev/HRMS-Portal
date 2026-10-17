import { cn } from './cn'

// Semantic status color mapping — used consistently for leave/payroll/attendance/employment status
// across the whole app so a color always means the same thing.
const TONE_MAP = {
  neutral: 'bg-slate-100 text-slate-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-rose-50 text-rose-600',
}

const STATUS_TONE = {
  ACTIVE: 'success',
  PRESENT: 'success',
  APPROVED: 'success',
  PAID: 'success',
  PROCESSED: 'indigo',
  PENDING: 'warning',
  HALF_DAY: 'warning',
  ON_LEAVE: 'warning',
  SUSPENDED: 'warning',
  DRAFT: 'neutral',
  WEEKEND: 'neutral',
  HOLIDAY: 'neutral',
  ABSENT: 'danger',
  REJECTED: 'danger',
  TERMINATED: 'danger',
  RESIGNED: 'danger',
  CANCELLED: 'danger',
}

/** Pass either a known status string (auto-toned) or an explicit `tone`. */
export default function Badge({ status, tone, children, className }) {
  const resolvedTone = tone || STATUS_TONE[status] || 'neutral'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        TONE_MAP[resolvedTone],
        className
      )}
    >
      {children}
    </span>
  )
}
