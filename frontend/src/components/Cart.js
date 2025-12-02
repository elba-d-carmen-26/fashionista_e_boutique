import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
  TextField,
  Paper,
} from "@mui/material";
import {
  Close,
  Add,
  Remove,
  Delete,
  ShoppingCartCheckout,
} from "@mui/icons-material";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const {
    isOpen,
    items,
    total,
    itemCount,
    toggleCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    toggleCart();
    navigate("/checkout");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(price);
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={toggleCart}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100%", sm: 400 },
          padding: 2,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" component="h2" color="#BA1C26">
          Carrito de Compras ({itemCount})
        </Typography>
        <IconButton onClick={toggleCart}>
          <Close />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {items.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="#BA1C26">
            Tu carrito está vacío
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2, backgroundColor: "#E6A4B4" }}
            onClick={() => {
              toggleCart();
              navigate("/products");
            }}
          >
            Ver Productos
          </Button>
        </Box>
      ) : (
        <>
          <List sx={{ flexGrow: 1, overflow: "auto" }}>
            {items.map((item) => (
              <ListItem key={item._id} sx={{ px: 0, py: 1 }}>
                <Paper
                  elevation={1}
                  sx={{
                    width: "100%",
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                     overflow: "hidden",
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={item.images?.[0] || "/images/placeholder.jpg"}
                      alt={item.name}
                      sx={{ width: 60, height: 60, color: "#BA1C26", backgroundColor: "#E6A4B4" }}
                      variant="rounded"
                    />
                  </ListItemAvatar>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <ListItemText
                      primary={item.name}
                      secondary={formatPrice(item.price)}
                      primaryTypographyProps={{
                        variant: "subtitle2",
                        noWrap: true,
                        sx: { color: "#BA1C26" },
                      }}
                    />

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleQuantityChange(item._id, item.quantity - 1)
                        }
                      >
                        <Remove fontSize="small" />
                      </IconButton>

                      <TextField
                        size="small"
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            item._id,
                            parseInt(e.target.value) || 0
                          )
                        }
                        inputProps={{
                          min: 0,
                          style: { textAlign: "center", width: "60px" },
                        }}
                        sx={{ width: "80px" }}
                      />

                      <IconButton
                        size="small"
                        onClick={() =>
                          handleQuantityChange(item._id, item.quantity + 1)
                        }
                      >
                        <Add fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeFromCart(item._id)}
                        sx={{ ml: 1 }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: "right", color: "#BA1C26"}}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {formatPrice(item.price * item.quantity)}
                    </Typography>
                  </Box>
                </Paper>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1, color: "#BA1C26" }}
            >
              <Typography variant="body2" color="#BA1C26">Subtotal:</Typography>
              <Typography variant="body2">{formatPrice(total)}</Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1, color: "#BA1C26" }}
            >
              <Typography variant="body2" color="#BA1C26">Envío:</Typography>
              <Typography variant="body2">Gratis</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6" fontWeight="bold" color="#BA1C26">
                Total:
              </Typography>
              <Typography variant="h6" fontWeight="bold"  color="#BA1C26">
                {formatPrice(total)}
              </Typography>
            </Box>
          </Box>
 
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={clearCart}
              sx={{ 
                flex: 1, backgroundColor: "#BA1C26", color: "white" ,
                borderColor: "#BA1C26",
              "&:hover": {
                backgroundColor: "#E6A4B4", // 👈 color al pasar el mouse
                color: "#BA1C26",           // 👈 texto cambia a rojo
                borderColor: "#BA1C26",     // 👈 mantiene el borde rojo
              },
              }}
            >
              Vaciar
            </Button>
            <Button
              variant="contained"
              onClick={handleCheckout}
              startIcon={<ShoppingCartCheckout />}
              sx={{ flex: 2,
                backgroundColor: "#BA1C26", color: "white" ,
                borderColor: "#BA1C26",
              "&:hover": {
                backgroundColor: "#E6A4B4", // 👈 color al pasar el mouse
                color: "#BA1C26",           // 👈 texto cambia a rojo
                borderColor: "#BA1C26",     // 👈 mantiene el borde rojo
               }}
              }
            >
              Finalizar Compra
            </Button>
          </Box>
        </>
      )}
    </Drawer>
  );
};

export default Cart;
