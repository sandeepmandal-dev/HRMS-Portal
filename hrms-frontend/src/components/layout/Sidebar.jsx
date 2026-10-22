import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UsersRound } from "lucide-react";
import {
  LayoutGrid,
  Users,
  Building2,
  BadgeCheck,
  Clock,
  CalendarDays,
  Wallet,
  X,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'
import { STAFF_ROLES, APPROVER_ROLES } from '../../utils/constants'
import { cn } from '../ui/cn'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutGrid, end: true }],
  },
  {
    label: 'People',
    items: [
      { to: '/employees', label: 'Employees', icon: Users, roles: APPROVER_ROLES },
      { to: '/departments', label: 'Departments', icon: Building2, roles: STAFF_ROLES },
      { to: '/designations', label: 'Designations', icon: BadgeCheck, roles: STAFF_ROLES },
    ],
  },
  {
    label: 'Time & leave',
    items: [
      { to: '/attendance', label: 'Attendance', icon: Clock },
      { to: '/leave', label: 'Leave', icon: CalendarDays },
    ],
  },
  {
    label: 'Payroll',
    items: [{ to: '/payroll', label: 'Payroll', icon: Wallet }],
  },
]

function NavItem({ item }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="nav-active-pill"
              className="absolute inset-0 rounded-lg bg-indigo-500"
              transition={{ type: 'spring', stiffness: 500, damping: 38 }}
            />
          )}
          <item.icon size={17} className="relative z-10" />
          <span className="relative z-10">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

function SidebarContent() {
  const role = useAuthStore((s) => s.user?.role)

  return (
    <div className="flex h-full flex-col bg-ink-900">
      <div className="flex items-center gap-2.5 px-5 py-6">
        {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
          <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
            <path d="M9 9V23M9 16H16M16 9V23M23 9V23" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div> */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <UsersRound
              className="h-6 w-6 text-white"
              strokeWidth={1.8}
              aria-hidden="true"
           />
          </div>
        <div>
          <p className="font-display text-base font-semibold leading-none text-white">HRMS</p>
          <p className="mt-1 text-[11px] leading-none text-slate-500">Workforce portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6 scrollbar-thin">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => !item.roles || item.roles.includes(role))
          if (visibleItems.length === 0) return null
          return (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <NavItem key={item.to} item={item} />
                ))}
              </div>
            </div>
          )
        })}
      </nav>
    </div>
  )
}

export default function Sidebar() {
  const isOpen = useUiStore((s) => s.isSidebarOpen)
  const closeSidebar = useUiStore((s) => s.closeSidebar)

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-80 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-80">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/50" onClick={closeSidebar} />
          <div className="relative flex h-full w-80 flex-col">
            <button
              onClick={closeSidebar}
              className="absolute right-3 top-4 z-10 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )
}
