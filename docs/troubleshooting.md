# 🔧 Guía de Troubleshooting - Fashionista e-Boutique

## 📋 Índice
- [Problemas del Backend](#problemas-del-backend)
- [Problemas del Frontend](#problemas-del-frontend)
- [Problemas de Base de Datos](#problemas-de-base-de-datos)
- [Problemas de Deployment](#problemas-de-deployment)
- [Problemas de Performance](#problemas-de-performance)
- [Herramientas de Diagnóstico](#herramientas-de-diagnóstico)
- [Logs y Monitoreo](#logs-y-monitoreo)

## 🖥️ Problemas del Backend

### 1. Problemas de Conexión a MongoDB

#### ❌ Error: "MongoNetworkError: failed to connect to server"

**Síntomas:**
```bash
MongoNetworkError: failed to connect to server [localhost:27017] on first connect
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Diagnóstico:**
```bash
# Verificar si MongoDB está ejecutándose
# Windows
tasklist | findstr mongod
net start | findstr MongoDB

# macOS/Linux
ps aux | grep mongod
sudo systemctl status mongod
```

**Soluciones:**

1. **Iniciar MongoDB:**
```bash
# Windows
net start MongoDB
# o si está instalado manualmente
mongod --dbpath "C:\data\db"

# macOS
brew services start mongodb-community
# o
sudo brew services start mongodb-community

# Linux
sudo systemctl start mongod
sudo systemctl enable mongod
```

2. **Verificar configuración de conexión:**
```javascript
// backend/.env
MONGODB_URI=mongodb://localhost:27017/fashionista_dev

// Para MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fashionista_prod?retryWrites=true&w=majority
```

3. **Verificar puertos y firewall:**
```bash
# Verificar puerto 27017
netstat -an | grep 27017
telnet localhost 27017

# Windows - Abrir puerto en firewall
netsh advfirewall firewall add rule name="MongoDB" dir=in action=allow protocol=TCP localport=27017
```

#### ❌ Error: "Authentication failed"

**Síntomas:**
```bash
MongoServerError: Authentication failed
MongoError: bad auth : authentication failed
```

**Soluciones:**

1. **Verificar credenciales:**
```javascript
// Verificar usuario y contraseña en .env
MONGODB_URI=mongodb://username:password@localhost:27017/fashionista_dev

// Para caracteres especiales en contraseña, usar URL encoding
// Ejemplo: password@123 -> password%40123
```

2. **Crear usuario de base de datos:**
```javascript
// Conectar a MongoDB shell
mongosh

// Crear usuario
use fashionista_dev
db.createUser({
  user: "fashionista_user",
  pwd: "secure_password",
  roles: [
    { role: "readWrite", db: "fashionista_dev" }
  ]
})
```

### 2. Problemas de JWT y Autenticación

#### ❌ Error: "JsonWebTokenError: invalid token"

**Síntomas:**
```bash
JsonWebTokenError: invalid token
JsonWebTokenError: jwt malformed
UnauthorizedError: No authorization token was found
```

**Diagnóstico:**
```javascript
// Verificar token en el cliente
console.log('Token:', localStorage.getItem('token'));

// Verificar en el backend
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('Received token:', req.headers.authorization);
```

**Soluciones:**

1. **Verificar JWT_SECRET:**
```bash
# backend/.env
JWT_SECRET=your-super-secure-secret-key-minimum-32-characters
JWT_EXPIRE=30d
```

2. **Verificar formato del token:**
```javascript
// Frontend - Envío correcto del token
const token = localStorage.getItem('token');
const config = {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};
```

3. **Middleware de autenticación:**
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
```

### 3. Problemas de CORS

#### ❌ Error: "Access to fetch blocked by CORS policy"

**Síntomas:**
```bash
Access to fetch at 'http://localhost:5000/api/auth/login' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Soluciones:**

1. **Configurar CORS correctamente:**
```javascript
// server.js
const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ]
};

app.use(cors(corsOptions));
```

2. **Verificar variables de entorno:**
```bash
# backend/.env
FRONTEND_URL=http://localhost:3000
# En producción
FRONTEND_URL=https://your-frontend-domain.com
```

### 4. Problemas de Rate Limiting

#### ❌ Error: "Too many requests"

**Síntomas:**
```bash
Error: Request failed with status code 429
Too Many Requests
```

**Soluciones:**

1. **Ajustar configuración de rate limiting:**
```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health';
    }
  });
};

// Diferentes límites para diferentes endpoints
const authLimiter = createRateLimiter(15 * 60 * 1000, 5, 'Too many login attempts');
const generalLimiter = createRateLimiter(15 * 60 * 1000, 100, 'Too many requests');

module.exports = { authLimiter, generalLimiter };
```

## 🌐 Problemas del Frontend

### 1. Problemas de Compilación

#### ❌ Error: "Module not found"

**Síntomas:**
```bash
Module not found: Error: Can't resolve './components/ProductCard'
Module not found: Error: Can't resolve '@mui/material'
```

**Soluciones:**

1. **Verificar imports:**
```javascript
// Correcto
import ProductCard from './components/ProductCard';
import { Button } from '@mui/material';

// Incorrecto
import ProductCard from './components/productCard'; // Case sensitive
```

2. **Reinstalar dependencias:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

3. **Verificar rutas relativas:**
```javascript
// Usar rutas absolutas con alias
// jsconfig.json o tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/pages/*": ["pages/*"]
    }
  }
}
```

### 2. Problemas de Estado y Context

#### ❌ Error: "Cannot read property of undefined"

**Síntomas:**
```bash
TypeError: Cannot read property 'user' of undefined
TypeError: Cannot read property 'products' of undefined
```

**Soluciones:**

1. **Verificar Context Provider:**
```javascript
// App.js
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        {/* Tu aplicación */}
      </CartProvider>
    </AuthProvider>
  );
}
```

2. **Usar optional chaining:**
```javascript
// Antes
const userName = user.name; // Error si user es undefined

// Después
const userName = user?.name || 'Guest';
const productCount = products?.length || 0;
```

3. **Verificar hooks de Context:**
```javascript
// hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
```

### 3. Problemas de API Calls

#### ❌ Error: "Network Error" o "Failed to fetch"

**Síntomas:**
```bash
Error: Network Error
TypeError: Failed to fetch
Error: Request failed with status code 500
```

**Diagnóstico:**
```javascript
// Verificar configuración de API
console.log('API URL:', process.env.REACT_APP_API_URL);

// Verificar en Network tab del navegador
// Verificar respuesta del servidor
```

**Soluciones:**

1. **Verificar variables de entorno:**
```bash
# frontend/.env.local
REACT_APP_API_URL=http://localhost:5000/api

# En producción
REACT_APP_API_URL=https://your-backend-domain.com/api
```

2. **Configurar interceptores de Axios:**
```javascript
// services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 🗄️ Problemas de Base de Datos

### 1. Problemas de Performance

#### ❌ Consultas Lentas

**Diagnóstico:**
```javascript
// Habilitar profiling en MongoDB
db.setProfilingLevel(2, { slowms: 100 });

// Ver operaciones lentas
db.system.profile.find().sort({ ts: -1 }).limit(5);
```

**Soluciones:**

1. **Crear índices:**
```javascript
// Índices para búsquedas frecuentes
db.products.createIndex({ name: "text", description: "text" });
db.products.createIndex({ category: 1, price: 1 });
db.users.createIndex({ email: 1 }, { unique: true });
db.orders.createIndex({ userId: 1, createdAt: -1 });
```

2. **Optimizar consultas:**
```javascript
// Antes - Ineficiente
const products = await Product.find({});

// Después - Eficiente
const products = await Product.find({})
  .select('name price image category')
  .limit(20)
  .sort({ createdAt: -1 });
```

### 2. Problemas de Validación

#### ❌ Error: "Validation failed"

**Síntomas:**
```bash
ValidationError: Product validation failed: price: Path `price` is required
ValidationError: User validation failed: email: Error, expected `email` to be unique
```

**Soluciones:**

1. **Verificar esquemas de Mongoose:**
```javascript
// models/Product.js
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  }
});
```

2. **Manejar errores de validación:**
```javascript
// controllers/productController.js
const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
```

## 🚀 Problemas de Deployment

### 1. Problemas de Build

#### ❌ Error: "Build failed"

**Síntomas:**
```bash
npm ERR! code ELIFECYCLE
npm ERR! errno 1
npm ERR! frontend@0.1.0 build: `react-scripts build`
```

**Soluciones:**

1. **Verificar variables de entorno:**
```bash
# Verificar que todas las variables estén definidas
echo $REACT_APP_API_URL

# En Windows
echo %REACT_APP_API_URL%
```

2. **Limpiar caché y reinstalar:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run build
```

3. **Verificar warnings como errores:**
```bash
# Deshabilitar warnings como errores temporalmente
CI=false npm run build

# O configurar en package.json
"scripts": {
  "build": "CI=false react-scripts build"
}
```

### 2. Problemas de Variables de Entorno

#### ❌ Variables no cargadas en producción

**Diagnóstico:**
```javascript
// Verificar en el servidor
console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
```

**Soluciones:**

1. **Verificar configuración del hosting:**
```bash
# Heroku
heroku config --app your-app-name

# Vercel
vercel env ls

# Railway
# Verificar en el dashboard
```

2. **Usar dotenv correctamente:**
```javascript
// server.js
require('dotenv').config();

// O especificar archivo
require('dotenv').config({ path: '.env.production' });
```

## ⚡ Problemas de Performance

### 1. Aplicación Lenta

#### Diagnóstico de Performance

**Frontend:**
```javascript
// Usar React DevTools Profiler
// Verificar re-renders innecesarios

// Medir performance
console.time('Component render');
// ... código del componente
console.timeEnd('Component render');
```

**Backend:**
```javascript
// Middleware para medir tiempo de respuesta
const responseTime = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  
  next();
};

app.use(responseTime);
```

**Soluciones:**

1. **Optimizar componentes React:**
```javascript
// Usar React.memo para componentes puros
const ProductCard = React.memo(({ product }) => {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  );
});

// Usar useMemo para cálculos costosos
const expensiveValue = useMemo(() => {
  return products.filter(p => p.category === selectedCategory);
}, [products, selectedCategory]);

// Usar useCallback para funciones
const handleClick = useCallback((id) => {
  onProductSelect(id);
}, [onProductSelect]);
```

2. **Optimizar consultas de base de datos:**
```javascript
// Usar agregaciones eficientes
const getProductStats = async () => {
  return await Product.aggregate([
    { $match: { active: true } },
    { $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Usar populate selectivo
const orders = await Order.find({ userId })
  .populate('products', 'name price image')
  .select('total status createdAt')
  .sort({ createdAt: -1 });
```

## 🛠️ Herramientas de Diagnóstico

### 1. Comandos de Sistema

```bash
# Verificar procesos
ps aux | grep node
ps aux | grep mongod

# Verificar puertos
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000
netstat -tulpn | grep :27017

# Verificar uso de recursos
top
htop
free -h
df -h

# Verificar logs del sistema
# Linux
sudo journalctl -u mongod -f
sudo journalctl -u nginx -f

# Windows
Get-EventLog -LogName Application -Source MongoDB
```

### 2. Herramientas de Desarrollo

```bash
# Verificar dependencias
npm audit
npm outdated

# Analizar bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js

# Verificar performance
npm install -g clinic
clinic doctor -- node server.js
```

### 3. Debugging en VS Code

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "envFile": "${workspaceFolder}/backend/.env",
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Frontend",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/frontend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["start"]
    }
  ]
}
```

## 📊 Logs y Monitoreo

### 1. Configuración de Logs

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'fashionista-api' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### 2. Health Check Endpoint

```javascript
// routes/health.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/health', async (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    checks: {
      database: 'OK',
      memory: 'OK'
    }
  };

  try {
    // Check database
    if (mongoose.connection.readyState !== 1) {
      healthCheck.checks.database = 'ERROR';
      healthCheck.message = 'Database connection failed';
    }

    // Check memory
    const memUsage = process.memoryUsage();
    healthCheck.memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB'
    };

    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.message = 'ERROR';
    healthCheck.error = error.message;
    res.status(503).json(healthCheck);
  }
});

module.exports = router;
```

### 3. Error Tracking

```javascript
// Frontend - Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Enviar error a servicio de tracking
    if (process.env.NODE_ENV === 'production') {
      // Sentry, LogRocket, etc.
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Algo salió mal</h2>
          <p>Ha ocurrido un error inesperado. Por favor, recarga la página.</p>
          <button onClick={() => window.location.reload()}>
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 🆘 Contacto y Escalación

### Niveles de Soporte

1. **Nivel 1 - Problemas Básicos:**
   - Reiniciar servicios
   - Verificar configuración
   - Consultar documentación

2. **Nivel 2 - Problemas Técnicos:**
   - Análisis de logs
   - Debugging de código
   - Optimización de performance

3. **Nivel 3 - Problemas Críticos:**
   - Problemas de arquitectura
   - Escalabilidad
   - Seguridad

### Información para Reportar Problemas

```markdown
## Template de Reporte de Bug

**Descripción del problema:**
[Descripción clara y concisa]

**Pasos para reproducir:**
1. 
2. 
3. 

**Comportamiento esperado:**
[Qué debería pasar]

**Comportamiento actual:**
[Qué está pasando]

**Entorno:**
- OS: [Windows/macOS/Linux]
- Node.js: [versión]
- Browser: [Chrome/Firefox/Safari + versión]
- Deployment: [local/staging/production]

**Logs relevantes:**
```
[Incluir logs de error]
```

**Screenshots:**
[Si aplica]
```

---

## 📚 Recursos Adicionales

- [Node.js Debugging Guide](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [MongoDB Troubleshooting](https://docs.mongodb.com/manual/faq/diagnostics/)
- [Express.js Error Handling](https://expressjs.com/en/guide/error-handling.html)

**¡Recuerda: La mayoría de problemas se resuelven verificando logs y configuración! 🔍**