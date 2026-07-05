import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Box, Drawer, IconButton, Typography, Tooltip } from "@mui/material";
import { SIDEBAR_ITEMS } from "./data/sidebarData";

const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" };
const WIDTH = 224;

function NavContent({ items, onNavigate, onCollapse }) {
  return (
    <Box sx={FONT} className="h-full min-h-screen bg-gray-100 p-6 flex flex-col">
      <Box className="flex items-center justify-between mb-8">
        <Typography sx={FONT} className="text-primary-700 font-bold text-lg">
          Jobcrafter
        </Typography>
        {onCollapse ? (
          <Tooltip title="Ocultar menu">
            <IconButton
              onClick={onCollapse}
              aria-label="Ocultar menu"
              size="small"
              sx={{ color: "#874cad" }}
            >
              <i className="ti ti-chevron-left" style={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        ) : null}
      </Box>
      <Box className="flex flex-col gap-1.5">
        {items.map(({ key, to, icon, label }) => (
          <NavLink
            key={key}
            to={to}
            onClick={onNavigate}
            style={FONT}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-colors ${
                isActive
                  ? "bg-primary-500 text-white shadow-sm"
                  : "text-[#5a5560] hover:bg-primary-100 hover:text-primary-700"
              }`
            }
          >
            <i className={`ti ${icon} text-lg`} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </Box>
    </Box>
  );
}

/**
 * Sidebar de navegacion global.
 * Desktop (md+): fijo a la izquierda, con boton para ocultar/mostrar (colapsar).
 * Movil (<md): Drawer controlado por el navbar.
 *
 * @param {"user"|"worker"} role
 * @param {boolean} mobileOpen  drawer movil (lo controla el navbar)
 * @param {function} onClose    cierra el drawer movil
 */
export default function SidebarNav({ role = "user", mobileOpen = false, onClose }) {
  const items = SIDEBAR_ITEMS[role] || SIDEBAR_ITEMS.user;
  const [collapsed, setCollapsed] = useState(false); // solo desktop

  return (
    <>
      {/* Desktop: fijo, colapsable */}
      {collapsed ? (
        // Colapsado: boton flotante fijo (no ocupa columna, no deja franja)
        <Tooltip title="Mostrar menu">
          <IconButton
            onClick={() => setCollapsed(false)}
            aria-label="Mostrar menu"
            sx={{
              display: { xs: "none", md: "inline-flex" },
              position: "fixed",
              top: 72,
              left: 12,
              zIndex: 1100,
              bgcolor: "rgba(187, 106, 240, 0.35)",
              color: "#fff",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.4)",
              boxShadow: 2,
              "&:hover": { bgcolor: "rgba(187, 106, 240, 0.55)" },
            }}
          >
            <i className="ti ti-chevron-right" style={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      ) : (
        <Box
          component="nav"
          sx={{ width: WIDTH, flexShrink: 0, display: { xs: "none", md: "block" } }}
          className="border-r border-gray-200"
        >
          <NavContent items={items} onCollapse={() => setCollapsed(true)} />
        </Box>
      )}

      {/* Movil: drawer controlado desde el navbar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: WIDTH } }}
      >
        <NavContent items={items} onNavigate={onClose} />
      </Drawer>
    </>
  );
}