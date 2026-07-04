/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';

const HomePage = lazy(() => import('./HomePage.jsx'));

const homepageLazy = {
  routes: [
    {
      path: '/',
      element: <HomePage />,
    },

    {path: '/404', element: <div>Página no encontrada</div>},
  ],
};

export default homepageLazy;
