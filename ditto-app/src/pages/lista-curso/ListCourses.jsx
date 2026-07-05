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
    <>
      <AppBar sx={{ background: "#953CD1" }} position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Explora nuestros cursos
          </Typography>
          {canCreateCourses ? (
            <Button
              variant="contained"
              onClick={() => setIsCreateDialogOpen(true)}
              sx={{
                bgcolor: "#fff",
                color: "#7c2baa",
                fontWeight: 700,
                "&:hover": { bgcolor: "#f7edfc" },
              }}
            >
              Crear curso
            </Button>
          ) : null}
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} disableGutters sx={{ py: 4 }}>
        {coursesError ? (
          <Alert severity="error" sx={{ mb: 3, mx: { xs: 2, md: 3 } }}>
            {getApiError(coursesError, "No se pudieron cargar los cursos.")}
          </Alert>
        ) : null}
        {enrollmentsError ? (
          <Alert severity="error" sx={{ mb: 3, mx: { xs: 2, md: 3 } }}>
            {getApiError(
              enrollmentsError,
              "No se pudieron consultar tus inscripciones.",
            )}
          </Alert>
        ) : null}
        {enrollmentError ? (
          <Alert severity="error" sx={{ mb: 3, mx: { xs: 2, md: 3 } }}>
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
              lg: "repeat(4, minmax(0, 1fr))",
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
                    height: 400,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: 3,
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
                      height: 150,
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
                          mb: 1.5,
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
                  <CardActions sx={{ px: 2, pb: 2, mt: "auto" }}>
                    <Button
                      component={RouterLink}
                      to={`/curso/${course.id}`}
                      size="small"
                      variant="contained"
                      sx={{ mr: 1 }}
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
                        to={`/curso/${course.id}`}
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
    </>
  );
}
