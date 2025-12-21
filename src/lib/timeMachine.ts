/**
 * ⏱️ TIME MACHINE FOR EDITS
 * Version control system with diffing, branching, and time travel
 * Uses jsondiffpatch for efficient storage of changes
 */

import { DiffPatcher } from 'jsondiffpatch';
import DiffMatchPatch from 'diff-match-patch';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface ProjectSnapshot {
  layers: any[];
  settings: Record<string, any>;
  metadata: Record<string, any>;
}

export interface EditVersion {
  id: string;
  project_id: string;
  creator_id: string;
  version_number: number;
  parent_version_id?: string;
  branch_name: string;
  snapshot_data: ProjectSnapshot;
  diff_from_parent?: any;
  thumbnail_url?: string;
  created_at: string;
  metadata: Record<string, any>;
}

export interface VersionBranch {
  id: string;
  project_id: string;
  branch_name: string;
  parent_branch: string;
  created_from_version: string;
  creator_id: string;
  description?: string;
  created_at: string;
}

// ============================================================================
// TIME MACHINE ENGINE
// ============================================================================

export class TimeMachineEngine {
  private supabase: SupabaseClient;
  private differ: DiffPatcher;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    this.supabase = createClient(
      supabaseUrl || process.env.VITE_SUPABASE_URL || '',
      supabaseKey || process.env.VITE_SUPABASE_ANON_KEY || ''
    );
    
    // jsondiffpatch with text diffing
    this.differ = new DiffPatcher({
      objectHash: (obj: any) => obj.id || obj._id || JSON.stringify(obj),
      arrays: { detectMove: true },
      textDiff: { 
        minLength: 60,
        diffMatchPatch: DiffMatchPatch
      }
    });
  }

  /**
   * Save a new version of the project
   */
  async saveVersion(
    projectId: string,
    creatorId: string,
    snapshot: ProjectSnapshot,
    branchName: string = 'main',
    metadata: Record<string, any> = {}
  ): Promise<EditVersion> {
    // Get parent version (latest on this branch)
    const { data: parentVersion } = await this.supabase
      .from('edit_versions')
      .select('*')
      .eq('project_id', projectId)
      .eq('branch_name', branchName)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    // Calculate diff from parent
    let diffFromParent = null;
    if (parentVersion) {
      diffFromParent = this.differ.diff(
        parentVersion.snapshot_data,
        snapshot
      );
    }

    // Insert new version
    const { data: newVersion, error } = await this.supabase
      .from('edit_versions')
      .insert({
        project_id: projectId,
        creator_id: creatorId,
        parent_version_id: parentVersion?.id,
        branch_name: branchName,
        snapshot_data: snapshot,
        diff_from_parent: diffFromParent,
        metadata
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to save version: ${error.message}`);

    console.log(`⏱️  Version ${newVersion.version_number} saved on ${branchName}`);
    return newVersion;
  }

  /**
   * Get version history for a project
   */
  async getHistory(
    projectId: string,
    branchName?: string,
    limit: number = 50
  ): Promise<EditVersion[]> {
    let query = this.supabase
      .from('edit_versions')
      .select('*')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })
      .limit(limit);

    if (branchName) {
      query = query.eq('branch_name', branchName);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to get history: ${error.message}`);

    return data || [];
  }

  /**
   * Restore a specific version
   */
  async restoreVersion(versionId: string): Promise<ProjectSnapshot> {
    const { data: version, error } = await this.supabase
      .from('edit_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (error) throw new Error(`Failed to restore version: ${error.message}`);

    console.log(`⏱️  Restored to version ${version.version_number}`);
    return version.snapshot_data;
  }

  /**
   * Create a new branch from a version
   */
  async createBranch(
    projectId: string,
    creatorId: string,
    fromVersionId: string,
    newBranchName: string,
    description?: string
  ): Promise<VersionBranch> {
    // Get the source version
    const { data: sourceVersion } = await this.supabase
      .from('edit_versions')
      .select('*')
      .eq('id', fromVersionId)
      .single();

    if (!sourceVersion) throw new Error('Source version not found');

    // Create branch record
    const { data: branch, error: branchError } = await this.supabase
      .from('version_branches')
      .insert({
        project_id: projectId,
        branch_name: newBranchName,
        parent_branch: sourceVersion.branch_name,
        created_from_version: fromVersionId,
        creator_id: creatorId,
        description
      })
      .select()
      .single();

    if (branchError) throw new Error(`Failed to create branch: ${branchError.message}`);

    // Copy source version as first version on new branch
    await this.saveVersion(
      projectId,
      creatorId,
      sourceVersion.snapshot_data,
      newBranchName,
      { branched_from: fromVersionId }
    );

    console.log(`🌿 Created branch "${newBranchName}" from version ${sourceVersion.version_number}`);
    return branch;
  }

  /**
   * Get all branches for a project
   */
  async getBranches(projectId: string): Promise<VersionBranch[]> {
    const { data, error } = await this.supabase
      .from('version_branches')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get branches: ${error.message}`);

    return data || [];
  }

  /**
   * Compare two versions and return diff
   */
  async compareVersions(versionId1: string, versionId2: string): Promise<any> {
    const [{ data: v1 }, { data: v2 }] = await Promise.all([
      this.supabase.from('edit_versions').select('*').eq('id', versionId1).single(),
      this.supabase.from('edit_versions').select('*').eq('id', versionId2).single()
    ]);

    if (!v1 || !v2) throw new Error('Versions not found');

    return this.differ.diff(v1.snapshot_data, v2.snapshot_data);
  }

  /**
   * Apply a diff to a snapshot
   */
  applyDiff(snapshot: ProjectSnapshot, diff: any): ProjectSnapshot {
    return this.differ.patch(snapshot, diff) as ProjectSnapshot;
  }

  /**
   * Reverse a diff
   */
  reverseDiff(diff: any): any {
    return this.differ.reverse(diff);
  }

  /**
   * Get version by number
   */
  async getVersionByNumber(
    projectId: string,
    versionNumber: number,
    branchName: string = 'main'
  ): Promise<EditVersion | null> {
    const { data, error } = await this.supabase
      .from('edit_versions')
      .select('*')
      .eq('project_id', projectId)
      .eq('branch_name', branchName)
      .eq('version_number', versionNumber)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Delete old versions (keep last N)
   */
  async pruneOldVersions(
    projectId: string,
    branchName: string,
    keepLast: number = 50
  ): Promise<number> {
    // Get versions to delete
    const { data: versionsToDelete } = await this.supabase
      .from('edit_versions')
      .select('id')
      .eq('project_id', projectId)
      .eq('branch_name', branchName)
      .order('version_number', { ascending: false })
      .range(keepLast, 999999);

    if (!versionsToDelete || versionsToDelete.length === 0) return 0;

    const idsToDelete = versionsToDelete.map(v => v.id);

    const { error } = await this.supabase
      .from('edit_versions')
      .delete()
      .in('id', idsToDelete);

    if (error) throw new Error(`Failed to prune versions: ${error.message}`);

    console.log(`🗑️  Pruned ${idsToDelete.length} old versions`);
    return idsToDelete.length;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const timeMachine = new TimeMachineEngine();
