// src/components/ReportBug.jsx - User bug report form
import React, { useState } from 'react';
import safeFetch from '../lib/safeFetch';

const ReportBug = () => {
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('low');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiUrl = globalThis.window?.__VITE_API_URL__ || 'http://localhost:3001';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await safeFetch(`${apiUrl}/userfix/feedback/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: 'bug',
          message,
          page_url: globalThis.location.href,
          severity,
          metadata: {
            userAgent: navigator.userAgent,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
          },
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setMessage('');
      }
    } catch (error) {
      console.error('[ReportBug] Failed:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>✅ Thank you!</h2>
        <p>Your report has been submitted. We'll look into it!</p>
        <button onClick={() => setSubmitted(false)}>Report Another Issue</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🐛 Report a Bug</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="bug-description">
            Describe the issue:
            <textarea
              id="bug-description"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label>
            Severity:
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              style={{ marginLeft: '1rem', padding: '0.5rem' }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportBug;
