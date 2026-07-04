/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';

const VisorDeCurso = lazy(() => import('./VisorDeCurso.jsx'));

const visorDeCursoLazy = {
  routes: [
    {
      path: '/curso',
      element: <VisorDeCurso />,
    },
  ],
};

export default visorDeCursoLazy;
