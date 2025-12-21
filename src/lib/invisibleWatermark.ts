/**
 * 🔒 INVISIBLE WATERMARK
 * LSB (Least Significant Bit) steganography for embedding creator signatures
 * Works in browser with Canvas API
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';

// ============================================================================
// TYPES
// ============================================================================

export interface WatermarkOptions {
  strength?: number; // 1-8 bits per channel (default 1)
  channels?: ('r' | 'g' | 'b' | 'a')[]; // Which color channels to use
  pattern?: 'sequential' | 'random' | 'diagonal';
}

export interface WatermarkSignature {
  id: string;
  artifact_id: string;
  creator_id: string;
  watermark_data: string;
  embed_method: string;
  pixel_pattern: string;
  strength: number;
  created_at: string;
  verified: boolean;
}

export interface WatermarkDetectionResult {
  detected: boolean;
  creator_id?: string;
  confidence: number;
  signature?: string;
}

// ============================================================================
// INVISIBLE WATERMARK ENGINE
// ============================================================================

export class InvisibleWatermarkEngine {
  private supabase: SupabaseClient;
  private encryptionKey: string;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    this.supabase = createClient(
      supabaseUrl || process.env.VITE_SUPABASE_URL || '',
      supabaseKey || process.env.VITE_SUPABASE_ANON_KEY || ''
    );
    this.encryptionKey = process.env.VITE_WATERMARK_KEY || 'default-key-change-me';
  }

  /**
   * Embed watermark into image using LSB steganography
   */
  async embedWatermark(
    imageFile: File,
    creatorId: string,
    artifactId: string,
    options: WatermarkOptions = {}
  ): Promise<{ watermarkedBlob: Blob; signature: WatermarkSignature }> {
    const {
      strength = 1,
      channels = ['r', 'g', 'b'],
      pattern = 'diagonal'
    } = options;

    // Load image to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = await this.loadImage(imageFile);
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Generate signature (creator ID + timestamp + random)
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const signature = `${creatorId}:${timestamp}:${random}`;
    
    // Encrypt signature
    const encryptedSig = CryptoJS.AES.encrypt(signature, this.encryptionKey).toString();
    
    // Convert to binary
    const binaryData = this.stringToBinary(encryptedSig);

    // Embed binary data into pixels
    const pixelIndices = this.generatePixelPattern(
      canvas.width,
      canvas.height,
      binaryData.length,
      pattern
    );

    let bitIndex = 0;
    for (const pixelIdx of pixelIndices) {
      if (bitIndex >= binaryData.length) break;

      const pixelStart = pixelIdx * 4;

      for (const channel of channels) {
        if (bitIndex >= binaryData.length) break;

        const channelOffset = this.getChannelOffset(channel);
        const pixelDataIdx = pixelStart + channelOffset;

        // Clear LSB and set new bit
        pixels[pixelDataIdx] = (pixels[pixelDataIdx] & ~((1 << strength) - 1)) | 
                                parseInt(binaryData.substring(bitIndex, bitIndex + strength), 2);
        
        bitIndex += strength;
      }
    }

    // Put modified data back
    ctx.putImageData(imageData, 0, 0);

    // Convert to blob
    const watermarkedBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), imageFile.type, 0.95);
    });

    // Save signature to database
    const { data: dbSignature, error } = await this.supabase
      .from('watermark_signatures')
      .insert({
        artifact_id: artifactId,
        creator_id: creatorId,
        watermark_data: encryptedSig,
        embed_method: 'LSB',
        pixel_pattern: pattern,
        strength: strength
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to save watermark signature: ${error.message}`);

    console.log(`🔒 Watermark embedded: ${signature.substring(0, 20)}...`);

    return {
      watermarkedBlob,
      signature: dbSignature
    };
  }

  /**
   * Detect and verify watermark in image
   */
  async detectWatermark(
    imageFile: File,
    options: WatermarkOptions = {}
  ): Promise<WatermarkDetectionResult> {
    const {
      strength = 1,
      channels = ['r', 'g', 'b'],
      pattern = 'diagonal'
    } = options;

    // Load image to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = await this.loadImage(imageFile);
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Estimate data length (try common sizes)
    const estimatedLengths = [256, 512, 1024, 2048];
    
    for (const dataLength of estimatedLengths) {
      const pixelIndices = this.generatePixelPattern(
        canvas.width,
        canvas.height,
        dataLength,
        pattern
      );

      let binaryData = '';
      let bitIndex = 0;

      for (const pixelIdx of pixelIndices) {
        if (bitIndex >= dataLength) break;

        const pixelStart = pixelIdx * 4;

        for (const channel of channels) {
          if (bitIndex >= dataLength) break;

          const channelOffset = this.getChannelOffset(channel);
          const pixelDataIdx = pixelStart + channelOffset;

          // Extract LSB
          const bits = (pixels[pixelDataIdx] & ((1 << strength) - 1)).toString(2).padStart(strength, '0');
          binaryData += bits;
          bitIndex += strength;
        }
      }

      // Try to decrypt
      try {
        const encryptedSig = this.binaryToString(binaryData);
        const decrypted = CryptoJS.AES.decrypt(encryptedSig, this.encryptionKey).toString(CryptoJS.enc.Utf8);

        if (decrypted && decrypted.includes(':')) {
          const [creatorId] = decrypted.split(':');
          
          console.log(`🔍 Watermark detected: ${decrypted.substring(0, 20)}...`);

          return {
            detected: true,
            creator_id: creatorId,
            confidence: 0.95,
            signature: decrypted
          };
        }
      } catch (e) {
        // Not valid, continue to next length
        continue;
      }
    }

    return {
      detected: false,
      confidence: 0
    };
  }

  /**
   * Verify watermark belongs to creator
   */
  async verifyWatermark(
    imageFile: File,
    expectedCreatorId: string,
    options: WatermarkOptions = {}
  ): Promise<boolean> {
    const result = await this.detectWatermark(imageFile, options);
    
    if (!result.detected) return false;

    const isValid = result.creator_id === expectedCreatorId;

    if (isValid) {
      // Increment verification count
      await this.supabase
        .from('watermark_signatures')
        .update({ 
          verified: true,
          verification_count: this.supabase.from('watermark_signatures').select('verification_count').single().then((r: any) => (r.data?.verification_count || 0) + 1)
        })
        .eq('creator_id', expectedCreatorId);
    }

    return isValid;
  }

  /**
   * Get or create watermark key for creator
   */
  async getCreatorKey(creatorId: string): Promise<{ publicKey: string; privateKey: string }> {
    // Check if key exists
    const { data: existing } = await this.supabase
      .from('watermark_keys')
      .select('*')
      .eq('creator_id', creatorId)
      .single();

    if (existing) {
      return {
        publicKey: existing.public_key,
        privateKey: existing.private_key
      };
    }

    // Generate new keypair
    const keypair = this.generateKeypair(creatorId);

    // Save to database
    await this.supabase
      .from('watermark_keys')
      .insert({
        creator_id: creatorId,
        public_key: keypair.publicKey,
        private_key: keypair.privateKey,
        algorithm: 'LSB'
      });

    return keypair;
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

  private stringToBinary(str: string): string {
    return str.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('');
  }

  private binaryToString(binary: string): string {
    const bytes = binary.match(/.{8}/g) || [];
    return bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
  }

  private getChannelOffset(channel: 'r' | 'g' | 'b' | 'a'): number {
    return { r: 0, g: 1, b: 2, a: 3 }[channel];
  }

  private generatePixelPattern(
    width: number,
    height: number,
    dataLength: number,
    pattern: 'sequential' | 'random' | 'diagonal'
  ): number[] {
    const totalPixels = width * height;
    const indices: number[] = [];

    if (pattern === 'sequential') {
      for (let i = 0; i < Math.min(dataLength, totalPixels); i++) {
        indices.push(i);
      }
    } else if (pattern === 'diagonal') {
      // Diagonal pattern (less obvious)
      let x = 0, y = 0;
      while (indices.length < dataLength && y < height) {
        indices.push(y * width + x);
        x++;
        y++;
        if (x >= width) {
          x = 0;
          y++;
        }
      }
    } else {
      // Random pattern (most secure, but needs seed)
      const seed = 12345; // Could be derived from creator ID
      let rng = seed;
      const used = new Set<number>();
      
      while (indices.length < dataLength) {
        rng = (rng * 1103515245 + 12345) & 0x7fffffff;
        const idx = rng % totalPixels;
        if (!used.has(idx)) {
          indices.push(idx);
          used.add(idx);
        }
      }
    }

    return indices;
  }

  private generateKeypair(creatorId: string): { publicKey: string; privateKey: string } {
    // Simple keypair generation (in production, use proper crypto)
    const privateKey = CryptoJS.SHA256(creatorId + Date.now()).toString();
    const publicKey = CryptoJS.SHA256(privateKey).toString().substring(0, 32);
    
    return { publicKey, privateKey };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const invisibleWatermark = new InvisibleWatermarkEngine();
