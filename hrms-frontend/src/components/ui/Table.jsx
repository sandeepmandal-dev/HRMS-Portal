import { cn } from './cn'

/**
 * Lightweight table shell. Columns: [{ key, header, render?, className? }]
 * `render(row)` overrides plain field access when a cell needs formatting.
 */
export default function Table({ columns, data, keyField = 'id', onRowClick, emptyState }) {
  if (!data || data.length === 0) {
    return emptyState || null
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn('whitespace-nowrap px-5 py-3 font-medium text-slate-500', col.headerClassName)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row[keyField]}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'border-b border-slate-100 last:border-0 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-slate-50'
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-5 py-3.5 text-ink', col.className)}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
