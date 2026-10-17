import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Pencil,
  UserX,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
} from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { employeeApi } from '../../api/employeeApi'
import { attendanceApi } from '../../api/attendanceApi'
import { payrollApi } from '../../api/payrollApi'
import { extractErrorMessage } from '../../api/axiosClient'
import { STAFF_ROLES, MONTHS } from '../../utils/constants'
import { formatDate, formatDateTime, formatCurrency, toTitleCase, initials } from '../../utils/formatters'
import { Card, CardBody, Button, Badge, Table, EmptyState, PageSpinner, ConfirmDialog } from '../../components/ui'
import RoleGuard from '../../components/common/RoleGuard'
import SectionTabs from '../../components/common/SectionTabs'
import EmployeeEditModal from './EmployeeEditModal'

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('attendance')
  const [editOpen, setEditOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null) // 'deactivate' | 'reactivate' | null
  const [isActing, setIsActing] = useState(false)

  const { data: employee, isLoading, refetch } = useAsync(() => employeeApi.getById(id), [id])
  const { data: attendance } = useAsync(
    () => (tab === 'attendance' ? attendanceApi.getForEmployee(id, { size: 8 }) : Promise.resolve(null)),
    [id, tab]
  )
  const { data: payroll } = useAsync(
    () => (tab === 'payroll' ? payrollApi.getForEmployee(id, { size: 8 }) : Promise.resolve(null)),
    [id, tab]
  )

  async function handleStatusChange() {
    setIsActing(true)
    try {
      if (confirmAction === 'deactivate') {
        await employeeApi.deactivate(id)
        toast.success('Employee deactivated')
      } else {
        await employeeApi.reactivate(id)
        toast.success('Employee reactivated')
      }
      setConfirmAction(null)
      refetch()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setIsActing(false)
    }
  }

  if (isLoading) return <PageSpinner label="Loading employee…" />
  if (!employee) return null

  const isActive = employee.employmentStatus === 'ACTIVE'

  return (
    <div>
      <button
        onClick={() => navigate('/employees')}
        className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to employees
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <Card className="lg:col-span-1">
          <CardBody className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-semibold text-indigo-700">
              {initials(employee.firstName, employee.lastName)}
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold text-ink">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-sm text-slate-500">{employee.designation?.title || 'No designation'}</p>
            <div className="mt-3">
              <Badge status={employee.employmentStatus}>{toTitleCase(employee.employmentStatus)}</Badge>
            </div>

            <div className="mt-6 w-full space-y-3 border-t border-slate-100 pt-6 text-left text-sm">
              <InfoRow icon={Mail} label={employee.email} />
              <InfoRow icon={Phone} label={employee.phone || 'Not provided'} />
              <InfoRow icon={MapPin} label={employee.address || 'Not provided'} />
              <InfoRow icon={Briefcase} label={employee.department?.name || 'No department'} />
              <InfoRow icon={Calendar} label={`Joined ${formatDate(employee.dateOfJoining)}`} />
            </div>

            <RoleGuard allow={STAFF_ROLES}>
              <div className="mt-6 flex w-full gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => setEditOpen(true)}>
                  <Pencil size={15} /> Edit
                </Button>
                {isActive ? (
                  <Button variant="danger" className="flex-1" onClick={() => setConfirmAction('deactivate')}>
                    <UserX size={15} /> Deactivate
                  </Button>
                ) : (
                  <Button variant="secondary" className="flex-1" onClick={() => setConfirmAction('reactivate')}>
                    <UserCheck size={15} /> Reactivate
                  </Button>
                )}
              </div>
            </RoleGuard>
          </CardBody>
        </Card>

        {/* Activity */}
        <Card className="lg:col-span-2">
          <div className="px-5 pt-4">
            <SectionTabs
              tabs={[
                { value: 'attendance', label: 'Attendance' },
                { value: 'payroll', label: 'Payroll' },
              ]}
              active={tab}
              onChange={setTab}
            />
          </div>

          {tab === 'attendance' && (
            <Table
              columns={[
                { key: 'date', header: 'Date', render: (r) => formatDate(r.attendanceDate) },
                { key: 'in', header: 'Check-in', render: (r) => (r.checkInTime ? formatDateTime(r.checkInTime).split(', ')[1] : '—') },
                { key: 'out', header: 'Check-out', render: (r) => (r.checkOutTime ? formatDateTime(r.checkOutTime).split(', ')[1] : '—') },
                { key: 'hours', header: 'Hours', render: (r) => (r.workHours ? `${r.workHours}h` : '—') },
                { key: 'status', header: 'Status', render: (r) => <Badge status={r.status}>{toTitleCase(r.status)}</Badge> },
              ]}
              data={attendance?.content}
              emptyState={<EmptyState title="No attendance records" description="Nothing logged in this range yet." />}
            />
          )}

          {tab === 'payroll' && (
            <Table
              columns={[
                { key: 'period', header: 'Period', render: (r) => `${MONTHS[r.payPeriodMonth - 1]} ${r.payPeriodYear}` },
                { key: 'gross', header: 'Gross', render: (r) => formatCurrency(r.grossPay) },
                { key: 'net', header: 'Net pay', render: (r) => <span className="font-medium">{formatCurrency(r.netPay)}</span> },
                { key: 'status', header: 'Status', render: (r) => <Badge status={r.status}>{toTitleCase(r.status)}</Badge> },
              ]}
              data={payroll?.content}
              emptyState={<EmptyState title="No payslips" description="Payroll hasn't been generated for this employee yet." />}
            />
          )}
        </Card>
      </div>

      <EmployeeEditModal
        open={editOpen}
        employee={employee}
        onClose={() => setEditOpen(false)}
        onSuccess={() => {
          setEditOpen(false)
          refetch()
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleStatusChange}
        isLoading={isActing}
        tone={confirmAction === 'deactivate' ? 'danger' : 'primary'}
        title={confirmAction === 'deactivate' ? 'Deactivate this employee?' : 'Reactivate this employee?'}
        description={
          confirmAction === 'deactivate'
            ? 'Their login will be disabled and their status set to terminated. This can be reversed later.'
            : 'Their login will be re-enabled and their status set back to active.'
        }
        confirmLabel={confirmAction === 'deactivate' ? 'Deactivate' : 'Reactivate'}
      />
    </div>
  )
}

function InfoRow({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2.5 text-slate-600">
      <Icon size={15} className="shrink-0 text-slate-400" />
      <span className="truncate">{label}</span>
    </div>
  )
}
