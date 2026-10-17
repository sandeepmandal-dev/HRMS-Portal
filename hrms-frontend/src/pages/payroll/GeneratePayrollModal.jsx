import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { useAsync } from '../../hooks/useAsync'
import { employeeApi } from '../../api/employeeApi'
import { payrollApi } from '../../api/payrollApi'
import { extractErrorMessage } from '../../api/axiosClient'
import { payrollSchema } from '../../utils/validators'
import { MONTHS } from '../../utils/constants'
import { Modal, Select, Input, Button } from '../../components/ui'

const currentYear = new Date().getFullYear()
const YEARS = [currentYear - 1, currentYear, currentYear + 1]

export default function GeneratePayrollModal({ open, onClose, onSuccess }) {
  const { data: employees } = useAsync(
    () => (open ? employeeApi.search({ page: 0, size: 200, status: 'ACTIVE' }) : Promise.resolve(null)),
    [open]
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      payPeriodMonth: String(new Date().getMonth() + 1),
      payPeriodYear: String(currentYear),
    },
  })

  async function onSubmit(values) {
    try {
      await payrollApi.generate({
        employeeId: Number(values.employeeId),
        payPeriodMonth: Number(values.payPeriodMonth),
        payPeriodYear: Number(values.payPeriodYear),
        allowances: values.allowances ? Number(values.allowances) : 0,
        deductions: values.deductions ? Number(values.deductions) : 0,
      })
      toast.success('Payslip generated')
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
      title="Generate payslip"
      description="Pay is prorated automatically from the employee's attendance for the selected month."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Select label="Employee" required error={errors.employeeId?.message} defaultValue="" {...register('employeeId')}>
          <option value="" disabled>Select an employee</option>
          {employees?.content?.map((e) => (
            <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Month" required error={errors.payPeriodMonth?.message} {...register('payPeriodMonth')}>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </Select>
          <Select label="Year" required error={errors.payPeriodYear?.message} {...register('payPeriodYear')}>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Allowances" type="number" step="0.01" min="0" placeholder="0.00" error={errors.allowances?.message} {...register('allowances')} />
          <Input label="Deductions" type="number" step="0.01" min="0" placeholder="0.00" error={errors.deductions?.message} {...register('deductions')} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Generate payslip</Button>
        </div>
      </form>
    </Modal>
  )
}
