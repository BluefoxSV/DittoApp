/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';

const userDashboard = lazy(() => import('./userdash.jsx'));
const workerDashboard = lazy(() => import('./workerdash.jsx'));

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
