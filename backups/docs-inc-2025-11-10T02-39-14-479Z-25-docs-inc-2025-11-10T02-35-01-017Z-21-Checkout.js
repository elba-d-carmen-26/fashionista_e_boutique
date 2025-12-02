import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Payment, CheckCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import orderService from "../services/orderService";

const steps = [
  "Revisar Pedido",
  "Información de Envío",
  "Método de Pago",
  "Confirmación",
];

const paymentMethods = [
  { value: "credit_card", label: "Tarjeta de Crédito" },
  { value: "debit_card", label: "Tarjeta de Débito" },
  { value: "paypal", label: "PayPal" },
  { value: "bank_transfer", label: "Transferencia Bancaria" },
  { value: "cash_on_delivery", label: "Pago Contra Entrega" },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { user } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Formulario de dirección de envío
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Colombia",
    phone: "",
  });

  // Dirección de facturación
  const [billingAddress, setBillingAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Colombia",
    phone: "",
  });

  const [useSameAddress, setUseSameAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");

  // Calcular totales
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 500 ? 0 : 50; // Envío gratis para compras mayores a $500
  const tax = subtotal * 0.16; // IVA 16%
  const total = subtotal + shipping + tax;

  useEffect(() => {
    // Redirigir si el carrito está vacío
    if (!items || items.length === 0) {
      navigate("/products");
    }
  }, [items, navigate]);

  useEffect(() => {
    // Llenar datos del usuario si está disponible
    if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        fullName: user.name || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleShippingChange = (field, value) => {
    setShippingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Si se usa la misma dirección, actualizar también la de facturación
    if (useSameAddress) {
      setBillingAddress((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleBillingChange = (field, value) => {
    setBillingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUseSameAddressChange = (event) => {
    const checked = event.target.checked;
    setUseSameAddress(checked);

    if (checked) {
      setBillingAddress({ ...shippingAddress });
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return items && items.length > 0;
      case 1:
        return Object.values(shippingAddress).every(
          (value) => value.trim() !== ""
        );
      case 2:
        return paymentMethod !== "";
      default:
        return true;
    }
  };

  const handleSubmitOrder = async () => {
    setLoading(true);
    setError("");

    try {
      const orderData = {
        items: items.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        paymentMethod,
        shippingAddress,
        billingAddress: useSameAddress ? shippingAddress : billingAddress,
        notes: notes.trim() || undefined,
      };

      const response = await orderService.createOrder(orderData);

      if (response.success) {
        setOrderId(response.data.order.orderNumber);
        setSuccess(true);
        clearCart();
        handleNext();
      } else {
        setError(response.message || "Error al procesar la orden");
      }
    } catch (err) {
      setError(err.message || "Error al procesar la orden");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Revisar Pedido
            </Typography>
            <List>
              {items.map((item) => (
                <ListItem key={item._id} divider>
                  <ListItemAvatar>
                    <Avatar
                      src={item.images?.[0] || "/placeholder.jpg"}
                      alt={item.name}
                      variant="rounded"
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.name}
                    secondary={`Cantidad: ${item.quantity} | Precio: $${item.price}`}
                  />
                  <Typography variant="body2" fontWeight="bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Subtotal:</Typography>
              <Typography>${subtotal.toFixed(2)}</Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Envío:</Typography>
              <Typography>${shipping.toFixed(2)}</Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>IVA (16%):</Typography>
              <Typography>${tax.toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary">
                ${total.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Información de Envío
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre Completo"
                  value={shippingAddress.fullName}
                  onChange={(e) =>
                    handleShippingChange("fullName", e.target.value)
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  value={shippingAddress.street}
                  onChange={(e) =>
                    handleShippingChange("street", e.target.value)
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ciudad"
                  value={shippingAddress.city}
                  onChange={(e) => handleShippingChange("city", e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Estado"
                  value={shippingAddress.state}
                  onChange={(e) =>
                    handleShippingChange("state", e.target.value)
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Código Postal"
                  value={shippingAddress.zipCode}
                  onChange={(e) =>
                    handleShippingChange("zipCode", e.target.value)
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="País"
                  value={shippingAddress.country}
                  onChange={(e) =>
                    handleShippingChange("country", e.target.value)
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={shippingAddress.phone}
                  onChange={(e) =>
                    handleShippingChange("phone", e.target.value)
                  }
                  required
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={useSameAddress}
                    onChange={handleUseSameAddressChange}
                  />
                }
                label="Usar la misma dirección para facturación"
              />
            </Box>

            {!useSameAddress && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Dirección de Facturación
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nombre Completo"
                      value={billingAddress.fullName}
                      onChange={(e) =>
                        handleBillingChange("fullName", e.target.value)
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Dirección"
                      value={billingAddress.street}
                      onChange={(e) =>
                        handleBillingChange("street", e.target.value)
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ciudad"
                      value={billingAddress.city}
                      onChange={(e) =>
                        handleBillingChange("city", e.target.value)
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Estado"
                      value={billingAddress.state}
                      onChange={(e) =>
                        handleBillingChange("state", e.target.value)
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Código Postal"
                      value={billingAddress.zipCode}
                      onChange={(e) =>
                        handleBillingChange("zipCode", e.target.value)
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="País"
                      value={billingAddress.country}
                      onChange={(e) =>
                        handleBillingChange("country", e.target.value)
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      value={billingAddress.phone}
                      onChange={(e) =>
                        handleBillingChange("phone", e.target.value)
                      }
                      required
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Método de Pago
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Seleccionar método de pago</InputLabel>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                label="Seleccionar método de pago"
              >
                {paymentMethods.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Notas adicionales (opcional)"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instrucciones especiales de entrega, comentarios, etc."
            />
          </Box>
        );

      case 3:
        return (
          <Box textAlign="center">
            {success ? (
              <>
                <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  ¡Orden Confirmada!
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Número de orden: {orderId}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Recibirás un correo electrónico con los detalles de tu pedido.
                </Typography>
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/orders")}
                  >
                    Ver Mis Órdenes
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/products")}
                  >
                    Seguir Comprando
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Confirmar Pedido
                </Typography>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Resumen del Pedido
                    </Typography>
                    <Typography variant="body2">
                      Total: ${total.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      Método de pago:{" "}
                      {
                        paymentMethods.find((m) => m.value === paymentMethod)
                          ?.label
                      }
                    </Typography>
                    <Typography variant="body2">
                      Dirección de envío: {shippingAddress.street},{" "}
                      {shippingAddress.city}
                    </Typography>
                  </CardContent>
                </Card>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmitOrder}
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <Payment />
                  }
                >
                  {loading ? "Procesando..." : "Confirmar y Pagar"}
                </Button>
              </>
            )}
          </Box>
        );

      default:
        return "Paso desconocido";
    }
  };

  if (!items || items.length === 0) {
    return null; // El useEffect redirigirá
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Checkout
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        {!success && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Atrás
            </Button>

            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!validateStep(activeStep)}
              >
                Siguiente
              </Button>
            ) : null}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Checkout;
