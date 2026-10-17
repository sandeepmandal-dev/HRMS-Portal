import { useState } from 'react'
import { Plus, BadgeCheck, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAsync } from '../../hooks/useAsync'
import { designationApi } from '../../api/designationApi'
import { extractErrorMessage } from '../../api/axiosClient'
import { designationSchema } from '../../utils/validators'
import { Card, Input, Textarea, Button, Badge, Table, EmptyState, PageSpinner, Modal, ConfirmDialog } from '../../components/ui'
import PageHeader from '../../components/common/PageHeader'

export default function Designations() {
  const { data: designations, isLoading, refetch } = useAsync(() => designationApi.getAll(), [])
  const [formState, setFormState] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await designationApi.remove(deleteTarget.id)
      toast.success('Designation deactivated')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Designations"
        description="Job titles used across the organization."
        actions={
          <Button onClick={() => setFormState({ mode: 'create' })}>
            <Plus size={16} /> Add designation
          </Button>
        }
      />

      <Card>
        {isLoading ? (
          <PageSpinner label="Loading designations…" />
        ) : (
          <Table
            columns={[
              { key: 'title', header: 'Title', render: (r) => <span className="font-medium">{r.title}</span> },
              { key: 'description', header: 'Description', render: (r) => r.description || <span className="text-slate-400">—</span> },
              { key: 'status', header: 'Status', render: (r) => <Badge tone={r.active ? 'success' : 'neutral'}>{r.active ? 'Active' : 'Inactive'}</Badge> },
              {
                key: 'actions',
                header: '',
                className: 'text-right',
                render: (r) => (
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setFormState({ mode: 'edit', record: r })}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink"
                    >
                      <Pencil size={15} />
                    </button>
                    {r.active && (
                      <button
                        onClick={() => setDeleteTarget(r)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
            data={designations}
            emptyState={<EmptyState icon={BadgeCheck} title="No designations yet" description="Add your first job title to start assigning it to employees." />}
          />
        )}
      </Card>

      <DesignationFormModal
        state={formState}
        onClose={() => setFormState(null)}
        onSuccess={() => {
          setFormState(null)
          refetch()
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title={`Deactivate "${deleteTarget?.title}"?`}
        description="Employees already assigned to it are unaffected, but it won't appear in new assignments."
        confirmLabel="Deactivate"
      />
    </div>
  )
}

function DesignationFormModal({ state, onClose, onSuccess }) {
  const isEdit = state?.mode === 'edit'
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(designationSchema),
    values: isEdit ? { title: state.record.title, description: state.record.description || '' } : { title: '', description: '' },
  })

  async function onSubmit(values) {
    try {
      if (isEdit) {
        await designationApi.update(state.record.id, values)
        toast.success('Designation updated')
      } else {
        await designationApi.create(values)
        toast.success('Designation created')
      }
      reset()
      onSuccess()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <Modal open={Boolean(state)} onClose={onClose} title={isEdit ? 'Edit designation' : 'New designation'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Title" required error={errors.title?.message} {...register('title')} />
        <Textarea label="Description" error={errors.description?.message} {...register('description')} />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>{isEdit ? 'Save changes' : 'Create designation'}</Button>
        </div>
      </form>
    </Modal>
  )
}
