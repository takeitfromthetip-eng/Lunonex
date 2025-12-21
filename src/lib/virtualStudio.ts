/* eslint-disable */
/**
 * 🎬 VIRTUAL STUDIO
 * Real-time background replacement using TensorFlow BodyPix
 * Professional virtual backgrounds for creators
 * SOVEREIGNTY LAYER: Full session tracking + artifact immortalization
 */

// Lazy load TensorFlow - DO NOT import at top level (1MB+ bundle size)
let bodyPix: any = null;
let tf: any = null;

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GratitudeLogger } from './gratitudeLogger';

// ============================================================================
// TYPES
// ============================================================================

export interface VirtualBackground {
  id: string;
  user_id: string;
  name: string;
  thumbnail_url: string;
  full_url: string;
  bg_type: 'image' | 'video' | 'blur' | 'color';
  is_public: boolean;
  use_count: number;
}

export interface StudioSession {
  id: string;
  user_id: string;
  background_id?: string;
  segmentation_quality: 'low' | 'medium' | 'high';
  edge_blur_amount: number;
  started_at: string;
  ended_at?: string;
  frames_processed: number;
}

export interface SegmentationConfig {
  architecture: 'MobileNetV1' | 'ResNet50';
  outputStride: 8 | 16 | 32;
  multiplier: 0.50 | 0.75 | 1.00;
  quantBytes: 1 | 2 | 4;
  internalResolution: 'low' | 'medium' | 'high' | 'full';
  segmentationThreshold: number;
  edgeBlurAmount: number;
}

export interface BackgroundOptions {
  type: 'blur' | 'image' | 'video' | 'color';
  blurAmount?: number;
  imageElement?: HTMLImageElement;
  videoElement?: HTMLVideoElement;
  color?: string;
}

// ============================================================================
// VIRTUAL STUDIO ENGINE
// ============================================================================

export class VirtualStudioEngine {
  private supabase: SupabaseClient;
  private gratitude: GratitudeLogger;
  private model?: any; // bodyPix.BodyPix
  private sessionId?: string;
  private frameCount: number = 0;
  private isProcessing: boolean = false;
  private creatorId: string;

  constructor(supabaseUrl: string, supabaseKey: string, creatorId: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.gratitude = new GratitudeLogger(supabaseUrl, supabaseKey);
    this.creatorId = creatorId;
    this.gratitude.setCreator(creatorId);
  }

  /**
   * Load BodyPix model
   */
  async loadModel(config?: Partial<SegmentationConfig>): Promise<void> {
    console.log('🎬 Loading BodyPix model...');

    // Lazy load TensorFlow modules (only when actually needed)
    if (!bodyPix || !tf) {
      console.log('📦 Dynamically importing TensorFlow.js...');
      const [tfModule, bodyPixModule] = await Promise.all([
        import('@tensorflow/tfjs'),
        import('@tensorflow-models/body-pix')
      ]);
      tf = tfModule;
      bodyPix = bodyPixModule;
    }

    const defaultConfig: SegmentationConfig = {
      architecture: 'MobileNetV1',
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 2,
      internalResolution: 'medium',
      segmentationThreshold: 0.7,
      edgeBlurAmount: 3
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Convert internal resolution to number
    const resolutionMap = {
      'low': 0.25,
      'medium': 0.5,
      'high': 0.75,
      'full': 1.0
    };

    this.model = await bodyPix.load({
      architecture: finalConfig.architecture,
      outputStride: finalConfig.outputStride,
      multiplier: finalConfig.multiplier,
      quantBytes: finalConfig.quantBytes
    });

    console.log('✅ BodyPix model loaded');
  }

  /**
   * Start virtual studio session
   * SOVEREIGNTY: Enhanced session tracking + artifact logging
   */
  async startSession(
    userId: string,
    backgroundId?: string,
    quality: 'low' | 'medium' | 'high' = 'medium',
    edgeBlur: number = 3
  ): Promise<StudioSession> {
    if (!this.model) {
      await this.loadModel();
    }

    const { data, error } = await this.supabase
      .from('studio_sessions')
      .insert({
        user_id: userId,
        background_id: backgroundId,
        segmentation_quality: quality,
        edge_blur_amount: edgeBlur,
        frames_processed: 0
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to start session: ${error.message}`);

    this.sessionId = data.id;
    this.frameCount = 0;

    // 🎖️ IMMORTALIZE session start in Docked Console
    await this.gratitude.log(
      `Virtual Studio: Started session (quality: ${quality}, edge blur: ${edgeBlur}px)`,
      'info',
      { sessionId: data.id, backgroundId, quality, edgeBlur }
    );
    
    await this.gratitude.logArtifact(
      'Virtual Studio',
      'session_started',
      { backgroundId, quality, edgeBlur },
      undefined,
      true,
      0
    );

    console.log(`🎬 Virtual studio session started: ${data.id}`);

    return data;
  }

  /**
   * Process video frame with background replacement
   */
  async processFrame(
    sourceCanvas: HTMLCanvasElement,
    backgroundOptions: BackgroundOptions,
    config?: Partial<SegmentationConfig>
  ): Promise<HTMLCanvasElement> {
    if (!this.model) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    if (this.isProcessing) {
      console.warn('⚠️ Frame processing already in progress');
      return sourceCanvas;
    }

    this.isProcessing = true;

    try {
      const defaultConfig: SegmentationConfig = {
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2,
        internalResolution: 'medium',
        segmentationThreshold: 0.7,
        edgeBlurAmount: 3
      };

      const finalConfig = { ...defaultConfig, ...config };

      // Perform segmentation
      const segmentation = await this.model.segmentPerson(sourceCanvas, {
        internalResolution: finalConfig.internalResolution,
        segmentationThreshold: finalConfig.segmentationThreshold,
        maxDetections: 1,
        scoreThreshold: 0.2
      });

      // Apply background effect
      const resultCanvas = document.createElement('canvas');
      resultCanvas.width = sourceCanvas.width;
      resultCanvas.height = sourceCanvas.height;
      const ctx = resultCanvas.getContext('2d')!;

      // Get source image data
      const sourceCtx = sourceCanvas.getContext('2d')!;
      const sourceData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
      const resultData = ctx.createImageData(sourceCanvas.width, sourceCanvas.height);

      // Apply segmentation mask
      await this.applyBackground(
        sourceData,
        resultData,
        segmentation,
        backgroundOptions,
        finalConfig.edgeBlurAmount
      );

      ctx.putImageData(resultData, 0, 0);

      // Update frame count
      this.frameCount++;
      if (this.frameCount % 60 === 0 && this.sessionId) {
        await this.updateSessionFrameCount(this.frameCount);
      }

      this.isProcessing = false;
      return resultCanvas;

    } catch (error: any) {
      this.isProcessing = false;
      throw new Error(`Frame processing failed: ${error.message}`);
    }
  }

  /**
   * Apply background replacement
   */
  private async applyBackground(
    sourceData: ImageData,
    resultData: ImageData,
    segmentation: any, // bodyPix.SemanticPersonSegmentation
    options: BackgroundOptions,
    edgeBlur: number
  ): Promise<void> {
    const { width, height } = sourceData;
    const mask = segmentation.data;

    // Prepare background data
    let backgroundData: ImageData | null = null;

    if (options.type === 'image' && options.imageElement) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.drawImage(options.imageElement, 0, 0, width, height);
      backgroundData = tempCtx.getImageData(0, 0, width, height);
    } else if (options.type === 'video' && options.videoElement) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.drawImage(options.videoElement, 0, 0, width, height);
      backgroundData = tempCtx.getImageData(0, 0, width, height);
    } else if (options.type === 'color') {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.fillStyle = options.color || '#00ff00';
      tempCtx.fillRect(0, 0, width, height);
      backgroundData = tempCtx.getImageData(0, 0, width, height);
    }

    // Apply blur background if needed
    if (options.type === 'blur') {
      const blurCanvas = document.createElement('canvas');
      blurCanvas.width = width;
      blurCanvas.height = height;
      const blurCtx = blurCanvas.getContext('2d')!;
      
      blurCtx.filter = `blur(${options.blurAmount || 10}px)`;
      blurCtx.drawImage(
        this.imageDataToCanvas(sourceData),
        0, 0, width, height
      );
      
      backgroundData = blurCtx.getImageData(0, 0, width, height);
    }

    // Composite foreground and background
    for (let i = 0; i < mask.length; i++) {
      const pixelIndex = i * 4;
      const isForeground = mask[i] === 1;

      if (isForeground) {
        // Keep foreground (person)
        resultData.data[pixelIndex] = sourceData.data[pixelIndex];
        resultData.data[pixelIndex + 1] = sourceData.data[pixelIndex + 1];
        resultData.data[pixelIndex + 2] = sourceData.data[pixelIndex + 2];
        resultData.data[pixelIndex + 3] = sourceData.data[pixelIndex + 3];
      } else if (backgroundData) {
        // Replace background
        resultData.data[pixelIndex] = backgroundData.data[pixelIndex];
        resultData.data[pixelIndex + 1] = backgroundData.data[pixelIndex + 1];
        resultData.data[pixelIndex + 2] = backgroundData.data[pixelIndex + 2];
        resultData.data[pixelIndex + 3] = backgroundData.data[pixelIndex + 3];
      }
    }

    // Apply edge blur if specified
    if (edgeBlur > 0) {
      this.applyEdgeBlur(resultData, mask, edgeBlur, width);
    }
  }

  /**
   * Apply blur to mask edges for smoother compositing
   */
  private applyEdgeBlur(
    imageData: ImageData,
    mask: Uint8Array,
    blurAmount: number,
    width: number
  ): void {
    // Simple edge detection and blur
    for (let y = blurAmount; y < imageData.height - blurAmount; y++) {
      for (let x = blurAmount; x < width - blurAmount; x++) {
        const index = y * width + x;
        
        // Check if pixel is on edge
        let isEdge = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const neighborIndex = (y + dy) * width + (x + dx);
            if (mask[index] !== mask[neighborIndex]) {
              isEdge = true;
              break;
            }
          }
          if (isEdge) break;
        }

        // Apply blur to edge pixels
        if (isEdge) {
          let r = 0, g = 0, b = 0, count = 0;
          
          for (let dy = -blurAmount; dy <= blurAmount; dy++) {
            for (let dx = -blurAmount; dx <= blurAmount; dx++) {
              const sampleY = y + dy;
              const sampleX = x + dx;
              const sampleIndex = (sampleY * width + sampleX) * 4;
              
              r += imageData.data[sampleIndex];
              g += imageData.data[sampleIndex + 1];
              b += imageData.data[sampleIndex + 2];
              count++;
            }
          }

          const pixelIndex = index * 4;
          imageData.data[pixelIndex] = r / count;
          imageData.data[pixelIndex + 1] = g / count;
          imageData.data[pixelIndex + 2] = b / count;
        }
      }
    }
  }

  /**
   * Convert ImageData to canvas
   */
  private imageDataToCanvas(imageData: ImageData): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  /**
   * Upload custom background
   */
  async uploadBackground(
    userId: string,
    file: File,
    name: string,
    isPublic: boolean = false
  ): Promise<VirtualBackground> {
    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from('virtual-backgrounds')
      .upload(fileName, file);

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from('virtual-backgrounds')
      .getPublicUrl(fileName);

    // Create thumbnail
    const thumbnailUrl = await this.createThumbnail(file);

    // Save to database
    const bgType = file.type.startsWith('video/') ? 'video' : 'image';

    const { data, error } = await this.supabase
      .from('virtual_backgrounds')
      .insert({
        user_id: userId,
        name,
        thumbnail_url: thumbnailUrl,
        full_url: urlData.publicUrl,
        bg_type: bgType,
        is_public: isPublic
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to save background: ${error.message}`);

    console.log(`🖼️ Background uploaded: ${name}`);

    return data;
  }

  /**
   * Create thumbnail from file
   */
  private async createThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 200;
          const scale = Math.min(maxSize / img.width, maxSize / img.height);
          
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target?.result as string;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get user's backgrounds
   */
  async getBackgrounds(userId: string, includePublic: boolean = true): Promise<VirtualBackground[]> {
    let query = this.supabase
      .from('virtual_backgrounds')
      .select('*')
      .or(`user_id.eq.${userId}${includePublic ? ',is_public.eq.true' : ''}`)
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get backgrounds: ${error.message}`);

    return data || [];
  }

  /**
   * Update session frame count
   */
  private async updateSessionFrameCount(frameCount: number): Promise<void> {
    if (!this.sessionId) return;

    await this.supabase
      .from('studio_sessions')
      .update({ frames_processed: frameCount })
      .eq('id', this.sessionId);
  }

  /**
   * End session
   * SOVEREIGNTY: Immortalize session in Docked Console
   */
  async endSession(): Promise<void> {
    if (!this.sessionId) return;

    const sessionStartTime = await this.getSessionStartTime(this.sessionId);
    const durationSeconds = sessionStartTime 
      ? Math.floor((Date.now() - new Date(sessionStartTime).getTime()) / 1000)
      : 0;

    await this.supabase
      .from('studio_sessions')
      .update({
        ended_at: new Date().toISOString(),
        frames_processed: this.frameCount
      })
      .eq('id', this.sessionId);

    // 🎖️ IMMORTALIZE session completion in Docked Console
    await this.gratitude.log(
      `Virtual Studio: Completed session - ${this.frameCount} frames processed over ${durationSeconds}s`,
      'info',
      {
        sessionId: this.sessionId,
        framesProcessed: this.frameCount,
        durationSeconds,
        avgFps: durationSeconds > 0 ? (this.frameCount / durationSeconds).toFixed(1) : '0'
      }
    );
    
    await this.gratitude.logArtifact(
      'Virtual Studio',
      'session_completed',
      { framesProcessed: this.frameCount, durationSeconds },
      undefined,
      true,
      durationSeconds * 1000
    );

    console.log(`🎬 Session ended. Processed ${this.frameCount} frames in ${durationSeconds}s`);

    this.sessionId = undefined;
    this.frameCount = 0;
  }

  /**
   * Get session start time (helper for duration calculation)
   */
  private async getSessionStartTime(sessionId: string): Promise<string | null> {
    const { data } = await this.supabase
      .from('studio_sessions')
      .select('started_at')
      .eq('id', sessionId)
      .single();

    return data?.started_at || null;
  }

  /**
   * Dispose model and free memory
   */
  dispose(): void {
    if (this.model) {
      // BodyPix model cleanup is handled automatically by TensorFlow.js
      this.model = undefined;
    }
    console.log('🗑️ Virtual Studio model disposed');
  }
}

// ============================================================================
// SINGLETON EXPORT - Export class, not instance (requires constructor args)
// ============================================================================

export default VirtualStudioEngine;
