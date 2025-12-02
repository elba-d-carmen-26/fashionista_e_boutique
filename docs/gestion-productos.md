# Gestión de Productos - Métodos de Adición

## 📋 Índice

1. [Introducción](#introducción)
2. [Roles y Niveles de Acceso](#roles-y-niveles-de-acceso)
3. [Métodos Disponibles](#métodos-disponibles)
4. [Método 1: Interfaz Web de Administración](#método-1-interfaz-web-de-administración)
5. [Método 2: API REST Directa](#método-2-api-rest-directa)
6. [Método 3: Carga Masiva con Scripts](#método-3-carga-masiva-con-scripts)
7. [Método 4: Importación desde Archivo](#método-4-importación-desde-archivo)
8. [Estructura de Datos del Producto](#estructura-de-datos-del-producto)
9. [Validaciones y Restricciones](#validaciones-y-restricciones)
10. [Ejemplos Prácticos](#ejemplos-prácticos)
11. [Troubleshooting](#troubleshooting)
12. [Mejores Prácticas](#mejores-prácticas)

---

## 🎯 Introducción

Este documento describe los diferentes métodos disponibles para agregar productos al catálogo del sistema de e-commerce. Cada método está diseñado para diferentes casos de uso y niveles de acceso, desde la gestión individual hasta la importación masiva de productos.

### Características del Sistema de Productos

- **Gestión completa de inventario** con control de stock
- **Sistema de categorías y subcategorías** para organización
- **Soporte para múltiples imágenes** por producto
- **Sistema de reseñas y calificaciones** integrado
- **Gestión de descuentos y precios** flexibles
- **Etiquetas y características** personalizables
- **Control de estado** (activo/inactivo, destacado)

---

## 🔐 Roles y Niveles de Acceso

### 👑 Administrador (Admin)
- **Acceso completo** a todos los métodos de gestión
- Puede **crear, editar, eliminar** productos
- Acceso a **panel de administración web**
- Capacidad de **importación masiva**
- Gestión de **categorías y configuraciones**

#### 🔑 Usuario Administrador Predefinido
El sistema incluye un usuario administrador preconfigurado:

```
📧 Email: elba1@admin.com
👤 Nombre: Elba Administrador
🔑 Contraseña: Elba123!
🌐 URL de acceso: http://localhost:3000/login
```

> **⚠️ IMPORTANTE**: 
> - Cambia la contraseña después del primer login por seguridad
> - Este usuario tiene acceso completo al sistema
> - Se puede crear usando el script `backend/scripts/createAdmin.js`

#### 🛠️ Creación de Nuevos Administradores
Para crear administradores adicionales:

1. **Método Script**:
   ```bash
   cd backend
   node scripts/createAdmin.js
   ```

2. **Método Manual** (modificando el script):
   - Editar `backend/scripts/createAdmin.js`
   - Cambiar email, nombre y contraseña
   - Ejecutar el script

### 👤 Usuario Regular
- **Solo lectura** del catálogo de productos
- Puede **agregar reseñas** a productos comprados
- **No puede crear** nuevos productos
- Acceso limitado a **información pública**

### Sistema/API
- Acceso programático con **autenticación JWT**
- Requiere **token de administrador** para operaciones de escritura
- Soporte para **integración con sistemas externos**

---

## 📊 Métodos Disponibles

| Método | Nivel de Acceso | Casos de Uso | Complejidad |
|--------|----------------|--------------|-------------|
| **Interfaz Web** | Admin | Gestión individual, edición rápida | Baja |
| **API REST** | Admin + Token | Integración sistemas, automatización | Media |
| **Scripts de Carga** | Admin + Servidor | Importación masiva, migración | Alta |
| **Importación CSV** | Admin | Carga masiva desde archivos | Media |

---

## 🖥️ Método 1: Interfaz Web de Administración

### Descripción
Panel de administración web intuitivo para gestión individual de productos.

### Acceso
1. Iniciar sesión como **administrador**
2. Navegar a `/admin`
3. Seleccionar pestaña **"Productos"**
4. Hacer clic en **"Nuevo Producto"**

### Características
- ✅ **Interfaz visual** fácil de usar
- ✅ **Validación en tiempo real** de campos
- ✅ **Vista previa** de productos
- ✅ **Gestión de imágenes** integrada
- ✅ **Edición y eliminación** directa

### Proceso Paso a Paso

#### 1. Acceder al Panel
```
URL: http://localhost:3000/admin
Requisitos: Usuario con rol 'admin'
```

#### 2. Completar Formulario
- **Nombre del Producto** (requerido, máx. 100 caracteres)
- **Descripción** (requerido, máx. 2000 caracteres)
- **Precio** (requerido, número positivo)
- **Categoría** (seleccionar de lista predefinida)
- **Stock** (requerido, número entero positivo)
- **Imágenes** (URLs de imágenes)

#### 3. Campos Opcionales Avanzados
- **Precio Original** (para mostrar descuentos)
- **Subcategoría**
- **Marca**
- **SKU** (código único)
- **Peso y Dimensiones**
- **Etiquetas**
- **Características** (pares nombre-valor)

#### 4. Configuraciones Especiales
- **Producto Destacado** (checkbox)
- **Estado Activo** (por defecto: activo)

### Ventajas
- **Sin conocimientos técnicos** requeridos
- **Validación inmediata** de errores
- **Interfaz responsive** para móviles
- **Gestión visual** de productos

### Limitaciones
- **Un producto a la vez**
- **Requiere conexión web** constante
- **No apto para importación masiva**

---

## 🔌 Método 2: API REST Directa

### Descripción
Endpoint HTTP para creación programática de productos.

### Endpoint
```http
POST /api/products
Content-Type: application/json
Authorization: Bearer {admin_jwt_token}
```

### Autenticación Requerida
```javascript
// Headers necesarios
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

### Estructura de Request
```json
{
  "name": "iPhone 15 Pro",
  "description": "El iPhone más avanzado con chip A17 Pro",
  "price": 999,
  "originalPrice": 1199,
  "discount": 17,
  "category": "electronics",
  "subcategory": "smartphones",
  "brand": "Apple",
  "stock": 50,
  "sku": "IPHONE15PRO001",
  "weight": 0.187,
  "dimensions": {
    "length": 14.67,
    "width": 7.08,
    "height": 0.83
  },
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "alt": "iPhone 15 Pro frontal",
      "isPrimary": true
    }
  ],
  "tags": ["smartphone", "apple", "premium"],
  "features": [
    {
      "name": "Pantalla",
      "value": "6.1 pulgadas Super Retina XDR"
    }
  ],
  "isFeatured": true
}
```

### Respuesta Exitosa
```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "iPhone 15 Pro",
    "price": 999,
    "stock": 50,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Ejemplo con cURL
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Producto de Prueba",
    "description": "Descripción del producto",
    "price": 99.99,
    "category": "electronics",
    "stock": 10
  }'
```

### Ejemplo con JavaScript/Axios
```javascript
const axios = require('axios');

const createProduct = async (productData, adminToken) => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/products',
      productData,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Producto creado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
};

// Uso
const newProduct = {
  name: "Laptop Gaming",
  description: "Laptop para gaming de alta gama",
  price: 1299,
  category: "electronics",
  stock: 15
};

createProduct(newProduct, 'your-admin-token-here');
```

### Ventajas
- **Integración directa** con sistemas externos
- **Automatización** de procesos
- **Validación robusta** del servidor
- **Respuesta inmediata** con confirmación

### Limitaciones
- **Requiere conocimientos técnicos**
- **Gestión manual** de autenticación
- **Un producto por request**

---

## 📦 Método 3: Carga Masiva con Scripts

### Descripción
Script de Node.js para importación masiva de productos desde código.

### Ubicación del Script
```
backend/scripts/seedProducts.js
```

### Ejecución
```bash
# Desde el directorio backend
cd backend
npm run seed-products

# O directamente con Node
node scripts/seedProducts.js
```

### Estructura del Script
```javascript
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Array de productos para importar
const sampleProducts = [
  {
    name: "iPhone 15 Pro",
    description: "El iPhone más avanzado...",
    price: 999,
    category: "electronics",
    stock: 50,
    // ... más campos
  },
  {
    name: "MacBook Air M2",
    description: "MacBook Air con chip M2...",
    price: 1199,
    category: "electronics",
    stock: 25,
    // ... más campos
  }
  // ... más productos
];

async function seedProducts() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Limpiar productos existentes (opcional)
    await Product.deleteMany({});
    
    // Insertar nuevos productos
    const createdProducts = await Product.insertMany(sampleProducts);
    
    console.log(`✅ ${createdProducts.length} productos creados`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();
```

### Personalización del Script

#### 1. Agregar Nuevos Productos
```javascript
// Agregar al array sampleProducts
const newProduct = {
  name: "Nuevo Producto",
  description: "Descripción detallada",
  price: 199.99,
  category: "electronics",
  subcategory: "accessories",
  brand: "MiMarca",
  stock: 100,
  images: [
    {
      url: "https://example.com/image.jpg",
      alt: "Imagen del producto",
      isPrimary: true
    }
  ],
  tags: ["nuevo", "popular"],
  features: [
    { name: "Color", value: "Negro" },
    { name: "Material", value: "Plástico" }
  ],
  isFeatured: true
};

sampleProducts.push(newProduct);
```

#### 2. Importar desde Archivo JSON
```javascript
const fs = require('fs');

// Leer productos desde archivo JSON
const productsFromFile = JSON.parse(
  fs.readFileSync('./data/products.json', 'utf8')
);

// Combinar con productos existentes
const allProducts = [...sampleProducts, ...productsFromFile];
```

#### 3. Validación Antes de Insertar
```javascript
const validateProduct = (product) => {
  const required = ['name', 'description', 'price', 'category', 'stock'];
  
  for (const field of required) {
    if (!product[field]) {
      throw new Error(`Campo requerido faltante: ${field}`);
    }
  }
  
  if (product.price <= 0) {
    throw new Error('El precio debe ser positivo');
  }
  
  return true;
};

// Validar todos los productos antes de insertar
sampleProducts.forEach((product, index) => {
  try {
    validateProduct(product);
  } catch (error) {
    console.error(`Error en producto ${index + 1}:`, error.message);
  }
});
```

### Ventajas
- **Importación masiva** eficiente
- **Control total** sobre los datos
- **Validación personalizada**
- **Reutilizable** y versionable

### Limitaciones
- **Requiere acceso al servidor**
- **Conocimientos de Node.js** necesarios
- **Riesgo de sobrescribir** datos existentes

---

## 📄 Método 4: Importación desde Archivo

### Descripción
Sistema para importar productos desde archivos CSV o JSON.

### Formatos Soportados
- **CSV** (Comma Separated Values)
- **JSON** (JavaScript Object Notation)
- **Excel** (con conversión previa)

### Estructura CSV Requerida
```csv
name,description,price,category,stock,brand,sku
"iPhone 15 Pro","Smartphone avanzado",999,"electronics",50,"Apple","IP15P001"
"MacBook Air","Laptop ultradelgada",1199,"electronics",25,"Apple","MBA001"
"Camiseta Básica","Camiseta de algodón",25,"clothing",200,"BasicWear","CB001"
```

### Script de Importación CSV
```javascript
const fs = require('fs');
const csv = require('csv-parser');
const Product = require('../models/Product');

async function importFromCSV(filePath) {
  const products = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Transformar datos del CSV
        const product = {
          name: row.name,
          description: row.description,
          price: parseFloat(row.price),
          category: row.category,
          stock: parseInt(row.stock),
          brand: row.brand || '',
          sku: row.sku || ''
        };
        
        products.push(product);
      })
      .on('end', async () => {
        try {
          const result = await Product.insertMany(products);
          console.log(`✅ ${result.length} productos importados desde CSV`);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

// Uso
importFromCSV('./data/productos.csv')
  .then(result => console.log('Importación completada'))
  .catch(error => console.error('Error en importación:', error));
```

### Estructura JSON Requerida
```json
{
  "products": [
    {
      "name": "iPhone 15 Pro",
      "description": "Smartphone avanzado con chip A17 Pro",
      "price": 999,
      "category": "electronics",
      "subcategory": "smartphones",
      "brand": "Apple",
      "stock": 50,
      "images": [
        {
          "url": "https://example.com/iphone15.jpg",
          "alt": "iPhone 15 Pro",
          "isPrimary": true
        }
      ],
      "tags": ["smartphone", "apple", "premium"],
      "features": [
        {
          "name": "Pantalla",
          "value": "6.1 pulgadas"
        }
      ]
    }
  ]
}
```

### Script de Importación JSON
```javascript
const fs = require('fs');
const Product = require('../models/Product');

async function importFromJSON(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const products = data.products || data;
    
    const result = await Product.insertMany(products);
    console.log(`✅ ${result.length} productos importados desde JSON`);
    
    return result;
  } catch (error) {
    console.error('❌ Error importando JSON:', error);
    throw error;
  }
}

// Uso
importFromJSON('./data/productos.json');
```

### Validación de Archivos
```javascript
const validateImportFile = (products) => {
  const errors = [];
  
  products.forEach((product, index) => {
    // Validar campos requeridos
    if (!product.name) {
      errors.push(`Línea ${index + 1}: Nombre requerido`);
    }
    
    if (!product.price || product.price <= 0) {
      errors.push(`Línea ${index + 1}: Precio inválido`);
    }
    
    if (!product.category) {
      errors.push(`Línea ${index + 1}: Categoría requerida`);
    }
    
    // Validar categorías permitidas
    const validCategories = [
      'electronics', 'clothing', 'books', 
      'home', 'sports', 'beauty', 'toys', 'other'
    ];
    
    if (product.category && !validCategories.includes(product.category)) {
      errors.push(`Línea ${index + 1}: Categoría inválida`);
    }
  });
  
  return errors;
};
```

### Ventajas
- **Importación masiva** desde hojas de cálculo
- **Formato familiar** para usuarios no técnicos
- **Validación previa** de datos
- **Procesamiento por lotes**

### Limitaciones
- **Formato específico** requerido
- **Validación manual** necesaria
- **Gestión de errores** compleja

---

## 🏗️ Estructura de Datos del Producto

### Campos Requeridos
```javascript
{
  name: String,        // Nombre del producto (máx. 100 caracteres)
  description: String, // Descripción (máx. 2000 caracteres)
  price: Number,       // Precio (positivo)
  category: String,    // Categoría (enum predefinido)
  stock: Number        // Stock disponible (entero positivo)
}
```

### Campos Opcionales
```javascript
{
  originalPrice: Number,     // Precio original (para descuentos)
  discount: Number,          // Porcentaje de descuento (0-100)
  subcategory: String,       // Subcategoría
  brand: String,             // Marca del producto
  sku: String,               // Código único del producto
  weight: Number,            // Peso en kg
  dimensions: {              // Dimensiones en cm
    length: Number,
    width: Number,
    height: Number
  },
  images: [{                 // Array de imágenes
    url: String,             // URL de la imagen
    alt: String,             // Texto alternativo
    isPrimary: Boolean       // Imagen principal
  }],
  tags: [String],            // Etiquetas para búsqueda
  features: [{               // Características del producto
    name: String,            // Nombre de la característica
    value: String            // Valor de la característica
  }],
  isActive: Boolean,         // Estado activo (default: true)
  isFeatured: Boolean,       // Producto destacado (default: false)
  salesCount: Number         // Contador de ventas (default: 0)
}
```

### Categorías Válidas
```javascript
const validCategories = [
  'electronics',    // Electrónicos
  'clothing',       // Ropa y accesorios
  'books',          // Libros
  'home',           // Hogar y jardín
  'sports',         // Deportes
  'beauty',         // Belleza y cuidado personal
  'toys',           // Juguetes
  'other'           // Otros
];
```

---

## ✅ Validaciones y Restricciones

### Validaciones del Backend
```javascript
// Validaciones automáticas del modelo
{
  name: {
    required: true,
    maxlength: 100,
    trim: true
  },
  description: {
    required: true,
    maxlength: 2000
  },
  price: {
    required: true,
    min: 0
  },
  stock: {
    required: true,
    min: 0
  },
  category: {
    required: true,
    enum: ['electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys', 'other']
  }
}
```

### Validaciones de la API
```javascript
// Middleware de validación con express-validator
[
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre es requerido y no puede exceder 100 caracteres'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('La descripción es requerida y no puede exceder 2000 caracteres'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  
  body('category')
    .isIn(['electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys', 'other'])
    .withMessage('Categoría inválida'),
  
  body('stock')
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero positivo')
]
```

### Restricciones de Seguridad
- **Autenticación JWT** requerida para crear productos
- **Rol de administrador** obligatorio
- **Sanitización** de inputs para prevenir XSS
- **Validación de URLs** de imágenes
- **Límites de tamaño** para campos de texto

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Producto Electrónico Completo
```json
{
  "name": "Samsung Galaxy S24 Ultra",
  "description": "El smartphone más potente de Samsung con S Pen integrado, cámara de 200MP y pantalla Dynamic AMOLED 2X de 6.8 pulgadas.",
  "price": 1199,
  "originalPrice": 1299,
  "discount": 8,
  "category": "electronics",
  "subcategory": "smartphones",
  "brand": "Samsung",
  "stock": 35,
  "sku": "GALAXYS24ULTRA001",
  "weight": 0.232,
  "dimensions": {
    "length": 16.27,
    "width": 7.91,
    "height": 0.89
  },
  "images": [
    {
      "url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500",
      "alt": "Samsung Galaxy S24 Ultra frontal",
      "isPrimary": true
    },
    {
      "url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&angle=back",
      "alt": "Samsung Galaxy S24 Ultra trasera",
      "isPrimary": false
    }
  ],
  "tags": ["smartphone", "samsung", "s-pen", "android", "5g"],
  "features": [
    {
      "name": "Pantalla",
      "value": "6.8 pulgadas Dynamic AMOLED 2X"
    },
    {
      "name": "Procesador",
      "value": "Snapdragon 8 Gen 3"
    },
    {
      "name": "Cámara Principal",
      "value": "200MP con zoom óptico 10x"
    },
    {
      "name": "S Pen",
      "value": "Incluido con latencia ultra baja"
    },
    {
      "name": "Batería",
      "value": "5000mAh con carga rápida 45W"
    }
  ],
  "isFeatured": true
}
```

### Ejemplo 2: Producto de Ropa Básico
```json
{
  "name": "Camiseta Básica Premium",
  "description": "Camiseta de algodón 100% orgánico, corte regular y disponible en múltiples colores. Perfecta para uso diario.",
  "price": 25,
  "originalPrice": 35,
  "discount": 29,
  "category": "clothing",
  "subcategory": "shirts",
  "brand": "BasicWear",
  "stock": 200,
  "sku": "BASICSHIRT001",
  "weight": 0.15,
  "images": [
    {
      "url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
      "alt": "Camiseta Básica Premium",
      "isPrimary": true
    }
  ],
  "tags": ["shirt", "cotton", "basic", "organic", "unisex"],
  "features": [
    {
      "name": "Material",
      "value": "100% Algodón orgánico"
    },
    {
      "name": "Corte",
      "value": "Regular fit"
    },
    {
      "name": "Cuidado",
      "value": "Lavable en máquina a 30°C"
    },
    {
      "name": "Certificación",
      "value": "GOTS (Global Organic Textile Standard)"
    }
  ],
  "isFeatured": false
}
```

### Ejemplo 3: Producto Mínimo Requerido
```json
{
  "name": "Producto de Prueba",
  "description": "Descripción básica del producto para testing",
  "price": 99.99,
  "category": "other",
  "stock": 10
}
```

---

## 🔧 Troubleshooting

### Errores Comunes y Soluciones

#### Error: "Token de autenticación inválido"
```
Problema: El token JWT no es válido o ha expirado
Solución: 
1. Verificar que el token sea de un usuario administrador
2. Generar un nuevo token si ha expirado
3. Verificar el formato del header Authorization
```

#### Error: "Categoría inválida"
```
Problema: La categoría no está en la lista de valores permitidos
Solución: Usar una de las categorías válidas:
- electronics, clothing, books, home, sports, beauty, toys, other
```

#### Error: "SKU duplicado"
```
Problema: El SKU ya existe en la base de datos
Solución: 
1. Usar un SKU único
2. Verificar productos existentes
3. Omitir el campo SKU para generación automática
```

#### Error: "Precio inválido"
```
Problema: El precio no es un número positivo
Solución: 
1. Verificar que el precio sea mayor a 0
2. Usar formato numérico, no string
3. Verificar decimales con punto, no coma
```

#### Error: "Stock insuficiente"
```
Problema: El stock no es un número entero positivo
Solución: 
1. Usar números enteros (0, 1, 2, ...)
2. No usar números negativos
3. Verificar tipo de dato numérico
```

### Validación de Datos Antes del Envío
```javascript
const validateProductData = (product) => {
  const errors = [];
  
  // Validar campos requeridos
  if (!product.name || product.name.trim().length === 0) {
    errors.push('Nombre es requerido');
  }
  
  if (!product.description || product.description.trim().length === 0) {
    errors.push('Descripción es requerida');
  }
  
  if (!product.price || product.price <= 0) {
    errors.push('Precio debe ser positivo');
  }
  
  if (!product.category) {
    errors.push('Categoría es requerida');
  }
  
  if (product.stock === undefined || product.stock < 0) {
    errors.push('Stock debe ser un número positivo');
  }
  
  // Validar longitud de campos
  if (product.name && product.name.length > 100) {
    errors.push('Nombre no puede exceder 100 caracteres');
  }
  
  if (product.description && product.description.length > 2000) {
    errors.push('Descripción no puede exceder 2000 caracteres');
  }
  
  return errors;
};

// Uso
const errors = validateProductData(newProduct);
if (errors.length > 0) {
  console.error('Errores de validación:', errors);
} else {
  // Proceder con la creación del producto
}
```

---

## 🎯 Mejores Prácticas

### 1. Gestión de Imágenes
```javascript
// Usar URLs de imágenes optimizadas
const optimizedImages = [
  {
    url: "https://cdn.example.com/products/image_800x600.webp",
    alt: "Descripción detallada de la imagen",
    isPrimary: true
  }
];

// Múltiples tamaños para responsive design
const responsiveImages = [
  {
    url: "https://cdn.example.com/products/image_400x300.webp",
    alt: "Imagen thumbnail",
    size: "small"
  },
  {
    url: "https://cdn.example.com/products/image_800x600.webp",
    alt: "Imagen mediana",
    size: "medium"
  }
];
```

### 2. SEO y Búsqueda
```javascript
// Usar tags relevantes para mejorar búsqueda
const seoOptimizedProduct = {
  name: "iPhone 15 Pro 128GB Titanio Natural",
  description: "iPhone 15 Pro con chip A17 Pro, cámara de 48MP...",
  tags: [
    "iphone", "apple", "smartphone", "titanio", 
    "128gb", "a17-pro", "camara-48mp", "5g"
  ],
  features: [
    { name: "Modelo", value: "iPhone 15 Pro" },
    { name: "Almacenamiento", value: "128GB" },
    { name: "Color", value: "Titanio Natural" }
  ]
};
```

### 3. Gestión de Stock
```javascript
// Implementar alertas de stock bajo
const stockManagement = {
  stock: 5,
  minStock: 10,
  maxStock: 100,
  reorderPoint: 15,
  supplier: "Apple Inc.",
  leadTime: 7 // días
};

// Verificar stock antes de crear producto
if (stockManagement.stock < stockManagement.minStock) {
  console.warn('⚠️ Stock bajo, considerar reabastecimiento');
}
```

### 4. Versionado de Productos
```javascript
// Mantener historial de cambios
const productVersion = {
  version: "1.2",
  lastModified: new Date(),
  modifiedBy: "admin@example.com",
  changes: [
    "Actualización de precio",
    "Nuevas imágenes agregadas",
    "Descripción mejorada"
  ]
};
```

### 5. Categorización Efectiva
```javascript
// Estructura jerárquica de categorías
const categoryStructure = {
  electronics: {
    smartphones: ["apple", "samsung", "google"],
    laptops: ["gaming", "ultrabook", "workstation"],
    audio: ["headphones", "speakers", "earbuds"]
  },
  clothing: {
    shirts: ["casual", "formal", "sports"],
    pants: ["jeans", "chinos", "shorts"],
    shoes: ["sneakers", "boots", "sandals"]
  }
};
```

### 6. Automatización de Procesos
```javascript
// Script para actualización masiva de precios
const updatePricesWithDiscount = async (category, discountPercent) => {
  try {
    const products = await Product.find({ category });
    
    for (const product of products) {
      const originalPrice = product.price;
      const discountedPrice = originalPrice * (1 - discountPercent / 100);
      
      await Product.findByIdAndUpdate(product._id, {
        originalPrice: originalPrice,
        price: discountedPrice,
        discount: discountPercent
      });
    }
    
    console.log(`✅ Precios actualizados para ${products.length} productos`);
  } catch (error) {
    console.error('❌ Error actualizando precios:', error);
  }
};

// Aplicar descuento del 20% a todos los electrónicos
updatePricesWithDiscount('electronics', 20);
```

---

## 📞 Soporte y Recursos Adicionales

### Documentación Relacionada
- [API Documentation](./api.md) - Documentación completa de la API
- [Database Schema](./base-de-datos.md) - Esquema de base de datos
- [Frontend Components](./frontend.md) - Componentes del frontend

### Contacto para Soporte Técnico
- **Email**: soporte@ecommerce.com
- **Documentación**: `/docs`
- **Issues**: GitHub Issues del proyecto

### Recursos de Desarrollo
- **Postman Collection**: Colección de endpoints para testing
- **Swagger UI**: Interfaz interactiva de la API
- **Database Seeder**: Scripts de datos de prueba

---

*Última actualización: Enero 2024*
*Versión del documento: 1.0*