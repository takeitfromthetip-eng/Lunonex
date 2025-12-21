// bugfixer/upload.js - Upload artifacts to Supabase Storage
const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { writeArtifact } = require('../../utils/server-safety');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || './artifacts';
const ARTIFACT_BUCKET = process.env.ARTIFACT_BUCKET || 'ftw-artifacts';

async function uploadArtifacts() {
  const uploadReceipt = {
    timestamp: new Date().toISOString(),
    bucket: ARTIFACT_BUCKET,
    uploaded: [],
    failed: [],
  };
  
  try {
    // Read all artifact files
    const files = await fs.readdir(ARTIFACT_DIR);
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      try {
        const filepath = path.join(ARTIFACT_DIR, file);
        const content = await fs.readFile(filepath, 'utf-8');
        
        // Upload to Supabase Storage (append-only)
        const { error } = await supabase.storage
          .from(ARTIFACT_BUCKET)
          .upload(file, content, {
            contentType: 'application/json',
            upsert: false, // NEVER overwrite
          });
        
        if (error && error.message !== 'The resource already exists') {
          throw error;
        }
        
        uploadReceipt.uploaded.push(file);
      } catch (error) {
        console.error(`[ArtifactUpload] Failed to upload ${file}:`, error);
        uploadReceipt.failed.push({ file, error: error.message });
      }
    }
    
    await writeArtifact('artifactUpload', uploadReceipt);
    
  } catch (error) {
    console.error('[ArtifactUpload] Upload process failed:', error);
    uploadReceipt.error = error.message;
  }
  
  return uploadReceipt;
}

// Nightly upload task
function startNightlyUpload() {
  const NIGHTLY_HOUR = 3; // 3 AM
  
  setInterval(async () => {
    const now = new Date();
    if (now.getHours() === NIGHTLY_HOUR && now.getMinutes() === 0) {

      try {
        const result = await uploadArtifacts();
        await writeArtifact('nightlyUploadRun', result);
      } catch (error) {
        console.error('[ArtifactUpload] Nightly upload failed:', error);
      }
    }
  }, 60000); // Check every minute
}

module.exports = {
  uploadArtifacts,
  startNightlyUpload,
};
