/* eslint-disable */
// src/admin/BugFixerPanel.tsx - Admin bug fixer control panel
import React, { useState } from 'react';
import safeFetch from '../lib/safeFetch';

const BugFixerPanel: React.FC = () => {
  const [token, setToken] = useState(localStorage.getItem('bugfixer_token') || '');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:3002';

  const generateHMAC = async (payload: any) => {
    const timestamp = Date.now().toString();
    const nonce = Math.random().toString(36).substr(2, 9);
    
    // Note: In production, compute HMAC server-side via proxy
    // This is simplified for demonstration
    return { timestamp, nonce, signature: 'client-side-hmac-placeholder' };
  };

  const callEndpoint = async (endpoint: string, method = 'POST', body?: any) => {
    setLoading(true);
    setResult(null);

    try {
      const { timestamp, nonce, signature } = await generateHMAC(body || {});

      const response = await safeFetch(`${apiUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-bugfixer-token': token,
          'x-bugfixer-timestamp': timestamp,
          'x-bugfixer-nonce': nonce,
          'x-bugfixer-signature': signature,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const saveToken = () => {
    localStorage.setItem('bugfixer_token', token);
    alert('Token saved!');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🩹 Bug Fixer Control Panel</h1>

      {/* Token Input */}
      <div style={{ marginBottom: '2rem' }}>
        <label>
          Admin Token:
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            style={{ marginLeft: '1rem', padding: '0.5rem', width: '300px' }}
          />
        </label>
        <button onClick={saveToken} style={{ marginLeft: '1rem', padding: '0.5rem' }}>
          Save Token
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => callEndpoint('/bugfixer/diagnostics/run')}>
          🔍 Run Diagnostics
        </button>
        <button onClick={() => callEndpoint('/bugfixer/selftest')}>
          🧪 Run Self-Test
        </button>
        <button onClick={() => callEndpoint('/bugfixer/heal')}>
          💊 Full Heal
        </button>
        <button onClick={() => callEndpoint('/bugfixer/remediation', 'POST', { action: 'restart-app' })}>
          🔄 Restart App
        </button>
        <button onClick={() => callEndpoint('/bugfixer/artifacts/upload')}>
          📦 Upload Artifacts
        </button>
        <button onClick={() => callEndpoint('/bugfixer/batch/full-heal')}>
          ⚡ Batch Full Heal
        </button>
        <button onClick={() => callEndpoint('/bugfixer/flags/pause', 'POST', { flags: ['newProfileUI'] })}>
          ⏸️ Pause Risky Flags
        </button>
        <button onClick={() => callEndpoint('/bugfixer/rollback/undo', 'POST', { target: 'previous' })}>
          ↩️ Request Rollback
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          Loading...
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Result:</h3>
          <pre style={{
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            padding: '1rem',
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '500px',
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default BugFixerPanel;
