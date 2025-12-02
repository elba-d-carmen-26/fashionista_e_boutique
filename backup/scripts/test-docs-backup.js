const path = require('path');
const fs = require('fs').promises;
const { config } = require('../config/backup-config');
const StorageManager = require('../src/StorageManager');
const IntegrityChecker = require('../src/IntegrityChecker');
const Logger = require('../src/Logger');
 
async function listRecentlyModifiedFiles(repoRoot, hours = 12) {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  const results = [];
 
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // omitir node_modules y build
        if (entry.name === 'node_modules' || entry.name === 'build' || entry.name === 'dist' || entry.name === '.git') continue;
        await walk(full);
      } else {
        const stat = await fs.stat(full);
        if (stat.mtimeMs >= cutoff) {
          results.push({ file: full, mtime: new Date(stat.mtimeMs) });
        }
      }
    }
  }
  await walk(repoRoot);
  return results;
}
 
async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}
 
async function run() {
  const repoRoot = path.resolve(path.join(__dirname, '../../'));
  const logger = new Logger({ level: 'info', file: path.join(__dirname, '../logs/backup.log'), maxSize: '10m', maxFiles: 5 });
  const storage = new StorageManager(config, logger);
  const integrity = new IntegrityChecker({ algorithm: 'sha256' });
 
  const modified = await listRecentlyModifiedFiles(repoRoot, 12);
  if (modified.length === 0) {
    console.log('No se detectaron archivos modificados recientemente.');
    return;
  }
 
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportDir = path.join(repoRoot, 'backups', 'reports');
  const restoreDir = path.join(repoRoot, 'backups', 'test-restore', timestamp);
  await ensureDir(reportDir);
  await ensureDir(restoreDir);
 
  const report = {
    runAt: new Date().toISOString(),
    basePath: storage.providers.local ? storage.providers.local.basePath : config.storage?.local?.basePath,
    items: [],
    summary: { total: 0, backedUp: 0, validated: 0, restored: 0, errors: 0 }
  };
 
  let idx = 0;
  for (const item of modified) {
    idx++;
    const id = `docs-inc-${timestamp}-${idx}`;
    const originalChecksum = await integrity.generateChecksum(item.file, 'sha256');
    const metadata = { id, timestamp: Date.now(), format: 'file', description: 'Respaldo incremental de documento modificado' };
 
    let storeResult = null;
    let restoreResult = null;
    let validated = false;
    let restored = false;
    let error = null;
 
    try {
      storeResult = await storage.providers.local.store(item.file, metadata);
      validated = storeResult.checksum === originalChecksum;
 
      const targetPath = path.join(restoreDir, path.basename(item.file));
      restoreResult = await storage.providers.local.retrieve(id, targetPath);
      const restoredChecksum = await integrity.generateChecksum(targetPath, 'sha256');
      restored = restoredChecksum === originalChecksum;
    } catch (e) {
      error = e.message;
    }
 
    report.items.push({
      file: path.relative(repoRoot, item.file),
      modifiedAt: item.mtime.toISOString(),
      backupId: id,
      originalChecksum,
      store: storeResult ? { location: storeResult.location, size: storeResult.size, checksum: storeResult.checksum } : null,
      restore: restoreResult ? { size: restoreResult.size } : null,
      validated,
      restored,
      error
    });
 
    report.summary.total++;
    if (storeResult) report.summary.backedUp++;
    if (validated) report.summary.validated++;
    if (restored) report.summary.restored++;
    if (error) report.summary.errors++;
  }
 
  const reportPath = path.join(reportDir, `docs-backup-report-${timestamp}.json`);
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`Reporte generado: ${reportPath}`);
  console.log(`Resumen: `, report.summary);
}
 
run().catch(err => {
  console.error('Error en prueba de respaldo de documentos:', err);
  process.exit(1);
});