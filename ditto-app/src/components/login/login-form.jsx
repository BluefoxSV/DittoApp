import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Link,
  Paper,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

import logo from "../../../src/assets/icon-192.png";
import { useLoginMutation } from "../../store/api/authApi";
import { useLazyGetMeQuery } from "../../store/api/usersApi";
import { setCredentials } from "../../store/slices/authSlice";
import { getDashboardPath } from "../../utils/authRoutes";

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

  return (

    <Box
      component="section"
      sx={{
        minHeight: "100vh",
        width: "100%",
        // bgcolor: "#f4f7fb",
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
              minHeight: { xs: "auto", lg: 560 },
            }}
          >
            <Box
              sx={{
                width: { xs: "100%", lg: "50%" },
                display: "flex",
                alignItems: "center",
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
                    sx={{
                      fontWeight: 700,
                      color: "#041021",
                    }}
                  >
                    Bienvenido
                  </Typography>
                </Box>

                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{
                    width: "100%",
                    maxWidth: 420,
                    mx: "auto",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 3,
                      color: "#344054",
                    }}
                  >
                    Por favor, inicia sesión con tu correo y contraseña.
                  </Typography>

                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
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
                  />

                  <TextField
                    fullWidth
                    id="password"
                    label="Contraseña"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    autoComplete="current-password"
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
                        "&:hover": {
                          bgcolor: "#0f587f",
                        },
                      }}
                    >
                      {isLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Iniciar sesión"
                      )}
                    </Button>

                    <Link
                      href="#"
                      underline="hover"
                      sx={{
                        display: "inline-block",
                        mt: 2,
                        fontSize: 14,
                        color: "#12679b",
                      }}
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#344054" }}>
                      ¿No posees cuenta activa?
                    </Typography>

                    <Button
                      component={RouterLink}
                      to="/register"
                      type="button"
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        textTransform: "none",
                        fontWeight: 600,
                        color: "#12679b",
                        borderColor: "#12679b",
                        "&:hover": {
                          borderColor: "#0f587f",
                          bgcolor: "#e7f2f8",
                        },
                      }}
                    >
                      Regístrate
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                width: { xs: "100%", lg: "50%" },
                display: "flex",
                alignItems: "center",
                bgcolor: "#e7eef1",
                background: "linear-gradient(135deg, #e7eef1 0%, #d8ecf5 100%)",
              }}
            >
              <Box
                sx={{
                  px: { xs: 3, sm: 5, md: 6 },
                  py: { xs: 5, md: 7 },
                  color: "#041021",
                }}
              >
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                  }}
                >
                  SuperDittoApp
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.8,
                    color: "#26364a",
                  }}
                >
                  SuperDittoApp / Jobcrafter / Micraft es una plataforma para
                  impulsar el empleo informal y a su vez capacitar a las
                  personas en nuevos ámbitos de trabajo. La plataforma de
                  aprendizaje también cuenta con cursos para facilitar la
                  educación financiera para personas sin experiencia que quieran
                  empezar a generar ingresos.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
