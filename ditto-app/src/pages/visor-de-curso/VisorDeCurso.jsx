import {
  AppBar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material';

export default function VisorDeCurso() {
  return (
    <>
      <AppBar sx={{ background: '#953CD1' }} position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Bienvenido al Visor de Curso
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} disableGutters sx={{ py: 4 }}>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Módulo {item}
                  </Typography>
                  <Typography variant="h5" component="div">
                    Tema {item}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Contenido del módulo {item} del curso. Información relevante aquí.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Ver más</Button>
                  <Button size="small">Descargar</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Resumen del Curso
          </Typography>
          <Typography variant="body1" paragraph>
            Este es un ejemplo de página de visor de curso construida con Material-UI.
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
