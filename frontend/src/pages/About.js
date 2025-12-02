import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  Paper,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Business,
  People,
  Timeline,
  EmojiEvents,
  LocalShipping,
  Security,
  Support,
  Park
} from '@mui/icons-material';

const About = () => {
  const teamMembers = [
    {
      name: "Ana García",
      role: "CEO & Fundadora",
      description: "Visionaria con más de 15 años de experiencia en e-commerce y tecnología."
    },
    {
      name: "Carlos Rodríguez",
      role: "CTO",
      description: "Experto en desarrollo de software y arquitectura de sistemas escalables."
    },
    {
      name: "María López",
      role: "Directora de Marketing",
      description: "Especialista en marketing digital y experiencia del cliente."
    },
    {
      name: "David Martín",
      role: "Director de Operaciones",
      description: "Responsable de la logística y optimización de procesos."
    }
  ];

  const values = [
    {
      icon: <Box sx={{ color: '#BA1C26' }}><Security /></Box>,
      title: "Confianza",
      description: "Garantizamos la seguridad de tus datos y transacciones con los más altos estándares de protección."
    },
    {
      icon: <Box sx={{ color: '#BA1C26' }}><LocalShipping /></Box>,
      title: "Rapidez",
      description: "Entregamos tus productos en tiempo récord con nuestro sistema de logística optimizado."
    },
    {
      icon: <Box sx={{ color: '#BA1C26' }}><Support /></Box>,
      title: "Soporte",
      description: "Nuestro equipo de atención al cliente está disponible 24/7 para ayudarte."
    },
    {
      icon: <Box sx={{ color: '#BA1C26' }}><Park /></Box>,
      title: "Sostenibilidad",
      description: "Comprometidos con el medio ambiente y prácticas comerciales responsables."
    }
  ];

 

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom color="primary"
         sx={{ color: "#BA1C26", fontWeight: "bold" }}
        >
          Sobre Nosotros
        </Typography>
        <Typography variant="h5" color="text.secondary" 
        sx={{ 
          mb: 4 ,
          color: "#BA1C26",
        }}
        
        >
          Conectando personas con productos de calidad desde 2020
        </Typography>
        <Paper elevation={3} sx={{ p: 4, backgroundColor: '#E6A4B4', color: '#BA1C26' }}>
          <Typography variant="h6" gutterBottom>
            Nuestra Misión
          </Typography>
          <Typography variant="body1">
            Democratizar el acceso a productos de calidad a través de una plataforma tecnológica 
            innovadora que conecte a vendedores y compradores de manera eficiente, segura y sostenible.
          </Typography>
        </Paper>
      </Box>


      {/* Our Values */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" color="#BA1C26">
          Nuestros Valores
        </Typography>
        <Grid container spacing={4}>
          {values.map((value, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card elevation={2} sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  {value.icon}
                </Box>
                <Typography variant="h6" 
                gutterBottom
                sx={{ color: "#BA1C26", fontWeight: "bold" }}
                >
                  {value.title}
                </Typography>
                <Typography variant="body2" color="#BA1C26">
                  {value.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>


      {/* Team Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" color="#BA1C26">
          Nuestro Equipo
        </Typography>
        <Grid container spacing={4}>
          {teamMembers.map((member, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card 
              elevation={2} 
              sx=
              {{ height: '100%', 
                textAlign: 'center', 
                p: 3, 
                backgroundColor: "#E6A4B4", 
              }}
              
              >
                <Avatar
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: '#BA1C26',
                    fontSize: '2rem'
                  }}
                >
                  {member.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Typography variant="h6" color="white" gutterBottom>
                  {member.name}
                </Typography>
                <Chip 
                  label={member.role} 
                  color="secondary" 
                  size="small" 
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="white">
                  {member.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Vision Section */}
      <Paper elevation={3} sx={{ p: 4, backgroundColor: 'white' }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" color="#BA1C26">
          Nuestra Visión
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Ser la plataforma de e-commerce líder en América Latina, reconocida por nuestra 
          innovación tecnológica, excelencia en el servicio al cliente y compromiso con la 
          sostenibilidad.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Chip icon={<EmojiEvents />} label="Excelencia"
              sx={{
          backgroundColor: '#BA1C26',
          color: 'white',
          fontWeight: 'bold',
          '& .MuiChip-icon': { color: 'white' }, // Hace que el ícono también sea blanco
        }}
          color="primary" />
          <Chip icon={<Timeline />} label="Innovación" 
          sx={{
            backgroundColor: '#BA1C26',
            color: 'white',
            fontWeight: 'bold',
            '& .MuiChip-icon': { color: 'white' }, // Hace que el ícono también sea blanco
          }}
          color="primary" />
          <Chip icon={<People />} label="Comunidad" 
                sx={{
            backgroundColor: '#BA1C26',
            color: 'white',
            fontWeight: 'bold',
            '& .MuiChip-icon': { color: 'white' }, // Hace que el ícono también sea blanco
          }}
          color="primary" />
          <Chip icon={<Business />} label="Crecimiento" 
          sx={{
              backgroundColor: '#BA1C26',
              color: 'white',
              fontWeight: 'bold',
              '& .MuiChip-icon': { color: 'white' }, // Hace que el ícono también sea blanco
            }}
          color="primary" />
        </Box>
      </Paper>
    </Container>
  );
};

export default About;