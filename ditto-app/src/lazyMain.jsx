import homepageLazy from './pages/homepage/lazy.jsx';
import visorDeCursoLazy from './pages/visor-de-curso/lazy.jsx';

const lazyMain = {
  settings: {
    layout: {
      config: {},
    },
  },
  routes: [
    ...homepageLazy.routes,
    ...visorDeCursoLazy.routes,
  ],
};

export default lazyMain;
