/* eslint-disable */
/**
 * 🛡️ DEEPFAKE PROTECTION
 * Face signature system with misuse detection
 * Embeds cryptographic face embeddings and detects unauthorized reuse
 */

// Lazy load TensorFlow - DO NOT import at top level (1MB+ bundle size)
let faceLandmarksDetection: any = null;
let tf: any = null;

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';

// ============================================================================
// TYPES
// ============================================================================

export interface FaceSignature {
  id: string;
  asset_id: string;
  creator_id: string;
  embedding: number[];
  hmac_signature: string;
  detected_at: string;
  metadata?: {
    confidence: number;
    landmarks_count: number;
    face_bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
}

export interface MisuseDetection {
  id: string;
  original_signature_id: string;
  suspected_asset_id: string;
  uploader_id: string;
  similarity_score: number;
  status: 'pending' | 'confirmed' | 'false_positive';
  detected_at: string;
}

export interface FaceEmbedding {
  vector: number[];
  confidence: number;
  landmarks: number[][];
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// ============================================================================
// DEEPFAKE PROTECTION ENGINE
// ============================================================================

export class DeepfakeProtectionEngine {
  private supabase: SupabaseClient;
  private model?: any; // FaceLandmarksDetector
  private secretKey: string;

  constructor(supabaseUrl?: string, supabaseKey?: string, secretKey?: string) {
    this.supabase = createClient(
      supabaseUrl || process.env.VITE_SUPABASE_URL || '',
      supabaseKey || process.env.VITE_SUPABASE_ANON_KEY || ''
    );
    this.secretKey = secretKey || process.env.VITE_DEEPFAKE_SECRET || 'fortheweebs-default-secret';
  }

  /**
   * Load TensorFlow face landmarks detection model
   */
  async loadModel(): Promise<void> {
    if (this.model) return;

    console.log('🛡️ Loading face landmarks detection model...');

    // Lazy load TensorFlow modules (only when actually needed)
    if (!faceLandmarksDetection || !tf) {
      console.log('📦 Dynamically importing TensorFlow.js...');
      const [tfModule, faceModule] = await Promise.all([
        import('@tensorflow/tfjs'),
        import('@tensorflow-models/face-landmarks-detection')
      ]);
      tf = tfModule;
      faceLandmarksDetection = faceModule;
    }

    // Use MediaPipe FaceMesh for high-quality landmarks
    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    const detectorConfig = {
      runtime: 'mediapipe',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
      maxFaces: 1,
      refineLandmarks: true
    };

    this.model = await faceLandmarksDetection.createDetector(model, detectorConfig);

    console.log('✅ Face landmarks model loaded');
  }

  /**
   * Compute face embedding from image/video element
   */
  async computeEmbedding(
    source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ): Promise<FaceEmbedding | null> {
    if (!this.model) {
      await this.loadModel();
    }

    console.log('🔍 Detecting face landmarks...');

    // Detect faces
    const faces = await this.model!.estimateFaces(source, {
      flipHorizontal: false
    });

    if (faces.length === 0) {
      console.warn('⚠️ No faces detected');
      return null;
    }

    const face = faces[0];

    // Extract landmarks
    const landmarks = face.keypoints.map(kp => [kp.x, kp.y]);

    // Compute bounding box
    const xs = landmarks.map(l => l[0]);
    const ys = landmarks.map(l => l[1]);
    const bounds = {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };

    // Create embedding vector from landmarks
    // Normalize landmarks to be invariant to position/scale
    const centerX = (bounds.x + bounds.width / 2);
    const centerY = (bounds.y + bounds.height / 2);
    const scale = Math.max(bounds.width, bounds.height);

    const normalizedLandmarks = landmarks.map(([x, y]) => [
      (x - centerX) / scale,
      (y - centerY) / scale
    ]);

    // Flatten to 1D vector
    const embedding = normalizedLandmarks.flat();

    // Calculate confidence (based on landmark detection scores if available)
    const confidence = face.box ? 0.95 : 0.85;

    console.log(`✅ Face embedding computed (${embedding.length} dimensions)`);

    return {
      vector: embedding,
      confidence,
      landmarks,
      bounds
    };
  }

  /**
   * Sign embedding with HMAC
   */
  signEmbedding(embedding: number[], creatorId: string, assetId: string): string {
    const message = `${creatorId}:${assetId}:${embedding.join(',')}`;
    const signature = CryptoJS.HmacSHA256(message, this.secretKey).toString();
    
    console.log('🔐 Embedding signed with HMAC');
    
    return signature;
  }

  /**
   * Verify HMAC signature
   */
  verifySignature(
    embedding: number[],
    creatorId: string,
    assetId: string,
    signature: string
  ): boolean {
    const expectedSignature = this.signEmbedding(embedding, creatorId, assetId);
    return expectedSignature === signature;
  }

  /**
   * Store face signature in ledger
   */
  async storeFaceSignature(
    assetId: string,
    creatorId: string,
    embedding: FaceEmbedding
  ): Promise<FaceSignature> {
    const signature = this.signEmbedding(embedding.vector, creatorId, assetId);

    const { data, error } = await this.supabase
      .from('face_signatures')
      .insert({
        asset_id: assetId,
        creator_id: creatorId,
        embedding: embedding.vector,
        hmac_signature: signature,
        metadata: {
          confidence: embedding.confidence,
          landmarks_count: embedding.landmarks.length,
          face_bounds: embedding.bounds
        }
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to store signature: ${error.message}`);

    console.log(`🛡️ Face signature stored for asset ${assetId}`);

    return data;
  }

  /**
   * Compare embeddings using cosine similarity
   */
  private calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have same dimensions');
    }

    // Cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (norm1 * norm2);
  }

  /**
   * Detect misuse by comparing against ledger
   */
  async detectMisuse(
    newAssetId: string,
    uploaderId: string,
    embedding: FaceEmbedding,
    similarityThreshold: number = 0.85
  ): Promise<MisuseDetection[]> {
    console.log('🔍 Scanning ledger for similar faces...');

    // Fetch all existing face signatures (exclude uploader's own signatures)
    const { data: signatures, error } = await this.supabase
      .from('face_signatures')
      .select('*')
      .neq('creator_id', uploaderId);

    if (error) throw new Error(`Failed to query signatures: ${error.message}`);

    const matches: MisuseDetection[] = [];

    // Compare against each signature
    for (const signature of signatures || []) {
      const similarity = this.calculateSimilarity(
        embedding.vector,
        signature.embedding
      );

      if (similarity >= similarityThreshold) {
        console.warn(`⚠️ Potential misuse detected! Similarity: ${(similarity * 100).toFixed(1)}%`);

        // Store misuse detection
        const { data: detection, error: detectionError } = await this.supabase
          .from('misuse_detections')
          .insert({
            original_signature_id: signature.id,
            suspected_asset_id: newAssetId,
            uploader_id: uploaderId,
            similarity_score: similarity,
            status: 'pending'
          })
          .select()
          .single();

        if (detectionError) {
          console.error('Failed to store detection:', detectionError);
          continue;
        }

        matches.push(detection);
      }
    }

    if (matches.length > 0) {
      console.log(`🚨 Found ${matches.length} potential misuse case(s)`);
    } else {
      console.log('✅ No misuse detected');
    }

    return matches;
  }

  /**
   * Get all misuse detections for a creator
   */
  async getCreatorMisuseDetections(
    creatorId: string,
    status?: 'pending' | 'confirmed' | 'false_positive'
  ): Promise<MisuseDetection[]> {
    let query = this.supabase
      .from('misuse_detections')
      .select(`
        *,
        face_signatures!original_signature_id (
          asset_id,
          creator_id
        )
      `)
      .eq('face_signatures.creator_id', creatorId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('detected_at', { ascending: false });

    if (error) throw new Error(`Failed to get detections: ${error.message}`);

    return data || [];
  }

  /**
   * Update misuse detection status
   */
  async updateMisuseStatus(
    detectionId: string,
    status: 'confirmed' | 'false_positive'
  ): Promise<void> {
    const { error } = await this.supabase
      .from('misuse_detections')
      .update({ status })
      .eq('id', detectionId);

    if (error) throw new Error(`Failed to update status: ${error.message}`);

    console.log(`✅ Misuse detection ${detectionId} marked as ${status}`);
  }

  /**
   * Full protection flow: Embed signature on export
   */
  async protectAsset(
    assetId: string,
    creatorId: string,
    source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ): Promise<FaceSignature | null> {
    const embedding = await this.computeEmbedding(source);
    
    if (!embedding) {
      console.warn('⚠️ No face detected - cannot protect asset');
      return null;
    }

    const signature = await this.storeFaceSignature(assetId, creatorId, embedding);

    console.log(`🛡️ Asset ${assetId} is now protected`);

    return signature;
  }

  /**
   * Full verification flow: Check for misuse on upload
   */
  async verifyAsset(
    newAssetId: string,
    uploaderId: string,
    source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ): Promise<{
    embedding: FaceEmbedding | null;
    misuseDetections: MisuseDetection[];
    isSafe: boolean;
  }> {
    const embedding = await this.computeEmbedding(source);

    if (!embedding) {
      return {
        embedding: null,
        misuseDetections: [],
        isSafe: true // No face = no misuse risk
      };
    }

    const misuseDetections = await this.detectMisuse(
      newAssetId,
      uploaderId,
      embedding
    );

    const isSafe = misuseDetections.length === 0;

    if (!isSafe) {
      console.warn(`🚨 Asset ${newAssetId} flagged for potential misuse`);
    } else {
      console.log(`✅ Asset ${newAssetId} verified safe`);
    }

    return {
      embedding,
      misuseDetections,
      isSafe
    };
  }

  /**
   * Dispose model and free memory
   */
  dispose(): void {
    if (this.model) {
      this.model = undefined;
    }
    console.log('🗑️ Deepfake protection model disposed');
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const deepfakeProtection = new DeepfakeProtectionEngine();
