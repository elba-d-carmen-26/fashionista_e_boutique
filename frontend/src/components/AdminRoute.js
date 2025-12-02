import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box, Alert } from '@mui/material';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado pero no es admin, mostrar mensaje de acceso denegado
  if (user && user.role !== 'admin') {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Acceso denegado. Solo los administradores pueden acceder a esta página.
        </Alert>
      </Box>
    );
  }

  // Si está autenticado y es admin, mostrar el componente hijo
  return children;
};

export default AdminRoute;