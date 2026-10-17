import { Outlet } from 'react-router-dom'

/**
 * Split-screen auth shell: a dark brand panel on the left (desktop only) and the
 * form on the right. Keeps the login screen from feeling like a bare, forgotten form.
 */
export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-paper">
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-ink-900 p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
            <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
              <path d="M9 9V23M9 16H16M16 9V23M23 9V23" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-display text-lg font-semibold text-white">HRMS</span>
        </div>

        <div>
          <p className="font-display text-display-md font-medium leading-tight text-white">
            Every person,
            <br />
            one clear record.
          </p>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-slate-400">
            Attendance, leave, and payroll — kept in one place, so HR spends less
            time reconciling spreadsheets and more time with people.
          </p>
        </div>

        <p className="text-xs text-slate-600">© {new Date().getFullYear()} HRMS. Internal workforce portal.</p>

        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/10" />
        <div className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-indigo-500/5" />
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
