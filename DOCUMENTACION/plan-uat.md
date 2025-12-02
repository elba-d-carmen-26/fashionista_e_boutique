# Plan de Pruebas de Aceptación del Cliente (UAT) — Fashionista e-Boutique
---
Título: "Plan de Pruebas de Aceptación del Cliente (UAT) — "<Fashionista e-Boutique>"
Versión: "v1.0"
Fecha: "2025-11-09"
Empresa: "Fashionista e-Boutique"
Proyecto: "UAT"
Formatocd: "Markdown"
---

## 1. Objetivo

Validar que la plataforma Fashionista e-Boutique cumple con los criterios de aceptación del negocio, asegurando su funcionalidad, estabilidad, seguridad y experiencia de usuario en un entorno que simula condiciones reales antes de su liberación a producción.

---

## 2. Alcance y Supuestos

**Alcance UAT:**
- Validación de procesos completos de usuario final: registro, inicio de sesión, navegación, búsqueda y compra-
- Validación de funcionalidades administrativas: gestión de productos.
- Validación de comunicación entre módulos clave (catálogo, carrito, checkout).
- Revisión de experiencia de usuario (UX), contenidos y accesibilidad básica.

**Supuestos:**
- El entorno UAT es estable y aislado, con datos de prueba realistas.
- Los actores (usuarios finales y administradores) cuentan con permisos apropiados.
- No se realizan cambios en código durante las pruebas salvo correcciones aprobadas.

---

## 3. Criterios de Aceptación

| Criterio | Descripción |
|--------|-------------|
| Funcionalidad | Todas las funciones principales operan sin errores críticos. |
| Precisión de Datos | La información de usuarios y productos se visualiza correctamente. |
| Rendimiento | Tiempos de carga aceptables (< 3 segundos para páginas principales). |
| Disponibilidad | El sistema permanece estable durante el ciclo de pruebas. |
| Experiencia de Usuario | Navegación clara, mensajes comprensibles y flujos intuitivos. |

---

## 4. Roles y Responsabilidades

| Rol | Responsabilidad |
|-----|----------------|
| Cliente / Usuario Final / Administrador de la herramienta (Aprobador) | Ejecutar casos y validar cumplimiento del negocio. |
| QA / Facilitador | Guiar ejecución, registrar resultados y coordinar incidentes. |
| Product Owner | Resolver dudas funcionales, tomar decisiones de alcance y añadir mejoras al backlog de producto. |
| Equipo de Desarrollo | Analizar y corregir defectos confirmados. |

---

## 5. Preparación del Entorno

- **Entorno:** `https://uat.fashionista-eboutique.com/`
- **Base de datos:** Datos de prueba cargados (catálogo, usuarios, órdenes simuladas).
- **Credenciales:**
  - Usuario final: `cliente_demo@correo.com`
  - Administrador: `admin_demo@correo.com`
- **Permisos:** Roles configurados (customer, admin).
- **Bloqueo de versiones:** Sin despliegues durante la ejecución UAT salvo aprobaciones.

---

## 6. Plan de Casos de Prueba UAT

| ID | Título | Prioridad | Precondición | Pasos | Resultado Esperado |
|----|--------|-----------|--------------|-------|--------------------|
| UAT-001 | Inicio de sesión de usuario | Alta | Usuario registrado | 1. Abrir login <br> 2. Ingresar credenciales <br> 3. Confirmar acceso | Usuario ingresa al panel correctamente. |
| UAT-002 | Navegación del catálogo | Alta | Catálogo cargado | 1. Abrir menú categorías <br> 2. Elegir categoría <br> 3. Aplicar filtros | Se muestran productos correctos según filtros. |
| UAT-003 | Agregar producto al carrito | Alta | Producto con stock | 1. Abrir producto <br>  23. Añadir al carrito | El carrito actualiza cantidad y subtotal. |
| UAT-004 | Finalizar compra (Checkout) | Crítica | Carrito con productos | 1. Ir al carrito <br> 2. Confirmar datos de envío <br> 3. Seleccionar método de pago <br> 4. Confirmar | Se genera la orden y aparece número de confirmación. |
| UAT-005 | Ver historial de órdenes | Media | Orden existente | 1. Ir a Mi Perfil <br> 2. Abrir Mis Pedidos | Se listan órdenes con estados correctos. |
| UAT-006 | Crear producto (Administrador) | Alta | Credenciales admin | 1. Ir al panel de administración <br> 2. Crear producto <br> 3. Guardar | Producto visible en el catálogo. |
| UAT-007 | Editar producto (Administrador) | Media | Producto existente | 1. Abrir producto en panel <br> 2. Editar campos <br> 3. Guardar | Cambios reflejados en catálogo y detalle. |

---

## 7. Gestión de Incidencias

- Todas las incidencias se registran en 
- Severidad:
  - **Crítica:** Bloquea operación principal → Corrección inmediata.
  - **Alta:** Impacta flujo primario → Corrección antes de cierre UAT.
  - **Media:** No bloquea, se programa para release siguiente.
  - **Baja:** Ajustes visuales / textuales.
- Tiempo de respuesta: **24h**; de corrección (críticas): **72h**.

---

## 8. Evidencias y Trazabilidad

- Capturas de pantalla por caso.
- Logs de consola/servidor en caso de error.
- Registro comparativo contra criterios de aceptación.
- Reporte final con lista de casos aprobados y rechazados.

---

## 9. Cierre y Firma

Se considera el sistema **aceptado** cuando:
- El **100%** de casos críticos y de alta prioridad están **aprobados**.
- Las incidencias críticas y altas están corregidas o justificadas.
- El cliente firma el **Acta de Aceptación**.

**Firmas:**

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Cliente / Aprobador | | | |
| Product Owner | | | |
| QA Líder | | | |

---
