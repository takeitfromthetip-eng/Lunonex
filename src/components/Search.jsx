import React, { useState, useEffect } from 'react';
import './Search.css';

function Search({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all'); // all, creators, artworks, tags
  const [filters, setFilters] = useState({
    nsfw: 'all', // all, sfw, nsfw
    sortBy: 'relevance', // relevance, popular, recent
    category: 'all', // all, anime, manga, original, fanart, commission
  });
  const [results, setResults] = useState({
    creators: [],
    artworks: [],
    tags: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      performSearch();
    } else {
      setResults({ creators: [], artworks: [], tags: [] });
    }
  }, [searchQuery, searchType, filters]);

  const performSearch = async () => {
    setIsLoading(true);

    // Firestore queries can be implemented here for live search
    // For now, using mock data

    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

    const mockCreators = [
      {
        id: '1',
        username: 'SakuraArtist',
        displayName: 'Sakura',
        avatar: null,
        followers: 15200,
        artworkCount: 342,
        verified: true,
        badges: ['verified', 'pro']
      },
      {
        id: '2',
        username: 'MangaMaster',
        displayName: 'Manga Master',
        avatar: null,
        followers: 8900,
        artworkCount: 189,
        verified: false,
        badges: ['top_seller']
      },
    ];

    const mockArtworks = [
      {
        id: '1',
        title: 'Sunset Dreams',
        imageUrl: null,
        creator: 'SakuraArtist',
        creatorId: '1',
        likes: 1234,
        views: 45678,
        nsfw: false,
        tags: ['anime', 'original', 'sunset'],
        category: 'anime'
      },
      {
        id: '2',
        title: 'Character Study',
        imageUrl: null,
        creator: 'MangaMaster',
        creatorId: '2',
        likes: 892,
        views: 12340,
        nsfw: false,
        tags: ['manga', 'sketch', 'character'],
        category: 'manga'
      },
    ];

    const mockTags = [
      { name: 'anime', count: 12450 },
      { name: 'manga', count: 8930 },
      { name: 'original', count: 6720 },
      { name: 'fanart', count: 15200 },
    ];

    // Filter by search query
    const filteredCreators = mockCreators.filter(c =>
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredArtworks = mockArtworks.filter(a =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredTags = mockTags.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply NSFW filter
    const nsfwFilteredArtworks = filters.nsfw === 'all'
      ? filteredArtworks
      : filteredArtworks.filter(a =>
        filters.nsfw === 'nsfw' ? a.nsfw : !a.nsfw
      );

    // Apply category filter
    const categoryFilteredArtworks = filters.category === 'all'
      ? nsfwFilteredArtworks
      : nsfwFilteredArtworks.filter(a => a.category === filters.category);

    // Apply sorting
    let sortedArtworks = [...categoryFilteredArtworks];
    if (filters.sortBy === 'popular') {
      sortedArtworks.sort((a, b) => b.likes - a.likes);
    } else if (filters.sortBy === 'recent') {
      sortedArtworks.sort((a, b) => b.id - a.id); // Assuming higher ID = newer
    }

    setResults({
      creators: filteredCreators,
      artworks: sortedArtworks,
      tags: filteredTags,
    });

    setIsLoading(false);

    if (onSearch) {
      onSearch({
        query: searchQuery,
        type: searchType,
        results: {
          creators: filteredCreators,
          artworks: sortedArtworks,
          tags: filteredTags,
        }
      });
    }
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults({ creators: [], artworks: [], tags: [] });
  };

  const totalResults = results.creators.length + results.artworks.length + results.tags.length;

  return (
    <div className="search-container">
      <div className="search-header">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search creators, artworks, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={clearSearch}>
              ✕
            </button>
          )}
          <button className="search-button" onClick={performSearch}>
            🔍
          </button>
        </div>

        <div className="search-type-selector">
          <button
            className={searchType === 'all' ? 'active' : ''}
            onClick={() => setSearchType('all')}
          >
            All
          </button>
          <button
            className={searchType === 'creators' ? 'active' : ''}
            onClick={() => setSearchType('creators')}
          >
            Creators ({results.creators.length})
          </button>
          <button
            className={searchType === 'artworks' ? 'active' : ''}
            onClick={() => setSearchType('artworks')}
          >
            Artworks ({results.artworks.length})
          </button>
          <button
            className={searchType === 'tags' ? 'active' : ''}
            onClick={() => setSearchType('tags')}
          >
            Tags ({results.tags.length})
          </button>
        </div>
      </div>

      <div className="search-filters">
        <div className="filter-group">
          <label>Content:</label>
          <select
            value={filters.nsfw}
            onChange={(e) => handleFilterChange('nsfw', e.target.value)}
          >
            <option value="all">All Content</option>
            <option value="sfw">SFW Only</option>
            <option value="nsfw">NSFW Only</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="anime">Anime</option>
            <option value="manga">Manga</option>
            <option value="original">Original</option>
            <option value="fanart">Fanart</option>
            <option value="commission">Commission</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By:</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="relevance">Relevance</option>
            <option value="popular">Most Popular</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="search-loading">
          <div className="loading-spinner"></div>
          <p>Searching...</p>
        </div>
      )}

      {!isLoading && searchQuery && (
        <div className="search-results">
          <div className="results-header">
            <h2>
              {totalResults} result{totalResults !== 1 ? 's' : ''}
              {searchQuery && ` for "${searchQuery}"`}
            </h2>
          </div>

          {(searchType === 'all' || searchType === 'creators') && results.creators.length > 0 && (
            <div className="results-section">
              <h3>Creators</h3>
              <div className="creator-results">
                {results.creators.map(creator => (
                  <div key={creator.id} className="creator-card">
                    <div className="creator-avatar">
                      {creator.avatar ? (
                        <img src={creator.avatar} alt={creator.username} />
                      ) : (
                        <div className="avatar-placeholder">
                          {creator.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="creator-info">
                      <div className="creator-name">
                        {creator.displayName}
                        {creator.verified && <span className="verified-badge">✓</span>}
                      </div>
                      <div className="creator-username">@{creator.username}</div>
                      <div className="creator-stats">
                        <span>👥 {creator.followers.toLocaleString()} followers</span>
                        <span>🎨 {creator.artworkCount} artworks</span>
                      </div>
                      {creator.badges && creator.badges.length > 0 && (
                        <div className="creator-badges">
                          {creator.badges.map(badge => (
                            <span key={badge} className={`badge ${badge}`}>
                              {badge === 'verified' && '✓'}
                              {badge === 'pro' && '⭐'}
                              {badge === 'top_seller' && '🏆'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button className="view-profile-button">View Profile</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(searchType === 'all' || searchType === 'artworks') && results.artworks.length > 0 && (
            <div className="results-section">
              <h3>Artworks</h3>
              <div className="artwork-results">
                {results.artworks.map(artwork => (
                  <div key={artwork.id} className="artwork-card">
                    <div className="artwork-image">
                      {artwork.imageUrl ? (
                        <img src={artwork.imageUrl} alt={artwork.title} />
                      ) : (
                        <div className="image-placeholder">🖼️</div>
                      )}
                      {artwork.nsfw && <div className="nsfw-badge">🔞 NSFW</div>}
                    </div>
                    <div className="artwork-info">
                      <h4>{artwork.title}</h4>
                      <p className="artwork-creator">by {artwork.creator}</p>
                      <div className="artwork-stats">
                        <span>❤️ {artwork.likes.toLocaleString()}</span>
                        <span>👁️ {artwork.views.toLocaleString()}</span>
                      </div>
                      <div className="artwork-tags">
                        {artwork.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(searchType === 'all' || searchType === 'tags') && results.tags.length > 0 && (
            <div className="results-section">
              <h3>Tags</h3>
              <div className="tag-results">
                {results.tags.map(tag => (
                  <div key={tag.name} className="tag-card">
                    <span className="tag-name">#{tag.name}</span>
                    <span className="tag-count">{tag.count.toLocaleString()} posts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalResults === 0 && (
            <div className="no-results">
              <p>No results found for "{searchQuery}"</p>
              <p>Try different keywords or check your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Search;
