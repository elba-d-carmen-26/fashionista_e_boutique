# Sistema de Respaldo de Datos

Un sistema completo y robusto para el respaldo automático de bases de datos MongoDB con soporte para múltiples proveedores de almacenamiento, cifrado, verificación de integridad y notificaciones.

## 🚀 Características Principales

- **Respaldos Automáticos**: Programación flexible con cron para respaldos completos e incrementales
- **Múltiples Formatos**: Soporte para BSON, JSON, SQL y CSV
- **Almacenamiento Múltiple**: Local, AWS S3, Google Cloud Storage, FTP/SFTP
- **Seguridad**: Cifrado AES-256-GCM con rotación de claves
- **Verificación de Integridad**: Checksums múltiples y validación de estructura
- **Notificaciones**: Email (SMTP) y Slack con plantillas personalizables
- **Logging Avanzado**: Logs estructurados con rotación automática
- **Políticas de Retención**: Configurables por tipo de respaldo
- **Monitoreo**: Métricas, alertas y reportes de salud
- **API REST**: Interfaz web para gestión y monitoreo

## 📋 Requisitos del Sistema

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **MongoDB**: >= 4.4
- **Espacio en Disco**: Mínimo 10GB para respaldos locales
- **Memoria RAM**: Mínimo 2GB recomendado

### Dependencias Opcionales

- **AWS CLI**: Para almacenamiento en S3
- **Google Cloud SDK**: Para almacenamiento en GCS
- **OpenSSL**: Para cifrado avanzado

## 🛠️ Instalación

### Instalación Rápida

```bash
# Clonar o descargar el sistema
cd sistema-respaldo-datos

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Probar configuración
npm run test-config

# Iniciar sistema
npm start
```

### Instalación Detallada

1. **Preparar el entorno**:
```bash
# Crear directorio para respaldos
mkdir -p /var/backups/mongodb
chmod 755 /var/backups/mongodb

# Crear usuario para respaldos (opcional)
sudo useradd -r -s /bin/false backup-user
sudo chown backup-user:backup-user /var/backups/mongodb
```

2. **Configurar MongoDB**:
```bash
# Crear usuario de respaldo en MongoDB
mongo admin --eval "
db.createUser({
  user: 'backup_user',
  pwd: 'secure_password',
  roles: ['backup', 'readAnyDatabase']
})
"
```

3. **Configurar variables de entorno**:
```bash
# .env
MONGODB_URI=mongodb://backup_user:secure_password@localhost:27017
DATABASE_NAME=mi_aplicacion
BACKUP_PATH=/var/backups/mongodb
ENCRYPTION_KEY=tu_clave_secreta_de_32_caracteres
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_de_aplicacion
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_BUCKET_NAME=mi-bucket-respaldos
```

## 🔧 Configuración

### Configuración Básica

```javascript
// config/backup-config.js
const config = {
  database: {
    type: 'mongodb',
    connection: {
      uri: process.env.MONGODB_URI,
      database: process.env.DATABASE_NAME
    }
  },
  storage: {
    local: {
      enabled: true,
      path: process.env.BACKUP_PATH
    }
  },
  schedule: {
    full: {
      enabled: true,
      cron: '0 2 * * *' // Diario a las 2:00 AM
    }
  },
  retention: {
    days: 30,
    maxCount: 50
  }
};

module.exports = config;
```

### Configuración Avanzada

Ver ejemplos en:
- `examples/configuracion-basica.js` - Configuración simple
- `examples/configuracion-empresarial.js` - Configuración completa
- `examples/casos-de-uso.md` - Casos de uso específicos

## 🚀 Uso

### Scripts de Línea de Comandos

```bash
# Crear respaldo manual
npm run backup "Respaldo antes de actualización"

# Listar respaldos disponibles
npm run list

# Restaurar último respaldo
npm run restore

# Verificar integridad de respaldos
npm run verify

# Limpiar respaldos antiguos (simulación)
npm run cleanup -- --dry-run

# Obtener estadísticas
npm run stats

# Probar configuración
npm run test
```

### Uso Programático

```javascript
const BackupScheduler = require('./src/BackupScheduler');
const config = require('./config/backup-config');

const scheduler = new BackupScheduler(config);

// Iniciar sistema automático
await scheduler.start();

// Respaldo manual
const backup = await scheduler.runManualBackup('full', {
  description: 'Respaldo manual'
});

// Restaurar respaldo
await scheduler.restoreBackup(backup.id, {
  target: 'mongodb://localhost:27017/restauracion'
});

// Verificar integridad
const verification = await scheduler.verifyBackup(backup.id);

// Obtener estadísticas
const stats = await scheduler.getStats();
```

### Scripts de Utilidad

```javascript
const BackupUtils = require('./examples/scripts-utiles');

const utils = new BackupUtils();

// Respaldo rápido
await utils.quickBackup('Mi respaldo');

// Listar respaldos
await utils.listBackups();

// Verificar todos los respaldos
await utils.verifyAllBackups();

// Limpiar respaldos antiguos
await utils.cleanupOldBackups();

// Obtener estadísticas
await utils.getStats();
```

## 📊 Monitoreo y Alertas

### Dashboard Web

El sistema incluye un dashboard web accesible en `http://localhost:3001`:

- Estado en tiempo real de respaldos
- Métricas de rendimiento
- Logs de actividad
- Configuración de alertas
- Gestión de respaldos

### Métricas Disponibles

- Duración de respaldos
- Tamaño de respaldos
- Tasa de éxito/fallo
- Uso de almacenamiento
- Rendimiento de red
- Estado de integridad

### Alertas Configurables

- Fallos de respaldo
- Espacio de almacenamiento bajo
- Respaldos corruptos
- Tiempo de respaldo excesivo
- Problemas de conectividad

## 🔐 Seguridad

### Cifrado

- **Algoritmo**: AES-256-GCM
- **Rotación de Claves**: Automática cada 90 días
- **Gestión de Claves**: Soporte para HSM y servicios de nube

### Control de Acceso

- Autenticación basada en tokens
- Roles y permisos granulares
- Auditoría de accesos
- Integración con LDAP/AD

### Compliance

- Logs de auditoría inmutables
- Retención configurable
- Cifrado en reposo y tránsito
- Cumplimiento GDPR/SOX/HIPAA

## 🔄 Recuperación ante Desastres

### Procedimientos de Recuperación

1. **Evaluación de Daños**:
```bash
npm run test-config
npm run verify
```

2. **Selección de Respaldo**:
```bash
npm run list
# Seleccionar respaldo más reciente válido
```

3. **Restauración**:
```bash
npm run restore [backup-id] [target-database]
```

4. **Validación**:
```bash
# Verificar integridad de datos restaurados
npm run verify-restore [backup-id]
```

### RTO/RPO Objetivos

- **RTO (Recovery Time Objective)**: < 4 horas
- **RPO (Recovery Point Objective)**: < 1 hora
- **Disponibilidad**: 99.9%

## 📁 Estructura del Proyecto

```
sistema-respaldo-datos/
├── src/                    # Código fuente principal
│   ├── BackupEngine.js     # Motor de respaldos
│   ├── BackupScheduler.js  # Programador principal
│   ├── IntegrityChecker.js # Verificación de integridad
│   ├── Logger.js           # Sistema de logging
│   ├── NotificationService.js # Notificaciones
│   └── StorageManager.js   # Gestión de almacenamiento
├── config/                 # Configuraciones
│   └── backup-config.js    # Configuración principal
├── examples/               # Ejemplos y scripts
│   ├── configuracion-basica.js
│   ├── configuracion-empresarial.js
│   ├── casos-de-uso.md
│   └── scripts-utiles.js
├── docs/                   # Documentación
│   └── sistema-respaldo.md
├── tests/                  # Pruebas unitarias
├── logs/                   # Archivos de log
├── backups/               # Respaldos locales (por defecto)
├── package.json           # Dependencias y scripts
├── README.md              # Este archivo
└── .env.example           # Plantilla de variables de entorno
```

## 🧪 Pruebas

### Ejecutar Pruebas

```bash
# Todas las pruebas
npm test

# Pruebas específicas
npm test -- --grep "BackupEngine"

# Cobertura de código
npm run test:coverage

# Pruebas de integración
npm run test:integration
```

### Pruebas de Carga

```bash
# Simular múltiples respaldos concurrentes
npm run test:load

# Probar con bases de datos grandes
npm run test:large-db
```

## 🔧 Mantenimiento

### Tareas Regulares

1. **Verificación de Integridad** (Semanal):
```bash
npm run verify
```

2. **Limpieza de Respaldos** (Mensual):
```bash
npm run cleanup
```

3. **Actualización de Dependencias** (Trimestral):
```bash
npm audit
npm update
```

4. **Rotación de Claves** (Según política):
```bash
npm run rotate-keys
```

### Optimización

- Monitorear uso de recursos
- Ajustar horarios de respaldo
- Optimizar políticas de retención
- Revisar configuración de compresión

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error de Conexión a MongoDB**:
```bash
# Verificar conectividad
npm run test-config
# Revisar logs
tail -f logs/backup.log
```

2. **Espacio Insuficiente**:
```bash
# Verificar espacio
df -h
# Limpiar respaldos antiguos
npm run cleanup
```

3. **Respaldos Corruptos**:
```bash
# Verificar integridad
npm run verify
# Regenerar checksums
npm run regenerate-checksums
```

### Logs de Depuración

```bash
# Habilitar logs detallados
export LOG_LEVEL=debug
npm start

# Ver logs en tiempo real
tail -f logs/backup.log | jq '.'
```

## 📞 Soporte

### Documentación Adicional

- [Documentación Técnica Completa](docs/sistema-respaldo.md)
- [Casos de Uso](examples/casos-de-uso.md)
- [API Reference](docs/api-reference.md)
- [FAQ](docs/faq.md)

### Contacto

- **Email**: soporte@empresa.com
- **Slack**: #sistema-respaldos
- **Issues**: [GitHub Issues](https://github.com/empresa/sistema-respaldo-datos/issues)

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## 📈 Roadmap

### Versión 1.1
- [ ] Soporte para PostgreSQL
- [ ] Interfaz web mejorada
- [ ] Respaldos incrementales optimizados

### Versión 1.2
- [ ] Soporte para MySQL
- [ ] Integración con Kubernetes
- [ ] Machine Learning para optimización

### Versión 2.0
- [ ] Arquitectura distribuida
- [ ] Soporte multi-tenant
- [ ] API GraphQL

---

**Desarrollado con ❤️ para la protección de datos empresariales**