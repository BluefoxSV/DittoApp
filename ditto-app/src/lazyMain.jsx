import homepageLazy from './pages/homepage/lazy.jsx';
import visorDeCursoLazy from './pages/visor-de-curso/lazy.jsx';
import LoginPages from './pages/loginPages/loginPages.jsx';
import LoginPageLazy from './pages/loginPages/lazy.jsx';

import profileLazy from './pages/profile/lazy.jsx';

const lazyMain = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    ...homepageLazy.routes,
    ...visorDeCursoLazy.routes,
    ...LoginPageLazy.routes,
    ...profileLazy.routes,
  ],
};

export default lazyMain;
