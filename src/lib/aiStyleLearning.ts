/**
 * 🧬 AI STYLE LEARNING (Style DNA)
 * Learns creator's editing patterns and suggests personalized edits
 * Tracks metrics: contrast, saturation, transitions, audio FX, color grading
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface EditMetrics {
  contrast_delta: number;
  saturation_delta: number;
  brightness_delta: number;
  sharpness_delta: number;
  transition_type?: string;
  audio_fx?: string[];
  color_grade?: string;
  filter_applied?: string;
  duration_seconds: number;
}

export interface StyleDNARecord {
  id: string;
  creator_id: string;
  total_edits: number;
  avg_contrast: number;
  avg_saturation: number;
  avg_brightness: number;
  avg_sharpness: number;
  favorite_transitions: string[];
  favorite_audio_fx: string[];
  favorite_color_grades: string[];
  editing_pace: 'slow' | 'moderate' | 'fast';
  style_signature: string;
  last_updated: string;
}

export interface StyleSuggestion {
  type: 'contrast' | 'saturation' | 'brightness' | 'transition' | 'audio' | 'color_grade' | 'filter';
  action: string;
  confidence: number;
  reason: string;
  value?: number | string;
}

export interface EditSession {
  edits: EditMetrics[];
  startTime: number;
  endTime?: number;
}

// ============================================================================
// AI STYLE LEARNING ENGINE
// ============================================================================

export class AIStyleLearningEngine {
  private supabase: SupabaseClient;
  private currentSession?: EditSession;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    this.supabase = createClient(
      supabaseUrl || process.env.VITE_SUPABASE_URL || '',
      supabaseKey || process.env.VITE_SUPABASE_ANON_KEY || ''
    );
  }

  /**
   * Start tracking an editing session
   */
  startSession(): void {
    this.currentSession = {
      edits: [],
      startTime: Date.now()
    };
    console.log('🧬 Style DNA tracking session started');
  }

  /**
   * Record an edit metric
   */
  recordEdit(metrics: EditMetrics): void {
    if (!this.currentSession) {
      console.warn('⚠️ No active session. Call startSession() first.');
      return;
    }

    this.currentSession.edits.push(metrics);
    console.log(`📊 Edit recorded: ${metrics.transition_type || 'adjustment'}`);
  }

  /**
   * End session and update Style DNA
   */
  async endSession(creatorId: string): Promise<StyleDNARecord> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    this.currentSession.endTime = Date.now();

    // Calculate session metrics
    const sessionMetrics = this.calculateSessionMetrics(this.currentSession.edits);

    // Update DNA record
    const dnaRecord = await this.updateStyleDNA(creatorId, sessionMetrics);

    console.log('🧬 Style DNA updated');

    // Clear session
    this.currentSession = undefined;

    return dnaRecord;
  }

  /**
   * Calculate aggregated metrics from edits
   */
  private calculateSessionMetrics(edits: EditMetrics[]): {
    avgContrast: number;
    avgSaturation: number;
    avgBrightness: number;
    avgSharpness: number;
    transitions: string[];
    audioFX: string[];
    colorGrades: string[];
    pace: 'slow' | 'moderate' | 'fast';
  } {
    if (edits.length === 0) {
      return {
        avgContrast: 0,
        avgSaturation: 0,
        avgBrightness: 0,
        avgSharpness: 0,
        transitions: [],
        audioFX: [],
        colorGrades: [],
        pace: 'moderate'
      };
    }

    // Calculate averages
    const avgContrast = edits.reduce((sum, e) => sum + e.contrast_delta, 0) / edits.length;
    const avgSaturation = edits.reduce((sum, e) => sum + e.saturation_delta, 0) / edits.length;
    const avgBrightness = edits.reduce((sum, e) => sum + e.brightness_delta, 0) / edits.length;
    const avgSharpness = edits.reduce((sum, e) => sum + e.sharpness_delta, 0) / edits.length;

    // Collect transition types
    const transitions = edits
      .filter(e => e.transition_type)
      .map(e => e.transition_type!);

    // Collect audio FX
    const audioFX = edits
      .filter(e => e.audio_fx && e.audio_fx.length > 0)
      .flatMap(e => e.audio_fx!);

    // Collect color grades
    const colorGrades = edits
      .filter(e => e.color_grade)
      .map(e => e.color_grade!);

    // Calculate pace (edits per minute)
    const totalDuration = edits.reduce((sum, e) => sum + e.duration_seconds, 0);
    const editsPerMinute = (edits.length / totalDuration) * 60;
    
    const pace: 'slow' | 'moderate' | 'fast' = 
      editsPerMinute < 2 ? 'slow' :
      editsPerMinute < 5 ? 'moderate' : 'fast';

    return {
      avgContrast,
      avgSaturation,
      avgBrightness,
      avgSharpness,
      transitions,
      audioFX,
      colorGrades,
      pace
    };
  }

  /**
   * Update or create Style DNA record
   */
  private async updateStyleDNA(
    creatorId: string,
    sessionMetrics: ReturnType<typeof this.calculateSessionMetrics>
  ): Promise<StyleDNARecord> {
    // Fetch existing DNA
    const { data: existing, error: fetchError } = await this.supabase
      .from('style_dna')
      .select('*')
      .eq('creator_id', creatorId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // Not "no rows" error
      throw new Error(`Failed to fetch DNA: ${fetchError.message}`);
    }

    let updatedRecord: Partial<StyleDNARecord>;

    if (existing) {
      // Merge with existing (weighted average)
      const totalEdits = existing.total_edits + this.currentSession!.edits.length;
      const weight = existing.total_edits / totalEdits;

      updatedRecord = {
        total_edits: totalEdits,
        avg_contrast: (existing.avg_contrast * weight) + (sessionMetrics.avgContrast * (1 - weight)),
        avg_saturation: (existing.avg_saturation * weight) + (sessionMetrics.avgSaturation * (1 - weight)),
        avg_brightness: (existing.avg_brightness * weight) + (sessionMetrics.avgBrightness * (1 - weight)),
        avg_sharpness: (existing.avg_sharpness * weight) + (sessionMetrics.avgSharpness * (1 - weight)),
        favorite_transitions: this.mergeCounts(existing.favorite_transitions, sessionMetrics.transitions),
        favorite_audio_fx: this.mergeCounts(existing.favorite_audio_fx, sessionMetrics.audioFX),
        favorite_color_grades: this.mergeCounts(existing.favorite_color_grades, sessionMetrics.colorGrades),
        editing_pace: sessionMetrics.pace,
        style_signature: this.generateStyleSignature(creatorId, sessionMetrics),
        last_updated: new Date().toISOString()
      };
    } else {
      // Create new DNA record
      updatedRecord = {
        creator_id: creatorId,
        total_edits: this.currentSession!.edits.length,
        avg_contrast: sessionMetrics.avgContrast,
        avg_saturation: sessionMetrics.avgSaturation,
        avg_brightness: sessionMetrics.avgBrightness,
        avg_sharpness: sessionMetrics.avgSharpness,
        favorite_transitions: this.getTopItems(sessionMetrics.transitions, 5),
        favorite_audio_fx: this.getTopItems(sessionMetrics.audioFX, 5),
        favorite_color_grades: this.getTopItems(sessionMetrics.colorGrades, 3),
        editing_pace: sessionMetrics.pace,
        style_signature: this.generateStyleSignature(creatorId, sessionMetrics),
        last_updated: new Date().toISOString()
      };
    }

    // Upsert
    const { data, error } = await this.supabase
      .from('style_dna')
      .upsert(updatedRecord)
      .select()
      .single();

    if (error) throw new Error(`Failed to update DNA: ${error.message}`);

    return data;
  }

  /**
   * Generate style suggestions based on DNA
   */
  async generateSuggestions(creatorId: string): Promise<StyleSuggestion[]> {
    // Fetch DNA
    const { data: dna, error } = await this.supabase
      .from('style_dna')
      .select('*')
      .eq('creator_id', creatorId)
      .single();

    if (error || !dna) {
      console.warn('⚠️ No Style DNA found for creator');
      return [];
    }

    const suggestions: StyleSuggestion[] = [];

    // Contrast suggestion
    if (Math.abs(dna.avg_contrast) > 0.05) {
      suggestions.push({
        type: 'contrast',
        action: dna.avg_contrast > 0 ? 'Boost contrast' : 'Reduce contrast',
        confidence: Math.min(Math.abs(dna.avg_contrast) * 10, 0.95),
        reason: `You usually ${dna.avg_contrast > 0 ? 'increase' : 'decrease'} contrast by ${Math.abs(dna.avg_contrast).toFixed(2)}`,
        value: dna.avg_contrast
      });
    }

    // Saturation suggestion
    if (Math.abs(dna.avg_saturation) > 0.05) {
      suggestions.push({
        type: 'saturation',
        action: dna.avg_saturation > 0 ? 'Boost saturation' : 'Mute colors',
        confidence: Math.min(Math.abs(dna.avg_saturation) * 10, 0.95),
        reason: `Your signature look ${dna.avg_saturation > 0 ? 'pops' : 'is muted'} with saturation ${dna.avg_saturation > 0 ? '+' : ''}${dna.avg_saturation.toFixed(2)}`,
        value: dna.avg_saturation
      });
    }

    // Brightness suggestion
    if (Math.abs(dna.avg_brightness) > 0.05) {
      suggestions.push({
        type: 'brightness',
        action: dna.avg_brightness > 0 ? 'Brighten image' : 'Darken image',
        confidence: Math.min(Math.abs(dna.avg_brightness) * 10, 0.90),
        reason: `You prefer ${dna.avg_brightness > 0 ? 'brighter' : 'darker'} tones by ${Math.abs(dna.avg_brightness).toFixed(2)}`,
        value: dna.avg_brightness
      });
    }

    // Transition suggestion
    if (dna.favorite_transitions.length > 0) {
      suggestions.push({
        type: 'transition',
        action: `Use ${dna.favorite_transitions[0]} transition`,
        confidence: 0.85,
        reason: `Your go-to transition is "${dna.favorite_transitions[0]}"`,
        value: dna.favorite_transitions[0]
      });
    }

    // Audio FX suggestion
    if (dna.favorite_audio_fx.length > 0) {
      suggestions.push({
        type: 'audio',
        action: `Apply ${dna.favorite_audio_fx[0]} audio effect`,
        confidence: 0.80,
        reason: `You often use "${dna.favorite_audio_fx[0]}" for audio polish`,
        value: dna.favorite_audio_fx[0]
      });
    }

    // Color grade suggestion
    if (dna.favorite_color_grades.length > 0) {
      suggestions.push({
        type: 'color_grade',
        action: `Apply ${dna.favorite_color_grades[0]} color grade`,
        confidence: 0.90,
        reason: `Your signature color grade is "${dna.favorite_color_grades[0]}"`,
        value: dna.favorite_color_grades[0]
      });
    }

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);

    console.log(`🧬 Generated ${suggestions.length} style suggestions`);

    return suggestions;
  }

  /**
   * Get Style DNA for creator
   */
  async getStyleDNA(creatorId: string): Promise<StyleDNARecord | null> {
    const { data, error } = await this.supabase
      .from('style_dna')
      .select('*')
      .eq('creator_id', creatorId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows
      throw new Error(`Failed to get DNA: ${error.message}`);
    }

    return data;
  }

  /**
   * Apply signature style (convenience method)
   */
  async applySignatureStyle(creatorId: string): Promise<{
    contrast: number;
    saturation: number;
    brightness: number;
    sharpness: number;
    colorGrade?: string;
  }> {
    const dna = await this.getStyleDNA(creatorId);

    if (!dna) {
      throw new Error('No Style DNA found. Create some edits first!');
    }

    return {
      contrast: dna.avg_contrast,
      saturation: dna.avg_saturation,
      brightness: dna.avg_brightness,
      sharpness: dna.avg_sharpness,
      colorGrade: dna.favorite_color_grades[0]
    };
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private mergeCounts(existing: string[], newItems: string[]): string[] {
    const counts = new Map<string, number>();

    // Count existing
    existing.forEach(item => {
      counts.set(item, (counts.get(item) || 0) + 1);
    });

    // Add new items
    newItems.forEach(item => {
      counts.set(item, (counts.get(item) || 0) + 1);
    });

    // Sort by count and return top items
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([item]) => item)
      .slice(0, 5);
  }

  private getTopItems(items: string[], limit: number): string[] {
    const counts = new Map<string, number>();

    items.forEach(item => {
      counts.set(item, (counts.get(item) || 0) + 1);
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([item]) => item)
      .slice(0, limit);
  }

  private generateStyleSignature(
    creatorId: string,
    metrics: ReturnType<typeof this.calculateSessionMetrics>
  ): string {
    // Create a unique fingerprint of the creator's style
    const components = [
      `c${metrics.avgContrast.toFixed(2)}`,
      `s${metrics.avgSaturation.toFixed(2)}`,
      `b${metrics.avgBrightness.toFixed(2)}`,
      `p${metrics.pace}`,
      metrics.transitions[0] || 'none',
      metrics.colorGrades[0] || 'none'
    ];

    return components.join('_');
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const aiStyleLearning = new AIStyleLearningEngine();
