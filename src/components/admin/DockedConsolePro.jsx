import React, { useState, useEffect, useRef } from 'react';
import './DockedConsolePro.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const DockedConsolePro = () => {
  const [artifacts, setArtifacts] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [connected, setConnected] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const consoleEndRef = useRef(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    connectToStream();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (autoScroll && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [artifacts, autoScroll]);

  const connectToStream = () => {
    try {
      const eventSource = new EventSource(`${API_BASE}/api/artifacts/stream`);

      eventSource.onopen = () => {
        console.log('📡 Connected to artifact stream');
        setConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const artifact = JSON.parse(event.data);
          setArtifacts((prev) => [...prev, artifact]);
        } catch (error) {
          console.error('Failed to parse artifact:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        setConnected(false);

        // Auto-reconnect after 3 seconds
        setTimeout(() => {
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
          }
          connectToStream();
        }, 3000);
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('Failed to connect to stream:', error);
      setConnected(false);
    }
  };

  const clearConsole = () => {
    setArtifacts([]);
  };

  const filterArtifacts = () => {
    let filtered = artifacts;

    // Filter by type
    if (filter !== 'ALL') {
      if (filter === '⚠') {
        // Show only warnings and critical severity
        filtered = filtered.filter(
          (a) => a.severity === 'warning' || a.severity === 'critical'
        );
      } else {
        filtered = filtered.filter((a) => a.type === filter);
      }
    }

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.message.toLowerCase().includes(searchLower) ||
          a.type.toLowerCase().includes(searchLower) ||
          (a.data && JSON.stringify(a.data).toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📌';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'OVERRIDE':
        return '#f59e0b';
      case 'SENTINEL':
        return '#ef4444';
      case 'POLICY':
        return '#8b5cf6';
      case 'NOTARY':
        return '#3b82f6';
      case 'QUEUE':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const filteredArtifacts = filterArtifacts();

  return (
    <div className="docked-console-pro">
      {/* Header */}
      <div className="console-header">
        <div className="header-left">
          <h3>📡 Artifact Stream</h3>
          <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {connected ? 'Live' : 'Reconnecting...'}
            </span>
          </div>
        </div>

        <div className="header-right">
          <span className="artifact-count">
            {filteredArtifacts.length} / {artifacts.length}
          </span>
          <button onClick={clearConsole} className="clear-btn" title="Clear console">
            🗑️
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="console-controls">
        <div className="filter-group">
          <label>Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">ALL</option>
            <option value="OVERRIDE">OVERRIDE</option>
            <option value="SENTINEL">SENTINEL</option>
            <option value="POLICY">POLICY</option>
            <option value="NOTARY">NOTARY</option>
            <option value="QUEUE">QUEUE</option>
            <option value="⚠">⚠ Warnings</option>
          </select>
        </div>

        <div className="search-group">
          <label>Search:</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search artifacts..."
          />
        </div>

        <div className="auto-scroll-group">
          <label>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Auto-scroll
          </label>
        </div>
      </div>

      {/* Artifact List */}
      <div className="artifact-list">
        {filteredArtifacts.length === 0 ? (
          <div className="no-artifacts">
            {artifacts.length === 0
              ? 'Waiting for artifacts...'
              : 'No artifacts match your filters'}
          </div>
        ) : (
          filteredArtifacts.map((artifact, index) => (
            <div
              key={index}
              className={`artifact-item severity-${artifact.severity || 'info'}`}
            >
              <div className="artifact-header">
                <span className="artifact-timestamp">
                  {formatTimestamp(artifact.timestamp)}
                </span>
                <span
                  className="artifact-type"
                  style={{ backgroundColor: getTypeColor(artifact.type) }}
                >
                  {artifact.type}
                </span>
                {artifact.severity && (
                  <span className="artifact-severity">
                    {getSeverityIcon(artifact.severity)}
                  </span>
                )}
              </div>

              <div className="artifact-message">{artifact.message}</div>

              {artifact.data && (
                <details className="artifact-data">
                  <summary>View Data</summary>
                  <pre>{JSON.stringify(artifact.data, null, 2)}</pre>
                </details>
              )}

              {artifact.hash && (
                <div className="artifact-hash" title={artifact.hash}>
                  Hash: {artifact.hash}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
};

export default DockedConsolePro;
