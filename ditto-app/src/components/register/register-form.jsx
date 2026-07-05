import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import HandymanRoundedIcon from "@mui/icons-material/HandymanRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";

import logo from "../../assets/Gemini_Generated_Image_joxhupjoxhupjoxh.png";
import {
  getProfessionLabel,
  isValidProfession,
  WORK_PROFESSIONS,
} from "../../constants/workProfessions";
import {
  getFieldsByRole,
  buildFullName,
  ROLES,
} from "../../pages/profile/Profile.jsx";
import { useLoginMutation, useRegisterMutation } from "../../store/api/authApi";
import {
  useLazyGetMeQuery,
  useCreateProfileMutation,
} from "../../store/api/usersApi";
import { useCreateWorkerProfileMutation } from "../../store/api/workersApi";
import { setCredentials } from "../../store/slices/authSlice";

const BRAND = {
  primary: "#6d28d9",
  primaryDark: "#3b1a78",
  accent: "#f59e0b",
  accentHover: "#fbbf24",
};

const DASHBOARD_BY_ROLE = {
  worker: "/dashtrabaja",
  user: "/dashusu",
  support: "/dashusu",
};

const highlights = [
  {
    icon: AssignmentIndRoundedIcon,
    title: "Crea tu perfil",
    description: "Regístrate como usuario o trabajador según tus necesidades.",
  },
  {
    icon: HandymanRoundedIcon,
    title: "Encuentra oportunidades",
    description: "Conecta con servicios, trabajos y personas que necesitan apoyo.",
  },
  {
    icon: VerifiedRoundedIcon,
    title: "Impulsa tus ingresos",
    description: "Aprende, trabaja y fortalece tu crecimiento económico.",
  },
];

const AUTH_FIELDS = [
  {
    key: "email",
    label: "Correo",
    type: "email",
    autoComplete: "email",
    icon: EmailRoundedIcon,
  },
  {
    key: "password",
    label: "Contraseña",
    type: "password",
    autoComplete: "new-password",
    helperText: "Mínimo 8 caracteres",
    icon: LockRoundedIcon,
  },
  {
    key: "confirmPassword",
    label: "Confirmar contraseña",
    type: "password",
    autoComplete: "new-password",
    icon: LockRoundedIcon,
  },
];

const PHONE_FIELD = {
  key: "phone",
  label: "Teléfono",
  type: "tel",
  autoComplete: "tel",
  icon: PhoneRoundedIcon,
};

const PROFESSION_FIELD_KEY = "specializationArea";

const NAME_FIELD_KEYS = new Set(["firstName", "lastName"]);

const BASE_PROFILE_KEYS = new Set([
  "firstName",
  "lastName",
  "birthDate",
  "address",
  "state",
  "country",
]);

const WORKER_EXTRA_KEYS = new Set([
  "experience",
]);

const OTHER_WORKER_FIELD_MAP = {
  experience: "experience",

};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REQUIRED_FIELDS = [
  "email",
  "password",
  "confirmPassword",
  "firstName",
  "lastName",
];

function validateRegisterForm(form) {
  const errors = {};
  const email = form.email.trim();

  if (!email) {
    errors.email = "El correo es obligatorio.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Ingresa un correo válido.";
  }

  if (!form.password) {
    errors.password = "La contraseña es obligatoria.";
  } else if (form.password.length < 8) {
    errors.password = "La contraseña debe tener al menos 8 caracteres.";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Confirma tu contraseña.";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  if (!form.firstName?.trim()) {
    errors.firstName = "Ingresa al menos un nombre.";
  }

  if (!form.lastName?.trim()) {
    errors.lastName = "Ingresa al menos un apellido.";
  }

  if (form.role === ROLES.WORKER && !isValidProfession(form.specializationArea)) {
    errors.specializationArea = "Selecciona una profesión de la lista.";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

function getErrorMessage(error, fallback) {
  if (!error) return fallback;

  const detail = error.data?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(", ");
  }

  return fallback;
}

function buildEmptyForm(role = ROLES.USER) {
  const userFields = getFieldsByRole(ROLES.USER);
  const workerFields = getFieldsByRole(ROLES.WORKER);

  const allKeys = new Set([
    ...userFields.map(({ key }) => key),
    ...workerFields.map(({ key }) => key),
  ]);

  const profileState = Object.fromEntries([...allKeys].map((key) => [key, ""]));

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
  const [form, setForm] = useState(() => buildEmptyForm(ROLES.USER));
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [createProfile, { isLoading: isCreatingProfile }] =
    useCreateProfileMutation();
  const [createWorkerProfile, { isLoading: isCreatingWorkerProfile }] =
    useCreateWorkerProfileMutation();
  const [fetchMe] = useLazyGetMeQuery();

  const isLoading =
    isRegistering || isLoggingIn || isCreatingProfile || isCreatingWorkerProfile;

  const { errors, isValid } = useMemo(() => validateRegisterForm(form), [form]);

  const allProfileFields = getFieldsByRole(form.role);
  const baseProfileFields = allProfileFields.filter(({ key }) =>
    BASE_PROFILE_KEYS.has(key),
  );

  const nameFields = baseProfileFields.filter(({ key }) =>
    NAME_FIELD_KEYS.has(key),
  );

  const otherBaseProfileFields = baseProfileFields.filter(
    ({ key }) => !NAME_FIELD_KEYS.has(key),
  );

  const workerExtraFields = allProfileFields.filter(({ key }) =>
    WORKER_EXTRA_KEYS.has(key),
  );

  const isWorker = form.role === ROLES.WORKER;

  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2.5,
      "&.Mui-focused fieldset": {
        borderColor: BRAND.primary,
      },
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: BRAND.primary,
    },
  };

  const selectSx = {
    borderRadius: 2.5,
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: BRAND.primary,
    },
  };

  const shouldShowError = (field) =>
    Boolean((touched[field] || submitAttempted) && errors[field]);

  const markTouched = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleRoleChange = (event) => {
    const role = event.target.value;

    setForm((prev) => ({
      ...prev,
      role,
      specializationArea: role === ROLES.WORKER ? prev.specializationArea : "",
    }));

    setError("");
  };

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const getFieldIcon = (key) => {
    const icons = {
      firstName: PersonRoundedIcon,
      lastName: BadgeRoundedIcon,
      birthDate: CalendarMonthRoundedIcon,
      address: HomeRoundedIcon,

    };

    return icons[key] || PersonRoundedIcon;
  };

  const renderProfileField = ({
    key,
    label,
    multiline,
    rows,
    type = "text",
    InputLabelProps,
    autoComplete,
  }) => {
    const isRequired = NAME_FIELD_KEYS.has(key);
    const fieldError = shouldShowError(key);
    const Icon = getFieldIcon(key);

    return (
      <TextField
        key={key}
        fullWidth
        id={key}
        label={label}
        type={type}
        value={form[key] ?? ""}
        onChange={handleChange(key)}
        onBlur={isRequired ? () => markTouched(key) : undefined}
        margin="normal"
        multiline={multiline}
        rows={rows}
        InputLabelProps={InputLabelProps}
        autoComplete={autoComplete}
        required={isRequired}
        error={fieldError}
        helperText={fieldError ? errors[key] : undefined}
        sx={textFieldSx}
        InputProps={{
          startAdornment: !multiline ? (
            <InputAdornment position="start">
              <Icon sx={{ color: "#9b8fb0" }} />
            </InputAdornment>
          ) : undefined,
        }}
      />
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitAttempted(true);

    const touchedFields = [...REQUIRED_FIELDS];

    if (isWorker) {
      touchedFields.push(PROFESSION_FIELD_KEY);
    }

    setTouched((prev) => ({
      ...prev,
      ...Object.fromEntries(touchedFields.map((field) => [field, true])),
    }));

    if (!isValid) return;

    try {
      const user = await register({
        email: form.email,
        password: form.password,
        role: form.role,
      }).unwrap();

      await login({
        email: form.email,
        password: form.password,
      }).unwrap();

      const name = buildFullName(form.firstName, form.lastName);

      await createProfile({
        userId: user.id,
        full_name: name,
        phone: form.phone?.trim() || undefined,
        address: form.address?.trim() || undefined,
      }).unwrap();

      if (form.role === ROLES.WORKER) {
        const workerData = {
          bio: getProfessionLabel(form.specializationArea),
        };

        for (const [formKey, apiKey] of Object.entries(OTHER_WORKER_FIELD_MAP)) {
          const value = form[formKey]?.trim();

          if (value) {
            workerData[apiKey] = value;
          }
        }

        await createWorkerProfile({
          userId: user.id,
          ...workerData,
        }).unwrap();
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
        height: {
          xs: "auto",
          lg: "calc(100dvh - var(--ditto-navbar-height, 64px))",
        },
        minHeight: {
          xs: "calc(100dvh - var(--ditto-navbar-height, 64px))",
          lg: "auto",
        },
        width: "100%",
        display: "flex",
        flexDirection: {
          xs: "column",
          lg: "row",
        },
        overflow: {
          xs: "visible",
          lg: "hidden",
        },
        bgcolor: "#ffffff",
      }}
    >
      <Box
        sx={{
          width: {
            xs: "100%",
            lg: "56%",
          },
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          overflowY: {
            lg: "auto",
          },
          py: {
            xs: 6,
            lg: 4,
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 560,
            px: {
              xs: 3,
              sm: 4,
            },
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              component="img"
              src={logo}
              alt="Ditto App"
              sx={{
                width: {
                  xs: 88,
                  sm: 96,
                },
                mx: "auto",
                display: "block",
                mb: 2.5,
                borderRadius: 3,
              }}
            />

            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "#171226",
              }}
            >
              Crear cuenta
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <Typography
              variant="body1"
              sx={{
                mb: 3,
                textAlign: "center",
                color: "#5f5768",
              }}
            >
              Completa tus datos para registrarte y comenzar a usar la
              plataforma.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel
                id="role-label"
                sx={{
                  "&.Mui-focused": {
                    color: BRAND.primary,
                  },
                }}
              >
                Tipo de cuenta
              </InputLabel>

              <Select
                labelId="role-label"
                id="role"
                value={form.role}
                label="Tipo de cuenta"
                onChange={handleRoleChange}
                sx={selectSx}
                startAdornment={
                  <InputAdornment position="start">
                    <AssignmentIndRoundedIcon sx={{ color: "#9b8fb0" }} />
                  </InputAdornment>
                }
              >
                <MenuItem value={ROLES.USER}>Usuario</MenuItem>
                <MenuItem value={ROLES.WORKER}>Trabajador</MenuItem>
              </Select>
            </FormControl>

            {AUTH_FIELDS.map(
              ({ key, label, type, autoComplete, helperText, icon: Icon }) => {
                const fieldError = shouldShowError(key);

                return (
                  <TextField
                    key={key}
                    fullWidth
                    id={key}
                    label={label}
                    type={type}
                    value={form[key]}
                    onChange={handleChange(key)}
                    onBlur={() => markTouched(key)}
                    margin="normal"
                    autoComplete={autoComplete}
                    required
                    error={fieldError}
                    helperText={fieldError ? errors[key] : helperText}
                    sx={textFieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon sx={{ color: "#9b8fb0" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                );
              },
            )}

            <Typography
              variant="subtitle2"
              sx={{
                mt: 3,
                mb: 1,
                color: "#171226",
                fontWeight: 800,
                letterSpacing: "-0.01em",
              }}
            >
              Información personal
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                gap: {
                  xs: 0,
                  sm: 2,
                },
              }}
            >
              {nameFields.map(renderProfileField)}
            </Box>

            {otherBaseProfileFields.map(renderProfileField)}

            {isWorker && (
              <FormControl
                fullWidth
                margin="normal"
                required
                error={shouldShowError(PROFESSION_FIELD_KEY)}
              >
                <InputLabel
                  id="profession-label"
                  sx={{
                    "&.Mui-focused": {
                      color: BRAND.primary,
                    },
                  }}
                >
                  Profesión
                </InputLabel>

                <Select
                  labelId="profession-label"
                  id={PROFESSION_FIELD_KEY}
                  value={form.specializationArea}
                  label="Profesión"
                  onChange={(event) => {
                    handleChange(PROFESSION_FIELD_KEY)(event);
                    markTouched(PROFESSION_FIELD_KEY);
                  }}
                  onBlur={() => markTouched(PROFESSION_FIELD_KEY)}
                  sx={selectSx}
                  startAdornment={
                    <InputAdornment position="start">
                      <WorkRoundedIcon sx={{ color: "#9b8fb0" }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="" disabled>
                    Selecciona una profesión
                  </MenuItem>

                  {WORK_PROFESSIONS.map(({ value, label }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>

                {shouldShowError(PROFESSION_FIELD_KEY) && (
                  <FormHelperText>{errors.specializationArea}</FormHelperText>
                )}
              </FormControl>
            )}

            {workerExtraFields.map(renderProfileField)}

            <TextField
              fullWidth
              id={PHONE_FIELD.key}
              label={PHONE_FIELD.label}
              type={PHONE_FIELD.type}
              value={form.phone}
              onChange={handleChange(PHONE_FIELD.key)}
              margin="normal"
              autoComplete={PHONE_FIELD.autoComplete}
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneRoundedIcon sx={{ color: "#9b8fb0" }} />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 3,
                py: 1.5,
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "none",
                color: "#211605",
                bgcolor: BRAND.accent,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: BRAND.accentHover,
                  boxShadow: "none",
                },
                "&.Mui-disabled": {
                  bgcolor: "#e6d9a8",
                  color: "#6b5c2b",
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: "#211605" }} />
              ) : (
                "Registrarse"
              )}
            </Button>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={1}
              sx={{ mt: 3.5 }}
            >
              <Typography variant="body2" sx={{ color: "#5f5768" }}>
                ¿Ya tienes cuenta?
              </Typography>

              <Link
                component={RouterLink}
                to="/login"
                underline="hover"
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: BRAND.primary,
                }}
              >
                Inicia sesión
              </Link>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          width: {
            xs: "100%",
            lg: "44%",
          },
          display: {
            xs: "none",
            lg: "flex",
          },
          alignItems: "center",
          bgcolor: BRAND.primaryDark,
          color: "#fff",
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 460,
            mx: "auto",
            px: {
              md: 6,
            },
            py: 4,
          }}
        >
          <Box
            component="img"
            src={logo}
            alt=""
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              mb: 3,
            }}
          />

          <Typography
            component="h2"
            sx={{
              fontSize: {
                md: "2.1rem",
              },
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              mb: 2,
            }}
          >
            Empieza a construir nuevas oportunidades
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.82)",
              lineHeight: 1.7,
              mb: 4,
            }}
          >
            Crea tu cuenta en Ditto App para acceder a servicios, oportunidades
            de trabajo independiente, cursos prácticos y herramientas para
            mejorar tus ingresos.
          </Typography>

          <Stack spacing={2.5}>
            {highlights.map(({ icon: Icon, title, description }) => (
              <Stack
                key={title}
                direction="row"
                spacing={2}
                alignItems="flex-start"
              >
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                >
                  <Icon fontSize="small" sx={{ color: BRAND.accent }} />
                </Box>

                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{title}</Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255,255,255,0.72)",
                      mt: 0.25,
                    }}
                  >
                    {description}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}