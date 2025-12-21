/* eslint-disable */
// SUPABASE STORAGE UTILITIES - Image upload and management
// NOW WITH ANTI-PIRACY PROTECTION + AD POLICY ENFORCEMENT

import { supabase } from '../lib/supabase';
import { checkForPiracy } from './antiPiracy';
import { validateContentForAds, logAdViolation } from '../../utils/adPolicy';

const BUCKET_NAME = 'artworks';

// Initialize storage bucket (call this once during app setup)
export async function initializeStorage() {
  const { data, error } = await supabase.storage.getBucket(BUCKET_NAME);

  if (error && error.message.includes('not found')) {
    // Create bucket if it doesn't exist
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 10485760 // 10MB
    });

    if (createError) console.error('Error creating storage bucket:', createError);
  }
}

// Upload file to Supabase Storage
export async function uploadFile(file, path, userId = null, metadata = {}) {
  // ANTI-PIRACY CHECK BEFORE UPLOAD
  if (userId) {
    const piracyCheck = await checkForPiracy(file, userId);
    
    if (piracyCheck.isBlocked) {
      throw new Error(
        `Upload blocked: ${piracyCheck.violations[0]?.message || 'Pirated content detected'}`
      );
    }
    
    // Log warnings but allow upload
    if (piracyCheck.violations.length > 0) {
      console.warn('Upload warnings:', piracyCheck.violations);
    }
  }
  
  // AD POLICY CHECK FOR PAID CONTENT
  if (metadata.tier && metadata.tier !== 'FREE') {
    const adCheck = await validateContentForAds(
      metadata.description || '',
      metadata
    );
    
    if (!adCheck.approved) {
      await logAdViolation(userId, null, adCheck.violations);
      throw new Error(
        `Upload blocked: ${adCheck.message}`
      );
    }
  }
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return {
    path: data.path,
    url: publicUrl
  };
}

// Upload multiple files
export async function uploadFiles(files, userId) {
  const uploadPromises = files.map(async (file) => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const fileExtension = file.name.split('.').pop();
    const filePath = `${userId}/${timestamp}-${randomId}.${fileExtension}`;

    return uploadFile(file, filePath, userId);
  });

  return Promise.all(uploadPromises);
}

// Delete file from storage
export async function deleteFile(path) {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) throw error;
}

// Get signed URL for private files (if needed)
export async function getSignedUrl(path, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

// List files in a directory
export async function listFiles(path = '') {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(path);

  if (error) throw error;
  return data;
}

export default {
  initializeStorage,
  uploadFile,
  uploadFiles,
  deleteFile,
  getSignedUrl,
  listFiles
};
