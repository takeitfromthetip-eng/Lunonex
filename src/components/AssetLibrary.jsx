/* eslint-disable */
import React, { useState, useEffect } from 'react';
import './AssetLibrary.css';

export default function AssetLibrary({ user }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const categories = [
    { id: 'all', name: 'All Assets', icon: '📁', count: 0 },
    { id: 'models', name: '3D Models', icon: '🎨', count: 0 },
    { id: 'textures', name: 'Textures', icon: '🖼️', count: 0 },
    { id: 'materials', name: 'Materials', icon: '✨', count: 0 },
    { id: 'animations', name: 'Animations', icon: '🎬', count: 0 },
    { id: 'sounds', name: 'Sound Effects', icon: '🔊', count: 0 },
    { id: 'music', name: 'Music', icon: '🎵', count: 0 },
    { id: 'videos', name: 'Video Clips', icon: '🎥', count: 0 },
    { id: 'scripts', name: 'Scripts', icon: '📜', count: 0 },
    { id: 'plugins', name: 'Plugins', icon: '🔌', count: 0 }
  ];

  const popularTags = [
    'Anime', 'Low-Poly', 'Realistic', 'Stylized', 'PBR', 
    'Rigged', 'Animated', 'Game-Ready', 'VR', 'AR',
    'Fantasy', 'Sci-Fi', 'Modern', 'Medieval', 'Character',
    'Environment', 'Props', 'UI', 'VFX', 'Shaders'
  ];

  useEffect(() => {
    fetchAssets();
  }, [selectedCategory, sortBy, selectedTags]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        category: selectedCategory,
        sort: sortBy,
        tags: selectedTags.join(',')
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assets?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const downloadAsset = async (asset) => {
    try {
      // Track download
      await fetch(`${import.meta.env.VITE_API_URL}/api/assets/${asset.id}/download`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Open download link
      window.open(asset.downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading asset:', error);
    }
  };

  const likeAsset = async (assetId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assets/${assetId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setAssets(prev => prev.map(asset => 
          asset.id === assetId 
            ? { ...asset, likes: asset.likes + 1, likedByUser: true }
            : asset
        ));
      }
    } catch (error) {
      console.error('Error liking asset:', error);
    }
  };

  const filteredAssets = assets.filter(asset => {
    if (search) {
      const searchLower = search.toLowerCase();
      return asset.name.toLowerCase().includes(searchLower) ||
             asset.description?.toLowerCase().includes(searchLower) ||
             asset.tags?.some(tag => tag.toLowerCase().includes(searchLower));
    }
    return true;
  });

  return (
    <div className="asset-library">
      <div className="library-header">
        <div className="header-top">
          <div>
            <h1>🎨 Asset Library</h1>
            <p>Curated collection of premium assets for creators</p>
          </div>
          <button className="upload-btn" onClick={() => setShowUpload(true)}>
            + Upload Asset
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search assets by name, description, or tags..."
          />
          <button className="search-btn">🔍</button>
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>View:</label>
            <div className="view-toggle">
              <button 
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
              >
                ⊞
              </button>
              <button 
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
              >
                ☰
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label>Sort:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
              <option value="downloads">Most Downloads</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        <div className="tags-filter">
          <div className="tags-label">Filter by tags:</div>
          <div className="tags">
            {popularTags.map(tag => (
              <button
                key={tag}
                className={`tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="library-content">
        <div className="categories-sidebar">
          <h3>Categories</h3>
          <div className="category-list">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                <span className="category-count">{category.count || assets.filter(a => a.category === category.id).length}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="assets-main">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading assets...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="no-assets">
              <p>No assets found</p>
              <button onClick={() => setShowUpload(true)}>Upload your first asset</button>
            </div>
          ) : (
            <div className={`assets-${viewMode}`}>
              {filteredAssets.map(asset => (
                <div key={asset.id} className="asset-card" onClick={() => setSelectedAsset(asset)}>
                  <div className="asset-thumbnail">
                    <img src={asset.thumbnail || '/placeholder.png'} alt={asset.name} />
                    <div className="asset-overlay">
                      <button 
                        className="quick-download"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadAsset(asset);
                        }}
                      >
                        ⬇️ Download
                      </button>
                    </div>
                  </div>
                  
                  <div className="asset-info">
                    <h3>{asset.name}</h3>
                    <p className="asset-creator">by {asset.creator?.username || 'Anonymous'}</p>
                    
                    {asset.description && (
                      <p className="asset-description">{asset.description.substring(0, 100)}...</p>
                    )}
                    
                    <div className="asset-tags">
                      {asset.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="tag-badge">{tag}</span>
                      ))}
                    </div>

                    <div className="asset-stats">
                      <span className="stat">
                        <button 
                          className={`like-btn ${asset.likedByUser ? 'liked' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            likeAsset(asset.id);
                          }}
                        >
                          ❤️
                        </button>
                        {asset.likes || 0}
                      </span>
                      <span className="stat">⬇️ {asset.downloads || 0}</span>
                      <span className="stat">👁️ {asset.views || 0}</span>
                    </div>

                    <div className="asset-meta">
                      <span className="file-size">{formatFileSize(asset.fileSize)}</span>
                      <span className="file-type">{asset.format}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="modal-overlay" onClick={() => setSelectedAsset(null)}>
          <div className="modal-content asset-detail" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedAsset(null)}>✕</button>
            
            <div className="detail-header">
              <img src={selectedAsset.thumbnail || '/placeholder.png'} alt={selectedAsset.name} />
              <div className="detail-info">
                <h2>{selectedAsset.name}</h2>
                <p className="creator">by {selectedAsset.creator?.username || 'Anonymous'}</p>
                
                <div className="detail-stats">
                  <span>❤️ {selectedAsset.likes || 0} likes</span>
                  <span>⬇️ {selectedAsset.downloads || 0} downloads</span>
                  <span>👁️ {selectedAsset.views || 0} views</span>
                </div>

                <button 
                  className="download-detail-btn"
                  onClick={() => downloadAsset(selectedAsset)}
                >
                  ⬇️ Download Asset
                </button>
              </div>
            </div>

            <div className="detail-body">
              <div className="detail-section">
                <h3>Description</h3>
                <p>{selectedAsset.description || 'No description available.'}</p>
              </div>

              <div className="detail-section">
                <h3>Details</h3>
                <div className="detail-grid">
                  <div><strong>Category:</strong> {selectedAsset.category}</div>
                  <div><strong>Format:</strong> {selectedAsset.format}</div>
                  <div><strong>File Size:</strong> {formatFileSize(selectedAsset.fileSize)}</div>
                  <div><strong>Uploaded:</strong> {new Date(selectedAsset.createdAt).toLocaleDateString()}</div>
                  <div><strong>License:</strong> {selectedAsset.license || 'Standard'}</div>
                  <div><strong>Version:</strong> {selectedAsset.version || '1.0'}</div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Tags</h3>
                <div className="detail-tags">
                  {selectedAsset.tags?.map(tag => (
                    <span key={tag} className="tag-badge">{tag}</span>
                  ))}
                </div>
              </div>

              {selectedAsset.compatibility && (
                <div className="detail-section">
                  <h3>Compatibility</h3>
                  <p>{selectedAsset.compatibility}</p>
                </div>
              )}

              {selectedAsset.changelog && (
                <div className="detail-section">
                  <h3>Changelog</h3>
                  <pre>{selectedAsset.changelog}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="modal-content upload-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowUpload(false)}>✕</button>
            <h2>Upload New Asset</h2>
            
            <form className="upload-form" onSubmit={(e) => {
              e.preventDefault();
              alert('Upload functionality would be implemented here');
              setShowUpload(false);
            }}>
              <div className="form-group">
                <label>Asset Name</label>
                <input type="text" placeholder="My Awesome Asset" required />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="Describe your asset..." rows="4" required></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select required>
                    <option value="">Select category</option>
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Format</label>
                  <input type="text" placeholder="e.g., .fbx, .blend, .mp3" required />
                </div>
              </div>

              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input type="text" placeholder="Anime, Low-Poly, Game-Ready" />
              </div>

              <div className="form-group">
                <label>Asset File</label>
                <input type="file" required />
              </div>

              <div className="form-group">
                <label>Thumbnail Image</label>
                <input type="file" accept="image/*" required />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowUpload(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Upload Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes) {
  if (!bytes) return 'Unknown';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}
