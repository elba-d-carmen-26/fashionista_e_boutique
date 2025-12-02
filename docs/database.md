# Documentación de Base de Datos

## Tecnología

- **MongoDB** - Base de datos NoSQL orientada a documentos
- **Mongoose** - ODM (Object Document Mapper) para Node.js
- **bcryptjs** - Para encriptación de contraseñas
- **jsonwebtoken** - Para autenticación JWT

## Configuración y Conexión

### Instalación de MongoDB

#### Opción 1: MongoDB Local

```bash
# Windows (usando Chocolatey)
choco install mongodb

# macOS (usando Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb

# Iniciar servicio
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Opción 2: MongoDB Atlas (Recomendado para producción)

1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear un cluster gratuito
3. Configurar usuario de base de datos
4. Obtener string de conexión

### Variables de Entorno

Crear archivo `.env` en la carpeta `backend`:

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/tienda_online
# O para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tienda_online?retryWrites=true&w=majority

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRE=7d

# Puerto del servidor
PORT=5000

# Entorno
NODE_ENV=development
```

### Configuración de Conexión

**Archivo:** `backend/config/database.js`

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Opciones de conexión optimizadas
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Mantener hasta 10 conexiones socket
      serverSelectionTimeoutMS: 5000, // Mantener intentando enviar operaciones por 5 segundos
      socketTimeoutMS: 45000, // Cerrar sockets después de 45 segundos de inactividad
      family: 4, // Usar IPv4, omitir IPv6
      bufferMaxEntries: 0, // Deshabilitar mongoose buffering
      bufferCommands: false, // Deshabilitar mongoose buffering
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);

    // Eventos de conexión
    mongoose.connection.on("error", (err) => {
      console.error("❌ Error de MongoDB:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB desconectado");
    });

    // Manejo de cierre graceful
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log(
        "🔒 Conexión a MongoDB cerrada por terminación de la aplicación"
      );
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Inicialización en el Servidor

**Archivo:** `backend/server.js`

```javascript
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
});
```

## Autenticación de Usuarios

### Proceso de Registro de Usuarios

#### 1. Modelo de Usuario

**Archivo:** `backend/models/User.js`

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
      maxlength: [50, "El nombre no puede exceder 50 caracteres"],
    },
    email: {
      type: String,
      required: [true, "El email es requerido"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Por favor ingrese un email válido",
      ],
    },
    password: {
      type: String,
      required: [true, "La contraseña es requerida"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false, // No incluir en consultas por defecto
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: "Colombia" },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Encriptar contraseña antes de guardar
userSchema.pre("save", async function (next) {
  // Solo encriptar si la contraseña fue modificada
  if (!this.isModified("password")) return next();

  try {
    // Generar salt y encriptar
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener datos públicos del usuario
userSchema.methods.getPublicProfile = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model("User", userSchema);
```

#### 2. Ruta de Registro

**Archivo:** `backend/routes/auth.js`

```javascript
const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { generateToken } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/register
router.post(
  "/register",
  [
    // Validaciones
    body("name")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("El nombre debe tener entre 2 y 50 caracteres"),

    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Debe ser un email válido"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
      ),

    body("phone")
      .optional()
      .isMobilePhone("es-MX")
      .withMessage("Debe ser un número de teléfono válido"),
  ],
  async (req, res) => {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Datos de entrada inválidos",
          errors: errors.array(),
        });
      }

      const { name, email, password, phone, address } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un usuario con este email",
        });
      }

      // Crear nuevo usuario
      const user = new User({
        name,
        email,
        password, // Se encriptará automáticamente por el middleware pre('save')
        phone,
        address,
      });

      // Guardar usuario en la base de datos
      await user.save();

      // Generar token JWT
      const token = generateToken(user._id);

      // Respuesta exitosa (sin incluir la contraseña)
      res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
        data: {
          user: user.getPublicProfile(),
          token,
        },
      });
    } catch (error) {
      console.error("Error en registro:", error);

      // Manejar errores específicos de MongoDB
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un usuario con este email",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
);

module.exports = router;
```

#### 3. Frontend - Componente de Registro

**Archivo:** `frontend/src/components/Register.js`

```javascript
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const { register, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      errors.name = "El nombre es requerido";
    } else if (formData.name.length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres";
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = "El email es requerido";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Debe ser un email válido";
    }

    // Validar contraseña
    if (!formData.password) {
      errors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    // Validar confirmación de contraseña
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await register(formData);
      navigate("/"); // Redirigir al home después del registro exitoso
    } catch (err) {
      console.error("Error en registro:", err);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Crear Cuenta</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Información básica */}
          <div className="form-group">
            <label htmlFor="name">Nombre completo *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={validationErrors.name ? "error" : ""}
              required
            />
            {validationErrors.name && (
              <span className="error-text">{validationErrors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={validationErrors.email ? "error" : ""}
              required
            />
            {validationErrors.email && (
              <span className="error-text">{validationErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={validationErrors.password ? "error" : ""}
              required
            />
            {validationErrors.password && (
              <span className="error-text">{validationErrors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={validationErrors.confirmPassword ? "error" : ""}
              required
            />
            {validationErrors.confirmPassword && (
              <span className="error-text">
                {validationErrors.confirmPassword}
              </span>
            )}
          </div>

          {/* Información de contacto */}
          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Ej: +52 55 1234 5678"
            />
          </div>

          {/* Dirección */}
          <div className="address-section">
            <h3>Dirección (Opcional)</h3>

            <div className="form-group">
              <label htmlFor="address.street">Calle y número</label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address.city">Ciudad</label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address.state">Estado</label>
                <input
                  type="text"
                  id="address.state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address.zipCode">Código postal</label>
                <input
                  type="text"
                  id="address.zipCode"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Registrando..." : "Crear Cuenta"}
          </button>
        </form>

        <div className="login-link">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
```

#### 4. Flujo de Registro

1. **Validación Frontend**: El formulario valida los datos antes de enviarlos
2. **Envío de Datos**: Los datos se envían al endpoint `/api/auth/register`
3. **Validación Backend**: Express-validator verifica los datos
4. **Verificación de Usuario**: Se verifica que el email no esté registrado
5. **Encriptación**: La contraseña se encripta automáticamente con bcrypt
6. **Creación de Usuario**: Se guarda el usuario en MongoDB
7. **Generación de Token**: Se crea un JWT para autenticación
8. **Respuesta**: Se devuelve el usuario y token al frontend
9. **Redirección**: El usuario es redirigido a la página principal

#### 5. Manejo de Errores

- **Validación de entrada**: Campos requeridos, formato de email, longitud de contraseña
- **Duplicados**: Verificación de email único
- **Errores de base de datos**: Manejo de errores de conexión y operaciones
- **Respuestas consistentes**: Formato estándar de respuestas de error

### Proceso de Inicio de Sesión

#### 1. Ruta de Login

**Archivo:** `backend/routes/auth.js`

```javascript
// POST /api/auth/login
router.post(
  "/login",
  [
    // Validaciones
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Debe ser un email válido"),

    body("password").notEmpty().withMessage("La contraseña es requerida"),
  ],
  async (req, res) => {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Datos de entrada inválidos",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Buscar usuario por email (incluir password para comparación)
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas",
        });
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Cuenta desactivada. Contacte al administrador",
        });
      }

      // Comparar contraseña
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas",
        });
      }

      // Actualizar último login
      user.lastLogin = new Date();
      await user.save();

      // Generar tokens
      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Respuesta exitosa
      res.json({
        success: true,
        message: "Inicio de sesión exitoso",
        data: {
          user: user.getPublicProfile(),
          token,
          refreshToken,
        },
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
);
```

#### 2. Middleware de Autenticación

**Archivo:** `backend/middleware/auth.js`

```javascript
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
    issuer: "tienda-online",
    audience: "tienda-online-users",
  });
};

// Generar refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: "refresh" }, process.env.JWT_SECRET, {
    expiresIn: "30d",
    issuer: "tienda-online",
    audience: "tienda-online-users",
  });
};

// Middleware para autenticar token
const authenticateToken = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token de acceso requerido",
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token inválido - usuario no encontrado",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Cuenta desactivada",
      });
    }

    // Agregar usuario a la request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    console.error("Error en autenticación:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

// Middleware para verificar rol de administrador
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado. Se requieren permisos de administrador",
    });
  }
  next();
};

// Middleware de autenticación opcional
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // En autenticación opcional, continuamos sin usuario
    next();
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  authenticateToken,
  requireAdmin,
  optionalAuth,
};
```

#### 3. Frontend - Componente de Login

**Archivo:** `frontend/src/components/Login.js`

```javascript
import React, { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";

const Login = () => {
  const { login, isAuthenticated, loading, error, clearError } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !loading && !hasRedirected.current) {
      hasRedirected.current = true;
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location]);

  // Limpiar errores cuando el componente se monta
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Limpiar error específico cuando el usuario empieza a escribir
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = "El email es requerido";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Debe ser un email válido";
    }

    // Validar contraseña
    if (!formData.password) {
      errors.password = "La contraseña es requerida";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await login(formData.email, formData.password);
      // La redirección se maneja en el useEffect
    } catch (err) {
      console.error("Error en login:", err);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Iniciar Sesión</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={validationErrors.email ? "error" : ""}
              placeholder="Ingrese su email"
              autoComplete="email"
              required
            />
            {validationErrors.email && (
              <span className="error-text">{validationErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={validationErrors.password ? "error" : ""}
              placeholder="Ingrese su contraseña"
              autoComplete="current-password"
              required
            />
            {validationErrors.password && (
              <span className="error-text">{validationErrors.password}</span>
            )}
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe">Recordarme</label>
            </div>

            <button
              type="button"
              className="forgot-password-link"
              onClick={handleForgotPassword}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="register-link">
          <p>
            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
          </p>
        </div>

        {/* Opciones adicionales */}
        <div className="social-login">
          <div className="divider">
            <span>O continúa con</span>
          </div>

          {/* Aquí se pueden agregar botones de login social */}
          <div className="social-buttons">
            <button className="google-login" disabled>
              <i className="fab fa-google"></i>
              Google (Próximamente)
            </button>
            <button className="facebook-login" disabled>
              <i className="fab fa-facebook-f"></i>
              Facebook (Próximamente)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

#### 4. Context de Autenticación - Función Login

**Archivo:** `frontend/src/context/AuthContext.js`

```javascript
// Función login en AuthContext
const login = useCallback(async (email, password) => {
  dispatch({ type: AUTH_ACTIONS.LOGIN_START });

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error en el inicio de sesión");
    }

    // Guardar token en localStorage
    localStorage.setItem("token", data.data.token);
    if (data.data.refreshToken) {
      localStorage.setItem("refreshToken", data.data.refreshToken);
    }

    // Actualizar estado
    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: {
        user: data.data.user,
        token: data.data.token,
      },
    });

    return data;
  } catch (error) {
    dispatch({
      type: AUTH_ACTIONS.LOGIN_FAILURE,
      payload: error.message,
    });
    throw error;
  }
}, []);
```

#### 5. Rutas Protegidas

**Archivo:** `frontend/src/components/ProtectedRoute.js`

```javascript
import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar permisos de administrador si es requerido
  if (requireAdmin && user?.role !== "admin") {
    return (
      <div className="access-denied">
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta página.</p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
```

#### 6. Flujo de Inicio de Sesión

1. **Validación Frontend**: El formulario valida email y contraseña
2. **Envío de Credenciales**: Se envían al endpoint `/api/auth/login`
3. **Validación Backend**: Express-validator verifica el formato
4. **Búsqueda de Usuario**: Se busca el usuario por email
5. **Verificación de Estado**: Se verifica que la cuenta esté activa
6. **Comparación de Contraseña**: Se compara con bcrypt
7. **Actualización de Login**: Se actualiza `lastLogin`
8. **Generación de Tokens**: Se crean JWT y refresh token
9. **Respuesta**: Se devuelven usuario y tokens
10. **Almacenamiento**: Tokens se guardan en localStorage
11. **Redirección**: Usuario es redirigido a la página solicitada

#### 7. Manejo de Sesiones

- **Persistencia**: Tokens almacenados en localStorage
- **Expiración**: JWT expira en 7 días, refresh token en 30 días
- **Renovación**: Sistema de refresh tokens para renovar sesiones
- **Logout**: Limpieza de tokens y estado de autenticación
- **Rutas Protegidas**: Verificación automática de autenticación

#### 8. Seguridad

- **Encriptación**: Contraseñas hasheadas con bcrypt (salt 12)
- **JWT Seguro**: Tokens firmados con secret fuerte
- **Validación**: Verificación de formato y existencia de datos
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **HTTPS**: Comunicación encriptada en producción

## Esquemas de Datos

### 👤 Usuario (User)

Almacena información de los usuarios del sistema.

**Colección:** `users`

**Esquema:**

```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email inválido']
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
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Índices:**

- `email` (único)
- `role`
- `createdAt`

**Middleware:**

- Pre-save: Hash de contraseña con bcryptjs
- Pre-save: Actualización de `updatedAt`

**Métodos del modelo:**

- `comparePassword(candidatePassword)` - Comparar contraseña
- `toJSON()` - Excluir campos sensibles en respuestas

**Ejemplo de documento:**

```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "role": "user",
  "isActive": true,
  "createdAt": "2023-09-06T10:30:00.000Z",
  "updatedAt": "2023-09-06T10:30:00.000Z"
}
```

### 📦 Producto (Product)

Almacena información de los productos del catálogo.

**Colección:** `products`

**Esquema:**

```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys']
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  images: [{
    type: String,
    validate: [validator.isURL, 'URL de imagen inválida']
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Índices:**

- `name` (texto)
- `category`
- `price`
- `rating`
- `createdAt`
- Índice de texto completo en `name` y `description`

**Middleware:**

- Pre-save: Actualización de `updatedAt`
- Pre-save: Cálculo automático de rating promedio

**Métodos del modelo:**

- `addReview(userId, reviewData)` - Agregar reseña
- `updateRating()` - Recalcular rating promedio

**Ejemplo de documento:**

```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
  "name": "Smartphone XYZ Pro",
  "description": "Smartphone de última generación con cámara de 108MP y 5G",
  "price": 599.99,
  "category": "electronics",
  "stock": 50,
  "images": [
    "https://example.com/images/phone1.jpg",
    "https://example.com/images/phone2.jpg"
  ],
  "rating": 4.5,
  "numReviews": 23,
  "reviews": [
    {
      "user": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Juan Pérez",
      "rating": 5,
      "comment": "Excelente producto, muy recomendado",
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  ],
  "isActive": true,
  "createdAt": "2023-09-06T10:30:00.000Z",
  "updatedAt": "2023-09-06T10:30:00.000Z"
}
```

### 🛒 Pedido (Order)

Almacena información de los pedidos realizados por los usuarios.

**Colección:** `orders`

**Esquema:**

```javascript
{
  _id: ObjectId,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    image: String
  }],
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'Colombia'
    }
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'],
    default: 'cash_on_delivery'
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date,
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Índices:**

- `user`
- `status`
- `createdAt`
- `isPaid`
- `isDelivered`

**Middleware:**

- Pre-save: Actualización de `updatedAt`
- Pre-save: Cálculo automático de precios totales

**Métodos del modelo:**

- `calculatePrices()` - Calcular precios totales
- `markAsPaid(paymentResult)` - Marcar como pagado
- `markAsDelivered()` - Marcar como entregado

**Ejemplo de documento:**

```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
  "user": "64f8a1b2c3d4e5f6a7b8c9d0",
  "items": [
    {
      "product": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "Smartphone XYZ Pro",
      "quantity": 1,
      "price": 599.99,
      "image": "https://example.com/images/phone1.jpg"
    }
  ],
  "shippingAddress": {
    "street": "Calle Principal 123",
    "city": "Bogotá",
    "state": "CDMX",
    "zipCode": "01000",
    "country": "Colombia"
  },
  "paymentMethod": "cash_on_delivery",
  "itemsPrice": 599.99,
  "taxPrice": 95.99,
  "shippingPrice": 50.0,
  "totalPrice": 745.98,
  "isPaid": false,
  "isDelivered": false,
  "status": "pending",
  "createdAt": "2023-09-06T10:30:00.000Z",
  "updatedAt": "2023-09-06T10:30:00.000Z"
}
```

## Relaciones entre Colecciones

### Relaciones Implementadas

1. **User → Orders** (1:N)

   - Un usuario puede tener múltiples pedidos
   - Campo `user` en Order referencia `_id` de User

2. **Product → Order Items** (1:N)

   - Un producto puede estar en múltiples pedidos
   - Campo `product` en Order.items referencia `_id` de Product

3. **User → Product Reviews** (1:N)
   - Un usuario puede escribir múltiples reseñas
   - Campo `user` en Product.reviews referencia `_id` de User

### Consultas con Population

```javascript
// Obtener pedido con información del usuario y productos
Order.findById(orderId)
  .populate("user", "name email")
  .populate("items.product", "name price images");

// Obtener productos con reseñas y información de usuarios
Product.find().populate("reviews.user", "name");
```

## Configuración de Base de Datos

### Conexión

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
```

### Variables de Entorno

```env
MONGODB_URI=mongodb://localhost:27017/fashionista
# O para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
```

## Optimizaciones

### Índices Implementados

1. **Usuarios:**

   - Índice único en `email`
   - Índice en `role` para consultas de admin
   - Índice en `createdAt` para ordenamiento

2. **Productos:**

   - Índice de texto completo en `name` y `description`
   - Índice compuesto en `category` y `price`
   - Índice en `rating` para ordenamiento
   - Índice en `createdAt` para productos recientes

3. **Pedidos:**
   - Índice en `user` para consultas por usuario
   - Índice compuesto en `status` y `createdAt`
   - Índice en `isPaid` y `isDelivered` para filtros

### Estrategias de Consulta

1. **Paginación eficiente:**

```javascript
const products = await Product.find(query)
  .sort(sortOptions)
  .skip((page - 1) * limit)
  .limit(limit);
```

2. **Búsqueda de texto:**

```javascript
const products = await Product.find(
  {
    $text: { $search: searchTerm },
  },
  {
    score: { $meta: "textScore" },
  }
).sort({ score: { $meta: "textScore" } });
```

3. **Agregaciones para estadísticas:**

```javascript
const stats = await Order.aggregate([
  { $match: { status: "delivered" } },
  {
    $group: {
      _id: null,
      totalSales: { $sum: "$totalPrice" },
      averageOrder: { $avg: "$totalPrice" },
      totalOrders: { $sum: 1 },
    },
  },
]);
```

## Backup y Mantenimiento

### Backup Automático

```bash
# Backup diario
mongodump --uri="mongodb://localhost:27017/fashionista" --out="/backup/$(date +%Y%m%d)"

# Restauración
mongorestore --uri="mongodb://localhost:27017/fashionista" /backup/20230906/ecommerce
```

### Limpieza de Datos

```javascript
// Eliminar productos inactivos antiguos
await Product.deleteMany({
  isActive: false,
  updatedAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
});

// Limpiar carritos abandonados (si se implementa)
await Cart.deleteMany({
  updatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
});
```

## Consideraciones de Seguridad

1. **Validación de datos** - Mongoose schemas con validaciones
2. **Sanitización** - Prevención de inyección NoSQL
3. **Índices únicos** - Prevención de duplicados
4. **Campos sensibles** - Password con `select: false`
5. **Soft deletes** - Usar `isActive` en lugar de eliminar

## Escalabilidad

### Estrategias Futuras

1. **Sharding** - Distribución horizontal por `user_id`
2. **Read Replicas** - Para consultas de solo lectura
3. **Caching** - Redis para consultas frecuentes
4. **Archivado** - Mover pedidos antiguos a colección separada
