/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';

const HomePage = lazy(() => import('./HomePage.jsx'));

const homepageLazy = {
  routes: [
    {
      path: '/',
      element: <HomePage />,
    },
  ],
};

export default homepageLazy;
