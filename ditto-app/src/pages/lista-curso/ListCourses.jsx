import { useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { useCurrentUser } from "../../hooks/useCurrentUser";
import {
  useEnrollWorkerInCourseMutation,
  useGetCoursesQuery,
  useGetWorkerCourseEnrollmentsQuery,
} from "../../store/api/coursesApi";
import CreateCourseDialog from "./CreateCourseDialog";

const FALLBACK_IMAGE = "/images/ditto-cursos.png";
const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" };

function getApiError(error, fallback) {
  return error?.data?.detail ?? fallback;
}

export default function ListCourses() {
  const { user, workerProfile } = useCurrentUser();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const workerId = workerProfile?.id;
  const isWorker = user?.role === "worker";
  const canCreateCourses = Boolean(user);
  const {
    data: courses = [],
    isLoading: isLoadingCourses,
    error: coursesError,
  } = useGetCoursesQuery();
  const {
    data: enrollments = [],
    isLoading: isLoadingEnrollments,
    error: enrollmentsError,
  } = useGetWorkerCourseEnrollmentsQuery(workerId, {
    skip: !isWorker || !workerId,
  });
  const [enrollWorker, { isLoading: isEnrolling, error: enrollmentError }] =
    useEnrollWorkerInCourseMutation();

  const enrolledCourseIds = new Set(
    enrollments.map((enrollment) => enrollment.course_id),
  );

  const handleEnrollment = async (courseId) => {
    if (!workerId || isEnrolling) return;

    try {
      await enrollWorker({ workerId, courseId }).unwrap();
    } catch {
      // La API expone el motivo del error sobre el catálogo.
    }
  };

  return (
    <Box
      sx={{
        ...FONT,
        minHeight: "calc(100svh - var(--ditto-navbar-height, 64px))",
        bgcolor: "#FCFCF5",
        color: "#1a1a1a",
      }}
    >
      <AppBar
        elevation={0}
        sx={{ background: "#953CD1", color: "#fff" }}
        position="static"
      >
        <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
          <Typography
            variant="h6"
            component="h1"
            sx={{ ...FONT, flexGrow: 1, color: "#fff", fontWeight: 700 }}
          >
            Explora nuestros cursos
          </Typography>
          {canCreateCourses ? (
            <Button
              variant="contained"
              onClick={() => setIsCreateDialogOpen(true)}
              sx={{
                bgcolor: "#fff",
                color: "#7c2baa",
                borderRadius: 2.5,
                fontWeight: 700,
                "&:hover": { bgcolor: "#f7edfc" },
              }}
            >
              Crear curso
            </Button>
          ) : null}
        </Toolbar>
      </AppBar>

      <Container
        component="main"
        maxWidth={false}
        disableGutters
        sx={{
          minHeight: 520,
          bgcolor: "#FCFCF5",
          px: { xs: 2, md: 3 },
          py: { xs: 3, md: 4 },
        }}
      >
        {coursesError ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {getApiError(coursesError, "No se pudieron cargar los cursos.")}
          </Alert>
        ) : null}
        {enrollmentsError ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {getApiError(
              enrollmentsError,
              "No se pudieron consultar tus inscripciones.",
            )}
          </Alert>
        ) : null}
        {enrollmentError ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {getApiError(enrollmentError, "No se pudo completar la inscripción.")}
          </Alert>
        ) : null}

        {isLoadingCourses ? (
          <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
            <CircularProgress />
          </Box>
        ) : null}

        {!isLoadingCourses && !coursesError && courses.length === 0 ? (
          <Box sx={{ minHeight: 320, display: "grid", placeItems: "center", px: 3 }}>
            <Typography color="text.secondary">
              No hay cursos activos disponibles por el momento.
            </Typography>
          </Box>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
              xl: "repeat(4, minmax(0, 1fr))",
            },
            gap: 3,
            alignItems: "stretch",
          }}
        >
          {courses.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            return (
              <Box key={course.id} sx={{ minWidth: 0 }}>
                <Card
                  sx={{
                    height: "100%",
                    minHeight: 420,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "#fff",
                    color: "#1f2937",
                    textAlign: "left",
                    border: "1px solid #eadff1",
                    boxShadow: "0 8px 24px rgba(65, 35, 82, 0.08)",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={course.thumbnail_url || FALLBACK_IMAGE}
                    alt={course.title}
                    sx={{
                      width: "calc(100% - 24px)",
                      height: 170,
                      mx: "auto",
                      mt: 1.5,
                      objectFit: "cover",
                      borderRadius: 2,
                      flexShrink: 0,
                    }}
                  />
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      textAlign: "left",
                    }}
                  >
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Curso Ditto
                        </Typography>
                        <Chip
                          label={isEnrolled ? "Inscrito" : "Disponible"}
                          size="small"
                          color="secondary"
                        />
                      </Box>
                      <Typography
                        variant="h5"
                        component="div"
                        sx={{
                          ...FONT,
                          mb: 1.5,
                          color: "#1f2937",
                          fontWeight: 700,
                          lineHeight: 1.25,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {course.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {course.summary || course.description || "Consulta el contenido del curso."}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions
                    sx={{
                      px: 2,
                      pb: 2,
                      mt: "auto",
                      justifyContent: "flex-start",
                      flexWrap: "wrap",
                      gap: 1,
                      "& > :not(style) ~ :not(style)": { ml: 0 },
                    }}
                  >
                    <Button
                      component={RouterLink}
                      to={`/curso/${course.id}`}
                      size="small"
                      variant="contained"
                      sx={{ ...FONT }}
                      color="secondary"
                    >
                      Ver curso
                    </Button>
                    {isWorker ? (
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        disabled={
                          !workerId ||
                          isLoadingEnrollments ||
                          isEnrolled ||
                          isEnrolling
                        }
                        onClick={() => handleEnrollment(course.id)}
                      >
                        {isEnrolled ? "Inscrito" : "Inscribirme"}
                      </Button>
                    ) : (
                      <Button
                        component={RouterLink}
                        to={`/curso/${course.id}/detalles`}
                        size="small"
                        variant="outlined"
                        color="secondary"
                      >
                        Detalles
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Box>
            );
          })}
        </Box>
      </Container>

      <CreateCourseDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </Box>
  );
}
