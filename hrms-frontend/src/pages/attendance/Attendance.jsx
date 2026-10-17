import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { LogIn, LogOut, Clock, Search } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { attendanceApi } from '../../api/attendanceApi'
import { employeeApi } from '../../api/employeeApi'
import { extractErrorMessage } from '../../api/axiosClient'
import { APPROVER_ROLES } from '../../utils/constants'
import { useAuthStore } from '../../store/authStore'
import { formatDate, formatTime, toTitleCase } from '../../utils/formatters'
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
  Badge,
  Table,
  EmptyState,
  PageSpinner,
  Pagination,
} from '../../components/ui'
import PageHeader from '../../components/common/PageHeader'
import SectionTabs from '../../components/common/SectionTabs'

const toLocalISODate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const todayISO = () => toLocalISODate(new Date())

const firstOfMonthISO = () => {
  const d = new Date()
  return toLocalISODate(new Date(d.getFullYear(), d.getMonth(), 1))
}
export default function Attendance() {
  const [searchParams] = useSearchParams()
  const isApprover = APPROVER_ROLES.includes(useAuthStore((s) => s.user?.role))
  const [tab, setTab] = useState(searchParams.get('tab') === 'team' ? 'team' : 'mine')

  return (
    <div>
      <PageHeader title="Attendance" description="Check in, review your history, or look up a teammate's record." />

      {isApprover ? (
        <>
          <SectionTabs
            tabs={[
              { value: 'mine', label: 'My attendance' },
              { value: 'team', label: 'Team lookup' },
            ]}
            active={tab}
            onChange={setTab}
          />
          <div className="mt-6">{tab === 'mine' ? <MyAttendance /> : <TeamAttendance />}</div>
        </>
      ) : (
        <MyAttendance />
      )}
    </div>
  )
}

function MyAttendance() {
  const [from, setFrom] = useState(firstOfMonthISO())
  const [to, setTo] = useState(todayISO())
  const [page, setPage] = useState(0)
  const [actionLoading, setActionLoading] = useState(false)

  const { data: today, refetch: refetchToday } = useAsync(
    () => attendanceApi.getMine({ from: todayISO(), to: todayISO(), size: 1 }),
    []
  )
  const { data: history, isLoading, refetch } = useAsync(
    () => attendanceApi.getMine({ from, to, page, size: 8 }),
    [from, to, page]
  )

  const todayRecord = today?.content?.[0]
  const hasCheckedIn = Boolean(todayRecord?.checkInTime)
  const hasCheckedOut = Boolean(todayRecord?.checkOutTime)

  async function handleCheckIn() {
    setActionLoading(true)
    try {
      await attendanceApi.checkIn()
      toast.success('Checked in')
      refetchToday()
      refetch()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCheckOut() {
    setActionLoading(true)
    try {
      await attendanceApi.checkOut()
      toast.success('Checked out')
      refetchToday()
      refetch()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardBody className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Clock size={24} />
          </div>
          <p className="mt-4 text-sm text-slate-500">{formatDate(new Date(), 'EEEE, d MMMM')}</p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink">
            {hasCheckedIn ? (hasCheckedOut ? 'Complete' : 'In progress') : 'Not started'}
          </p>
          {todayRecord?.checkInTime && (
            <p className="mt-1 text-xs text-slate-500">
              In {formatTime(todayRecord.checkInTime)}
              {todayRecord.checkOutTime && ` · Out ${formatTime(todayRecord.checkOutTime)}`}
            </p>
          )}
          <div className="mt-5 w-full">
            {!hasCheckedIn && (
              <Button onClick={handleCheckIn} isLoading={actionLoading} className="w-full">
                <LogIn size={16} /> Check in
              </Button>
            )}
            {hasCheckedIn && !hasCheckedOut && (
              <Button onClick={handleCheckOut} isLoading={actionLoading} variant="secondary" className="w-full">
                <LogOut size={16} /> Check out
              </Button>
            )}
            {hasCheckedIn && hasCheckedOut && (
              <div className="rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700">
                See you tomorrow 👋
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <p className="font-display text-base font-semibold text-ink">History</p>
          <div className="flex items-center gap-2">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-36 text-xs" />
            <span className="text-slate-400">–</span>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-36 text-xs" />
          </div>
        </CardHeader>
        {isLoading ? (
          <PageSpinner label="Loading history…" />
        ) : (
          <AttendanceTable data={history?.content} page={history} onPageChange={setPage} />
        )}
      </Card>
    </div>
  )
}

function TeamAttendance() {
  const [employeeId, setEmployeeId] = useState('')
  const [from, setFrom] = useState(firstOfMonthISO())
  const [to, setTo] = useState(todayISO())
  const [page, setPage] = useState(0)

  const { data: employees } = useAsync(() => employeeApi.search({ page: 0, size: 200 }), [])
  const { data: history, isLoading } = useAsync(
    () => (employeeId ? attendanceApi.getForEmployee(employeeId, { from, to, page, size: 8 }) : Promise.resolve(null)),
    [employeeId, from, to, page]
  )

  return (
    <Card>
      <CardHeader className="flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Search size={15} className="text-slate-400" />
          <Select
            value={employeeId}
            onChange={(e) => {
              setEmployeeId(e.target.value)
              setPage(0)
            }}
            className="w-56"
          >
            <option value="">Select an employee…</option>
            {employees?.content?.map((e) => (
              <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-36 text-xs" />
          <span className="text-slate-400">–</span>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-36 text-xs" />
        </div>
      </CardHeader>

      {!employeeId ? (
        <EmptyState icon={Search} title="Choose an employee" description="Select someone above to view their attendance history." />
      ) : isLoading ? (
        <PageSpinner label="Loading history…" />
      ) : (
        <AttendanceTable data={history?.content} page={history} onPageChange={setPage} />
      )}
    </Card>
  )
}

function AttendanceTable({ data, page, onPageChange }) {
  return (
    <>
      <Table
        columns={[
          { key: 'date', header: 'Date', render: (r) => formatDate(r.attendanceDate) },
          { key: 'in', header: 'Check-in', render: (r) => formatTime(r.checkInTime) },
          { key: 'out', header: 'Check-out', render: (r) => formatTime(r.checkOutTime) },
          { key: 'hours', header: 'Hours', render: (r) => (r.workHours ? `${r.workHours}h` : '—') },
          { key: 'status', header: 'Status', render: (r) => <Badge status={r.status}>{toTitleCase(r.status)}</Badge> },
        ]}
        data={data}
        emptyState={<EmptyState icon={Clock} title="No records in this range" description="Try a different date range." />}
      />
      {page && page.totalPages > 1 && (
        <div className="border-t border-slate-100">
          <Pagination
            pageNumber={page.pageNumber}
            totalPages={page.totalPages}
            totalElements={page.totalElements}
            pageSize={page.pageSize}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  )
}
