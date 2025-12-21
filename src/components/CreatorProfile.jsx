// CREATOR PROFILE - Public profile page with gallery, bio, social links

import React, { useState, useEffect } from 'react';
import { ArtworkGallery } from './ArtworkGallery';
import { TipsAndDonations } from './TipsAndDonations';
import { NSFWContent } from './ContentModeration';
import './CreatorProfile.css';

export function CreatorProfile({ creatorId, isOwner = false }) {
  const [profile, setProfile] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [stats, setStats] = useState({
    followers: 0,
    totalLikes: 0,
    totalViews: 0,
    artworkCount: 0
  });
  const [activeTab, setActiveTab] = useState('gallery'); // gallery, about, commissions
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreatorProfile();
    fetchCreatorArtworks();
    fetchCreatorStats();
  }, [creatorId]);

  const fetchCreatorProfile = async () => {
    try {
      // In production: Fetch from Firestore
      // const doc = await getDoc(doc(db, 'users', creatorId));

      // Mock data for now
      setProfile({
        id: creatorId,
        username: 'ArtistUsername',
        displayName: 'Artist Display Name',
        bio: 'Professional artist specializing in anime, manga, and digital illustrations. Commissions open!',
        avatar: 'https://via.placeholder.com/200',
        banner: 'https://via.placeholder.com/1200x300',
        joinedDate: '2024-01-15',
        location: 'Tokyo, Japan',
        website: 'https://example.com',
        socialLinks: {
          twitter: 'https://twitter.com/artist',
          instagram: 'https://instagram.com/artist',
          pixiv: 'https://pixiv.net/users/123456',
          patreon: 'https://patreon.com/artist'
        },
        badges: ['verified', 'pro', 'top_seller'],
        tier: 'full_platform'
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatorArtworks = async () => {
    try {
      // In production: Fetch from Firestore
      // const q = query(collection(db, 'artworks'), where('userId', '==', creatorId));

      // Mock data
      setArtworks([
        // Empty for now - will be populated from gallery uploads
      ]);
    } catch (error) {
      console.error('Failed to fetch artworks:', error);
    }
  };

  const fetchCreatorStats = async () => {
    try {
      // In production: Aggregate from Firestore
      setStats({
        followers: 1234,
        totalLikes: 5678,
        totalViews: 12345,
        artworkCount: 89
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleFollow = async () => {
    try {
      // In production: Update Firestore
      setIsFollowing(!isFollowing);
      setStats(prev => ({
        ...prev,
        followers: prev.followers + (isFollowing ? -1 : 1)
      }));
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
    }
  };

  if (loading) {
    return (
      <div className="creator-profile-loading">
        <div className="loading-spinner">⏳</div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="creator-profile-error">
        <h2>❌ Profile Not Found</h2>
        <p>This creator doesn't exist or has been removed.</p>
      </div>
    );
  }

  const hasNSFWContent = artworks.some(art => art.isNSFW);

  return (
    <NSFWContent isNSFW={hasNSFWContent}>
      <div className="creator-profile">
        {/* Banner */}
        <div
          className="profile-banner"
          style={{ backgroundImage: `url(${profile.banner})` }}
        >
          <div className="banner-overlay"></div>
        </div>

        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-main">
            <div className="profile-avatar-wrapper">
              <img
                src={profile.avatar}
                alt={profile.displayName}
                className="profile-avatar"
              />
              {profile.badges?.includes('verified') && (
                <div className="verified-badge" title="Verified Creator">✓</div>
              )}
            </div>

            <div className="profile-info">
              <h1 className="profile-name">
                {profile.displayName}
                {profile.badges?.includes('pro') && (
                  <span className="pro-badge">PRO</span>
                )}
                {profile.badges?.includes('top_seller') && (
                  <span className="top-seller-badge">🔥 Top Seller</span>
                )}
              </h1>
              <p className="profile-username">@{profile.username}</p>
              <p className="profile-bio">{profile.bio}</p>

              <div className="profile-metadata">
                {profile.location && (
                  <span>📍 {profile.location}</span>
                )}
                <span>📅 Joined {new Date(profile.joinedDate).toLocaleDateString()}</span>
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer">
                    🔗 Website
                  </a>
                )}
              </div>

              {/* Social Links */}
              {profile.socialLinks && (
                <div className="profile-social-links">
                  {profile.socialLinks.twitter && (
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                      <span className="social-icon">🐦</span> Twitter
                    </a>
                  )}
                  {profile.socialLinks.instagram && (
                    <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                      <span className="social-icon">📷</span> Instagram
                    </a>
                  )}
                  {profile.socialLinks.pixiv && (
                    <a href={profile.socialLinks.pixiv} target="_blank" rel="noopener noreferrer">
                      <span className="social-icon">🎨</span> Pixiv
                    </a>
                  )}
                  {profile.socialLinks.patreon && (
                    <a href={profile.socialLinks.patreon} target="_blank" rel="noopener noreferrer">
                      <span className="social-icon">❤️</span> Patreon
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Profile Stats */}
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-value">{stats.followers.toLocaleString()}</div>
              <div className="stat-label">Followers</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.totalLikes.toLocaleString()}</div>
              <div className="stat-label">Likes</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.totalViews.toLocaleString()}</div>
              <div className="stat-label">Views</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.artworkCount}</div>
              <div className="stat-label">Artworks</div>
            </div>
          </div>

          {/* Action Buttons */}
          {!isOwner && (
            <div className="profile-actions">
              <button
                className={`follow-btn ${isFollowing ? 'following' : ''}`}
                onClick={handleFollow}
              >
                {isFollowing ? '✓ Following' : '➕ Follow'}
              </button>
              <button className="message-btn">💬 Message</button>
              <button className="share-btn">🔗 Share</button>
            </div>
          )}

          {isOwner && (
            <div className="profile-actions">
              <button className="edit-profile-btn">✏️ Edit Profile</button>
              <button className="settings-btn">⚙️ Settings</button>
            </div>
          )}
        </div>

        {/* Profile Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            🎨 Gallery ({stats.artworkCount})
          </button>
          <button
            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            ℹ️ About
          </button>
          <button
            className={`tab ${activeTab === 'commissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('commissions')}
          >
            💼 Commissions
          </button>
          <button
            className={`tab ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            💰 Support
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === 'gallery' && (
            <ArtworkGallery
              userId={creatorId}
              artworks={artworks}
              isOwner={isOwner}
            />
          )}

          {activeTab === 'about' && (
            <div className="about-section">
              <h2>About {profile.displayName}</h2>
              <p>{profile.bio}</p>

              <div className="about-details">
                <h3>Details</h3>
                <div className="detail-row">
                  <strong>Member Since:</strong>
                  <span>{new Date(profile.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {profile.location && (
                  <div className="detail-row">
                    <strong>Location:</strong>
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="detail-row">
                  <strong>Account Type:</strong>
                  <span>{profile.tier === 'full_platform' ? 'Full Platform Access' : profile.tier}</span>
                </div>
              </div>

              <div className="about-badges">
                <h3>Badges & Achievements</h3>
                <div className="badges-grid">
                  {profile.badges?.includes('verified') && (
                    <div className="badge-item">
                      <span className="badge-icon">✓</span>
                      <span className="badge-name">Verified Creator</span>
                    </div>
                  )}
                  {profile.badges?.includes('pro') && (
                    <div className="badge-item">
                      <span className="badge-icon">⭐</span>
                      <span className="badge-name">Pro Member</span>
                    </div>
                  )}
                  {profile.badges?.includes('top_seller') && (
                    <div className="badge-item">
                      <span className="badge-icon">🔥</span>
                      <span className="badge-name">Top Seller</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'commissions' && (
            <div className="commissions-section">
              <h2>💼 Commission Info</h2>
              <p>Request custom artwork from {profile.displayName}</p>
              <button className="btn-primary">View Commission Options →</button>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="support-section">
              <h2>💰 Support {profile.displayName}</h2>
              <TipsAndDonations
                creatorId={creatorId}
                creatorName={profile.displayName}
              />
            </div>
          )}
        </div>
      </div>
    </NSFWContent>
  );
}
