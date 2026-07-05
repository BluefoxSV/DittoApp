import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

import {
  useGetCourseLessonsQuery,
  useGetCourseQuery,
} from "../../store/api/coursesApi";

const normalizeYouTubeUrl = (url) => {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const videoId = parsedUrl.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    if (hostname === "youtu.be") {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch {
    return url;
  }

  return url;
};

export default function VisorDeCurso() {
  const { courseId } = useParams();
  const parsedCourseId = Number(courseId);
  const hasValidCourseId = Number.isInteger(parsedCourseId) && parsedCourseId > 0;
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const {
    data: course,
    isLoading: isLoadingCourse,
    error: courseError,
  } = useGetCourseQuery(parsedCourseId, { skip: !hasValidCourseId });
  const {
    data: lessons = [],
    isLoading: isLoadingLessons,
    error: lessonsError,
  } = useGetCourseLessonsQuery(parsedCourseId, { skip: !hasValidCourseId });
  const selectedLesson =
    lessons.find(({ id }) => id === selectedLessonId) ?? lessons[0] ?? null;
  const isLoading = isLoadingCourse || isLoadingLessons;
  const error = courseError || lessonsError;

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "calc(100svh - var(--ditto-navbar-height))",
          display: "grid",
          placeItems: "center",
          bgcolor: "#f5f7fb",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!hasValidCourseId || error || !course) {
    return (
      <Box
        sx={{
          minHeight: "calc(100svh - var(--ditto-navbar-height))",
          display: "grid",
          placeItems: "center",
          bgcolor: "#f5f7fb",
          p: 3,
        }}
      >
        <Stack spacing={2} sx={{ width: "100%", maxWidth: 560 }}>
          <Alert severity="error">
            {error?.data?.detail || "No se pudo cargar el curso solicitado."}
          </Alert>
          <Button component={RouterLink} to="/lista-curso" color="secondary">
            Volver al catálogo
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "#f5f7fb",
        minHeight: "calc(100svh - var(--ditto-navbar-height))",
      }}
    >
      <Box
        sx={{
          bgcolor: "#a72bc1",
          color: "#fff",
          py: { xs: 2.5, md: 3 },
          px: 2,
          textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{ m: 0, fontWeight: 700, color: "#fff", letterSpacing: 0 }}
        >
          {course.title}
        </Typography>
      </Box>

      <Container maxWidth={false} disableGutters>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "280px minmax(0, 1fr)" },
            minHeight: { lg: 765 },
            textAlign: "left",
          }}
        >
          <Paper
            elevation={0}
            component="aside"
            sx={{
              borderRadius: 0,
              borderRight: { lg: "1px solid #e5e7eb" },
              borderBottom: { xs: "1px solid #e5e7eb", lg: 0 },
              bgcolor: "#fff",
              px: { xs: 2, md: 2 },
              pt: 1
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.25}
              sx={{ mb: 2.5 }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(167,43,193,0.1)",
                  color: "#8f22af",
                }}
              >
                <MenuBookOutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ color: "#1f2937", fontWeight: 800, lineHeight: 1.1 }}
                >
                  Temas del curso
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  {lessons.length} lecciones disponibles
                </Typography>
              </Box>
            </Stack>

            <Stack
              spacing={1.5}
              sx={{
                maxHeight: { xs: 300, lg: 680 },
                overflowY: "auto",
                pr: 0.5,
                scrollbarWidth: "thin",
                scrollbarColor: "#c084d8 #f3e8ff",
                "&::-webkit-scrollbar": {
                  width: 8,
                },
                "&::-webkit-scrollbar-track": {
                  bgcolor: "#f3e8ff",
                  borderRadius: 999,
                },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "#c084d8",
                  borderRadius: 999,
                },
              }}
            >
              {lessons.map((lesson, index) => {
                const isActive = lesson.id === selectedLesson?.id;

                return (
                  <Button
                    key={lesson.id}
                    onClick={() => setSelectedLessonId(lesson.id)}
                    variant="outlined"
                    sx={{
                      width: "100%",
                      display: "grid",
                      gridTemplateColumns: "30px minmax(0, 1fr) 24px",
                      justifyContent: "flex-start",
                      textTransform: "none",
                      textAlign: "left",
                      alignItems: "start",
                      gap: 1.5,
                      p: { xs: 1.25, sm: 1.5 },
                      minHeight: "auto",
                      height: "auto",
                      whiteSpace: "normal",
                      overflow: "visible",
                      borderRadius: 2,
                      borderColor: isActive ? "#a72bc1" : "#e4d7ef",
                      bgcolor: isActive ? "#a72bc1" : "#fff",
                      color: isActive ? "#fff" : "#1f2937",
                      boxShadow: isActive
                        ? "0 12px 24px rgba(167,43,193,0.2)"
                        : "none",
                      "&:hover": {
                        borderColor: "#a72bc1",
                        bgcolor: isActive ? "#9322ad" : "rgba(167,43,193,0.06)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        flex: "0 0 auto",
                        display: "grid",
                        placeItems: "center",
                        gridColumn: 1,
                        gridRow: "1 / span 3",
                        bgcolor: isActive
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(167,43,193,0.1)",
                        color: isActive ? "#fff" : "#a72bc1",
                        fontWeight: 800,
                        fontSize: 13,
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Box sx={{ minWidth: 0, gridColumn: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "inherit",
                          fontWeight: 800,
                          lineHeight: 1.25,
                          whiteSpace: "normal",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {lesson.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          color: isActive
                            ? "rgba(255,255,255,0.78)"
                            : "#7c3aa4",
                          mt: 0.5,
                          whiteSpace: "normal",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {lesson.content_type === "video" ? "Video" : "Presentación"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        flex: "0 0 auto",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        justifyContent: "flex-start",
                        gap: 1,
                        minWidth: 0,
                        gridColumn: 3,
                        gridRow: 1,
                      }}
                    >
                      {isActive ? (
                        <CheckCircleOutlineIcon fontSize="small" />
                      ) : (
                        <ChevronRightIcon fontSize="small" />
                      )}
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        justifySelf: "start",
                        gridColumn: "2 / 4",
                        gridRow: 2,
                        px: 1,
                        py: 0.35,
                        borderRadius: 1,
                        bgcolor: isActive ? "rgba(255,255,255,0.2)" : "#f3e8ff",
                        color: isActive ? "#fff" : "#7c3aa4",
                        fontSize: 12,
                        fontWeight: 800,
                        lineHeight: 1.2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {lesson.content_type === "video" ? "Video" : "Material"}
                    </Box>
                  </Button>
                );
              })}
            </Stack>
          </Paper>

          <Box
            component="main"
            sx={{
              px: { xs: 2, md: 4, xl: 6 },
              py: { xs: 3, md: 5 },
              bgcolor: "#f5f7fb",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={2}
              sx={{ mb: 3 }}
            >
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: "#8f22af",
                    fontWeight: 900,
                    letterSpacing: 1.4,
                  }}
                >
                  Tema actual
                </Typography>
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    color: "#111827",
                    fontWeight: 900,
                    mt: 0.5,
                    mb: 1,
                    letterSpacing: 0,
                  }}
                >
                  {selectedLesson?.title || course.title}
                </Typography>
              </Box>

              <Chip
                icon={<PlayCircleOutlineIcon />}
                label={
                  selectedLesson?.content_type === "video" ? "Video" : "Presentación"
                }
                sx={{
                  bgcolor: "rgba(167,43,193,0.1)",
                  color: "#8f22af",
                  fontWeight: 800,
                  "& .MuiChip-icon": { color: "#8f22af" },
                }}
              />
            </Stack>

            <Typography
              variant="body1"
              sx={{
                mb: 3,
                color: "#374151",
                fontSize: { xs: 16, md: 18 },
                lineHeight: 1.7,
              }}
            >
              {course.summary || course.description || "Contenido del curso."}
            </Typography>

            <Box
              sx={{
                width: "100%",
                maxWidth: 920,
                ml: 0,
                mr: "auto",
                aspectRatio: "16 / 9",
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "#111827",
                border: "1px solid rgba(17,24,39,0.12)",
                boxShadow: "0 18px 40px rgba(17,24,39,0.18)",
              }}
            >
              {selectedLesson ? (
                <iframe
                  src={
                    selectedLesson.content_type === "video"
                      ? normalizeYouTubeUrl(selectedLesson.content_url)
                      : selectedLesson.content_url
                  }
                  title={selectedLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    width: "100%",
                    height: "100%",
                    border: 0,
                    display: "block",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    px: 3,
                    textAlign: "center",
                  }}
                >
                  Este curso todavía no tiene lecciones publicadas.
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
