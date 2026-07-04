import { useState } from 'react'
import {
  AppBar,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'

export const ROLES = {
  WORKER: 'worker',
  USER: 'user',
}

const EMPTY_PROFILE = {
  name: '',
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
  { key: 'name', labelKey: 'name', type: 'text' },
  {
    key: 'birthDate',
    label: 'Fecha de nacimiento',
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
    nameLabel: isWorker ? 'Nombre del trabajador' : 'Nombre',
  }
}

export function getFieldsByRole(role) {
  const { nameLabel } = getProfileLabels(role)

  const baseFields = BASE_FIELDS.map((field) =>
    field.labelKey === 'name' ? { ...field, label: nameLabel } : field,
  )

  if (role === ROLES.WORKER) {
    return [...baseFields, ...WORKER_ONLY_FIELDS]
  }

  return baseFields
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
  return (
    <TextField
      fullWidth
      label={label}
      value={value}
      onChange={onChange}
      multiline={multiline}
      rows={rows}
      type={type}
      variant="outlined"
      InputLabelProps={InputLabelProps}
      InputProps={{ readOnly }}
    />
  )
}

export default function Profile({
  role = ROLES.USER,
  initialData = {},
  onSave,
}) {
  const { pageTitle } = getProfileLabels(role)
  const visibleFields = getFieldsByRole(role)

  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({ ...EMPTY_PROFILE, ...initialData })
  const [draft, setDraft] = useState(profile)

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

  const getFieldValue = (field) => displayData[field] || (isEditing ? '' : emptyValue)

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {pageTitle}
          </Typography>
          {!isEditing && (
            <Button color="inherit" variant="outlined" onClick={handleEdit}>
              Editar
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} disableGutters sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {pageTitle}
        </Typography>

        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Información personal
          </Typography>

          <Stack spacing={3} sx={{ mt: 1 }}>
            {visibleFields.map(
              ({ key, label, multiline, rows, type = 'text', InputLabelProps }) => (
                <ProfileField
                  key={key}
                  label={label}
                  value={getFieldValue(key)}
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

          {isEditing && (
            <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Guardar
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </>
  )
}
