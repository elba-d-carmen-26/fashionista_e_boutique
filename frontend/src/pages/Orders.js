import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Divider,
  Button
} from '@mui/material';
import {
  ShoppingBag,
  LocalShipping,
  CheckCircle,
  Cancel,
  Schedule
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(''); // Limpiar errores previos
      const response = await orderService.getUserOrders();
      setOrders(response.data?.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      
      // Si es un error 401, el interceptor ya manejó la redirección
      if (err.response?.status === 401) {
        console.warn('Error de autenticación detectado en Orders');
        return; // No mostrar error ya que se redirigirá automáticamente
      }
      
      // Para otros errores, mostrar mensaje específico
      if (err.response?.status === 403) {
        setError('No tienes permisos para ver los pedidos');
      } else if (err.response?.status >= 500) {
        setError('Error del servidor. Por favor, inténtalo más tarde');
      } else {
        setError('Error al cargar los pedidos. Verifica tu conexión');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: 'warning',
      confirmed: 'info',
      processing: 'primary',
      shipped: 'secondary',
      delivered: 'success',
      cancelled: 'error',
      refunded: 'default'
    };
    return colorMap[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      pending: <Schedule />,
      confirmed: <CheckCircle />,
      processing: <ShoppingBag />,
      shipped: <LocalShipping />,
      delivered: <CheckCircle />,
      cancelled: <Cancel />,
      refunded: <Cancel />
    };
    return iconMap[status] || <Schedule />;
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar este pedido?')) {
      try {
        await orderService.cancelOrder(orderId);
        setError('');
        fetchOrders(); // Recargar pedidos
      } catch (err) {
        setError('Error al cancelar el pedido');
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom color="#BA1C26">
        Mis Pedidos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 64, color: '#BA1C26', mb: 2 }} />
          <Typography variant="h6" color="#BA1C26" gutterBottom>
            No tienes pedidos aún
          </Typography>
          <Typography variant="body2" color="#BA1C26" sx={{ mb: 3 }}>
            Cuando realices tu primer pedido, aparecerá aquí.
          </Typography>
          <Button 
            variant="contained" 
            sx={{
              backgroundColor: '#BA1C26',
              color: 'white',
            
            }}
          
            onClick={() => navigate('/products')}
          >
            Explorar Productos
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Pedido #{order._id.slice(-8).toUpperCase()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Fecha: {new Date(order.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(order.status)}
                      <Chip
                        label={getStatusText(order.status)}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="subtitle2" gutterBottom>
                        Productos:
                      </Typography>
                      {order.items.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            {item.product?.name || 'Producto no disponible'} x {item.quantity}
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Resumen:
                        </Typography>
                        <Typography variant="body2">
                          Subtotal: ${order.subtotal.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          Impuestos: ${order.tax.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          Envío: ${order.shipping.toFixed(2)}
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          Total: ${order.total.toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Método de pago: {order.paymentMethod}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Estado de pago: {order.paymentStatus}
                      </Typography>
                    </Box>
                    
                    {order.status === 'pending' && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        Cancelar Pedido
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Orders;