import { z } from 'zod'

export function getMaxDateOfBirth() {
  const today = new Date()
  const year = today.getFullYear() - 18
  const month = today.getMonth()
  const day = Math.min(today.getDate(), new Date(year, month + 1, 0).getDate())

  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const dateOfBirthSchema = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine((dateOfBirth) => !dateOfBirth || dateOfBirth <= getMaxDateOfBirth(), {
    message: 'Employee must be at least 18 years old',
  })

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const employeeSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.string().min(1, 'Select a role'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional().or(z.literal('')),
  dateOfBirth: dateOfBirthSchema,
  gender: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  dateOfJoining: z.string().min(1, 'Date of joining is required'),
  departmentId: z.string().optional().or(z.literal('')),
  designationId: z.string().optional().or(z.literal('')),
  managerId: z.string().optional().or(z.literal('')),
  basicSalary: z.string().optional().or(z.literal('')),
})

export const employeeUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional().or(z.literal('')),
  dateOfBirth: dateOfBirthSchema,
  gender: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  departmentId: z.string().optional().or(z.literal('')),
  designationId: z.string().optional().or(z.literal('')),
  managerId: z.string().optional().or(z.literal('')),
  basicSalary: z.string().optional().or(z.literal('')),
})

export const departmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().or(z.literal('')),
})

export const designationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().or(z.literal('')),
})

export const leaveRequestSchema = z
  .object({
    leaveTypeId: z.string().min(1, 'Select a leave type'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    reason: z.string().max(500, 'Keep it under 500 characters').optional().or(z.literal('')),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date cannot be before start date',
    path: ['endDate'],
  })

export const payrollSchema = z.object({
  employeeId: z.string().min(1, 'Select an employee'),
  payPeriodMonth: z.string().min(1, 'Select a month'),
  payPeriodYear: z.string().min(1, 'Select a year'),
  allowances: z.string().optional().or(z.literal('')),
  deductions: z.string().optional().or(z.literal('')),
})
