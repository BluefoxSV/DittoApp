import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import logo from "../../assets/icon-192.png";
import { getFieldsByRole, ROLES } from "../../pages/profile/Profile.jsx";
import { useLoginMutation, useRegisterMutation } from "../../store/api/authApi";
import { useLazyGetMeQuery, useCreateProfileMutation } from "../../store/api/usersApi";
import { useCreateWorkerProfileMutation } from "../../store/api/workersApi";
import { setCredentials } from "../../store/slices/authSlice";

const DASHBOARD_BY_ROLE = {
  worker: "/dashtrabaja",
  user: "/dashusu",
  support: "/dashusu",
};

const AUTH_FIELDS = [
  { key: "email", label: "Correo", type: "email", autoComplete: "email" },
  {
    key: "password",
    label: "Contraseña",
    type: "password",
    autoComplete: "new-password",
    helperText: "Mínimo 8 caracteres",
  },
  {
    key: "confirmPassword",
    label: "Confirmar contraseña",
    type: "password",
    autoComplete: "new-password",
  },
];

const PHONE_FIELD = {
  key: "phone",
  label: "Teléfono",
  type: "tel",
  autoComplete: "tel",
};

const WORKER_FIELD_MAP = {
  specializationArea: "bio",
  experience: "experience",
  academicStudies: "academic_history",
};

function getErrorMessage(error, fallback) {
  if (!error) return fallback;

  const detail = error.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(", ");
  }

  return fallback;
}

function buildInitialForm(role) {
  const profileFields = getFieldsByRole(role);
  const profileState = Object.fromEntries(profileFields.map(({ key }) => [key, ""]));

  return {
    email: "",
    password: "",
    confirmPassword: "",
    role,
    phone: "",
    ...profileState,
  };
}

export default function RegisterForm() {
  const [form, setForm] = useState(() => buildInitialForm(ROLES.USER));
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [createProfile, { isLoading: isCreatingProfile }] = useCreateProfileMutation();
  const [createWorkerProfile, { isLoading: isCreatingWorkerProfile }] =
    useCreateWorkerProfileMutation();
  const [fetchMe] = useLazyGetMeQuery();

  const isLoading =
    isRegistering || isLoggingIn || isCreatingProfile || isCreatingWorkerProfile;

  const profileFields = getFieldsByRole(form.role);

  const handleRoleChange = (event) => {
    const role = event.target.value;
    setForm(buildInitialForm(role));
    setError("");
  };

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email || !form.password || !form.confirmPassword) {
      setError("Debes completar correo y contraseña.");
      return;
    }

    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!form.name?.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    try {
      const user = await register({
        email: form.email,
        password: form.password,
        role: form.role,
      }).unwrap();

      await login({ email: form.email, password: form.password }).unwrap();

      await createProfile({
        userId: user.id,
        full_name: form.name.trim(),
        phone: form.phone?.trim() || undefined,
        address: form.address?.trim() || undefined,
      }).unwrap();

      if (form.role === ROLES.WORKER) {
        const workerData = {};
        for (const [formKey, apiKey] of Object.entries(WORKER_FIELD_MAP)) {
          const value = form[formKey]?.trim();
          if (value) workerData[apiKey] = value;
        }

        if (Object.keys(workerData).length > 0) {
          await createWorkerProfile({ userId: user.id, ...workerData }).unwrap();
        }
      }

      const me = await fetchMe().unwrap();
      dispatch(setCredentials({ user: me }));

      const dashboardPath = DASHBOARD_BY_ROLE[me.role] ?? "/";
      navigate(dashboardPath);
    } catch (err) {
      setError(getErrorMessage(err, "Ocurrió un error al registrarse."));
    }
  };

  return (
    <Box
      component="section"
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 3, md: 6 },
      }}
    >
      <Container maxWidth={false} disableGutters>
        <Paper
          elevation={8}
          sx={{
            overflow: "hidden",
            borderRadius: 4,
            bgcolor: "#ffffff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              minHeight: { xs: "auto", lg: 640 },
            }}
          >
            <Box
              sx={{
                width: { xs: "100%", lg: "55%" },
                display: "flex",
                alignItems: "flex-start",
                maxHeight: { lg: "90vh" },
                overflowY: { lg: "auto" },
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  px: { xs: 3, sm: 5, md: 6 },
                  py: { xs: 5, md: 7 },
                }}
              >
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Box
                    component="img"
                    src={logo}
                    alt="logo"
                    sx={{
                      width: { xs: 128, sm: 160, md: 190 },
                      mx: "auto",
                      display: "block",
                      mb: 2,
                    }}
                  />

                  <Typography
                    variant="h5"
                    component="h1"
                    sx={{ fontWeight: 700, color: "#041021" }}
                  >
                    Crear cuenta
                  </Typography>
                </Box>

                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{ width: "100%", maxWidth: 480, mx: "auto" }}
                >
                  <Typography variant="body1" sx={{ mb: 3, color: "#344054" }}>
                    Completa tus datos para registrarte en la plataforma.
                  </Typography>

                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <FormControl fullWidth margin="normal">
                    <InputLabel id="role-label">Tipo de cuenta</InputLabel>
                    <Select
                      labelId="role-label"
                      id="role"
                      value={form.role}
                      label="Tipo de cuenta"
                      onChange={handleRoleChange}
                    >
                      <MenuItem value={ROLES.USER}>Usuario</MenuItem>
                      <MenuItem value={ROLES.WORKER}>Trabajador</MenuItem>
                    </Select>
                  </FormControl>

                  {AUTH_FIELDS.map(({ key, label, type, autoComplete, helperText }) => (
                    <TextField
                      key={key}
                      fullWidth
                      id={key}
                      label={label}
                      type={type}
                      value={form[key]}
                      onChange={handleChange(key)}
                      margin="normal"
                      autoComplete={autoComplete}
                      helperText={helperText}
                    />
                  ))}

                  <Typography
                    variant="subtitle2"
                    sx={{ mt: 2, mb: 1, color: "#041021", fontWeight: 600 }}
                  >
                    Información personal
                  </Typography>

                  {profileFields.map(
                    ({ key, label, multiline, rows, type = "text", InputLabelProps }) => (
                      <TextField
                        key={key}
                        fullWidth
                        id={key}
                        label={label}
                        type={type}
                        value={form[key] ?? ""}
                        onChange={handleChange(key)}
                        margin="normal"
                        multiline={multiline}
                        rows={rows}
                        InputLabelProps={InputLabelProps}
                        required={key === "name"}
                      />
                    ),
                  )}

                  <TextField
                    fullWidth
                    id={PHONE_FIELD.key}
                    label={PHONE_FIELD.label}
                    type={PHONE_FIELD.type}
                    value={form.phone}
                    onChange={handleChange(PHONE_FIELD.key)}
                    margin="normal"
                    autoComplete={PHONE_FIELD.autoComplete}
                  />

                  <Box sx={{ mt: 3, mb: 4, textAlign: "center" }}>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      disabled={isLoading}
                      sx={{
                        py: 1.4,
                        borderRadius: 2,
                        fontWeight: 700,
                        textTransform: "none",
                        bgcolor: "#12679b",
                        "&:hover": { bgcolor: "#0f587f" },
                      }}
                    >
                      {isLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Registrarse"
                      )}
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#344054" }}>
                      ¿Ya tienes cuenta?
                    </Typography>
                    <Link
                      component={RouterLink}
                      to="/login"
                      underline="hover"
                      sx={{ fontSize: 14, color: "#12679b", fontWeight: 600 }}
                    >
                      Inicia sesión
                    </Link>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                width: { xs: "100%", lg: "45%" },
                display: "flex",
                alignItems: "center",
                bgcolor: "#e7eef1",
                background: "linear-gradient(135deg, #e7eef1 0%, #d8ecf5 100%)",
              }}
            >
              <Box sx={{ px: { xs: 3, sm: 5, md: 6 }, py: { xs: 5, md: 7 }, color: "#041021" }}>
                <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 700 }}>
                  SuperDittoApp
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: "#26364a" }}>
                  Únete a SuperDittoApp para acceder a oportunidades de empleo informal,
                  capacitación y cursos de educación financiera. Crea tu perfil y comienza
                  a generar ingresos.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
