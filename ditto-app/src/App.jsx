import { Suspense } from 'react';
import { BrowserRouter, Link as RouterLink, Route, Routes } from 'react-router-dom';
import { AppBar, Box, Button, CircularProgress, Toolbar, Typography } from '@mui/material';
import lazyMain from './lazyMain';

function LoadingFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );
}

function AppRoutes() {
  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#BB6AF0" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Ditto App
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">
            Inicio
          </Button>
          <Button color="inherit" component={RouterLink} to="/curso">
            Curso
          </Button>
        </Toolbar>
      </AppBar>

      <Box>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {lazyMain.routes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Routes>
        </Suspense>
      </Box>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
