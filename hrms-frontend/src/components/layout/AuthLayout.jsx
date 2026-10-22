import { UsersRound } from "lucide-react";
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <UsersRound
              className="h-6 w-6 text-white"
              strokeWidth={1.8}
              aria-hidden="true"
           />
          </div>
          <span className="font-display text-lg font-bold text-white">HRMS</span>
        </div>

        <div>
          <p className="font-display text-display-md font-medium leading-tight text-white">
            Every person,
            <br />
            one clear record.
          </p>
          <p className="mt-4 text-base font-medium text-slate-200">
            Manage your workforce with confidence.
          </p>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-slate-400">
            Bring employee records, attendance, leave, and payroll
            together in one secure place — simplifying HR operations
            and giving your team more time to focus on people.
          </p>
        </div>

        <p className="text-xs text-slate-600">© {new Date().getFullYear()} HRMS. All rights reserved.</p>

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
