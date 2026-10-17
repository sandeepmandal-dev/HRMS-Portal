import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Users,
  Clock,
  CalendarCheck,
  Wallet,
  LogIn,
  LogOut,
  ArrowRight,
  CalendarDays,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAsync } from '../../hooks/useAsync'
import { employeeApi } from '../../api/employeeApi'
import { attendanceApi } from '../../api/attendanceApi'
import { leaveApi } from '../../api/leaveApi'
import { payrollApi } from '../../api/payrollApi'
import { extractErrorMessage } from '../../api/axiosClient'
import { APPROVER_ROLES, STAFF_ROLES, MONTHS } from '../../utils/constants'
import { formatCurrency, formatTime, toTitleCase } from '../../utils/formatters'
import { Card, CardHeader, CardBody, Button, Badge, PageSpinner } from '../../components/ui'
import StatCard from '../../components/common/StatCard'
import LeaveBalanceChart from '../../components/charts/LeaveBalanceChart'
import DepartmentDistributionChart from '../../components/charts/DepartmentDistributionChart'

const todayISO = new Date().toISOString().slice(0, 10)

export default function Dashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const isApprover = APPROVER_ROLES.includes(user?.role)
  const isStaff = STAFF_ROLES.includes(user?.role)

  const [checkState, setCheckState] = useState({ loading: false })

  const { data: todayAttendance, refetch: refetchAttendance } = useAsync(
    () => attendanceApi.getMine({ from: todayISO, to: todayISO, size: 1 }),
    []
  )
  const { data: leaveBalance } = useAsync(() => leaveApi.getMyBalance(), [])
  const { data: pendingApprovals } = useAsync(
    () => (isApprover ? leaveApi.getPendingApprovals({ size: 5 }) : Promise.resolve(null)),
    [isApprover]
  )
  const { data: myLeaves } = useAsync(() => leaveApi.getMine({ size: 5 }), [])
  const { data: recentPayroll } = useAsync(() => payrollApi.getMine({ size: 1 }), [])
  const { data: employeeDirectory, isLoading: loadingDirectory } = useAsync(
    () => (isStaff ? employeeApi.search({ page: 0, size: 100 }) : Promise.resolve(null)),
    [isStaff]
  )

  const todayRecord = todayAttendance?.content?.[0]
  const hasCheckedIn = Boolean(todayRecord?.checkInTime)
  const hasCheckedOut = Boolean(todayRecord?.checkOutTime)

  const departmentChartData = useMemo(() => {
    if (!employeeDirectory?.content) return []
    const counts = {}
    employeeDirectory.content.forEach((e) => {
      const name = e.department?.name || 'Unassigned'
      counts[name] = (counts[name] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [employeeDirectory])

  async function handleCheckIn() {
    setCheckState({ loading: true })
    try {
      await attendanceApi.checkIn()
      toast.success('Checked in — have a good one')
      refetchAttendance()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setCheckState({ loading: false })
    }
  }

  async function handleCheckOut() {
    setCheckState({ loading: true })
    try {
      await attendanceApi.checkOut()
      toast.success('Checked out — see you tomorrow')
      refetchAttendance()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setCheckState({ loading: false })
    }
  }

  const greeting = useGreeting()
  const firstName = profile?.firstName || user?.email?.split('@')[0]

  const totalLeaveRemaining = useMemo(() => {
    if (!leaveBalance) return null
    return leaveBalance.reduce((sum, b) => sum + Number(b.remainingDays), 0)
  }, [leaveBalance])

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <p className="text-sm text-slate-500">{greeting}</p>
        <h1 className="font-display text-display-sm font-semibold text-ink">
          {firstName ? `Hi, ${firstName}` : 'Welcome'}
        </h1>
      </motion.div>

      {/* Hero row */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard
          variant="hero"
          tone="ink"
          icon={Clock}
          label="Today's attendance"
          value={hasCheckedIn ? (hasCheckedOut ? 'Day complete' : 'Checked in') : 'Not checked in'}
          sublabel={
            todayRecord?.checkInTime
              ? `In at ${formatTime(todayRecord.checkInTime)}${todayRecord.checkOutTime ? ` · Out at ${formatTime(todayRecord.checkOutTime)}` : ''}`
              : 'Mark your attendance for today'
          }
          delay={0}
        />

        <div className="flex flex-col gap-4">
          <StatCard
            icon={CalendarDays}
            label="Leave balance"
            value={totalLeaveRemaining !== null ? `${totalLeaveRemaining} days` : '—'}
            sublabel="Remaining this year"
            delay={0.05}
          />
          <StatCard
            icon={Wallet}
            label="Last payslip"
            value={recentPayroll?.content?.[0] ? formatCurrency(recentPayroll.content[0].netPay) : '—'}
            sublabel={
              recentPayroll?.content?.[0]
                ? `${MONTHS[recentPayroll.content[0].payPeriodMonth - 1]} ${recentPayroll.content[0].payPeriodYear}`
                : 'No payslips yet'
            }
            delay={0.1}
          />
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div>
            <p className="text-sm font-medium text-ink">Quick actions</p>
            <p className="mt-0.5 text-xs text-slate-500">Mark attendance or apply for leave</p>
          </div>
          <div className="flex flex-col gap-2.5">
            {!hasCheckedIn && (
              <Button onClick={handleCheckIn} isLoading={checkState.loading} className="w-full">
                <LogIn size={16} /> Check in
              </Button>
            )}
            {hasCheckedIn && !hasCheckedOut && (
              <Button onClick={handleCheckOut} isLoading={checkState.loading} variant="secondary" className="w-full">
                <LogOut size={16} /> Check out
              </Button>
            )}
            {hasCheckedIn && hasCheckedOut && (
              <div className="rounded-lg bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700">
                Attendance complete for today
              </div>
            )}
            <Button variant="secondary" className="w-full" onClick={() => navigate('/leave')}>
              Apply for leave
            </Button>
          </div>
        </div>
      </div>

      {/* Secondary content */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <p className="font-display text-base font-semibold text-ink">Leave balance by type</p>
              <p className="text-xs text-slate-500">Allocated vs. used for {new Date().getFullYear()}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/leave')}>
              View all <ArrowRight size={14} />
            </Button>
          </CardHeader>
          <CardBody>
            {leaveBalance ? (
              <LeaveBalanceChart data={leaveBalance} />
            ) : (
              <PageSpinner label="Loading leave balance…" />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="font-display text-base font-semibold text-ink">Recent requests</p>
          </CardHeader>
          <CardBody className="!p-0">
            {myLeaves?.content?.length ? (
              <ul className="divide-y divide-slate-100">
                {myLeaves.content.map((leave) => (
                  <li key={leave.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{leave.leaveTypeName}</p>
                      <p className="text-xs text-slate-500">{leave.numberOfDays} day(s)</p>
                    </div>
                    <Badge status={leave.status}>{toTitleCase(leave.status)}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-slate-400">No leave requests yet</div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Staff-only org overview */}
      {isStaff && (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <StatCard
            icon={Users}
            label="Total employees"
            value={loadingDirectory ? '—' : employeeDirectory?.totalElements ?? 0}
            sublabel="Across all departments"
          />
          <Card className="lg:col-span-2">
            <CardHeader>
              <p className="font-display text-base font-semibold text-ink">Headcount by department</p>
            </CardHeader>
            <CardBody>
              {departmentChartData.length ? (
                <DepartmentDistributionChart data={departmentChartData} />
              ) : (
                <p className="py-6 text-center text-sm text-slate-400">No department data yet</p>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Approver-only pending approvals */}
      {isApprover && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <div>
                <p className="font-display text-base font-semibold text-ink">Pending your approval</p>
                <p className="text-xs text-slate-500">Leave requests waiting on your decision</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/leave?tab=approvals')}>
                Review all <ArrowRight size={14} />
              </Button>
            </CardHeader>
            <CardBody className="!p-0">
              {pendingApprovals?.content?.length ? (
                <ul className="divide-y divide-slate-100">
                  {pendingApprovals.content.map((leave) => (
                    <li key={leave.id} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-ink">{leave.employeeName}</p>
                        <p className="text-xs text-slate-500">
                          {leave.leaveTypeName} · {leave.numberOfDays} day(s)
                        </p>
                      </div>
                      <Badge status="PENDING">Pending</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-2 px-5 py-8 text-center text-sm text-slate-400">
                  <CalendarCheck size={16} className="mx-auto" />
                  <span className="mx-auto">Nothing waiting on you right now</span>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}

function useGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
