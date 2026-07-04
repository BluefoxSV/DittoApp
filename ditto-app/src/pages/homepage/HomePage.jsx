import { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Navbar from '../../components/layout/navBar';


const slides = [
  {
    eyebrow: 'Servicios cerca de ti',
    title: 'El talento que necesitas, justo cuando lo necesitas',
    description:
      'Conecta con carpinteros, fontaneros, electricistas y otros profesionales independientes de confianza.',
    primaryAction: 'Encontrar un profesional',
    secondaryAction: 'Quiero ofrecer servicios',
    image: '/images/ditto-profesionales.png',
    position: 'center',
  },
  {
    eyebrow: 'Ditto Cursos',
    title: 'Aprende un oficio. Mejora tus oportunidades.',
    description:
      'Capacítate a tu ritmo con cursos prácticos creados para ayudarte a trabajar mejor y conseguir más clientes.',
    primaryAction: 'Explorar cursos',
    secondaryAction: 'Conocer la Super App',
    image: '/images/ditto-cursos.png',
    position: 'left center',
  },
  {
    eyebrow: 'Una comunidad que avanza',
    title: 'Clientes y profesionales creciendo juntos',
    description:
      'Publica lo que necesitas, recibe propuestas y encuentra una solución mientras apoyas el talento local.',
    primaryAction: 'Publicar una necesidad',
    secondaryAction: '¿Cómo funciona?',
    image: '/images/ditto-profesionales.png',
    position: 'right center',
  },
];

const services = [
  { icon: '🪚', name: 'Carpintería', detail: 'Muebles, reparaciones e instalaciones' },
  { icon: '🔧', name: 'Fontanería', detail: 'Fugas, tuberías y mantenimiento' },
  { icon: '⚡', name: 'Electricidad', detail: 'Instalaciones y reparaciones seguras' },
  { icon: '🎨', name: 'Pintura', detail: 'Interiores, exteriores y acabados' },
  { icon: '🧱', name: 'Construcción', detail: 'Obra, remodelación y mantenimiento' },
  { icon: '🌿', name: 'Jardinería', detail: 'Cuidado y diseño de áreas verdes' },
];

const courses = [
  {
    category: 'Carpintería',
    title: 'Carpintería desde cero',
    description: 'Herramientas, medidas, cortes y ensambles para tus primeros proyectos.',
    lessons: '12 lecciones',
    duration: '6 horas',
    color: '#7c3aed',
    imagePosition: '18% center',
  },
  {
    category: 'Fontanería',
    title: 'Instalaciones hidráulicas',
    description: 'Diagnostica fallas y realiza instalaciones domésticas correctamente.',
    lessons: '10 lecciones',
    duration: '5 horas',
    color: '#0284c7',
    imagePosition: '52% center',
  },
  {
    category: 'Electricidad',
    title: 'Electricidad residencial segura',
    description: 'Fundamentos, circuitos y prácticas esenciales de seguridad.',
    lessons: '14 lecciones',
    duration: '8 horas',
    color: '#d97706',
    imagePosition: '80% center',
  },
];

const steps = [
  {
    number: '01',
    title: 'Cuéntanos qué necesitas',
    description: 'Describe el servicio, ubicación y horario que más te conviene.',
  },
  {
    number: '02',
    title: 'Conecta con talento local',
    description: 'Encuentra profesionales disponibles y revisa sus habilidades.',
  },
  {
    number: '03',
    title: 'Coordina con confianza',
    description: 'Acuerda los detalles y mantén la comunicación desde Ditto.',
  },
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[activeSlide];
  const showPreviousSlide = () => {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  };
  const showNextSlide = () => {
    setActiveSlide((current) => (current + 1) % slides.length);
  };

  return (
    <Box sx={{ bgcolor: '#f8f7fc', color: '#171226', textAlign: 'left' }}>
      <Paper
        component="section"
        aria-roledescription="carrusel"
        aria-label="Conoce Ditto"
        elevation={0}
        square
        sx={{
          height: 'calc(100svh - var(--ditto-navbar-height, 64px))',
          minHeight: { xs: 610, sm: 620 },
          position: 'relative',
          display: 'flex',
          overflow: 'hidden',
          backgroundImage: {
            xs: `linear-gradient(90deg, rgba(22, 13, 49, 0.96) 0%, rgba(43, 22, 87, 0.82) 72%, rgba(43, 22, 87, 0.48) 100%), url("${slide.image}")`,
            md: `linear-gradient(90deg, rgba(22, 13, 49, 0.97) 0%, rgba(43, 22, 87, 0.84) 43%, rgba(43, 22, 87, 0.08) 78%), url("${slide.image}")`,
          },
          backgroundPosition: {
            xs: activeSlide === 1 ? '40% center' : '68% center',
            md: slide.position,
          },
          backgroundSize: 'cover',
          transition: 'background-image 350ms ease',
          color: '#fff',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            pb: { xs: 17, sm: 16, md: 14 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: { xs: 540, md: 690 }, px: { xs: 1, sm: 3, md: 5 }, zIndex: 1 }}>
            <Chip
              label={slide.eyebrow}
              sx={{
                mb: { xs: 1.75, md: 2.5 },
                bgcolor: 'rgba(255,255,255,.14)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,.25)',
                fontWeight: 700,
              }}
            />
            <Typography
              component="h1"
              sx={{
                maxWidth: 620,
                m: 0,
                fontSize: {
                  xs: 'clamp(2.25rem, 11vw, 3rem)',
                  sm: 'clamp(3rem, 7vw, 4.25rem)',
                  lg: '4.5rem',
                },
                lineHeight: { xs: 1.04, md: 1 },
                fontWeight: 800,
                letterSpacing: '-0.045em',
                color: '#fff',
              }}
            >
              {slide.title}
            </Typography>
            <Typography
              sx={{
                mt: { xs: 2, md: 2.5 },
                maxWidth: 570,
                fontSize: { xs: '0.96rem', sm: '1.05rem', md: '1.15rem' },
                lineHeight: { xs: 1.55, md: 1.65 },
                color: 'rgba(255,255,255,.82)',
              }}
            >
              {slide.description}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mt: { xs: 2.5, md: 3.5 } }}>
              <Button
                component={RouterLink}
                to={activeSlide === 1 ? '/curso' : '#servicios'}
                variant="contained"
                size="large"
                sx={{
                  bgcolor: '#f59e0b',
                  color: '#211605',
                  width: { xs: '100%', sm: 'auto' },
                  minHeight: { xs: 45, md: 48 },
                  px: { xs: 2, sm: 3 },
                  fontSize: { xs: '0.78rem', sm: '0.875rem' },
                  whiteSpace: 'nowrap',
                  fontWeight: 800,
                  '&:hover': { bgcolor: '#fbbf24' },
                }}
              >
                {slide.primaryAction}
              </Button>
              <Button
                href={activeSlide === 2 ? '#como-funciona' : '#super-app'}
                variant="outlined"
                size="large"
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  minHeight: { xs: 45, md: 48 },
                  borderColor: 'rgba(255,255,255,.55)',
                  color: '#fff',
                  px: { xs: 2, sm: 3 },
                  fontSize: { xs: '0.78rem', sm: '0.875rem' },
                  whiteSpace: 'nowrap',
                }}
              >
                {slide.secondaryAction}
              </Button>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: { xs: 1.5, md: 2.25 } }}>
              <IconButton
                aria-label="Diapositiva anterior"
                onClick={showPreviousSlide}
                size="small"
                sx={{ color: '#fff', border: '1px solid rgba(255,255,255,.35)' }}
              >
                ‹
              </IconButton>
              {slides.map((item, index) => (
                <Box
                  component="button"
                  key={item.title}
                  type="button"
                  aria-label={`Ir a diapositiva ${index + 1}`}
                  aria-current={activeSlide === index}
                  onClick={() => setActiveSlide(index)}
                  sx={{
                    width: activeSlide === index ? 28 : 9,
                    height: 9,
                    p: 0,
                    border: 0,
                    borderRadius: 5,
                    bgcolor: activeSlide === index ? '#f59e0b' : 'rgba(255,255,255,.5)',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                />
              ))}
              <IconButton
                aria-label="Siguiente diapositiva"
                onClick={showNextSlide}
                size="small"
                sx={{ color: '#fff', border: '1px solid rgba(255,255,255,.35)' }}
              >
                ›
              </IconButton>
            </Stack>
          </Box>
        </Container>

        <Container
          maxWidth="xl"
          sx={{
            position: 'absolute',
            zIndex: 2,
            left: '50%',
            bottom: { xs: 10, sm: 14, md: 20 },
            transform: 'translateX(-50%)',
            width: '100%',
          }}
        >
          <Grid container spacing={{ xs: 1, md: 1.5 }}>
          {[
            ['+500', 'Profesionales'],
            ['30+', 'Especialidades'],
            ['24/7', 'Conexiones disponibles'],
            ['100%', 'Talento local'],
          ].map(([value, label]) => (
            <Grid key={label} size={{ xs: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  p: { xs: 1.1, sm: 1.5, md: 2 },
                  textAlign: 'center',
                  bgcolor: 'rgba(255,255,255,.93)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,.62)',
                  borderRadius: { xs: 2.5, md: 3 },
                }}
              >
                <Typography sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.8rem' } }} fontWeight={900} color="#6d28d9">
                  {value}
                </Typography>
                <Typography sx={{ fontSize: { xs: '0.68rem', sm: '0.8rem', md: '0.875rem' } }} color="text.secondary">
                  {label}
                </Typography>
              </Paper>
            </Grid>
          ))}
          </Grid>
        </Container>
      </Paper>

      <Container id="servicios" maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ maxWidth: 680, mb: 5 }}>
          <Chip label="Servicios para cada necesidad" color="secondary" variant="outlined" />
          <Typography
            component="h2"
            sx={{ mt: 2, fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, letterSpacing: '-.035em' }}
          >
            Soluciones reales, de personas que saben hacer el trabajo
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2, fontSize: '1.05rem' }}>
            Encuentra profesionales independientes de tu comunidad y convierte una necesidad en una
            solución.
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          {services.map((service) => (
            <Grid key={service.name} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  border: '1px solid #e6e1ef',
                  borderRadius: 4,
                  transition: 'transform 180ms ease, box-shadow 180ms ease',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 18px 45px rgba(54,31,92,.10)' },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Avatar
                    sx={{ width: 54, height: 54, mb: 2.5, bgcolor: '#f1eafe', fontSize: '1.6rem' }}
                  >
                    <span aria-hidden="true">{service.icon}</span>
                  </Avatar>
                  <Typography variant="h6" fontWeight={800}>
                    {service.name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                    {service.detail}
                  </Typography>
                  <Button href="#como-funciona" sx={{ mt: 2, px: 0, fontWeight: 700 }}>
                    Ver profesionales&nbsp; →
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box id="como-funciona" sx={{ bgcolor: '#20113f', color: '#fff', py: { xs: 8, md: 11 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 720, mx: 'auto', mb: 6 }}>
            <Typography color="#c4b5fd" fontWeight={800}>
              SIMPLE Y CERCANO
            </Typography>
            <Typography
              component="h2"
              sx={{ mt: 1.5, fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, color: '#fff' }}
            >
              De “necesito ayuda” a “trabajo resuelto”
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {steps.map((step) => (
              <Grid key={step.number} size={{ xs: 12, md: 4 }}>
                <Box sx={{ p: { xs: 1, md: 3 } }}>
                  <Typography sx={{ color: '#fbbf24', fontWeight: 900, fontSize: '2.2rem' }}>
                    {step.number}
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ mt: 2 }}>
                    {step.title}
                  </Typography>
                  <Typography sx={{ mt: 1.5, color: 'rgba(255,255,255,.66)', lineHeight: 1.7 }}>
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box id="super-app" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 5, md: 7 }} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Chip label="Cursos en la Super App Ditto" sx={{ bgcolor: '#ede9fe', color: '#5b21b6' }} />
              <Typography
                component="h2"
                sx={{ mt: 2, fontSize: { xs: '2.1rem', md: '3.25rem' }, fontWeight: 850, letterSpacing: '-.04em' }}
              >
                Tu talento puede llevarte más lejos
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.8 }}>
                Aprende habilidades prácticas, fortalece tu perfil profesional y prepárate para nuevas
                oportunidades. Estudia desde tu teléfono y avanza a tu ritmo.
              </Typography>
              <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
                <Box>
                  <Typography variant="h5" fontWeight={900} color="#6d28d9">
                    A tu ritmo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Acceso flexible
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={900} color="#6d28d9">
                    Prácticos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aprende haciendo
                  </Typography>
                </Box>
              </Stack>
              <Button component={RouterLink} to="/curso" variant="contained" size="large" sx={{ mt: 4 }}>
                Ver todos los cursos
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                component="img"
                src="/images/ditto-cursos.png"
                alt="Profesionales capacitándose con los cursos de Ditto"
                sx={{ width: '100%', display: 'block', borderRadius: 5, boxShadow: '0 24px 70px rgba(43,25,80,.2)' }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: { xs: 7, md: 10 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ sm: 'end' }}
              spacing={2}
              sx={{ mb: 4 }}
            >
              <Box>
                <Typography variant="overline" color="secondary" fontWeight={800}>
                  Cursos destacados
                </Typography>
                <Typography component="h3" variant="h4" fontWeight={850}>
                  Empieza a aprender hoy
                </Typography>
              </Box>
              <Button component={RouterLink} to="/curso">
                Ver catálogo completo&nbsp; →
              </Button>
            </Stack>
            <Grid container spacing={3}>
              {courses.map((course) => (
                <Grid key={course.title} size={{ xs: 12, md: 4 }}>
                  <Card
                    elevation={0}
                    sx={{ height: '100%', border: '1px solid #e6e1ef', borderRadius: 4, overflow: 'hidden' }}
                  >
                    <CardMedia
                      component="div"
                      sx={{
                        height: 185,
                        position: 'relative',
                        backgroundImage: `linear-gradient(0deg, ${course.color}b8, transparent 75%), url("/images/ditto-cursos.png")`,
                        backgroundPosition: course.imagePosition,
                        backgroundSize: 'cover',
                      }}
                    >
                      <Chip
                        label={course.category}
                        size="small"
                        sx={{ position: 'absolute', left: 16, bottom: 16, bgcolor: '#fff', fontWeight: 800 }}
                      />
                    </CardMedia>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={850}>
                        {course.title}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 1, minHeight: 50 }}>
                        {course.description}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 2.5, color: 'text.secondary' }}>
                        <Typography variant="caption">▤ {course.lessons}</Typography>
                        <Typography variant="caption">◷ {course.duration}</Typography>
                      </Stack>
                      <Button component={RouterLink} to="/curso" fullWidth variant="outlined" sx={{ mt: 2.5 }}>
                        Ver curso
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 7 },
            borderRadius: 6,
            textAlign: 'center',
            color: '#fff',
            background: 'linear-gradient(135deg, #6d28d9, #3b1a78)',
          }}
        >
          <Typography component="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 850 }}>
            Tu próximo trabajo o solución puede comenzar aquí
          </Typography>
          <Typography sx={{ mt: 2, color: 'rgba(255,255,255,.78)', maxWidth: 680, mx: 'auto' }}>
            Únete a Ditto y forma parte de una comunidad que conecta habilidades, necesidades y
            oportunidades.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" spacing={1.5} sx={{ mt: 4 }}>
            <Button href="#servicios" variant="contained" size="large" sx={{ bgcolor: '#f59e0b', color: '#211605' }}>
              Necesito un servicio
            </Button>
            <Button variant="outlined" size="large" sx={{ borderColor: '#fff', color: '#fff' }}>
              Soy profesional
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
