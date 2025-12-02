import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Verificar si realmente hay un token antes de hacer logout
      const token = localStorage.getItem('token');
      const currentPath = window.location.pathname;
      
      // Solo hacer logout automático si:
      // 1. Hay un token (significa que el usuario estaba autenticado)
      // 2. No estamos ya en la página de login
      // 3. El error viene de una petición autenticada
      if (token && currentPath !== '/login' && currentPath !== '/register') {
        console.warn('Token inválido o expirado, cerrando sesión...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Usar setTimeout para evitar problemas de navegación
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

export default api;