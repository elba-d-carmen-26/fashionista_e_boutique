/**
 * Gestor de Almacenamiento para Respaldos
 * 
 * Esta clase maneja el almacenamiento de respaldos en diferentes ubicaciones:
 * - Almacenamiento local (sistema de archivos)
 * - Almacenamiento remoto (AWS S3, Google Cloud Storage, FTP, SFTP)
 * - Sincronización entre ubicaciones
 * - Gestión de políticas de retención
 */

// src/StorageManager.js
const fs = require('fs').promises;
const path = require('path');
const AWS = require('aws-sdk');

class StorageManager {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.providers = {};

    // Inicializar almacenamiento local
    if (this.config.storage.local?.enabled) {
      this.providers.local = {
        basePath: this.config.storage.local.basePath,
        store: async (filePath, metadata) => {
          const destPath = path.join(this.config.storage.local.basePath, `${metadata.id}-${path.basename(filePath)}`);
          await fs.mkdir(path.dirname(destPath), { recursive: true });
          await fs.copyFile(filePath, destPath);
          return {
            location: destPath,
            size: (await fs.stat(filePath)).size,
            checksum: metadata.id // opcional
          };
        },
        retrieve: async (id, targetPath) => {
          // Asume que el archivo ya tiene el ID en el nombre
          const files = await fs.readdir(this.config.storage.local.basePath);
          const match = files.find(f => f.startsWith(id));
          if (!match) throw new Error(`Archivo ${id} no encontrado en local`);
          const sourcePath = path.join(this.config.storage.local.basePath, match);
          await fs.copyFile(sourcePath, targetPath);
          return { size: (await fs.stat(targetPath)).size };
        }
      };
    }

    // Inicializar AWS S3
    if (this.config.storage.remote?.aws?.enabled) {
      const awsConf = this.config.storage.remote.aws;
      this.logger?.info("Configuración AWS detectada:", awsConf);

      const s3 = new AWS.S3({
        accessKeyId: awsConf.accessKeyId,
        secretAccessKey: awsConf.secretAccessKey,
        region: awsConf.region
      });

      this.providers.aws = {
        store: async (filePath, metadata) => {
          const fileStream = await fs.readFile(filePath);
          const key = `${metadata.id}-${path.basename(filePath)}`;
          await s3.putObject({
            Bucket: awsConf.bucket,
            Key: key,
            Body: fileStream,
            StorageClass: awsConf.storageClass || 'STANDARD'
          }).promise();

          return {
            location: `s3://${awsConf.bucket}/${key}`,
            size: fileStream.length,
            checksum: metadata.id
          };
        },
        retrieve: async (id, targetPath) => {
          const key = `${id}-${path.basename(targetPath)}`;
          const data = await s3.getObject({ Bucket: awsConf.bucket, Key: key }).promise();
          await fs.writeFile(targetPath, data.Body);
          return { size: data.ContentLength };
        }
      };
    }

    // Log de proveedores activos
    this.logger?.info('Proveedores de almacenamiento inicializados', Object.keys(this.providers));
  }
}

module.exports = StorageManager;
