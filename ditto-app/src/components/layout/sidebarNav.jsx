import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Box, Drawer, IconButton, Typography } from "@mui/material";
import { SIDEBAR_ITEMS } from "./data/sidebarData";

const FONT = { fontFamily: "'Quicksand', system-ui, sans-serif" };
const WIDTH = 224;

function NavContent({ items, onNavigate }) {
  return (
    <Box sx={FONT} className="h-full min-h-screen bg-gray-100 p-6 flex flex-col">
      <Typography sx={FONT} className="text-primary-700 font-bold text-lg mb-8">
        Jobcrafter
      </Typography>
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
                  : "text-gray-600 hover:bg-primary-100 hover:text-primary-700"
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
 * Sidebar de navegación global, responsive y autónomo.
 * Se monta en el layout global junto a NavBar y Footer.
 * (El layout decide en qué rutas mostrarlo — igual que navbar/footer.)
 *
 * @param {"user"|"worker"} role  qué menú mostrar (default "user")
 *
 * Móvil: hamburguesa flotante que abre un Drawer.
 * Desktop (md+): sidebar fijo a la izquierda.
 * Requiere estar dentro de <BrowserRouter> (por los NavLink).
 */
export default function SidebarNav({ role = "user" }) {
  const [open, setOpen] = useState(false);
  const items = SIDEBAR_ITEMS[role] || SIDEBAR_ITEMS.user;

  return (
    <>
      {/* Hamburguesa flotante — solo móvil */}
      <IconButton
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        sx={{
          display: { xs: "inline-flex", md: "none" },
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: 1200,
          bgcolor: "#BB6AF0",
          color: "#fff",
          "&:hover": { bgcolor: "#a55dd3" },
        }}
      >
        <i className="ti ti-menu-2" />
      </IconButton>

      {/* Desktop: fijo */}
      <Box
        component="nav"
        sx={{ width: WIDTH, flexShrink: 0, display: { xs: "none", md: "block" } }}
        className="border-r border-gray-200"
      >
        <NavContent items={items} />
      </Box>

      {/* Móvil: drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: WIDTH } }}
      >
        <NavContent items={items} onNavigate={() => setOpen(false)} />
      </Drawer>
    </>
  );
}