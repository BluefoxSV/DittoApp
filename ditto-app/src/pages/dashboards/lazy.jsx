/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';

const dashusu = lazy(() => import('./dashusu.jsx'));
const dashtrabaja = lazy(() => import('./dashtrabaja.jsx'));

const userDashboardLazy = {
  routes: [
    {
      path: '/user-dashboard',
      element: <userDashboard />,
    },
    {
      path: '/worker-dashboard',
      element: <workerDashboard />,
    },  

  ],
};

export default userDashboardLazy;
