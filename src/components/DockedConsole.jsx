/**
 * Docked Console: Real-time governance visibility for Mico
 * Streams artifacts, governance decisions, and policy overrides
 */

import React, { useState, useEffect, useRef } from 'react';
import CommandPanel from './CommandPanel';
import './DockedConsole.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function DockedConsole({ minimized = false }) {
  const [artifacts, setArtifacts] = useState([]);
  const [governanceRecords, setGovernanceRecords] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [activeTab, setActiveTab] = useState('artifacts'); // artifacts, governance, overrides, command
  const [isMinimized, setIsMinimized] = useState(minimized);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef(null);

  // Connect to SSE stream for real-time artifacts
  useEffect(() => {
    const connectSSE = () => {
      try {
        const eventSource = new EventSource(`${API_BASE}/api/governance/artifacts/stream`);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('🔌 DockedConsole SSE connected');
          setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'connected') {
              console.log('📡 SSE stream established:', data.timestamp);
            } else if (data.type === 'artifact') {
              setArtifacts((prev) => [data.artifact, ...prev].slice(0, 50)); // Keep last 50
            }
          } catch (error) {
            console.error('Failed to parse SSE message:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE error:', error);
          setIsConnected(false);
          eventSource.close();

          // Reconnect after 5 seconds
          setTimeout(connectSSE, 5000);
        };
      } catch (error) {
        console.error('Failed to connect SSE:', error);
        setIsConnected(false);
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Load initial data
  useEffect(() => {
    loadArtifacts();
    loadGovernance();
    loadOverrides();
  }, []);

  const loadArtifacts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/governance/artifacts/recent?limit=50`);
      const data = await res.json();
      if (data.artifacts) {
        setArtifacts(data.artifacts);
      }
    } catch (error) {
      console.error('Failed to load artifacts:', error);
    }
  };

  const loadGovernance = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/governance/notary/history?limit=20`);
      const data = await res.json();
      if (data.history) {
        setGovernanceRecords(data.history);
      }
    } catch (error) {
      console.error('Failed to load governance records:', error);
    }
  };

  const loadOverrides = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/governance/overrides`);
      const data = await res.json();
      if (data.overrides) {
        setOverrides(data.overrides);
      }
    } catch (error) {
      console.error('Failed to load overrides:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const getAgentIcon = (agentType) => {
    const icons = {
      moderation_sentinel: '🛡️',
      content_companion: '✨',
      automation_clerk: '🤖',
      profile_architect: '🎨',
      legacy_archivist: '📜',
    };
    return icons[agentType] || '⚡';
  };

  const getGovernanceIcon = (actionType) => {
    const icons = {
      threshold_override: '⚙️',
      policy_escalation: '🚨',
      emergency_action: '🚨',
      authority_grant: '🔑',
      authority_revoke: '🔒',
      guard_mode_toggle: '🛡️',
      manual_review: '👁️',
    };
    return icons[actionType] || '⚖️';
  };

  const handleCommandExecuted = (commandData) => {
    console.log('Command executed:', commandData);
    // Refresh data after command execution
    loadArtifacts();
    loadGovernance();
    loadOverrides();
  };

  if (isMinimized) {
    return (
      <div className="docked-console-minimized" onClick={() => setIsMinimized(false)}>
        <span className="console-indicator">
          {isConnected ? '🟢' : '🔴'} Mico Console
        </span>
      </div>
    );
  }

  return (
    <div className="docked-console">
      <div className="console-header">
        <div className="console-title">
          <span className="console-icon">⚡</span>
          <span>Mico Governance Console</span>
          <span className={`console-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Live' : '🔴 Offline'}
          </span>
        </div>
        <button className="console-minimize" onClick={() => setIsMinimized(true)}>
          −
        </button>
      </div>

      <div className="console-tabs">
        <button
          className={`console-tab ${activeTab === 'artifacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('artifacts')}
        >
          📜 Artifacts ({artifacts.length})
        </button>
        <button
          className={`console-tab ${activeTab === 'governance' ? 'active' : ''}`}
          onClick={() => setActiveTab('governance')}
        >
          ⚖️ Governance ({governanceRecords.length})
        </button>
        <button
          className={`console-tab ${activeTab === 'overrides' ? 'active' : ''}`}
          onClick={() => setActiveTab('overrides')}
        >
          ⚙️ Overrides ({overrides.length})
        </button>
        <button
          className={`console-tab ${activeTab === 'command' ? 'active' : ''}`}
          onClick={() => setActiveTab('command')}
        >
          ⚡ Commands
        </button>
      </div>

      <div className="console-body">
        {activeTab === 'artifacts' && (
          <div className="console-list">
            {artifacts.length === 0 && (
              <div className="console-empty">No artifacts yet...</div>
            )}
            {artifacts.map((artifact) => (
              <div key={artifact.id} className="console-item artifact-item">
                <div className="console-item-header">
                  <span className="artifact-icon">
                    {getAgentIcon(artifact.agent_type)}
                  </span>
                  <span className="artifact-agent">{artifact.agent_type}</span>
                  <span className="artifact-time">
                    {formatTimestamp(artifact.timestamp)}
                  </span>
                </div>
                <div className="console-item-body">
                  <div className="artifact-action">{artifact.action}</div>
                  {artifact.entity_type && (
                    <div className="artifact-entity">
                      {artifact.entity_type}
                      {artifact.entity_id && `: ${artifact.entity_id.substring(0, 8)}`}
                    </div>
                  )}
                  {artifact.authority_level && (
                    <span className={`authority-badge ${artifact.authority_level}`}>
                      {artifact.authority_level}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'governance' && (
          <div className="console-list">
            {governanceRecords.length === 0 && (
              <div className="console-empty">No governance records yet...</div>
            )}
            {governanceRecords.map((record) => (
              <div key={record.id} className="console-item governance-item">
                <div className="console-item-header">
                  <span className="governance-icon">
                    {getGovernanceIcon(record.action_type)}
                  </span>
                  <span className="governance-action">{record.action_type}</span>
                  <span className="governance-time">
                    {formatTimestamp(record.timestamp)}
                  </span>
                </div>
                <div className="console-item-body">
                  <div className="governance-justification">
                    {record.justification}
                  </div>
                  <div className="governance-authorizer">
                    by {record.authorized_by}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'overrides' && (
          <div className="console-list">
            {overrides.length === 0 && (
              <div className="console-empty">No active overrides...</div>
            )}
            {overrides.map((override, idx) => (
              <div key={idx} className="console-item override-item">
                <div className="console-item-header">
                  <span className="override-icon">⚙️</span>
                  <span className="override-key">{override.overrideKey}</span>
                  {override.expiresAt && (
                    <span className="override-expires">
                      ⏰ {formatTimestamp(override.expiresAt)}
                    </span>
                  )}
                </div>
                <div className="console-item-body">
                  <div className="override-type">{override.overrideType}</div>
                  <div className="override-value">
                    {JSON.stringify(override.overrideValue)}
                  </div>
                  {override.reason && (
                    <div className="override-reason">{override.reason}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'command' && (
          <div className="command-tab-content">
            <CommandPanel onCommandExecuted={handleCommandExecuted} />
          </div>
        )}
      </div>

      <div className="console-footer">
        <button className="console-refresh" onClick={loadArtifacts}>
          🔄 Refresh
        </button>
        <span className="console-count">
          {activeTab === 'artifacts' && `${artifacts.length} artifacts`}
          {activeTab === 'governance' && `${governanceRecords.length} records`}
          {activeTab === 'overrides' && `${overrides.length} overrides`}
        </span>
      </div>
    </div>
  );
}
