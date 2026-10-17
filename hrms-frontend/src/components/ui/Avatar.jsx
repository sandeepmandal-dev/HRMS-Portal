import { cn } from './cn'

const PALETTE = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-50 text-emerald-600',
  'bg-amber-50 text-amber-600',
  'bg-rose-50 text-rose-600',
]

function colorFor(seed) {
  const code = (seed || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return PALETTE[code % PALETTE.length]
}

export default function Avatar({ name = '', size = 'md', className }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')

  const sizes = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-12 w-12 text-base',
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold',
        colorFor(name),
        sizes[size],
        className
      )}
    >
      {initials || '?'}
    </div>
  )
}
