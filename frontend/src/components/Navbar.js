import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  ShoppingCart,
  AccountCircle,
  Menu as MenuIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount, toggleCart } = useCart();

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/");
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      {isAuthenticated
        ? [
            <MenuItem
              key="profile"
              onClick={() => handleNavigation("/profile")}
            >
              Mi Perfil
            </MenuItem>,
            <MenuItem key="orders" onClick={() => handleNavigation("/orders")}>
              Mis Pedidos
            </MenuItem>,
            user?.role === "admin" && (
              <MenuItem key="admin" onClick={() => handleNavigation("/admin")}>
                Panel Admin
              </MenuItem>
            ),
            <MenuItem key="logout" onClick={handleLogout}>
              Cerrar Sesión
            </MenuItem>,
          ]
        : [
            <MenuItem key="login" onClick={() => handleNavigation("/login")}>
              Iniciar Sesión
            </MenuItem>,
            <MenuItem
              key="register"
              onClick={() => handleNavigation("/register")}
            >
              Registrarse
            </MenuItem >,
          ]}
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchor}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(mobileMenuAnchor)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => handleNavigation("/")}>Inicio</MenuItem>
      <MenuItem onClick={() => handleNavigation("/products")}>
        Productos
      </MenuItem>
      <MenuItem onClick={() => handleNavigation("/about")}>Acerca de</MenuItem>
      <MenuItem onClick={() => handleNavigation("/contact")}>Contacto</MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: "#BA1C26" }}>
        <Toolbar>
          {/* Logo */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            color="#E6A4B4"
            sx={{
              display: { xs: "none", sm: "block" },
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onClick={() => navigate("/")}
          >
            Fashionista e-Boutique
          </Typography>

          {/* Menú móvil */}
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={handleMobileMenuOpen}
            >
              <MenuIcon sx={{ color: "#E6A4B4" }} />
            </IconButton>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Navegación desktop */}
          {!isMobile && (
           <Box
  sx={{
    display: "flex",
    gap: 2,
    "& button": {
      color: "#E6A4B4",
      fontWeight: "bold",
      "&:hover": { color: "#fff" },
    },
  }}
>
  <Button onClick={() => navigate("/")}>Inicio</Button>
  <Button onClick={() => navigate("/products")}>Productos</Button>
  <Button onClick={() => navigate("/about")}>Acerca de</Button>
  <Button onClick={() => navigate("/contact")}>Contacto</Button>
</Box>

          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Iconos de acción */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Búsqueda */}
            <IconButton
              size="large"
              color="inherit"
              onClick={() => navigate("/search")}
            >
              <SearchIcon sx={{ color: "#E6A4B4" }} />
            </IconButton>

            {/* Carrito */}
            <IconButton size="large" color="inherit" onClick={toggleCart}>
              <Badge badgeContent={itemCount} color="error">
                <ShoppingCart sx={{ color: "#E6A4B4" }}/>
              </Badge>
            </IconButton>

            {/* Perfil */}
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle sx={{ color: "#E6A4B4" }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
    </Box>
  );
};

export default Navbar;
