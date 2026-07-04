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
    categoria: 'Negocios',
    titulo: 'Productividad y organización',
    descripcion: 'Mejora tus procesos diarios con metodologías simples y efectivas.',
    imagen:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=900&q=80',
  },
];

export default function ListCourses() {
  return (
    <>
      <AppBar sx={{ background: '#953CD1' }} position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Explora nuestros cursos
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} disableGutters sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 3,
            alignItems: 'stretch',
          }}
        >
          {cursos.map((curso) => (
            <Box key={curso.id} sx={{ minWidth: 0 }}>
              <Card
                sx={{
                  height: 400,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 3,
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={curso.imagen}
                  alt={curso.titulo}
                  sx={{ objectFit: 'cover', flexShrink: 0 }}
                />
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {curso.categoria}
                      </Typography>
                      <Chip label="Nuevo" size="small" color="primary" />
                    </Box>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        mb: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {curso.titulo}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {curso.descripcion}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, mt: 'auto' }}>
                  <Button size="small" variant="contained" sx={{ mr: 1 }}>
                    Ver curso
                  </Button>
                  <Button size="small" variant="outlined">
                    Detalles
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>

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
