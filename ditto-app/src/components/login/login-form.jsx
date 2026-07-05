import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import HandymanRoundedIcon from "@mui/icons-material/HandymanRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";

import logo from "../../assets/Gemini_Generated_Image_joxhupjoxhupjoxh.png";
import { useLoginMutation } from "../../store/api/authApi";
import { useLazyGetMeQuery } from "../../store/api/usersApi";
import { setCredentials } from "../../store/slices/authSlice";
import { getDashboardPath } from "../../utils/authRoutes";

const BRAND = {
  primary: "#6d28d9",
  primaryDark: "#3b1a78",
  accent: "#f59e0b",
  accentHover: "#fbbf24",
};

const highlights = [
  {
    icon: HandymanRoundedIcon,
    title: "Profesionales verificados",
    description: "Conecta con talento independiente de confianza cerca de ti.",
  },
  {
    icon: SchoolRoundedIcon,
    title: "Cursos prácticos",
    description: "Capacítate a tu ritmo y fortalece tus habilidades laborales.",
  },
  {
    icon: VerifiedRoundedIcon,
    title: "Educación financiera",
    description: "Aprende a gestionar tus ingresos desde tu primer trabajo.",
  },
];

function getLoginErrorMessage(error) {
  if (!error) return "Ocurrió un error al iniciar sesión.";

  const detail = error.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(", ");
  }

  return "Ocurrió un error al iniciar sesión.";
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [fetchMe] = useLazyGetMeQuery();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Debes ingresar correo y contraseña.");
      return;
    }

    try {
      await login({ email, password }).unwrap();
      const user = await fetchMe().unwrap();
      dispatch(setCredentials({ user }));

      navigate(getDashboardPath(user.role));
    } catch (err) {
      setError(getLoginErrorMessage(err));
    }
  };

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

  return (
    <Box
      component="section"
      sx={{
        height: { xs: "auto", lg: "calc(100dvh - var(--ditto-navbar-height, 64px))" },
        minHeight: { xs: "calc(100dvh - var(--ditto-navbar-height, 64px))", lg: "auto" },
        width: "100%",
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        overflow: { xs: "visible", lg: "hidden" },
        bgcolor: "#ffffff",
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", lg: "50%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflowY: { lg: "auto" },
          py: { xs: 6, lg: 4 },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 420,
            px: { xs: 3, sm: 4 },
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              component="img"
              src={logo}
              alt="Ditto App"
              sx={{
                width: { xs: 88, sm: 96 },
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
              Bienvenido de nuevo
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
              Inicia sesión con tu correo y contraseña para continuar.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              id="email"
              label="Correo"
              type="email"
              placeholder="usuario@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              autoComplete="email"
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailRoundedIcon sx={{ color: "#9b8fb0" }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              id="password"
              label="Contraseña"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              autoComplete="current-password"
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRoundedIcon sx={{ color: "#9b8fb0" }} />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ textAlign: "right", mt: 0.5 }}>
              <Link
                href="#"
                underline="hover"
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: BRAND.primary,
                }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </Box>

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
                "Iniciar sesión"
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
                ¿No posees cuenta activa?
              </Typography>

              <Link
                component={RouterLink}
                to="/register"
                underline="hover"
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: BRAND.primary,
                }}
              >
                Regístrate
              </Link>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          width: { xs: "100%", lg: "50%" },
          display: { xs: "none", lg: "flex" },
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
            px: { md: 6 },
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
              fontSize: { md: "2.1rem" },
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              mb: 2,
            }}
          >
            El talento que necesitas, justo lo que necesitas
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.82)",
              lineHeight: 1.7,
              mb: 4,
            }}
          >
            Conecta con profesionales independientes, aprende nuevas
            habilidades y da tus primeros pasos hacia mayores ingresos.
          </Typography>

          <Stack spacing={2.5}>
            {highlights.map(({ icon: Icon, title, description }) => (
              <Stack key={title} direction="row" spacing={2} alignItems="flex-start">
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
                    sx={{ color: "rgba(255,255,255,0.72)", mt: 0.25 }}
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
