# Frontend - Sistema de E-commerce

## Descripción
Frontend de la aplicación de e-commerce desarrollado con React.js y Material-UI. Proporciona una interfaz de usuario moderna y responsiva para la gestión de productos, pedidos y usuarios.

## Tecnologías Utilizadas
- **React.js** (v18+) - Biblioteca principal para la interfaz de usuario
- **Material-UI (MUI)** - Framework de componentes UI
- **React Router DOM** - Enrutamiento del lado del cliente
- **Axios** - Cliente HTTP para comunicación con la API
- **Context API** - Gestión de estado global

## Estructura del Proyecto

```
frontend/
├── public/                 # Archivos estáticos
│   ├── index.html         # Plantilla HTML principal
│   └── favicon.ico        # Icono de la aplicación
├── src/                   # Código fuente
│   ├── components/        # Componentes reutilizables
│   │   ├── Cart.js       # Componente del carrito de compras
│   │   ├── Navbar.js     # Barra de navegación principal
│   │   └── ProtectedRoute.js # Componente para rutas protegidas
│   ├── context/          # Contextos de React
│   │   ├── AuthContext.js    # Contexto de autenticación
│   │   └── CartContext.js    # Contexto del carrito
│   ├── pages/            # Páginas de la aplicación
│   │   ├── Admin.js      # Panel de administración
│   │   ├── Home.js       # Página principal
│   │   ├── Login.js      # Página de inicio de sesión
│   │   ├── Orders.js     # Página de pedidos
│   │   ├── Products.js   # Página de productos
│   │   ├── Profile.js    # Página de perfil de usuario
│   │   └── Register.js   # Página de registro
│   ├── services/         # Servicios de API
│   │   ├── api.js        # Configuración base de Axios
│   │   ├── authService.js    # Servicios de autenticación
│   │   ├── orderService.js   # Servicios de pedidos
│   │   └── productService.js # Servicios de productos
│   ├── utils/            # Utilidades y helpers
│   ├── App.js            # Componente principal de la aplicación
│   └── index.js          # Punto de entrada de la aplicación
├── build/                # Archivos de producción (generados)
├── package.json          # Dependencias y scripts
└── README.md            # Este archivo
```

## Componentes Principales

### 1. Navbar.js
Barra de navegación principal que incluye:
- Logo y navegación principal
- Búsqueda de productos
- Carrito de compras
- Menú de usuario
- Navegación responsiva para móviles

### 2. Cart.js
Componente del carrito de compras que permite:
- Ver productos agregados
- Modificar cantidades
- Eliminar productos
- Proceder al checkout

### 3. ProtectedRoute.js
Componente para proteger rutas que requieren autenticación:
- Verifica el estado de autenticación
- Redirige a login si no está autenticado
- Muestra spinner de carga durante verificación

## Páginas

### Home.js
- Página principal con productos destacados
- Navegación a diferentes categorías
- Interfaz atractiva y responsiva

### Products.js
- Listado completo de productos
- Filtros por categoría y búsqueda
- Paginación
- Ordenamiento por diferentes criterios

### Login.js / Register.js
- Formularios de autenticación
- Validación de campos
- Manejo de errores
- Redirección automática

### Profile.js
- Información del usuario
- Historial de pedidos
- Edición de perfil

### Orders.js
- Listado de pedidos del usuario
- Estados de pedidos con colores
- Detalles de cada pedido

### Admin.js
- Panel de administración
- Gestión de productos
- Gestión de pedidos
- Estadísticas

## Contextos

### AuthContext
Maneja el estado de autenticación:
- Login/logout de usuarios
- Registro de nuevos usuarios
- Actualización de perfil
- Verificación de autenticación
- Manejo de errores

### CartContext
Gestiona el carrito de compras:
- Agregar/eliminar productos
- Actualizar cantidades
- Calcular totales
- Persistencia en localStorage
- Toggle del carrito

## Servicios

### api.js
Configuración base de Axios:
- URL base de la API
- Interceptores para autenticación
- Manejo de errores globales
- Timeout de requests

### authService.js
Servicios de autenticación:
- Login y registro
- Gestión de tokens
- Actualización de perfil
- Cambio de contraseña

### productService.js
Servicios de productos:
- Obtener productos
- Filtros y búsqueda
- Categorías
- Productos destacados

### orderService.js
Servicios de pedidos:
- Crear pedidos
- Obtener historial
- Actualizar estados
- Cancelar pedidos

## Scripts Disponibles

### `npm start`
Ejecuta la aplicación en modo desarrollo.
La aplicación se abrirá en [http://localhost:3000](http://localhost:3000).

### `npm run build`
Construye la aplicación para producción en la carpeta `build`.
Optimiza el build para mejor rendimiento.

### `npm test`
Ejecuta los tests en modo interactivo.

### `npm run eject`
**Nota: Esta operación es irreversible.**
Expone todos los archivos de configuración.

## Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Instalación y Configuración

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Editar .env con las configuraciones necesarias
   ```

3. **Ejecutar en desarrollo:**
   ```bash
   npm start
   ```

4. **Construir para producción:**
   ```bash
   npm run build
   ```

## Características Implementadas

### ✅ Funcionalidades Completadas
- [x] Sistema de autenticación completo
- [x] Carrito de compras funcional
- [x] Navegación responsiva
- [x] Gestión de productos
- [x] Sistema de pedidos
- [x] Panel de administración
- [x] Persistencia de datos
- [x] Manejo de errores
- [x] Interfaz responsiva
- [x] Optimización de rendimiento

### 🔧 Optimizaciones Realizadas
- [x] Eliminación de importaciones no utilizadas
- [x] Estructura de directorios limpia
- [x] Contextos optimizados con useCallback
- [x] Interceptores de API configurados
- [x] Build de producción optimizado
- [x] Componentes reutilizables

## Notas de Desarrollo

### Advertencias Conocidas
- ESLint warning en `Login.js` sobre dependencias de useEffect (no crítico)
- Los tests requieren configuración adicional de dependencias

### Mejores Prácticas Implementadas
- Uso de Context API para estado global
- Componentes funcionales con hooks
- Separación de responsabilidades
- Manejo centralizado de errores
- Persistencia de estado en localStorage
- Interceptores para autenticación automática

## Soporte y Mantenimiento

Para reportar problemas o solicitar nuevas características, contactar al equipo de desarrollo.

### Versión
v1.0.0 - Versión estable con todas las funcionalidades principales implementadas.
