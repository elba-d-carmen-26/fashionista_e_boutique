/**
 * Sistema de Verificación de Integridad
 * 
 * Esta clase maneja la verificación de integridad de los respaldos mediante:
 * - Generación de checksums (SHA256, MD5, etc.)
 * - Verificación de archivos comprimidos
 * - Validación de estructura de respaldos
 * - Detección de corrupción de datos
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const zlib = require('zlib');
const { MongoClient } = require('mongodb');
 
class IntegrityChecker {
  constructor(config) {
    this.config = config;
    this.algorithm = config.algorithm || 'sha256';
    this.supportedAlgorithms = ['sha256', 'sha512', 'md5', 'sha1'];
  }
 
  /**
   * Genera un checksum para un archivo o directorio
   * @param {string} filePath - Ruta del archivo o directorio
   * @param {string} algorithm - Algoritmo de hash a usar
   * @returns {Promise<string>} Checksum generado
   */
  async generateChecksum(filePath, algorithm = this.algorithm) {
    if (!this.supportedAlgorithms.includes(algorithm)) {
      throw new Error(`Algoritmo no soportado: ${algorithm}`);
    }
 
    const stats = await fs.stat(filePath);
   
    if (stats.isDirectory()) {
      return await this.generateDirectoryChecksum(filePath, algorithm);
    } else {
      return await this.generateFileChecksum(filePath, algorithm);
    }
  }
 
  /**
   * Genera checksum para un archivo individual
   * @param {string} filePath - Ruta del archivo
   * @param {string} algorithm - Algoritmo de hash
   * @returns {Promise<string>} Checksum del archivo
   */
  async generateFileChecksum(filePath, algorithm) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash(algorithm);
      const stream = require('fs').createReadStream(filePath);
 
      stream.on('data', (data) => {
        hash.update(data);
      });
 
      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });
 
      stream.on('error', (error) => {
        reject(new Error(`Error generando checksum para ${filePath}: ${error.message}`));
      });
    });
  }
 
  /**
   * Genera checksum para un directorio completo
   * @param {string} dirPath - Ruta del directorio
   * @param {string} algorithm - Algoritmo de hash
   * @returns {Promise<string>} Checksum del directorio
   */
  async generateDirectoryChecksum(dirPath, algorithm) {
    const files = await this.getFilesRecursively(dirPath);
    const hash = crypto.createHash(algorithm);
 
    // Ordenar archivos para garantizar consistencia
    files.sort();
 
    for (const file of files) {
      const relativePath = path.relative(dirPath, file);
      const fileChecksum = await this.generateFileChecksum(file, algorithm);
     
      // Incluir tanto el path relativo como el checksum del archivo
      hash.update(`${relativePath}:${fileChecksum}`);
    }
 
    return hash.digest('hex');
  }
 
  /**
   * Obtiene todos los archivos de un directorio recursivamente
   * @param {string} dirPath - Ruta del directorio
   * @returns {Promise<string[]>} Lista de rutas de archivos
   */
  async getFilesRecursively(dirPath) {
    const files = [];
    const items = await fs.readdir(dirPath, { withFileTypes: true });
 
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
     
      if (item.isDirectory()) {
        const subFiles = await this.getFilesRecursively(fullPath);
        files.push(...subFiles);
      } else {
        files.push(fullPath);
      }
    }
 
    return files;
  }
 
  /**
   * Verifica la integridad de un respaldo
   * @param {string} backupPath - Ruta del respaldo
   * @param {string} expectedChecksum - Checksum esperado
   * @param {string} algorithm - Algoritmo de verificación
   * @returns {Promise<boolean>} True si la verificación es exitosa
   */
  async verifyBackup(backupPath, expectedChecksum, algorithm = this.algorithm) {
    try {
      const actualChecksum = await this.generateChecksum(backupPath, algorithm);
      const isValid = actualChecksum === expectedChecksum;
 
      if (!isValid) {
        throw new Error(`Verificación de integridad falló. Esperado: ${expectedChecksum}, Actual: ${actualChecksum}`);
      }
 
      return true;
    } catch (error) {
      throw new Error(`Error verificando integridad: ${error.message}`);
    }
  }
 
  /**
   * Verifica la integridad de un archivo comprimido
   * @param {string} compressedPath - Ruta del archivo comprimido
   * @returns {Promise<boolean>} True si el archivo no está corrupto
   */
  async verifyCompressedFile(compressedPath) {
    return new Promise((resolve, reject) => {
      const readStream = require('fs').createReadStream(compressedPath);
      const gunzip = zlib.createGunzip();
 
      let hasError = false;
 
      gunzip.on('error', (error) => {
        hasError = true;
        reject(new Error(`Archivo comprimido corrupto: ${error.message}`));
      });
 
      gunzip.on('end', () => {
        if (!hasError) {
          resolve(true);
        }
      });
 
      readStream.pipe(gunzip);
     
      // Consumir datos sin almacenarlos (solo verificar)
      gunzip.on('data', () => {});
    });
  }
 
  /**
   * Verifica la estructura de un respaldo BSON (mongodump)
   * @param {string} backupPath - Ruta del respaldo
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verifyBSONBackup(backupPath) {
    const result = {
      valid: true,
      collections: [],
      errors: [],
      totalSize: 0,
      fileCount: 0
    };
 
    try {
      const files = await this.getFilesRecursively(backupPath);
     
      for (const file of files) {
        const fileName = path.basename(file);
        const stats = await fs.stat(file);
        result.totalSize += stats.size;
        result.fileCount++;
 
        if (fileName.endsWith('.bson')) {
          try {
            await this.verifyBSONFile(file);
            result.collections.push({
              name: fileName.replace('.bson', ''),
              size: stats.size,
              valid: true
            });
          } catch (error) {
            result.valid = false;
            result.errors.push(`Error en ${fileName}: ${error.message}`);
            result.collections.push({
              name: fileName.replace('.bson', ''),
              size: stats.size,
              valid: false,
              error: error.message
            });
          }
        }
      }
    } catch (error) {
      result.valid = false;
      result.errors.push(`Error verificando estructura: ${error.message}`);
    }
 
    return result;
  }
 
  /**
   * Verifica un archivo BSON individual
   * @param {string} bsonPath - Ruta del archivo BSON
   * @returns {Promise<boolean>} True si el archivo es válido
   */
  async verifyBSONFile(bsonPath) {
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
     
      // Usar bsondump para verificar la validez del archivo BSON
      const bsondump = spawn('bsondump', ['--type=debug', bsonPath]);
     
      let errorOutput = '';
 
      bsondump.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
 
      bsondump.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Archivo BSON inválido: ${errorOutput}`));
        } else {
          resolve(true);
        }
      });
 
      bsondump.on('error', (error) => {
        reject(new Error(`Error ejecutando bsondump: ${error.message}`));
      });
    });
  }
 
  /**
   * Verifica la estructura de un respaldo JSON
   * @param {string} backupPath - Ruta del respaldo
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verifyJSONBackup(backupPath) {
    const result = {
      valid: true,
      collections: [],
      errors: [],
      totalSize: 0,
      fileCount: 0,
      totalDocuments: 0
    };
 
    try {
      const files = await this.getFilesRecursively(backupPath);
     
      for (const file of files) {
        const fileName = path.basename(file);
        const stats = await fs.stat(file);
        result.totalSize += stats.size;
        result.fileCount++;
 
        if (fileName.endsWith('.json')) {
          try {
            const documentCount = await this.verifyJSONFile(file);
            result.totalDocuments += documentCount;
            result.collections.push({
              name: fileName.replace('.json', ''),
              size: stats.size,
              documents: documentCount,
              valid: true
            });
          } catch (error) {
            result.valid = false;
            result.errors.push(`Error en ${fileName}: ${error.message}`);
            result.collections.push({
              name: fileName.replace('.json', ''),
              size: stats.size,
              valid: false,
              error: error.message
            });
          }
        }
      }
    } catch (error) {
      result.valid = false;
      result.errors.push(`Error verificando estructura JSON: ${error.message}`);
    }
 
    return result;
  }
 
  /**
   * Verifica un archivo JSON individual y cuenta documentos
   * @param {string} jsonPath - Ruta del archivo JSON
   * @returns {Promise<number>} Número de documentos válidos
   */
  async verifyJSONFile(jsonPath) {
    const content = await fs.readFile(jsonPath, 'utf8');
    const lines = content.trim().split('\n');
    let documentCount = 0;
 
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        try {
          JSON.parse(line);
          documentCount++;
        } catch (error) {
          throw new Error(`JSON inválido en línea ${i + 1}: ${error.message}`);
        }
      }
    }
 
    return documentCount;
  }
 
  /**
   * Verifica que un respaldo puede ser restaurado correctamente
   * @param {string} backupPath - Ruta del respaldo
   * @param {string} testDbUri - URI de base de datos de prueba
   * @returns {Promise<Object>} Resultado de la verificación de restauración
   */
  async verifyRestorability(backupPath, testDbUri) {
    const result = {
      restorable: false,
      collections: [],
      errors: [],
      testDuration: 0
    };
 
    const startTime = Date.now();
 
    try {
      // Crear una base de datos temporal para la prueba
      const testDbName = `backup_test_${Date.now()}`;
      const client = new MongoClient(testDbUri);
     
      await client.connect();
      const testDb = client.db(testDbName);
 
      try {
        // Intentar restaurar el respaldo en la base de datos de prueba
        await this.performTestRestore(backupPath, testDbName, testDbUri);
 
        // Verificar que las colecciones fueron restauradas
        const collections = await testDb.listCollections().toArray();
       
        for (const collection of collections) {
          const collectionName = collection.name;
          const count = await testDb.collection(collectionName).countDocuments();
         
          result.collections.push({
            name: collectionName,
            documents: count,
            restored: true
          });
        }
 
        result.restorable = true;
 
      } finally {
        // Limpiar base de datos de prueba
        await testDb.dropDatabase();
        await client.close();
      }
 
    } catch (error) {
      result.errors.push(`Error en verificación de restauración: ${error.message}`);
    }
 
    result.testDuration = Date.now() - startTime;
    return result;
  }
 
  /**
   * Realiza una restauración de prueba
   * @param {string} backupPath - Ruta del respaldo
   * @param {string} testDbName - Nombre de la base de datos de prueba
   * @param {string} testDbUri - URI de la base de datos de prueba
   */
  async performTestRestore(backupPath, testDbName, testDbUri) {
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
     
      const mongorestore = spawn('mongorestore', [
        '--uri', testDbUri,
        '--db', testDbName,
        '--drop',
        backupPath
      ]);
 
      let stderr = '';
 
      mongorestore.stderr.on('data', (data) => {
        stderr += data.toString();
      });
 
      mongorestore.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`mongorestore falló: ${stderr}`));
        } else {
          resolve();
        }
      });
 
      mongorestore.on('error', (error) => {
        reject(new Error(`Error ejecutando mongorestore: ${error.message}`));
      });
    });
  }
 
  /**
   * Genera un reporte completo de integridad
   * @param {string} backupPath - Ruta del respaldo
   * @param {Object} metadata - Metadatos del respaldo
   * @returns {Promise<Object>} Reporte completo de integridad
   */
  async generateIntegrityReport(backupPath, metadata) {
    const report = {
      backupId: metadata.id,
      timestamp: new Date(),
      backupTimestamp: metadata.timestamp,
      format: metadata.format,
      checks: {
        checksum: { status: 'pending', result: null },
        structure: { status: 'pending', result: null },
        compression: { status: 'pending', result: null },
        restorability: { status: 'pending', result: null }
      },
      overall: { status: 'pending', valid: false },
      errors: []
    };
 
    try {
      // Verificación de checksum
      if (metadata.checksum) {
        try {
          const isValid = await this.verifyBackup(backupPath, metadata.checksum);
          report.checks.checksum = { status: 'completed', result: isValid };
        } catch (error) {
          report.checks.checksum = { status: 'failed', error: error.message };
          report.errors.push(`Checksum: ${error.message}`);
        }
      }
 
      // Verificación de estructura según el formato
      try {
        let structureResult;
        if (metadata.format === 'bson') {
          structureResult = await this.verifyBSONBackup(backupPath);
        } else if (metadata.format === 'json') {
          structureResult = await this.verifyJSONBackup(backupPath);
        }
       
        report.checks.structure = { status: 'completed', result: structureResult };
       
        if (!structureResult.valid) {
          report.errors.push(...structureResult.errors);
        }
      } catch (error) {
        report.checks.structure = { status: 'failed', error: error.message };
        report.errors.push(`Estructura: ${error.message}`);
      }
 
      // Verificación de compresión si aplica
      if (metadata.compressedPath) {
        try {
          const isValid = await this.verifyCompressedFile(metadata.compressedPath);
          report.checks.compression = { status: 'completed', result: isValid };
        } catch (error) {
          report.checks.compression = { status: 'failed', error: error.message };
          report.errors.push(`Compresión: ${error.message}`);
        }
      }
 
      // Determinar estado general
      const allChecks = Object.values(report.checks);
      const failedChecks = allChecks.filter(check => check.status === 'failed');
      const completedChecks = allChecks.filter(check => check.status === 'completed');
 
      if (failedChecks.length > 0) {
        report.overall = { status: 'failed', valid: false };
      } else if (completedChecks.length === allChecks.length) {
        const allValid = completedChecks.every(check =>
          check.result === true || (check.result && check.result.valid !== false)
        );
        report.overall = { status: 'completed', valid: allValid };
      }
 
    } catch (error) {
      report.overall = { status: 'error', valid: false };
      report.errors.push(`Error general: ${error.message}`);
    }
 
    return report;
  }
 
  /**
   * Obtiene estadísticas de integridad de múltiples respaldos
   * @param {string[]} backupPaths - Rutas de los respaldos
   * @returns {Promise<Object>} Estadísticas de integridad
   */
  async getIntegrityStatistics(backupPaths) {
    const stats = {
      total: backupPaths.length,
      valid: 0,
      invalid: 0,
      errors: 0,
      totalSize: 0,
      averageSize: 0,
      oldestBackup: null,
      newestBackup: null
    };
 
    for (const backupPath of backupPaths) {
      try {
        const metadataPath = path.join(backupPath, 'metadata.json');
        const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
       
        const report = await this.generateIntegrityReport(backupPath, metadata);
       
        if (report.overall.valid) {
          stats.valid++;
        } else {
          stats.invalid++;
        }
 
        stats.totalSize += metadata.size || 0;
 
        // Actualizar fechas más antigua y más nueva
        const backupDate = new Date(metadata.timestamp);
        if (!stats.oldestBackup || backupDate < new Date(stats.oldestBackup)) {
          stats.oldestBackup = metadata.timestamp;
        }
        if (!stats.newestBackup || backupDate > new Date(stats.newestBackup)) {
          stats.newestBackup = metadata.timestamp;
        }
 
      } catch (error) {
        stats.errors++;
      }
    }
 
    stats.averageSize = stats.total > 0 ? stats.totalSize / stats.total : 0;
 
    return stats;
  }
}
 
module.exports = IntegrityChecker;
 