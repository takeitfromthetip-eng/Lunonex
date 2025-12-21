/* eslint-disable */
import React, { useState, useEffect } from 'react';
import './UnifiedSocialFeed.css';
import CreatorCollaboration from './CreatorCollaboration';
import LiveStreamingStudio from './LiveStreamingStudio';
import { RealTimeActivityFeed } from './RealTimeActivityFeed';
import MerchStore from './MerchStore';
import CommissionMarketplace from './CommissionMarketplace';
import { TipsAndDonations } from './TipsAndDonations';
import { PrintOnDemand } from './PrintOnDemand';
import { CGIRealTimeModification } from './CGIRealTimeModification';

/**
 * UnifiedSocialFeed - Facebook-style feed combining:
 * - Social media posts from subscribed creators
 * - Creator economy (tips, commissions, subscriptions, marketplace)
 * - Collaboration features
 * - Live streaming capabilities
 * - Messaging and calling
 * 
 * User vision: "i want people to scroll through like facebook, but also see new shit from people they subscrbe to"
 */
export const UnifiedSocialFeed = ({ userId }) => {
  const [activeView, setActiveView] = useState('feed'); // feed, stream
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [marketplaceTab, setMarketplaceTab] = useState('shop'); // shop, commissions, print, collab
  const [showMessaging, setShowMessaging] = useState(false);
  const [showCalling, setShowCalling] = useState(false);
  const [showTips, setShowTips] = useState(null); // stores post ID when tips modal is open
  const [feedFilter, setFeedFilter] = useState('all'); // all, subscribed, trending
  const [posts, setPosts] = useState([
    {
      id: 1,
      creator: 'AnimeArtist123',
      avatar: 'https://via.placeholder.com/50',
      content: 'Just finished my latest CGI animation! Check it out 🎬',
      image: 'https://via.placeholder.com/600x400',
      timestamp: '2 hours ago',
      likes: 234,
      comments: 45,
      subscribed: true,
      type: 'post'
    },
    {
      id: 2,
      creator: 'MangaMaster',
      avatar: 'https://via.placeholder.com/50',
      content: 'New commission slots open! DM for details 💼',
      timestamp: '5 hours ago',
      likes: 567,
      comments: 89,
      subscribed: true,
      type: 'commission'
    },
    {
      id: 3,
      creator: 'WeebCreator',
      avatar: 'https://via.placeholder.com/50',
      content: 'Going live in 10 minutes! Join my VR recording session 🎮',
      timestamp: '10 minutes ago',
      likes: 892,
      comments: 156,
      subscribed: false,
      type: 'live',
      isLive: true
    }
  ]);

  const filteredPosts = feedFilter === 'all' 
    ? posts 
    : posts.filter(p => feedFilter === 'subscribed' ? p.subscribed : true);

  return (
    <div className="unified-social-feed">
      {/* Header with view switcher */}
      <div className="feed-header">
        <h1>📱 Social Feed</h1>
        <div className="view-switcher">
          <button 
            className={activeView === 'feed' ? 'active' : ''}
            onClick={() => setActiveView('feed')}
          >
            🏠 Feed
          </button>
          <button 
            className={activeView === 'stream' ? 'active' : ''}
            onClick={() => setActiveView('stream')}
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
            title="Streaming requires PhotoDNA API for legal compliance (DMCA, age verification)"
          >
            📡 Go Live
          </button>
          <button 
            onClick={() => setShowMessaging(!showMessaging)}
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
            title="Messaging requires PhotoDNA API for legal compliance"
          >
            💬 Messages
          </button>
          <button 
            onClick={() => setShowCalling(!showCalling)}
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
            title="Calling requires PhotoDNA API for legal compliance"
          >
            📞 Call
          </button>
          <button 
            className={showMarketplace ? 'active' : ''}
            onClick={() => setShowMarketplace(!showMarketplace)}
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
            title="Marketplace requires PhotoDNA API for transaction safety and content verification"
          >
            🛍️ Marketplace
          </button>
        </div>
      </div>

      {/* Marketplace Widget (Corner) */}
      {showMarketplace && (
        <div className="marketplace-widget">
          <div className="marketplace-header">
            <h3>🛍️ Marketplace</h3>
            <button className="close-btn" onClick={() => setShowMarketplace(false)}>×</button>
          </div>
          <div className="marketplace-tabs">
            <button 
              className={marketplaceTab === 'shop' ? 'active' : ''}
              onClick={() => setMarketplaceTab('shop')}
            >
              Shop
            </button>
            <button 
              className={marketplaceTab === 'commissions' ? 'active' : ''}
              onClick={() => setMarketplaceTab('commissions')}
            >
              Commissions
            </button>
            <button 
              className={marketplaceTab === 'print' ? 'active' : ''}
              onClick={() => setMarketplaceTab('print')}
            >
              Print Shop
            </button>
            <button 
              className={marketplaceTab === 'collab' ? 'active' : ''}
              onClick={() => setMarketplaceTab('collab')}
            >
              Collaborate
            </button>
          </div>
          <div className="marketplace-content">
            {marketplaceTab === 'shop' && <MerchStore userId={userId} />}
            {marketplaceTab === 'commissions' && <CommissionMarketplace userId={userId} />}
            {marketplaceTab === 'print' && <PrintOnDemand />}
            {marketplaceTab === 'collab' && <CreatorCollaboration userId={userId} />}
          </div>
        </div>
      )}

      {/* Messaging Panel - Disabled for Legal Compliance */}
      {showMessaging && (
        <div className="messaging-panel">
          <div className="panel-header">
            <h3>💬 Messages</h3>
            <button className="close-panel" onClick={() => setShowMessaging(false)}>×</button>
          </div>
          <div className="messages-list">
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <p style={{ fontSize: '16px', marginBottom: '10px' }}>⚖️ <strong>Messaging Disabled for Legal Compliance</strong></p>
              <p style={{ fontSize: '13px', marginTop: '10px', lineHeight: '1.5', color: '#aaa' }}>
                Direct messaging requires PhotoDNA API for:
              </p>
              <ul style={{ textAlign: 'left', fontSize: '12px', marginTop: '12px', paddingLeft: '30px', color: '#888', lineHeight: '1.6' }}>
                <li>DMCA compliance (prevent pirated content sharing)</li>
                <li>Age verification (18+ content protection)</li>
                <li>Anti-harassment enforcement</li>
                <li>Content moderation requirements</li>
              </ul>
              <p style={{ fontSize: '11px', marginTop: '15px', color: '#666', fontStyle: 'italic' }}>
                Feature will activate once API is configured.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Calling Panel - Disabled for Legal Compliance */}
      {showCalling && (
        <div className="calling-panel">
          <div className="panel-header">
            <h3>📞 Call Features</h3>
            <button className="close-panel" onClick={() => setShowCalling(false)}>×</button>
          </div>
          <div className="call-options">
            <button disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>🎙️ Voice Call</button>
            <button disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>📹 Video Call</button>
          </div>
          <div className="call-info">
            <p style={{ fontSize: '14px', marginBottom: '10px' }}><strong>⚖️ Calling Disabled for Legal Compliance</strong></p>
            <p style={{ fontSize: '12px', lineHeight: '1.5', color: '#aaa' }}>
              Voice/Video calling requires PhotoDNA API for real-time content monitoring, age verification, and compliance with communication regulations.
            </p>
            <p style={{ fontSize: '11px', marginTop: '12px', padding: '10px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '6px', color: '#667eea' }}>
              💎 Note: Real-time CGI effects for video calls will be available with Premium ($1000) tier when calling is enabled.
            </p>
          </div>
        </div>
      )}

      {activeView === 'feed' && (
        <div className="feed-container">
          {/* Feed filters */}
          <div className="feed-filters">
            <button 
              className={feedFilter === 'all' ? 'active' : ''}
              onClick={() => setFeedFilter('all')}
            >
              All Posts
            </button>
            <button 
              className={feedFilter === 'subscribed' ? 'active' : ''}
              onClick={() => setFeedFilter('subscribed')}
            >
              Subscribed Only
            </button>
            <button 
              className={feedFilter === 'trending' ? 'active' : ''}
              onClick={() => setFeedFilter('trending')}
            >
              🔥 Trending
            </button>
          </div>

          {/* Create post area */}
          <div className="create-post">
            <div className="compliance-warning" style={{
              padding: '12px',
              background: 'rgba(255, 200, 0, 0.1)',
              border: '1px solid rgba(255, 200, 0, 0.3)',
              borderRadius: '8px',
              marginBottom: '12px',
              fontSize: '13px',
              color: '#ffc107'
            }}>
              ⚠️ <strong>Content Posting Disabled:</strong> User-generated content requires PhotoDNA API for legal compliance (DMCA, anti-piracy, age verification). Viewing feed only.
            </div>
            <textarea 
              placeholder="Content posting will be enabled once PhotoDNA API is configured..." 
              disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            />
            <div className="post-actions">
              <button disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>📷 Photo</button>
              <button disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>🎥 Video</button>
              <button disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>💼 Commission</button>
              <button className="post-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>Post</button>
            </div>
          </div>

          {/* Feed posts */}
          <div className="posts-feed">
            {filteredPosts.map(post => (
              <div key={post.id} className="feed-post">
                <div className="post-header">
                  <img src={post.avatar} alt={post.creator} className="creator-avatar" />
                  <div className="post-info">
                    <h3>{post.creator}</h3>
                    <span className="post-time">{post.timestamp}</span>
                    {post.isLive && <span className="live-badge">🔴 LIVE</span>}
                  </div>
                  {post.subscribed && <span className="subscribed-badge">✓ Subscribed</span>}
                </div>

                <div className="post-content">
                  <p>{post.content}</p>
                  {post.image && <img src={post.image} alt="Post content" />}
                </div>

                <div className="post-footer">
                  <button className="like-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>❤️ {post.likes}</button>
                  <button className="comment-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>💬 {post.comments}</button>
                  <button className="share-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>🔄 Share</button>
                  <button 
                    className="tip-btn" 
                    onClick={() => setShowTips(post.id)}
                    disabled
                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                    title="Tips require PhotoDNA API for payment security and compliance"
                  >
                    💰 Tip
                  </button>
                  {post.type === 'commission' && (
                    <button 
                      className="commission-btn"
                      disabled
                      style={{ opacity: 0.5, cursor: 'not-allowed' }}
                      title="Commissions require PhotoDNA API for transaction verification"
                    >
                      💰 Commission
                    </button>
                  )}
                  {post.type === 'live' && (
                    <button 
                      className="watch-btn"
                      disabled
                      style={{ opacity: 0.5, cursor: 'not-allowed' }}
                      title="Live streaming requires PhotoDNA API"
                    >
                      📺 Watch Now
                    </button>
                  )}
                </div>
                <div style={{
                  marginTop: '8px',
                  padding: '6px 10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  ⚠️ All social features (posting, interactions, tips, commissions, streaming) disabled until PhotoDNA API configured
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar with activity feed */}
          <div className="feed-sidebar">
            <h3>Recent Activity</h3>
            <RealTimeActivityFeed userId={userId} />
          </div>
        </div>
      )}

      {activeView === 'collab' && (
        <CreatorCollaboration userId={userId} />
      )}

      {activeView === 'stream' && (
        <LiveStreamingStudio userId={userId} />
      )}

      {activeView === 'marketplace' && (
        <MerchStore userId={userId} />
      )}

      {activeView === 'commissions' && (
        <CommissionMarketplace userId={userId} />
      )}

      {/* Tips Modal */}
      {showTips && (
        <div className="tips-modal-overlay" onClick={() => setShowTips(null)}>
          <div className="tips-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💰 Send a Tip</h3>
              <button className="close-modal" onClick={() => setShowTips(null)}>×</button>
            </div>
            <div className="modal-content">
              <TipsAndDonations 
                userId={userId} 
                targetPostId={showTips}
                onComplete={() => setShowTips(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedSocialFeed;
