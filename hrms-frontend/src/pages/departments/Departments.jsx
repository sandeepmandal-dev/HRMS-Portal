import { useState } from 'react'
import { Plus, Building2, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAsync } from '../../hooks/useAsync'
import { departmentApi } from '../../api/departmentApi'
import { extractErrorMessage } from '../../api/axiosClient'
import { departmentSchema } from '../../utils/validators'
import { Card, Input, Textarea, Button, Badge, Table, EmptyState, PageSpinner, Modal, ConfirmDialog } from '../../components/ui'
import PageHeader from '../../components/common/PageHeader'

export default function Departments() {
  const { data: departments, isLoading, refetch } = useAsync(() => departmentApi.getAll(), [])
  const [formState, setFormState] = useState(null) // null | { mode: 'create' | 'edit', record }
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await departmentApi.remove(deleteTarget.id)
      toast.success('Department deactivated')
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
        title="Departments"
        description="Organize your workforce into functional groups."
        actions={
          <Button onClick={() => setFormState({ mode: 'create' })}>
            <Plus size={16} /> Add department
          </Button>
        }
      />

      <Card>
        {isLoading ? (
          <PageSpinner label="Loading departments…" />
        ) : (
          <Table
            columns={[
              { key: 'name', header: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
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
            data={departments}
            emptyState={<EmptyState icon={Building2} title="No departments yet" description="Add your first department to start organizing employees." />}
          />
        )}
      </Card>

      <DepartmentFormModal
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
        title={`Deactivate "${deleteTarget?.name}"?`}
        description="Employees already assigned to it are unaffected, but it won't appear in new assignments."
        confirmLabel="Deactivate"
      />
    </div>
  )
}

function DepartmentFormModal({ state, onClose, onSuccess }) {
  const isEdit = state?.mode === 'edit'
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(departmentSchema),
    values: isEdit ? { name: state.record.name, description: state.record.description || '' } : { name: '', description: '' },
  })

  async function onSubmit(values) {
    try {
      if (isEdit) {
        await departmentApi.update(state.record.id, values)
        toast.success('Department updated')
      } else {
        await departmentApi.create(values)
        toast.success('Department created')
      }
      reset()
      onSuccess()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <Modal open={Boolean(state)} onClose={onClose} title={isEdit ? 'Edit department' : 'New department'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Name" required error={errors.name?.message} {...register('name')} />
        <Textarea label="Description" error={errors.description?.message} {...register('description')} />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>{isEdit ? 'Save changes' : 'Create department'}</Button>
        </div>
      </form>
    </Modal>
  )
}
