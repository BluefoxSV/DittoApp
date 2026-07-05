import { Suspense, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import lazyMain from './lazyMain';

import GuardedRoute from './components/auth/GuardedRoute';
import Navbar from './components/layout/navBar';
import Footer from './components/layout/footer';
import SidebarNav from './components/layout/sidebarNav';
import VoiceAssistant from './components/voice/voiceAssistant';

// Rutas donde el sidebar NO se muestra (navbar y footer siguen visibles siempre).
const RUTAS_SIN_SIDEBAR = ['/', '/login', '/register', '/registro'];

function LoadingFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );
}

function AppRoutes() {
  const { pathname } = useLocation();
  const role = useSelector((state) => state.auth.user?.role);
  const conSidebar = !RUTAS_SIN_SIDEBAR.includes(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);

  const contenido = (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {lazyMain.routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<GuardedRoute path={route.path} element={route.element} />}
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );

  return (
    <Box sx={{ '--ditto-navbar-height': { xs: '56px', sm: '64px' } }}>
      {/* la hamburguesa del navbar abre el sidebar movil solo cuando hay sidebar */}
      <Navbar onMenuClick={conSidebar ? () => setMobileOpen(true) : undefined} />

      {conSidebar ? (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <SidebarNav
            role={role === 'worker' || role === 'support' ? role : 'user'}
            mobileOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
          />
          <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
            {contenido}
          </Box>
        </Box>
      ) : (
        contenido
      )}

      <Footer />
      <VoiceAssistant />
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