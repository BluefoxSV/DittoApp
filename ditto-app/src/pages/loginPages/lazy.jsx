/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';

const LoginPage = lazy(() => import('./loginPages'));

const LoginPageLazy = {
  routes: [
    {
      path: '/Login',
      element: <LoginPage />,
    },

    {path: '/Login', element: ""},
  ],
};

export default LoginPageLazy;