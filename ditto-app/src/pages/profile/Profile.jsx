import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { useCurrentUser } from '../../hooks/useCurrentUser'
import { useGetCoursesQuery, useGetWorkerCourseEnrollmentsQuery } from '../../store/api/coursesApi'

export const ROLES = {
  WORKER: 'worker',
  USER: 'user',
}

const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" }
const BRAND = {
  primary: '#BB6AF0',
  primaryDark: '#874cad',
  paper: '#FCFCF5',
}

const WORKER_FIELD_KEYS = new Set([
  'specializationArea',
  'experience',
  'academicStudies',
  'completedCourses',
])

function getTextFieldSx(isEditing) {
  return {
    ...FONT,
    '& .MuiOutlinedInput-root': {
      borderRadius: 2.5,
      bgcolor: isEditing ? '#fff' : '#f4e7fd',
      '& fieldset': {
        borderColor: isEditing ? '#e9d5ff' : '#e9d5ff',
      },
      '&:hover fieldset': {
        borderColor: isEditing ? BRAND.primary : '#e9d5ff',
      },
      '&.Mui-focused fieldset': {
        borderColor: BRAND.primary,
      },
    },
    '& .MuiInputLabel-root': {
      ...FONT,
      color: '#6b7280',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: BRAND.primary,
    },
    '& .MuiOutlinedInput-input': {
      ...FONT,
      color: '#1a1a1a',
    },
  }
}

function ProfilePageShell({ children }) {
  return (
    <Box
      sx={{ ...FONT, bgcolor: BRAND.paper, color: '#1a1a1a', minHeight: '100%' }}
      className="p-4 md:p-8 min-w-0 w-full text-left"
    >
      <Box className="grid grid-cols-1 md:grid-cols-3 w-full">
        <Box className="hidden md:block" aria-hidden="true" />
        <Box className="min-w-0 w-full">{children}</Box>
        <Box className="hidden md:block" aria-hidden="true" />
      </Box>
    </Box>
  )
}

const EMPTY_PROFILE = {
  firstName: '',
  lastName: '',
  phone: '',
  birthDate: '',
  address: '',
  state: '',
  country: '',
  specializationArea: '',
  experience: '',
  academicStudies: '',
  completedCourses: '',
}

const BASE_FIELDS = [
  { key: 'firstName', labelKey: 'firstName', type: 'text', autoComplete: 'given-name' },
  { key: 'lastName', labelKey: 'lastName', type: 'text', autoComplete: 'family-name' },
  { key: 'phone', label: 'Teléfono', type: 'tel', autoComplete: 'tel' },
  {
    key: 'birthDate',
    label: '',
    type: 'date',
    InputLabelProps: { shrink: true },
  },
  { key: 'address', label: 'Dirección', type: 'text' },
  { key: 'state', label: 'Estado', type: 'text' },
  { key: 'country', label: 'País', type: 'text' },
]

const WORKER_ONLY_FIELDS = [
  {
    key: 'specializationArea',
    label: 'Área de especialización',
    multiline: false,
  },
  {
    key: 'experience',
    label: 'Experiencia',
    multiline: true,
    rows: 4,
  },
  {
    key: 'academicStudies',
    label: 'Estudios académicos',
    multiline: true,
    rows: 3,
  },
  {
    key: 'completedCourses',
    label: 'Cursos completados en la plataforma',
    multiline: true,
    rows: 3,
  },
]

function getProfileLabels(role) {
  const isWorker = role === ROLES.WORKER

  return {
    isWorker,
    pageTitle: isWorker ? 'Perfil de trabajador' : 'Perfil de usuario',
    firstNameLabel: isWorker ? 'Nombre(s) del trabajador' : 'Nombre(s)',
    lastNameLabel: 'Apellido(s)',
  }
}

export function buildFullName(firstName, lastName) {
  return [firstName, lastName].map((part) => part?.trim()).filter(Boolean).join(' ')
}

export function splitFullName(fullName) {
  const parts = fullName?.trim().split(/\s+/) ?? []

  if (parts.length === 0) {
    return { firstName: '', lastName: '' }
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }

  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

export function mapApiToProfileForm({
  profile,
  workerProfile,
  enrollments = [],
  courses = [],
}) {
  const { firstName, lastName } = splitFullName(profile?.full_name)
  const courseById = new Map(courses.map((course) => [course.id, course.title]))

  const completedCourses = enrollments
    .filter((enrollment) => enrollment.status === 'completed')
    .map((enrollment) => courseById.get(enrollment.course_id) ?? `Curso #${enrollment.course_id}`)
    .join(', ')

  const base = {
    firstName,
    lastName,
    phone: profile?.phone ?? '',
    birthDate: '',
    address: profile?.address ?? '',
    state: '',
    country: '',
  }

  if (!workerProfile) {
    return base
  }

  return {
    ...base,
    specializationArea: workerProfile.bio ?? '',
    experience: workerProfile.experience ?? '',
    academicStudies: workerProfile.academic_history ?? '',
    completedCourses,
  }
}

export function getFieldsByRole(role) {
  const { firstNameLabel, lastNameLabel } = getProfileLabels(role)

  const baseFields = BASE_FIELDS.map((field) => {
    if (field.labelKey === 'firstName') return { ...field, label: firstNameLabel }
    if (field.labelKey === 'lastName') return { ...field, label: lastNameLabel }
    return field
  })

  if (role === ROLES.WORKER) {
    return [...baseFields, ...WORKER_ONLY_FIELDS]
  }

  return baseFields
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value ?? '')
}

function formatBirthDate(value) {
  if (!isIsoDate(value)) return ''
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

function resolveFieldValue({ type, rawValue, isEditing, emptyValue }) {
  if (type === 'date') {
    if (isIsoDate(rawValue)) return rawValue
    return isEditing ? '' : emptyValue
  }

  return rawValue || (isEditing ? '' : emptyValue)
}

function ProfileField({
  label,
  value,
  onChange,
  readOnly = false,
  multiline = false,
  rows = 1,
  type = 'text',
  InputLabelProps,
}) {
  const isEditing = !readOnly
  const isDateField = type === 'date'
  const hasDateValue = isDateField && isIsoDate(value)

  const textFieldProps = {
    fullWidth: true,
    label,
    onChange,
    multiline,
    rows,
    variant: 'outlined',
    InputProps: { readOnly },
    sx: getTextFieldSx(isEditing),
  }

  if (isDateField && readOnly) {
    return (
      <TextField
        {...textFieldProps}
        type="text"
        value={hasDateValue ? formatBirthDate(value) : value || '—'}
        InputLabelProps={{ shrink: true, ...InputLabelProps }}
      />
    )
  }

  if (isDateField) {
    return (
      <TextField
        {...textFieldProps}
        type="date"
        value={hasDateValue ? value : ''}
        placeholder=" "
        InputLabelProps={{ shrink: true, ...InputLabelProps }}
      />
    )
  }

  return (
    <TextField
      {...textFieldProps}
      value={value}
      type={type}
      InputLabelProps={InputLabelProps}
    />
  )
}

function ProfileFieldSection({ title, fields, isEditing, displayData, emptyValue, onFieldChange }) {
  return (
    <Box className="border border-gray-200 rounded-2xl bg-paper p-5 md:p-6 mb-6">
      <Stack spacing={3}>
        <Typography sx={FONT} className="text-lg font-bold text-gray-900">
          {title}
        </Typography>

        <Stack spacing={2.5}>
          {fields.map(({ key, label, multiline, rows, type = 'text', InputLabelProps }) => (
            <ProfileField
              key={key}
              label={label}
              value={resolveFieldValue({
                type,
                rawValue: displayData[key],
                isEditing,
                emptyValue,
              })}
              onChange={onFieldChange(key)}
              readOnly={!isEditing}
              multiline={multiline}
              rows={rows}
              type={type}
              InputLabelProps={InputLabelProps}
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}

export function Profile({
  role = ROLES.USER,
  initialData = {},
  onSave,
}) {
  const { pageTitle } = getProfileLabels(role)
  const allFields = getFieldsByRole(role)
  const personalFields = allFields.filter((field) => !WORKER_FIELD_KEYS.has(field.key))
  const professionalFields = allFields.filter((field) => WORKER_FIELD_KEYS.has(field.key))

  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({ ...EMPTY_PROFILE, ...initialData })
  const [draft, setDraft] = useState(profile)

  useEffect(() => {
    const nextProfile = { ...EMPTY_PROFILE, ...initialData }
    setProfile(nextProfile)
    setDraft((currentDraft) => (isEditing ? currentDraft : nextProfile))
  }, [initialData, isEditing])

  const displayData = isEditing ? draft : profile
  const emptyValue = '—'

  const handleChange = (field) => (event) => {
    setDraft((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleEdit = () => {
    setDraft(profile)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setDraft(profile)
    setIsEditing(false)
  }

  const handleSave = () => {
    setProfile(draft)
    setIsEditing(false)
    onSave?.(draft)
  }

  return (
    <ProfilePageShell>
      <Box className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <Typography sx={FONT} className="text-2xl font-bold text-gray-900">
          {pageTitle}
        </Typography>
        {!isEditing && (
          <Button
            variant="contained"
            onClick={handleEdit}
            sx={{
              ...FONT,
              bgcolor: BRAND.primary,
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2.5,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#a55dd3', boxShadow: 'none' },
            }}
          >
            Editar
          </Button>
        )}
      </Box>

      <Stack spacing={0}>
        <ProfileFieldSection
          title="Información personal"
          fields={personalFields}
          isEditing={isEditing}
          displayData={displayData}
          emptyValue={emptyValue}
          onFieldChange={handleChange}
        />

        {professionalFields.length > 0 ? (
          <Box className="border border-primary-200 rounded-2xl bg-primary-50 p-5 md:p-6 mb-6">
            <Stack spacing={3}>
              <Typography sx={FONT} className="text-lg font-bold text-gray-900">
                Información profesional
              </Typography>

              <Stack spacing={2.5}>
                {professionalFields.map(
                  ({ key, label, multiline, rows, type = 'text', InputLabelProps }) => (
                    <ProfileField
                      key={key}
                      label={label}
                      value={displayData[key] || (isEditing ? '' : emptyValue)}
                      onChange={handleChange(key)}
                      readOnly={!isEditing}
                      multiline={multiline}
                      rows={rows}
                      type={type}
                      InputLabelProps={InputLabelProps}
                    />
                  ),
                )}
              </Stack>
            </Stack>
          </Box>
        ) : null}
      </Stack>

      {isEditing && (
        <Box sx={{ mt: 3, display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{
              ...FONT,
              borderColor: BRAND.primaryDark,
              color: BRAND.primaryDark,
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2.5,
              '&:hover': {
                borderColor: BRAND.primaryDark,
                bgcolor: '#f4e7fd',
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              ...FONT,
              bgcolor: BRAND.primary,
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2.5,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#a55dd3', boxShadow: 'none' },
            }}
          >
            Guardar
          </Button>
        </Box>
      )}
    </ProfilePageShell>
  )
}

function ProfilePage() {
  const { user, profile, workerProfile, isLoading } = useCurrentUser()
  const workerId = workerProfile?.id
  const isWorker = user?.role === 'worker'

  const { data: enrollments = [] } = useGetWorkerCourseEnrollmentsQuery(workerId, {
    skip: !isWorker || !workerId,
  })
  const { data: courses = [] } = useGetCoursesQuery(undefined, {
    skip: !isWorker || !workerId,
  })

  const initialData = useMemo(
    () => mapApiToProfileForm({ profile, workerProfile, enrollments, courses }),
    [profile, workerProfile, enrollments, courses],
  )

  const role = isWorker ? ROLES.WORKER : ROLES.USER

  if (isLoading) {
    return (
      <ProfilePageShell>
        <Box className="min-h-[60vh] flex items-center justify-center">
          <CircularProgress sx={{ color: BRAND.primary }} />
        </Box>
      </ProfilePageShell>
    )
  }

  if (!user) {
    return (
      <ProfilePageShell>
        <Alert severity="warning">Inicia sesión para ver tu perfil.</Alert>
      </ProfilePageShell>
    )
  }

  if (!profile) {
    return (
      <ProfilePageShell>
        <Alert severity="info">Aún no has completado tu perfil.</Alert>
      </ProfilePageShell>
    )
  }

  return <Profile role={role} initialData={initialData} />
}

export default ProfilePage
