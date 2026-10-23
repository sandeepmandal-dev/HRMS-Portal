import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { useAsync } from '../../hooks/useAsync'
import { employeeApi } from '../../api/employeeApi'
import { departmentApi } from '../../api/departmentApi'
import { designationApi } from '../../api/designationApi'
import { extractErrorMessage } from '../../api/axiosClient'
import { employeeUpdateSchema, getMaxDateOfBirth } from '../../utils/validators'
import { GENDERS } from '../../utils/constants'
import { Modal, Input, Select, Button } from '../../components/ui'

export default function EmployeeEditModal({ open, onClose, onSuccess, employee }) {
  const { data: departments } = useAsync(() => (open ? departmentApi.getAll() : Promise.resolve([])), [open])
  const { data: designations } = useAsync(() => (open ? designationApi.getAll() : Promise.resolve([])), [open])
  const { data: managers } = useAsync(
    () => (open ? employeeApi.search({ page: 0, size: 100 }) : Promise.resolve(null)),
    [open]
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(employeeUpdateSchema) })

  useEffect(() => {
    if (employee && open) {
      reset({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        phone: employee.phone || '',
        dateOfBirth: employee.dateOfBirth || '',
        gender: employee.gender || '',
        address: employee.address || '',
        departmentId: employee.department?.id ? String(employee.department.id) : '',
        designationId: employee.designation?.id ? String(employee.designation.id) : '',
        managerId: employee.managerId ? String(employee.managerId) : '',
        basicSalary: employee.basicSalary ? String(employee.basicSalary) : '',
      })
    }
  }, [employee, open, reset])

  async function onSubmit(values) {
    try {
      const payload = {
        ...values,
        departmentId: values.departmentId ? Number(values.departmentId) : null,
        designationId: values.designationId ? Number(values.designationId) : null,
        managerId: values.managerId ? Number(values.managerId) : null,
        basicSalary: values.basicSalary ? Number(values.basicSalary) : null,
      }
      await employeeApi.update(employee.id, payload)
      toast.success('Employee updated')
      onSuccess()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  if (!employee) return null

  return (
    <Modal open={open} onClose={onClose} title={`Edit ${employee.firstName} ${employee.lastName}`} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First name" required error={errors.firstName?.message} {...register('firstName')} />
          <Input label="Last name" required error={errors.lastName?.message} {...register('lastName')} />
          <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
          <Input label="Date of birth" type="date" max={getMaxDateOfBirth()} error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
          <Select label="Gender" defaultValue="" {...register('gender')}>
            <option value="">Prefer not to say</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </Select>
          <Input label="Address" error={errors.address?.message} {...register('address')} />
        </fieldset>

        <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Basic salary" type="number" step="0.01" min="0" error={errors.basicSalary?.message} {...register('basicSalary')} />
          <Select label="Department" defaultValue="" {...register('departmentId')}>
            <option value="">No department</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
          <Select label="Designation" defaultValue="" {...register('designationId')}>
            <option value="">No designation</option>
            {designations?.map((d) => (
              <option key={d.id} value={d.id}>{d.title}</option>
            ))}
          </Select>
          <Select label="Reporting manager" defaultValue="" {...register('managerId')}>
            <option value="">No manager</option>
            {managers?.content
              ?.filter((m) => m.id !== employee.id)
              .map((m) => (
                <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.employeeCode})</option>
              ))}
          </Select>
        </fieldset>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Save changes</Button>
        </div>
      </form>
    </Modal>
  )
}
