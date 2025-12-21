/**
 * Unified Storage Manager - Local (IndexedDB) + Cloud (Supabase)
 * Handles automatic sync, offline queue, and storage quota management
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// IndexedDB setup
const DB_NAME = 'ForTheWeebsStorage';
const DB_VERSION = 1;
const STORES = {
  IMAGES: 'images',
  VIDEOS: 'videos',
  AUDIO: 'audio',
  PROJECTS: 'projects',
  CACHE: 'cache',
  QUEUE: 'uploadQueue'
};

class StorageManager {
  constructor() {
    this.db = null;
    this.initPromise = this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores if they don't exist
        Object.values(STORES).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('userId', 'userId', { unique: false });
            if (storeName === STORES.QUEUE) {
              store.createIndex('status', 'status', { unique: false });
            }
          }
        });
      };
    });
  }

  // Save file locally
  async saveLocal(storeName, data) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const fileData = {
        ...data,
        timestamp: Date.now(),
        synced: false
      };
      
      const request = store.add(fileData);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get file from local storage
  async getLocal(storeName, id) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all files from local storage
  async getAllLocal(storeName, limit = 100) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll(null, limit);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Delete from local storage
  async deleteLocal(storeName, id) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Save to cloud (Supabase Storage)
  async saveCloud(bucket, filePath, fileData, userId) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileData, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // Save metadata to database
      await supabase
        .from('user_files')
        .insert({
          user_id: userId,
          file_path: filePath,
          file_url: urlData.publicUrl,
          bucket: bucket,
          file_type: fileData.type,
          file_size: fileData.size,
          created_at: new Date().toISOString()
        });

      return {
        path: data.path,
        url: urlData.publicUrl
      };
    } catch (error) {
      console.error('Cloud upload error:', error);
      throw error;
    }
  }

  // Get from cloud
  async getCloud(bucket, filePath) {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (error) throw error;
    return data;
  }

  // Smart save: Local first, queue for cloud
  async saveSmart(storeName, bucket, data, userId, options = {}) {
    const { cloudSync = true, immediate = false } = options;

    try {
      // Always save locally first
      const localId = await this.saveLocal(storeName, data);

      // Queue for cloud upload
      if (cloudSync && supabase) {
        await this.queueCloudUpload({
          localId,
          storeName,
          bucket,
          data,
          userId,
          immediate
        });
      }

      return { localId, cloudPending: cloudSync };
    } catch (error) {
      console.error('Smart save error:', error);
      throw error;
    }
  }

  // Queue file for cloud upload
  async queueCloudUpload(uploadData) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.QUEUE], 'readwrite');
      const store = transaction.objectStore(STORES.QUEUE);
      
      const queueItem = {
        ...uploadData,
        status: 'pending',
        attempts: 0,
        timestamp: Date.now()
      };
      
      const request = store.add(queueItem);
      request.onsuccess = () => {
        resolve(request.result);
        if (uploadData.immediate && navigator.onLine) {
          this.processQueue();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Process upload queue
  async processQueue() {
    if (!navigator.onLine || !supabase) return;

    const queue = await this.getAllLocal(STORES.QUEUE);
    const pending = queue.filter(item => item.status === 'pending' && item.attempts < 3);

    for (const item of pending) {
      try {
        const filePath = `${item.userId}/${item.storeName}/${Date.now()}_${item.data.name || 'file'}`;
        await this.saveCloud(item.bucket, filePath, item.data, item.userId);
        
        // Mark as synced locally
        const localItem = await this.getLocal(item.storeName, item.localId);
        if (localItem) {
          localItem.synced = true;
          await this.updateLocal(item.storeName, localItem);
        }

        // Remove from queue
        await this.deleteLocal(STORES.QUEUE, item.id);
      } catch (error) {
        console.error('Queue processing error:', error);
        // Increment attempts
        item.attempts++;
        item.lastError = error.message;
        await this.updateLocal(STORES.QUEUE, item);
      }
    }
  }

  // Update local storage
  async updateLocal(storeName, data) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Check storage quota
  async checkQuota() {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        percentUsed: (estimate.usage / estimate.quota * 100).toFixed(2),
        available: estimate.quota - estimate.usage
      };
    }
    return null;
  }

  // Clear old cached items
  async clearOldCache(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days default
    await this.initPromise;
    const now = Date.now();
    const cache = await this.getAllLocal(STORES.CACHE);
    
    for (const item of cache) {
      if (now - item.timestamp > maxAge) {
        await this.deleteLocal(STORES.CACHE, item.id);
      }
    }
  }

  // Get sync status
  async getSyncStatus(storeName) {
    const items = await this.getAllLocal(storeName);
    const total = items.length;
    const synced = items.filter(item => item.synced).length;
    const pending = total - synced;

    return { total, synced, pending, percentSynced: total > 0 ? (synced / total * 100).toFixed(2) : 0 };
  }
}

// Export singleton instance
export const storageManager = new StorageManager();
export { STORES };

// Auto-process queue when online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('📡 Back online - processing upload queue...');
    storageManager.processQueue();
  });

  // Process queue every 5 minutes if online
  setInterval(() => {
    if (navigator.onLine) {
      storageManager.processQueue();
    }
  }, 5 * 60 * 1000);
}
