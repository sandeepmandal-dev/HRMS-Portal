import Modal from './Modal'
import Button from './Button'
import { AlertTriangle } from 'lucide-react'

/** Confirmation modal for destructive or consequential actions (deactivate, reject, cancel). */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  tone = 'danger', // 'danger' | 'primary'
  isLoading,
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className={
            tone === 'danger'
              ? 'flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600'
              : 'flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600'
          }
        >
          <AlertTriangle size={22} />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
          {description && <p className="mt-1.5 text-sm text-slate-500">{description}</p>}
        </div>
        <div className="mt-2 flex w-full gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={tone === 'danger' ? 'dangerSolid' : 'primary'}
            className="flex-1"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
