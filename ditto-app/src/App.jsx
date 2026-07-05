import { Suspense } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AppBar, Box, CircularProgress } from '@mui/material';
import lazyMain from './lazyMain';

import Navbar from './components/layout/navBar';
import Footer from './components/layout/footer';
import SidebarNav from './components/layout/sidebarNav';

// Rutas donde NO se muestran navbar/sidebar/footer (landing, login, register).
// Ajustar a los paths reales del proyecto.
const RUTAS_PUBLICAS = ['/', '/login', '/register', '/registro'];

function LoadingFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );
}

function AppRoutes() {
  const { pathname } = useLocation();
  const esPublica = RUTAS_PUBLICAS.includes(pathname);

  const contenido = (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {lazyMain.routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </Suspense>
  );

  if (esPublica) return contenido;

  return (
    <Box>
      <AppBar position="static" sx={{ backgroundColor: '#BB6AF0' }}>
        <Navbar />
      </AppBar>

      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <SidebarNav role="user" />
        <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
          {contenido}
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}