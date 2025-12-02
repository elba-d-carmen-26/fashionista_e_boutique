# 🚀 Guía de Deployment - Fashionista e-Boutique

## 📋 Índice
- [Arquitectura de Deployment](#arquitectura-de-deployment)
- [Preparación para Deployment](#preparación-para-deployment)
- [Opciones de Deployment](#opciones-de-deployment)
- [Variables de Entorno](#variables-de-entorno)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoreo y Logs](#monitoreo-y-logs)
- [Troubleshooting](#troubleshooting)

## 🏗️ Arquitectura de Deployment

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Frontend"
            FE[React App]
            CDN[CDN/Static Hosting]
        end
        
        subgraph "Backend"
            API[Node.js API]
            LB[Load Balancer]
        end
        
        subgraph "Database"
            DB[(MongoDB Atlas)]
            CACHE[(Redis Cache)]
        end
        
        subgraph "External Services"
            MAIL[Email Service]
            PAYMENT[Payment Gateway]
            STORAGE[File Storage]
        end
    end
    
    subgraph "Monitoring"
        LOGS[Logging Service]
        METRICS[Metrics & Analytics]
        ALERTS[Alert System]
    end
    
    CDN --> API
    API --> DB
    API --> CACHE
    API --> MAIL
    API --> PAYMENT
    API --> STORAGE
    API --> LOGS
    LOGS --> METRICS
    METRICS --> ALERTS
```

## 🛠️ Preparación para Deployment

### 1. Configuración de Producción

#### Backend - Configuración de Producción
```javascript
// config/production.js
module.exports = {
  port: process.env.PORT || 5000,
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE || '30d'
  },
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  },
  security: {
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100, // limit each IP to 100 requests per windowMs
    helmetOptions: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }
  }
};
```

#### Frontend - Configuración de Build
```javascript
// package.json - Scripts de producción
{
  "scripts": {
    "build": "react-scripts build",
    "build:analyze": "npm run build && npx bundle-analyzer build/static/js/*.js",
    "build:prod": "NODE_ENV=production npm run build",
    "serve": "serve -s build -l 3000"
  }
}
```

### 2. Optimizaciones de Producción

#### Dockerfile para Backend
```dockerfile
# Dockerfile.backend
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Cambiar ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000

CMD ["node", "server.js"]
```

#### Dockerfile para Frontend
```dockerfile
# Dockerfile.frontend
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Nginx para servir archivos estáticos
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🌐 Opciones de Deployment

### Opción 1: Vercel + Railway (Recomendado)

#### Frontend en Vercel
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy desde el directorio frontend
cd frontend
vercel

# 3. Configurar variables de entorno en Vercel Dashboard
# REACT_APP_API_URL=https://your-backend.railway.app/api
```

#### Backend en Railway
```bash
# 1. Conectar repositorio en Railway Dashboard
# 2. Configurar variables de entorno:
# NODE_ENV=production
# JWT_SECRET=your-super-secret-key
# MONGODB_URI=mongodb+srv://...
# PORT=5000
```

### Opción 2: Netlify + Heroku

#### Frontend en Netlify
```bash
# 1. Build del proyecto
cd frontend
npm run build

# 2. Deploy manual o conectar Git
# 3. Configurar variables de entorno:
# REACT_APP_API_URL=https://your-app.herokuapp.com/api
```

#### Backend en Heroku
```bash
# 1. Crear Procfile
echo "web: node server.js" > backend/Procfile

# 2. Deploy
cd backend
heroku create your-app-name
git push heroku main

# 3. Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set MONGODB_URI=mongodb+srv://...
```

### Opción 3: Docker + DigitalOcean

#### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - redis
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
```

## 🔐 Variables de Entorno

### Backend (.env.production)
```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fashionista_prod

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars
JWT_EXPIRE=30d

# CORS
FRONTEND_URL=https://your-frontend-domain.com

# Email Service (SendGrid/Nodemailer)
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@fashionista.com

# Payment Gateway (Stripe)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Redis Cache
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=info
```

### Frontend (.env.production)
```bash
# API Configuration
REACT_APP_API_URL=https://your-backend-domain.com/api

# App Configuration
REACT_APP_APP_NAME=Fashionista e-Boutique
REACT_APP_VERSION=1.0.0

# Analytics
REACT_APP_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
REACT_APP_HOTJAR_ID=your-hotjar-id

# Payment
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Social Login
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_FACEBOOK_APP_ID=your-facebook-app-id
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
      
      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test -- --coverage --watchAll=false

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        uses: railway-app/railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
```

## 📊 Monitoreo y Logs

### Configuración de Winston Logger
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
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Health Check Endpoint
```javascript
// routes/health.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    
    // Check uptime
    const uptime = process.uptime();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)} minutes`,
      database: dbStatus,
      memory: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`
      },
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

module.exports = router;
```

## 🔧 Scripts de Deployment

### Script de Deploy Automatizado
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting deployment process..."

# 1. Run tests
echo "📋 Running tests..."
cd backend && npm test
cd ../frontend && npm test -- --watchAll=false

# 2. Build frontend
echo "🏗️ Building frontend..."
cd frontend
npm run build

# 3. Deploy backend
echo "🖥️ Deploying backend..."
cd ../backend
git add .
git commit -m "Deploy: $(date)"
git push railway main

# 4. Deploy frontend
echo "🌐 Deploying frontend..."
cd ../frontend
vercel --prod

echo "✅ Deployment completed successfully!"
```

### Script de Rollback
```bash
#!/bin/bash
# scripts/rollback.sh

set -e

echo "⏪ Starting rollback process..."

# Get last successful deployment
LAST_COMMIT=$(git log --oneline -n 2 | tail -1 | cut -d' ' -f1)

echo "Rolling back to commit: $LAST_COMMIT"

# Rollback backend
cd backend
git reset --hard $LAST_COMMIT
git push railway main --force

# Rollback frontend
cd ../frontend
git reset --hard $LAST_COMMIT
vercel --prod

echo "✅ Rollback completed!"
```

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Error de CORS
```javascript
// Solución: Configurar CORS correctamente
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### 2. Variables de Entorno No Cargadas
```bash
# Verificar variables
node -e "console.log(process.env.NODE_ENV)"

# Cargar manualmente
export NODE_ENV=production
```

#### 3. Error de Conexión a Base de Datos
```javascript
// Verificar conexión
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
```

### Comandos de Diagnóstico
```bash
# Verificar logs del servidor
heroku logs --tail --app your-app-name

# Verificar estado de la aplicación
curl https://your-api-url.com/api/health

# Verificar variables de entorno
heroku config --app your-app-name

# Reiniciar aplicación
heroku restart --app your-app-name
```

## 📈 Métricas de Deployment

### KPIs a Monitorear
- **Uptime**: > 99.9%
- **Response Time**: < 200ms promedio
- **Error Rate**: < 1%
- **Build Time**: < 5 minutos
- **Deploy Frequency**: Diario/Semanal

### Dashboard de Monitoreo
```javascript
// utils/metrics.js
const prometheus = require('prom-client');

// Métricas personalizadas
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

module.exports = {
  httpRequestDuration,
  httpRequestTotal,
  register: prometheus.register
};
```

## 🎯 Checklist de Deployment

### Pre-Deployment
- [ ] Tests pasando (unit, integration, e2e)
- [ ] Variables de entorno configuradas
- [ ] Base de datos migrada
- [ ] SSL certificado configurado
- [ ] Backup de base de datos realizado
- [ ] Documentación actualizada

### Post-Deployment
- [ ] Health check funcionando
- [ ] Logs monitoreados
- [ ] Performance verificada
- [ ] Funcionalidades críticas probadas
- [ ] Rollback plan preparado
- [ ] Equipo notificado

## 🔮 Próximos Pasos

1. **Implementar Blue-Green Deployment**
2. **Configurar Auto-scaling**
3. **Implementar CDN para assets**
4. **Configurar alertas avanzadas**
5. **Optimizar performance con caching**

---

## 📚 Recursos Adicionales

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)
- [Node.js Production Checklist](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

**¡Tu aplicación está lista para producción! 🚀**