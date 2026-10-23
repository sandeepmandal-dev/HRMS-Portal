import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Users, Eye, EyeOff } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { useDebounce } from '../../hooks/useDebounce'
import { employeeApi } from '../../api/employeeApi'
import { departmentApi } from '../../api/departmentApi'
import { EMPLOYMENT_STATUS, STAFF_ROLES } from '../../utils/constants'
import { toTitleCase } from '../../utils/formatters'
import { Card, Input, Select, Button, Badge, Avatar, Table, Pagination, EmptyState, PageSpinner } from '../../components/ui'
import PageHeader from '../../components/common/PageHeader'
import RoleGuard from '../../components/common/RoleGuard'
import EmployeeFormModal from './EmployeeFormModal'

export default function EmployeeList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [status, setStatus] = useState(EMPLOYMENT_STATUS.ACTIVE)
  const [page, setPage] = useState(0)
  const [inactivePage, setInactivePage] = useState(0)
  const [showInactive, setShowInactive] = useState(false)
  const [isCreateOpen, setCreateOpen] = useState(false)

  const debouncedSearch = useDebounce(search)

  const { data: departments } = useAsync(() => departmentApi.getAll(), [])
  const {
    data: employeesPage,
    isLoading,
    refetch,
  } = useAsync(
    () =>
      employeeApi.search({
        search: debouncedSearch || undefined,
        departmentId: departmentId || undefined,
        status: status || undefined,
        page,
        size: 10,
      }),
    [debouncedSearch, departmentId, status, page]
  )
  const {
    data: inactiveEmployeesPage,
    isLoading: isInactiveLoading,
    error: inactiveEmployeesError,
    refetch: refetchInactive,
  } = useAsync(
    () =>
      showInactive
        ? employeeApi.search({
            search: debouncedSearch || undefined,
            departmentId: departmentId || undefined,
            status: EMPLOYMENT_STATUS.TERMINATED,
            page: inactivePage,
            size: 10,
          })
        : Promise.resolve(null),
    [showInactive, debouncedSearch, departmentId, inactivePage]
  )

  const columns = [
    {
      key: 'name',
      header: 'Employee',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.firstName} ${row.lastName}`} size="sm" />
          <div>
            <p className="font-medium text-ink">{row.firstName} {row.lastName}</p>
            <p className="text-xs text-slate-500">{row.employeeCode}</p>
          </div>
        </div>
      ),
    },
    { key: 'email', header: 'Email', render: (row) => <span className="text-slate-600">{row.email}</span> },
    {
      key: 'department',
      header: 'Department',
      render: (row) => row.department?.name || <span className="text-slate-400">—</span>,
    },
    {
      key: 'designation',
      header: 'Designation',
      render: (row) => row.designation?.title || <span className="text-slate-400">—</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge status={row.employmentStatus}>{toTitleCase(row.employmentStatus)}</Badge>,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Search, filter and manage everyone in the organization."
        actions={
          <RoleGuard allow={STAFF_ROLES}>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={16} /> Add employee
            </Button>
          </RoleGuard>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name or employee code…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
                setInactivePage(0)
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value)
              setPage(0)
              setInactivePage(0)
            }}
            placeholder="All departments"
            className="sm:w-48"
          >
            <option value="">All departments</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(0)
            }}
            placeholder="Filter by status"
            className="sm:w-44"
          >
            {Object.values(EMPLOYMENT_STATUS)
              .filter((s) => s !== EMPLOYMENT_STATUS.TERMINATED)
              .map((s) => (
                <option key={s} value={s}>{toTitleCase(s)}</option>
              ))}
          </Select>
        </div>

        {isLoading ? (
          <PageSpinner label="Loading employees…" />
        ) : (
          <>
            <Table
              columns={columns}
              data={employeesPage?.content}
              onRowClick={(row) => navigate(`/employees/${row.id}`)}
              emptyState={
                <EmptyState
                  icon={Users}
                  title="No employees found"
                  description="Try adjusting your search or filters."
                />
              }
            />
            {employeesPage && (
              <Pagination
                pageNumber={employeesPage.pageNumber}
                totalPages={employeesPage.totalPages}
                totalElements={employeesPage.totalElements}
                pageSize={employeesPage.pageSize}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>

      <div className="mt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInactive((visible) => !visible)}
          aria-expanded={showInactive}
          aria-controls="inactive-employees"
        >
          {showInactive ? <EyeOff size={16} /> : <Eye size={16} />}
          {showInactive ? 'Hide inactive employees' : 'Show inactive employees'}
          {inactiveEmployeesPage && ` (${inactiveEmployeesPage.totalElements})`}
        </Button>
      </div>

      <div id="inactive-employees" hidden={!showInactive}>
        {showInactive && (
          <Card className="mt-2">
            {isInactiveLoading ? (
              <PageSpinner label="Loading inactive employees…" />
            ) : inactiveEmployeesError ? (
              <div className="flex items-center justify-between gap-3 p-4 text-sm text-rose-600">
                <span>Could not load inactive employees. Please try again.</span>
                <Button variant="secondary" size="sm" onClick={refetchInactive}>Retry</Button>
              </div>
            ) : (
              <>
                <Table
                  columns={columns}
                  data={inactiveEmployeesPage?.content}
                  onRowClick={(row) => navigate(`/employees/${row.id}`)}
                  emptyState={
                    <EmptyState
                      icon={Users}
                      title="No inactive employees found"
                      description="No terminated employees match your search or department filters."
                    />
                  }
                />
                {inactiveEmployeesPage && (
                  <Pagination
                    pageNumber={inactiveEmployeesPage.pageNumber}
                    totalPages={inactiveEmployeesPage.totalPages}
                    totalElements={inactiveEmployeesPage.totalElements}
                    pageSize={inactiveEmployeesPage.pageSize}
                    onPageChange={setInactivePage}
                  />
                )}
              </>
            )}
          </Card>
        )}
      </div>

      <EmployeeFormModal
        open={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false)
          refetch()
        }}
      />
    </div>
  )
}
