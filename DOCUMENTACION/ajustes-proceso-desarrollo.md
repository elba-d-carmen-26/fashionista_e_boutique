# Ajustes en el Proceso de Desarrollo de Software
---
Proyecto: "Fashionista e-Boutique"
Documento: "Ajustes en el Proceso de Desarrollo de Software"
Fecha: "2025-11-30"
Elaborado por: "Carmen Patiño Segura"
Revisado por: "Carmen Patiño Segura"
Aprobado por: "Carmen Patiño Segura"
Estado: "Borrador"
---

# 1. Introducción

En este informe se documentan los ajustes que se aplicarán en el proceso de desarrollo de software en futuras fases del proyecto Fashionista e-Boutique, con el fin de implementar funcionalidades avanzadas de personalización y soporte. La necesidad de este informe surge de la identificación de áreas de mejora en la planificación, ejecución y escalabilidad del proyecto, así como la integración de nuevas funcionalidades que optimicen la experiencia de los usuarios y fortalezcan la operación del negocio.

# 2. Objetivos

## 2.1. Objetivo General

Optimizar el proceso de desarrollo e implementación en fases futuras del proyecto Fashionista e-Boutique, para garantizar la eficiencia, calidad y escalabilidad de la plataforma, incorporando mejoras técnicas y operativas que faciliten la integración de nuevas funcionalidades y la experiencia de las usuarios.

## 2.2. Objetivos Específicos

- Revisar y ajustar los procesos del ciclo de desarrollo de software en el proyecto, para mejorar la eficiencia y la coordinación entre los equipos de diseño, desarrollo y pruebas.

- Implementar cambios operativos y técnicos que fortalezcan la estabilidad, seguridad y escalabilidad de la plataforma.

- Establecer un plan de evolución a corto, mediano y largo plazo para implementación de nuevas funcionalidades como la pasarela de pagos, un chat de soporte y un sistema de recomendaciones personalizadas.

# 3. Propuesta de Cambios en la Secuencia de Procesos del Ciclo de Desarrollo del Proyecto Fashionista e-Boutique

Los ajustes que se aplicarán al proceso de desarrollo e implementación en futuras fases del proyecto Fashionista e-Boutique, están enfocados principalmente en los siguientes tres aspectos:}

### - Revisión y ajuste del marco de trabajo Scrum: 

Realizar reuniones de refinamiento del Product Backlog de manera más frecuente (semanalmente) para priorizar correctamente historias de usuario complejas, especialmente relacionadas con la integración de la pasarela de pagos, el chat de soporte y el sistema de recomendaciones personalizadas.

### - Integración temprana de procesos de aseguramiento de calidad:

Cambiar el enfoque de aseguramiento de calidad del proyecto a un enfoque "Shift-left testing", en el que los profesionales de aseguramiento de calidad se involucren desde etapas tempranas del proyecto, es decir, que participen del levantamiento de requerimientos y mockups, y evalúen su calidad y pertinencia, de modo que puedan encontrarse defectos incluso desde antes de que se inicie la implementación de las funcionalidades. Adicionalmente, se implementarán pruebas automatizadas desde las etapas iniciales del desarrollo de cada módulo, para detectar errores de forma más oportuna.

### - Actualización temprana de la documentación:

Actualizar diariamiente la documentación del proyecto, desde todos los frentes (requerimientos, diseño, desarrollo y pruebas), para garantizar que la información de las funcionalidades a implementar y de las que ya se encuentran implementadas con éxito, sea pertinente y completa, facilitando la integración de nuevos miembros al equipo.

------------------------------------------------------------------------------------------------------------

A continuación, se presenta el nuevo proceso de desarrollo paso a paso propuesto para las futuras fases del proyecto Fashionista e-Boutique. Es importante tener en cuenta que este será el proceso definido para cada uno de los Sprints que se definan y se lleven a cabo dentro del proyecto.

### 1. Planificación del Sprint

- Se llevará a cabo la ceremonia del Sprint Planning el primer día de cada Sprint, en donde se seleccionarán las historias de usuario prioritarias que se implementarán en dicha iteración.

- Se evaluarán las dependencias ténicas, operativas y funcionales entre los nuevos módulos y las funcionalidades previamente implementadas.

- Se realizará la estimación de las historias de usuario, haciendo uso de técnicas como el Planning Poker, y se asignarán tareas a cada miembro del equipo.

### 2. Refinamiento de Historias de Usuario

- Se realizará una ceremonia adicional (Sprint Groomming), en la que se validarán los criterios de aceptación de las Historias de Usuario, con participación conjunta del Product Owner, el equipo de desarrollo y el equipo de QA, asi como el equipo de diseño, cuando sea requerido para revisar aspectos de UX/UI.

- Se realizará el "slicing" (desglose) de historias de usuario grandes y complejas, en historias de usuario más pequeñas y manejables.

- Se identificarán posibles riesgos técnicos, funcionales y operativos de las nuevas historias de usuario, para llevar a cabo acciones de mitigación previas al desarrollo.

### 3. Diseño y Prototipado

- Diseño de las interfaces de usuario para nuevas funcionalidades, acorde con el mapa de navegación y con las características definidas según criterios de UX/UI, accesibilidad y usabilidad.

- Elaboración de prototipos interactivos de alta calidad para los módulos nuevos (chat, pasarela, recomendaciones).

- Revisión y aprobación del diseño por parte del equipo (Desarrollo, QA, Product Owner) y de los clientes y stakeholders.

### 4. Desarrollo e Implementación

- Codificación de los nuevos módulos y mejoras, seiguiendo estándares de calidad y buenas prácticas.

- Aplicación de pruebas unitarias y de integración.

- Revisiones de código por pares (cruzadas), para asegurar calidad y consistencia. 

- Implementación de control de versiones, commits frecuentes y manejo adecuado de ramas, integrando de forma gradual los módulos nuevos a la rama principal tras la aprobación correspondiente.

- Validación de compatibilidad entre módulos y dependencias técnicas.

- Desarrollo incremental, priorizando funcionalidades críticas y resolución de defectos bloqueantes.

- Se realizarán sesiones entre el equipo de Desarrollo y QA, para validar la implementación desde etapas tempranas y antes de que sea desplegada en ambiente staging, con el fin de reducir la cantidad de errores y defectos detectados en la implementación.

### 5. Pruebas Manuales y Automatizadas

- Diseño de planes de prueba y casos de prueba que permitan validar de forma efectiva todos los criterios de aceptación definidos en las historias de usuario.

- Ejecución de pruebas manuales para validar el cumplimiento de los criterios de aceptación.

- Pruebas a los endpoints implementados con herramientas como Postman y JMeter.

- Registro de incidencias y seguimiento en el Sprint Backlog.

- Validación de las incidencias corregidas.

- Integración de pruebas automatizadas para validar regresiones en los flujos críticos de toda la aplicación.

- Pruebas de estrés y carga para funcionalidades críticas. 

### 6. Pruebas de Aceptación de Usuario (UAT)

- Simulación de escenarios reales para detectar errores funcionales o de experiencia.

- Realización del Sprint Review con clientes y stakeholders, para mostrar el incremento de producto implementado durante el sprint y obtener su retroalimentación.

- Implementación de pruebas lideradas por el equipo de diseño (UX/UI) con usuarios reales, para obtener retroalimentación sobre el diseño, la usabilidad y la accesibilidad de la plataforma tras la implementación de nuevas funcionalidades.

- Implementación de ajustes necesarios antes del despliegue a producción.

### 7. Despliegue Controlado

- Despliegue de nuevas funcionalidades en un entorno pre-productivo.

- Monitoreo de errores y rendimientos antes del despliegue a producción.

- Despliegue gradual a producción, asegurando que no se afecte a los usuarios mientras navegan por el sitio web.

### 8. Monitoreo y Retroalimentación

- Monitoreo continuo de métricas de rendimiento y uso (tráfico, compras, interacciones en el chat).

- Recolección de retroalimentación de usuarios para identificar y mapear mejoras en el Product Backlog.

- Documentación de lecciones aprendidas y ajustes para futuras iteraciones.

### 9. Revisión y Planificación del Próximo Sprint

- Realización de la Sprint Retrospective para evaluar el cumplimiento de objetivos durante el sprint actual, los aciertos y elementos positivos identificaron, las posibilidades de mejora para futuros sprint y las acciones a las que se compromete el equipo para obtener mejores resultados y trabajar de manera más articulada en futuros sprints.

- Ajuste del backlog según prioridades y feedback recibido.

- Preparación del próximo ciclo de desarrollo siguiendo la misma secuencia optimizada.

# 4. Cambios Operativos

- Reestructuración de roles y responsabilidades en el equipo para mejorar la comunicación entre desarrollo, QA, diseño y soporte.

- Establecimiento de un repositorio único para control de versiones y documentación técnica, y para el adecuado manejo de ramas del proyecto. 

- Implementación de reportes de avance con indicadores clave (KPI) como velocidad del sprint, número de incidencias y cobertura de pruebas.

# 5. Cambios Técnicos

- Actualización de frameworks y librerías a versiones más estables y seguras.

- Implementación de pruebas automatizadas: 

    - Pruebas unitarias para módulos críticos.

    - Pruebas de integración para interacciones entre módulos y servicios.

    - Pruebas end-to-end para flujos completos y críticos.

- Pipeline CI/CD: Automatizar implementación, pruebas y despliegues mediante herramientas de despliegue continuo.

- Ajustes en la arquitectura para soportar la integración futura de funcionalidades críticas como:

    - Pasarela de pagos: Debe ser segura y compatible con las tecnologías utilizadas en el proyecto, además de soportar múltiples métodos de pago.

        - Acciones técnicas específicas para la implementación de la pasarela de pagos:

            1. Selección del proveedor: Evaluar servicios como PayU, Wompi o MercadoPago, verificando para cada opción los costos por transacción, servicoel servicio técnico ofrecido y la documentación disponible.

            2. Creación del microservicio correspondiente, configurando los endpoints principales y el manejo seguro de claves mediante variables de entorno.

            3. Integración con el proveedor seleccionado: Configurar la autenticación y probar los flujos en un entorno controlado.

            4. Implementación de interfaz gráfica: Construcción de pantallas de pago con estándares UX/UI y formularios accesibles y responsivos.

            5. Pruebas de seguridad: Pruebas anti-fraude y manejo de errores.


    - Chat de soporte: Debe permitir el registro de un historial y la conexión inmediata con agentes de soporte disponibles.

        - Acciones técnicas específicas para la implementación del chat de soporte:

            1. Selección del proveedor: Evaluar tecnologías como Twilio Conversations, Zendesk y HubSpot.

            2. Construcción del microservicio correspondiente y creación de la base de datos para el historial de chats.

            3. Implementación del sistema de autenticación del chat.

            4. Construcción de la lógica para asignación de agentes: Reglas para el manejo de turnos y asignación de agentes disponibles.

            5. Interfaz gráfica del chat: Implementación de un botón flotante para acceder al chat desde cualquier página del sitio web, notificaciones en tiempo real y caja de chat, todo esto cumpliendo con estándares UX/UI, accesibilidad y diseño responsivo.

            6. Pruebas de conexión, envío de mensajes y carga de archivos.  

    - Sistema de recomendaciones personalizadas: Debe tener en cuenta la información de navegación y compra de las usuarias, y también la información recolectada acerca de sus preferencias, comportamiento, necesidades, expectativas y estilo de vida.

        - Acciones técnicas específicas para la impementación del sistema de recomendaciones personalizadas:

            1. Preparación y optimización de los datos: Normalizar datos del catálogo de productos y de la información e interacción de los usuarios en el sitio web.

            2. Construcción del formulario de recomendaciones, con un diseño responsivo y accesible.
            
            3. Construcción del microservicio correspondiente y de los endpoints principales.

            4. Modelo inicial (versión 1): Algoritmo basado en atributos, recomendando productos con base en atributos similares. 

            5. Modelo extendido (versión 2): Modelo con Machine Learning para el registro de preferencias y la agrupación por patrones de comportamiento.

            6. Integración en frontend: Añadir interfaz del sistema de recomendaciones en la página de inicio y el catálogo de productos. 

            7. Pruebas para validar pertinencia de las recomendaciones y ajustar las reglas y el algoritmo según los resultados obtenidos. 

- Contenedores Docker: Creación de imágenes individuales para fontend, backend y nuevos microservicios a implementar. 

- Escalamiento horizontal: Configuración de balanceadores de carga. 

# 6. Plan de Implementación de Ajustes:

## 6.1. Corto Plazo (1 a 6 meses)

1. Implementación inicial de la pasarela de pagos:

    - Selección del proveedor.
    - Integración del flujo básico de pago.
    - Creación de microservicio y endpoints principales.

2. Primera versión del chat de soporte:

    - Implementación del botón flotante.
    - Selección del proveedor.
    - Autenticación.
    - Chat en tiempo real con funcionalidades básicas.
    - Interfaz básica de la caja de chat.

3. Pruebas automatizadas de regresión para las funcionalidades previamente implementadas.

## 6.2. Mediano Plazo (6 meses a 12 meses)

1. Implementación del sistema de recomendaciones básico:

    - Activar recomendaciones filtradas por atributos.
    - Capturar interacciones.
    - Normalizar datos.
    - Integrar recomendaciones en la página de incio y el catálogo de productos. 

2. Segunda versión del chat de soporte:

    - Integración de envío de archivos.
    - Asignación automática de agentes.
    - Historial de chats centralizado.

3. Mejoras a la pasarela de pagos:

    - Implementación de pagos recurrentes.
    - Doble confirmación de transacciones.

4. Escalar la infraestructura para soportar un mayor tráfico y transacciones simultáneas (balanceo de carga y autoescalado en la nube.)


## 6.3. Largo Plazo (1 a 3 años)

1. Optimización del sistema de recomendaciones:

    - Incorporar modelo con Machine Learning.
    - Implementar recomendaciones por patrones de comportamiento.
    - Recomendaciones contextuales (ubicación geográfica, temporada, edad, clima).
    

2. Posibilidad de expansión mejorando la experiencia móvil (desarrollo de una aplicación móvil).

3. Integración omnicanal con otros canales digitales (redes sociales y aliados).

# 7. Riesgos y Mitigaciones

| Riesgo                                             | Probabilidad | Impacto | Mitigación                                                               |
| -------------------------------------------------- | ------------ | ------- | ------------------------------------------------------------------------ |
| Fallos en la integración de pasarela de pagos      | Media        | Alto    | Pruebas en entorno seguro, integración gradual y soporte del proveedor.  |
| Retrasos en implementación de chat de soporte      | Media        | Medio   | Planificación ágil, asignación de recursos dedicados.                    |
| Sobrecarga de la plataforma por aumento de tráfico | Alta         | Alto    | Escalamiento de infraestructura en la nube y monitoreo continuo.         |
| Baja adopción del sistema de recomendaciones       | Baja         | Medio   | Pruebas A/B, recolección de feedback de usuarias y ajustes de algoritmo. |

# 8. Recomendaciones 

- Fomentar la capacitación continua del equipo en nuevas tecnologías y tendencias de e-commerce.

- Documentar todas las decisiones técnicas y operativas para garantizar la trazabilidad y continuidad del proyecto.

- Realizar reuniones de seguimiento quincenales y trimestrales para evaluar el impacto de los cambios y ajustar estrategias.

# 9. Conclusiones

- Establecer un plan de evolución a corto, mediano y largo plazo facilita la incorporación de nuevas funcionalidades, mejoras y correcciones a defectos detectados, mejorando la experiencia de los usuarios y el avance del proyecto.

- La implementación cuidados y planificada de cambios operativos y técnicos asegura que el proyecto se pueda escalar de manera controlada y segura.

- Los ajustes propuestos permiten mejorar la eficiencia y la calidad del desarrollo de Fashionista e-Boutique, además de ofrecer funcionalidades innovadaras y vanguardistas, con lo cual se pretende mejorar la experiencia de los usuarios y brindarles un servicio optimizado y adecuado para sus necesidades específicas.


