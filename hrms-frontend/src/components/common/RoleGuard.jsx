import { useAuthStore } from '../../store/authStore'

/** Conditionally renders children only if the current user's role is in `allow`. */
export default function RoleGuard({ allow, children, fallback = null }) {
  const role = useAuthStore((s) => s.user?.role)
  if (!role || !allow.includes(role)) return fallback
  return children
}
