import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const COLORS = { allocated: '#E5E7EB', used: '#4F46E5' }

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-popover">
      <p className="mb-1 font-medium text-ink">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-medium">{p.value} days</span>
        </p>
      ))}
    </div>
  )
}

/** Bar chart comparing allocated vs used days across leave types. */
export default function LeaveBalanceChart({ data }) {
  const chartData = data.map((d) => ({
    name: d.leaveTypeName,
    Allocated: Number(d.allocatedDays),
    Used: Number(d.usedDays),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} barGap={4} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#F1F5F9" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={28} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F8FAFC' }} />
        <Bar dataKey="Allocated" fill={COLORS.allocated} radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="Used" fill={COLORS.used} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}
