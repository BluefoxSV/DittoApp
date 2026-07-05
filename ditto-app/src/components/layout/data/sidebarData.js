/**
 * Datos del sidebar: items de navegación por rol.
 * Mismo patrón que NavBar.js / footerData.js (datos separados del componente).
 *
 * Cuando llegue la API de cursos, se puede concatenar la sección dinámica:
 *   [...SIDEBAR_ITEMS.worker, ...cursosDesdeApi]
 *
 * IMPORTANTE: ajustar los `to` a las rutas reales del proyecto (revisar lazyMain).
 */
export const SIDEBAR_ITEMS = {
    support: [
      { key: "dashboard", to: "/dashusu", icon: "ti-layout-dashboard", label: "Dashboard" },
      { key: "courses", to: "/lista-curso", icon: "ti-school", label: "Administrar cursos" },
      { key: "profile", to: "/profile", icon: "ti-user", label: "Perfil" },
    ],
    worker: [
      { key: "dashboard", to: "/dashtrabaja", icon: "ti-layout-dashboard", label: "Dashboard" },
      { key: "courses", to: "/lista-curso", icon: "ti-school", label: "Cursos" },
      { key: "chat", to: "/chat", icon: "ti-message-circle", label: "Chat con clientes" },
      { key: "profile", to: "/perfil", icon: "ti-user", label: "Perfil" },
    ],
    user: [
      { key: "chatAI", to: "/dashusu", icon: "ti-sparkles", label: "Inicio · Chat IA" },
      { key: "courses", to: "/lista-curso", icon: "ti-school", label: "Cursos" },
      { key: "chat", to: "/chat", icon: "ti-message-circle", label: "Chat con trabajador" },
      { key: "services", to: "/mis-servicios", icon: "ti-clipboard-list", label: "Mis servicios" },
      { key: "profile", to: "/perfil", icon: "ti-user", label: "Perfil" },
    ],
  };
