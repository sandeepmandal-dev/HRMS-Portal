import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { leaveApi } from '../../api/leaveApi'
import { extractErrorMessage } from '../../api/axiosClient'
import { leaveRequestSchema } from '../../utils/validators'
import { Modal, Select, Input, Textarea, Button } from '../../components/ui'

export default function LeaveApplyModal({ open, onClose, onSuccess, leaveTypes }) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(leaveRequestSchema) })

  const startDate = useWatch({ control, name: 'startDate' })
  const endDate = useWatch({ control, name: 'endDate' })

  const dayCount = useMemo(() => {
    if (!startDate || !endDate) return null
    const diff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    return diff >= 0 ? diff + 1 : null
  }, [startDate, endDate])

  async function onSubmit(values) {
    try {
      await leaveApi.apply({ ...values, leaveTypeId: Number(values.leaveTypeId) })
      toast.success('Leave request submitted')
      reset()
      onSuccess()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      title="Apply for leave"
      description="Your request goes to your reporting manager for approval."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Select label="Leave type" required error={errors.leaveTypeId?.message} defaultValue="" {...register('leaveTypeId')}>
          <option value="" disabled>Select a leave type</option>
          {leaveTypes?.map((t) => (
            <option key={t.leaveTypeId} value={t.leaveTypeId}>
              {t.leaveTypeName} · {t.remainingDays} day(s) left
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Start date" type="date" required error={errors.startDate?.message} {...register('startDate')} />
          <Input label="End date" type="date" required error={errors.endDate?.message} {...register('endDate')} />
        </div>

        {dayCount !== null && (
          <p className="-mt-2 text-xs text-slate-500">
            That&rsquo;s <span className="font-medium text-ink">{dayCount} day{dayCount !== 1 ? 's' : ''}</span> of leave.
          </p>
        )}

        <Textarea label="Reason (optional)" placeholder="Add context for your manager…" error={errors.reason?.message} {...register('reason')} />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Submit request</Button>
        </div>
      </form>
    </Modal>
  )
}
