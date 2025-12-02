/**
 * Configuración Empresarial del Sistema de Respaldo
 * 
 * Este archivo muestra una configuración avanzada para entornos empresariales
 * con múltiples proveedores de almacenamiento, cifrado, y monitoreo completo.
 */

module.exports = {
  // Configuración de la base de datos
  database: {
    type: 'mongodb',
    connection: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      database: process.env.DB_NAME || 'produccion',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      }
    },
    // Colecciones críticas para respaldo prioritario
    collections: [
      { name: 'users', priority: 'high' },
      { name: 'orders', priority: 'high' },
      { name: 'products', priority: 'medium' },
      { name: 'analytics', priority: 'low' }
    ],
    excludeCollections: ['sessions', 'temp_data', 'cache']
  },

  // Configuración de almacenamiento múltiple
  storage: {
    // Almacenamiento local (respaldo primario)
    local: {
      enabled: true,
      path: '/var/backups/mongodb',
      useSubdirectories: true,
      permissions: '0600'
    },
    
    // Almacenamiento remoto
    remote: {
      // AWS S3 (respaldo secundario)
      aws: {
        enabled: true,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
        bucket: process.env.AWS_BACKUP_BUCKET || 'empresa-backups',
        storageClass: 'STANDARD_IA', // Para optimizar costos
        serverSideEncryption: 'AES256'
      },
      
      // Google Cloud Storage (respaldo terciario)
      gcp: {
        enabled: true,
        projectId: process.env.GCP_PROJECT_ID,
        keyFile: process.env.GCP_KEY_FILE || './gcp-service-account.json',
        bucket: process.env.GCP_BACKUP_BUCKET || 'empresa-backups-gcp',
        storageClass: 'NEARLINE'
      },
      
      // SFTP (respaldo offsite)
      sftp: {
        enabled: true,
        host: process.env.SFTP_HOST,
        port: process.env.SFTP_PORT || 22,
        username: process.env.SFTP_USER,
        privateKey: process.env.SFTP_PRIVATE_KEY,
        remotePath: '/backups/mongodb',
        keepAlive: true
      }
    }
  },

  // Programación de respaldos empresarial
  schedule: {
    timezone: 'America/Bogota',
    
    // Respaldo completo semanal
    full: {
      enabled: true,
      cron: '0 1 * * 0', // Domingos a la 1:00 AM
      priority: 'high'
    },
    
    // Respaldo incremental cada 4 horas
    incremental: {
      enabled: true,
      cron: '0 */4 * * *',
      priority: 'medium'
    },
    
    // Respaldo diferencial diario
    differential: {
      enabled: true,
      cron: '0 23 * * *', // 11:00 PM diario
      priority: 'medium'
    }
  },

  // Políticas de retención empresarial
  retention: {
    enabled: true,
    // Retención por tipo de respaldo
    policies: {
      full: {
        days: 90,        // 3 meses
        maxCount: 12,    // Máximo 12 respaldos completos
        minCount: 3      // Mínimo 3 respaldos completos
      },
      incremental: {
        days: 30,        // 1 mes
        maxCount: 180,   // Máximo 180 respaldos incrementales
        minCount: 7      // Mínimo 7 respaldos incrementales
      },
      differential: {
        days: 60,        // 2 meses
        maxCount: 60,    // Máximo 60 respaldos diferenciales
        minCount: 7      // Mínimo 7 respaldos diferenciales
      }
    },
    // Tamaño máximo total: 100GB
    maxTotalSize: 100 * 1024 * 1024 * 1024,
    cleanupSchedule: '0 4 * * *' // 4:00 AM diario
  },

  // Configuración de compresión avanzada
  compression: {
    enabled: true,
    algorithm: 'lz4', // Más rápido para entornos empresariales
    level: 4,
    // Compresión adaptativa según el tamaño
    adaptive: true,
    thresholds: {
      small: { size: '100MB', algorithm: 'gzip', level: 9 },
      medium: { size: '1GB', algorithm: 'lz4', level: 6 },
      large: { size: '10GB', algorithm: 'lz4', level: 4 }
    }
  },

  // Configuración de cifrado empresarial
  encryption: {
    enabled: true,
    algorithm: 'aes-256-gcm',
    key: process.env.BACKUP_ENCRYPTION_KEY,
    // Rotación de claves
    keyRotation: {
      enabled: true,
      intervalDays: 90,
      keyDerivation: 'pbkdf2'
    },
    // Cifrado en tránsito
    transitEncryption: true
  },

  // Verificación de integridad empresarial
  integrity: {
    enabled: true,
    verifyAfterBackup: true,
    autoVerify: true,
    verifySchedule: '0 5 * * 0', // Domingos a las 5:00 AM
    // Verificación profunda mensual
    deepVerification: {
      enabled: true,
      schedule: '0 6 1 * *', // Primer día del mes a las 6:00 AM
      includeRestore: true
    },
    // Checksums múltiples
    checksums: ['sha256', 'md5'],
    // Verificación de metadatos
    verifyMetadata: true
  },

  // Configuración de notificaciones empresarial
  notifications: {
    // Email con múltiples destinatarios
    email: {
      enabled: true,
      smtp: {
        host: process.env.SMTP_HOST || 'smtp.empresa.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      },
      from: 'Sistema de Respaldo <respaldos@empresa.com>',
      to: [
        'admin@empresa.com',
        'dba@empresa.com',
        'ops@empresa.com'
      ],
      // Escalación de errores
      escalation: {
        enabled: true,
        levels: [
          { after: '1h', to: ['manager@empresa.com'] },
          { after: '4h', to: ['cto@empresa.com'] }
        ]
      }
    },
    
    // Slack para el equipo de operaciones
    slack: {
      enabled: true,
      webhook: process.env.SLACK_WEBHOOK,
      channel: '#ops-respaldos',
      // Notificaciones por severidad
      channels: {
        info: '#ops-respaldos',
        warning: '#ops-alerts',
        error: '#ops-critical'
      },
      mentions: {
        error: ['@ops-team'],
        critical: ['@ops-team', '@management']
      }
    },
    
    // Resumen ejecutivo semanal
    executiveSummary: {
      enabled: true,
      schedule: '0 9 * * 1', // Lunes a las 9:00 AM
      recipients: ['cto@empresa.com', 'manager@empresa.com']
    },
    
    dailySummary: true
  },

  // Configuración de logging empresarial
  logging: {
    level: 'info',
    file: '/var/log/backup/backup.log',
    maxSize: '50m',
    maxFiles: 10,
    format: 'json',
    // Logging estructurado
    structured: true,
    // Correlación de logs
    correlationId: true,
    // Logging de auditoría
    audit: {
      enabled: true,
      file: '/var/log/backup/audit.log',
      events: ['backup_start', 'backup_complete', 'restore_start', 'restore_complete']
    },
    // Integración con sistemas de monitoreo
    external: {
      syslog: {
        enabled: true,
        host: 'syslog.empresa.com',
        port: 514
      },
      elasticsearch: {
        enabled: true,
        host: 'elasticsearch.empresa.com',
        index: 'backup-logs'
      }
    }
  },

  // Configuración de rendimiento empresarial
  performance: {
    parallelOperations: 4,
    chunkSize: 5 * 1024 * 1024, // 5MB
    timeout: 60 * 60 * 1000, // 1 hora
    // Pool de conexiones
    connectionPool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000
    },
    // Limitación de ancho de banda
    bandwidth: {
      limit: '100MB/s',
      adaptive: true
    },
    // Optimizaciones de memoria
    memory: {
      maxHeapSize: '2GB',
      gcOptimization: true
    }
  },

  // Configuración de monitoreo
  monitoring: {
    enabled: true,
    metrics: {
      enabled: true,
      endpoint: '/metrics',
      port: 9090
    },
    healthCheck: {
      enabled: true,
      endpoint: '/health',
      interval: 30000
    },
    // Alertas proactivas
    alerts: {
      enabled: true,
      thresholds: {
        backupDuration: '2h',
        failureRate: 0.1,
        storageUsage: 0.8
      }
    }
  },

  // Configuración de seguridad
  security: {
    // Control de acceso
    accessControl: {
      enabled: true,
      roles: ['admin', 'operator', 'viewer'],
      permissions: {
        admin: ['backup', 'restore', 'configure', 'view'],
        operator: ['backup', 'view'],
        viewer: ['view']
      }
    },
    // Auditoría de seguridad
    audit: {
      enabled: true,
      events: ['access', 'configuration_change', 'backup_access'],
      retention: 365 // días
    }
  },

  // Configuración de recuperación ante desastres
  disasterRecovery: {
    enabled: true,
    // Sitio de respaldo secundario
    secondarySite: {
      enabled: true,
      replication: 'async',
      syncInterval: '1h'
    },
    // Procedimientos de recuperación
    procedures: {
      rto: '4h', // Recovery Time Objective
      rpo: '1h'  // Recovery Point Objective
    }
  }
};

/**
 * Ejemplo de uso empresarial:
 * 
 * const config = require('./configuracion-empresarial');
 * const BackupScheduler = require('../src/BackupScheduler');
 * 
 * // Inicializar con configuración empresarial
 * const scheduler = new BackupScheduler(config);
 * 
 * // Monitoreo del estado
 * setInterval(async () => {
 *   const status = scheduler.getStatus();
 *   console.log('Estado del sistema:', status);
 * }, 60000);
 * 
 * // Manejo de señales para cierre graceful
 * process.on('SIGTERM', () => {
 *   scheduler.stop();
 *   process.exit(0);
 * });
 */