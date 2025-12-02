/**
 * Sistema de Logging para Respaldos
 * 
 * Esta clase maneja el registro detallado de todas las actividades del sistema:
 * - Logs estructurados con diferentes niveles
 * - Rotación automática de archivos de log
 * - Formato JSON para análisis automatizado
 * - Integración con sistemas de monitoreo
 */

const fs = require('fs').promises;
const path = require('path');
const { createWriteStream } = require('fs');
 
class Logger {
  constructor(config) {
    this.config = config;
    this.level = config.level || 'info';
    this.logFile = config.file || path.join(__dirname, '../logs/backup.log');
    this.maxSize = this.parseSize(config.maxSize || '10m');
    this.maxFiles = config.maxFiles || 5;
    this.datePattern = config.datePattern || 'YYYY-MM-DD';
   
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
    };
 
    this.currentLevel = this.levels[this.level] || 2;
    this.writeStream = null;
    this.currentLogFile = null;
   
    this.initializeLogger();
  }
 
  /**
   * Inicializa el sistema de logging
   */
  async initializeLogger() {
    try {
      // Crear directorio de logs si no existe
      const logDir = path.dirname(this.logFile);
      await fs.mkdir(logDir, { recursive: true });
     
      // Configurar archivo de log actual
      await this.setupCurrentLogFile();
     
      // Configurar rotación automática
      this.setupLogRotation();
     
    } catch (error) {
      console.error('Error inicializando logger:', error);
    }
  }
 
  /**
   * Configura el archivo de log actual
   */
  async setupCurrentLogFile() {
    const today = this.formatDate(new Date());
    const logFileName = this.logFile.replace(/\.log$/, `-${today}.log`);
   
    this.currentLogFile = logFileName;
   
    // Verificar si necesitamos rotar por tamaño
    try {
      const stats = await fs.stat(logFileName);
      if (stats.size >= this.maxSize) {
        await this.rotateLogFile();
      }
    } catch (error) {
      // El archivo no existe, está bien
    }
   
    this.writeStream = createWriteStream(this.currentLogFile, { flags: 'a' });
  }
 
  /**
   * Configura la rotación automática de logs
   */
  setupLogRotation() {
    // Verificar rotación cada hora
    setInterval(async () => {
      try {
        const today = this.formatDate(new Date());
        const expectedLogFile = this.logFile.replace(/\.log$/, `-${today}.log`);
       
        // Si cambió el día, rotar
        if (this.currentLogFile !== expectedLogFile) {
          await this.rotateLogFile();
        }
       
        // Verificar tamaño del archivo
        const stats = await fs.stat(this.currentLogFile);
        if (stats.size >= this.maxSize) {
          await this.rotateLogFile();
        }
       
        // Limpiar logs antiguos
        await this.cleanupOldLogs();
       
      } catch (error) {
        console.error('Error en rotación de logs:', error);
      }
    }, 60 * 60 * 1000); // Cada hora
  }
 
  /**
   * Rota el archivo de log actual
   */
  async rotateLogFile() {
    if (this.writeStream) {
      this.writeStream.end();
    }
   
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rotatedFile = this.currentLogFile.replace(/\.log$/, `-${timestamp}.log`);
   
    try {
      await fs.rename(this.currentLogFile, rotatedFile);
    } catch (error) {
      // Si no se puede renombrar, continuar con nuevo archivo
    }
   
    await this.setupCurrentLogFile();
  }
 
  /**
   * Limpia logs antiguos según la política de retención
   */
  async cleanupOldLogs() {
    try {
      const logDir = path.dirname(this.logFile);
      const files = await fs.readdir(logDir);
      const logFiles = files
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(logDir, file),
          stat: null
        }));
 
      // Obtener estadísticas de archivos
      for (const file of logFiles) {
        try {
          file.stat = await fs.stat(file.path);
        } catch (error) {
          // Ignorar archivos que no se pueden leer
        }
      }
 
      // Filtrar archivos válidos y ordenar por fecha
      const validFiles = logFiles
        .filter(file => file.stat)
        .sort((a, b) => b.stat.mtime - a.stat.mtime);
 
      // Eliminar archivos excedentes
      if (validFiles.length > this.maxFiles) {
        const filesToDelete = validFiles.slice(this.maxFiles);
       
        for (const file of filesToDelete) {
          try {
            await fs.unlink(file.path);
            this.info(`Log antiguo eliminado: ${file.name}`);
          } catch (error) {
            this.warn(`Error eliminando log antiguo ${file.name}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error limpiando logs antiguos:', error);
    }
  }
 
  /**
   * Registra un mensaje de error
   * @param {string} message - Mensaje de error
   * @param {Error|Object} error - Error o datos adicionales
   * @param {Object} metadata - Metadatos adicionales
   */
  error(message, error = null, metadata = {}) {
    this.log('error', message, { error: this.serializeError(error), ...metadata });
  }
 
  /**
   * Registra un mensaje de advertencia
   * @param {string} message - Mensaje de advertencia
   * @param {Object} metadata - Metadatos adicionales
   */
  warn(message, metadata = {}) {
    this.log('warn', message, metadata);
  }
 
  /**
   * Registra un mensaje informativo
   * @param {string} message - Mensaje informativo
   * @param {Object} metadata - Metadatos adicionales
   */
  info(message, metadata = {}) {
    this.log('info', message, metadata);
  }
 
  /**
   * Registra un mensaje de debug
   * @param {string} message - Mensaje de debug
   * @param {Object} metadata - Metadatos adicionales
   */
  debug(message, metadata = {}) {
    this.log('debug', message, metadata);
  }
 
  /**
   * Registra un mensaje de trace
   * @param {string} message - Mensaje de trace
   * @param {Object} metadata - Metadatos adicionales
   */
  trace(message, metadata = {}) {
    this.log('trace', message, metadata);
  }
 
  /**
   * Método principal de logging
   * @param {string} level - Nivel del log
   * @param {string} message - Mensaje
   * @param {Object} metadata - Metadatos adicionales
   */
  log(level, message, metadata = {}) {
    if (this.levels[level] > this.currentLevel) {
      return; // No registrar si el nivel es menor al configurado
    }
 
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      component: 'backup-system',
      ...metadata,
      pid: process.pid,
      hostname: require('os').hostname()
    };
 
    // Escribir a archivo
    this.writeToFile(logEntry);
   
    // Escribir a consola en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      this.writeToConsole(level, message, metadata);
    }
  }
 
  /**
   * Escribe el log al archivo
   * @param {Object} logEntry - Entrada de log
   */
  writeToFile(logEntry) {
    if (this.writeStream && this.writeStream.writable) {
      const logLine = JSON.stringify(logEntry) + '\n';
      this.writeStream.write(logLine);
    }
  }
 
  /**
   * Escribe el log a la consola
   * @param {string} level - Nivel del log
   * @param {string} message - Mensaje
   * @param {Object} metadata - Metadatos
   */
  writeToConsole(level, message, metadata) {
    const timestamp = new Date().toISOString();
    const coloredLevel = this.colorizeLevel(level);
   
    let output = `${timestamp} [${coloredLevel}] ${message}`;
   
    if (Object.keys(metadata).length > 0) {
      output += ` ${JSON.stringify(metadata, null, 2)}`;
    }
   
    console.log(output);
  }
 
  /**
   * Coloriza el nivel de log para la consola
   * @param {string} level - Nivel del log
   * @returns {string} Nivel colorizado
   */
  colorizeLevel(level) {
    const colors = {
      error: '\x1b[31m', // Rojo
      warn: '\x1b[33m',  // Amarillo
      info: '\x1b[36m',  // Cian
      debug: '\x1b[35m', // Magenta
      trace: '\x1b[37m'  // Blanco
    };
   
    const reset = '\x1b[0m';
    const color = colors[level] || colors.info;
   
    return `${color}${level.toUpperCase()}${reset}`;
  }
 
  /**
   * Serializa un error para logging
   * @param {Error|any} error - Error a serializar
   * @returns {Object} Error serializado
   */
  serializeError(error) {
    if (!error) return null;
   
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      };
    }
   
    return error;
  }
 
  /**
   * Formatea una fecha según el patrón configurado
   * @param {Date} date - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
   
    return `${year}-${month}-${day}`;
  }
 
  /**
   * Parsea un tamaño de archivo (ej: "10m", "1g")
   * @param {string} sizeStr - String de tamaño
   * @returns {number} Tamaño en bytes
   */
  parseSize(sizeStr) {
    const units = {
      b: 1,
      k: 1024,
      m: 1024 * 1024,
      g: 1024 * 1024 * 1024
    };
   
    const match = sizeStr.toLowerCase().match(/^(\d+)([bkmg]?)$/);
    if (!match) {
      throw new Error(`Formato de tamaño inválido: ${sizeStr}`);
    }
   
    const [, size, unit] = match;
    return parseInt(size) * (units[unit] || 1);
  }
 
  /**
   * Registra el inicio de una operación de respaldo
   * @param {string} backupId - ID del respaldo
   * @param {Object} options - Opciones del respaldo
   */
  logBackupStart(backupId, options) {
    this.info('Iniciando operación de respaldo', {
      backupId,
      type: 'backup_start',
      options,
      timestamp: new Date().toISOString()
    });
  }
 
  /**
   * Registra el éxito de una operación de respaldo
   * @param {string} backupId - ID del respaldo
   * @param {Object} result - Resultado del respaldo
   */
  logBackupSuccess(backupId, result) {
    this.info('Respaldo completado exitosamente', {
      backupId,
      type: 'backup_success',
      duration: result.duration,
      size: result.size,
      format: result.format,
      timestamp: new Date().toISOString()
    });
  }
 
  /**
   * Registra el fallo de una operación de respaldo
   * @param {string} backupId - ID del respaldo
   * @param {Error} error - Error ocurrido
   */
  logBackupFailure(backupId, error) {
    this.error('Respaldo falló', error, {
      backupId,
      type: 'backup_failure',
      timestamp: new Date().toISOString()
    });
  }
 
  /**
   * Registra operaciones de verificación de integridad
   * @param {string} backupId - ID del respaldo
   * @param {Object} result - Resultado de la verificación
   */
  logIntegrityCheck(backupId, result) {
    const level = result.valid ? 'info' : 'warn';
    this.log(level, 'Verificación de integridad completada', {
      backupId,
      type: 'integrity_check',
      valid: result.valid,
      errors: result.errors,
      timestamp: new Date().toISOString()
    });
  }
 
  /**
   * Registra operaciones de limpieza y retención
   * @param {Object} cleanupResult - Resultado de la limpieza
   */
  logCleanup(cleanupResult) {
    this.info('Limpieza de respaldos completada', {
      type: 'cleanup',
      deletedBackups: cleanupResult.deleted,
      retainedBackups: cleanupResult.retained,
      freedSpace: cleanupResult.freedSpace,
      timestamp: new Date().toISOString()
    });
  }
 
  /**
   * Obtiene estadísticas de logs
   * @returns {Promise<Object>} Estadísticas de logs
   */
  async getLogStatistics() {
    try {
      const logDir = path.dirname(this.logFile);
      const files = await fs.readdir(logDir);
      const logFiles = files.filter(file => file.endsWith('.log'));
     
      let totalSize = 0;
      let oldestLog = null;
      let newestLog = null;
     
      for (const file of logFiles) {
        const filePath = path.join(logDir, file);
        const stats = await fs.stat(filePath);
       
        totalSize += stats.size;
       
        if (!oldestLog || stats.mtime < oldestLog.mtime) {
          oldestLog = { file, mtime: stats.mtime };
        }
       
        if (!newestLog || stats.mtime > newestLog.mtime) {
          newestLog = { file, mtime: stats.mtime };
        }
      }
     
      return {
        totalFiles: logFiles.length,
        totalSize,
        oldestLog: oldestLog ? oldestLog.file : null,
        newestLog: newestLog ? newestLog.file : null,
        currentLogFile: path.basename(this.currentLogFile)
      };
    } catch (error) {
      this.error('Error obteniendo estadísticas de logs', error);
      return null;
    }
  }
 
  /**
   * Busca en los logs por criterios específicos
   * @param {Object} criteria - Criterios de búsqueda
   * @returns {Promise<Array>} Entradas de log que coinciden
   */
  async searchLogs(criteria = {}) {
    try {
      const { level, message, backupId, type, startDate, endDate, limit = 100 } = criteria;
     
      const logContent = await fs.readFile(this.currentLogFile, 'utf8');
      const lines = logContent.trim().split('\n');
      const results = [];
     
      for (const line of lines) {
        try {
          const logEntry = JSON.parse(line);
         
          // Aplicar filtros
          if (level && logEntry.level !== level.toUpperCase()) continue;
          if (message && !logEntry.message.includes(message)) continue;
          if (backupId && logEntry.backupId !== backupId) continue;
          if (type && logEntry.type !== type) continue;
         
          if (startDate) {
            const logDate = new Date(logEntry.timestamp);
            if (logDate < new Date(startDate)) continue;
          }
         
          if (endDate) {
            const logDate = new Date(logEntry.timestamp);
            if (logDate > new Date(endDate)) continue;
          }
         
          results.push(logEntry);
         
          if (results.length >= limit) break;
         
        } catch (error) {
          // Ignorar líneas que no son JSON válido
        }
      }
     
      return results.reverse(); // Más recientes primero
     
    } catch (error) {
      this.error('Error buscando en logs', error);
      return [];
    }
  }
 
  /**
   * Cierra el logger y libera recursos
   */
  async close() {
    if (this.writeStream) {
      return new Promise((resolve) => {
        this.writeStream.end(() => {
          resolve();
        });
      });
    }
  }
}
 
module.exports = Logger;
 