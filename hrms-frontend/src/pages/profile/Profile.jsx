import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Mail, Phone, MapPin, Calendar, Briefcase, Building2, Pencil, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { employeeApi } from '../../api/employeeApi'
import { extractErrorMessage } from '../../api/axiosClient'
import { formatDate, formatCurrency, toTitleCase, initials } from '../../utils/formatters'
import { ROLE_LABELS } from '../../utils/constants'
import { Card, CardBody, Input, Button, Badge } from '../../components/ui'
import PageHeader from '../../components/common/PageHeader'

export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const loadProfile = useAuthStore((s) => s.loadProfile)
  const [isEditing, setIsEditing] = useState(false)

  if (!profile) {
    return (
      <div>
        <PageHeader title="My profile" description="Your personal and employment details." />
        <Card className="p-10 text-center text-sm text-slate-500">
          Your employee profile hasn&rsquo;t been set up yet. Contact HR if this seems wrong.
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="My profile"
        description="Your personal and employment details."
        actions={
          !isEditing && (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              <Pencil size={15} /> Edit details
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardBody className="flex flex-col items-center py-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-semibold text-indigo-700">
              {initials(profile.firstName, profile.lastName)}
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{profile.designation?.title || 'No designation set'}</p>
            <div className="mt-3">
              <Badge status={profile.employmentStatus}>{toTitleCase(profile.employmentStatus)}</Badge>
            </div>

            <div className="mt-6 w-full space-y-3 border-t border-slate-100 pt-6 text-left text-sm">
              <InfoRow icon={Mail} label={profile.email} />
              <InfoRow icon={Phone} label={profile.phone || 'No phone on file'} />
              <InfoRow icon={MapPin} label={profile.address || 'No address on file'} />
              <InfoRow icon={Calendar} label={`Joined ${formatDate(profile.dateOfJoining)}`} />
              <InfoRow icon={Building2} label={profile.department?.name || 'No department'} />
              <InfoRow icon={Briefcase} label={`${ROLE_LABELS[user?.role] || user?.role} access`} />
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardBody>
            {isEditing ? (
              <EditForm
                profile={profile}
                onCancel={() => setIsEditing(false)}
                onSuccess={() => {
                  setIsEditing(false)
                  loadProfile()
                }}
              />
            ) : (
              <ReadOnlyDetails profile={profile} />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-3 text-slate-600">
      <Icon size={15} className="shrink-0 text-slate-400" />
      <span className="truncate">{label}</span>
    </div>
  )
}

function ReadOnlyDetails({ profile }) {
  const fields = [
    { label: 'Employee code', value: profile.employeeCode },
    { label: 'Date of birth', value: formatDate(profile.dateOfBirth) },
    { label: 'Gender', value: profile.gender || '—' },
    { label: 'Designation', value: profile.designation?.title || '—' },
    { label: 'Department', value: profile.department?.name || '—' },
    { label: 'Manager', value: profile.managerName || '—' },
    { label: 'Basic salary', value: profile.basicSalary ? formatCurrency(profile.basicSalary) : '—' },
    { label: 'Date of joining', value: formatDate(profile.dateOfJoining) },
  ]

  return (
    <div>
      <h3 className="font-display text-base font-semibold text-ink">Employment details</h3>
      <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.label}>
            <p className="text-xs text-slate-400">{f.label}</p>
            <p className="mt-1 text-sm font-medium text-ink">{f.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-400">
        Job details (department, designation, salary) are managed by HR. Contact them for changes.
      </p>
    </div>
  )
}

function EditForm({ profile, onCancel, onSuccess }) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone || '',
      address: profile.address || '',
      gender: profile.gender || '',
    },
  })

  async function onSubmit(values) {
    try {
      await employeeApi.updateMyProfile(values)
      toast.success('Profile updated')
      onSuccess()
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-ink">Edit your details</h3>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="First name" required {...register('firstName')} />
        <Input label="Last name" required {...register('lastName')} />
        <Input label="Phone" placeholder="+1 555 000 0000" {...register('phone')} />
        <Input label="Gender" placeholder="e.g. Female" {...register('gender')} />
        <div className="sm:col-span-2">
          <Input label="Address" placeholder="Street, city, state" {...register('address')} />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>Save changes</Button>
      </div>
    </form>
  )
}
