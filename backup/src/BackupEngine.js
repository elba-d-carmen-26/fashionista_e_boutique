/**
 * Motor de Respaldo Principal
 * 
 * Esta clase maneja todas las operaciones de respaldo incluyendo:
 * - Respaldos completos e incrementales
 * - Múltiples formatos de exportación
 * - Compresión y cifrado
 * - Verificación de integridad
 */

/**
 * Motor de Respaldo Principal
 *
 * Esta clase maneja todas las operaciones de respaldo incluyendo:
 * - Respaldos completos e incrementales
 * - Múltiples formatos de exportación
 * - Compresión y cifrado
 * - Verificación de integridad
 */
 
const { spawn, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const { promisify } = require('util');
const { MongoClient } = require('mongodb');
const Logger = require('./Logger');
const IntegrityChecker = require('./IntegrityChecker');
const StorageManager = require('./StorageManager');
const NotificationService = require('./NotificationService');
 
class BackupEngine {
  constructor(config) {
    this.config = config;
    this.logger = new Logger(config.logging);
    this.integrityChecker = new IntegrityChecker(config.integrity || { algorithm: 'sha256' });

    this.storageManager = new StorageManager(config, this.logger);
    this.notificationService = new NotificationService(config.notifications);
    this.isRunning = false;
    this.currentBackupId = null;
  }
 
  /**
   * Ejecuta un respaldo completo de la base de datos
   * @param {Object} options - Opciones del respaldo
   * @returns {Promise<Object>} Resultado del respaldo
   */
  async executeFullBackup(options = {}) {
    const backupId = this.generateBackupId();
    this.currentBackupId = backupId;
   
    try {
      this.isRunning = true;
      this.logger.info(`Iniciando respaldo completo: ${backupId}`, { backupId, options });
 
      // Validar configuración y conexión
      await this.validateConfiguration();
      await this.testDatabaseConnection();
 
      // Crear directorio de respaldo
      const backupDir = await this.createBackupDirectory(backupId);
     
      // Ejecutar respaldo según el formato especificado
      const format = options.format || this.config.formats.default;
      let backupResult;
 
      switch (format) {
        case 'bson':
          backupResult = await this.executeMongoDump(backupDir, options);
          break;
        case 'json':
          backupResult = await this.executeMongoExport(backupDir, options, 'json');
          break;
        case 'csv':
          backupResult = await this.executeMongoExport(backupDir, options, 'csv');
          break;
        default:
          throw new Error(`Formato de respaldo no soportado: ${format}`);
      }
 
      // Comprimir respaldo si está habilitado
      if (this.config.formats.compression.enabled) {
        backupResult.compressedPath = await this.compressBackup(backupResult.path);
        backupResult.originalSize = backupResult.size;
        backupResult.size = (await fs.stat(backupResult.compressedPath)).size;
      }
 
      // Cifrar respaldo si está habilitado
      if (this.config.encryption.enabled) {
        const pathToEncrypt = backupResult.compressedPath || backupResult.path;
        backupResult.encryptedPath = await this.encryptBackup(pathToEncrypt);
        backupResult.encrypted = true;
      }
 
      // Verificar integridad
      if (this.config.integrity.enabled) {
        const pathToVerify = backupResult.encryptedPath || backupResult.compressedPath || backupResult.path;
        backupResult.checksum = await this.integrityChecker.generateChecksum(pathToVerify);
        backupResult.verified = await this.integrityChecker.verifyBackup(pathToVerify, backupResult.checksum);
      }
 
      // Almacenar metadatos
      await this.saveBackupMetadata(backupId, backupResult);
 
      // Subir a almacenamiento remoto si está configurado
      if (this.config.storage.remote.enabled) {
        await this.storageManager.uploadToRemote(backupResult);
      }
 
      // Aplicar políticas de retención
      await this.applyRetentionPolicies();
 
      // Enviar notificación de éxito
      await this.notificationService.sendSuccessNotification(backupResult);
 
      this.logger.info(`Respaldo completo exitoso: ${backupId}`, backupResult);
      return backupResult;
 
    } catch (error) {
      this.logger.error(`Error en respaldo completo: ${backupId}`, error);
      await this.notificationService.sendErrorNotification(error, backupId);
      throw error;
    } finally {
      this.isRunning = false;
      this.currentBackupId = null;
    }
  }
 
  /**
   * Ejecuta mongodump para respaldo en formato BSON
   * @param {string} backupDir - Directorio de respaldo
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Resultado del respaldo
   */
  async executeMongoDump(backupDir, options = {}) {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(backupDir, 'dump');
      const args = [
        '--uri', this.config.database.uri,
        '--out', outputPath
      ];
 
      // Agregar opciones adicionales
      if (options.collections && options.collections.length > 0) {
        options.collections.forEach(collection => {
          args.push('--collection', collection);
        });
      }
 
      if (options.query) {
        args.push('--query', JSON.stringify(options.query));
      }
 
      if (options.gzip) {
        args.push('--gzip');
      }
 
      this.logger.info('Ejecutando mongodump', { args });
 
      const mongodump = spawn('mongodump', args);
      let stderr = '';
 
      mongodump.stderr.on('data', (data) => {
        stderr += data.toString();
      });
 
      mongodump.on('close', async (code) => {
        if (code !== 0) {
          reject(new Error(`mongodump falló con código ${code}: ${stderr}`));
          return;
        }
 
        try {
          const stats = await this.getDirectoryStats(outputPath);
          resolve({
            path: outputPath,
            format: 'bson',
            size: stats.size,
            files: stats.files,
            timestamp: new Date(),
            command: 'mongodump',
            args: args
          });
        } catch (error) {
          reject(error);
        }
      });
 
      mongodump.on('error', (error) => {
        reject(new Error(`Error ejecutando mongodump: ${error.message}`));
      });
    });
  }
 
  /**
   * Ejecuta mongoexport para respaldo en formato JSON/CSV
   * @param {string} backupDir - Directorio de respaldo
   * @param {Object} options - Opciones adicionales
   * @param {string} format - Formato de exportación (json/csv)
   * @returns {Promise<Object>} Resultado del respaldo
   */
  async executeMongoExport(backupDir, options = {}, format = 'json') {
    const client = new MongoClient(this.config.database.uri, this.config.database.options);
   
    try {
      await client.connect();
      const db = client.db();
      const collections = await db.listCollections().toArray();
     
      const exportResults = [];
     
      for (const collectionInfo of collections) {
        const collectionName = collectionInfo.name;
       
        // Saltar colecciones del sistema si no se especifica lo contrario
        if (collectionName.startsWith('system.') && !options.includeSystemCollections) {
          continue;
        }
 
        const outputFile = path.join(backupDir, `${collectionName}.${format}`);
       
        await this.exportCollection(collectionName, outputFile, format, options);
       
        const stats = await fs.stat(outputFile);
        exportResults.push({
          collection: collectionName,
          file: outputFile,
          size: stats.size
        });
      }
 
      const totalSize = exportResults.reduce((sum, result) => sum + result.size, 0);
 
      return {
        path: backupDir,
        format: format,
        size: totalSize,
        files: exportResults.length,
        collections: exportResults,
        timestamp: new Date(),
        command: 'mongoexport'
      };
 
    } finally {
      await client.close();
    }
  }
 
  /**
   * Exporta una colección específica
   * @param {string} collectionName - Nombre de la colección
   * @param {string} outputFile - Archivo de salida
   * @param {string} format - Formato de exportación
   * @param {Object} options - Opciones adicionales
   */
  async exportCollection(collectionName, outputFile, format, options = {}) {
    return new Promise((resolve, reject) => {
      const args = [
        '--uri', this.config.database.uri,
        '--collection', collectionName,
        '--out', outputFile,
        '--type', format
      ];
 
      if (options.query) {
        args.push('--query', JSON.stringify(options.query));
      }
 
      if (options.fields && format === 'csv') {
        args.push('--fields', options.fields.join(','));
      }
 
      if (options.pretty && format === 'json') {
        args.push('--pretty');
      }
 
      const mongoexport = spawn('mongoexport', args);
      let stderr = '';
 
      mongoexport.stderr.on('data', (data) => {
        stderr += data.toString();
      });
 
      mongoexport.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`mongoexport falló para ${collectionName} con código ${code}: ${stderr}`));
          return;
        }
        resolve();
      });
 
      mongoexport.on('error', (error) => {
        reject(new Error(`Error ejecutando mongoexport para ${collectionName}: ${error.message}`));
      });
    });
  }
 
  /**
   * Comprime un respaldo usando el algoritmo configurado
   * @param {string} sourcePath - Ruta del archivo/directorio a comprimir
   * @returns {Promise<string>} Ruta del archivo comprimido
   */
  async compressBackup(sourcePath) {
    const compressedPath = `${sourcePath}.gz`;
   
    return new Promise((resolve, reject) => {
      const algorithm = this.config.formats.compression.algorithm;
      const level = this.config.formats.compression.level;
 
      if (algorithm === 'gzip') {
        const gzip = zlib.createGzip({ level });
        const input = require('fs').createReadStream(sourcePath);
        const output = require('fs').createWriteStream(compressedPath);
 
        input.pipe(gzip).pipe(output);
 
        output.on('finish', () => {
          this.logger.info(`Compresión completada: ${compressedPath}`);
          resolve(compressedPath);
        });
 
        output.on('error', reject);
        input.on('error', reject);
        gzip.on('error', reject);
      } else {
        reject(new Error(`Algoritmo de compresión no soportado: ${algorithm}`));
      }
    });
  }
 
  /**
   * Cifra un respaldo usando el algoritmo configurado
   * @param {string} sourcePath - Ruta del archivo a cifrar
   * @returns {Promise<string>} Ruta del archivo cifrado
   */
  async encryptBackup(sourcePath) {
    const encryptedPath = `${sourcePath}.enc`;
    const algorithm = this.config.encryption.algorithm;
    const key = await this.getEncryptionKey();
    const iv = crypto.randomBytes(16);
 
    return new Promise((resolve, reject) => {
      try {
        const cipher = crypto.createCipher(algorithm, key);
        const input = require('fs').createReadStream(sourcePath);
        const output = require('fs').createWriteStream(encryptedPath);
 
        // Escribir IV al inicio del archivo
        output.write(iv);
 
        input.pipe(cipher).pipe(output);
 
        output.on('finish', () => {
          this.logger.info(`Cifrado completado: ${encryptedPath}`);
          resolve(encryptedPath);
        });
 
        output.on('error', reject);
        input.on('error', reject);
        cipher.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }
 
  /**
   * Obtiene o genera la clave de cifrado
   * @returns {Promise<Buffer>} Clave de cifrado
   */
  async getEncryptionKey() {
    const keyPath = path.join(this.config.encryption.keyPath, 'backup.key');
   
    try {
      const keyData = await fs.readFile(keyPath);
      return keyData;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Generar nueva clave si no existe
        const key = crypto.randomBytes(32);
        await fs.mkdir(this.config.encryption.keyPath, { recursive: true });
        await fs.writeFile(keyPath, key, { mode: 0o600 });
        this.logger.info('Nueva clave de cifrado generada');
        return key;
      }
      throw error;
    }
  }
 
  /**
   * Crea el directorio de respaldo
   * @param {string} backupId - ID del respaldo
   * @returns {Promise<string>} Ruta del directorio creado
   */
  async createBackupDirectory(backupId) {
    const backupDir = path.join(this.config.storage.local.basePath, backupId);
    await fs.mkdir(backupDir, { recursive: true, mode: this.config.storage.local.permissions });
    return backupDir;
  }
 
  /**
   * Guarda los metadatos del respaldo
   * @param {string} backupId - ID del respaldo
   * @param {Object} backupResult - Resultado del respaldo
   */
  async saveBackupMetadata(backupId, backupResult) {
    const metadataPath = path.join(this.config.storage.local.basePath, backupId, 'metadata.json');
    const metadata = {
      id: backupId,
      timestamp: new Date(),
      ...backupResult,
      config: {
        database: this.config.database.uri,
        format: backupResult.format,
        compression: this.config.formats.compression.enabled,
        encryption: this.config.encryption.enabled
      }
    };
 
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }
 
  /**
   * Aplica las políticas de retención configuradas
   */
  async applyRetentionPolicies() {
    try {
      const backupsDir = this.config.storage.local.basePath;
      const backups = await fs.readdir(backupsDir);
     
      const now = new Date();
      const retentionPolicies = this.config.retention;
 
      for (const backupDir of backups) {
        const metadataPath = path.join(backupsDir, backupDir, 'metadata.json');
       
        try {
          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
          const backupDate = new Date(metadata.timestamp);
          const daysDiff = Math.floor((now - backupDate) / (1000 * 60 * 60 * 24));
 
          let shouldDelete = false;
 
          // Aplicar política de retención diaria
          if (daysDiff > retentionPolicies.daily) {
            shouldDelete = true;
          }
 
          if (shouldDelete) {
            await this.deleteBackup(path.join(backupsDir, backupDir));
            this.logger.info(`Respaldo eliminado por política de retención: ${backupDir}`);
          }
        } catch (error) {
          this.logger.warn(`Error procesando metadatos de respaldo: ${backupDir}`, error);
        }
      }
    } catch (error) {
      this.logger.error('Error aplicando políticas de retención', error);
    }
  }
 
  /**
   * Elimina un respaldo y sus archivos asociados
   * @param {string} backupPath - Ruta del respaldo a eliminar
   */
  async deleteBackup(backupPath) {
    await fs.rmdir(backupPath, { recursive: true });
  }
 
  /**
   * Valida la configuración del sistema
   */
  async validateConfiguration() {
    // Verificar que los directorios necesarios existen
    await fs.mkdir(this.config.storage.local.basePath, { recursive: true });
   
    if (this.config.encryption.enabled) {
      await fs.mkdir(this.config.encryption.keyPath, { recursive: true });
    }
  }
 
  /**
   * Prueba la conexión a la base de datos
   */
  async testDatabaseConnection() {
    const client = new MongoClient(this.config.database.uri, this.config.database.options);
   
    try {
      await client.connect();
      await client.db().admin().ping();
      this.logger.info('Conexión a base de datos exitosa');
    } catch (error) {
      throw new Error(`Error conectando a la base de datos: ${error.message}`);
    } finally {
      await client.close();
    }
  }
 
  /**
   * Genera un ID único para el respaldo
   * @returns {string} ID del respaldo
   */
  generateBackupId() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = crypto.randomBytes(4).toString('hex');
    return `backup-${timestamp}-${random}`;
  }
 
  /**
   * Obtiene estadísticas de un directorio
   * @param {string} dirPath - Ruta del directorio
   * @returns {Promise<Object>} Estadísticas del directorio
   */
  async getDirectoryStats(dirPath) {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    let totalSize = 0;
    let fileCount = 0;
 
    for (const file of files) {
      const filePath = path.join(dirPath, file.name);
      if (file.isFile()) {
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
        fileCount++;
      } else if (file.isDirectory()) {
        const subStats = await this.getDirectoryStats(filePath);
        totalSize += subStats.size;
        fileCount += subStats.files;
      }
    }
 
    return { size: totalSize, files: fileCount };
  }
 
  /**
   * Obtiene el estado actual del motor de respaldo
   * @returns {Object} Estado del motor
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      currentBackupId: this.currentBackupId,
      lastBackup: this.lastBackupResult,
      config: {
        formats: this.config.formats,
        retention: this.config.retention,
        storage: {
          local: this.config.storage.local.enabled,
          remote: this.config.storage.remote.enabled
        }
      }
    };
  }
}
 
module.exports = BackupEngine;