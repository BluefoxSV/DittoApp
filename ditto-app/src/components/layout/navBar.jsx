import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import NavBar_data from "./data/NavBar";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import logo from "../../assets/ditto.png"; // <-- ajustar al nombre real del logo

/**
 * @param {function} onMenuClick  abre el sidebar movil (lo pasa App.jsx).
 *                                Si no se pasa, no se muestra la hamburguesa.
 */
export default function Navbar({ onMenuClick }) {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  const isActiveRoute = (path) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) setShowNavbar(false);
      else setShowNavbar(true);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: "#953CD1",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          transition: "transform 0.3s ease-in-out",
          transform: showNavbar ? "translateY(0)" : "translateY(-100%)",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2, md: 4 },
          }}
        >
          {/* Izquierda: hamburguesa (solo movil) + logo + nombre */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {onMenuClick ? (
              <IconButton
                onClick={onMenuClick}
                aria-label="Abrir menu"
                edge="start"
                sx={{ color: "#fff", display: { xs: "inline-flex", md: "none" } }}
              >
                <i className="ti ti-menu-2" style={{ fontSize: 22 }} />
              </IconButton>
            ) : null}

            <Box
              component={Link}
              to="/"
              sx={{ display: "flex", alignItems: "center", gap: 1, textDecoration: "none" }}
            >
              <Box
                component="img"
                src={logo}
                alt="Ditto App"
                sx={{ height: 32, width: "auto", display: "block" }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  display: { xs: "none", sm: "block" }, // en movil solo el logo, evita colision
                }}
              >
                Ditto App
              </Typography>
            </Box>
          </Box>

          {/* ESCRITORIO: links de texto */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
            {NavBar_data.map((item) => (
              <Button
                key={item.to}
                component={Link}
                to={item.to}
                sx={{
                  color: isActiveRoute(item.to) ? "#fff" : "rgba(255,255,255,0.75)",
                  fontWeight: isActiveRoute(item.to) ? 700 : 500,
                  borderBottom: isActiveRoute(item.to) ? "2px solid #fff" : "2px solid transparent",
                  borderRadius: 0,
                  px: 2,
                  py: 1,
                  textTransform: "none",
                  "&:hover": { color: "#fff", backgroundColor: "rgba(255,255,255,0.06)" },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* MOVIL: links como iconos fijos */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 0.5 }}>
            {NavBar_data.map((item) => (
              <IconButton
                key={item.to}
                component={Link}
                to={item.to}
                aria-label={item.label}
                sx={{
                  color: isActiveRoute(item.to) ? "#fff" : "rgba(255,255,255,0.7)",
                  bgcolor: isActiveRoute(item.to) ? "rgba(255,255,255,0.15)" : "transparent",
                }}
              >
                <i className={`ti ${item.icon}`} style={{ fontSize: 20 }} />
              </IconButton>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      {/* espaciador para el AppBar fixed */}
      <Toolbar />
    </>
  );
}