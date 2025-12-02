/**
 * Scripts de Utilidad para el Sistema de Respaldo
 * 
 * Este archivo contiene scripts útiles para operaciones comunes
 * del sistema de respaldo.
 */

const BackupScheduler = require('../src/BackupScheduler');
const path = require('path');
const fs = require('fs').promises;

/**
 * Configuración por defecto para scripts de utilidad
 */
const defaultConfig = {
  database: {
    type: 'mongodb',
    connection: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      database: process.env.DATABASE_NAME || 'mi_aplicacion'
    }
  },
  storage: {
    local: {
      enabled: true,
      path: process.env.BACKUP_PATH || './backups'
    }
  },
  notifications: {
    email: {
      enabled: false
    }
  },
  logging: {
    level: 'info',
    format: 'json'
  }
};

/**
 * Clase de utilidades para respaldos
 */
class BackupUtils {
  constructor(config = defaultConfig) {
    this.scheduler = new BackupScheduler(config);
    this.config = config;
  }

  /**
   * Crear un respaldo rápido con descripción personalizada
   */
  async quickBackup(description = 'Respaldo manual') {
    console.log(`🔄 Iniciando respaldo: ${description}`);
    
    try {
      const result = await this.scheduler.runManualBackup('full', {
        description,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ Respaldo completado exitosamente`);
      console.log(`   ID: ${result.id}`);
      console.log(`   Tamaño: ${this.formatBytes(result.size)}`);
      console.log(`   Ubicación: ${result.path}`);
      
      return result;
    } catch (error) {
      console.error(`❌ Error en respaldo: ${error.message}`);
      throw error;
    }
  }

  /**
   * Listar respaldos disponibles con información detallada
   */
  async listBackups(options = {}) {
    try {
      const backups = await this.scheduler.listBackups();
      
      if (backups.length === 0) {
        console.log('📭 No hay respaldos disponibles');
        return [];
      }

      console.log(`📋 Respaldos disponibles (${backups.length}):`);
      console.log('─'.repeat(80));
      
      backups.forEach((backup, index) => {
        const date = new Date(backup.timestamp).toLocaleString();
        const size = this.formatBytes(backup.size);
        const status = backup.verified ? '✅' : '⚠️';
        
        console.log(`${index + 1}. ${status} ${backup.id}`);
        console.log(`   Fecha: ${date}`);
        console.log(`   Tipo: ${backup.type}`);
        console.log(`   Tamaño: ${size}`);
        console.log(`   Descripción: ${backup.description || 'Sin descripción'}`);
        console.log('');
      });

      return backups;
    } catch (error) {
      console.error(`❌ Error listando respaldos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Restaurar desde el respaldo más reciente
   */
  async restoreLatest(targetDatabase = null) {
    try {
      const backups = await this.scheduler.listBackups();
      
      if (backups.length === 0) {
        throw new Error('No hay respaldos disponibles para restaurar');
      }

      // Buscar el respaldo más reciente verificado
      const latestBackup = backups
        .filter(b => b.verified)
        .sort((a, b) => b.timestamp - a.timestamp)[0];

      if (!latestBackup) {
        throw new Error('No hay respaldos verificados disponibles');
      }

      console.log(`🔄 Restaurando desde respaldo: ${latestBackup.id}`);
      console.log(`   Fecha: ${new Date(latestBackup.timestamp).toLocaleString()}`);
      
      const result = await this.scheduler.restoreBackup(latestBackup.id, {
        target: targetDatabase || this.config.database.connection.uri,
        verify: true
      });

      console.log(`✅ Restauración completada exitosamente`);
      return result;
    } catch (error) {
      console.error(`❌ Error en restauración: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verificar integridad de todos los respaldos
   */
  async verifyAllBackups() {
    try {
      const backups = await this.scheduler.listBackups();
      
      if (backups.length === 0) {
        console.log('📭 No hay respaldos para verificar');
        return [];
      }

      console.log(`🔍 Verificando integridad de ${backups.length} respaldos...`);
      
      const results = [];
      for (const backup of backups) {
        console.log(`   Verificando ${backup.id}...`);
        
        try {
          const verification = await this.scheduler.verifyBackup(backup.id);
          results.push({
            id: backup.id,
            valid: verification.valid,
            issues: verification.issues || []
          });
          
          console.log(`   ${verification.valid ? '✅' : '❌'} ${backup.id}`);
        } catch (error) {
          results.push({
            id: backup.id,
            valid: false,
            error: error.message
          });
          console.log(`   ❌ ${backup.id} - Error: ${error.message}`);
        }
      }

      const validCount = results.filter(r => r.valid).length;
      const invalidCount = results.length - validCount;
      
      console.log(`\n📊 Resumen de verificación:`);
      console.log(`   ✅ Válidos: ${validCount}`);
      console.log(`   ❌ Inválidos: ${invalidCount}`);

      return results;
    } catch (error) {
      console.error(`❌ Error verificando respaldos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Limpiar respaldos antiguos según políticas de retención
   */
  async cleanupOldBackups(dryRun = false) {
    try {
      console.log(`🧹 ${dryRun ? 'Simulando' : 'Ejecutando'} limpieza de respaldos antiguos...`);
      
      const result = await this.scheduler.cleanupOldBackups(dryRun);
      
      if (result.deleted.length === 0) {
        console.log('✨ No hay respaldos para eliminar');
      } else {
        console.log(`📊 Respaldos ${dryRun ? 'que se eliminarían' : 'eliminados'}: ${result.deleted.length}`);
        console.log(`💾 Espacio ${dryRun ? 'que se liberaría' : 'liberado'}: ${this.formatBytes(result.spaceFreed)}`);
        
        if (dryRun) {
          console.log('\n📋 Respaldos que se eliminarían:');
          result.deleted.forEach(backup => {
            console.log(`   - ${backup.id} (${new Date(backup.timestamp).toLocaleDateString()})`);
          });
        }
      }

      return result;
    } catch (error) {
      console.error(`❌ Error en limpieza: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener estadísticas del sistema de respaldo
   */
  async getStats() {
    try {
      const stats = await this.scheduler.getStats();
      const storageStats = await this.scheduler.getStorageStats();
      
      console.log('📊 Estadísticas del Sistema de Respaldo');
      console.log('═'.repeat(50));
      
      console.log('\n📈 Estadísticas Generales:');
      console.log(`   Total de respaldos: ${stats.totalBackups}`);
      console.log(`   Respaldos exitosos: ${stats.successfulBackups}`);
      console.log(`   Respaldos fallidos: ${stats.failedBackups}`);
      console.log(`   Tasa de éxito: ${((stats.successfulBackups / stats.totalBackups) * 100).toFixed(1)}%`);
      
      console.log('\n💾 Estadísticas de Almacenamiento:');
      Object.entries(storageStats).forEach(([provider, stat]) => {
        console.log(`   ${provider}:`);
        console.log(`     Respaldos: ${stat.count}`);
        console.log(`     Tamaño total: ${this.formatBytes(stat.totalSize)}`);
        console.log(`     Tamaño promedio: ${this.formatBytes(stat.averageSize)}`);
      });

      return { stats, storageStats };
    } catch (error) {
      console.error(`❌ Error obteniendo estadísticas: ${error.message}`);
      throw error;
    }
  }

  /**
   * Exportar configuración actual
   */
  async exportConfig(outputPath = './backup-config-export.json') {
    try {
      const config = this.scheduler.getConfig();
      
      // Remover información sensible
      const sanitizedConfig = JSON.parse(JSON.stringify(config));
      if (sanitizedConfig.database?.connection?.uri) {
        sanitizedConfig.database.connection.uri = 'REDACTED';
      }
      if (sanitizedConfig.encryption?.key) {
        sanitizedConfig.encryption.key = 'REDACTED';
      }
      
      await fs.writeFile(outputPath, JSON.stringify(sanitizedConfig, null, 2));
      
      console.log(`📄 Configuración exportada a: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error(`❌ Error exportando configuración: ${error.message}`);
      throw error;
    }
  }

  /**
   * Probar conectividad y configuración
   */
  async testConfiguration() {
    console.log('🔧 Probando configuración del sistema...');
    
    const tests = [
      { name: 'Conexión a base de datos', test: () => this.scheduler.testDatabaseConnection() },
      { name: 'Acceso a almacenamiento local', test: () => this.scheduler.testLocalStorage() },
      { name: 'Configuración de notificaciones', test: () => this.scheduler.testNotifications() },
      { name: 'Permisos de escritura', test: () => this.scheduler.testWritePermissions() }
    ];

    const results = [];
    
    for (const test of tests) {
      try {
        console.log(`   Probando ${test.name}...`);
        await test.test();
        console.log(`   ✅ ${test.name}: OK`);
        results.push({ name: test.name, status: 'OK' });
      } catch (error) {
        console.log(`   ❌ ${test.name}: ${error.message}`);
        results.push({ name: test.name, status: 'ERROR', error: error.message });
      }
    }

    const passedTests = results.filter(r => r.status === 'OK').length;
    const totalTests = results.length;
    
    console.log(`\n📊 Resultado: ${passedTests}/${totalTests} pruebas exitosas`);
    
    if (passedTests === totalTests) {
      console.log('✅ Configuración válida - Sistema listo para usar');
    } else {
      console.log('⚠️ Hay problemas de configuración que deben resolverse');
    }

    return results;
  }

  /**
   * Formatear bytes en formato legible
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * Scripts de línea de comandos
 */

// Script para respaldo rápido
async function quickBackup() {
  const utils = new BackupUtils();
  const description = process.argv[3] || 'Respaldo manual desde CLI';
  await utils.quickBackup(description);
}

// Script para listar respaldos
async function listBackups() {
  const utils = new BackupUtils();
  await utils.listBackups();
}

// Script para restaurar último respaldo
async function restoreLatest() {
  const utils = new BackupUtils();
  const target = process.argv[3];
  await utils.restoreLatest(target);
}

// Script para verificar respaldos
async function verifyBackups() {
  const utils = new BackupUtils();
  await utils.verifyAllBackups();
}

// Script para limpiar respaldos antiguos
async function cleanupBackups() {
  const utils = new BackupUtils();
  const dryRun = process.argv[3] === '--dry-run';
  await utils.cleanupOldBackups(dryRun);
}

// Script para obtener estadísticas
async function getStats() {
  const utils = new BackupUtils();
  await utils.getStats();
}

// Script para probar configuración
async function testConfig() {
  const utils = new BackupUtils();
  await utils.testConfiguration();
}

// Ejecutar script según comando
if (require.main === module) {
  const command = process.argv[2];
  
  const commands = {
    'backup': quickBackup,
    'list': listBackups,
    'restore': restoreLatest,
    'verify': verifyBackups,
    'cleanup': cleanupBackups,
    'stats': getStats,
    'test': testConfig
  };

  if (commands[command]) {
    commands[command]().catch(error => {
      console.error('❌ Error ejecutando comando:', error.message);
      process.exit(1);
    });
  } else {
    console.log('📖 Uso: node scripts-utiles.js <comando> [argumentos]');
    console.log('\nComandos disponibles:');
    console.log('  backup [descripción]     - Crear respaldo manual');
    console.log('  list                     - Listar respaldos disponibles');
    console.log('  restore [target]         - Restaurar último respaldo');
    console.log('  verify                   - Verificar integridad de respaldos');
    console.log('  cleanup [--dry-run]      - Limpiar respaldos antiguos');
    console.log('  stats                    - Mostrar estadísticas');
    console.log('  test                     - Probar configuración');
    console.log('\nEjemplos:');
    console.log('  node scripts-utiles.js backup "Antes de actualización"');
    console.log('  node scripts-utiles.js cleanup --dry-run');
    console.log('  node scripts-utiles.js restore mongodb://localhost:27017/test');
  }
}

module.exports = BackupUtils;