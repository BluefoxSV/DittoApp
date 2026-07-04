/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';

const ProfilePage = lazy(() => import('./Profile.jsx'));
const ProfileExamplesPage = lazy(() => import('./ProfileExamples.jsx'));

const profileLazy = {
  routes: [
    {
      path: '/profile',
      element: <ProfilePage />,
    },
    {
      path: '/profile-examples',
      element: <ProfileExamplesPage />,
    },
  ],
};

export default profileLazy;
