/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const VisorDeCurso = lazy(() => import('./VisorDeCurso.jsx'));

const visorDeCursoLazy = {
  routes: [
    {
      path: '/curso/:courseId/detalles',
      element: <VisorDeCurso />,
    },
    {
      path: '/curso/:courseId',
      element: <VisorDeCurso />,
    },
    {
      path: '/curso',
      element: <Navigate to="/lista-curso" replace />,
    },
  ],
};

export default visorDeCursoLazy;
