import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function HomePage() {
  return (
    <Container maxWidth={false} disableGutters sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Bienvenido a Ditto App
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Esta vista se carga con lazy loading y te permite entrar al visor del curso.
        </Typography>
        <Button component={RouterLink} to="/curso" variant="contained" size="large">
          Ver visor del curso
        </Button>
      </Box>
    </Container>
  );
}
