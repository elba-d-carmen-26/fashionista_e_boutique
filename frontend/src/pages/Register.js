import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  Grid
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { register, user, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      // Navigation will be handled by useEffect when user state changes
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom color="#BA1C26">
            Crear Cuenta
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Nombre Completo"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
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
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
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
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
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
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmar Contraseña"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
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
              sx={{ mt: 3, mb: 2, backgroundColor: "#BA1C26" }}
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
            
            <Grid container justifyContent="center">
              <Grid>
                <Link component={RouterLink} to="/login" variant="body2"
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
                
                  ¿Ya tienes una cuenta? Inicia sesión
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;