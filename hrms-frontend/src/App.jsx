import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

import AuthLayout from './components/layout/AuthLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import GuestRoute from './routes/GuestRoute'

import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import EmployeeList from './pages/employees/EmployeeList'
import EmployeeDetail from './pages/employees/EmployeeDetail'
import Departments from './pages/departments/Departments'
import Designations from './pages/designations/Designations'
import Attendance from './pages/attendance/Attendance'
import Leave from './pages/leave/Leave'
import Payroll from './pages/payroll/Payroll'
import Profile from './pages/profile/Profile'
import NotFound from './pages/NotFound'

import { STAFF_ROLES, APPROVER_ROLES } from './utils/constants'

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap)

  // Re-validate the persisted session (if any) once, on first mount.
  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#14151A',
            color: '#fff',
            fontSize: '13.5px',
            borderRadius: '10px',
            padding: '10px 14px',
          },
          success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
          error: { iconTheme: { primary: '#E11D48', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* Public — redirects away if already signed in */}
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>
        </Route>

        {/* Authenticated app shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leave" element={<Leave />} />
            <Route path="/payroll" element={<Payroll />} />

            <Route element={<ProtectedRoute allow={APPROVER_ROLES} />}>
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/employees/:id" element={<EmployeeDetail />} />
            </Route>

            <Route element={<ProtectedRoute allow={STAFF_ROLES} />}>
              <Route path="/departments" element={<Departments />} />
              <Route path="/designations" element={<Designations />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
