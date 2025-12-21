/* eslint-disable */
/**
 * 🙏 GRATITUDE ARTIFACTS LOGGER
 * Immortalize every epic feature usage in the Docked Console
 * Streams logs to Supabase for sovereign artifact tracking
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface GratitudeArtifact {
  id: string;
  creator_id: string;
  feature_name: string;
  action_type: string;
  input_params?: Record<string, any>;
  output_url?: string;
  success: boolean;
  execution_time_ms: number;
  created_at: string;
  legacy_note?: string;
  metadata?: Record<string, any>;
}

export interface ConsoleLogEntry {
  id: string;
  session_id: string;
  creator_id?: string;
  log_level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
  logged_at: string;
}

// ============================================================================
// GRATITUDE LOGGER ENGINE
// ============================================================================

export class GratitudeLogger {
  private supabase: SupabaseClient;
  private sessionId: string;
  private creatorId?: string;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    this.supabase = createClient(
      supabaseUrl || process.env.VITE_SUPABASE_URL || '',
      supabaseKey || process.env.VITE_SUPABASE_ANON_KEY || ''
    );
    this.sessionId = this.generateSessionId();
  }

  /**
   * Set the current user ID for logging
   */
  setCreator(creatorId: string) {
    this.creatorId = creatorId;
  }

  /**
   * Log a gratitude artifact (feature usage)
   */
  async logArtifact(
    featureName: string,
    actionType: string,
    inputParams?: Record<string, any>,
    outputUrl?: string,
    success: boolean = true,
    executionTimeMs: number = 0,
    legacyNote?: string,
    metadata?: Record<string, any>
  ): Promise<GratitudeArtifact> {
    if (!this.creatorId) {
      console.warn('⚠️  No creator ID set for gratitude logging');
    }

    const { data, error } = await this.supabase
      .from('gratitude_artifacts')
      .insert({
        creator_id: this.creatorId || 'anonymous',
        feature_name: featureName,
        action_type: actionType,
        input_params: inputParams,
        output_url: outputUrl,
        success,
        execution_time_ms: executionTimeMs,
        legacy_note: legacyNote,
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to log gratitude artifact:', error);
      throw new Error(`Failed to log artifact: ${error.message}`);
    }

    const emoji = success ? '✅' : '❌';
    console.log(`${emoji} [${featureName}] ${actionType} - ${executionTimeMs}ms`);

    return data;
  }

  /**
   * Log to console stream (for Docked Console UI)
   */
  async log(
    message: string,
    level: 'debug' | 'info' | 'warn' | 'error' = 'info',
    context?: Record<string, any>
  ): Promise<ConsoleLogEntry> {
    const { data, error } = await this.supabase
      .from('console_streams')
      .insert({
        session_id: this.sessionId,
        creator_id: this.creatorId,
        log_level: level,
        message,
        context
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to log to console stream:', error);
      throw new Error(`Failed to log: ${error.message}`);
    }

    // Also log to browser console with formatting
    const emoji = { debug: '🔍', info: 'ℹ️', warn: '⚠️', error: '❌' }[level];
    const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    consoleMethod(`${emoji} [Docked Console] ${message}`, context || '');

    return data;
  }

  /**
   * Convenience methods for different log levels
   */
  async debug(message: string, context?: Record<string, any>) {
    return this.log(message, 'debug', context);
  }

  async info(message: string, context?: Record<string, any>) {
    return this.log(message, 'info', context);
  }

  async warn(message: string, context?: Record<string, any>) {
    return this.log(message, 'warn', context);
  }

  async error(message: string, context?: Record<string, any>) {
    return this.log(message, 'error', context);
  }

  /**
   * Log epic feature usage with timing
   */
  async logEpicFeature<T>(
    featureName: string,
    actionType: string,
    operation: () => Promise<T>,
    inputParams?: Record<string, any>,
    legacyNote?: string
  ): Promise<T> {
    const startTime = performance.now();
    let outputUrl: string | undefined;
    let success = false;
    let result: T;

    try {
      await this.info(`Starting ${featureName}: ${actionType}`, inputParams);
      
      result = await operation();
      success = true;

      // Try to extract URL from result if it's an object
      if (result && typeof result === 'object' && 'url' in result) {
        outputUrl = (result as any).url;
      }

      const executionTime = performance.now() - startTime;

      await this.logArtifact(
        featureName,
        actionType,
        inputParams,
        outputUrl,
        success,
        executionTime,
        legacyNote
      );

      await this.info(`✅ ${featureName} completed in ${executionTime.toFixed(0)}ms`);

      return result;
    } catch (error: any) {
      const executionTime = performance.now() - startTime;

      await this.logArtifact(
        featureName,
        actionType,
        inputParams,
        outputUrl,
        false,
        executionTime,
        legacyNote,
        { error: error.message }
      );

      await this.error(`❌ ${featureName} failed: ${error.message}`, { 
        actionType, 
        executionTime 
      });

      throw error;
    }
  }

  /**
   * Get recent artifacts for creator
   */
  async getCreatorArtifacts(
    creatorId: string,
    limit: number = 50
  ): Promise<GratitudeArtifact[]> {
    const { data, error } = await this.supabase
      .from('gratitude_artifacts')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get artifacts: ${error.message}`);

    return data || [];
  }

  /**
   * Get artifacts by feature
   */
  async getFeatureArtifacts(
    featureName: string,
    limit: number = 50
  ): Promise<GratitudeArtifact[]> {
    const { data, error } = await this.supabase
      .from('gratitude_artifacts')
      .select('*')
      .eq('feature_name', featureName)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get feature artifacts: ${error.message}`);

    return data || [];
  }

  /**
   * Get console logs for current session
   */
  async getSessionLogs(limit: number = 100): Promise<ConsoleLogEntry[]> {
    const { data, error } = await this.supabase
      .from('console_streams')
      .select('*')
      .eq('session_id', this.sessionId)
      .order('logged_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get session logs: ${error.message}`);

    return data || [];
  }

  /**
   * Subscribe to realtime console logs
   */
  subscribeToConsole(
    callback: (entry: ConsoleLogEntry) => void
  ): () => void {
    const channel = this.supabase
      .channel(`console-${this.sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'console_streams',
          filter: `session_id=eq.${this.sessionId}`
        },
        (payload) => {
          callback(payload.new as ConsoleLogEntry);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      this.supabase.removeChannel(channel);
    };
  }

  /**
   * Get statistics for a feature
   */
  async getFeatureStats(featureName: string): Promise<{
    total_uses: number;
    success_rate: number;
    avg_execution_time_ms: number;
    last_used: string;
  }> {
    const { data: artifacts } = await this.supabase
      .from('gratitude_artifacts')
      .select('*')
      .eq('feature_name', featureName);

    if (!artifacts || artifacts.length === 0) {
      return {
        total_uses: 0,
        success_rate: 0,
        avg_execution_time_ms: 0,
        last_used: 'never'
      };
    }

    const totalUses = artifacts.length;
    const successCount = artifacts.filter(a => a.success).length;
    const successRate = (successCount / totalUses) * 100;
    const avgTime = artifacts.reduce((sum, a) => sum + a.execution_time_ms, 0) / totalUses;
    const lastUsed = artifacts[0].created_at;

    return {
      total_uses: totalUses,
      success_rate: successRate,
      avg_execution_time_ms: avgTime,
      last_used: lastUsed
    };
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const gratitude = new GratitudeLogger();

// Export convenience function for logging epic features
export async function logEpicFeature<T>(
  featureName: string,
  actionType: string,
  operation: () => Promise<T>,
  inputParams?: Record<string, any>,
  legacyNote?: string
): Promise<T> {
  return gratitude.logEpicFeature(featureName, actionType, operation, inputParams, legacyNote);
}
