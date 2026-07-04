import { lazy } from 'react';


const ListCourses = lazy(() => import('./ListCourses.jsx'));

const lazyCurso = {
  routes: [
    {
      path: '/lista-curso',
      element: <ListCourses />,
    },
  ],
};

export default lazyCurso;