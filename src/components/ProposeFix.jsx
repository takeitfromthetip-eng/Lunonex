// src/components/ProposeFix.jsx - User fix proposal form
import React, { useState } from 'react';
import safeFetch from '../lib/safeFetch';

const ProposeFix = () => {
  const [repairType, setRepairType] = useState('flag');
  const [flagName, setFlagName] = useState('');
  const [flagActive, setFlagActive] = useState(true);
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiUrl = window.__VITE_API_URL__ || 'http://localhost:3001';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const proposedChange = repairType === 'flag'
        ? { flag_name: flagName, active: flagActive }
        : {};

      const response = await safeFetch(`${apiUrl}/userfix/auto/propose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repair_type: repairType,
          proposed_change: proposedChange,
          reason,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitted(true);
        alert(`Fix applied! Status: ${result.status}`);
      } else {
        alert(`Failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[ProposeFix] Failed:', error);
      alert('Failed to propose fix. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>✅ Fix Proposed!</h2>
        <p>Your suggestion has been auto-applied and is being monitored.</p>
        <button onClick={() => setSubmitted(false)}>Propose Another Fix</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🔧 Propose a Fix</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Fix Type:
            <select
              value={repairType}
              onChange={(e) => setRepairType(e.target.value)}
              style={{ marginLeft: '1rem', padding: '0.5rem' }}
            >
              <option value="flag">Feature Flag</option>
              <option value="content">Content</option>
              <option value="config">Configuration</option>
            </select>
          </label>
        </div>

        {repairType === 'flag' && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label>
                Flag Name:
                <input
                  type="text"
                  value={flagName}
                  onChange={(e) => setFlagName(e.target.value)}
                  required
                  placeholder="e.g., newProfileUI"
                  style={{ marginLeft: '1rem', padding: '0.5rem', width: '200px' }}
                />
              </label>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>
                <input
                  type="checkbox"
                  checked={flagActive}
                  onChange={(e) => setFlagActive(e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                Enable Flag
              </label>
            </div>
          </>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label>
            Reason:
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
              placeholder="Explain why this fix is needed..."
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Submitting...' : 'Propose Fix'}
        </button>
      </form>
    </div>
  );
};

export default ProposeFix;
