# Gestión de Usuarios Administradores

## 📋 Índice

1. [Introducción](#introducción)
2. [Usuario Administrador Predefinido](#usuario-administrador-predefinido)
3. [Creación de Nuevos Administradores](#creación-de-nuevos-administradores)
4. [Estructura del Modelo de Usuario](#estructura-del-modelo-de-usuario)
5. [Permisos y Capacidades](#permisos-y-capacidades)
6. [Seguridad y Mejores Prácticas](#seguridad-y-mejores-prácticas)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

Este documento describe la gestión de usuarios administradores en el sistema de e-commerce. Los administradores tienen acceso completo al sistema y pueden gestionar productos, usuarios, pedidos y configuraciones.

### Características del Sistema de Administradores

- **Autenticación JWT** segura
- **Encriptación de contraseñas** con bcrypt
- **Roles diferenciados** (user/admin)
- **Validación de datos** robusta
- **Gestión de sesiones** y tokens

---

## 👑 Usuario Administrador Predefinido

### 🔑 Credenciales del Administrador Principal

El sistema incluye un usuario administrador preconfigurado para facilitar el acceso inicial:

```
📧 Email: elba1@admin.com
👤 Nombre: Elba Administrador
🔑 Contraseña: Elba123!
🌐 URL de acceso: http://localhost:3000/login
🏠 Panel Admin: http://localhost:3000/admin
```

### ⚠️ Consideraciones de Seguridad

> **IMPORTANTE**: 
> - **Cambia la contraseña** inmediatamente después del primer login
> - **No compartas** estas credenciales
> - **Usa contraseñas seguras** (mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolos)
> - **Revisa regularmente** los accesos administrativos

### 🔍 Verificación del Usuario Administrador

Para verificar si el usuario administrador existe:

```bash
cd backend
node scripts/createAdmin.js
```

**Salida esperada si ya existe:**
```
✅ Conectado a MongoDB
⚠️  Ya existe un usuario administrador con email: elba1@admin.com
👤 Nombre: Elba Administrador
📧 Email: elba1@admin.com
🔑 Usa la contraseña que configuraste anteriormente
```

---

## 🛠️ Creación de Nuevos Administradores

### Método 1: Script Automatizado

#### 1.1 Usando el Script Existente

```bash
cd backend
node scripts/createAdmin.js
```

#### 1.2 Modificando el Script para Nuevos Administradores

Edita `backend/scripts/createAdmin.js`:

```javascript
// Cambiar estos datos por los del nuevo administrador
const adminData = {
  name: 'Nuevo Administrador',
  email: 'nuevo@admin.com',
  password: 'NuevaPassword123!',
  role: 'admin',
  isActive: true
};
```

### Método 2: API REST

#### 2.1 Crear Usuario Regular y Promover a Admin

**Paso 1: Crear usuario regular**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nuevo Admin",
    "email": "nuevo@admin.com",
    "password": "Password123!"
  }'
```

**Paso 2: Promover a administrador** (requiere acceso directo a la base de datos)
```javascript
// En MongoDB o script personalizado
db.users.updateOne(
  { email: "nuevo@admin.com" },
  { $set: { role: "admin" } }
);
```

### Método 3: Script Personalizado

Crear un nuevo script `backend/scripts/createCustomAdmin.js`:

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createCustomAdmin = async (adminData) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const existingUser = await User.findOne({ email: adminData.email });
    if (existingUser) {
      console.log('❌ Usuario ya existe con este email');
      return;
    }

    const admin = new User({
      ...adminData,
      role: 'admin',
      isActive: true
    });
    
    await admin.save();
    console.log('✅ Administrador creado exitosamente!');
    console.log('📧 Email:', adminData.email);
    console.log('👤 Nombre:', adminData.name);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

// Datos del nuevo administrador
const newAdminData = {
  name: 'Tu Nombre',
  email: 'tu@email.com',
  password: 'TuPassword123!'
};

createCustomAdmin(newAdminData);
```

---

## 🏗️ Estructura del Modelo de Usuario

### Esquema de Usuario

```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false  // No se incluye en consultas por defecto
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});
```

### Métodos del Modelo

- **`comparePassword()`**: Compara contraseñas encriptadas
- **`getPublicProfile()`**: Retorna datos públicos sin contraseña
- **Pre-save hook**: Encripta automáticamente las contraseñas

---

## 🔐 Permisos y Capacidades

### Administradores Pueden:

#### 📦 Gestión de Productos
- ✅ Crear nuevos productos
- ✅ Editar productos existentes
- ✅ Eliminar productos
- ✅ Gestionar categorías
- ✅ Controlar stock e inventario
- ✅ Configurar descuentos y precios

#### 👥 Gestión de Usuarios
- ✅ Ver lista de usuarios
- ✅ Activar/desactivar usuarios
- ✅ Gestionar roles (con limitaciones)
- ✅ Ver estadísticas de usuarios

#### 📊 Gestión de Pedidos
- ✅ Ver todos los pedidos
- ✅ Actualizar estados de pedidos
- ✅ Gestionar envíos
- ✅ Procesar reembolsos

#### ⚙️ Configuración del Sistema
- ✅ Acceso al panel de administración
- ✅ Configurar parámetros del sistema
- ✅ Ver reportes y analytics
- ✅ Gestionar contenido del sitio

### Usuarios Regulares Pueden:

#### 🛒 Funciones de Compra
- ✅ Ver catálogo de productos
- ✅ Agregar productos al carrito
- ✅ Realizar pedidos
- ✅ Ver historial de pedidos
- ✅ Escribir reseñas de productos

#### 👤 Gestión de Perfil
- ✅ Editar información personal
- ✅ Gestionar direcciones
- ✅ Cambiar contraseña
- ✅ Ver estadísticas personales

---

## 🛡️ Seguridad y Mejores Prácticas

### Autenticación y Autorización

#### JWT (JSON Web Tokens)
```javascript
// Estructura del token JWT para administradores
{
  "userId": "64a1b2c3d4e5f6789012345",
  "email": "admin@example.com",
  "role": "admin",
  "iat": 1672531200,
  "exp": 1672617600
}
```

#### Middleware de Autenticación
```javascript
// Verificación de rol de administrador
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador.'
    });
  }
  next();
};
```

### Encriptación de Contraseñas

- **Algoritmo**: bcrypt con salt de 12 rounds
- **Validación**: Mínimo 6 caracteres
- **Recomendación**: Usar contraseñas complejas

### Mejores Prácticas de Seguridad

#### ✅ Recomendaciones
- **Contraseñas seguras**: Mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos
- **Cambio regular**: Cambiar contraseñas cada 90 días
- **Acceso limitado**: Solo otorgar permisos de admin cuando sea necesario
- **Monitoreo**: Revisar logs de acceso regularmente
- **Backup**: Mantener respaldos de la base de datos

#### ❌ Evitar
- Compartir credenciales de administrador
- Usar contraseñas débiles o predecibles
- Dejar sesiones abiertas en computadoras públicas
- Otorgar permisos de admin innecesariamente

---

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. No puedo acceder como administrador

**Síntomas:**
- Login fallido con credenciales correctas
- Error "Credenciales inválidas"

**Soluciones:**
```bash
# Verificar si el usuario existe
cd backend
node scripts/createAdmin.js

# Si no existe, lo creará automáticamente
# Si existe, mostrará la información
```

#### 2. Usuario existe pero no es administrador

**Síntomas:**
- Login exitoso pero sin acceso al panel admin
- Error "Acceso denegado"

**Solución:**
```javascript
// Conectar a MongoDB y ejecutar:
db.users.updateOne(
  { email: "elba1@admin.com" },
  { $set: { role: "admin" } }
);
```

#### 3. Error de conexión a la base de datos

**Síntomas:**
- Error "MongoNetworkError"
- "Connection refused"

**Soluciones:**
1. Verificar que MongoDB esté ejecutándose
2. Revisar la variable `MONGODB_URI` en `.env`
3. Verificar conectividad de red

#### 4. Token JWT inválido

**Síntomas:**
- Error "Token inválido" en requests
- Logout automático

**Soluciones:**
1. Hacer logout y login nuevamente
2. Verificar que `JWT_SECRET` esté configurado
3. Limpiar localStorage del navegador

### Comandos de Diagnóstico

```bash
# Verificar estado de MongoDB
mongosh --eval "db.adminCommand('ismaster')"

# Listar usuarios administradores
mongosh ecommerce --eval "db.users.find({role: 'admin'})"

# Verificar variables de entorno
cd backend && node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"
```

---

## 📞 Soporte

Para problemas adicionales:

1. **Revisar logs** del servidor backend
2. **Consultar documentación** de la API
3. **Verificar configuración** de variables de entorno
4. **Contactar al equipo** de desarrollo

---

*Documentación actualizada: Enero 2025*