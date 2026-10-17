# HRMS Frontend

A React admin portal for the [`hrms-backend`](../hrms-backend) API — attendance, leave, payroll and
people management, with role-based views for Employees, Managers, HR and Admins.

**Stack:** React 18 · Vite · Tailwind CSS · JavaScript (no TypeScript) · Zustand · React Router 6 ·
React Hook Form + Zod · Axios · Framer Motion · Recharts · react-hot-toast

---

## 1. Design system — "Ledger"

Built for a data-heavy daily tool, not a marketing site: precise, quiet, and trustworthy, with one
deliberate moment of personality rather than decoration scattered everywhere.

| Token | Value |
|---|---|
| Background | `#F7F7F5` (paper) |
| Ink (text) | `#14151A` |
| Primary accent | `#4F46E5` (indigo) — actions, active states, focus rings |
| Status tones | amber (pending/warning), emerald (success/paid), rose (danger/rejected) |
| Display type | Fraunces (serif) — headlines and hero numbers only |
| UI type | Plus Jakarta Sans — everything else |

Structural choices:
- **One hero stat per screen** (e.g. today's check-in state on the dashboard) instead of a wall of
  identical cards — a bento-style asymmetric grid, not the generic SaaS-card kit.
- **Dark navy sidebar** with a Framer Motion `layoutId` pill that slides between nav items — the one
  orchestrated motion moment, not hover-transitions on everything.
- Tabular figures on all numeric data (`font-feature-settings: 'tnum'`), visible focus rings, and
  `prefers-reduced-motion` respected globally.

---

## 2. Project structure

```
hrms-frontend/
├── src/
│   ├── api/              # One file per backend resource; thin Axios wrappers
│   │   └── axiosClient.js    # JWT attach + automatic refresh-token rotation on 401
│   ├── store/             # Zustand stores (auth, ui)
│   ├── components/
│   │   ├── ui/             # Design-system primitives (Button, Input, Modal, Table, ...)
│   │   ├── layout/         # Sidebar, Topbar, AuthLayout, DashboardLayout
│   │   ├── common/          # PageHeader, RoleGuard, StatCard, SectionTabs
│   │   └── charts/          # Recharts wrappers
│   ├── pages/              # One folder per feature (dashboard, employees, leave, payroll, ...)
│   ├── routes/              # ProtectedRoute (auth + role gate), GuestRoute
│   ├── hooks/                # useAsync (data fetching), useDebounce
│   ├── utils/                 # constants (mirrors backend enums), formatters, zod validators
│   ├── App.jsx                 # Route tree
│   └── main.jsx                 # Entry point
├── index.html
├── vite.config.js               # Dev proxy to the backend + vendor chunk splitting
├── tailwind.config.js            # Design tokens
└── .env.example
```

---

## 3. Running locally

Requires Node 18+ and the `hrms-backend` running on port 8080 (see its own README).

```bash
npm install
cp .env.example .env      # defaults to /api, proxied to localhost:8080 — usually no edits needed
npm run dev
```

Open `http://localhost:5173`. Vite proxies every `/api/*` request to `http://localhost:8080`, so
there's no CORS setup needed in development (see `server.proxy` in `vite.config.js`).

### Production build

```bash
npm run build      # outputs to dist/
npm run preview     # serve the production build locally to sanity-check it
```

Deploy `dist/` behind any static host (Nginx, Vercel, Netlify, S3+CloudFront, ...). Point
`VITE_API_BASE_URL` at your deployed backend's `/api` origin at build time.

---

## 4. How auth works

- Login exchanges credentials for an access token (1h) + refresh token (7d), both stored in
  `localStorage`.
- Every request attaches `Authorization: Bearer <accessToken>` via an Axios interceptor.
- On a `401`, the interceptor automatically calls `/auth/refresh` once, replays the original
  request, and queues any other requests that failed concurrently — so a mid-session token expiry
  is invisible to the user. If the refresh itself fails, the user is redirected to `/login`.
- Role (`ADMIN` / `HR` / `MANAGER` / `EMPLOYEE`) comes back from `/auth/login` and gates both
  navigation (`Sidebar.jsx`) and routes (`ProtectedRoute allow={...}`) — matching the backend's
  `@PreAuthorize` rules exactly, so a hidden button is never the only thing standing between a role
  and an action the API would reject anyway.

---

## 5. Feature coverage

| Page | Who sees it | Notes |
|---|---|---|
| Dashboard | Everyone | Today's attendance, leave balance chart, pending approvals (if a manager) |
| Employees | Admin, HR, Manager | Search/filter, onboarding form, detail view with attendance & payroll history |
| Departments / Designations | Admin, HR | CRUD |
| Attendance | Everyone | Check-in/out, personal history; HR/Manager can view any employee's |
| Leave | Everyone | Apply, cancel; Admin/HR/Manager get an Approvals tab |
| Payroll | Everyone | My payslips; Admin/HR get a company-wide generate + mark-paid view |
| Profile | Everyone | Edit personal fields; job fields are read-only (HR-managed) |

---

## 6. Verified

- `npm install` and `npm run build` both run clean (no errors).
- `npm run build` output is code-split into vendor chunks (react/router, framer-motion+lucide,
  recharts, form libs) so a deploy doesn't force a full re-download of every dependency.
- `npx eslint src` passes with zero errors/warnings.
- Visually spot-checked (login, dashboard, leave, profile) against a mocked API.

## 7. Not yet included (natural next steps)

- Automated component/E2E tests (Vitest + Testing Library, or Playwright)
- Dark mode (the token structure in `tailwind.config.js` and `index.css` supports adding it)
- Real-time notifications (e.g. a leave decision arriving while the approver is online)
- Optimistic UI updates on mutations (currently refetch-after-write, which is simpler and safer
  but has a beat of latency)
