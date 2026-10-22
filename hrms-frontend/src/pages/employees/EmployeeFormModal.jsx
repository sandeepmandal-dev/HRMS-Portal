import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { useAsync } from '../../hooks/useAsync'
import { employeeApi } from '../../api/employeeApi'
import { departmentApi } from '../../api/departmentApi'
import { designationApi } from '../../api/designationApi'
import { extractErrorMessage } from '../../api/axiosClient'
import { employeeSchema } from '../../utils/validators'
import { ROLES, ROLE_LABELS, GENDERS } from '../../utils/constants'
import { Modal, Input, Select, Button } from '../../components/ui'
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function EmployeeFormModal({ open, onClose, onSuccess }) {
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
  } = useForm({ resolver: zodResolver(employeeSchema) })
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(values) {
    try {
      const payload = {
        ...values,
        departmentId: values.departmentId ? Number(values.departmentId) : null,
        designationId: values.designationId ? Number(values.designationId) : null,
        managerId: values.managerId ? Number(values.managerId) : null,
        basicSalary: values.basicSalary ? Number(values.basicSalary) : null,
        dateOfBirth: values.dateOfBirth || null,
        gender: values.gender || null,
        address: values.address || null,
        phone: values.phone || null,
      }
      await employeeApi.create(payload)
      toast.success('Employee onboarded successfully')
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
      title="Onboard a new employee"
      description="Creates their login and HR profile together."
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <legend className="col-span-full mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Account
          </legend>
          <Input label="Email address" type="email" required error={errors.email?.message} {...register('email')} />
          <div className="relative">
         <Input label="Temporary password" type={showPassword ? 'text' : 'password'} required error={errors.password?.message}
           {...register('password')}
         />
         <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600"
           aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
         </button>
        </div>
          <Select label="Role" required error={errors.role?.message} defaultValue="" {...register('role')}>
            <option value="" disabled>Select a role</option>
            {Object.values(ROLES).map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </Select>
        </fieldset>

        <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <legend className="col-span-full mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Personal details
          </legend>
          <Input label="First name" required error={errors.firstName?.message} {...register('firstName')} />
          <Input label="Last name" required error={errors.lastName?.message} {...register('lastName')} />
          <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
          <Input label="Date of birth" type="date" error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
          <Select label="Gender" defaultValue="" {...register('gender')}>
            <option value="">Prefer not to say</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </Select>
          <Input label="Address" error={errors.address?.message} {...register('address')} />
        </fieldset>

        <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <legend className="col-span-full mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Job details
          </legend>
          <Input label="Date of joining" type="date" required error={errors.dateOfJoining?.message} {...register('dateOfJoining')} />
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
          <Select label="Reporting manager" defaultValue="" className="sm:col-span-2" {...register('managerId')}>
            <option value="">No manager</option>
            {managers?.content?.map((m) => (
              <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.employeeCode})</option>
            ))}
          </Select>
        </fieldset>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Onboard employee</Button>
        </div>
      </form>
    </Modal>
  )
}
