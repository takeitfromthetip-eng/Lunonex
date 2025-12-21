/* eslint-disable */
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'all',
    category: 'all'
  });
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      let searchResults = [];

      // Search users if type is 'all' or 'user'
      if (filters.type === 'all' || filters.type === 'user') {
        const { data: users } = await supabase
          .from('users')
          .select('id, username, email, created_at')
          .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
          .limit(20);
        
        if (users) {
          searchResults = [...searchResults, ...users.map(u => ({
            id: `user-${u.id}`,
            title: u.username || u.email,
            type: 'user',
            date: u.created_at?.split('T')[0],
            data: u
          }))];
        }
      }

      // Search content/posts if type is 'all' or 'content'
      if (filters.type === 'all' || filters.type === 'content') {
        // Note: This assumes you have a posts/content table
        // Modify based on your actual schema
        const { data: content } = await supabase
          .from('posts')
          .select('id, title, description, created_at, type')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(20);
        
        if (content) {
          searchResults = [...searchResults, ...content.map(c => ({
            id: `content-${c.id}`,
            title: c.title || 'Untitled',
            type: 'content',
            date: c.created_at?.split('T')[0],
            data: c
          }))];
        }
      }

      // Apply date range filter
      if (filters.dateRange !== 'all') {
        const now = new Date();
        const cutoffDate = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            cutoffDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            cutoffDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            cutoffDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            cutoffDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        searchResults = searchResults.filter(r => 
          new Date(r.date) >= cutoffDate
        );
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px' }}>
        🔍 Advanced Search
      </h3>

      {/* Search Input */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search content, users, tags..."
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '4px' }}>
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          >
            <option value="all">All Types</option>
            <option value="content">Content</option>
            <option value="user">Users</option>
            <option value="tag">Tags</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '4px' }}>
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '4px' }}>
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          >
            <option value="all">All Categories</option>
            <option value="art">Art</option>
            <option value="music">Music</option>
            <option value="video">Video</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSearch}
        style={{
          padding: '10px 24px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '1rem'
        }}
      >
        Search
      </button>

      {/* Results */}
      {results.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>
            Results ({results.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {results.map(result => (
              <div
                key={result.id}
                style={{
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{result.title}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Type: {result.type} • Date: {result.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
