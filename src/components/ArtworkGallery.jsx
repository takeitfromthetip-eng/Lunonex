/* eslint-disable */
// ARTWORK GALLERY - Display uploaded images with metadata

import React, { useState, useEffect } from 'react';
import './ArtworkGallery.css';

export function ArtworkGallery({ userId, artworks = [], onEdit, onDelete, isOwner = false }) {
  const [filter, setFilter] = useState('all'); // all, sfw, nsfw
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, popular
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [filteredArtworks, setFilteredArtworks] = useState([]);

  useEffect(() => {
    let filtered = [...artworks];

    // Filter by content rating
    if (filter === 'sfw') {
      filtered = filtered.filter(art => !art.isNSFW);
    } else if (filter === 'nsfw') {
      filtered = filtered.filter(art => art.isNSFW);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.uploadedAt) - new Date(b.uploadedAt);
      } else if (sortBy === 'popular') {
        return (b.likes || 0) - (a.likes || 0);
      }
      return 0;
    });

    setFilteredArtworks(filtered);
  }, [artworks, filter, sortBy]);

  const openLightbox = (artwork) => {
    setSelectedArtwork(artwork);
  };

  const closeLightbox = () => {
    setSelectedArtwork(null);
  };

  return (
    <div className="artwork-gallery">
      {/* Gallery Header */}
      <div className="gallery-header">
        <div className="gallery-stats">
          <h2>🎨 Gallery ({filteredArtworks.length})</h2>
        </div>

        <div className="gallery-controls">
          {/* Filter */}
          <select
            className="gallery-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Content</option>
            <option value="sfw">SFW Only</option>
            <option value="nsfw">🔞 NSFW Only</option>
          </select>

          {/* Sort */}
          <select
            className="gallery-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredArtworks.length === 0 ? (
        <div className="empty-gallery">
          <div className="empty-icon">🖼️</div>
          <h3>No artwork yet</h3>
          <p>
            {filter === 'nsfw'
              ? 'No NSFW content found'
              : filter === 'sfw'
                ? 'No SFW content found'
                : 'Upload some artwork to get started!'}
          </p>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredArtworks.map((artwork) => (
            <div
              key={artwork.id || artwork.url}
              className={`gallery-card ${artwork.isNSFW ? 'nsfw' : ''}`}
              onClick={() => openLightbox(artwork)}
            >
              {/* NSFW Badge */}
              {artwork.isNSFW && (
                <div className="nsfw-badge">🔞 NSFW</div>
              )}

              {/* Thumbnail */}
              <div className="gallery-thumbnail">
                <img
                  src={artwork.url}
                  alt={artwork.title || 'Artwork'}
                  loading="lazy"
                />
              </div>

              {/* Artwork Info */}
              <div className="gallery-info">
                <h4 className="gallery-title">
                  {artwork.title || 'Untitled'}
                </h4>
                {artwork.description && (
                  <p className="gallery-description">
                    {artwork.description.length > 60
                      ? artwork.description.substring(0, 60) + '...'
                      : artwork.description}
                  </p>
                )}

                {/* Tags */}
                {artwork.tags && artwork.tags.length > 0 && (
                  <div className="gallery-tags">
                    {artwork.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="tag">#{tag}</span>
                    ))}
                    {artwork.tags.length > 3 && (
                      <span className="tag">+{artwork.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="gallery-stats-row">
                  <span>❤️ {artwork.likes || 0}</span>
                  <span>💬 {artwork.comments || 0}</span>
                  <span>👁️ {artwork.views || 0}</span>
                </div>
              </div>

              {/* Owner Actions */}
              {isOwner && (
                <div className="gallery-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit && onEdit(artwork);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this artwork?')) {
                        onDelete && onDelete(artwork);
                      }
                    }}
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedArtwork && (
        <div className="lightbox" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              ✕
            </button>

            <div className="lightbox-image-wrapper">
              <img
                src={selectedArtwork.url}
                alt={selectedArtwork.title || 'Artwork'}
              />
            </div>

            <div className="lightbox-info">
              <h2>{selectedArtwork.title || 'Untitled'}</h2>

              {selectedArtwork.description && (
                <p className="lightbox-description">{selectedArtwork.description}</p>
              )}

              {selectedArtwork.tags && selectedArtwork.tags.length > 0 && (
                <div className="lightbox-tags">
                  {selectedArtwork.tags.map((tag, idx) => (
                    <span key={idx} className="tag">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="lightbox-metadata">
                <div className="metadata-item">
                  <strong>Uploaded:</strong> {new Date(selectedArtwork.uploadedAt).toLocaleDateString()}
                </div>
                <div className="metadata-item">
                  <strong>Size:</strong> {(selectedArtwork.size / 1024 / 1024).toFixed(2)} MB
                </div>
                <div className="metadata-item">
                  <strong>Type:</strong> {selectedArtwork.type}
                </div>
                {selectedArtwork.isNSFW && (
                  <div className="metadata-item nsfw-flag">
                    <strong>Rating:</strong> 🔞 NSFW
                  </div>
                )}
              </div>

              <div className="lightbox-stats">
                <div className="stat">❤️ {selectedArtwork.likes || 0} Likes</div>
                <div className="stat">💬 {selectedArtwork.comments || 0} Comments</div>
                <div className="stat">👁️ {selectedArtwork.views || 0} Views</div>
              </div>

              <div className="lightbox-actions">
                <button className="btn-primary">❤️ Like</button>
                <button className="btn-secondary">💬 Comment</button>
                <button className="btn-secondary">🔗 Share</button>
                <a
                  href={selectedArtwork.url}
                  download={selectedArtwork.filename}
                  className="btn-secondary"
                  onClick={(e) => e.stopPropagation()}
                >
                  ⬇️ Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
