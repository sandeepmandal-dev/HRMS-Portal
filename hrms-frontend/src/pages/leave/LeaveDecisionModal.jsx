import { useState } from 'react'
import toast from 'react-hot-toast'
import { leaveApi } from '../../api/leaveApi'
import { extractErrorMessage } from '../../api/axiosClient'
import { formatDate } from '../../utils/formatters'
import { Modal, Textarea, Button } from '../../components/ui'

export default function LeaveDecisionModal({ target, onClose, onSuccess }) {
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!target) return null
  const { request, decision } = target
  const isApprove = decision === 'APPROVED'

  async function handleConfirm() {
    setIsSubmitting(true)
    try {
      await leaveApi.decide(request.id, { decision, comment: comment || undefined })
      toast.success(isApprove ? 'Leave approved' : 'Leave rejected')
      setComment('')
      onSuccess()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={Boolean(target)}
      onClose={onClose}
      title={isApprove ? 'Approve leave request' : 'Reject leave request'}
      size="sm"
    >
      <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
        <p className="font-medium text-ink">{request.employeeName}</p>
        <p className="mt-0.5 text-slate-500">
          {request.leaveTypeName} · {formatDate(request.startDate)} – {formatDate(request.endDate)} · {request.numberOfDays} day(s)
        </p>
      </div>

      <div className="mt-4">
        <Textarea
          label={`Comment ${isApprove ? '(optional)' : '(recommended)'}`}
          placeholder={isApprove ? 'Add a note for the employee…' : 'Let them know why…'}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button
          variant={isApprove ? 'primary' : 'dangerSolid'}
          onClick={handleConfirm}
          isLoading={isSubmitting}
        >
          {isApprove ? 'Approve' : 'Reject'}
        </Button>
      </div>
    </Modal>
  )
}
