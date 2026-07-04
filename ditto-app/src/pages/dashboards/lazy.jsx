/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';

const Dashusu = lazy(() => import('./dashusu.jsx'));
const Dashtrabaja = lazy(() => import('./dashtrabaja.jsx'));

const dashboardsLazy = {
    routes: [
        {
            path: '/dashusu',
            element: <Dashusu />,
        },
        {
            path: '/dashtrabaja',
            element: <Dashtrabaja />,
        },
    ],  
};
export default dashboardsLazy;