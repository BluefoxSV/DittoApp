import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import NavBar_data from "./data/NavBar";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { apiSlice } from "../../store/api/apiSlice";
import { logout } from "../../store/slices/authSlice";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useCurrentUser();

  const navItems = NavBar_data.map((item) =>
    item.to === "/login" && isAuthenticated
      ? { label: "Cerrar sesión", isLogout: true }
      : item,
  );

  const handleLogout = () => {
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    handleCloseDrawer();
    navigate("/");
  };

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleCloseDrawer = () => {
    setMobileOpen(false);
  };

  const isActiveRoute = (path) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }

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
            px: {
              xs: 2,
              md: 4,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                textDecoration: "none",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              Ditto App
            </Typography>
          </Box>

          <Box
            sx={{
              display: {
                xs: "none",
                md: "flex",
              },
              alignItems: "center",
              gap: 1,
            }}
          >
            {navItems.map((item) =>
              item.isLogout ? (
                <Button
                  key="logout"
                  onClick={handleLogout}
                  sx={{
                    color: "rgba(255,255,255,0.75)",
                    fontWeight: 500,
                    borderBottom: "2px solid transparent",
                    borderRadius: 0,
                    px: 2,
                    py: 1,
                    textTransform: "none",
                    "&:hover": {
                      color: "#fff",
                      backgroundColor: "rgba(255,255,255,0.06)",
                    },
                  }}
                >
                  {item.label}
                </Button>
              ) : (
                <Button
                  key={item.to}
                  component={Link}
                  to={item.to}
                  sx={{
                    color: isActiveRoute(item.to)
                      ? "#fff"
                      : "rgba(255,255,255,0.75)",
                    fontWeight: isActiveRoute(item.to) ? 700 : 500,
                    borderBottom: isActiveRoute(item.to)
                      ? "2px solid #fff"
                      : "2px solid transparent",
                    borderRadius: 0,
                    px: 2,
                    py: 1,
                    textTransform: "none",
                    "&:hover": {
                      color: "#fff",
                      backgroundColor: "rgba(255,255,255,0.06)",
                    },
                  }}
                >
                  {item.label}
                </Button>
              ),
            )}
          </Box>

          <Box
            sx={{
              display: {
                xs: "block",
                md: "none",
              },
            }}
          >
            <IconButton onClick={handleDrawerToggle} sx={{ color: "#fff" }}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Toolbar />

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: "#041021",
            color: "#fff",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 2,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Typography variant="h6">Menú</Typography>

          <IconButton onClick={handleCloseDrawer} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List>
          {navItems.map((item) =>
            item.isLogout ? (
              <ListItemButton
                key="logout"
                onClick={handleLogout}
                sx={{
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            ) : (
              <ListItemButton
                key={item.to}
                component={Link}
                to={item.to}
                onClick={handleCloseDrawer}
                sx={{
                  color: "#fff",
                  backgroundColor: isActiveRoute(item.to)
                    ? "rgba(18,103,155,0.35)"
                    : "transparent",
                  borderLeft: isActiveRoute(item.to)
                    ? "4px solid #12679b"
                    : "4px solid transparent",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActiveRoute(item.to) ? 700 : 500,
                  }}
                />
              </ListItemButton>
            ),
          )}
        </List>
      </Drawer>
    </>
  );
}