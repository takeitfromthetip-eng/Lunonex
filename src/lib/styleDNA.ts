/* eslint-disable */
/**
 * Style DNA Engine - Learns and applies creator's unique style
 * Analyzes editing patterns, filters, color grading, and creative choices
 */

export interface StyleDNAProfile {
  creatorId: string;
  styleFingerprint: {
    colorPalette: string[];
    filterPreferences: Record<string, number>;
    compositionPatterns: string[];
    editingRhythm: number;
    signatureEffects: string[];
  };
  confidenceScore: number;
  sampleCount: number;
  lastUpdated: number;
  version: string;
}

export interface EditAction {
  type: 'filter' | 'crop' | 'color' | 'effect' | 'transition' | 'audio';
  params: Record<string, any>;
  timestamp: number;
  artifactId?: string;
}

class StyleDNAEngine {
  private profiles: Map<string, StyleDNAProfile> = new Map();
  private editHistory: Map<string, EditAction[]> = new Map();

  /**
   * Record a creator's edit action to build their style DNA
   */
  recordEdit(creatorId: string, action: EditAction): void {
    if (!this.editHistory.has(creatorId)) {
      this.editHistory.set(creatorId, []);
    }
    this.editHistory.get(creatorId)!.push(action);
    
    // Update DNA profile after every 10 edits
    const history = this.editHistory.get(creatorId)!;
    if (history.length % 10 === 0) {
      this.updateDNAProfile(creatorId);
    }
  }

  /**
   * Analyze edit history and generate/update style DNA profile
   */
  private updateDNAProfile(creatorId: string): StyleDNAProfile {
    const history = this.editHistory.get(creatorId) || [];
    
    const profile: StyleDNAProfile = {
      creatorId,
      styleFingerprint: {
        colorPalette: this.extractColorPalette(history),
        filterPreferences: this.analyzeFilterUsage(history),
        compositionPatterns: this.detectCompositionPatterns(history),
        editingRhythm: this.calculateEditingRhythm(history),
        signatureEffects: this.identifySignatureEffects(history),
      },
      confidenceScore: Math.min(history.length / 100, 1), // Full confidence at 100 edits
      sampleCount: history.length,
      lastUpdated: Date.now(),
      version: '1.0.0',
    };

    this.profiles.set(creatorId, profile);
    return profile;
  }

  /**
   * Get style suggestions based on creator's DNA
   */
  suggestStyle(creatorId: string, context?: string): Record<string, any> {
    const profile = this.profiles.get(creatorId);
    
    if (!profile || profile.confidenceScore < 0.3) {
      return { message: 'Not enough data to suggest style. Keep creating!' };
    }

    const suggestions: Record<string, any> = {
      confidence: profile.confidenceScore,
      recommendations: [],
    };

    // Suggest most-used filters
    const topFilters = Object.entries(profile.styleFingerprint.filterPreferences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([filter]) => filter);

    if (topFilters.length > 0) {
      suggestions.recommendations.push({
        type: 'filter',
        suggestion: `Your signature filters: ${topFilters.join(', ')}`,
        filters: topFilters,
      });
    }

    // Suggest color palette
    if (profile.styleFingerprint.colorPalette.length > 0) {
      suggestions.recommendations.push({
        type: 'color',
        suggestion: 'Apply your signature color palette',
        colors: profile.styleFingerprint.colorPalette.slice(0, 5),
      });
    }

    // Suggest effects
    if (profile.styleFingerprint.signatureEffects.length > 0) {
      suggestions.recommendations.push({
        type: 'effect',
        suggestion: 'Add your signature effects',
        effects: profile.styleFingerprint.signatureEffects,
      });
    }

    return suggestions;
  }

  /**
   * Apply creator's signature style to new content
   */
  applySignatureStyle(creatorId: string, targetArtifact: any): any {
    const profile = this.profiles.get(creatorId);
    
    if (!profile || profile.confidenceScore < 0.5) {
      throw new Error('Insufficient style data. Create more content first!');
    }

    // Apply learned style parameters
    return {
      ...targetArtifact,
      styleDNA: {
        applied: true,
        profile: profile.creatorId,
        confidence: profile.confidenceScore,
        filters: Object.entries(profile.styleFingerprint.filterPreferences)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([filter, strength]) => ({ filter, strength })),
        colors: profile.styleFingerprint.colorPalette.slice(0, 5),
        effects: profile.styleFingerprint.signatureEffects,
      },
    };
  }

  /**
   * Get full DNA profile for creator
   */
  getProfile(creatorId: string): StyleDNAProfile | null {
    return this.profiles.get(creatorId) || null;
  }

  /**
   * Export DNA profile for backup/portability
   */
  exportProfile(creatorId: string): string {
    const profile = this.profiles.get(creatorId);
    if (!profile) throw new Error('Profile not found');
    return JSON.stringify(profile, null, 2);
  }

  /**
   * Import DNA profile from backup
   */
  importProfile(profileJson: string): void {
    const profile: StyleDNAProfile = JSON.parse(profileJson);
    this.profiles.set(profile.creatorId, profile);
  }

  // Private analysis methods
  private extractColorPalette(history: EditAction[]): string[] {
    const colors = new Set<string>();
    history
      .filter(a => a.type === 'color')
      .forEach(a => {
        if (a.params.color) colors.add(a.params.color);
        if (a.params.palette) a.params.palette.forEach((c: string) => colors.add(c));
      });
    return Array.from(colors);
  }

  private analyzeFilterUsage(history: EditAction[]): Record<string, number> {
    const usage: Record<string, number> = {};
    history
      .filter(a => a.type === 'filter')
      .forEach(a => {
        const filter = a.params.name || a.params.filter;
        if (filter) {
          usage[filter] = (usage[filter] || 0) + 1;
        }
      });
    return usage;
  }

  private detectCompositionPatterns(history: EditAction[]): string[] {
    const patterns = new Set<string>();
    history
      .filter(a => a.type === 'crop')
      .forEach(a => {
        if (a.params.aspectRatio) patterns.add(`aspect-${a.params.aspectRatio}`);
        if (a.params.rule) patterns.add(a.params.rule);
      });
    return Array.from(patterns);
  }

  private calculateEditingRhythm(history: EditAction[]): number {
    if (history.length < 2) return 0;
    
    const timestamps = history.map(a => a.timestamp).sort((a, b) => a - b);
    const intervals = [];
    
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }
    
    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    return avgInterval; // milliseconds between edits
  }

  private identifySignatureEffects(history: EditAction[]): string[] {
    const effectCounts: Record<string, number> = {};
    
    history
      .filter(a => a.type === 'effect' || a.type === 'transition')
      .forEach(a => {
        const effect = a.params.name || a.params.effect;
        if (effect) {
          effectCounts[effect] = (effectCounts[effect] || 0) + 1;
        }
      });

    // Return effects used at least 3 times
    return Object.entries(effectCounts)
      .filter(([, count]) => count >= 3)
      .sort(([, a], [, b]) => b - a)
      .map(([effect]) => effect);
  }
}

export const styleDNA = new StyleDNAEngine();
