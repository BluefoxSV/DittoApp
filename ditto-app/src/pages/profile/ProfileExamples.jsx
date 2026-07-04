import { Box, Divider, Typography } from '@mui/material'
import Profile, { ROLES } from './Profile.jsx'

const USER_SAMPLE_DATA = {
  name: 'Carlos Mendoza',
  birthDate: '1995-03-22',
  address: 'Calle Insurgentes 118',
  state: 'Jalisco',
  country: 'México',
}

const WORKER_SAMPLE_DATA = {
  name: 'María López',
  birthDate: '1992-08-14',
  address: 'Av. Reforma 245',
  state: 'Ciudad de México',
  country: 'México',
  specializationArea: 'Electricidad residencial',
  experience: '4 años instalando sistemas eléctricos domésticos.',
  academicStudies: 'Técnico en electromecánica',
  completedCourses: 'Seguridad eléctrica, Instalaciones básicas',
}

function getInitialDataByRole(role) {
  return role === ROLES.WORKER ? WORKER_SAMPLE_DATA : USER_SAMPLE_DATA
}

export function ProfileExample({ role = ROLES.USER }) {
  return (
    <Profile
      role={role}
      initialData={getInitialDataByRole(role)}
    />
  )
}

export default function ProfileExamples() {
  return (
    <Box>
      <ProfileExample role={ROLES.USER} />
      <Divider sx={{ my: 4 }} />
      <ProfileExample role={ROLES.WORKER} />
    </Box>
  )
}
