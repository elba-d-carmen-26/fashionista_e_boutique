import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  Card,
  CardContent,
  Snackbar
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Send,
  Business
} from '@mui/icons-material';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
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
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es requerido';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
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
      // Simular envío del formulario
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En una aplicación real, aquí se enviaría el formulario al backend
      console.log('Formulario de contacto enviado:', formData);
      
      // Limpiar formulario
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      setShowSuccess(true);
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Email sx={{ color: 'primary.main' }} />,
      title: 'Correo Electrónico',
      content: 'contacto@elba-ecommerce.com',
      subtitle: 'Respuesta en 24 horas'
    },
    {
      icon: <Phone sx={{ color: 'primary.main' }} />,
      title: 'Teléfono',
      content: '+57 (1) 234-5678',
      subtitle: 'Lunes a Viernes 8:00 AM - 6:00 PM'
    },
    {
      icon: <LocationOn sx={{ color: 'primary.main' }} />,
      title: 'Dirección',
      content: 'Calle 123 #45-67, Bogotá',
      subtitle: 'Colombia'
    },
    {
      icon: <Business sx={{ color: 'primary.main' }} />,
      title: 'Horario de Atención',
      content: 'Lunes a Viernes: 8:00 AM - 6:00 PM',
      subtitle: 'Sábados: 9:00 AM - 2:00 PM'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 2, color: "#BA1C26", fontWeight: "bold" }}>
        Contáctanos
      </Typography>
      
      <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6, color: "#BA1C26" }}>
        ¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para ti
      </Typography>

      <Grid container spacing={4}>
        {/* Información de contacto */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, color: "#BA1C26" }}>
            Información de Contacto
          </Typography>
          
          <Grid container spacing={3}>
            {contactInfo.map((info, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card sx={{ height: '100%', p: 2, backgroundColor: "#E6A4B4" }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ mb: 2, }}>
                       {React.cloneElement(info.icon, { sx: {  color: "#BA1C26" } })} 
                    </Box>
                    <Typography variant="h6" gutterBottom sx={{ color: "#BA1C26" }}>
                      {info.title}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1, color: "#BA1C26" }}>
                      {info.content}
                    </Typography>
                    <Typography variant="body2" color="#BA1C26">
                      {info.subtitle}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom color="#BA1C26">
                  ¿Por qué contactarnos?
                </Typography>
                <Typography variant="body1" paragraph color="#BA1C26">
                  Nuestro equipo de atención al cliente está disponible para ayudarte con:
                </Typography>
                <Box component="ul" sx={{ pl: 2, color:"#BA1C26" }}>
                  <Typography component="li" variant="body1">Consultas sobre productos</Typography>
                  <Typography component="li" variant="body1">Soporte técnico</Typography>
                  <Typography component="li" variant="body1">Información sobre pedidos</Typography>
                  <Typography component="li" variant="body1">Sugerencias y comentarios</Typography>
                  <Typography component="li" variant="body1">Colaboraciones comerciales</Typography>
                </Box>
              </Box>
            </Grid>

            {/* Formulario de contacto */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 3, color: "#BA1C26" }}>
                  Envíanos un Mensaje
                </Typography>
                
              <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        "& .MuiTextField-root": {
          mb: 2,
        },
        "& .MuiInputLabel-root": {
          color: "#BA1C26", // Color del label
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: "#BA1C26", // Label al enfocar
        },
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "#E6A4B4", // Borde por defecto
          },
          "&:hover fieldset": {
            borderColor: "#BA1C26", // Borde al pasar el mouse
          },
          "&.Mui-focused fieldset": {
            borderColor: "#BA1C26", // Borde cuando está enfocado
          },
        },
        "& .MuiInputBase-input::placeholder": {
          color: "#BA1C26", // Color del placeholder
          opacity: 0.7,
        },
      }}
    >
      <TextField
        fullWidth
        label="Nombre Completo"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={!!errors.name}
        helperText={errors.name}
        margin="normal"
        required
        placeholder="Escribe tu nombre completo"
      />

      <TextField
        fullWidth
        label="Correo Electrónico"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={!!errors.email}
        helperText={errors.email}
        margin="normal"
        required
        placeholder="tu@correo.com"
      />

      <TextField
        fullWidth
        label="Asunto"
        name="subject"
        value={formData.subject}
        onChange={handleChange}
        error={!!errors.subject}
        helperText={errors.subject}
        margin="normal"
        required
        placeholder="Motivo del mensaje"
      />

      <TextField
        fullWidth
        label="Mensaje"
        name="message"
        multiline
        rows={6}
        value={formData.message}
        onChange={handleChange}
        error={!!errors.message}
        helperText={errors.message}
        margin="normal"
        required
        placeholder="Cuéntanos cómo podemos ayudarte..."
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        startIcon={loading ? null : <Send />}
        sx={{
          mt: 3,
          py: 1.5,
          backgroundColor: "#BA1C26",
          "&:hover": {
            backgroundColor: "#E6A4B4",
            color: "#BA1C26",
          },
        }}
      >
        {loading ? "Enviando..." : "Enviar Mensaje"}
      </Button>
    </Box>

          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar para mensaje de éxito */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          ¡Mensaje enviado exitosamente! Te contactaremos pronto.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Contact;