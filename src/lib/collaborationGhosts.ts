/* eslint-disable */
/**
 * 👻 COLLABORATION GHOSTS
 * Real-time multiplayer editing with cursor presence and WebRTC voice
 * Uses Supabase Realtime for cursor positions and simple-peer for voice
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import SimplePeer from 'simple-peer';

// ============================================================================
// TYPES
// ============================================================================

export interface CollabSession {
  id: string;
  project_id: string;
  session_name?: string;
  host_user_id: string;
  started_at: string;
  status: 'active' | 'paused' | 'ended';
  voice_enabled: boolean;
}

export interface Participant {
  id: string;
  session_id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  cursor_color: string;
  joined_at: string;
  is_active: boolean;
  permissions: {
    edit: boolean;
    voice: boolean;
  };
}

export interface CursorPosition {
  x: number;
  y: number;
  viewport_scale: number;
}

export interface Ghost {
  participant: Participant;
  cursor: CursorPosition;
  lastUpdate: number;
}

// ============================================================================
// COLLABORATION GHOSTS ENGINE
// ============================================================================

export class CollaborationGhostsEngine {
  private supabase: SupabaseClient;
  private channel?: RealtimeChannel;
  private sessionId?: string;
  private participantId?: string;
  private userId?: string;
  private ghosts: Map<string, Ghost> = new Map();
  private peers: Map<string, SimplePeer.Instance> = new Map();
  private localStream?: MediaStream;
  
  // Callbacks
  private onGhostUpdate?: (ghosts: Ghost[]) => void;
  private onPeerAudio?: (peerId: string, stream: MediaStream) => void;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    this.supabase = createClient(
      supabaseUrl || process.env.VITE_SUPABASE_URL || '',
      supabaseKey || process.env.VITE_SUPABASE_ANON_KEY || ''
    );
  }

  /**
   * Start a new collaboration session
   */
  async startSession(
    projectId: string,
    hostUserId: string,
    sessionName?: string,
    voiceEnabled: boolean = true
  ): Promise<CollabSession> {
    const { data, error } = await this.supabase
      .from('collab_sessions')
      .insert({
        project_id: projectId,
        host_user_id: hostUserId,
        session_name: sessionName,
        voice_enabled: voiceEnabled,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to start session: ${error.message}`);

    this.sessionId = data.id;
    console.log(`👻 Collaboration session started: ${data.id}`);

    return data;
  }

  /**
   * Join an existing session
   */
  async joinSession(
    sessionId: string,
    userId: string,
    username: string,
    avatarUrl?: string
  ): Promise<Participant> {
    this.sessionId = sessionId;
    this.userId = userId;

    // Generate random cursor color
    const cursorColor = this.generateCursorColor();

    // Insert participant record
    const { data, error } = await this.supabase
      .from('collab_participants')
      .insert({
        session_id: sessionId,
        user_id: userId,
        username,
        avatar_url: avatarUrl,
        cursor_color: cursorColor,
        is_active: true
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to join session: ${error.message}`);

    this.participantId = data.id;

    // Subscribe to realtime updates
    await this.subscribeToSession();

    console.log(`👻 Joined session as ${username} (${cursorColor})`);

    return data;
  }

  /**
   * Subscribe to realtime session updates
   */
  private async subscribeToSession() {
    if (!this.sessionId) throw new Error('No session ID');

    this.channel = this.supabase.channel(`collab:${this.sessionId}`, {
      config: { presence: { key: this.participantId! } }
    });

    // Track presence (cursors)
    this.channel.on('presence', { event: 'sync' }, () => {
      const presenceState = this.channel!.presenceState();
      this.updateGhosts(presenceState);
    });

    this.channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log(`👻 Ghost joined: ${key}`);
    });

    this.channel.on('presence', { event: 'leave' }, ({ key }) => {
      console.log(`👻 Ghost left: ${key}`);
      this.ghosts.delete(key);
      this.updateGhostCallbacks();
    });

    // Listen for WebRTC signaling
    this.channel.on('broadcast', { event: 'signal' }, ({ payload }) => {
      this.handleSignal(payload);
    });

    // Subscribe
    await this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        console.log('👻 Subscribed to collaboration channel');
      }
    });
  }

  /**
   * Update cursor position
   */
  async updateCursor(x: number, y: number, viewportScale: number = 1.0) {
    if (!this.channel || !this.participantId) return;

    // Send presence update
    await this.channel.track({
      participant_id: this.participantId,
      x,
      y,
      viewport_scale: viewportScale,
      timestamp: Date.now()
    });

    // Also update database (for persistence)
    await this.supabase
      .from('collab_cursors')
      .upsert({
        id: `${this.participantId}_cursor`,
        session_id: this.sessionId,
        participant_id: this.participantId,
        x_position: x,
        y_position: y,
        viewport_scale: viewportScale
      });
  }

  /**
   * Broadcast an edit action
   */
  async broadcastEdit(editType: string, editData: any) {
    if (!this.channel || !this.participantId) return;

    // Save to database
    await this.supabase
      .from('collab_edits')
      .insert({
        session_id: this.sessionId,
        participant_id: this.participantId,
        edit_type: editType,
        edit_data: editData
      });

    // Broadcast via realtime
    await this.channel.send({
      type: 'broadcast',
      event: 'edit',
      payload: {
        participant_id: this.participantId,
        edit_type: editType,
        edit_data: editData
      }
    });

    console.log(`📝 Broadcast edit: ${editType}`);
  }

  /**
   * Start voice chat
   */
  async startVoice() {
    try {
      // Get user's microphone
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      console.log('🎤 Voice enabled');

      // Get other participants
      const { data: participants } = await this.supabase
        .from('collab_participants')
        .select('*')
        .eq('session_id', this.sessionId)
        .eq('is_active', true)
        .neq('id', this.participantId);

      // Create peer connections to each
      participants?.forEach(participant => {
        this.createPeerConnection(participant.id, true);
      });

    } catch (error: any) {
      console.error('❌ Failed to start voice:', error);
      throw new Error(`Voice failed: ${error.message}`);
    }
  }

  /**
   * Stop voice chat
   */
  stopVoice() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = undefined;
    }

    // Close all peer connections
    this.peers.forEach(peer => peer.destroy());
    this.peers.clear();

    console.log('🔇 Voice stopped');
  }

  /**
   * Create WebRTC peer connection
   */
  private createPeerConnection(peerId: string, initiator: boolean) {
    if (this.peers.has(peerId)) return;

    const peer = new SimplePeer({
      initiator,
      stream: this.localStream,
      trickle: false
    });

    peer.on('signal', async (signal) => {
      // Send signal via Supabase Realtime
      await this.channel?.send({
        type: 'broadcast',
        event: 'signal',
        payload: {
          from: this.participantId,
          to: peerId,
          signal
        }
      });
    });

    peer.on('stream', (stream) => {
      console.log(`🔊 Receiving audio from ${peerId}`);
      this.onPeerAudio?.(peerId, stream);
    });

    peer.on('error', (error) => {
      console.error(`❌ Peer error with ${peerId}:`, error);
    });

    this.peers.set(peerId, peer);
  }

  /**
   * Handle WebRTC signaling
   */
  private handleSignal(payload: any) {
    const { from, to, signal } = payload;

    if (to !== this.participantId) return;

    let peer = this.peers.get(from);
    
    if (!peer) {
      // Create peer connection as answerer
      this.createPeerConnection(from, false);
      peer = this.peers.get(from);
    }

    peer?.signal(signal);
  }

  /**
   * Update ghost positions from presence
   */
  private updateGhosts(presenceState: Record<string, any>) {
    const newGhosts = new Map<string, Ghost>();

    Object.entries(presenceState).forEach(([key, presences]: [string, any]) => {
      if (key === this.participantId) return; // Skip self

      const presence = presences[0]; // Get latest presence
      if (!presence) return;

      newGhosts.set(key, {
        participant: {
          id: key,
          session_id: this.sessionId!,
          user_id: presence.user_id || 'unknown',
          username: presence.username || 'Ghost',
          cursor_color: presence.cursor_color || '#00ff00',
          joined_at: presence.joined_at || new Date().toISOString(),
          is_active: true,
          permissions: { edit: true, voice: true }
        },
        cursor: {
          x: presence.x || 0,
          y: presence.y || 0,
          viewport_scale: presence.viewport_scale || 1.0
        },
        lastUpdate: presence.timestamp || Date.now()
      });
    });

    this.ghosts = newGhosts;
    this.updateGhostCallbacks();
  }

  /**
   * Trigger ghost update callbacks
   */
  private updateGhostCallbacks() {
    if (this.onGhostUpdate) {
      this.onGhostUpdate(Array.from(this.ghosts.values()));
    }
  }

  /**
   * Set callback for ghost updates
   */
  setOnGhostUpdate(callback: (ghosts: Ghost[]) => void) {
    this.onGhostUpdate = callback;
  }

  /**
   * Set callback for peer audio
   */
  setOnPeerAudio(callback: (peerId: string, stream: MediaStream) => void) {
    this.onPeerAudio = callback;
  }

  /**
   * Get current ghosts
   */
  getGhosts(): Ghost[] {
    return Array.from(this.ghosts.values());
  }

  /**
   * End session
   */
  async endSession() {
    // Mark participant as inactive
    if (this.participantId) {
      await this.supabase
        .from('collab_participants')
        .update({ is_active: false, left_at: new Date().toISOString() })
        .eq('id', this.participantId);
    }

    // Unsubscribe from channel
    if (this.channel) {
      await this.channel.unsubscribe();
    }

    // Stop voice
    this.stopVoice();

    this.ghosts.clear();
    console.log('👻 Left collaboration session');
  }

  /**
   * Update session status (host only)
   */
  async updateSessionStatus(status: 'active' | 'paused' | 'ended') {
    if (!this.sessionId) return;

    const updates: any = { status };
    if (status === 'ended') {
      updates.ended_at = new Date().toISOString();
    }

    await this.supabase
      .from('collab_sessions')
      .update(updates)
      .eq('id', this.sessionId);

    console.log(`👻 Session status: ${status}`);
  }

  /**
   * Get session history
   */
  async getSessionEdits(limit: number = 100): Promise<any[]> {
    if (!this.sessionId) return [];

    const { data, error } = await this.supabase
      .from('collab_edits')
      .select('*, collab_participants(username, cursor_color)')
      .eq('session_id', this.sessionId)
      .order('applied_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get edits: ${error.message}`);

    return data || [];
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private generateCursorColor(): string {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa07a',
      '#98d8c8', '#f7dc6f', '#bb8fce', '#85c1e2',
      '#f8b739', '#52b788'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const collaborationGhosts = new CollaborationGhostsEngine();
