import { useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

import { useCreateCourseMutation } from "../../store/api/coursesApi";

const INITIAL_FORM = {
  title: "",
  summary: "",
  description: "",
  thumbnailUrl: "",
};

export default function CreateCourseDialog({ open, onClose }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [createCourse, { isLoading, error }] = useCreateCourseMutation();

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const title = form.title.trim();
    if (!title || isLoading) return;

    try {
      await createCourse({
        title,
        summary: form.summary.trim() || null,
        description: form.description.trim() || null,
        thumbnail_url: form.thumbnailUrl.trim() || null,
      }).unwrap();
      setForm(INITIAL_FORM);
      onClose();
    } catch {
      // El error de la API se muestra dentro del diálogo.
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Crear curso</DialogTitle>
      <DialogContent component="form" id="create-course-form" onSubmit={handleSubmit}>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error?.data?.detail || "No se pudo crear el curso."}
          </Alert>
        ) : null}
        <TextField
          label="Título"
          value={form.title}
          onChange={updateField("title")}
          required
          fullWidth
          autoFocus
          inputProps={{ maxLength: 255 }}
          sx={{ mt: 1, mb: 2 }}
        />
        <TextField
          label="Resumen"
          value={form.summary}
          onChange={updateField("summary")}
          fullWidth
          multiline
          minRows={2}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Descripción"
          value={form.description}
          onChange={updateField("description")}
          fullWidth
          multiline
          minRows={4}
          sx={{ mb: 2 }}
        />
        <TextField
          label="URL de la imagen"
          value={form.thumbnailUrl}
          onChange={updateField("thumbnailUrl")}
          type="url"
          fullWidth
          inputProps={{ maxLength: 500 }}
          helperText="Opcional. Si se deja vacío se usará la imagen de Ditto."
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={isLoading} color="inherit">
          Cancelar
        </Button>
        <Button
          type="submit"
          form="create-course-form"
          variant="contained"
          color="secondary"
          disabled={!form.title.trim() || isLoading}
        >
          {isLoading ? <CircularProgress size={20} color="inherit" /> : "Crear curso"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
