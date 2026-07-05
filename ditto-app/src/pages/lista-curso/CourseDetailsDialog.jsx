import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import { useGetCourseLessonsQuery } from "../../store/api/coursesApi";

const FALLBACK_IMAGE = "/images/ditto-cursos.png";
const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" };

function formatDate(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("es-SV", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function CourseDetailsDialog({ course, open, onClose }) {
  const {
    data: lessons = [],
    isLoading,
    error,
  } = useGetCourseLessonsQuery(course?.id, {
    skip: !open || !course?.id,
  });

  if (!course) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          bgcolor: "#FCFCF5",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, sm: 3 },
          py: 2,
          borderBottom: "1px solid #eadff1",
        }}
      >
        <Typography sx={{ ...FONT, fontWeight: 800, color: "#1f2937" }}>
          Detalles del curso
        </Typography>
        <IconButton onClick={onClose} aria-label="Cerrar detalles">
          <i className="ti ti-x" aria-hidden="true" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(260px, 0.8fr) 1.2fr" },
            gap: { xs: 3, md: 4 },
            textAlign: "left",
          }}
        >
          <Box
            component="img"
            src={course.thumbnail_url || FALLBACK_IMAGE}
            alt={course.title}
            sx={{
              width: "100%",
              height: { xs: 220, md: 300 },
              objectFit: "cover",
              borderRadius: 3,
              border: "1px solid #eadff1",
            }}
          />

          <Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              <Chip label="Curso Ditto" size="small" color="secondary" />
              <Chip
                label={course.is_active ? "Disponible" : "No disponible"}
                size="small"
                variant="outlined"
                color={course.is_active ? "secondary" : "default"}
              />
            </Box>
            <Typography
              component="h2"
              sx={{
                ...FONT,
                color: "#1f2937",
                fontSize: { xs: "1.75rem", md: "2.25rem" },
                fontWeight: 800,
                lineHeight: 1.15,
              }}
            >
              {course.title}
            </Typography>

            {course.summary ? (
              <Typography
                sx={{
                  ...FONT,
                  mt: 2,
                  color: "#874cad",
                  fontWeight: 700,
                  lineHeight: 1.6,
                }}
              >
                {course.summary}
              </Typography>
            ) : null}
            <Typography
              sx={{
                ...FONT,
                mt: 2,
                color: "#4b5563",
                lineHeight: 1.75,
                whiteSpace: "pre-wrap",
              }}
            >
              {course.description || "Este curso todavía no tiene una descripción."}
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 2,
                mt: 3,
              }}
            >
              <Box sx={{ bgcolor: "#f4e7fd", borderRadius: 2.5, p: 2 }}>
                <Typography sx={{ ...FONT, color: "#6b7280", fontSize: 12 }}>
                  Lecciones
                </Typography>
                <Typography sx={{ ...FONT, color: "#874cad", fontWeight: 800, mt: 0.5 }}>
                  {isLoading ? <CircularProgress size={16} /> : lessons.length}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: "#f4e7fd", borderRadius: 2.5, p: 2 }}>
                <Typography sx={{ ...FONT, color: "#6b7280", fontSize: 12 }}>
                  Publicado
                </Typography>
                <Typography sx={{ ...FONT, color: "#874cad", fontWeight: 800, mt: 0.5 }}>
                  {formatDate(course.created_at)}
                </Typography>
              </Box>
            </Box>

            {error ? (
              <Alert severity="warning" sx={{ mt: 2 }}>
                No se pudo consultar la cantidad de lecciones.
              </Alert>
            ) : null}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cerrar
        </Button>
        <Button
          component={RouterLink}
          to={`/curso/${course.id}`}
          onClick={onClose}
          variant="contained"
          color="secondary"
        >
          Ver curso
        </Button>
      </DialogActions>
    </Dialog>
  );
}
