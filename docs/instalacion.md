# 🚀 Guía de Instalación Completa

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Node.js** (versión 18 o superior) - [Descargar aquí](https://nodejs.org/)
- ✅ **npm** (versión 9 o superior, viene incluido con Node.js)
- ✅ **MongoDB** (local o MongoDB Atlas) - [Guía de instalación](#instalación-de-mongodb)
- ✅ **Git** (para clonar el repositorio) - [Descargar aquí](https://git-scm.com/)
- ✅ **Editor de código** (recomendado: VS Code)

### 🔍 Verificar Instalaciones

```bash
node --version    # Debe mostrar v18.x.x o superior
npm --version     # Debe mostrar 9.x.x o superior
git --version     # Debe mostrar 2.x.x o superior
```

## 📥 Instalación Paso a Paso

### 1. 📂 Clonar el Repositorio

```bash
git clone <repository-url>
cd REQURIMIENTOS_ELBA
```

### 2. 🗄️ Instalación de MongoDB

#### Opción A: MongoDB Local (Recomendado para desarrollo)

**Windows:**

```bash
# Opción 1: Descargar instalador
# Ir a: https://www.mongodb.com/try/download/community
# Descargar MongoDB Community Server 7.0

# Opción 2: Usar Chocolatey
choco install mongodb

# Iniciar servicio
net start MongoDB
```

**macOS:**

```bash
# Usar Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb/brew/mongodb-community
```

**Linux (Ubuntu/Debian):**

```bash
# Importar clave pública
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Crear archivo de lista
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Actualizar e instalar
sudo apt-get update
sudo apt-get install -y mongodb-org

# Iniciar servicio
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Opción B: MongoDB Atlas (Recomendado para producción)

1. **Crear cuenta gratuita** en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Crear cluster gratuito** (512MB)
3. **Configurar usuario de base de datos**:
   - Username: `admin`
   - Password: `Password123!` (usar una contraseña segura)
4. **Configurar IP whitelist**: `0.0.0.0/0` (para desarrollo)
5. **Obtener string de conexión**: `mongodb+srv://admin:Password123!@cluster0.xxxxx.mongodb.net/ecommerce`

### 3. ⚙️ Configurar el Backend

#### 3.1 Navegar al directorio del backend

```bash
cd backend
```

#### 3.2 Instalar dependencias

```bash
npm install
```

**Dependencias principales que se instalarán:**

- 🚀 Express.js 4.18.x (servidor web)
- 🗄️ Mongoose 8.x (ODM para MongoDB)
- 🔐 jsonwebtoken 9.x (autenticación JWT)
- 🔒 bcryptjs 2.x (hash de contraseñas)
- ✅ express-validator 7.x (validación de datos)
- 🌐 cors 2.x (configuración CORS)
- 📄 multer 1.x (manejo de archivos)
- 🔧 dotenv 16.x (variables de entorno)

#### 3.3 Configurar variables de entorno

Crear archivo `.env` en el directorio `backend/`:

```env
# Configuración del servidor
PORT=5000
NODE_ENV=development

# Base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/fashionista
# Para MongoDB Atlas usar:
# MONGODB_URI=mongodb+srv://admin:Password123!@cluster0.xxxxx.mongodb.net/ecommerce

# JWT Secret (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui_cambiar_en_produccion_2024

# Configuración de CORS
FRONTEND_URL=http://localhost:3000

# Configuración de archivos
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=5242880

# Configuración de email (opcional)
EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
```

#### 3.4 Poblar base de datos con datos de ejemplo

```bash
node scripts/seedProducts.js
```

**Salida esperada:**

```
✅ Conectado a MongoDB
🗑️ Productos existentes eliminados
✨ 6 productos de ejemplo creados exitosamente

📦 Productos creados:
1. iPhone 15 Pro - $999 (Stock: 50)
2. MacBook Air M2 - $1199 (Stock: 25)
3. Samsung Galaxy S24 Ultra - $1199 (Stock: 35)
4. Sony WH-1000XM5 - $399 (Stock: 75)
5. Nike Air Max 270 - $150 (Stock: 120)
6. Camiseta Básica Premium - $25 (Stock: 200)

🎉 ¡Seeding completado exitosamente!
```

#### 3.5 Iniciar servidor backend

```bash
npm run dev
```

**Salida esperada:**

```
🌟 Servidor ejecutándose en puerto 5000
✅ Conectado a MongoDB
🔧 Modo desarrollo activado
📁 Directorio de uploads configurado
```

### 4. 🎨 Configurar el Frontend

#### 4.1 Navegar al directorio del frontend

```bash
cd ../frontend
```

#### 4.2 Instalar dependencias

```bash
npm install
```

**Dependencias principales que se instalarán:**

- ⚛️ React 18.2.0
- 🎨 Material-UI (MUI) 5.14.x
  - @mui/material
  - @mui/icons-material
  - @emotion/react
  - @emotion/styled
- 🔄 React Router DOM 6.15.x
- 📡 Axios 1.5.x (peticiones HTTP)
- 🔐 jwt-decode 3.x (decodificación JWT)
- 🎯 React Hook Form 7.x (formularios)
- 🔍 React Query 3.x (gestión de estado del servidor)

#### 4.3 Configurar variables de entorno

Crear archivo `.env` en el directorio `frontend/`:

```env
# URL de la API del backend
REACT_APP_API_URL=http://localhost:5000/api

# Información de la aplicación
REACT_APP_APP_NAME=Fashionista e-Boutique
REACT_APP_VERSION=1.0.0

# Configuración de desarrollo
REACT_APP_DEBUG=true

# Configuración de paginación
REACT_APP_PRODUCTS_PER_PAGE=12

# Configuración de archivos
REACT_APP_MAX_FILE_SIZE=5242880
REACT_APP_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

#### 4.4 Iniciar servidor frontend

```bash
npm start
```

**Salida esperada:**

```
✅ Compiled successfully!

🌐 Local:            http://localhost:3000
🌐 On Your Network:  http://192.168.1.x:3000

📝 Note that the development build is not optimized.
📦 To create a production build, use npm run build.

webpack compiled with 0 errors and 0 warnings
```

## 🚀 Ejecutar la Aplicación Completa

### Método 1: Ejecución Manual (Recomendado para desarrollo)

#### Terminal 1 - Backend:

```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend:

```bash
cd frontend
npm start
```

### Método 2: Usando Scripts Concurrentes

Desde la raíz del proyecto, instalar concurrently:

```bash
npm install --save-dev concurrently
```

Agregar script en `package.json` raíz:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix backend\" \"npm start --prefix frontend\"",
    "install:all": "npm install && npm install --prefix backend && npm install --prefix frontend"
  }
}
```

Ejecutar ambos servidores:

```bash
npm run dev
```

## ✅ Verificación de la Instalación

### 1. 🔍 Verificar Backend

**Comprobar que el servidor está ejecutándose:**

```bash
curl http://localhost:5000/api/test
```

**Salida esperada:**

```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2024-01-XX...",
  "version": "1.0.0"
}
```

**Verificar productos en la base de datos:**

```bash
curl http://localhost:5000/api/products
```

**Salida esperada:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "...",
        "name": "iPhone 15 Pro",
        "price": 999,
        "stock": 50,
        "category": "Electrónicos",
        "images": ["..."],
        "reviews": []
      }
    ],
    "pagination": {
      "totalProducts": 6,
      "totalPages": 1,
      "currentPage": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### 2. 🎨 Verificar Frontend

**Acceder a la aplicación:**

- ✅ Navegar a `http://localhost:3000`
- ✅ La página debe cargar sin errores
- ✅ Debe mostrar 6 productos en la página principal
- ✅ No debe haber errores en la consola del navegador

**Funcionalidades a verificar:**

- 🏠 Página principal con productos destacados
- 🔍 Búsqueda y filtrado de productos
- 🛒 Carrito de compras funcional
- 👤 Registro e inicio de sesión
- 📱 Diseño responsive
- 🛍️ Proceso de checkout completo
- ⭐ Sistema de reseñas
- 👤 Perfil de usuario

### 3. 🔗 Verificar Conectividad Frontend-Backend

**Pruebas funcionales:**

1. **Cargar productos**: Los productos deben aparecer en la página principal
2. **Agregar al carrito**: Debe funcionar sin errores
3. **Registro de usuario**: Debe crear usuario en la base de datos
4. **Inicio de sesión**: Debe autenticar correctamente
5. **Crear orden**: Debe procesar el checkout
6. **Agregar reseña**: Debe permitir calificar productos

## 📋 Scripts Disponibles

### 🗄️ Backend Scripts

```bash
npm start              # Iniciar en modo producción
npm run dev            # Iniciar en modo desarrollo (con nodemon)
npm run test           # Ejecutar tests
npm run lint           # Verificar código con ESLint
npm run lint:fix       # Corregir errores de ESLint automáticamente
node scripts/seedProducts.js    # Poblar base de datos con productos
node scripts/createAdmin.js     # Crear usuario administrador
```

### 🎨 Frontend Scripts

```bash
npm start              # Iniciar servidor de desarrollo
npm run build          # Crear build de producción optimizado
npm test               # Ejecutar tests unitarios
npm run test:coverage  # Ejecutar tests con cobertura
npm run lint           # Verificar código con ESLint
npm run lint:fix       # Corregir errores de ESLint automáticamente
npm run analyze        # Analizar tamaño del bundle
```

## 🔧 Solución de Problemas Comunes

### ❌ Error de Conexión a MongoDB

```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Soluciones:**

1. **MongoDB Local**: Verificar que el servicio esté ejecutándose

   ```bash
   # Windows
   net start MongoDB

   # macOS
   brew services start mongodb/brew/mongodb-community

   # Linux
   sudo systemctl start mongod
   sudo systemctl status mongod
   ```

2. **MongoDB Atlas**: Verificar URI de conexión y whitelist de IPs
3. **Firewall**: Verificar que el puerto 27017 esté abierto

### ❌ Error de CORS

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solución**: Verificar configuración en `backend/.env`:

```env
FRONTEND_URL=http://localhost:3000
```

### ❌ Puerto en Uso

```
Error: listen EADDRINUSE :::5000
```

**Soluciones:**

```bash
# Windows - Encontrar proceso usando el puerto
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9

# O cambiar puerto en backend/.env
PORT=5001
```

### ❌ Dependencias Faltantes o Conflictos

```
Module not found: Can't resolve 'package-name'
```

**Solución:**

```bash
# Limpiar cache e instalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Si persiste el problema
npm audit fix
npm update
```

### ❌ Error de Productos No Cargan

```
Error al cargar productos destacados
```

**Solución:**

```bash
# Verificar que el backend esté ejecutándose
curl http://localhost:5000/api/products

# Si no hay productos, ejecutar seeding
cd backend
node scripts/seedProducts.js

# Verificar conexión a MongoDB
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/fashionista').then(() => console.log('✅ MongoDB conectado')).catch(err => console.log('❌ Error:', err))"
```

### ❌ Error de Autenticación JWT

```
JsonWebTokenError: invalid token
```

**Solución:**

1. Verificar que `JWT_SECRET` esté configurado en `.env`
2. Limpiar localStorage del navegador
3. Verificar que el token no haya expirado

### ❌ Error de Compilación React

```
Module build failed: Error: Cannot resolve module
```

**Solución:**

```bash
# Limpiar cache de React
rm -rf node_modules/.cache
npm start

# Si persiste
rm -rf node_modules package-lock.json
npm install
```

## 🛠️ Configuración para Desarrollo

### 1. 📝 Editor Recomendado (VS Code)

**Extensiones esenciales:**

```
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer 2
- GitLens
- Thunder Client (para probar APIs)
- MongoDB for VS Code
- Material Icon Theme
```

**Configuración recomendada (settings.json):**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 2. 🔧 Configuración de Git

```bash
# Configurar usuario
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Configurar editor
git config --global core.editor "code --wait"

# Configurar Git Hooks (opcional)
npm install --save-dev husky lint-staged
npx husky install
```

### 3. 🐛 Herramientas de Debug

**Backend (Node.js):**

```bash
# Iniciar con debugger
npm run dev:debug

# O usar VS Code debugger con launch.json:
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/backend/server.js",
  "env": {
    "NODE_ENV": "development"
  }
}
```

**Frontend (React):**

- React Developer Tools (extensión de navegador)
- Redux DevTools (si se usa Redux)
- Chrome DevTools para debugging

### 4. 🧪 Configuración de Testing

**Backend:**

```bash
# Instalar dependencias de testing
npm install --save-dev jest supertest

# Ejecutar tests
npm test
```

**Frontend:**

```bash
# Testing ya configurado con Create React App
npm test

# Para coverage
npm run test:coverage
```

## 🎉 ¡Instalación Completada!

Si has seguido todos los pasos correctamente, deberías tener:

✅ **Backend ejecutándose** en `http://localhost:5000`  
✅ **Frontend ejecutándose** en `http://localhost:3000`  
✅ **Base de datos MongoDB** conectada y poblada  
✅ **6 productos de ejemplo** disponibles  
✅ **Autenticación JWT** configurada  
✅ **CORS** configurado correctamente  
✅ **Sistema de reseñas** funcional  
✅ **Carrito y checkout** operativos  
✅ **Diseño responsive** implementado

**🚀 ¡Tu aplicación e-commerce está lista para el desarrollo!**

## 📚 Próximos Pasos

Una vez completada la instalación:

1. 📖 Revisar la [Documentación de API](./api.md)
2. 🎨 Explorar los [Componentes del Frontend](./frontend.md)
3. 🏗️ Consultar la [Arquitectura del Sistema](./arquitectura.md)
4. 🗄️ Entender la [Estructura de Base de Datos](./base-de-datos.md)
5. 🧪 Configurar [Testing y Deployment](./testing.md)
6. 🔧 Revisar [Troubleshooting](./troubleshooting.md)

## 📞 Soporte

Si encuentras problemas durante la instalación:

1. 📖 Consulta la [documentación completa](../README.md)
2. 🔍 Revisa la [guía de troubleshooting](./troubleshooting.md)
3. 🐛 Reporta issues en el repositorio
4. 💬 Contacta al equipo de desarrollo

---

**💡 Tip**: Mantén siempre actualizadas las dependencias y revisa regularmente los logs para detectar posibles problemas temprano.
