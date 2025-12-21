/* eslint-disable */
import React, { useState, useEffect } from 'react';
import './SocialFeed.css';
import { isLifetimeVIP } from '../utils/vipAccess';
import { checkTierAccess } from '../utils/tierAccess';
import api from '../utils/backendApi';
import featureDetector from '../utils/featureDetection';
import { FeatureBlocker } from './FeatureDisabledBanner';

/**
 * Social Feed - Main content feed for all users
 * 
 * Tier Structure:
 * - Owner + VIPs: FREE everything, admin powers, all features
 * - $1000: Admin powers, all features, pay creator fees
 * - $500: All features except admin, pay creator fees
 * - $250: No VR/AR, pay creator fees
 * - $100: Basic features
 * - $50: Minimal features
 * - $15+$5: Adult content only
 * - FREE: Family friendly only
 */
export const SocialFeed = ({ userId, userTier }) => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [activeTab, setActiveTab] = useState('feed'); // feed, discover, search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [discoverCreators, setDiscoverCreators] = useState([]);
  const [showCGITools, setShowCGITools] = useState(false);
  const [showMonetizeDialog, setShowMonetizeDialog] = useState(false);
  const [friends, setFriends] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [contentVisibility, setContentVisibility] = useState('PUBLIC'); // PUBLIC, FRIENDS, SUBSCRIBERS, CUSTOM
  const [isPaidContent, setIsPaidContent] = useState(false);
  const [priceCents, setPriceCents] = useState(500); // Default $5.00
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCommentsForPost, setShowCommentsForPost] = useState(null);
  const [commentsMap, setCommentsMap] = useState({});
  const [newCommentText, setNewCommentText] = useState('');
  const [features, setFeatures] = useState(featureDetector.getFeatures());
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());

  // Get user's tier access
  const userEmail = localStorage.getItem('ownerEmail') || localStorage.getItem('userEmail');
  const access = checkTierAccess(userId, userTier, userEmail);

  // Subscribe to feature changes
  useEffect(() => {
    const unsubscribe = featureDetector.subscribe(setFeatures);
    featureDetector.checkFeatures();
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadFeed = async () => {
      try {
        setLoading(true);
        
        // Load posts from backend API with pagination
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/social/feed?limit=20&offset=0`);
        if (response.ok) {
          const feedData = await response.json();
          setPosts(feedData.posts || []);
          setHasMore(feedData.posts?.length >= 20);
        } else {
          setPosts([]);
          setHasMore(false);
        }

        setFriends([]);
        setFollowers([]);
        setSubscriptions([]);
        setError(null);
      } catch (err) {
        console.error('Feed load error:', err);
        setPosts([]);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, []);

  // Infinite scroll handler
  const loadMorePosts = async () => {
    if (loading || !hasMore) return;
    
    try {
      setLoading(true);
      const newOffset = offset + 20;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/social/feed?limit=20&offset=${newOffset}`);
      
      if (response.ok) {
        const feedData = await response.json();
        const newPosts = feedData.posts || [];
        setPosts([...posts, ...newPosts]);
        setOffset(newOffset);
        setHasMore(newPosts.length >= 20);
      }
    } catch (err) {
      console.error('Load more error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Scroll detection for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (activeTab !== 'feed') return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      if (scrollTop + clientHeight >= scrollHeight - 500 && !loading && hasMore) {
        loadMorePosts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, loading, hasMore, offset, posts]);

  const createPost = async () => {
    if (!newPostContent.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Get user ID from localStorage or generate temp one
      const currentUserId = localStorage.getItem('userId') || `user_${Date.now()}`;
      const userName = localStorage.getItem('currentUserName') || localStorage.getItem('displayName') || 'Anonymous';
      const userAvatar = localStorage.getItem('userAvatar') || '👤';

      // Call the correct API endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/social/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: currentUserId,
          content: newPostContent,
          visibility: contentVisibility.toUpperCase(),
          media: []
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const data = await response.json();

      // Format post for display
      const newPost = {
        id: data.post.id,
        userId: data.post.userId,
        userName: userName,
        avatar: userAvatar,
        content: data.post.content,
        visibility: data.post.visibility,
        timestamp: data.post.timestamp,
        likes: data.post.likes || 0,
        commentsCount: data.post.commentsCount || 0,
        shares: data.post.shares || 0,
        isPaidContent: isPaidContent,
        priceCents: isPaidContent ? priceCents : 0
      };

      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setShowMonetizeDialog(false);
      setIsPaidContent(false);
      setPriceCents(500);
    } catch (err) {
      console.error('Failed to create post:', err);
      setError('❌ Failed to create post: ' + err.message);

      // Still show the post even if API fails
      const newPost = {
        id: Date.now(),
        userId: localStorage.getItem('userId') || `user_${Date.now()}`,
        userName: localStorage.getItem('currentUserName') || 'Anonymous',
        avatar: localStorage.getItem('userAvatar') || '👤',
        content: newPostContent,
        visibility: contentVisibility.toLowerCase(),
        timestamp: new Date().toISOString(),
        likes: 0,
        commentsCount: 0,
        shares: 0,
        isPaidContent: isPaidContent,
        priceCents: isPaidContent ? priceCents : 0
      };

      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setShowMonetizeDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId) => {
    try {
      await api.relationships.follow(targetUserId);
      await loadStats(); // Refresh counters
    } catch (err) {
      console.error('Follow failed:', err);
    }
  };

  const handleAddFriend = async (targetUserId) => {
    try {
      await api.relationships.sendFriendRequest(targetUserId);
      alert('Friend request sent!');
    } catch (err) {
      console.error('Friend request failed:', err);
      alert(err.message || 'Failed to send friend request');
    }
  };

  const handleSubscribe = async (creatorId) => {
    try {
      setLoading(true);
      const { sessionUrl } = await api.subscriptions.createCheckout(creatorId, 'PREMIUM_1000', 100000);
      window.location.href = sessionUrl; // Redirect to Stripe
    } catch (err) {
      console.error('Subscription failed:', err);
      alert('Failed to start subscription. Please try again.');
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const result = await api.posts.like(postId);

      // Refetch the post to get accurate counts
      const updatedPost = await api.posts.getPost(postId);

      // Update local state with fresh data
      setPosts(posts.map(p =>
        p.id === postId ? { ...updatedPost, liked: result.liked } : p
      ));
    } catch (err) {
      console.error('Like failed:', err);
      setError('Failed to like post');
    }
  };

  const toggleComments = async (postId) => {
    if (showCommentsForPost === postId) {
      // Close comments
      setShowCommentsForPost(null);
    } else {
      // Open comments and load them
      setShowCommentsForPost(postId);
      if (!commentsMap[postId]) {
        try {
          const commentsData = await api.comments.getComments(postId, 50, 0);
          setCommentsMap({ ...commentsMap, [postId]: commentsData.comments || [] });
        } catch (err) {
          console.error('Failed to load comments:', err);
          setCommentsMap({ ...commentsMap, [postId]: [] });
        }
      }
    }
  };

  const handleAddComment = async (postId) => {
    if (!newCommentText.trim()) return;

    try {
      const comment = await api.comments.create(postId, newCommentText);

      // Add to comments map
      const currentComments = commentsMap[postId] || [];
      setCommentsMap({ ...commentsMap, [postId]: [comment, ...currentComments] });

      // Update post comments count
      setPosts(posts.map(p =>
        p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
      ));

      setNewCommentText('');
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError('Failed to add comment');
    }
  };

  const likePost = async (postId) => {
    try {
      // Optimistic update
      const wasLiked = likedPosts.has(postId);
      const updatedPosts = posts.map(post => 
        post.id === postId ? { 
          ...post, 
          likes: wasLiked ? (post.likes || 0) - 1 : (post.likes || 0) + 1,
          isLiked: !wasLiked
        } : post
      );
      setPosts(updatedPosts);
      
      // Update liked state
      const newLiked = new Set(likedPosts);
      if (wasLiked) {
        newLiked.delete(postId);
      } else {
        newLiked.add(postId);
      }
      setLikedPosts(newLiked);
      localStorage.setItem('likedPosts', JSON.stringify([...newLiked]));

      // Send to backend
      await fetch(`${import.meta.env.VITE_API_URL}/api/social/post/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const sharePost = async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (navigator.share) {
        await navigator.share({
          title: `Post by @${post.author?.username || 'creator'}`,
          text: post.content?.substring(0, 100),
          url: `${window.location.origin}/post/${postId}`
        });
      } else {
        // Fallback: copy link
        await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
        alert('✅ Link copied to clipboard!');
      }
      
      // Track share
      const updatedPosts = posts.map(p => 
        p.id === postId ? { ...p, shares: (p.shares || 0) + 1 } : p
      );
      setPosts(updatedPosts);
      
      await fetch(`${import.meta.env.VITE_API_URL}/api/social/post/${postId}/share`, {
        method: 'POST'
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const savePost = (postId) => {
    const wasSaved = savedPosts.has(postId);
    const newSaved = new Set(savedPosts);
    
    if (wasSaved) {
      newSaved.delete(postId);
      alert('🗑️ Removed from saved');
    } else {
      newSaved.add(postId);
      alert('💾 Post saved!');
    }
    
    setSavedPosts(newSaved);
    localStorage.setItem('savedPosts', JSON.stringify([...newSaved]));
  };

  return (
    <div className="social-feed-container">
      {/* Navigation Tabs */}
      <div className="feed-nav">
        <button 
          className={`feed-nav-btn ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          📰 Feed
        </button>
        <button 
          className={`feed-nav-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          💬 Messages
        </button>
        <button 
          className={`feed-nav-btn ${activeTab === 'calls' ? 'active' : ''}`}
          onClick={() => setActiveTab('calls')}
        >
          📞 Calls
        </button>
        <button 
          className={`feed-nav-btn ${activeTab === 'streams' ? 'active' : ''}`}
          onClick={() => setActiveTab('streams')}
        >
          📡 Live Streams
        </button>
        <button 
          className={`feed-nav-btn ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          🔍 Discover
        </button>
      </div>

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <FeatureBlocker feature="socialMedia" features={features}>
        <div className="feed-content">
          {/* Post Creator */}
          <div className="post-creator">
            <textarea
              placeholder="What's on your mind?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={3}
              disabled={loading}
            />
            
            {/* Content Visibility Selector */}
            <div className="visibility-selector">
              <label>👁️ Who can see this:</label>
              <select value={contentVisibility} onChange={(e) => setContentVisibility(e.target.value)}>
                <option value="PUBLIC">🌍 Public (Everyone)</option>
                <option value="FRIENDS">👥 Friends Only</option>
                <option value="SUBSCRIBERS">💎 Subscribers Only</option>
                <option value="CUSTOM">⚙️ Custom List</option>
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="post-creator-actions">
              <div className="post-options">
                <button className="post-option">📷 Photo</button>
                <button className="post-option">🎥 Video</button>
                {access.hasCGI.basic && (
                  <button 
                    className="post-option premium"
                    onClick={() => setShowCGITools(!showCGITools)}
                  >
                    ✨ CGI Effects
                  </button>
                )}
              </div>
              <button 
                className="post-btn" 
                onClick={() => {
                  // Show monetization dialog before posting
                  if (newPostContent.trim()) {
                    setShowMonetizeDialog(true);
                  } else {
                    createPost();
                  }
                }}
              >
                Post
              </button>
            </div>

            {/* Monetization Dialog - shown BEFORE posting */}
            {showMonetizeDialog && (
              <div className="monetize-dialog">
                <div className="monetize-dialog-content">
                  <h3>Ready to share?</h3>
                  <p>Choose how you want to share this post:</p>
                  
                  <label className="monetize-option">
                    <input
                      type="radio"
                      name="monetize"
                      checked={!isPaidContent}
                      onChange={() => setIsPaidContent(false)}
                    />
                    <div>
                      <strong>🌟 Post to Feed</strong>
                      <small>Share with your audience for free</small>
                    </div>
                  </label>

                  <label className="monetize-option">
                    <input
                      type="radio"
                      name="monetize"
                      checked={isPaidContent}
                      onChange={() => setIsPaidContent(true)}
                    />
                    <div>
                      <strong>💰 Monetized Content</strong>
                      <small>Charge subscribers to view (VIPs see for free)</small>
                    </div>
                  </label>

                  {isPaidContent && (
                    <div className="price-input">
                      <label>Set Price:</label>
                      <input
                        type="number"
                        value={priceCents / 100}
                        onChange={(e) => setPriceCents(Math.round(parseFloat(e.target.value) * 100))}
                        min="1"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  <div className="monetize-actions">
                    <button onClick={() => setShowMonetizeDialog(false)}>Cancel</button>
                    <button className="primary" onClick={() => { setShowMonetizeDialog(false); createPost(); }}>
                      {isPaidContent ? `Post for $${(priceCents / 100).toFixed(2)}` : 'Post Now'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showCGITools && access.hasCGI.basic && (
              <div className="cgi-tools-panel">
                <h4>🎨 CGI Tools & Effects</h4>
                <div className="cgi-categories">
                  <div className="effect-category">
                    <h5>🌈 Background Effects</h5>
                    <div className="cgi-options">
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Effect: Starry Night Sky]')}>⭐ Starry Night</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Effect: Cherry Blossom]')}>🌸 Cherry Blossom</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Effect: Neon City]')}>🌃 Neon City</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Effect: Beach Sunset]')}>🏖️ Beach Sunset</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Effect: Northern Lights]')}>✨ Northern Lights</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Effect: Space Galaxy]')}>🌌 Space Galaxy</button>
                    </div>
                  </div>
                  
                  <div className="effect-category">
                    <h5>✨ Filters & Color Grading</h5>
                    <div className="cgi-options">
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Filter: Anime Style]')}>🎌 Anime Style</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Filter: Vintage Film]')}>📽️ Vintage Film</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Filter: Cyberpunk Neon]')}>⚡ Cyberpunk</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Filter: Soft Glow]')}>💫 Soft Glow</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Filter: High Contrast]')}>🎯 High Contrast</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Filter: Black & White]')}>⚪ B&W</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Filter: Sepia Tone]')}>🟫 Sepia</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Filter: Retro Waves]')}>🌊 Retro Waves</button>
                    </div>
                  </div>

                  <div className="effect-category">
                    <h5>👻 AR Stickers & Elements</h5>
                    <div className="cgi-options">
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [AR: Cute Cat Ears]')}>🐱 Cat Ears</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [AR: Sparkles]')}>✨ Sparkles</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [AR: Hearts]')}>💕 Hearts</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [AR: Stars]')}>⭐ Stars</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [AR: Butterfly Wings]')}>🦋 Butterfly Wings</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [AR: Angel Halo]')}>😇 Angel Halo</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [AR: Devil Horns]')}>😈 Devil Horns</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [AR: Crown]')}>👑 Crown</button>
                    </div>
                  </div>

                  <div className="effect-category">
                    <h5>🎭 Face Filters</h5>
                    <div className="cgi-options">
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Face: Beauty Filter]')}>💅 Beauty Filter</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Face: Big Eyes]')}>👁️ Big Eyes</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Face: Smooth Skin]')}>✨ Smooth Skin</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Face: Rosy Cheeks]')}>🌹 Rosy Cheeks</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Face: Glitter Makeup]')}>💎 Glitter Makeup</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Face: Fantasy Makeup]')}>🎨 Fantasy Makeup</button>
                    </div>
                  </div>

                  <div className="effect-category">
                    <h5>🌟 Special Effects</h5>
                    <div className="cgi-options">
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Effect: Light Rays]')}>☀️ Light Rays</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Effect: Particle Burst]')}>💥 Particle Burst</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Effect: Motion Blur]')}>💨 Motion Blur</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Effect: Hologram]')}>🔷 Hologram</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Effect: Glitch]')}>📺 Glitch</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Effect: Bokeh]')}>🔆 Bokeh</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Effect: Lens Flare]')}>🌟 Lens Flare</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Effect: Rain]')}>🌧️ Rain</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Effect: Snow]')}>❄️ Snow</button>
                      <button className="effect-btn" onClick={() => setNewPostContent(newPostContent + ' [Effect: Fire]')}>🔥 Fire</button>
                    </div>
                  </div>

                  {access.hasCGI.full && (
                    <div className="effect-category premium-category">
                      <h5>💎 Premium CGI (Your Tier Only)</h5>
                      <div className="cgi-options">
                        <button className="effect-btn premium" onClick={() => setNewPostContent(newPostContent + ' [Premium: 3D Model Import]')}>🎲 3D Model Import</button>
                        <button className="effect-btn premium" onClick={() => setNewPostContent(newPostContent + ' [Premium: Custom Shader]')}>⚡ Custom Shader</button>
                        <button className="effect-btn premium" onClick={() => setNewPostContent(newPostContent + ' [Premium: AI Enhancement]')}>🤖 AI Enhancement</button>
                        <button className="effect-btn premium" onClick={() => setNewPostContent(newPostContent + ' [Premium: Real-time Tracking]')}>📍 Real-time Tracking</button>
                        <button className="effect-btn premium" onClick={() => setNewPostContent(newPostContent + ' [Premium: Scene Composition]')}>🎬 Scene Composition</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Posts Feed */}
          <div className="posts-feed">
            {posts.length === 0 && (
              <div className="empty-feed">
                <h3>Welcome to ForTheWeebs! 🎌</h3>
                <p>Be the first to post something awesome</p>
              </div>
            )}
            {posts.map(post => {
              // Check if user can view this paid content
              const canViewPaidContent = !post.isPaidContent || 
                                        access.hasFreeContentAccess || 
                                        post.userId === userId ||
                                        subscriptions.some(sub => sub.creatorId === post.userId);
              
              return (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <span className="post-avatar">{post.avatar}</span>
                  <div className="post-meta">
                    <strong>{post.userName}</strong>
                    <span className="post-time">
                      {new Date(post.timestamp).toLocaleString()}
                    </span>
                    {post.visibility !== 'public' && (
                      <span className="visibility-badge">
                        {post.visibility === 'friends' && '👥 Friends'}
                        {post.visibility === 'subscribers' && '💎 Subscribers'}
                        {post.visibility === 'custom' && '⚙️ Custom'}
                      </span>
                    )}
                    {post.isPaidContent && (
                      <span className="paid-badge">
                        💰 ${(post.priceCents / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="post-actions-menu">
                    <button className="follow-btn" onClick={() => followUser(post.userId, post.userName)}>
                      ➕ Follow
                    </button>
                    <button className="friend-btn" onClick={() => addFriend(post.userId, post.userName)}>
                      👥 Add Friend
                    </button>
                    {post.isPaidContent && !canViewPaidContent && (
                      <button className="subscribe-btn" onClick={() => subscribeToUser(post.userId, post.userName)}>
                        💎 Subscribe for ${(post.priceCents / 100).toFixed(2)}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Show content if user has access, otherwise show lock */}
                {canViewPaidContent ? (
                  <div className="post-content">{post.content}</div>
                ) : (
                  <div className="post-content locked">
                    <div className="locked-overlay">
                      🔒 
                      <p>Subscribe to view this content</p>
                      <button onClick={() => subscribeToUser(post.userId, post.userName)}>
                        Subscribe for ${(post.priceCents / 100).toFixed(2)}
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="post-actions">
                  <button 
                    onClick={() => likePost(post.id)}
                    className={likedPosts.has(post.id) ? 'liked' : ''}
                  >
                    {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.likes || 0}
                  </button>
                  <button onClick={() => toggleComments(post.id)}>
                    💬 {post.commentsCount || 0}
                  </button>
                  <button onClick={() => sharePost(post.id)}>
                    🔁 {post.shares || 0}
                  </button>
                  <button 
                    onClick={() => savePost(post.id)}
                    className={savedPosts.has(post.id) ? 'saved' : ''}
                  >
                    {savedPosts.has(post.id) ? '📕' : '📖'} Save
                  </button>
                </div>

                {/* Comments Section */}
                {showCommentsForPost === post.id && (
                  <div className="comments-section">
                    <div className="add-comment">
                      <input
                        type="text"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <button onClick={() => handleAddComment(post.id)}>Post</button>
                    </div>
                    <div className="comments-list">
                      {(commentsMap[post.id] || []).map(comment => (
                        <div key={comment.id} className="comment">
                          <strong>{comment.author?.username || 'Anonymous'}</strong>
                          <p>{comment.body}</p>
                          <span className="comment-time">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
        </FeatureBlocker>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <FeatureBlocker feature="socialMedia" features={features}>
        <div className="messages-content">
          <h2>💬 Messages</h2>
          <p className="feature-status">✅ Free for all users</p>
          
          {/* Friends & Followers Stats */}
          <div className="social-stats">
            <div className="stat-card">
              <h3>👥 Friends</h3>
              <p className="stat-number">{friends.length}</p>
            </div>
            <div className="stat-card">
              <h3>👁️ Followers</h3>
              <p className="stat-number">{followers.length}</p>
            </div>
            <div className="stat-card">
              <h3>💎 Subscriptions</h3>
              <p className="stat-number">{subscriptions.length}</p>
            </div>
          </div>

          <div className="messages-placeholder">
            <h3>Direct Messaging System</h3>
            <p>Text messaging available for all users</p>
            {access.hasCGI.full && (
              <div className="premium-features">
                <h4>💎 Your Premium Features:</h4>
                <ul>
                  <li>✨ Send CGI-enhanced messages</li>
                  <li>🎨 Custom animated stickers</li>
                  <li>👻 AR filters in messages</li>
                  <li>🎭 Voice modulation</li>
                </ul>
              </div>
            )}
            <button className="coming-soon-btn">Full Messaging Coming Soon</button>
          </div>
        </div>
        </FeatureBlocker>
      )}

      {/* Calls Tab */}
      {activeTab === 'calls' && (
        <div className="calls-content">
          <h2>📞 Voice & Video Calls</h2>
          <p className="feature-status">✅ Free for all users</p>
          <div className="calls-placeholder">
            <h3>Real-Time Communication</h3>
            <p>Voice and video calling for all users</p>
            {access.hasCGI.full && (
              <div className="premium-features">
                <h4>💎 Your Premium Features:</h4>
                <ul>
                  <li>✨ Live CGI effects during calls</li>
                  <li>🎨 Real-time background replacement</li>
                  <li>👻 AR face filters</li>
                  <li>🎭 Voice effects and modulation</li>
                  <li>🎬 Screen recording with effects</li>
                </ul>
              </div>
            )}
            <button className="coming-soon-btn">WebRTC Integration Coming Soon</button>
          </div>
        </div>
      )}

      {/* Live Streams Tab */}
      {activeTab === 'streams' && (
        <div className="streams-content">
          <h2>📡 Live Streaming</h2>
          <p className="feature-status">✅ Free for all users</p>
          <div className="streams-placeholder">
            <h3>Broadcast Live</h3>
            <p>Stream live content to your audience</p>
            {access.features.liveStreaming && (
              <div className="premium-features">
                <h4>💎 Your Premium Features:</h4>
                <ul>
                  <li>✨ Live CGI effects on stream</li>
                  <li>🎨 Custom overlays and graphics</li>
                  <li>👻 AR elements in real-time</li>
                  <li>🎭 Scene transitions with effects</li>
                  <li>🎬 Multi-camera CGI compositing</li>
                  <li>🌈 Green screen replacement</li>
                </ul>
              </div>
            )}
            <button className="coming-soon-btn">Live Streaming Coming Soon</button>
          </div>
        </div>
      )}

      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <FeatureBlocker feature="socialMedia" features={features}>
        <div className="discover-content">
          <h2>🔍 Discover Creators</h2>
          
          {/* Search Bar */}
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="🔍 Search for users, creators, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={async (e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    try {
                      setLoading(true);
                      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/social/search?q=${encodeURIComponent(searchQuery)}`);
                      if (response.ok) {
                        const data = await response.json();
                        setSearchResults(data.users || []);
                      }
                    } catch (err) {
                      console.error('Search error:', err);
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
              />
              <button 
                className="search-btn"
                onClick={async () => {
                  if (!searchQuery.trim()) return;
                  try {
                    setLoading(true);
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/social/search?q=${encodeURIComponent(searchQuery)}`);
                    if (response.ok) {
                      const data = await response.json();
                      setSearchResults(data.users || []);
                    }
                  } catch (err) {
                    console.error('Search error:', err);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Search
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="search-results">
              <h3>Search Results</h3>
              <div className="creators-grid">
                {searchResults.map(creator => (
                  <div key={creator.id} className="creator-card">
                    <div className="creator-avatar">
                      <img src={creator.avatar || '/default-avatar.png'} alt={creator.username} />
                      {creator.is_verified && <span className="verified-badge">✓</span>}
                    </div>
                    <h4>@{creator.username}</h4>
                    {creator.display_name && <p className="display-name">{creator.display_name}</p>}
                    {creator.bio && <p className="creator-bio">{creator.bio}</p>}
                    <div className="creator-stats">
                      <span>👥 {creator.followers || 0} followers</span>
                      <span>📝 {creator.posts || 0} posts</span>
                    </div>
                    <button 
                      className="follow-btn"
                      onClick={async () => {
                        try {
                          await fetch(`${import.meta.env.VITE_API_URL}/api/social/follow/${creator.id}`, {
                            method: 'POST'
                          });
                          alert(`Now following @${creator.username}!`);
                        } catch (err) {
                          console.error('Follow error:', err);
                        }
                      }}
                    >
                      + Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Real Creators (from database) */}
          <div className="featured-section">
            <h3>⭐ Active Creators</h3>
            <p className="section-desc">Real people on ForTheWeebs - no fake profiles</p>
            <div className="creators-grid">
              {loading ? (
                <p>⏳ Loading real creators from database...</p>
              ) : discoverCreators.length > 0 ? (
                discoverCreators.map(creator => (
                  <div key={creator.user_id} className="creator-card">
                    <div className="creator-avatar">
                      {creator.avatar || '👤'}
                    </div>
                    <h4>@{creator.username}</h4>
                    {creator.display_name && <p className="display-name">{creator.display_name}</p>}
                    {creator.bio && <p className="creator-bio">{creator.bio}</p>}
                    <div className="creator-stats">
                      <span>👥 {creator.follower_count || 0} followers</span>
                      <span>📝 {creator.post_count || 0} posts</span>
                    </div>
                    <button 
                      className="follow-btn"
                      onClick={async () => {
                        try {
                          await fetch(`${import.meta.env.VITE_API_URL}/api/social/follow/${creator.user_id}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: localStorage.getItem('userId') })
                          });
                          alert(`Now following @${creator.username}!`);
                        } catch (err) {
                          console.error('Follow error:', err);
                        }
                      }}
                    >
                      + Follow
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>✨ Be the first creator! Start posting to show up here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="categories-section">
            <h3>📂 Browse by Category</h3>
            <div className="categories-grid">
              <button className="category-card">
                <span className="category-icon">🎨</span>
                <span className="category-name">Artists</span>
                <span className="category-count">2.4K creators</span>
              </button>
              <button className="category-card">
                <span className="category-icon">📚</span>
                <span className="category-name">Writers</span>
                <span className="category-count">1.2K creators</span>
              </button>
              <button className="category-card">
                <span className="category-icon">📸</span>
                <span className="category-name">Photographers</span>
                <span className="category-count">890 creators</span>
              </button>
              <button className="category-card">
                <span className="category-icon">🎬</span>
                <span className="category-name">Video Creators</span>
                <span className="category-count">1.5K creators</span>
              </button>
              <button className="category-card">
                <span className="category-icon">🎮</span>
                <span className="category-name">Game Devs</span>
                <span className="category-count">670 creators</span>
              </button>
              <button className="category-card">
                <span className="category-icon">🎭</span>
                <span className="category-name">Cosplayers</span>
                <span className="category-count">2.1K creators</span>
              </button>
            </div>
          </div>
        </div>
        </FeatureBlocker>
      )}

      {/* Premium Upsell for Non-Premium Users */}
      {!access.hasCGI.full && (
        <div className="premium-upsell">
          <h3>💎 Upgrade to $1,000 Tier</h3>
          <p>Unlock CGI messages, video effects, and live streaming tools!</p>
          <button onClick={() => {
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.set('tab', 'premium');
            window.location.search = urlParams.toString();
          }}>
            Unlock Premium Features
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialFeed;
