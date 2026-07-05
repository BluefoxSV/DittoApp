import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import { useAddCourseLessonMutation } from "../../store/api/coursesApi";

const INITIAL_FORM = {
  title: "",
  contentType: "video",
  contentUrl: "",
  order: "",
};

export default function CreateLessonDialog({
  open,
  onClose,
  courseId,
  nextOrder,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [addLesson, { isLoading, error, reset }] = useAddCourseLessonMutation();

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const closeDialog = () => {
    if (isLoading) return;
    reset();
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const title = form.title.trim();
    const contentUrl = form.contentUrl.trim();
    if (!title || !contentUrl || !courseId || isLoading) return;

    try {
      await addLesson({
        courseId,
        title,
        content_type: form.contentType,
        content_url: contentUrl,
        order: form.order === "" ? nextOrder : Number(form.order),
      }).unwrap();
      setForm(INITIAL_FORM);
      reset();
      onClose();
    } catch {
      // El error de la API permanece visible dentro del diálogo.
    }
  };

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle sx={{ fontWeight: 700 }}>Agregar lección</DialogTitle>
        <DialogContent>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error?.data?.detail || "No se pudo agregar la lección."}
            </Alert>
          ) : null}
          <TextField
            label="Título de la lección"
            value={form.title}
            onChange={updateField("title")}
            required
            fullWidth
            autoFocus
            inputProps={{ maxLength: 255 }}
            sx={{ mt: 1, mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="lesson-content-type-label">Tipo de contenido</InputLabel>
            <Select
              labelId="lesson-content-type-label"
              label="Tipo de contenido"
              value={form.contentType}
              onChange={updateField("contentType")}
            >
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="slide">Presentación o documento</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="URL del contenido"
            value={form.contentUrl}
            onChange={updateField("contentUrl")}
            required
            fullWidth
            inputProps={{ maxLength: 500 }}
            helperText="Admite enlaces de YouTube, videos, presentaciones o documentos."
            sx={{ mb: 2 }}
          />
          <TextField
            label="Orden"
            value={form.order}
            onChange={updateField("order")}
            type="number"
            fullWidth
            inputProps={{ min: 0 }}
            helperText={`Opcional. El siguiente orden disponible es ${nextOrder}.`}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeDialog} disabled={isLoading} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={!form.title.trim() || !form.contentUrl.trim() || isLoading}
          >
            {isLoading ? <CircularProgress size={20} color="inherit" /> : "Agregar"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
