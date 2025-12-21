/* eslint-disable */
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * MULTI-ACCOUNT MANAGEMENT
 * - Owner (polotuspossumus@gmail.com): Unlimited sub-accounts
 * - VIPs: Up to 3 sub-accounts
 * - Non-VIPs: Cannot create sub-accounts
 * - All payments from sub-accounts route to parent account
 */
export default function AccountManagement() {
  const [accounts, setAccounts] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountEmail, setNewAccountEmail] = useState('');
  const [error, setError] = useState('');
  const [canCreateMore, setCanCreateMore] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('ownerEmail') || '';
      const isOwnerCheck = userEmail === 'polotuspossumus@gmail.com';
      setIsOwner(isOwnerCheck);

      // Check VIP status
      try {
        const vipResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/user/vip-status`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const vipData = await vipResponse.json();
        setIsVip(vipData.isVip || isOwnerCheck);
      } catch (vipErr) {
        console.warn('VIP check failed, using owner check:', vipErr);
        setIsVip(isOwnerCheck);
      }

      // Load accounts
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/accounts/list`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        
        if (data.success) {
          setAccounts(data.accounts);
          setCurrentAccount(data.currentAccount);
          
          // Check if can create more
          const subAccountCount = data.accounts.filter(a => a.account_type === 'sub').length;
          if (isOwnerCheck) {
            setCanCreateMore(true); // Owner: unlimited
          } else if (vipData.isVip) {
            setCanCreateMore(subAccountCount < 3); // VIPs: max 3
          } else {
            setCanCreateMore(false); // Non-VIPs: none
          }
        } else {
          // No accounts yet - that's ok for first time
          setAccounts([]);
          setCanCreateMore(isOwnerCheck);
        }
      } catch (apiErr) {
        console.warn('Accounts API not ready yet:', apiErr);
        // Set defaults for owner
        if (isOwnerCheck) {
          setAccounts([]);
          setCanCreateMore(true);
        }
      }
    } catch (err) {
      console.error('Error loading accounts:', err);
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const createSubAccount = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/accounts/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          displayName: newAccountName,
          email: newAccountEmail
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setNewAccountName('');
        setNewAccountEmail('');
        await loadAccounts();
      } else {
        setError(data.message || 'Failed to create account');
      }
    } catch (err) {
      console.error('Error creating account:', err);
      setError('Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  const switchAccount = async (accountId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/accounts/switch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ accountId })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('currentAccountId', accountId);
        setCurrentAccount(accounts.find(a => a.id === accountId));
        window.location.reload(); // Refresh to load new account context
      }
    } catch (err) {
      console.error('Error switching account:', err);
      setError('Failed to switch account');
    }
  };

  const deleteAccount = async (accountId) => {
    if (!confirm('Are you sure you want to delete this sub-account? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/accounts/${accountId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      const data = await response.json();
      
      if (data.success) {
        await loadAccounts();
      } else {
        setError(data.message || 'Failed to delete account');
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account');
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading accounts...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Account Management</h1>
      
      {error && <div style={styles.error}>{error}</div>}

      {/* Current Account */}
      <div style={styles.currentAccount}>
        <h2 style={styles.subtitle}>Current Account</h2>
        {currentAccount && (
          <div style={styles.accountCard}>
            <div style={styles.accountIcon}>👤</div>
            <div style={styles.accountInfo}>
              <div style={styles.accountName}>{currentAccount.display_name}</div>
              <div style={styles.accountEmail}>{currentAccount.email}</div>
              <div style={styles.accountType}>
                {currentAccount.account_type === 'main' ? '🏠 Main Account' : '📎 Sub-Account'}
                {currentAccount.is_vip && ' • 💎 VIP'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account List */}
      <div style={styles.accountList}>
        <h2 style={styles.subtitle}>
          All Accounts ({accounts.length})
          {isOwner && ' (Owner: Unlimited)'}
          {!isOwner && isVip && ` (VIP: ${accounts.filter(a => a.account_type === 'sub').length}/3)`}
        </h2>
        
        {accounts.map(account => (
          <div 
            key={account.id} 
            style={{
              ...styles.accountCard,
              ...(currentAccount?.id === account.id ? styles.accountCardActive : {})
            }}
          >
            <div style={styles.accountIcon}>
              {account.account_type === 'main' ? '🏠' : '📎'}
            </div>
            <div style={styles.accountInfo}>
              <div style={styles.accountName}>{account.display_name}</div>
              <div style={styles.accountEmail}>{account.email}</div>
              <div style={styles.accountMeta}>
                {account.account_type === 'main' ? 'Main Account' : 'Sub-Account'}
                {account.is_vip && ' • VIP'}
              </div>
            </div>
            <div style={styles.accountActions}>
              {currentAccount?.id !== account.id && (
                <button 
                  onClick={() => switchAccount(account.id)}
                  style={styles.buttonSwitch}
                >
                  Switch
                </button>
              )}
              {account.account_type === 'sub' && (
                <button 
                  onClick={() => deleteAccount(account.id)}
                  style={styles.buttonDelete}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create New Account */}
      {(isOwner || isVip) && (
        <div style={styles.createSection}>
          <h2 style={styles.subtitle}>Create New Sub-Account</h2>
          
          {!canCreateMore && !isOwner && (
            <div style={styles.limitMessage}>
              ⚠️ You've reached your limit of 3 sub-accounts. Delete an existing one to create a new one.
            </div>
          )}
          
          {canCreateMore && (
            <form onSubmit={createSubAccount} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Display Name</label>
                <input
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="e.g., My Gaming Account"
                  required
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Email (for notifications)</label>
                <input
                  type="email"
                  value={newAccountEmail}
                  onChange={(e) => setNewAccountEmail(e.target.value)}
                  placeholder="e.g., gaming@example.com"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formNote}>
                💡 All payments from this sub-account will route to your main account's wallet.
              </div>
              
              <button 
                type="submit" 
                disabled={creating}
                style={styles.buttonCreate}
              >
                {creating ? 'Creating...' : '+ Create Sub-Account'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Non-VIP Message */}
      {!isOwner && !isVip && (
        <div style={styles.upgradeMessage}>
          <h3 style={styles.upgradeTitle}>💎 Upgrade to VIP</h3>
          <p>VIP members can create up to 3 sub-accounts for different personas, content types, or brands.</p>
          <button style={styles.buttonUpgrade}>
            Upgrade to VIP - $1000 One-Time
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
    color: '#fff'
  },
  subtitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#fff'
  },
  loading: {
    padding: '3rem',
    textAlign: 'center',
    color: '#888'
  },
  error: {
    padding: '1rem',
    backgroundColor: '#ff4444',
    color: '#fff',
    borderRadius: '8px',
    marginBottom: '1rem'
  },
  currentAccount: {
    marginBottom: '2rem'
  },
  accountList: {
    marginBottom: '2rem'
  },
  accountCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    border: '2px solid transparent',
    transition: 'border-color 0.2s'
  },
  accountCardActive: {
    borderColor: '#00ff00'
  },
  accountIcon: {
    fontSize: '2rem',
    marginRight: '1rem'
  },
  accountInfo: {
    flex: 1
  },
  accountName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem'
  },
  accountEmail: {
    fontSize: '0.9rem',
    color: '#888',
    marginBottom: '0.25rem'
  },
  accountType: {
    fontSize: '0.85rem',
    color: '#aaa'
  },
  accountMeta: {
    fontSize: '0.85rem',
    color: '#aaa'
  },
  accountActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  buttonSwitch: {
    padding: '0.5rem 1rem',
    backgroundColor: '#0066ff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  buttonDelete: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ff4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  createSection: {
    marginBottom: '2rem'
  },
  limitMessage: {
    padding: '1rem',
    backgroundColor: '#332200',
    color: '#ffaa00',
    borderRadius: '8px',
    marginBottom: '1rem'
  },
  form: {
    backgroundColor: '#1a1a1a',
    padding: '1.5rem',
    borderRadius: '8px'
  },
  formGroup: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#aaa',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none'
  },
  formNote: {
    padding: '0.75rem',
    backgroundColor: '#003366',
    color: '#66ccff',
    borderRadius: '6px',
    fontSize: '0.9rem',
    marginBottom: '1rem'
  },
  buttonCreate: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#00ff00',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600'
  },
  upgradeMessage: {
    padding: '2rem',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    textAlign: 'center'
  },
  upgradeTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#fff'
  },
  buttonUpgrade: {
    padding: '1rem 2rem',
    backgroundColor: '#ffaa00',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: '600',
    marginTop: '1rem'
  }
};
