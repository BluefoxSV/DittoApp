import React from 'react';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Grid,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material';

const cursos = [
  {
    id: 1,
    categoria: 'Desarrollo',
    titulo: 'Introducción a React',
    descripcion: 'Aprende los fundamentos de React y construye interfaces modernas.',
    imagen:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    categoria: 'Diseño',
    titulo: 'Diseño UI con Material UI',
    descripcion: 'Explora componentes visuales y patrones de experiencia de usuario.',
    imagen:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    categoria: 'Negocios',
    titulo: 'Productividad y organización',
    descripcion: 'Mejora tus procesos diarios con metodologías simples y efectivas.',
    imagen:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    categoria: 'Tecnología',
    titulo: 'Fundamentos de JavaScript',
    descripcion: 'Domina la lógica de programación y la manipulación del DOM.',
    imagen:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
  },
];

export default function ListCourses() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Lista de Cursos
          </Typography>
        </Toolbar>
      </AppBar>

      <Container  sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Explora nuestros cursos
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Elige un curso para ver su contenido, módulos y recursos disponibles.
        </Typography>

        <Grid container spacing={3}>
          {cursos.map((curso) => (
            <Grid item xs={12} sm={6} md={4} key={curso.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3, borderRadius: 3 }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={curso.imagen}
                  alt={curso.titulo}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {curso.categoria}
                    </Typography>
                    <Chip label="Nuevo" size="small" color="primary" />
                  </Box>
                  <Typography variant="h5" component="div" sx={{ mb: 1.5 }}>
                    {curso.titulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {curso.descripcion}
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button size="small" variant="contained" sx={{ mr: 1 }}>
                    Ver curso
                  </Button>
                  <Button size="small" variant="outlined">
                    Detalles
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            ¿Quieres comenzar hoy?
          </Typography>
          <Typography variant="body1" paragraph>
            Selecciona un curso y accede a su contenido desde una experiencia visual y sencilla.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" sx={{ mr: 1 }}>
              Iniciar
            </Button>
            <Button variant="outlined">Cancelar</Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
