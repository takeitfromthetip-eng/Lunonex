import React, { useState, useEffect } from 'react';
import './CommandPanelAdvanced.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const OWNER_EMAIL = 'polotuspossumus@gmail.com';

const CommandPanelAdvanced = () => {
  const [token, setToken] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [policySnapshot, setPolicySnapshot] = useState(null);

  // Command form state
  const [command, setCommand] = useState('setThreshold');
  const [key, setKey] = useState('violence');
  const [value, setValue] = useState('0.75');
  const [justification, setJustification] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Authenticate on mount
  useEffect(() => {
    authenticateOwner();
    fetchPolicySnapshot();
  }, []);

  const authenticateOwner = async () => {
    try {
      const ownerEmail = localStorage.getItem('ownerEmail');
      if (ownerEmail !== OWNER_EMAIL) {
        setAuthError('⚠️ Owner access required');
        return;
      }

      const res = await fetch(`${API_BASE}/api/auth/owner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ownerEmail }),
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setAuthError(null);
      } else {
        setAuthError('Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setAuthError('Authentication error');
    }
  };

  const fetchPolicySnapshot = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/governance/policy`);
      if (res.ok) {
        const data = await res.json();
        setPolicySnapshot(data);
      }
    } catch (error) {
      console.error('Failed to fetch policy:', error);
    }
  };

  const executeCommand = async () => {
    if (!token) {
      setResult({ error: 'Not authenticated' });
      return;
    }

    if (!justification.trim()) {
      setResult({ error: 'Justification required' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/governance/override`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          command,
          key,
          value,
          justification,
        }),
      });

      const data = await res.json();
      setResult(data);

      if (res.ok) {
        // Refresh policy snapshot
        fetchPolicySnapshot();
      }
    } catch (error) {
      console.error('Command error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Preset buttons for common operations
  const presets = [
    {
      label: 'Strict Violence',
      command: 'setThreshold',
      key: 'violence',
      value: '0.85',
      justification: 'Increasing violence detection threshold for stricter moderation',
    },
    {
      label: 'Lenient NSFW',
      command: 'setThreshold',
      key: 'nsfw',
      value: '0.60',
      justification: 'Adjusting NSFW threshold for adult content platform',
    },
    {
      label: 'Max CSAM Detection',
      command: 'setThreshold',
      key: 'csam',
      value: '0.20',
      justification: 'Maximum CSAM detection sensitivity',
    },
    {
      label: 'Daily Upload Cap: 200',
      command: 'setCap',
      key: 'uploadPerDay',
      value: '200',
      justification: 'Increasing daily upload limit for verified creators',
    },
    {
      label: 'Enable Guard Mode',
      command: 'setToggle',
      key: 'guardMode',
      value: 'true',
      justification: 'Activating enhanced security mode',
    },
  ];

  const applyPreset = (preset) => {
    setCommand(preset.command);
    setKey(preset.key);
    setValue(preset.value);
    setJustification(preset.justification);
  };

  if (authError) {
    return (
      <div className="command-panel-advanced">
        <div className="auth-error">{authError}</div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="command-panel-advanced">
        <div className="loading">Authenticating...</div>
      </div>
    );
  }

  return (
    <div className="command-panel-advanced">
      <div className="panel-header">
        <h2>🎛️ Command Panel Advanced</h2>
        <div className="authority-badge">
          <span className="badge-icon">🔐</span>
          <span className="badge-text">Owner Authority Active</span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="presets-section">
        <h3>Quick Presets</h3>
        <div className="preset-buttons">
          {presets.map((preset, index) => (
            <button
              key={index}
              onClick={() => applyPreset(preset)}
              className="preset-btn"
              disabled={loading}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Command Form */}
      <div className="command-form">
        <h3>Manual Command</h3>

        <div className="form-row">
          <label>Command:</label>
          <select value={command} onChange={(e) => setCommand(e.target.value)}>
            <option value="setThreshold">setThreshold</option>
            <option value="setCap">setCap</option>
            <option value="setToggle">setToggle</option>
          </select>
        </div>

        <div className="form-row">
          <label>Key:</label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="e.g. violence, nsfw, uploadPerDay"
          />
        </div>

        <div className="form-row">
          <label>Value:</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 0.75, 100, true"
          />
        </div>

        <div className="form-row">
          <label>Justification:</label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Reason for this policy change..."
            rows={3}
          />
        </div>

        <button
          onClick={executeCommand}
          disabled={loading || !justification.trim()}
          className="execute-btn"
        >
          {loading ? 'Executing...' : '⚡ Execute Command'}
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div className={`result-box ${result.error ? 'error' : 'success'}`}>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {/* Live Policy Snapshot */}
      {policySnapshot && (
        <div className="policy-snapshot">
          <h3>📊 Current Policy State (v{policySnapshot.version})</h3>

          <div className="snapshot-section">
            <h4>Thresholds</h4>
            <div className="snapshot-grid">
              {Object.entries(policySnapshot.thresholds).map(([k, v]) => (
                <div key={k} className="snapshot-item">
                  <span className="item-key">{k}:</span>
                  <span className="item-value">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="snapshot-section">
            <h4>Caps</h4>
            <div className="snapshot-grid">
              {Object.entries(policySnapshot.caps).map(([k, v]) => (
                <div key={k} className="snapshot-item">
                  <span className="item-key">{k}:</span>
                  <span className="item-value">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="snapshot-section">
            <h4>Toggles</h4>
            <div className="snapshot-grid">
              {Object.entries(policySnapshot.toggles).map(([k, v]) => (
                <div key={k} className="snapshot-item">
                  <span className="item-key">{k}:</span>
                  <span className={`item-value ${v ? 'toggle-on' : 'toggle-off'}`}>
                    {v ? '✅ ON' : '❌ OFF'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandPanelAdvanced;
