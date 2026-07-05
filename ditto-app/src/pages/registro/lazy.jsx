/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';

const Registro = lazy(() => import('./registro.jsx'));

const registrarte = {
  routes: [
    {
      path: '/registrate',
      element: <Registro />,
    },

    {
        path: '/registrate', 
    },
  ],
};

export default registrarte;
