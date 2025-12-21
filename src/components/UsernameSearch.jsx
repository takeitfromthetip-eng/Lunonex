import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Username Search - Find creators by @username
 * Autocomplete search with profile preview
 */
export function UsernameSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  async function searchUsername(searchQuery) {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const cleanQuery = searchQuery.replace('@', '').toLowerCase();
      
      const { data, error } = await supabase
        .from('users')
        .select('id, username, display_name, use_real_name, email, payment_tier')
        .or(`username.ilike.%${cleanQuery}%,display_name.ilike.%${cleanQuery}%`)
        .limit(10);

      if (error) throw error;

      setResults(data || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e) {
    const value = e.target.value;
    setQuery(value);
    searchUsername(value);
  }

  function handleSelect(user) {
    if (onSelect) {
      onSelect(user);
    }
    setQuery('');
    setShowResults(false);
    setResults([]);
  }

  function getDisplayName(user) {
    if (user.use_real_name) {
      return user.display_name || user.username;
    }
    return `@${user.username}`;
  }

  function getTierBadge(tier) {
    const badges = {
      OWNER: '👑',
      VIP: '⭐',
      PRO: '💎',
      CREATOR: '✨',
      FREE: ''
    };
    return badges[tier] || '';
  }

  return (
    <div style={styles.container}>
      <div style={styles.searchBox}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder="Search @username or name..."
          style={styles.input}
        />
        {loading && <span style={styles.loader}>⏳</span>}
      </div>

      {showResults && results.length > 0 && (
        <div style={styles.results}>
          {results.map(user => (
            <div
              key={user.id}
              style={styles.resultItem}
              onClick={() => handleSelect(user)}
            >
              <div style={styles.userInfo}>
                <span style={styles.tier}>{getTierBadge(user.payment_tier)}</span>
                <div>
                  <div style={styles.displayName}>
                    {getDisplayName(user)}
                  </div>
                  {!user.use_real_name && user.display_name && (
                    <div style={styles.realName}>{user.display_name}</div>
                  )}
                  {user.use_real_name && (
                    <div style={styles.username}>@{user.username}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && query.length >= 2 && !loading && (
        <div style={styles.noResults}>
          No users found for "{query}"
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: '400px'
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '24px',
    padding: '8px 16px',
    transition: 'border-color 0.2s'
  },
  searchIcon: {
    fontSize: '1.2rem',
    marginRight: '8px'
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    padding: '4px'
  },
  loader: {
    fontSize: '1rem',
    marginLeft: '8px'
  },
  results: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    marginTop: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxHeight: '400px',
    overflowY: 'auto',
    zIndex: 1000
  },
  resultItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background 0.2s'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  tier: {
    fontSize: '1.5rem'
  },
  displayName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333'
  },
  realName: {
    fontSize: '0.85rem',
    color: '#666',
    marginTop: '2px'
  },
  username: {
    fontSize: '0.85rem',
    color: '#667eea',
    marginTop: '2px'
  },
  noResults: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    marginTop: '8px',
    padding: '16px',
    textAlign: 'center',
    color: '#999',
    fontSize: '0.9rem'
  }
};

export default UsernameSearch;
