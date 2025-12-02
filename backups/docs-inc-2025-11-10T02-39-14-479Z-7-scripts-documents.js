// examples/scripts-documents.js

require('dotenv').config();
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
        if (['node_modules','build','dist','.git'].includes(entry.name)) continue;
        await walk(full);
      } else {
        const stat = await fs.stat(full);
        if (stat.mtimeMs >= cutoff) results.push({ file: full, mtime: new Date(stat.mtimeMs) });
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
  await ensureDir(reportDir);

  const report = { runAt: new Date().toISOString(), items: [], summary: { total: 0, backedUp: 0, errors: 0 } };

  for (let idx = 0; idx < modified.length; idx++) {
    const item = modified[idx];
    const id = `docs-inc-${timestamp}-${idx+1}`;
    const originalChecksum = await integrity.generateChecksum(item.file, 'sha256');

    try {
      await storage.providers.local.store(item.file, { id });
      report.items.push({ file: item.file, backupId: id, checksum: originalChecksum });
      report.summary.backedUp++;
    } catch (e) {
      report.items.push({ file: item.file, error: e.message });
      report.summary.errors++;
    }
    report.summary.total++;
  }

  const reportPath = path.join(reportDir, `docs-backup-report-${timestamp}.json`);
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`Reporte generado: ${reportPath}`);
  console.log('Resumen: ', report.summary);
}

run().catch(err => {
  console.error('Error en respaldo de documentos:', err);
});
