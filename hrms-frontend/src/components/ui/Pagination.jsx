import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from './cn'

/** Works directly against a Spring Data PageResponse shape: { pageNumber, totalPages, totalElements }. */
export default function Pagination({ pageNumber, totalPages, totalElements, pageSize, onPageChange }) {
  if (totalPages <= 1) return null

  const from = pageNumber * pageSize + 1
  const to = Math.min((pageNumber + 1) * pageSize, totalElements)

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
      <p className="text-xs text-slate-500">
        Showing <span className="font-medium text-ink">{from}–{to}</span> of{' '}
        <span className="font-medium text-ink">{totalElements}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber === 0}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500',
            'transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none'
          )}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-2 text-xs font-medium text-ink">
          {pageNumber + 1} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber >= totalPages - 1}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500',
            'transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none'
          )}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
