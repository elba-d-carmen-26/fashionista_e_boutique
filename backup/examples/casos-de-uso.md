# Casos de Uso del Sistema de Respaldo

Este documento describe los casos de uso más comunes del sistema de respaldo, con ejemplos prácticos de implementación.

## 1. Caso de Uso: Pequeña Empresa

### Escenario
- Aplicación web con base de datos MongoDB
- Equipo de 5 desarrolladores
- Presupuesto limitado
- Necesidad de respaldos diarios

### Configuración Recomendada
```javascript
const config = {
  database: {
    type: 'mongodb',
    connection: {
      uri: 'mongodb://localhost:27017',
      database: 'mi_tienda'
    }
  },
  storage: {
    local: {
      enabled: true,
      path: './backups'
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
    maxCount: 30
  },
  notifications: {
    email: {
      enabled: true,
      to: ['admin@mitienda.com']
    }
  }
};
```

### Implementación
```javascript
const BackupScheduler = require('../src/BackupScheduler');
const scheduler = new BackupScheduler(config);

// Respaldo manual antes de actualizaciones
async function backupBeforeUpdate() {
  try {
    const result = await scheduler.runManualBackup('full', {
      description: 'Respaldo pre-actualización'
    });
    console.log('Respaldo completado:', result.id);
  } catch (error) {
    console.error('Error en respaldo:', error.message);
    process.exit(1);
  }
}
```

## 2. Caso de Uso: Empresa Mediana

### Escenario
- Múltiples aplicaciones y bases de datos
- Equipo de operaciones dedicado
- Requisitos de compliance
- Necesidad de respaldos incrementales

### Configuración Recomendada
```javascript
const config = {
  database: {
    type: 'mongodb',
    connection: {
      uri: process.env.MONGODB_URI,
      database: 'produccion'
    },
    collections: [
      { name: 'users', priority: 'high' },
      { name: 'orders', priority: 'high' },
      { name: 'products', priority: 'medium' }
    ]
  },
  storage: {
    local: {
      enabled: true,
      path: '/var/backups'
    },
    remote: {
      aws: {
        enabled: true,
        bucket: 'empresa-backups',
        region: 'us-east-1'
      }
    }
  },
  schedule: {
    full: {
      enabled: true,
      cron: '0 1 * * 0' // Semanal
    },
    incremental: {
      enabled: true,
      cron: '0 */6 * * *' // Cada 6 horas
    }
  },
  encryption: {
    enabled: true,
    algorithm: 'aes-256-gcm'
  },
  notifications: {
    email: {
      enabled: true,
      to: ['ops@empresa.com', 'dba@empresa.com']
    },
    slack: {
      enabled: true,
      channel: '#ops-alerts'
    }
  }
};
```

### Script de Monitoreo
```javascript
const scheduler = new BackupScheduler(config);

// Monitoreo de salud del sistema
async function healthCheck() {
  const status = scheduler.getStatus();
  const stats = await scheduler.getStorageStats();
  
  // Verificar si hay respaldos fallidos
  if (status.stats.failedBackups > 0) {
    console.warn('Respaldos fallidos detectados:', status.stats.failedBackups);
  }
  
  // Verificar espacio de almacenamiento
  Object.entries(stats).forEach(([provider, stat]) => {
    if (stat.totalSize > config.retention.maxTotalSize * 0.9) {
      console.warn(`Almacenamiento ${provider} casi lleno:`, stat.totalSize);
    }
  });
}

// Ejecutar cada 15 minutos
setInterval(healthCheck, 15 * 60 * 1000);
```

## 3. Caso de Uso: Empresa Grande

### Escenario
- Infraestructura distribuida
- Múltiples centros de datos
- Requisitos de alta disponibilidad
- Compliance estricto (SOX, GDPR)

### Configuración Recomendada
```javascript
const config = {
  database: {
    type: 'mongodb',
    connection: {
      uri: process.env.MONGODB_CLUSTER_URI,
      database: 'enterprise_prod'
    }
  },
  storage: {
    local: {
      enabled: true,
      path: '/enterprise/backups'
    },
    remote: {
      aws: {
        enabled: true,
        bucket: 'enterprise-primary-backups',
        storageClass: 'STANDARD_IA'
      },
      gcp: {
        enabled: true,
        bucket: 'enterprise-secondary-backups',
        storageClass: 'NEARLINE'
      }
    }
  },
  schedule: {
    full: {
      enabled: true,
      cron: '0 1 * * 0'
    },
    incremental: {
      enabled: true,
      cron: '0 */2 * * *' // Cada 2 horas
    }
  },
  retention: {
    policies: {
      full: { days: 365, minCount: 12 }, // Retención anual
      incremental: { days: 90, minCount: 30 }
    }
  },
  encryption: {
    enabled: true,
    keyRotation: {
      enabled: true,
      intervalDays: 90
    }
  },
  monitoring: {
    enabled: true,
    metrics: { enabled: true },
    alerts: { enabled: true }
  }
};
```

### Sistema de Recuperación ante Desastres
```javascript
class DisasterRecoveryManager {
  constructor(scheduler) {
    this.scheduler = scheduler;
    this.recoveryProcedures = new Map();
  }

  async initiateDisasterRecovery(scenario) {
    console.log(`Iniciando recuperación ante desastre: ${scenario}`);
    
    try {
      // 1. Evaluar daños
      const assessment = await this.assessDamage();
      
      // 2. Seleccionar respaldo más reciente válido
      const backups = await this.scheduler.listBackups();
      const latestValid = backups.find(b => b.verified && b.type === 'full');
      
      // 3. Iniciar restauración
      const recovery = await this.scheduler.restoreBackup(latestValid.id, {
        target: process.env.RECOVERY_DATABASE_URI,
        verify: true
      });
      
      // 4. Validar recuperación
      await this.validateRecovery(recovery);
      
      console.log('Recuperación completada exitosamente');
      return recovery;
      
    } catch (error) {
      console.error('Error en recuperación:', error);
      throw error;
    }
  }

  async assessDamage() {
    // Implementar evaluación de daños
    return { severity: 'high', affectedSystems: ['database'] };
  }

  async validateRecovery(recovery) {
    // Implementar validación de recuperación
    return true;
  }
}
```

## 4. Caso de Uso: Desarrollo y Testing

### Escenario
- Entorno de desarrollo
- Necesidad de datos de prueba
- Respaldos frecuentes durante desarrollo
- Restauración rápida

### Configuración Recomendada
```javascript
const config = {
  database: {
    type: 'mongodb',
    connection: {
      uri: 'mongodb://localhost:27017',
      database: 'desarrollo'
    }
  },
  storage: {
    local: {
      enabled: true,
      path: './dev-backups'
    }
  },
  schedule: {
    full: {
      enabled: false // Solo respaldos manuales
    }
  },
  retention: {
    days: 7, // Solo una semana
    maxCount: 20
  },
  compression: {
    enabled: true,
    level: 9 // Máxima compresión
  },
  notifications: {
    email: { enabled: false },
    slack: { enabled: false }
  }
};
```

### Scripts de Desarrollo
```javascript
const scheduler = new BackupScheduler(config);

// Respaldo antes de cambios importantes
async function saveCheckpoint(description) {
  const result = await scheduler.runManualBackup('full', {
    description: `Checkpoint: ${description}`,
    tags: ['development', 'checkpoint']
  });
  console.log(`Checkpoint guardado: ${result.id}`);
  return result.id;
}

// Restaurar a un checkpoint específico
async function restoreCheckpoint(backupId) {
  await scheduler.restoreBackup(backupId, {
    target: 'mongodb://localhost:27017/desarrollo'
  });
  console.log(`Restaurado a checkpoint: ${backupId}`);
}

// Limpiar respaldos de desarrollo
async function cleanupDevBackups() {
  const backups = await scheduler.listBackups();
  const oldBackups = backups.filter(b => 
    Date.now() - b.timestamp > 7 * 24 * 60 * 60 * 1000
  );
  
  for (const backup of oldBackups) {
    await scheduler.deleteBackup(backup.id);
  }
  
  console.log(`Limpiados ${oldBackups.length} respaldos antiguos`);
}
```

## 5. Caso de Uso: Migración de Datos

### Escenario
- Migración entre servidores
- Cambio de versión de base de datos
- Transferencia de datos entre entornos

### Implementación
```javascript
class DataMigrationManager {
  constructor(sourceConfig, targetConfig) {
    this.sourceScheduler = new BackupScheduler(sourceConfig);
    this.targetScheduler = new BackupScheduler(targetConfig);
  }

  async migrateData(options = {}) {
    console.log('Iniciando migración de datos...');
    
    try {
      // 1. Crear respaldo del origen
      const backup = await this.sourceScheduler.runManualBackup('full', {
        description: 'Respaldo para migración',
        format: options.format || 'bson'
      });
      
      // 2. Transferir respaldo al destino
      const transferResult = await this.transferBackup(backup, options);
      
      // 3. Restaurar en el destino
      const restoreResult = await this.targetScheduler.restoreBackup(backup.id, {
        target: options.targetDatabase,
        transform: options.transform,
        verify: true
      });
      
      // 4. Validar migración
      await this.validateMigration(backup, restoreResult);
      
      console.log('Migración completada exitosamente');
      return restoreResult;
      
    } catch (error) {
      console.error('Error en migración:', error);
      throw error;
    }
  }

  async transferBackup(backup, options) {
    // Implementar transferencia de respaldo
    console.log(`Transfiriendo respaldo ${backup.id}...`);
    return { transferred: true, size: backup.size };
  }

  async validateMigration(sourceBackup, restoreResult) {
    // Implementar validación de migración
    console.log('Validando migración...');
    return true;
  }
}

// Uso
const migrationManager = new DataMigrationManager(sourceConfig, targetConfig);
await migrationManager.migrateData({
  targetDatabase: 'mongodb://new-server:27017/produccion',
  format: 'json',
  transform: data => transformData(data)
});
```

## 6. Caso de Uso: Compliance y Auditoría

### Escenario
- Requisitos de compliance (SOX, GDPR, HIPAA)
- Auditorías regulares
- Retención a largo plazo
- Trazabilidad completa

### Configuración Especializada
```javascript
const complianceConfig = {
  // ... configuración base ...
  
  retention: {
    policies: {
      full: {
        days: 2555, // 7 años para compliance
        minCount: 84, // Mínimo semanal por 7 años
        immutable: true // No se pueden eliminar
      }
    }
  },
  
  encryption: {
    enabled: true,
    algorithm: 'aes-256-gcm',
    keyRotation: {
      enabled: true,
      intervalDays: 90,
      auditTrail: true
    }
  },
  
  logging: {
    audit: {
      enabled: true,
      events: ['all'],
      retention: 2555, // 7 años
      immutable: true,
      digitalSignature: true
    }
  },
  
  integrity: {
    enabled: true,
    checksums: ['sha256', 'sha512'],
    verifySchedule: '0 0 * * 0', // Semanal
    auditTrail: true
  }
};
```

### Sistema de Auditoría
```javascript
class ComplianceAuditor {
  constructor(scheduler) {
    this.scheduler = scheduler;
  }

  async generateComplianceReport(startDate, endDate) {
    const report = {
      period: { start: startDate, end: endDate },
      backups: [],
      integrity: [],
      access: [],
      compliance: {}
    };

    // Obtener todos los respaldos del período
    const backups = await this.scheduler.listBackups();
    report.backups = backups.filter(b => 
      b.timestamp >= startDate && b.timestamp <= endDate
    );

    // Verificar integridad
    for (const backup of report.backups) {
      const integrity = await this.verifyBackupIntegrity(backup.id);
      report.integrity.push({
        backupId: backup.id,
        verified: integrity.valid,
        checksums: integrity.checksums
      });
    }

    // Obtener logs de acceso
    report.access = await this.getAccessLogs(startDate, endDate);

    // Evaluar compliance
    report.compliance = await this.evaluateCompliance(report);

    return report;
  }

  async verifyBackupIntegrity(backupId) {
    // Implementar verificación de integridad
    return { valid: true, checksums: ['sha256', 'sha512'] };
  }

  async getAccessLogs(startDate, endDate) {
    // Implementar obtención de logs de acceso
    return [];
  }

  async evaluateCompliance(report) {
    // Implementar evaluación de compliance
    return {
      sox: { compliant: true, issues: [] },
      gdpr: { compliant: true, issues: [] },
      hipaa: { compliant: true, issues: [] }
    };
  }
}
```

## Mejores Prácticas

### 1. Configuración de Producción
- Usar variables de entorno para credenciales
- Implementar rotación de claves de cifrado
- Configurar múltiples proveedores de almacenamiento
- Establecer alertas proactivas

### 2. Monitoreo y Alertas
- Monitorear duración de respaldos
- Alertar sobre fallos consecutivos
- Verificar espacio de almacenamiento
- Validar integridad regularmente

### 3. Seguridad
- Cifrar respaldos en reposo y en tránsito
- Implementar control de acceso basado en roles
- Mantener logs de auditoría
- Realizar pruebas de penetración

### 4. Recuperación
- Documentar procedimientos de recuperación
- Realizar pruebas de recuperación regulares
- Mantener múltiples copias en ubicaciones diferentes
- Establecer objetivos de tiempo de recuperación (RTO/RPO)

### 5. Optimización
- Usar compresión apropiada para el tipo de datos
- Implementar respaldos incrementales
- Optimizar horarios para minimizar impacto
- Monitorear y ajustar rendimiento