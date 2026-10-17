import { format, parseISO, isValid } from 'date-fns'

/** Formats an ISO date/datetime string into a short, readable date (e.g. "12 Sep 2026"). */
export function formatDate(value, pattern = 'd MMM yyyy') {
  if (!value) return '—'
  const date = typeof value === 'string' ? parseISO(value) : value
  if (!isValid(date)) return '—'
  return format(date, pattern)
}

/** Formats an ISO datetime string into a readable date + time (e.g. "12 Sep, 9:04 AM"). */
export function formatDateTime(value) {
  if (!value) return '—'
  const date = typeof value === 'string' ? parseISO(value) : value
  if (!isValid(date)) return '—'
  return format(date, 'd MMM, h:mm a')
}

/** Formats a time-only value from a datetime string (e.g. "9:04 AM"). */
export function formatTime(value) {
  if (!value) return '—'
  const date = typeof value === 'string' ? parseISO(value) : value
  if (!isValid(date)) return '—'
  return format(date, 'h:mm a')
}

/** Formats a number as currency. Defaults to INR since that's the common HRMS deployment context; adjust as needed. */
export function formatCurrency(value, currency = 'INR') {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

/** Turns "EMPLOYEE" into "Employee", "ON_LEAVE" into "On leave". */
export function toTitleCase(value) {
  if (!value) return ''
  return value
    .toLowerCase()
    .split('_')
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ')
}

/** Builds "John Doe" -> "JD" for avatar fallbacks. */
export function initials(firstName = '', lastName = '') {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?'
}
