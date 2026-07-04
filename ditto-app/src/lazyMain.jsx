import homepageLazy from './pages/homepage/lazy.jsx';
import visorDeCursoLazy from './pages/visor-de-curso/lazy.jsx';
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
    ...profileLazy.routes,
  ],
};

export default lazyMain;
