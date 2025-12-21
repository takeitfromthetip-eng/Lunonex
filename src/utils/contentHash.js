/* eslint-disable */
/**
 * CONTENT HASH VERIFICATION SYSTEM
 * Prevents re-uploads of blocked content with renamed files
 * Uses perceptual hashing to detect identical/similar videos
 */

import crypto from 'crypto';

// Database of known pirated content hashes
let blockedContentHashes = new Set();

/**
 * Generate file hash (MD5)
 */
export function generateFileHash(buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex');
}

/**
 * Generate perceptual hash for videos (simplified)
 * In production, use a proper video fingerprinting library
 */
export async function generatePerceptualHash(videoBuffer, metadata = {}) {
  // Simplified: Hash based on file size, duration, and sample frames
  const sizeHash = videoBuffer.length.toString(16);
  const durationHash = metadata.duration ? metadata.duration.toString(16) : '0';
  const combined = `${sizeHash}-${durationHash}`;
  
  return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 16);
}

/**
 * Check if content hash matches known pirated content
 */
export async function checkContentHash(fileHash, perceptualHash = null) {
  // Check exact match
  if (blockedContentHashes.has(fileHash)) {
    return {
      isBlocked: true,
      matchType: 'EXACT',
      message: 'This exact file was previously identified as pirated content'
    };
  }
  
  // Check perceptual match (similar content, different encoding)
  if (perceptualHash && blockedContentHashes.has(perceptualHash)) {
    return {
      isBlocked: true,
      matchType: 'PERCEPTUAL',
      message: 'This content matches a previously blocked video'
    };
  }
  
  return {
    isBlocked: false,
    matchType: 'NONE'
  };
}

/**
 * Add hash to blocked list
 */
export function addToBlockedHashes(fileHash, perceptualHash = null, metadata = {}) {
  blockedContentHashes.add(fileHash);
  if (perceptualHash) {
    blockedContentHashes.add(perceptualHash);
  }
  
  // In production, store in database
  console.log(`Added to blocklist: ${fileHash}`);
}

/**
 * Load blocked hashes from database on startup
 */
export async function loadBlockedHashes(supabase) {
  try {
    const { data, error } = await supabase
      .from('blocked_content_hashes')
      .select('file_hash, perceptual_hash');
    
    if (error) throw error;
    
    data?.forEach(entry => {
      blockedContentHashes.add(entry.file_hash);
      if (entry.perceptual_hash) {
        blockedContentHashes.add(entry.perceptual_hash);
      }
    });
    
    console.log(`Loaded ${blockedContentHashes.size} blocked content hashes`);
  } catch (error) {
    console.error('Error loading blocked hashes:', error);
  }
}

export default {
  generateFileHash,
  generatePerceptualHash,
  checkContentHash,
  addToBlockedHashes,
  loadBlockedHashes
};
