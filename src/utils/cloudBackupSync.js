/* eslint-disable */
/**
 * Cloud Backup & Sync System
 *
 * Auto-backup local storage to cloud with:
 * - Incremental sync (only changed files)
 * - Compression to save bandwidth
 * - Conflict resolution
 * - Offline queue management
 * - Multi-cloud support (Firebase, Supabase, S3)
 */

import { localMediaStorage } from './localMediaStorage';

const SYNC_INTERVAL = 5 * 60 * 1000; // Sync every 5 minutes
const MAX_UPLOAD_SIZE = 100 * 1024 * 1024; // 100MB chunks
const COMPRESSION_QUALITY = 0.8; // 80% quality for images

class CloudBackupSync {
  constructor() {
    this.syncing = false;
    this.lastSync = null;
    this.syncQueue = [];
    this.failedUploads = [];
    this.autoSyncEnabled = false;
    this.provider = 'firebase'; // Default provider
  }

  /**
   * Initialize auto-sync
   */
  async initialize(provider = 'firebase', autoSync = true) {
    this.provider = provider;
    this.autoSyncEnabled = autoSync;

    // Load last sync time
    this.lastSync = localStorage.getItem('lastCloudSync');

    console.log(`☁️ Cloud sync initialized (${provider})`);

    if (autoSync) {
      this.startAutoSync();
    }

    // Retry failed uploads on startup
    await this.retryFailedUploads();
  }

  /**
   * Start automatic background sync
   */
  startAutoSync() {
    console.log('🔄 Auto-sync enabled');

    // Sync immediately
    this.syncToCloud();

    // Then sync every interval
    this.syncTimer = setInterval(() => {
      this.syncToCloud();
    }, SYNC_INTERVAL);

    // Sync before page unload
    window.addEventListener('beforeunload', () => {
      this.syncToCloud(true); // Force sync
    });
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync() {
    this.autoSyncEnabled = false;
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    console.log('⏸️ Auto-sync disabled');
  }

  /**
   * Sync local storage to cloud
   */
  async syncToCloud(force = false) {
    if (this.syncing) {
      console.log('⏳ Sync already in progress');
      return;
    }

    // Check if enough time has passed
    if (!force && this.lastSync) {
      const timeSinceLastSync = Date.now() - new Date(this.lastSync).getTime();
      if (timeSinceLastSync < SYNC_INTERVAL) {
        console.log('⏭️ Skipping sync - too soon');
        return;
      }
    }

    this.syncing = true;
    console.log('☁️ Starting cloud sync...');

    try {
      // Get all local files
      const localFiles = await localMediaStorage.getAllFiles();
      console.log(`📦 Found ${localFiles.length} local files`);

      // Get cloud manifest (list of already uploaded files)
      const cloudManifest = await this.getCloudManifest();

      // Find files that need syncing (new or modified)
      const filesToSync = localFiles.filter(file => {
        const cloudFile = cloudManifest[file.id];
        if (!cloudFile) return true; // New file
        if (file.hash !== cloudFile.hash) return true; // Modified
        return false; // Already synced
      });

      console.log(`📤 ${filesToSync.length} files need syncing`);

      if (filesToSync.length === 0) {
        console.log('✅ Everything is already synced');
        this.lastSync = new Date().toISOString();
        localStorage.setItem('lastCloudSync', this.lastSync);
        return { synced: 0, skipped: localFiles.length };
      }

      // Upload files in batches
      let synced = 0;
      let failed = 0;

      for (const file of filesToSync) {
        try {
          await this.uploadFile(file);
          synced++;
          console.log(`✅ Synced: ${file.filename} (${synced}/${filesToSync.length})`);
        } catch (error) {
          console.error(`❌ Failed to sync: ${file.filename}`, error);
          this.failedUploads.push({ file, error: error.message, timestamp: Date.now() });
          failed++;
        }

        // Breathing room
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Update manifest
      await this.updateCloudManifest(localFiles);

      this.lastSync = new Date().toISOString();
      localStorage.setItem('lastCloudSync', this.lastSync);

      console.log(`✅ Sync complete: ${synced} synced, ${failed} failed`);

      return { synced, failed, total: filesToSync.length };

    } catch (error) {
      console.error('❌ Cloud sync failed:', error);
      throw error;
    } finally {
      this.syncing = false;
    }
  }

  /**
   * Upload a single file to cloud
   */
  async uploadFile(file) {
    // Compress if image
    let fileData = file.file;
    if (file.type.startsWith('image/') && file.size > 1024 * 1024) { // > 1MB
      fileData = await this.compressImage(file.file);
      console.log(`🗜️ Compressed ${file.filename}: ${file.size} → ${fileData.size}`);
    }

    // Upload based on provider
    switch (this.provider) {
      case 'firebase':
        return await this.uploadToFirebase(file, fileData);
      case 'supabase':
        return await this.uploadToSupabase(file, fileData);
      case 's3':
        return await this.uploadToS3(file, fileData);
      default:
        throw new Error(`Unknown provider: ${this.provider}`);
    }
  }

  /**
   * Upload to Firebase Storage
   */
  async uploadToFirebase(file, fileData) {
    const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');

    const storage = getStorage();
    const storageRef = ref(storage, `user-backups/${file.userId}/${file.id}`);

    const snapshot = await uploadBytes(storageRef, fileData, {
      contentType: file.type,
      customMetadata: {
        originalName: file.filename,
        hash: file.hash,
        uploadedAt: new Date().toISOString()
      }
    });

    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      provider: 'firebase',
      path: snapshot.ref.fullPath,
      url: downloadURL
    };
  }

  /**
   * Upload to Supabase Storage
   */
  async uploadToSupabase(file, fileData) {
    const { createClient } = await import('@supabase/supabase-js');

    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase.storage
      .from('user-backups')
      .upload(`${file.userId}/${file.id}`, fileData, {
        contentType: file.type,
        upsert: true, // Overwrite if exists
        metadata: {
          originalName: file.filename,
          hash: file.hash
        }
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('user-backups')
      .getPublicUrl(data.path);

    return {
      provider: 'supabase',
      path: data.path,
      url: urlData.publicUrl
    };
  }

  /**
   * Upload to AWS S3
   */
  async uploadToS3(file, fileData) {
    // Requires AWS SDK setup
    const response = await fetch('/api/upload-to-s3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.filename,
        fileType: file.type,
        fileId: file.id,
        userId: file.userId
      })
    });

    const { uploadUrl } = await response.json();

    // Upload directly to S3
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: fileData
    });

    return {
      provider: 's3',
      path: `user-backups/${file.userId}/${file.id}`,
      url: uploadUrl.split('?')[0] // Remove query params
    };
  }

  /**
   * Compress image for upload
   */
  async compressImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Resize if too large
          let width = img.width;
          let height = img.height;
          const maxDimension = 2048;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => resolve(blob),
            file.type,
            COMPRESSION_QUALITY
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get cloud manifest (list of uploaded files)
   */
  async getCloudManifest() {
    try {
      const response = await fetch('/api/cloud-manifest');
      const manifest = await response.json();
      return manifest;
    } catch (error) {
      console.warn('⚠️ Could not load cloud manifest:', error);
      return {};
    }
  }

  /**
   * Update cloud manifest
   */
  async updateCloudManifest(files) {
    const manifest = {};
    files.forEach(file => {
      manifest[file.id] = {
        hash: file.hash,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      };
    });

    await fetch('/api/cloud-manifest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(manifest)
    });
  }

  /**
   * Retry failed uploads
   */
  async retryFailedUploads() {
    if (this.failedUploads.length === 0) return;

    console.log(`🔄 Retrying ${this.failedUploads.length} failed uploads`);

    const retryQueue = [...this.failedUploads];
    this.failedUploads = [];

    for (const { file } of retryQueue) {
      try {
        await this.uploadFile(file);
        console.log(`✅ Retry successful: ${file.filename}`);
      } catch (error) {
        console.error(`❌ Retry failed: ${file.filename}`, error);
        this.failedUploads.push({ file, error: error.message, timestamp: Date.now() });
      }
    }
  }

  /**
   * Download from cloud to restore local storage
   */
  async restoreFromCloud(userId) {
    console.log('☁️ Restoring from cloud backup...');

    const manifest = await this.getCloudManifest();
    const fileIds = Object.keys(manifest);

    console.log(`📥 Downloading ${fileIds.length} files...`);

    let restored = 0;
    let failed = 0;

    for (const fileId of fileIds) {
      try {
        const fileData = await this.downloadFile(fileId);
        await localMediaStorage.storeFile(fileData.file, fileData.metadata);
        restored++;
        console.log(`✅ Restored: ${fileData.metadata.filename} (${restored}/${fileIds.length})`);
      } catch (error) {
        console.error(`❌ Failed to restore: ${fileId}`, error);
        failed++;
      }
    }

    console.log(`✅ Restore complete: ${restored} restored, ${failed} failed`);

    return { restored, failed, total: fileIds.length };
  }

  /**
   * Download file from cloud
   */
  async downloadFile(fileId) {
    const response = await fetch(`/api/cloud-backup/${fileId}`);
    const blob = await response.blob();
    const metadata = JSON.parse(response.headers.get('X-File-Metadata'));

    return {
      file: new File([blob], metadata.filename, { type: metadata.type }),
      metadata
    };
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      syncing: this.syncing,
      lastSync: this.lastSync,
      autoSyncEnabled: this.autoSyncEnabled,
      provider: this.provider,
      failedUploads: this.failedUploads.length,
      queueSize: this.syncQueue.length
    };
  }
}

// Singleton instance
export const cloudBackupSync = new CloudBackupSync();

export default CloudBackupSync;
