/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";

const RegisterPage = lazy(() => import("./registerPages"));

const registerLazy = {
  routes: [
    {
      path: "/register",
      element: <RegisterPage />,
    },
  ],
};

export default registerLazy;
