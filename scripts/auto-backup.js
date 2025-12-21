#!/usr/bin/env node

/**
 * AUTOMATIC LOCAL BACKUP SYSTEM
 * Runs every time you commit to create local backups
 *
 * This prevents GitHub from destroying your work
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function exec(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    return null;
  }
}

function createBackup() {
  console.log('\n💾 Creating automatic backup...');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupDir = 'D:/FORTHEWEEBS-BACKUPS';

  // Create backup directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    try {
      fs.mkdirSync(backupDir, { recursive: true });
    } catch (error) {
      console.log('⚠️  Could not create backup directory on D:');
      return;
    }
  }

  // Get current commit hash
  const commitHash = exec('git rev-parse --short HEAD');
  const commitMessage = exec('git log -1 --pretty=%B');

  const backupName = `backup-${timestamp}-${commitHash ? commitHash.trim() : 'unknown'}`;
  const backupPath = path.join(backupDir, `${backupName}.tar.gz`);

  console.log(`📦 Backup: ${backupName}`);

  // Create compressed backup using git archive (faster and cross-platform)
  const result = exec(`git archive --format=tar.gz --output="${backupPath}" HEAD`);

  if (result !== null) {
    console.log('✅ Backup created successfully!');
    console.log(`📍 Location: ${backupPath}`);

    // Create backup manifest
    const manifestPath = path.join(backupDir, 'BACKUP-MANIFEST.txt');
    const manifestEntry =
      `\n${'='.repeat(80)}\n` +
      `Backup: ${backupName}\n` +
      `Date: ${new Date().toLocaleString()}\n` +
      `Commit: ${commitHash ? commitHash.trim() : 'unknown'}\n` +
      `Message: ${commitMessage ? commitMessage.trim() : 'unknown'}\n` +
      `${'='.repeat(80)}\n`;

    fs.appendFileSync(manifestPath, manifestEntry);

    // Keep only last 20 backups
    cleanOldBackups(backupDir, 20);
  } else {
    console.log('⚠️  Backup failed (this is OK, continuing...)');
  }
}

function cleanOldBackups(backupDir, keepCount) {
  try {
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('backup-') && f.endsWith('.tar.gz'))
      .map(f => ({
        name: f,
        path: path.join(backupDir, f),
        time: fs.statSync(path.join(backupDir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Newest first

    if (files.length > keepCount) {
      console.log(`\n🧹 Cleaning old backups (keeping ${keepCount} most recent)...`);

      files.slice(keepCount).forEach(file => {
        try {
          fs.unlinkSync(file.path);
          console.log(`   Removed: ${file.name}`);
        } catch (error) {
          // Ignore errors
        }
      });
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}

// Run backup
createBackup();
