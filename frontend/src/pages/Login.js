import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasRedirected = useRef(false);

  // Redirigir si ya está autenticado (solo al cargar la página)
  useEffect(() => {
    // Solo redirigir si el usuario está autenticado y no está en proceso de carga
    // y no hemos redirigido antes
    if (isAuthenticated && !loading && !hasRedirected.current) {
      hasRedirected.current = true;
      // Usar setTimeout para evitar conflictos con la navegación
      setTimeout(() => {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }, 100);
    }
  }, [isAuthenticated, loading, navigate, location.state?.from?.pathname]); // Incluidas todas las dependencias para cumplir con la regla de hooks

  // Limpiar errores cuando el componente se monta
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await login(formData);
      // La redirección se maneja en el useEffect
    } catch (error) {
      // El error se maneja en el contexto
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom color="#BA1C26">
            Iniciar Sesión
          </Typography>
          <Typography variant="body2" color="#E6A4B4">
            Ingresa a tu cuenta para continuar
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Correo Electrónico"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            margin="normal"
            required
            autoComplete="email"
            autoFocus
            sx={{
                // Color del texto y placeholder
                "& .MuiInputBase-input": {
                  color: "#BA1C26", // texto principal
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#E6A4B4", // placeholder
                  opacity: 1,
                },
                // Color del label
                "& .MuiInputLabel-root": {
                  color: "#BA1C26",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#E6A4B4", // label al enfocar
                },
                // Color del borde (outlined)
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#BA1C26",
                  },
                  "&:hover fieldset": {
                    borderColor: "#E6A4B4", // borde al pasar el mouse
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#E6A4B4", // borde al enfocar
                  },
                },
                // Texto de ayuda o error
                "& .MuiFormHelperText-root": {
                  color: "#BA1C26",
                },
              }}
          />

          <TextField
            fullWidth
            id="password"
            name="password"
            label="Contraseña"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            margin="normal"
            required
            autoComplete="current-password"
            sx={{
                 
                // Color del texto y placeholder
                "& .MuiInputBase-input": {
                  color: "#BA1C26", // texto principal
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#E6A4B4", // placeholder
                  opacity: 1,
                },
                // Color del label
                "& .MuiInputLabel-root": {
                  color: "#BA1C26",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#E6A4B4", // label al enfocar
                },
                // Color del borde (outlined)
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#BA1C26",
                  },
                  "&:hover fieldset": {
                    borderColor: "#E6A4B4", // borde al pasar el mouse
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#E6A4B4", // borde al enfocar
                  },
                },
                // Texto de ayuda o error
                "& .MuiFormHelperText-root": {
                  color: "#BA1C26",
                },
              }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{ mt: 3, mb: 2, backgroundColor: "#BA1C26" }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Iniciar Sesión'
            )}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
                      sx={{
              display: 'block',
              mb: 2,
              color: '#BA1C26', // rojo del sitio
              textDecoration: 'none',
              '&:hover': {
                color: '#E6A4B4', // opcional: color hover
                textDecoration: 'underline',
              },
            }}
            >
              ¿Olvidaste tu contraseña?
            </Link>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                o
              </Typography>
            </Divider>

            <Typography variant="body2" color="#E6A4B4">
              ¿No tienes una cuenta?{' '}
              <Link component={RouterLink} to="/register" variant="body2"
               sx={{
              display: 'block',
              mb: 2,
              color: '#BA1C26', // rojo del sitio
              textDecoration: 'none',
              '&:hover': {
                color: '#E6A4B4', // opcional: color hover
                textDecoration: 'underline',
              },
            }}>
              
                Regístrate aquí
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;