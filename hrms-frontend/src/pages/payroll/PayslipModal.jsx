import { MONTHS } from '../../utils/constants'
import { formatCurrency, formatDateTime, toTitleCase } from '../../utils/formatters'
import { Modal, Badge } from '../../components/ui'

export default function PayslipModal({ payslip, onClose }) {
  if (!payslip) return null

  const rows = [
    { label: 'Basic salary (prorated)', value: payslip.basicSalary },
    { label: 'Allowances', value: payslip.allowances },
    { label: 'Deductions', value: -payslip.deductions },
  ]

  return (
    <Modal
      open={Boolean(payslip)}
      onClose={onClose}
      title={`${MONTHS[payslip.payPeriodMonth - 1]} ${payslip.payPeriodYear}`}
      description={payslip.employeeName}
      size="sm"
    >
      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
        <span className="text-sm text-slate-500">Status</span>
        <Badge status={payslip.status}>{toTitleCase(payslip.status)}</Badge>
      </div>

      <div className="mt-4 divide-y divide-slate-100">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-slate-500">{row.label}</span>
            <span className={row.value < 0 ? 'text-rose-600' : 'text-ink'}>
              {row.value < 0 ? '−' : ''}{formatCurrency(Math.abs(row.value))}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between py-3">
          <span className="font-medium text-ink">Net pay</span>
          <span className="font-display text-lg font-semibold text-ink">{formatCurrency(payslip.netPay)}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <div>
          <p className="text-slate-400">Payable days</p>
          <p className="mt-0.5 font-medium text-ink">{payslip.payableDays}</p>
        </div>
        <div>
          <p className="text-slate-400">Generated</p>
          <p className="mt-0.5 font-medium text-ink">{formatDateTime(payslip.generatedAt)}</p>
        </div>
        {payslip.paidAt && (
          <div className="col-span-2">
            <p className="text-slate-400">Paid on</p>
            <p className="mt-0.5 font-medium text-ink">{formatDateTime(payslip.paidAt)}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
