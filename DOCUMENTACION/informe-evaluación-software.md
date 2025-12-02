# Informe de Comportamiento del Software y Evaluación de Calidad


---
Proyecto: "Fashionista e-Boutique"
Documento: "Informe de Comportamiento de Software y Evaluación de Calidad"
Fecha: "2025-11-30"
Elaborado por: "Carmen Patiño Segura"
Revisado por: "Carmen Patiño Segura"
Aprobado por: "Carmen Patiño Segura"
Estado: "Borrador"
---


# 1.  Introducción

En este informe se documenta el comportamiento del software, los resultados de la evaluación de calidad y el nivel de cumplimiento frente a los criterios funcionales y técnicos establecidos para el proyecto Fashionista e-Boutique, con el fin de garantizar el funcionamiento estable de la plataforma y su alineación con las confiable expectativas del negocio.

# 2. Objetivos

## 2.1. Objetivo General

- Validar que el proyecto cumple con los requisitos funcionales y técnicos establecidos.

## 2.2. Objetivos Específicos

- Verificar la estabilidad y rendimiento del software.

- Comprobar la calidad del código y las buenas prácticas aplicadas en su construcción.

- Identificar defectos, riesgos y oportunidades de mejora.

# 3. Metodología 

- Scrum: Gestión e implementación del proyecto bajo un marco ágil por iteraciones, con métricas basadas en indicadores como DoD (Definition of Done), DoR (Definition of Ready) y Burndown chart.

- Pruebas exploratorias. 

- Pruebas funcionales y no funcionales basadas en los criterios de aceptación establecidos.

- Pruebas de regresión.

# 4. Marcos de Referencia

- Scrum: Gestión e implementación del proyecto bajo un marco ágil por iteraciones, con métricas basadas en indicadores como DoD (Definition of Done), DoR (Definition of Ready) y Burndown chart.

- ISO/IEC 25010 para atributos de calidad del producto, como fiabilidad, compatibilidad y seguridad.

- ISO/IEC 29119 para documentación, reporte y trazabilidad de pruebas.

- OWASP Web Security Testing Guide (WSTG) para validaciones de seguridad.

- WCAG 2.2 para estándares de accesibilidad.

# 5. Buenas Prácticas de Calidad Aplicadas

- Buenas prácticas aplicadas a la codificación: Se manejó un estilo uniforme en el código, con identación en las líneas de acuerdo con la estructura y orden requerido.

- Arquitectura desacoplada: Se realizó una separación por módulos y capas, tanto en el backend (implementado con ode.js/Express), como en el frontend (React) y así mismo, se manejó una estructura de carpetas modular y desacoplada, con el fin de mantener una estructura modular y facilitar la escalabilidad del sistema.

- Uso de MongoDB Compass (entorno local) con backups programados.

- Pruebas manuales documentadas.

- Control de versiones con Git y GitHub.

# 6. Recursos Utilizados para la Evaluación

## 6.1. Equipo evaluador

- Carmen Patiño Segura: Profesional de Requerimientos y Pruebas
- Carmen Patiño Segura: Desarrolladora
- Stakeholder y usuarios clave

## 6.2. Recursos tecnológicos

| Recurso              | Descripción                                                         |
| -------------------- | ------------------------------------------------------------------- |
| **Hardware**         | Laptop 32 GB RAM                                                    |
| **Software Base**    | VS Code, Node.js 18+, MongoDB 6, React 18                           |
| **Navegadores**      | Chrome, Edge, Mozilla, Safari                                       |
| **Entorno Backend**  | `http://localhost:5000/`                                            |
| **Entorno Frontend** | `http://localhost:3000`                                             |
| **Herramientas QA**  | Postman, MongoDB Compass, DevTools, Apache JMeter                   |
| **Documentación**    | Historias de usuario, criterios de aceptación, diccionario de datos, casos de prueba, casos de uso, plan de pruebas de software, reporte de pruebas                                                                                      |


## 6.3 Métricas utilizadas y Ponderación

| Métrica            | Descripción                              | Ponderación |
| ------------------ | ---------------------------------------- | ----------- |
| **Funcionalidad**  | Cumplimiento de criterios de aceptación  | 30%         |
| **Rendimiento**    | Tiempos de carga y respuesta             | 20%         |
| **Usabilidad**     | Flujo intuitivo y accesible              | 15%         |
| **Seguridad**      | Protección de datos, autenticación       | 15%         |
| **Compatibilidad** | Funcionamiento en diferentes navegadores | 10%         |
| **Estabilidad**    | Frecuencia de errores y fallas           | 10%         |

Resultado esperado para aprobación: > 80% del cumplimiento total.

## 6.4. Criterios de Aprobación

- Todas las funcionalidades críticas operativas (home, catálogo, detalle del producto, carrito de compras, gestión de productos, autenticación). 

- No más del 15% de defectos de severidad media/baja pendientes.

- Cero defectos críticos o bloqueantes.

- Rendimiento estable con tiempos de respuesta < 2s para rutas principales.

## 6.5. Recursos de Infraestructura

- Servidor local de desarrollo con Node.js 18+.

- MongoDB Compass Local para pruebas.

- Conexión estable para pruebas del frontend.

- Configuración base completa en .env.

# 7. Bitácora de Procesos Documentales

| Fecha      | Artefacto                                | Responsable | Descripción          |
| ---------- | ---------------------------------------- | ----------- | ------------------- |
| 2024-06-29 | Formulación del proyecto | Product Owner/Scrum Master        | Documento en el que se describe el alcance y los objetivos del proyecto.    |
| 2024-07-15 | Especificación de requerimientos                | Product Owner       |Descripción detallada de los requerimientos funcionales y no funcionales del proyecto.  |
| 2024-08-06 | Diagramas UML y casos de uso         | Product Owner / DEV        | Documento con los casos de uso correspondientes a los requerimientos funcionales del proyecto y el diagrama UML que describe el funcionamiento de la solución. |
| 2024-08-10 | Ficha técnica            | DEV/QA       | Documento con las características, especificaciones y funcionalidades de la solución.       |
| 2024-08-14 | Historias de usuario                  | Product Owner       | Documento con los requerimientos funcionales y no funcionales del proyecto, desde el punto de vista del usuario.         |
| 2024-08-23 | Diagrama de actividades                         | Product Owner/DEV         | Documento con el diagrama de actividades de la solución.       |
| 2024-08-31 | Diagrama del modelo de dominio                         | DEV         | Documento con el diagrama de clases de la solución.      |
| 2024-09-19 | Propuesta técnica y económica                        | Product Owner/Scrum Master/DEV         | Documento que describe la solución, con sus características técnicas y funcionales, y la cotización del costo del proyecto.      |
| 2025-03-29 | Propuesta de interfaz gráfica                         | UX/UI          | Mockups de la interfaz gráfica del sitio web, siguiendo lineamientos de usabilidad y accesibilidad.   |
| 2025-04-06 | Mapa de navegación                         | UX/UI         | Mapa de navegación del sitio web, con sus niveles, jerarquías y elementos de navegación.      |
| 2025-09-29 | Plan de pruebas                        | QA          | Documento que especifica los tipos de prueba a ejecutar en el proyecto, el cronograma de ejecución y los casos de prueba.       |
| 2025-10-10 | Reporte de pruebas                        | QA          | Reporte que describe los resultados de la ejecución de los casos de prueba.      |
| 2025-11-01 | Plan de mantenimiento y soporte                        | DEV/QA          | Documento con el plan de mantenimiento y soporte definido para el sitio web.      |
| 2025-11-02 | Plan de migración y respaldo de los datos                        | DEV/QA          | Documento con el plan de migración y respaldo de datos definido e implementado para el sitio web.       
| 2025-11-08 | Manual técnico                        | DEV/QA          | Manual con las tecnologías y arquitectura utilizadas en la implementación del sitio web. También incluye información acerca de su instalación, ejecución, despliegue y configuración.       |
| 2025-11-08 | Manual de usuario                      | QA          | Manual que detalla el uso de las funcionalidades del sitio web para los usuarios finales según su rol.    ||
| 2025-11-08 | Plan de capacitación y UAT                    | QA          | Documento con el plan de capacitación y pruebas de aceptación del software, definiendo cronogramas, actividades, materiales y pruebas a realizar.       |
| 2025-11-12 | Acta de entrega                  | QA          | Presentación final del proyecto.      |

# 8. Tipos Pruebas Realizadas

- Pruebas funcionales (manuales)

- Pruebas unitarias

- Pruebas de regresión

- Pruebas de seguridad básicas (entrada, sesiones, endpoints)

- Pruebas de rendimiento (tiempos de respuesta)

- Pruebas de usabilidad

- Pruebas exploratorias

- Pruebas de compatibilidad (navegadores y dispositivos)

# 9. Pruebas Ejecutadas con Comandos (IDE)

Pruebas de configuración (backup)

- Comando: npm run test-config: 4/4 verificaciones aprobadas.

- Aspectos validados: Conexión a base de datos, acceso a almacenamiento local, configuración de notificaciones y permisos de escritura.

- Observaciones: Hay un error en el BackupScheduler (no se puede inicializar), el error ocurre porque el sistema intenta leer una parte de la configuración (retention), pero esa parte no existe o está incompleta, por lo tanto, como no la encuentra, el BackupScheduler se detiene y arroja un error. Para solucionar este inconveniente, se puede agregar al archivo de configuración una sección que indique si la función de “retención de respaldos” está activada y cómo debe funcionar.

Calidad de Código - [ESLint]

- Comando: npx eslint . --max-warnings=0
- Resultado: 0 errores/0 advertencias (cumplimiento total).

- Comando: npx eslint . --fix
- Resultado: No se encontraron errores de sintaxis o estilo que se pudieran autocorregir.

Endpoints

- Comando: curl http://localhost:5000/api/products
- Resultado: La ruta api/products funciona correctamente y se consume la información de los productos disponible en la base de datos.

- Comando: curl -X POST http://localhost:5000/api/auth/register
- Resultado: El endpoint funciona correctamente, valida los datos, crea usuarios, genera el JWT y devuelve todo en el formato esperado.

- Comando: curl -X POST http://localhost:5000/api/auth/login
- Resultado: El endpoint funciona correctamente, valida los datos y devuelve la respuesta correspondiente dependiendo de si las credenciales son válidas o no.

Modelos

- Comandos: node -e "require('./models/User')" / node -e "require('./models/Product')"/ node -e "require('./models/Order')"
- Resultado: Los modelos están cargados correctamente.

Dependencias:

- Comando: npm audit
- Resultado: Se encontraron 3 vulnerabilidades moderadas en el backend y 12 vulnerabilidades (4 moderadas y 8 altas) en el frontend.

# 10. Riesgos y Recomendaciones

- Revisar y completar la configuración del módulo de backup para evitar inconvenientes cuando se ejecuten los procesos de respaldo programados.

- Validar las dependencias con vulnerabilidades y ajustarlas.

- El proyecto no cuenta con capacidad técnica para ejecutar pruebas automatizadas, por lo que en el proceso de despliegue e integración continua pueden presentarse errores previamente no detectados.

# 11. Estado Final del Proyecto

| Componente | Estado                                   |
| ---------- | ---------------------------------------- |
| Backend    | ✔️ Estable                               |
| Frontend   | ✔️ Estable                               |
| Backup     | ❌ Configuración incompleta              |

# 12. Próximos Pasos

- Implementación de pruebas automatizadas.

- Mejoras en rendimiento del frontend.

- Implementación de monitoreo y logs avanzados.

- Configurar backups y retención correctamente.

# 13. Conclusiones

- El software demuestra estabilidad funcional y técnica en sus flujos críticos, pues las pruebas ejecutadas  permitieron evidenciar que los módulos principales (catálogo, detalle de producto, autenticación, carrito y gestión de productos) funcionan adecuadamente. 

- El proyecto cumple con buenas prácticas de calidad y estándares técnicos, lo cual se validó mediante ESLint (que no encontró errores ni advertencias) y con la ejecución de pruebas manuales funcionales.

- Se identificaron oportunidades de mejora que no afectan el funcionamiento general, pero requieren atención, como la configuración incompleta del BackupScheduler y ajustes generales de frontend.
