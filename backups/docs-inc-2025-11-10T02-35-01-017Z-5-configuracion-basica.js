/**
 * Configuración Básica del Sistema de Respaldo
 * 
 * Este archivo muestra una configuración básica para empezar a usar
 * el sistema de respaldo con almacenamiento local y notificaciones por email.
 */

module.exports = {
  // Configuración de la base de datos
  database: {
    type: 'mongodb',
    connection: {
      uri: 'mongodb://localhost:27017',
      database: 'mi_aplicacion',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    },
    // Colecciones a respaldar (vacío = todas)
    collections: [],
    // Excluir colecciones específicas
    excludeCollections: ['sessions', 'logs']
  },

  // Configuración de almacenamiento
  storage: {
    // Almacenamiento local
    local: {
      enabled: true,
      path: './backups',
      // Crear subdirectorios por fecha
      useSubdirectories: true
    },
    
    // Almacenamiento remoto (deshabilitado en configuración básica)
    remote: {
      aws: { enabled: false },
      gcp: { enabled: false },
      ftp: { enabled: false },
      sftp: { enabled: false }
    }
  },

  // Programación de respaldos
  schedule: {
    timezone: 'America/Bogota',
    
    // Respaldo completo diario a las 2:00 AM
    full: {
      enabled: true,
      cron: '0 2 * * *'
    },
    
    // Respaldo incremental cada 6 horas
    incremental: {
      enabled: true,
      cron: '0 */6 * * *'
    }
  },

  // Políticas de retención
  retention: {
    enabled: true,
    // Mantener respaldos por 30 días
    days: 30,
    // Máximo 100 respaldos
    maxCount: 100,
    // Máximo 10GB de respaldos
    maxSize: 10 * 1024 * 1024 * 1024, // 10GB en bytes
    // Limpiar respaldos antiguos diariamente a las 3:00 AM
    cleanupSchedule: '0 3 * * *'
  },

  // Configuración de compresión
  compression: {
    enabled: true,
    algorithm: 'gzip',
    level: 6
  },

  // Configuración de cifrado (opcional)
  encryption: {
    enabled: false,
    algorithm: 'aes-256-gcm',
    // En producción, usar variables de entorno
    key: process.env.BACKUP_ENCRYPTION_KEY || null
  },

  // Verificación de integridad
  integrity: {
    enabled: true,
    // Verificar después de cada respaldo
    verifyAfterBackup: true,
    // Verificación automática semanal
    autoVerify: true,
    verifySchedule: '0 3 * * 0' // Domingos a las 3:00 AM
  },

  // Configuración de notificaciones
  notifications: {
    // Notificaciones por email
    email: {
      enabled: true,
      smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || 'tu-email@gmail.com',
          pass: process.env.EMAIL_PASS || 'tu-password-de-aplicacion'
        }
      },
      from: 'Sistema de Respaldo <respaldos@tuempresa.com>',
      to: ['admin@tuempresa.com']
    },
    
    // Slack (deshabilitado en configuración básica)
    slack: {
      enabled: false,
      webhook: process.env.SLACK_WEBHOOK || null,
      channel: '#respaldos'
    },
    
    // Enviar resumen diario
    dailySummary: true
  },

  // Configuración de logging
  logging: {
    level: 'info',
    file: './logs/backup.log',
    maxSize: '10m',
    maxFiles: 5,
    format: 'json'
  },

  // Configuración de rendimiento
  performance: {
    // Número de operaciones paralelas
    parallelOperations: 2,
    // Tamaño de chunk para transferencias
    chunkSize: 1024 * 1024, // 1MB
    // Timeout para operaciones
    timeout: 30 * 60 * 1000 // 30 minutos
  }
};

/**
 * Ejemplo de uso:
 * 
 * const config = require('./configuracion-basica');
 * const BackupScheduler = require('../src/BackupScheduler');
 * 
 * const scheduler = new BackupScheduler(config);
 * 
 * // El sistema iniciará automáticamente según la programación
 * // También puedes ejecutar respaldos manuales:
 * // await scheduler.runManualBackup('full');
 */