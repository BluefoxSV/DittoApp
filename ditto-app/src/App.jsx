import { Suspense } from 'react';
import { BrowserRouter, Link as RouterLink, Route, Routes } from 'react-router-dom';
import { AppBar, Box, Button, CircularProgress, Toolbar, Typography } from '@mui/material';
import lazyMain from './lazyMain';

import Navbar from './components/layout/navBar';


function LoadingFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );
}

function AppRoutes() {
  return (
    <Box sx={{ '--ditto-navbar-height': { xs: '56px', sm: '64px' } }}>
      <AppBar position="static" sx={{ backgroundColor: "#BB6AF0" }}>
        <Navbar />

       
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
