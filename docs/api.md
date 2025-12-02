# 📚 Documentación de la API

## 🌐 Base URL
```
http://localhost:5000/api
```

## 🔐 Autenticación

La API utiliza **JWT (JSON Web Tokens)** para autenticación. Para endpoints protegidos, incluir el token en el header:

```http
Authorization: Bearer <token>
```

### Estados de Autenticación
- 🟢 **Public**: No requiere autenticación
- 🔒 **Private**: Requiere token JWT válido
- 👑 **Admin**: Requiere token JWT y rol de administrador

---

## 📋 Endpoints

### 🔐 Autenticación (`/auth`)

#### POST `/auth/register`
**Descripción**: Registrar un nuevo usuario  
**Acceso**: 🟢 Public

**Request Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Password123"
}
```

**Validaciones:**
- `name`: Requerido, 2-50 caracteres
- `email`: Requerido, formato válido, único
- `password`: Requerido, mínimo 6 caracteres, debe contener al menos una mayúscula, una minúscula y un número

**Response (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "user",
      "avatar": "",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Errores:**
- `400`: Email ya registrado o datos inválidos
- `500`: Error interno del servidor

---

#### POST `/auth/login`
**Descripción**: Iniciar sesión  
**Acceso**: 🟢 Public

**Request Body:**
```json
{
  "email": "juan@example.com",
  "password": "Password123"
}
```

**Validaciones:**
- `email`: Requerido, formato válido
- `password`: Requerido

**Response (200):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "user",
      "avatar": "",
      "lastLogin": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Errores:**
- `400`: Datos inválidos
- `401`: Credenciales incorrectas o cuenta desactivada
- `500`: Error interno del servidor

---

#### GET `/auth/profile`
**Descripción**: Obtener perfil del usuario autenticado  
**Acceso**: 🔒 Private

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "user",
      "avatar": "",
      "phone": "+1234567890",
      "address": {
        "street": "123 Main St",
        "city": "Ciudad",
        "state": "Estado",
        "zipCode": "12345",
        "country": "País"
      },
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "lastLogin": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

#### PUT `/auth/profile`
**Descripción**: Actualizar perfil del usuario  
**Acceso**: 🔒 Private

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Juan Carlos Pérez",
  "phone": "+1234567890",
  "address": {
    "street": "456 New St",
    "city": "Nueva Ciudad",
    "state": "Nuevo Estado",
    "zipCode": "54321",
    "country": "País"
  },
  "avatar": "https://example.com/avatar.jpg"
}
```

**Validaciones:**
- `name`: Opcional, 2-50 caracteres
- `phone`: Opcional, formato válido
- `address`: Opcional, objeto con campos de dirección

**Response (200):**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Juan Carlos Pérez",
      "email": "juan@example.com",
      "phone": "+1234567890",
      "address": {
        "street": "456 New St",
        "city": "Nueva Ciudad",
        "state": "Nuevo Estado",
        "zipCode": "54321",
        "country": "País"
      },
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

---

#### PUT `/auth/change-password`
**Descripción**: Cambiar contraseña del usuario  
**Acceso**: 🔒 Private

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

**Validaciones:**
- `currentPassword`: Requerido
- `newPassword`: Requerido, mínimo 6 caracteres

**Response (200):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

**Errores:**
- `400`: Contraseña actual incorrecta o nueva contraseña inválida
- `401`: Token inválido
- `500`: Error interno del servidor

---

#### POST `/auth/logout`
**Descripción**: Cerrar sesión (invalidar token del lado del cliente)  
**Acceso**: 🔒 Private

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

## 📦 Productos (`/products`)

#### GET `/products`
**Descripción**: Obtener lista de productos con filtros y paginación  
**Acceso**: 🟢 Public

**Query Parameters:**
- `page` (number): Página (default: 1, min: 1)
- `limit` (number): Productos por página (default: 10, min: 1, max: 50)
- `search` (string): Búsqueda por nombre o descripción
- `category` (string): Filtrar por categoría
- `minPrice` (number): Precio mínimo (min: 0)
- `maxPrice` (number): Precio máximo (min: 0)
- `featured` (boolean): Solo productos destacados
- `sortBy` (string): Ordenar por campo (`name`, `price`, `rating`, `createdAt`, `salesCount`)
- `sortOrder` (string): Orden (`asc`, `desc`)

**Ejemplo de Request:**
```http
GET /api/products?page=1&limit=12&category=electronics&featured=true&sortBy=price&sortOrder=asc
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "iPhone 15 Pro",
        "description": "El iPhone más avanzado con chip A17 Pro",
        "price": 999,
        "originalPrice": 1099,
        "discount": 9,
        "category": "electronics",
        "subcategory": "smartphones",
        "brand": "Apple",
        "images": [
          {
            "url": "https://example.com/iphone15pro.jpg",
            "alt": "iPhone 15 Pro",
            "isPrimary": true
          }
        ],
        "stock": 50,
        "rating": {
          "average": 4.8,
          "count": 125
        },
        "isFeatured": true,
        "isActive": true,
        "salesCount": 89,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProducts": 48,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

#### GET `/products/:id`
**Descripción**: Obtener producto específico por ID  
**Acceso**: 🟢 Public

**Parameters:**
- `id` (string): ID del producto

**Response (200):**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "name": "iPhone 15 Pro",
      "description": "El iPhone más avanzado con chip A17 Pro y cámara de 48MP",
      "price": 999,
      "originalPrice": 1099,
      "discount": 9,
      "category": "electronics",
      "subcategory": "smartphones",
      "brand": "Apple",
      "images": [
        {
          "url": "https://example.com/iphone15pro-1.jpg",
          "alt": "iPhone 15 Pro frontal",
          "isPrimary": true
        },
        {
          "url": "https://example.com/iphone15pro-2.jpg",
          "alt": "iPhone 15 Pro trasero",
          "isPrimary": false
        }
      ],
      "stock": 50,
      "sku": "IPHONE15PRO-256GB",
      "weight": 0.187,
      "dimensions": {
        "length": 14.67,
        "width": 7.09,
        "height": 0.83
      },
      "tags": ["smartphone", "apple", "5g", "pro"],
      "features": [
        {
          "name": "Pantalla",
          "value": "6.1 pulgadas Super Retina XDR"
        },
        {
          "name": "Almacenamiento",
          "value": "256GB"
        }
      ],
      "rating": {
        "average": 4.8,
        "count": 125
      },
      "reviews": [
        {
          "user": {
            "id": "64f8a1b2c3d4e5f6a7b8c9d2",
            "name": "María García",
            "avatar": "https://example.com/avatar1.jpg"
          },
          "rating": 5,
          "comment": "Excelente producto, muy recomendado",
          "date": "2024-01-10T15:30:00.000Z"
        }
      ],
      "isFeatured": true,
      "isActive": true,
      "salesCount": 89,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Errores:**
- `400`: ID de producto inválido
- `404`: Producto no encontrado
- `500`: Error interno del servidor

---

#### POST `/products`
**Descripción**: Crear nuevo producto  
**Acceso**: 👑 Admin

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Samsung Galaxy S24 Ultra",
  "description": "Smartphone premium con S Pen integrado",
  "price": 1199,
  "originalPrice": 1299,
  "discount": 8,
  "category": "electronics",
  "subcategory": "smartphones",
  "brand": "Samsung",
  "images": [
    {
      "url": "https://example.com/galaxy-s24-ultra.jpg",
      "alt": "Samsung Galaxy S24 Ultra",
      "isPrimary": true
    }
  ],
  "stock": 30,
  "sku": "GALAXY-S24-ULTRA-512GB",
  "weight": 0.232,
  "dimensions": {
    "length": 16.24,
    "width": 7.90,
    "height": 0.89
  },
  "tags": ["smartphone", "samsung", "s-pen", "ultra"],
  "features": [
    {
      "name": "Pantalla",
      "value": "6.8 pulgadas Dynamic AMOLED 2X"
    },
    {
      "name": "Almacenamiento",
      "value": "512GB"
    }
  ],
  "isFeatured": true
}
```

**Validaciones:**
- `name`: Requerido, 1-100 caracteres
- `description`: Requerido, 1-2000 caracteres
- `price`: Requerido, mínimo 0
- `category`: Requerido, valores válidos
- `stock`: Requerido, mínimo 0
- `images`: Requerido, al menos una imagen

**Response (201):**
```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": {
    "product": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "name": "Samsung Galaxy S24 Ultra",
      "price": 1199,
      "stock": 30,
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

#### PUT `/products/:id`
**Descripción**: Actualizar producto existente  
**Acceso**: 👑 Admin

**Headers:**
```http
Authorization: Bearer <token>
```

**Parameters:**
- `id` (string): ID del producto

**Request Body:** (Campos opcionales para actualizar)
```json
{
  "name": "Samsung Galaxy S24 Ultra - Edición Especial",
  "price": 1099,
  "stock": 25,
  "isFeatured": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Producto actualizado exitosamente",
  "data": {
    "product": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "name": "Samsung Galaxy S24 Ultra - Edición Especial",
      "price": 1099,
      "stock": 25,
      "isFeatured": false,
      "updatedAt": "2024-01-15T11:30:00.000Z"
    }
  }
}
```

---

#### DELETE `/products/:id`
**Descripción**: Eliminar producto (soft delete)  
**Acceso**: 👑 Admin

**Headers:**
```http
Authorization: Bearer <token>
```

**Parameters:**
- `id` (string): ID del producto

**Response (200):**
```json
{
  "success": true,
  "message": "Producto eliminado exitosamente"
}
```

---

#### POST `/products/:id/reviews`
**Descripción**: Agregar reseña a un producto  
**Acceso**: 🔒 Private

**Headers:**
```http
Authorization: Bearer <token>
```

**Parameters:**
- `id` (string): ID del producto

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excelente producto, muy recomendado"
}
```

**Validaciones:**
- `rating`: Requerido, 1-5
- `comment`: Opcional, máximo 500 caracteres

**Response (201):**
```json
{
  "success": true,
  "message": "Reseña agregada exitosamente",
  "data": {
    "review": {
      "user": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "María García"
      },
      "rating": 5,
      "comment": "Excelente producto, muy recomendado",
      "date": "2024-01-15T10:30:00.000Z"
    },
    "newRating": {
      "average": 4.8,
      "count": 126
    }
  }
}
```

---

#### GET `/products/categories/list`
**Descripción**: Obtener lista de categorías disponibles  
**Acceso**: 🟢 Public

**Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      "electronics",
      "clothing",
      "books",
      "home",
      "sports",
      "beauty",
      "toys"
    ]
  }
}
```

---

## 🛒 Órdenes (`/orders`)

#### POST `/orders`
**Descripción**: Crear nueva orden  
**Acceso**: 🔒 Private

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "items": [
    {
      "product": "64f8a1b2c3d4e5f6a7b8c9d1",
      "quantity": 2
    },
    {
      "product": "64f8a1b2c3d4e5f6a7b8c9d3",
      "quantity": 1
    }
  ],
  "paymentMethod": "credit_card",
  "shippingAddress": {
    "fullName": "Juan Pérez",
    "street": "123 Main St",
    "city": "Ciudad",
    "state": "Estado",
    "zipCode": "12345",
    "country": "País",
    "phone": "+1234567890"
  },
  "billingAddress": {
    "fullName": "Juan Pérez",
    "street": "123 Main St",
    "city": "Ciudad",
    "state": "Estado",
    "zipCode": "12345",
    "country": "País",
    "phone": "+1234567890"
  },
  "notes": {
    "customer": "Entregar en horario de oficina"
  }
}
```

**Validaciones:**
- `items`: Requerido, array con al menos un producto
- `items.*.product`: Requerido, ID válido de producto
- `items.*.quantity`: Requerido, mínimo 1
- `paymentMethod`: Requerido, valores válidos
- `shippingAddress`: Requerido, todos los campos obligatorios

**Response (201):**
```json
{
  "success": true,
  "message": "Orden creada exitosamente",
  "data": {
    "order": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "orderNumber": "ORD-2024-001234",
      "user": "64f8a1b2c3d4e5f6a7b8c9d0",
      "items": [
        {
          "product": "64f8a1b2c3d4e5f6a7b8c9d1",
          "name": "iPhone 15 Pro",
          "price": 999,
          "quantity": 2,
          "image": "https://example.com/iphone15pro.jpg"
        }
      ],
      "subtotal": 1998,
      "tax": 159.84,
      "shipping": 15,
      "discount": 0,
      "total": 2172.84,
      "status": "pending",
      "paymentStatus": "pending",
      "paymentMethod": "credit_card",
      "shippingAddress": {
        "fullName": "Juan Pérez",
        "street": "123 Main St",
        "city": "Ciudad",
        "state": "Estado",
        "zipCode": "12345",
        "country": "País",
        "phone": "+1234567890"
      },
      "timeline": [
        {
          "status": "pending",
          "date": "2024-01-15T10:30:00.000Z",
          "note": "Orden creada"
        }
      ],
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Errores:**
- `400`: Datos inválidos o productos sin stock
- `401`: Token inválido
- `500`: Error interno del servidor

---

#### GET `/orders`
**Descripción**: Obtener órdenes del usuario  
**Acceso**: 🔒 Private

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Página (default: 1, min: 1)
- `limit` (number): Órdenes por página (default: 10, min: 1, max: 50)
- `status` (string): Filtrar por estado
- `sort` (string): Ordenar por fecha (newest, oldest)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d4",
        "orderNumber": "ORD-2024-001234",
        "items": [
          {
            "product": {
              "id": "64f8a1b2c3d4e5f6a7b8c9d1",
              "name": "iPhone 15 Pro",
              "images": [
                {
                  "url": "https://example.com/iphone15pro.jpg"
                }
              ]
            },
            "name": "iPhone 15 Pro",
            "price": 999,
            "quantity": 2
          }
        ],
        "total": 2172.84,
        "status": "pending",
        "paymentStatus": "pending",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalOrders": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

#### GET `/orders/:id`
**Descripción**: Obtener orden específica  
**Acceso**: 🔒 Private (propietario) / 👑 Admin

**Headers:**
```http
Authorization: Bearer <token>
```

**Parameters:**
- `id` (string): ID de la orden

**Response (200):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "orderNumber": "ORD-2024-001234",
      "user": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Juan Pérez",
        "email": "juan@example.com"
      },
      "items": [
        {
          "product": {
            "id": "64f8a1b2c3d4e5f6a7b8c9d1",
            "name": "iPhone 15 Pro",
            "images": [
              {
                "url": "https://example.com/iphone15pro.jpg"
              }
            ]
          },
          "name": "iPhone 15 Pro",
          "price": 999,
          "quantity": 2,
          "image": "https://example.com/iphone15pro.jpg"
        }
      ],
      "subtotal": 1998,
      "tax": 159.84,
      "shipping": 15,
      "discount": 0,
      "total": 2172.84,
      "status": "shipped",
      "paymentStatus": "paid",
      "paymentMethod": "credit_card",
      "paymentDetails": {
        "transactionId": "TXN-123456789",
        "paymentDate": "2024-01-15T11:00:00.000Z",
        "paymentGateway": "stripe"
      },
      "shippingAddress": {
        "fullName": "Juan Pérez",
        "street": "123 Main St",
        "city": "Ciudad",
        "state": "Estado",
        "zipCode": "12345",
        "country": "País",
        "phone": "+1234567890"
      },
      "tracking": {
        "carrier": "DHL",
        "trackingNumber": "DHL123456789",
        "trackingUrl": "https://dhl.com/track/DHL123456789",
        "estimatedDelivery": "2024-01-18T18:00:00.000Z"
      },
      "timeline": [
        {
          "status": "pending",
          "date": "2024-01-15T10:30:00.000Z",
          "note": "Orden creada"
        },
        {
          "status": "confirmed",
          "date": "2024-01-15T11:00:00.000Z",
          "note": "Pago confirmado"
        },
        {
          "status": "processing",
          "date": "2024-01-15T14:00:00.000Z",
          "note": "Preparando envío"
        },
        {
          "status": "shipped",
          "date": "2024-01-16T09:00:00.000Z",
          "note": "Enviado con DHL"
        }
      ],
      "notes": {
        "customer": "Entregar en horario de oficina",
        "admin": "Cliente VIP - prioridad alta"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-16T09:00:00.000Z"
    }
  }
}
```

**Errores:**
- `400`: ID de orden inválido
- `403`: Sin permisos para ver esta orden
- `404`: Orden no encontrada
- `500`: Error interno del servidor

---

#### PUT `/orders/:id/cancel`
**Descripción**: Cancelar orden  
**Acceso**: 🔒 Private (propietario)

**Headers:**
```http
Authorization: Bearer <token>
```

**Parameters:**
- `id` (string): ID de la orden

**Request Body (opcional):**
```json
{
  "reason": "Cambio de opinión del cliente"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Orden cancelada exitosamente",
  "data": {
    "order": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "status": "cancelled",
      "timeline": [
        {
          "status": "pending",
          "date": "2024-01-15T10:30:00.000Z",
          "note": "Orden creada"
        },
        {
          "status": "cancelled",
          "date": "2024-01-15T12:00:00.000Z",
          "note": "Cancelada por el usuario: Cambio de opinión del cliente"
        }
      ],
      "updatedAt": "2024-01-15T12:00:00.000Z"
    }
  }
}
```

**Errores:**
- `400`: La orden no puede ser cancelada en su estado actual
- `403`: Sin permisos para cancelar esta orden
- `404`: Orden no encontrada
- `500`: Error interno del servidor

---

#### GET `/orders/admin/all`
**Descripción**: Obtener todas las órdenes (solo administradores)  
**Acceso**: 👑 Admin

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Página (default: 1, min: 1)
- `limit` (number): Órdenes por página (default: 10, min: 1, max: 100)
- `status` (string): Filtrar por estado
- `user` (string): Filtrar por ID de usuario
- `dateFrom` (string): Fecha desde (YYYY-MM-DD)
- `dateTo` (string): Fecha hasta (YYYY-MM-DD)
- `sort` (string): Ordenar por (newest, oldest, total_asc, total_desc)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d4",
        "orderNumber": "ORD-2024-001234",
        "user": {
          "id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "name": "Juan Pérez",
          "email": "juan@example.com"
        },
        "total": 2172.84,
        "status": "pending",
        "paymentMethod": "credit_card",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalOrders": 47,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "stats": {
      "totalRevenue": 15847.32,
      "totalOrders": 47,
      "averageOrderValue": 337.18
    }
  }
}
```

---

#### PUT `/orders/:id/status`
**Descripción**: Actualizar estado de orden (solo administradores)  
**Acceso**: 👑 Admin

**Headers:**
```http
Authorization: Bearer <token>
```

**Parameters:**
- `id` (string): ID de la orden

**Request Body:**
```json
{
  "status": "processing",
  "note": "Orden en preparación",
  "tracking": {
    "carrier": "DHL",
    "trackingNumber": "DHL123456789",
    "estimatedDelivery": "2024-01-18T18:00:00.000Z"
  }
}
```

**Validaciones:**
- `status`: Requerido, valores válidos (pending, confirmed, processing, shipped, delivered, cancelled, refunded)
- `note`: Opcional, máximo 500 caracteres
- `tracking`: Opcional, requerido cuando status es "shipped"

**Response (200):**
```json
{
  "success": true,
  "message": "Estado de orden actualizado exitosamente",
  "data": {
    "order": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "status": "processing",
      "timeline": [
        {
          "status": "pending",
          "date": "2024-01-15T10:30:00.000Z",
          "note": "Orden creada"
        },
        {
          "status": "processing",
          "date": "2024-01-15T12:00:00.000Z",
          "note": "Orden en preparación"
        }
      ],
      "updatedAt": "2024-01-15T12:00:00.000Z"
    }
  }
}
```

---

## 🔧 Endpoint de Prueba

#### GET `/test`
**Descripción**: Endpoint de prueba para verificar que la API funciona  
**Acceso**: 🟢 Public

**Response (200):**
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

## 📊 Modelos de Datos

### Usuario (User)
```javascript
{
  id: ObjectId,
  name: String (2-50 chars),
  email: String (unique, valid format),
  password: String (hashed, min 6 chars),
  role: String (enum: ['user', 'admin']),
  avatar: String (URL),
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Producto (Product)
```javascript
{
  id: ObjectId,
  name: String (1-100 chars),
  description: String (1-2000 chars),
  price: Number (min: 0),
  originalPrice: Number (min: 0),
  discount: Number (0-100),
  category: String (enum),
  subcategory: String,
  brand: String,
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean
  }],
  stock: Number (min: 0),
  sku: String (unique),
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  tags: [String],
  features: [{
    name: String,
    value: String
  }],
  rating: {
    average: Number (0-5),
    count: Number
  },
  reviews: [{
    user: ObjectId (ref: User),
    rating: Number (1-5),
    comment: String (max: 500),
    date: Date
  }],
  isActive: Boolean,
  isFeatured: Boolean,
  salesCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Orden (Order)
```javascript
{
  id: ObjectId,
  orderNumber: String (unique),
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  subtotal: Number,
  tax: Number,
  shipping: Number,
  discount: Number,
  total: Number,
  status: String (enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
  paymentStatus: String (enum: ['pending', 'paid', 'failed', 'refunded']),
  paymentMethod: String (enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery']),
  paymentDetails: {
    transactionId: String,
    paymentDate: Date,
    paymentGateway: String
  },
  shippingAddress: {
    fullName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  billingAddress: {
    fullName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  tracking: {
    carrier: String,
    trackingNumber: String,
    trackingUrl: String,
    estimatedDelivery: Date
  },
  notes: {
    customer: String,
    admin: String
  },
  timeline: [{
    status: String,
    date: Date,
    note: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## ⚠️ Códigos de Error

### Códigos HTTP Comunes
- `200` - OK: Solicitud exitosa
- `201` - Created: Recurso creado exitosamente
- `400` - Bad Request: Datos inválidos o faltantes
- `401` - Unauthorized: Token inválido o faltante
- `403` - Forbidden: Sin permisos suficientes
- `404` - Not Found: Recurso no encontrado
- `409` - Conflict: Conflicto (ej: email duplicado)
- `422` - Unprocessable Entity: Errores de validación
- `500` - Internal Server Error: Error interno del servidor

### Estructura de Respuesta de Error
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [
    {
      "field": "email",
      "message": "El email ya está registrado"
    }
  ]
}
```

---

## 🔍 Ejemplos de Uso

### Flujo Completo de Compra

1. **Registrar usuario**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan Pérez","email":"juan@example.com","password":"password123"}'
```

2. **Obtener productos**
```bash
curl http://localhost:5000/api/products?featured=true&limit=6
```

3. **Ver producto específico**
```bash
curl http://localhost:5000/api/products/64f8a1b2c3d4e5f6a7b8c9d1
```

4. **Crear orden**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"product":"64f8a1b2c3d4e5f6a7b8c9d1","quantity":1}],"paymentMethod":"credit_card","shippingAddress":{"fullName":"Juan Pérez","street":"123 Main St","city":"Ciudad","state":"Estado","zipCode":"12345","country":"País","phone":"+1234567890"}}'
```

5. **Ver mis órdenes**
```bash
curl http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Notas Adicionales

- Todos los timestamps están en formato ISO 8601 UTC
- Los precios están en la moneda base del sistema (USD por defecto)
- Las imágenes deben ser URLs válidas y accesibles
- Los tokens JWT tienen una expiración configurable (default: 7 días)
- La paginación usa índices basados en 1 (primera página = 1)
- Los filtros de búsqueda son case-insensitive
- Los productos eliminados se marcan como `isActive: false` (soft delete)
- Las órdenes mantienen un historial completo en el campo `timeline`

---

**📞 Soporte**: Para reportar problemas o solicitar nuevas funcionalidades, contacta al equipo de desarrollo.