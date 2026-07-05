import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
  ThemeProvider,
  createTheme,
} from "@mui/material";

const BASE_COLORS = {
  primary: "#BB6AF0",
  paper: "#FCFCF5",
  gray: "#F4E8FD",
};

const theme = createTheme({
  palette: {
    primary: {
      main: BASE_COLORS.primary,
      light: "#DDB4F8",
      dark: "#8443B8",
    },
    background: {
      default: BASE_COLORS.paper,
      paper: "#FBF7FE",
    },
    text: {
      primary: "#2B1835",
      secondary: "#6F5E78",
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: `"Inter", "Roboto", "Arial", sans-serif`,
  },
});

function InscriptionForm() {
  const [formData, setFormData] = useState({
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    telefono: "",
    correo: "",
    dui: "",
    direccion: "",
    funcion: "",
    escolaridad: "",
    password: "",
  });

  const [files, setFiles] = useState({
    documentos: null,
    duiFrente: null,
    duiReverso: null,
  });

  const isProvider = formData.funcion === "proporcionar_servicios";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const { name, files: selectedFiles } = event.target;

    setFiles((prevState) => ({
      ...prevState,
      [name]: selectedFiles[0] || null,
    }));
  };

  const handleReset = () => {
    setFormData({
      primerNombre: "",
      segundoNombre: "",
      primerApellido: "",
      segundoApellido: "",
      telefono: "",
      correo: "",
      dui: "",
      direccion: "",
      funcion: "",
      escolaridad: "",
      password: "",
    });

    setFiles({
      documentos: null,
      duiFrente: null,
      duiReverso: null,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      archivos: files,
    };

    console.log("Formulario enviado:", payload);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: BASE_COLORS.paper,
          py: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="md">
          <Card
            elevation={0}
            sx={{
              border: "1px solid #E7D5F5",
              backgroundColor: "background.paper",
              boxShadow: "0 18px 50px rgba(187, 106, 240, 0.12)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Stack spacing={1} sx={{ mb: 4 }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: "primary.main",
                    fontWeight: 800,
                    letterSpacing: 1.2,
                  }}
                >
                  DittoApp / Jobcrafter / Micraft
                </Typography>

                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 900,
                    color: "text.primary",
                  }}
                >
                  Formulario de inscripción
                </Typography>

                <Typography variant="body1" color="text.secondary">
                  Completa tus datos para registrarte en la plataforma.
                </Typography>
              </Stack>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Primer nombre"
                      name="primerNombre"
                      value={formData.primerNombre}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Segundo nombre"
                      name="segundoNombre"
                      value={formData.segundoNombre}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Primer apellido"
                      name="primerApellido"
                      value={formData.primerApellido}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Segundo apellido"
                      name="segundoApellido"
                      value={formData.segundoApellido}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Número de teléfono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Ej. 7777-7777"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      type="email"
                      label="Correo electrónico"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Número de DUI"
                      name="dui"
                      value={formData.dui}
                      onChange={handleChange}
                      placeholder="00000000-0"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      type="password"
                      label="Contraseña"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      multiline
                      minRows={3}
                      label="Dirección"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2, borderColor: "#E7D5F5" }} />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl required>
                      <FormLabel
                        sx={{
                          color: "text.primary",
                          fontWeight: 800,
                          mb: 1,
                          "&.Mui-focused": {
                            color: "primary.main",
                          },
                        }}
                      >
                        Función
                      </FormLabel>

                      <RadioGroup
                        name="funcion"
                        value={formData.funcion}
                        onChange={handleChange}
                      >
                        <FormControlLabel
                          value="contratar_servicios"
                          control={<Radio />}
                          label="¿Desea contratar servicios?"
                        />

                        <FormControlLabel
                          value="proporcionar_servicios"
                          control={<Radio />}
                          label="¿Desea proporcionar servicios?"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>

                  {isProvider && (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          mt: 2,
                          p: { xs: 2, md: 3 },
                          borderRadius: 4,
                          backgroundColor: BASE_COLORS.gray,
                          border: "1px solid #E7D5F5",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 900,
                            color: "primary.dark",
                            mb: 2,
                          }}
                        >
                          Datos para proveedor de servicios
                        </Typography>

                        <Grid container spacing={2.5}>
                          <Grid item xs={12}>
                            <FormControl fullWidth required>
                              <InputLabel>Nivel de escolaridad</InputLabel>

                              <Select
                                label="Nivel de escolaridad"
                                name="escolaridad"
                                value={formData.escolaridad}
                                onChange={handleChange}
                              >
                                <MenuItem value="basica">
                                  Educación básica
                                </MenuItem>
                                <MenuItem value="bachillerato">
                                  Bachillerato
                                </MenuItem>
                                <MenuItem value="tecnico">Técnico</MenuItem>
                                <MenuItem value="universitario">
                                  Universitario
                                </MenuItem>
                                <MenuItem value="postgrado">
                                  Postgrado
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <Stack spacing={1}>
                              <Button
                                fullWidth
                                component="label"
                                variant="outlined"
                                sx={{
                                  minHeight: 56,
                                  borderColor: "primary.main",
                                  color: "primary.dark",
                                  fontWeight: 800,
                                  backgroundColor: BASE_COLORS.paper,
                                }}
                              >
                                Cargar documentos
                                <input
                                  hidden
                                  type="file"
                                  name="documentos"
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  onChange={handleFileChange}
                                />
                              </Button>

                              {files.documentos && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {files.documentos.name}
                                </Typography>
                              )}
                            </Stack>
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <Stack spacing={1}>
                              <Button
                                fullWidth
                                component="label"
                                variant="outlined"
                                sx={{
                                  minHeight: 56,
                                  borderColor: "primary.main",
                                  color: "primary.dark",
                                  fontWeight: 800,
                                  backgroundColor: BASE_COLORS.paper,
                                }}
                              >
                                DUI frente
                                <input
                                  hidden
                                  type="file"
                                  name="duiFrente"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                />
                              </Button>

                              {files.duiFrente && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {files.duiFrente.name}
                                </Typography>
                              )}
                            </Stack>
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <Stack spacing={1}>
                              <Button
                                fullWidth
                                component="label"
                                variant="outlined"
                                sx={{
                                  minHeight: 56,
                                  borderColor: "primary.main",
                                  color: "primary.dark",
                                  fontWeight: 800,
                                  backgroundColor: BASE_COLORS.paper,
                                }}
                              >
                                DUI reverso
                                <input
                                  hidden
                                  type="file"
                                  name="duiReverso"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                />
                              </Button>

                              {files.duiReverso && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {files.duiReverso.name}
                                </Typography>
                              )}
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      justifyContent="flex-end"
                      sx={{ mt: 3 }}
                    >
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={handleReset}
                        sx={{
                          px: 4,
                          fontWeight: 800,
                          borderColor: "#D6B7EE",
                          color: "text.secondary",
                        }}
                      >
                        Limpiar
                      </Button>

                      <Button
                        type="submit"
                        variant="contained"
                        sx={{
                          px: 4,
                          fontWeight: 900,
                          color: BASE_COLORS.paper,
                          boxShadow: "0 10px 24px rgba(187, 106, 240, 0.35)",
                          "&:hover": {
                            boxShadow:
                              "0 12px 30px rgba(187, 106, 240, 0.45)",
                          },
                        }}
                      >
                        Enviar inscripción
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default InscriptionForm;