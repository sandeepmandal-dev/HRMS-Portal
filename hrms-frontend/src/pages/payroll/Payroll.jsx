import { useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Wallet, Search, CheckCircle2, Eye } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { useDebounce } from '../../hooks/useDebounce'
import { payrollApi } from '../../api/payrollApi'
import { extractErrorMessage } from '../../api/axiosClient'
import { STAFF_ROLES, MONTHS } from '../../utils/constants'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency, toTitleCase } from '../../utils/formatters'
import {
  Card,
  Input,
  Button,
  Badge,
  Table,
  EmptyState,
  PageSpinner,
  Pagination,
} from '../../components/ui'
import PageHeader from '../../components/common/PageHeader'
import SectionTabs from '../../components/common/SectionTabs'
import RoleGuard from '../../components/common/RoleGuard'
import GeneratePayrollModal from './GeneratePayrollModal'
import PayslipModal from './PayslipModal'

export default function Payroll() {
  const isStaff = STAFF_ROLES.includes(useAuthStore((s) => s.user?.role))
  const [tab, setTab] = useState('mine')
  const [generateOpen, setGenerateOpen] = useState(false)
  const [payslip, setPayslip] = useState(null)

  return (
    <div>
      <PageHeader
        title="Payroll"
        description="Payslip history and monthly pay processing."
        actions={
          <RoleGuard allow={STAFF_ROLES}>
            <Button onClick={() => setGenerateOpen(true)}>
              <Plus size={16} /> Generate payslip
            </Button>
          </RoleGuard>
        }
      />

      {isStaff ? (
        <>
          <SectionTabs
            tabs={[
              { value: 'mine', label: 'My payslips' },
              { value: 'company', label: 'Company payroll' },
            ]}
            active={tab}
            onChange={setTab}
          />
          <div className="mt-6">
            {tab === 'mine' ? <MyPayslips onView={setPayslip} /> : <CompanyPayroll onView={setPayslip} />}
          </div>
        </>
      ) : (
        <MyPayslips onView={setPayslip} />
      )}

      <GeneratePayrollModal
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onSuccess={() => setGenerateOpen(false)}
      />

      <PayslipModal payslip={payslip} onClose={() => setPayslip(null)} />
    </div>
  )
}

function payslipColumns(onView, { showEmployee = false, onMarkPaid } = {}) {
  const cols = []
  if (showEmployee) {
    cols.push({
      key: 'employee',
      header: 'Employee',
      render: (r) => <span className="font-medium text-ink">{r.employeeName}</span>,
    })
  }
  cols.push(
    { key: 'period', header: 'Period', render: (r) => `${MONTHS[r.payPeriodMonth - 1]} ${r.payPeriodYear}` },
    { key: 'days', header: 'Payable days', render: (r) => r.payableDays },
    { key: 'gross', header: 'Gross pay', render: (r) => formatCurrency(r.grossPay) },
    {
      key: 'net',
      header: 'Net pay',
      render: (r) => <span className="font-medium text-ink">{formatCurrency(r.netPay)}</span>,
    },
    { key: 'status', header: 'Status', render: (r) => <Badge status={r.status}>{toTitleCase(r.status)}</Badge> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <div className="flex justify-end gap-2">
          {onMarkPaid && r.status === 'PROCESSED' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMarkPaid(r)
              }}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
            >
              <CheckCircle2 size={14} /> Mark paid
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onView(r)
            }}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
          >
            <Eye size={14} /> View
          </button>
        </div>
      ),
    }
  )
  return cols
}

function MyPayslips({ onView }) {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useAsync(() => payrollApi.getMine({ page, size: 8 }), [page])

  return (
    <Card>
      {isLoading ? (
        <PageSpinner label="Loading your payslips…" />
      ) : (
        <>
          <Table
            columns={payslipColumns(onView)}
            data={data?.content}
            onRowClick={onView}
            emptyState={
              <EmptyState icon={Wallet} title="No payslips yet" description="Generated payslips will appear here." />
            }
          />
          {data && (
            <Pagination
              pageNumber={data.pageNumber}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              pageSize={data.pageSize}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </Card>
  )
}

function CompanyPayroll({ onView }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebounce(search)

  const {
    data: payrolls,
    isLoading,
    refetch,
  } = useAsync(
    () => payrollApi.getAll({ search: debouncedSearch || undefined, page, size: 8 }),
    [debouncedSearch, page]
  )

  async function handleMarkPaid(row) {
    try {
      await payrollApi.markPaid(row.id)
      toast.success('Payslip marked as paid')
      refetch()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <Card>
      <div className="border-b border-slate-100 p-4">
        <div className="relative max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name or employee code… (optional)"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <PageSpinner label="Loading payroll records…" />
      ) : (
        <>
          <Table
            columns={payslipColumns(onView, { showEmployee: true, onMarkPaid: handleMarkPaid })}
            data={payrolls?.content}
            onRowClick={onView}
            emptyState={
              <EmptyState
                icon={Wallet}
                title={search ? 'No matching records' : 'No payroll generated yet'}
                description={search ? 'Try a different name or employee code.' : 'Generated payslips will appear here.'}
              />
            }
          />
          {payrolls && (
            <Pagination
              pageNumber={payrolls.pageNumber}
              totalPages={payrolls.totalPages}
              totalElements={payrolls.totalElements}
              pageSize={payrolls.pageSize}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </Card>
  )
}