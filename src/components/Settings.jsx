/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * User Settings - Profile customization
 * Allows users to set username, display name, and choose which to show
 */
export function Settings({ userId }) {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [useRealName, setUseRealName] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [usernameError, setUsernameError] = useState('');

  useEffect(() => {
    loadUserSettings();
  }, [userId]);

  async function loadUserSettings() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setUser(data);
      setUsername(data.username || '');
      setDisplayName(data.display_name || '');
      setUseRealName(data.use_real_name || false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage('Error loading settings');
    } finally {
      setLoading(false);
    }
  }

  async function checkUsernameAvailable(newUsername) {
    if (!newUsername || newUsername === user.username) {
      setUsernameError('');
      return true;
    }

    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', newUsername)
      .single();

    if (data) {
      setUsernameError('Username already taken');
      return false;
    }

    setUsernameError('');
    return true;
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');

    try {
      // Validate username
      if (username.length < 3) {
        setMessage('Username must be at least 3 characters');
        setSaving(false);
        return;
      }

      // Check availability
      const available = await checkUsernameAvailable(username);
      if (!available) {
        setSaving(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          username: username.toLowerCase().trim(),
          display_name: displayName.trim() || username,
          use_real_name: useRealName
        })
        .eq('id', userId);

      if (error) throw error;

      setMessage('✅ Settings saved!');
      setTimeout(() => setMessage(''), 3000);
      await loadUserSettings(); // Reload to confirm
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('❌ Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={styles.container}>Loading settings...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚙️ Settings</h1>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Profile Display</h2>
        
        <div style={styles.section}>
          <label style={styles.label}>
            Username (public identifier)
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                checkUsernameAvailable(e.target.value);
              }}
              placeholder="Choose a username"
              style={styles.input}
              pattern="[a-zA-Z0-9_-]+"
            />
            {usernameError && (
              <span style={styles.error}>{usernameError}</span>
            )}
            <span style={styles.hint}>
              3+ characters, letters/numbers/underscore/dash only
            </span>
          </label>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>
            Display Name (real name or nickname)
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your real name or preferred name"
              style={styles.input}
            />
            <span style={styles.hint}>
              This can include spaces and special characters
            </span>
          </label>
        </div>

        <div style={styles.section}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={useRealName}
              onChange={(e) => setUseRealName(e.target.checked)}
              style={styles.checkbox}
            />
            <div>
              <div style={styles.checkboxText}>
                Show display name instead of username
              </div>
              <div style={styles.checkboxHint}>
                When enabled, others will see "{displayName || 'your display name'}" 
                instead of "@{username || 'username'}"
              </div>
            </div>
          </label>
        </div>

        <div style={styles.preview}>
          <strong>Preview:</strong> Others will see you as{' '}
          <span style={styles.previewName}>
            {useRealName ? (displayName || username) : `@${username}`}
          </span>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !!usernameError}
          style={{
            ...styles.button,
            ...(saving || usernameError ? styles.buttonDisabled : {})
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>

        {message && (
          <div style={{
            ...styles.message,
            ...(message.includes('✅') ? styles.messageSuccess : styles.messageError)
          }}>
            {message}
          </div>
        )}
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Account Info</h2>
        <div style={styles.info}>
          <div><strong>Email:</strong> {user?.email}</div>
          <div><strong>User ID:</strong> {userId}</div>
          <div><strong>Payment Tier:</strong> {user?.payment_tier || 'FREE'}</div>
          <div><strong>Member Since:</strong> {new Date(user?.created_at).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '30px',
    color: '#667eea'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  cardTitle: {
    fontSize: '1.5rem',
    marginBottom: '20px',
    color: '#333'
  },
  section: {
    marginBottom: '25px'
  },
  label: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    marginTop: '8px',
    boxSizing: 'border-box'
  },
  hint: {
    display: 'block',
    fontSize: '0.85rem',
    color: '#666',
    marginTop: '4px'
  },
  error: {
    display: 'block',
    fontSize: '0.85rem',
    color: '#e53e3e',
    marginTop: '4px',
    fontWeight: '600'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    cursor: 'pointer'
  },
  checkbox: {
    width: '20px',
    height: '20px',
    marginTop: '2px',
    cursor: 'pointer'
  },
  checkboxText: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333'
  },
  checkboxHint: {
    fontSize: '0.85rem',
    color: '#666',
    marginTop: '4px'
  },
  preview: {
    background: '#f7fafc',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '0.95rem',
    color: '#333'
  },
  previewName: {
    color: '#667eea',
    fontWeight: '700',
    fontSize: '1.1rem'
  },
  button: {
    width: '100%',
    padding: '16px',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  buttonDisabled: {
    background: '#ccc',
    cursor: 'not-allowed'
  },
  message: {
    marginTop: '16px',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '600'
  },
  messageSuccess: {
    background: '#c6f6d5',
    color: '#22543d'
  },
  messageError: {
    background: '#fed7d7',
    color: '#742a2a'
  },
  info: {
    fontSize: '0.95rem',
    lineHeight: '1.8',
    color: '#555'
  }
};

export default Settings;
