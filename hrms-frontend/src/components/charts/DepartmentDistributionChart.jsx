import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const PALETTE = ['#4F46E5', '#818CF8', '#059669', '#D97706', '#E11D48', '#6B7280', '#0EA5E9']

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-popover">
      <span className="font-medium text-ink">{name}</span>: {value} {value === 1 ? 'person' : 'people'}
    </div>
  )
}

/** Donut chart of headcount by department, built from the current employee list. */
export default function DepartmentDistributionChart({ data }) {
  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={42} outerRadius={64} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-2">
        {data.slice(0, 5).map((d, i) => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
              {d.name}
            </span>
            <span className="font-medium text-ink">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
