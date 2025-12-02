# Informe de Lecciones Aprendidas en el Proceso de Verificación del Software

---
Proyecto: "Fashionista e-Boutique"
Documento: "Informe de Lecciones Aprendidas en el Proceso de Verificación del Software"
Fecha: "2025-11-30"
Elaborado por: "Carmen Patiño Segura"
Revisado por: "Carmen Patiño Segura"
Aprobado por: "Carmen Patiño Segura"
Estado: "Borrador"
---

# 1. Introducción

El presente informe recopila las lecciones aprendidas durante el ciclo de desarrollo, pruebas, documentación y validación del proyecto Fashionista e-Boutique. Su propósito es capturar los conocimientos adquiridos, registrar las oportunidades de mejora y consolidar las mejores prácticas que podrán aplicarse en futuras fases del proyecto o en proyectos similares. 

Las lecciones que se describen se basan en la experiencia técnica, funcional y de gestión de proyectos obtenida durante el proceso de levantamiento de requerimientos, desarrollo e implementación del proyecto, pruebas manuales y documentación.

# 2. Objetivos

## 2.1. Objetivo General

- Documentar las lecciones aprendidas resultantes del proyecto Fashionista e-Boutique, para mejorar la calidad, productividad y eficiencia en futuros desarrollos de software.

## 2.2. Objetivos Específicos

- Identificar los aciertos, errores y oportunidades de mejora detectados durante el ciclo de vida del proyecto.

- Analizar los factores que facilitaron o dificultaron el proceso de implementación y verificación del producto.

- Proponer acciones de mejora aplicables a próximos ciclos de desarrollo o mantenimiento.

# 3. Contexto del Proyecto

Fashionista e-Boutique es un sitio web e-commerce enfocado en la venta de artículos de moda femeninda. Fue implementado con una arquitectura desacoplada, con backend en Node.js + Express y base de datos MongoDB, y frontend en React. El proyecto incluye funcionalidades críticas como autenticación, catálogo de productos, vista de detalle de productos, carrito de compra y gestión de productos.

La validación del proyecto se realizó en entorno local mediante pruebas manuales, pruebas exploratorias, pruebas basadas en criterios de aceptación, verificación de calidad de código y ejecución de endpoints vía curl/Postman.

# 4. Enfoque de Verificación

La validación de calidad del proyecto incluyó los siguientes aspectos:

-  Validación de completitud y calidad de los artefactos (documentación) generados durante el proyecto, teniendo en cuenta los siguientes criterios: 

    - Nivel de detalle técnico a un punto medio entre lo conceptual y lo operativo.
    - Documentación compatible GitHub y SharePoint.
    - Elaboración ágil y focalizada (entregas de documentación incrementales en paralelo con la implementación del proyecto)-
    - Lenguaje preciso y claro, adaptado a los distintos públicos (Desarrolladores, QA, Administradores del sistema, Product Owner, Scrum Master, Diseñadores, Clientes, Usuarios y Stakeholders).
    - Estructura clara, respetando normas ortográficas, gramaticales y de redacción.

- Pruebas funcionales (manuales) para validar cumplimiento de los requerimientos: 

    - Definición de casos de prueba y casos de uso para cubrir los criterios de aceptación y reglas de negocio.
    - Identificación y reporte de defectos (bugs) siguiendo buenas prácticas: descripción, pasos para reproducir, resultado esperado, resultado obtenido, datos de prueba, entorno y dispositivos de ejecución, evidencias.
    - Identificación de mejoras en funcionalidades críticas y mapeo en el backlog de producto.
    - Ejecución de pruebas visuales, de usabilidad y de accesibilidad, para garantizar el comportamiento responsive de la interfaz, una experiencia de navegación adecuada, un adecuado funcionamiento en distintas resoluciones de pantalla y dispositivos, y cumplimiento de los estándares de usabilidad y accesibilidad establecidos.

- Pruebas de API:

    - Uso de curl y Postman para validar endpoints.
    - Verificación directa en la base de datos.
    - Validación de rendimiento y manejo de solicitudes con Apache JMeter.

- Verificación de calidad de código mediante ESLint.

- Validación de configuraciones.

# 5. Lecciones Aprendidas

## 5.1. Planeación y Requerimientos

- La documentación temprana (historias de usuario, mockups, diagramas, mapa de navegación) permite identificar inconsistencias antes de que comience el proceso de desarrollo.

- Los criterios de aceptación deben escribirse con mayor precisión y especificidad para evitar interpretaciones ambiguas.

- La incorporación de UAT en cada iteración favorece la alineación con las expectativas  de los clientes stakeholders y usuarios finales.

- Las historias de usuario deben ser lo más atómicas posibles, deben poder poder desarrollarse y probarse en una misma iteración y deben estimase cuidadosamente. Es recomendable aplicar técnicas de slicing (segmentación) de historias de usuario, para convertir historias de usario muy extensas, en historias de usuario más pequeñas y simples.

- Los mockups deben estar centralizados en herramientas de diseño como Figma y deben estar asociados a las historias de usuario correspondientes para evitar confusiones y errores al momento de implementar la interfaz y para poder contrastar el diseño del mockup con los criterios de aceptación de las historias y verificar su coherencia.

## 5.2. Desarrollo, Implementación y Arquitectura

- Separar el backend y el frontend permite escalar y probar cada módulo por separado.

- La modularidad disminuye errores y facilita el mantenimiento del proyecto.

- Es importante mantener una convención de nombres y rutas homogénea para evitar inconsistencias.

- Las herramientas como ESLint y Prettier permiten detectar de forma temprana errores o inconsistencias en el código y ayudan a mantener un estilo consistente.

- Se debe mantener un control de versiones del código y aplicar buenas prácticas en el manejo de ramas (master, staging, develop).

## 5.3. Pruebas

- La ausencia de pruebas unitarias automatizadas incrementa la carga manual y el riesgo de regresión.

- La ejecución de pruebas de endpoints permite validar el backend sin necesidad de tener una interfaz de usuario funcional, lo cual favorece la detección temprana de errores antes de la integración con el frontend.

## 5.4. Gestión del Proyecto

- La doble función (requerimientos + QA + desarrollo) requiere una correcta gestión del tiempo y priorización.

- Registrar todos los hallazgos, no solo a nivel técnico sino a nivel de negocio, permite gestionar errores, incidencias, alertas o riesgos de forma más efectiva, y llevando trazabilidad de todo el proceso.

- Las revisiones iterativas (ceremonia de Review), permiten reducir reprocesos y facilitan el cumplimiento de las necesidades de clientes, usuarios finales y stakeholders.

# 6. Casos Representativos y Hallazgos

- Caso 1: Error en BackupScheduler

    - Síntoma: El módulo fallaba al inicializar por una configuración incompleta.
    - Hallazgo: El sistema esperaba una sección “retention” inexistente en config.
    - Aprendizaje: Validar configuración antes de iniciar módulos críticos.

- Caso 2: Problemas iniciales con ESLint

    - Síntoma: Errores por no tener configurado env.node o por analizar la carpeta incorrecta.
    - Hallazgo: ESLint requiere configuración específica por entorno (backend vs frontend).
    - Aprendizaje: Mantener configuraciones separadas para cada capa del proyecto.

- Caso 3: Error al hacer clic en el enlace "¿Olvidaste tu contraseña?"

    - Síntoma: Al hacer clic en en enlace "¿Olvidaste tu contraseña?" desde la interfaz gráfica, se carga una pantalla en blanco.
    - Hallazgo: El error indica que React Router no reconoce esa ruta, lo cual sucede porque l ruta no está definida en el archivo Routes.
    - Aprendizaje: Todas las rutas deben declararse de forma explícita y correcta, pues si la URL existe en el frontend, debe tener su ruta asociada.

- Caso 4: Informacion inconsistente en la sección "Acerca de nosotros"

    - Síntoma: Se detectó que la información en la sección "Acerca de nosotros" del sitio web es inconsistente; por ejemplo, hay información de contacto incorrecta y datos incongruentes sobre el equipo humano de la empresa.
    - Hallazgo: La causa principal es que se han realizado actualizaciones parciales en el contenido sin un control de versiones ni revisión final, lo que genera contradicciones y confusión para los usuarios.
    - Aprendizaje: Se requiere implementar un proceso de revisión y validación del contenido antes de publicarlo en el sitio wen, para garantizar la consistencia y veracidad de la información.

- Caso 5: Alineación inadecuada de componentes de la interfaz gráfica

    - Síntoma: En algunas secciones del sitio web, se detectó que no todos los componentes de la interfaz gráfica están correctamente alineados, lo que provoca que cards, textos y otros elementos se ven desorganizados y desproporcionados en distintas resoluciones de pantalla.
    - Hallazgo: Se identificó que los estilos CSS y los contenedores de los elementos no se están aplicando de manera consistente, y no se están probando las vistas en diferentes tamaños de pantalla.
    - Aprendizaje: Es importante establecer estándares de diseño responsivo y validar la alineación de los componentes en varias resoluciones antes de publicar la interfaz. 

# 7. Dificultades encontradas y cómo se resolvieron

| Dificultad                       | Causa                                     | Solución Aplicada                                 |
| -------------------------------- | ----------------------------------------- | ------------------------------------------------- |
| ESLint arrojaba múltiples errores | Configuración por defecto y carpetas innecesarias | Limitar análisis a `/src` y agregar `env: { node: true }` |
| Al hacer clic en un producto, no se mostraba su página de detalle. | El componente no mostraba el detalle porque se estaba guardando toda la respuesta de la API, no solo los datos del producto. Por eso React no encontraba los campos que necesitaba para mostrar. | Guardar únicamente los datos del producto que vienen dentro de la respuesta de la API.|
| El ordenamiento de productos en el catálogo no funcionaba | El backend no recibía el parámetro de ordenamiento en el formato que esperaba (campo + dirección). | Se mapeó sortBy a sortByParam (campo) y sortOrderParam (asc/desc) y se enviaron correctamente en la petición. También se ajustó la lectura de la respuesta para asegurar que products y pagination se asignen correctamente. |
| El producto no se agregaba correctamente al carrito y la imagen no siempre se mostraba | Se usaba id en vez de _id y se asumía que images[0] era una URL directa| Se cambió id a _id y se usó `product.images[0]?.url|
| No se mostraban los productos creados en el módulo de administración de la plataforma | La API podía devolver una estructura distinta o datos vacíos | Se verificó que response.success, response.data y response.data.products fueran equivalentes, antes de asignar a products |
| Error al crear o editar productos | Se enviaba images en un formato que la API no esperaba| Se eliminó images de productData, se mantuvo parseo de price y stock, y se asigna mensaje de éxito después de la llamada |

# 8. Recomendaciones y Acciones de Mejora

- Llevar a cabo secciones de refinamiento del Product Backlog y del Sprint Backlog.
- Mapear mejoras en el Product Backlog de forma inmediata tras su detección y definir su prioridad.
- Implementar pruebas automatizadas para ejecutar escenarios de regresión de forma más ágil y confiable.
- Configurar pipelines CI/CD para ejecutar ESLint, pruebas y análisis de vulnerabilidades.
- Implementar y monitorear logs para la detección y manejo de incidencias.
- Elaborar documentación técnica sobre rutas, modelos y scripts internos.

# 9. Conclusiones

- En la etapa de evaluación del proyecto Fashionista e-Boutique, se identificó que las funcionalidades principales de la plataforma se comportaban de forma adecuada.

- La incorporación de herramientas y buenas prácticas de calidad, permitió identificar errores rápidamente en  cada una de las fases del proyecto, para garantizar mayor consistencia funcional y técnica.

- Las lecciones aprendidas reflejan oportunidades de mejora en automatización, documentación y validación temprana, que permitirán acelerar el desarrollo y reducir reprocesos en futuras iteraciones del proyecto.

