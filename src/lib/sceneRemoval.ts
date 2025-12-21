/* eslint-disable */
/**
 * 🎯 SCENE REMOVAL (Context-Aware Object Removal)
 * Remove unwanted objects from images/video using selection masks + AI inpainting
 * SOVEREIGNTY LAYER: Full lineage tracking (before/after) for governance
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GratitudeLogger } from './gratitudeLogger';

// ============================================================================
// TYPES
// ============================================================================

export interface RemovalMask {
  width: number;
  height: number;
  maskData: Uint8Array; // 1 = remove, 0 = keep
}

export interface RemovalEvent {
  id: string;
  creator_id: string;
  project_id?: string;
  input_asset_url: string;
  mask_url: string;
  output_asset_url?: string;
  removal_method: 'neighbor_fill' | 'patch_match' | 'ai_model' | 'bodypix_auto';
  status: 'processing' | 'completed' | 'failed';
  processing_time_ms?: number;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  metadata?: Record<string, any>;
}

export interface InpaintConfig {
  method: 'neighbor_fill' | 'patch_match' | 'ai_model';
  neighborRadius?: number; // For neighbor_fill
  patchSize?: number; // For patch_match
  modelEndpoint?: string; // For AI model
}

// ============================================================================
// SCENE REMOVAL ENGINE
// ============================================================================

export class SceneRemovalEngine {
  private supabase: SupabaseClient;
  private gratitude: GratitudeLogger;
  private creatorId: string;

  constructor(supabaseUrl: string, supabaseKey: string, creatorId: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.gratitude = new GratitudeLogger(supabaseUrl, supabaseKey);
    this.creatorId = creatorId;
    this.gratitude.setCreator(creatorId);
  }

  /**
   * 🔮 SOVEREIGNTY: Start removal session with full logging
   */
  async startRemoval(
    inputAssetUrl: string,
    mask: RemovalMask,
    projectId?: string,
    method: InpaintConfig['method'] = 'neighbor_fill'
  ): Promise<string> {
    const removalId = crypto.randomUUID();

    // Upload mask to Supabase Storage
    const maskBlob = this.maskToBlob(mask);
    const maskPath = `masks/${this.creatorId}/${removalId}.png`;

    const { error: uploadError } = await this.supabase.storage
      .from('assets')
      .upload(maskPath, maskBlob, { contentType: 'image/png' });

    if (uploadError) {
      throw new Error(`Failed to upload mask: ${uploadError.message}`);
    }

    const { data: maskUrlData } = this.supabase.storage
      .from('assets')
      .getPublicUrl(maskPath);

    // 🔮 Create removal event in database
    const { error: insertError } = await this.supabase
      .from('removal_events')
      .insert({
        id: removalId,
        creator_id: this.creatorId,
        project_id: projectId,
        input_asset_url: inputAssetUrl,
        mask_url: maskUrlData.publicUrl,
        removal_method: method,
        status: 'processing',
        started_at: new Date().toISOString()
      });

    if (insertError) {
      throw new Error(`Failed to create removal event: ${insertError.message}`);
    }

    // 🎖️ IMMORTALIZE in Docked Console
    await this.gratitude.log(
      `Scene Removal: Started with ${method} method`,
      'info',
      { removalId, inputAssetUrl, maskUrl: maskUrlData.publicUrl, method }
    );
    
    await this.gratitude.logArtifact(
      'Scene Removal',
      'removal_started',
      { method, inputAssetUrl },
      undefined,
      true,
      0
    );

    console.log(`🎯 Scene removal started: ${removalId}`);

    return removalId;
  }

  /**
   * Perform scene removal with specified method
   */
  async removeObject(
    removalId: string,
    inputImage: HTMLImageElement | HTMLCanvasElement,
    mask: RemovalMask,
    config: InpaintConfig = { method: 'neighbor_fill', neighborRadius: 5 }
  ): Promise<Blob> {
    const startTime = Date.now();

    try {
      let resultCanvas: HTMLCanvasElement;

      switch (config.method) {
        case 'neighbor_fill':
          resultCanvas = await this.neighborFillInpaint(inputImage, mask, config.neighborRadius || 5);
          break;
        
        case 'patch_match':
          resultCanvas = await this.patchMatchInpaint(inputImage, mask, config.patchSize || 7);
          break;
        
        case 'ai_model':
          if (!config.modelEndpoint) {
            throw new Error('AI model endpoint required for ai_model method');
          }
          resultCanvas = await this.aiModelInpaint(inputImage, mask, config.modelEndpoint);
          break;
        
        default:
          throw new Error(`Unknown inpainting method: ${config.method}`);
      }

      // Convert canvas to blob
      const resultBlob = await this.canvasToBlob(resultCanvas);

      // Upload result to Supabase Storage
      const outputPath = `removals/${this.creatorId}/${removalId}_output.png`;
      
      const { error: uploadError } = await this.supabase.storage
        .from('assets')
        .upload(outputPath, resultBlob, { contentType: 'image/png' });

      if (uploadError) {
        throw new Error(`Failed to upload result: ${uploadError.message}`);
      }

      const { data: outputUrlData } = this.supabase.storage
        .from('assets')
        .getPublicUrl(outputPath);

      const processingTime = Date.now() - startTime;

      // 🔮 Update removal event
      await this.supabase
        .from('removal_events')
        .update({
          output_asset_url: outputUrlData.publicUrl,
          status: 'completed',
          processing_time_ms: processingTime,
          completed_at: new Date().toISOString()
        })
        .eq('id', removalId);

      // 🎖️ IMMORTALIZE completion
      await this.gratitude.log(
        `Scene Removal: Completed in ${(processingTime / 1000).toFixed(1)}s using ${config.method}`,
        'info',
        { removalId, outputUrl: outputUrlData.publicUrl, processingTimeMs: processingTime, method: config.method }
      );
      
      await this.gratitude.logArtifact(
        'Scene Removal',
        'removal_completed',
        { method: config.method },
        outputUrlData.publicUrl,
        true,
        processingTime
      );

      console.log(`✅ Scene removal complete: ${removalId}`);

      return resultBlob;

    } catch (error) {
      // 🔮 Mark as failed
      await this.supabase
        .from('removal_events')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', removalId);

      throw error;
    }
  }

  /**
   * BASELINE: Neighbor fill inpainting (fast, deterministic)
   * Fills masked regions with average of neighboring pixels
   */
  private async neighborFillInpaint(
    input: HTMLImageElement | HTMLCanvasElement,
    mask: RemovalMask,
    radius: number
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    canvas.width = mask.width;
    canvas.height = mask.height;
    const ctx = canvas.getContext('2d')!;

    // Draw input image
    ctx.drawImage(input, 0, 0, mask.width, mask.height);

    const imageData = ctx.getImageData(0, 0, mask.width, mask.height);
    const data = imageData.data;

    // Multi-pass neighbor filling
    const passes = 3;
    for (let pass = 0; pass < passes; pass++) {
      for (let y = 0; y < mask.height; y++) {
        for (let x = 0; x < mask.width; x++) {
          const maskIdx = y * mask.width + x;
          if (mask.maskData[maskIdx] === 1) {
            // Pixel needs filling - sample neighbors
            let sumR = 0, sumG = 0, sumB = 0, count = 0;

            for (let dy = -radius; dy <= radius; dy++) {
              for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                const ny = y + dy;

                if (nx >= 0 && nx < mask.width && ny >= 0 && ny < mask.height) {
                  const nMaskIdx = ny * mask.width + nx;
                  if (mask.maskData[nMaskIdx] === 0) {
                    // Valid neighbor pixel
                    const pixelIdx = (ny * mask.width + nx) * 4;
                    sumR += data[pixelIdx];
                    sumG += data[pixelIdx + 1];
                    sumB += data[pixelIdx + 2];
                    count++;
                  }
                }
              }
            }

            if (count > 0) {
              const pixelIdx = (y * mask.width + x) * 4;
              data[pixelIdx] = Math.round(sumR / count);
              data[pixelIdx + 1] = Math.round(sumG / count);
              data[pixelIdx + 2] = Math.round(sumB / count);
              data[pixelIdx + 3] = 255; // Full opacity
            }
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  /**
   * ADVANCED: Patch match inpainting (better quality)
   * Finds similar patches and blends them into masked region
   */
  private async patchMatchInpaint(
    input: HTMLImageElement | HTMLCanvasElement,
    mask: RemovalMask,
    patchSize: number
  ): Promise<HTMLCanvasElement> {
    // Simplified patch match - full implementation would use PatchMatch algorithm
    // For now, use neighbor fill with larger radius
    return this.neighborFillInpaint(input, mask, patchSize);
  }

  /**
   * AI MODEL: External inpainting service
   */
  private async aiModelInpaint(
    input: HTMLImageElement | HTMLCanvasElement,
    mask: RemovalMask,
    endpoint: string
  ): Promise<HTMLCanvasElement> {
    const inputBlob = await this.canvasToBlob(this.imageToCanvas(input));
    const maskBlob = this.maskToBlob(mask);

    const formData = new FormData();
    formData.append('image', inputBlob);
    formData.append('mask', maskBlob);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Inpainting API error: ${response.statusText}`);
    }

    const resultBlob = await response.blob();
    return this.blobToCanvas(resultBlob);
  }

  /**
   * Auto-mask using BodyPix (remove person or background)
   */
  async autoMaskWithBodyPix(
    image: HTMLImageElement | HTMLCanvasElement,
    removeTarget: 'person' | 'background'
  ): Promise<RemovalMask> {
    // This would integrate with BodyPix from Virtual Studio
    // For now, return a placeholder mask
    const canvas = this.imageToCanvas(image);
    const width = canvas.width;
    const height = canvas.height;

    const maskData = new Uint8Array(width * height);
    // Placeholder: mark center region for removal
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const centerDist = Math.sqrt(Math.pow(x - width / 2, 2) + Math.pow(y - height / 2, 2));
        maskData[idx] = centerDist < Math.min(width, height) / 4 ? 1 : 0;
      }
    }

    return { width, height, maskData };
  }

  /**
   * Process video frame by frame
   */
  async removeFromVideo(
    removalId: string,
    videoFile: File,
    mask: RemovalMask,
    config: InpaintConfig
  ): Promise<Blob> {
    // This would use FFmpeg.wasm to extract frames, process each, then re-encode
    // Placeholder implementation
    throw new Error('Video removal not yet implemented - use frame-by-frame processing');
  }

  /**
   * Get removal history for creator
   */
  async getRemovalHistory(limit: number = 20): Promise<RemovalEvent[]> {
    const { data, error } = await this.supabase
      .from('removal_events')
      .select('*')
      .eq('creator_id', this.creatorId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch removal history: ${error.message}`);
    }

    return data || [];
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private imageToCanvas(image: HTMLImageElement | HTMLCanvasElement): HTMLCanvasElement {
    if (image instanceof HTMLCanvasElement) {
      return image;
    }

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, 0, 0);
    return canvas;
  }

  private async canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to convert canvas to blob'));
      }, 'image/png');
    });
  }

  private async blobToCanvas(blob: Blob): Promise<HTMLCanvasElement> {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  private maskToBlob(mask: RemovalMask): Blob {
    const canvas = document.createElement('canvas');
    canvas.width = mask.width;
    canvas.height = mask.height;
    const ctx = canvas.getContext('2d')!;

    const imageData = ctx.createImageData(mask.width, mask.height);
    for (let i = 0; i < mask.maskData.length; i++) {
      const value = mask.maskData[i] * 255;
      imageData.data[i * 4] = value;
      imageData.data[i * 4 + 1] = value;
      imageData.data[i * 4 + 2] = value;
      imageData.data[i * 4 + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    }) as any;
  }
}

export default SceneRemovalEngine;
