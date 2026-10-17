import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { PageSpinner } from '../components/ui'

/** Redirects to /login if unauthenticated. Optionally restricts by role. */
export default function ProtectedRoute({ allow }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping)
  const role = useAuthStore((s) => s.user?.role)
  const location = useLocation()

  if (isBootstrapping) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <PageSpinner label="Loading your workspace…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allow && role && !allow.includes(role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
