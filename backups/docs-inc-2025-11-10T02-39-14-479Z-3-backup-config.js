/**
 * Configuración del Sistema de Respaldo
 * 
 * Este archivo contiene toda la configuración necesaria para el sistema de respaldo
 * incluyendo conexiones de base de datos, almacenamiento, cifrado y notificaciones.
 */

const path = require('path');
require('dotenv').config();

// Configuración base
const baseConfig = {
  // Base de datos
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fashionista',
    authSource: process.env.MONGODB_AUTH_SOURCE || 'admin',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },

  // Almacenamiento
  storage: {
    local: {
      enabled: true,
      basePath: process.env.BACKUP_LOCAL_PATH || path.join(__dirname, '../../backups'),
      permissions: '0755'
    },
  remote: {
  enabled: process.env.AWS_ENABLED === 'true',
  type: 's3',
  aws: {
    enabled: process.env.AWS_ENABLED === 'true',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_BUCKET_NAME || '',
    storageClass: process.env.AWS_STORAGE_CLASS || 'STANDARD'
  }
}


  },

  // Cifrado
  encryption: {
    enabled: process.env.BACKUP_ENCRYPTION_ENABLED === 'true',
    algorithm: process.env.BACKUP_ENCRYPTION_ALGORITHM || 'aes-256-gcm',
    keyPath: process.env.BACKUP_ENCRYPTION_KEY_PATH || path.join(__dirname, '../keys'),
    keyRotationDays: parseInt(process.env.BACKUP_KEY_ROTATION_DAYS) || 90
  },

  // Retención
  retention: {
    daily: parseInt(process.env.BACKUP_RETENTION_DAILY) || 30,
    weekly: parseInt(process.env.BACKUP_RETENTION_WEEKLY) || 12,
    monthly: parseInt(process.env.BACKUP_RETENTION_MONTHLY) || 12,
    yearly: parseInt(process.env.BACKUP_RETENTION_YEARLY) || 7,
    cleanupSchedule: process.env.BACKUP_SCHEDULE_CLEANUP || '0 3 * * 0',
    enabled: true
  },

  // Programación
  schedule: {
    full: process.env.BACKUP_SCHEDULE_FULL || '0 2 * * *',
    incremental: process.env.BACKUP_SCHEDULE_INCREMENTAL || '0 */6 * * *',
    timezone: process.env.BACKUP_SCHEDULE_TIMEZONE || 'America/Mexico_City'
  },

  // Notificaciones
  notifications: {
    email: {
      enabled: process.env.NOTIFICATION_EMAIL_ENABLED === 'true',
      smtp: {
        host: process.env.NOTIFICATION_EMAIL_SMTP || 'smtp.gmail.com',
        port: parseInt(process.env.NOTIFICATION_EMAIL_PORT) || 587,
        secure: process.env.NOTIFICATION_EMAIL_SECURE === 'true',
        auth: {
          user: process.env.NOTIFICATION_EMAIL_USER || '',
          pass: process.env.NOTIFICATION_EMAIL_PASS || ''
        }
      },
      from: process.env.NOTIFICATION_EMAIL_FROM || 'backups@empresa.com',
      to: process.env.NOTIFICATION_EMAIL_TO ? process.env.NOTIFICATION_EMAIL_TO.split(',') : ['admin@empresa.com']
    },
    slack: {
      enabled: process.env.NOTIFICATION_SLACK_ENABLED === 'true',
      webhook: process.env.NOTIFICATION_SLACK_WEBHOOK || '',
      channel: process.env.NOTIFICATION_SLACK_CHANNEL || '#backups'
    },
    dailySummary: process.env.NOTIFICATION_DAILY_SUMMARY === 'true'
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || path.join(__dirname, '../logs/backup.log'),
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
    datePattern: 'YYYY-MM-DD'
  },

  // Formatos de respaldo
  formats: {
    default: process.env.BACKUP_DEFAULT_FORMAT || 'bson',
    supported: ['bson', 'json', 'csv'],
    compression: {
      enabled: process.env.BACKUP_COMPRESSION_ENABLED !== 'false',
      algorithm: process.env.BACKUP_COMPRESSION_ALGORITHM || 'gzip',
      level: parseInt(process.env.BACKUP_COMPRESSION_LEVEL) || 6
    }
  },

  // Integridad
  integrity: {
    enabled: process.env.BACKUP_INTEGRITY_CHECK_ENABLED !== 'false',
    algorithm: process.env.BACKUP_INTEGRITY_ALGORITHM || 'sha256',
    verifyAfterBackup: process.env.BACKUP_VERIFY_AFTER_BACKUP !== 'false',
    verifyBeforeRestore: process.env.BACKUP_VERIFY_BEFORE_RESTORE !== 'false',
    autoVerify: process.env.BACKUP_INTEGRITY_AUTO_VERIFY === 'true'
  },

  // Rendimiento
  performance: {
    maxConcurrentBackups: parseInt(process.env.BACKUP_MAX_CONCURRENT) || 1,
    timeoutMinutes: parseInt(process.env.BACKUP_TIMEOUT_MINUTES) || 30,
    chunkSizeMB: parseInt(process.env.BACKUP_CHUNK_SIZE_MB) || 100,
    memoryLimitMB: parseInt(process.env.BACKUP_MEMORY_LIMIT_MB) || 512
  },

  // Monitoreo
  monitoring: {
    enabled: process.env.BACKUP_MONITORING_ENABLED === 'true',
    metricsPort: parseInt(process.env.BACKUP_METRICS_PORT) || 9090,
    healthCheckPort: parseInt(process.env.BACKUP_HEALTH_PORT) || 8080
  }
};

// Configuraciones por entorno
const envConfigs = {
  development: {
    retention: { daily: 3, weekly: 2, monthly: 1, yearly: 0 },
    schedule: { full: '0 */12 * * *' },
    performance: { timeoutMinutes: 10 }
  },
  testing: {
    retention: { daily: 1, weekly: 0, monthly: 0, yearly: 0 },
    schedule: { full: 'manual' },
    notifications: { email: { enabled: false }, slack: { enabled: false } }
  },
  production: {}
};

// Fusión profunda para no perder storage.remote.aws
function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development';
  const envConfig = envConfigs[env] || {};

  return {
    ...baseConfig,
    ...envConfig,
    storage: {
      ...baseConfig.storage,
      ...((envConfig.storage) ? envConfig.storage : {})
    },
    notifications: {
      ...baseConfig.notifications,
      ...((envConfig.notifications) ? envConfig.notifications : {})
    },
    schedule: {
      ...baseConfig.schedule,
      ...((envConfig.schedule) ? envConfig.schedule : {})
    },
    retention: {
      ...baseConfig.retention,
      ...((envConfig.retention) ? envConfig.retention : {})
    },
    performance: {
      ...baseConfig.performance,
      ...((envConfig.performance) ? envConfig.performance : {})
    }
  };
}

// Validación de configuración
function validateConfig() {
  const errors = [];

  if (!baseConfig.database.uri) errors.push('MONGODB_URI es requerido');
  if (!baseConfig.storage.local.enabled && !baseConfig.storage.remote.enabled) {
    errors.push('Al menos un tipo de almacenamiento debe estar habilitado');
  }
  if (baseConfig.encryption.enabled && !baseConfig.encryption.keyPath) {
    errors.push('BACKUP_ENCRYPTION_KEY_PATH es requerido cuando el cifrado está habilitado');
  }
  if (baseConfig.notifications.email.enabled) {
    if (!baseConfig.notifications.email.smtp.auth.user || !baseConfig.notifications.email.smtp.auth.pass) {
      errors.push('Credenciales de email son requeridas cuando email está habilitado');
    }
  }
  if (baseConfig.notifications.slack.enabled && !baseConfig.notifications.slack.webhook) {
    errors.push('NOTIFICATION_SLACK_WEBHOOK es requerido cuando Slack está habilitado');
  }

  if (errors.length > 0) throw new Error(`Errores de configuración:\n${errors.join('\n')}`);
}

module.exports = {
  config: getEnvironmentConfig(),
  validateConfig,
  raw: baseConfig
};
