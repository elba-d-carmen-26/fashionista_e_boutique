import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { Person, ShoppingBag, Lock } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';

const Profile = () => {
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { user, updateProfile, changePassword } = useAuth();

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (tabValue === 1) {
      fetchOrders();
    }
  }, [tabValue]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await orderService.getUserOrders();
      setOrders(response.data.data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile(profileData);
      setSuccess('Perfil actualizado correctamente');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Contraseña cambiada correctamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom color="#BA1C26">
        Mi Perfil
      </Typography>

      <Paper elevation={3}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider',
            "& .MuiTab-root": {
      color: "#BA1C26", // color de texto e ícono por defecto
      fontWeight: 500,
      textTransform: "none",
      "&:hover": {
        color: "#A2171F", // color al pasar el mouse
      },
    },
           }}
        >
          <Tab icon={<Person />} label="Información Personal" />
          <Tab icon={<ShoppingBag />} label="Mis Pedidos" />
          <Tab icon={<Lock />} label="Cambiar Contraseña" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Profile Information Tab */}
          {tabValue === 0 && (
            <Box component="form" onSubmit={handleProfileSubmit}>
              <Typography variant="h6" gutterBottom color="#BA1C26">
                Información Personal
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Nombre Completo"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                    sx={{
        // Color del texto dentro del campo
        "& .MuiInputBase-input": {
          color: "#E6A4B4",
        },
        // Color del label (etiqueta flotante)
        "& .MuiInputLabel-root": {
          color: "#BA1C26",
        },
        // Color del label cuando está enfocado
        "& .MuiInputLabel-root.Mui-focused": {
          color: "#E6A4B4",
        },
        // Borde del TextField (modo outlined)
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "#BA1C26", // borde normal
          },
          "&:hover fieldset": {
            borderColor: "#E6A4B4", // borde al pasar el mouse
          },
          "&.Mui-focused fieldset": {
            borderColor: "#BA1C26", // borde cuando está enfocado
          },
        },
      }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Correo Electrónico"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                    sx={{
        // Color del texto dentro del campo
        "& .MuiInputBase-input": {
          color: "#E6A4B4",
        },
        // Color del label (etiqueta flotante)
        "& .MuiInputLabel-root": {
          color: "#BA1C26",
        },
        // Color del label cuando está enfocado
        "& .MuiInputLabel-root.Mui-focused": {
          color: "#E6A4B4",
        },
        // Borde del TextField (modo outlined)
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "#BA1C26", // borde normal
          },
          "&:hover fieldset": {
            borderColor: "#E6A4B4", // borde al pasar el mouse
          },
          "&.Mui-focused fieldset": {
            borderColor: "#BA1C26", // borde cuando está enfocado
          },
        },
      }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ mr: 2, backgroundColor:"#BA1C26" }}
                >
                  {loading ? 'Actualizando...' : 'Actualizar Perfil'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Orders Tab */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom color="#BA1C26">
                Historial de Pedidos
              </Typography>

              {ordersLoading ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress />
                </Box>
              ) : orders.length === 0 ? (
                <Typography variant="body1" color="#BA1C26" align="center" sx={{ py: 4 }}>
                  No tienes pedidos aún
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Número de Pedido</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Productos</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell>#{order.orderNumber}</TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusText(order.status)}
                              color={getStatusColor(order.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{order.items.length} productos</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* Change Password Tab */}
          {tabValue === 2 && (
            <Box component="form" onSubmit={handlePasswordSubmit}>
              <Typography variant="h6" gutterBottom color=" #BA1C26">
                Cambiar Contraseña
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Contraseña Actual"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    sx={{
        // Color del texto dentro del campo
        "& .MuiInputBase-input": {
          color: "#E6A4B4",
        },
        // Color del label (etiqueta flotante)
        "& .MuiInputLabel-root": {
          color: "#BA1C26",
        },
        // Color del label cuando está enfocado
        "& .MuiInputLabel-root.Mui-focused": {
          color: "#E6A4B4",
        },
        // Borde del TextField (modo outlined)
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "#BA1C26", // borde normal
          },
          "&:hover fieldset": {
            borderColor: "#E6A4B4", // borde al pasar el mouse
          },
          "&.Mui-focused fieldset": {
            borderColor: "#BA1C26", // borde cuando está enfocado
          },
        },
      }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Nueva Contraseña"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    sx={{
        // Color del texto dentro del campo
        "& .MuiInputBase-input": {
          color: "#E6A4B4",
        },
        // Color del label (etiqueta flotante)
        "& .MuiInputLabel-root": {
          color: "#BA1C26",
        },
        // Color del label cuando está enfocado
        "& .MuiInputLabel-root.Mui-focused": {
          color: "#E6A4B4",
        },
        // Borde del TextField (modo outlined)
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "#BA1C26", // borde normal
          },
          "&:hover fieldset": {
            borderColor: "#E6A4B4", // borde al pasar el mouse
          },
          "&.Mui-focused fieldset": {
            borderColor: "#BA1C26", // borde cuando está enfocado
          },
        },
      }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Confirmar Nueva Contraseña"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    sx={{
        // Color del texto dentro del campo
        "& .MuiInputBase-input": {
          color: "#E6A4B4",
        },
        // Color del label (etiqueta flotante)
        "& .MuiInputLabel-root": {
          color: "#BA1C26",
        },
        // Color del label cuando está enfocado
        "& .MuiInputLabel-root.Mui-focused": {
          color: "#E6A4B4",
        },
        // Borde del TextField (modo outlined)
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "#BA1C26", // borde normal
          },
          "&:hover fieldset": {
            borderColor: "#E6A4B4", // borde al pasar el mouse
          },
          "&.Mui-focused fieldset": {
            borderColor: "#BA1C26", // borde cuando está enfocado
          },
        },
      }}
                    
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ mr: 2, backgroundColor: "#BA1C26" }}
                >
                  {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;