import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, CalendarDays, CheckCircle2, XCircle, Ban } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { leaveApi } from '../../api/leaveApi'
import { extractErrorMessage } from '../../api/axiosClient'
import { APPROVER_ROLES } from '../../utils/constants'
import { useAuthStore } from '../../store/authStore'
import { formatDate, toTitleCase } from '../../utils/formatters'
import {
  Card,
  Button,
  Badge,
  Table,
  EmptyState,
  PageSpinner,
  Pagination,
  ConfirmDialog,
} from '../../components/ui'
import PageHeader from '../../components/common/PageHeader'
import SectionTabs from '../../components/common/SectionTabs'
import LeaveApplyModal from './LeaveApplyModal'
import LeaveDecisionModal from './LeaveDecisionModal'

export default function Leave() {
  const [searchParams] = useSearchParams()
  const isApprover = APPROVER_ROLES.includes(useAuthStore((s) => s.user?.role))
  const [tab, setTab] = useState(searchParams.get('tab') === 'approvals' ? 'approvals' : 'mine')
  const [applyOpen, setApplyOpen] = useState(false)

  const { data: balance } = useAsync(() => leaveApi.getMyBalance(), [])

  return (
    <div>
      <PageHeader
        title="Leave"
        description="Apply for time off and track your balance."
        actions={
          <Button onClick={() => setApplyOpen(true)}>
            <Plus size={16} /> Apply for leave
          </Button>
        }
      />

      {/* Balance strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {balance?.map((b) => (
          <Card key={b.leaveTypeId} className="p-4">
            <p className="text-xs font-medium text-slate-500">{b.leaveTypeName}</p>
            <p className="mt-1.5 font-display text-xl font-semibold text-ink">
              {b.remainingDays}
              <span className="ml-1 text-sm font-normal text-slate-400">/ {b.allocatedDays}</span>
            </p>
          </Card>
        ))}
      </div>

      {isApprover ? (
        <>
          <SectionTabs
            tabs={[
              { value: 'mine', label: 'My requests' },
              { value: 'approvals', label: 'Approvals' },
            ]}
            active={tab}
            onChange={setTab}
          />
          <div className="mt-6">{tab === 'mine' ? <MyLeaveRequests /> : <PendingApprovals />}</div>
        </>
      ) : (
        <MyLeaveRequests />
      )}

      <LeaveApplyModal
        open={applyOpen}
        leaveTypes={balance}
        onClose={() => setApplyOpen(false)}
        onSuccess={() => setApplyOpen(false)}
      />
    </div>
  )
}

function MyLeaveRequests() {
  const [page, setPage] = useState(0)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const { data, isLoading, refetch } = useAsync(() => leaveApi.getMine({ page, size: 8 }), [page])

  async function handleCancel() {
    setIsCancelling(true)
    try {
      await leaveApi.cancel(cancelTarget.id)
      toast.success('Leave request cancelled')
      setCancelTarget(null)
      refetch()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <Card>
      {isLoading ? (
        <PageSpinner label="Loading your requests…" />
      ) : (
        <>
          <Table
            columns={[
              { key: 'type', header: 'Type', render: (r) => <span className="font-medium">{r.leaveTypeName}</span> },
              { key: 'dates', header: 'Dates', render: (r) => `${formatDate(r.startDate)} – ${formatDate(r.endDate)}` },
              { key: 'days', header: 'Days', render: (r) => r.numberOfDays },
              { key: 'status', header: 'Status', render: (r) => <Badge status={r.status}>{toTitleCase(r.status)}</Badge> },
              {
                key: 'actions',
                header: '',
                className: 'text-right',
                render: (r) =>
                  ['PENDING', 'APPROVED'].includes(r.status) && (
                    <button
                      onClick={() => setCancelTarget(r)}
                      className="text-xs font-medium text-rose-600 hover:underline"
                    >
                      Cancel
                    </button>
                  ),
              },
            ]}
            data={data?.content}
            emptyState={
              <EmptyState icon={CalendarDays} title="No leave requests yet" description="Apply for leave to see it show up here." />
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

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        isLoading={isCancelling}
        title="Cancel this leave request?"
        description="If it was already approved, the days will be credited back to your balance."
        confirmLabel="Cancel request"
      />
    </Card>
  )
}

function PendingApprovals() {
  const [page, setPage] = useState(0)
  const [decisionTarget, setDecisionTarget] = useState(null) // { request, decision }

  const { data, isLoading, refetch } = useAsync(() => leaveApi.getPendingApprovals({ page, size: 8 }), [page])

  return (
    <Card>
      {isLoading ? (
        <PageSpinner label="Loading approvals…" />
      ) : (
        <>
          <Table
            columns={[
              { key: 'employee', header: 'Employee', render: (r) => <span className="font-medium">{r.employeeName}</span> },
              { key: 'type', header: 'Type', render: (r) => r.leaveTypeName },
              { key: 'dates', header: 'Dates', render: (r) => `${formatDate(r.startDate)} – ${formatDate(r.endDate)}` },
              { key: 'days', header: 'Days', render: (r) => r.numberOfDays },
              { key: 'reason', header: 'Reason', render: (r) => <span className="text-slate-500">{r.reason || '—'}</span> },
              {
                key: 'actions',
                header: '',
                className: 'text-right',
                render: (r) => (
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setDecisionTarget({ request: r, decision: 'REJECTED' })}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                    <button
                      onClick={() => setDecisionTarget({ request: r, decision: 'APPROVED' })}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                    >
                      <CheckCircle2 size={14} /> Approve
                    </button>
                  </div>
                ),
              },
            ]}
            data={data?.content}
            emptyState={
              <EmptyState icon={Ban} title="Nothing to review" description="You're all caught up on leave approvals." />
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

      <LeaveDecisionModal
        target={decisionTarget}
        onClose={() => setDecisionTarget(null)}
        onSuccess={() => {
          setDecisionTarget(null)
          refetch()
        }}
      />
    </Card>
  )
}
