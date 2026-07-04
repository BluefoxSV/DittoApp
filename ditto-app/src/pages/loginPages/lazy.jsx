/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';

const LoginPage = lazy(() => import('./loginPages'));

const LoginPageLazy = {
  routes: [
    {
      path: '/login',
      element: <LoginPage />,
    },
  ],
};

export default LoginPageLazy;