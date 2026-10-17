// Central source of truth for enums shared with the backend (com.hrms.entity.enums.*).
// Keep these in sync with the Spring Boot entities.

export const ROLES = {
  ADMIN: 'ADMIN',
  HR: 'HR',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
}

export const ROLE_LABELS = {
  ADMIN: 'Administrator',
  HR: 'HR',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
}

// Roles allowed to manage people, departments, designations, and payroll.
export const STAFF_ROLES = [ROLES.ADMIN, ROLES.HR]
// Roles allowed to approve leave and view team attendance.
export const APPROVER_ROLES = [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER]

export const EMPLOYMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  ON_LEAVE: 'ON_LEAVE',
  SUSPENDED: 'SUSPENDED',
  TERMINATED: 'TERMINATED',
  RESIGNED: 'RESIGNED',
}

export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  HALF_DAY: 'HALF_DAY',
  ON_LEAVE: 'ON_LEAVE',
  HOLIDAY: 'HOLIDAY',
  WEEKEND: 'WEEKEND',
}

export const LEAVE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
}

export const PAYROLL_STATUS = {
  DRAFT: 'DRAFT',
  PROCESSED: 'PROCESSED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
}

export const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say']

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
