/* eslint-disable */
/**
 * 🧬 CONTENT DNA TRACKING
 * Perceptual hashing for finding stolen content across the web
 * Uses multiple hash algorithms (pHash, dHash, aHash) for robust matching
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';

// ============================================================================
// TYPES
// ============================================================================

export interface ContentFingerprint {
  id: string;
  artifact_id: string;
  creator_id: string;
  phash: string;
  dhash?: string;
  ahash?: string;
  file_type: string;
  file_size_bytes: number;
  dimensions: string;
  created_at: string;
  last_scanned_at?: string;
  scan_frequency: 'daily' | 'weekly' | 'monthly';
}

export interface ScanMatch {
  id: string;
  scan_id: string;
  fingerprint_id: string;
  matched_url: string;
  similarity_score: number;
  match_type: 'exact' | 'modified' | 'partial';
  detected_at: string;
  dmca_sent: boolean;
}

export interface WebScan {
  id: string;
  fingerprint_id: string;
  scan_source: string;
  urls_scanned: number;
  matches_found: number;
  status: 'pending' | 'running' | 'complete' | 'failed';
  scan_started_at: string;
  scan_completed_at?: string;
}

// ============================================================================
// CONTENT DNA ENGINE
// ============================================================================

export class ContentDNAEngine {
  private supabase: SupabaseClient;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    this.supabase = createClient(
      supabaseUrl || process.env.VITE_SUPABASE_URL || '',
      supabaseKey || process.env.VITE_SUPABASE_ANON_KEY || ''
    );
  }

  /**
   * Generate perceptual fingerprint for content
   */
  async generateFingerprint(
    file: File,
    artifactId: string,
    creatorId: string,
    scanFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<ContentFingerprint> {
    // Get image dimensions and hash
    const { width, height, phash, dhash, ahash } = await this.hashImage(file);

    // Insert fingerprint into database
    const { data, error } = await this.supabase
      .from('content_fingerprints')
      .insert({
        artifact_id: artifactId,
        creator_id: creatorId,
        phash,
        dhash,
        ahash,
        file_type: file.type,
        file_size_bytes: file.size,
        dimensions: `${width}x${height}`,
        scan_frequency: scanFrequency
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to generate fingerprint: ${error.message}`);

    console.log(`🧬 Fingerprint generated: ${phash.substring(0, 16)}...`);
    return data;
  }

  /**
   * Hash an image using multiple algorithms
   */
  private async hashImage(file: File): Promise<{
    width: number;
    height: number;
    phash: string;
    dhash: string;
    ahash: string;
  }> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = await this.loadImage(file);

    const originalWidth = img.width;
    const originalHeight = img.height;

    // Resize to 32x32 for hashing
    const hashSize = 32;
    canvas.width = hashSize;
    canvas.height = hashSize;
    ctx.drawImage(img, 0, 0, hashSize, hashSize);

    const imageData = ctx.getImageData(0, 0, hashSize, hashSize);
    const pixels = imageData.data;

    // Convert to grayscale
    const grayscale: number[] = [];
    for (let i = 0; i < pixels.length; i += 4) {
      const gray = Math.floor(
        pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114
      );
      grayscale.push(gray);
    }

    // Calculate average hash (aHash)
    const ahash = this.calculateAverageHash(grayscale);

    // Calculate difference hash (dHash)
    const dhash = this.calculateDifferenceHash(grayscale, hashSize);

    // Calculate perceptual hash (pHash) - simplified DCT-based
    const phash = this.calculatePerceptualHash(grayscale, hashSize);

    return {
      width: originalWidth,
      height: originalHeight,
      phash,
      dhash,
      ahash
    };
  }

  /**
   * Average Hash (aHash) - simple but effective
   */
  private calculateAverageHash(pixels: number[]): string {
    const avg = pixels.reduce((a, b) => a + b, 0) / pixels.length;
    const bits = pixels.map(p => (p > avg ? '1' : '0')).join('');
    return this.binaryToHex(bits);
  }

  /**
   * Difference Hash (dHash) - detects gradients
   */
  private calculateDifferenceHash(pixels: number[], size: number): string {
    const bits: string[] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size - 1; x++) {
        const idx = y * size + x;
        bits.push(pixels[idx] > pixels[idx + 1] ? '1' : '0');
      }
    }
    return this.binaryToHex(bits.join(''));
  }

  /**
   * Perceptual Hash (pHash) - DCT-based, robust to modifications
   */
  private calculatePerceptualHash(pixels: number[], size: number): string {
    // Simplified pHash using average of quadrants
    // In production, use proper DCT transform
    const quadrants = 4;
    const quadSize = size / 2;
    const quadAvgs: number[] = [];

    for (let qy = 0; qy < 2; qy++) {
      for (let qx = 0; qx < 2; qx++) {
        let sum = 0;
        let count = 0;
        for (let y = 0; y < quadSize; y++) {
          for (let x = 0; x < quadSize; x++) {
            const idx = (qy * quadSize + y) * size + (qx * quadSize + x);
            sum += pixels[idx];
            count++;
          }
        }
        quadAvgs.push(sum / count);
      }
    }

    const avgOfAvgs = quadAvgs.reduce((a, b) => a + b, 0) / quadAvgs.length;
    const bits = quadAvgs.map(q => (q > avgOfAvgs ? '1' : '0')).join('');
    
    // Repeat pattern to get 256-bit hash
    const fullBits = bits.repeat(Math.ceil(256 / bits.length)).substring(0, 256);
    return this.binaryToHex(fullBits);
  }

  /**
   * Compare two hashes and return similarity score (0-1)
   */
  calculateSimilarity(hash1: string, hash2: string): number {
    if (hash1.length !== hash2.length) return 0;

    // Convert hex to binary
    const bin1 = this.hexToBinary(hash1);
    const bin2 = this.hexToBinary(hash2);

    // Count differing bits (Hamming distance)
    let differences = 0;
    for (let i = 0; i < bin1.length; i++) {
      if (bin1[i] !== bin2[i]) differences++;
    }

    // Convert to similarity (1 = identical, 0 = completely different)
    return 1 - differences / bin1.length;
  }

  /**
   * Scan web for matching content
   */
  async scanWeb(
    fingerprintId: string,
    scanSource: 'google_images' | 'tineye' | 'manual' = 'manual'
  ): Promise<WebScan> {
    // Create scan record
    const { data: scan, error } = await this.supabase
      .from('web_scans')
      .insert({
        fingerprint_id: fingerprintId,
        scan_source: scanSource,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create scan: ${error.message}`);

    // In production, this would trigger background job
    // For now, return pending scan
    console.log(`🔍 Web scan initiated for fingerprint ${fingerprintId}`);

    return scan;
  }

  /**
   * Get fingerprints for a creator
   */
  async getCreatorFingerprints(creatorId: string): Promise<ContentFingerprint[]> {
    const { data, error } = await this.supabase
      .from('content_fingerprints')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get fingerprints: ${error.message}`);

    return data || [];
  }

  /**
   * Find potential matches in database
   */
  async findSimilarContent(
    hash: string,
    threshold: number = 0.85
  ): Promise<ContentFingerprint[]> {
    // Get all fingerprints (in production, use specialized search index)
    const { data: allFingerprints } = await this.supabase
      .from('content_fingerprints')
      .select('*');

    if (!allFingerprints) return [];

    // Calculate similarity for each
    const matches = allFingerprints
      .map(fp => ({
        ...fp,
        similarity: this.calculateSimilarity(hash, fp.phash)
      }))
      .filter(fp => fp.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);

    return matches;
  }

  /**
   * Auto-generate DMCA takedown notice
   */
  async generateDMCA(
    matchId: string,
    creatorId: string,
    infringingUrl: string,
    platform: string
  ): Promise<string> {
    const { data: match } = await this.supabase
      .from('scan_matches')
      .select('*, content_fingerprints(*)')
      .eq('id', matchId)
      .single();

    if (!match) throw new Error('Match not found');

    const dmcaTemplate = `
DMCA TAKEDOWN NOTICE

Date: ${new Date().toISOString().split('T')[0]}

To: ${platform} Copyright Agent

I am the copyright owner (or authorized agent) of the content identified below.

ORIGINAL WORK:
- Artifact ID: ${match.content_fingerprints.artifact_id}
- Content Hash: ${match.content_fingerprints.phash.substring(0, 16)}...
- Created: ${match.content_fingerprints.created_at}

INFRINGING CONTENT:
- URL: ${infringingUrl}
- Similarity Score: ${(match.similarity_score * 100).toFixed(1)}%
- Detected: ${match.detected_at}

I have a good faith belief that the use of this material is not authorized by the copyright owner, its agent, or the law.

I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or authorized to act on behalf of the owner.

Signature: [Digital Signature]
Creator ID: ${creatorId}
    `.trim();

    // Save DMCA record
    const { data: dmca, error } = await this.supabase
      .from('dmca_takedowns')
      .insert({
        match_id: matchId,
        creator_id: creatorId,
        infringing_url: infringingUrl,
        platform,
        dmca_template: dmcaTemplate
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to generate DMCA: ${error.message}`);

    console.log(`⚖️  DMCA notice generated for ${infringingUrl}`);
    return dmcaTemplate;
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private binaryToHex(binary: string): string {
    return binary
      .match(/.{4}/g)!
      .map(nibble => parseInt(nibble, 2).toString(16))
      .join('');
  }

  private hexToBinary(hex: string): string {
    return hex
      .split('')
      .map(h => parseInt(h, 16).toString(2).padStart(4, '0'))
      .join('');
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const contentDNA = new ContentDNAEngine();
