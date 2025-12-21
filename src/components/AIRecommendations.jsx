/* eslint-disable */
import React, { useState, useEffect } from 'react';
import './AIRecommendations.css';

/**
 * AI-Powered Recommendations Engine
 * Smart content recommendations using collaborative filtering + ML
 */
export const AIRecommendations = ({ userId, userTier, userPreferences }) => {
  const [recommendations, setRecommendations] = useState({
    creators: [],
    posts: [],
    tags: [],
    communities: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('creators');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/recommendations?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.recommendations);
      } else {
        // Fallback to mock data for development
        setRecommendations(generateMockRecommendations());
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setRecommendations(generateMockRecommendations());
    } finally {
      setLoading(false);
    }
  };

  const generateMockRecommendations = () => ({
    creators: [
      {
        id: 1,
        name: 'AnimeArtist_Pro',
        avatar: '/default-avatar.png',
        followers: 45200,
        matchScore: 98,
        reason: 'Similar art style to creators you follow',
        tags: ['Digital Art', 'Anime', 'Character Design'],
        tier: 'premium'
      },
      {
        id: 2,
        name: 'MangaMaster',
        avatar: '/default-avatar.png',
        followers: 32100,
        matchScore: 95,
        reason: 'Based on your manga reading history',
        tags: ['Manga', 'Storytelling', 'Illustration'],
        tier: 'premium'
      },
      {
        id: 3,
        name: 'VTuber_Hana',
        avatar: '/default-avatar.png',
        followers: 28900,
        matchScore: 92,
        reason: 'Popular with users who like your favorites',
        tags: ['VTuber', 'Gaming', 'Live Streams'],
        tier: 'ultimate'
      }
    ],
    posts: [
      {
        id: 101,
        title: 'New Character Design Tutorial',
        creator: 'AnimeArtist_Pro',
        thumbnail: '/placeholder.png',
        likes: 1240,
        matchScore: 97,
        reason: 'Based on your interest in tutorials',
        tags: ['Tutorial', 'Character Design'],
        createdAt: '2 hours ago'
      },
      {
        id: 102,
        title: 'WIP: Cyberpunk City Scene',
        creator: 'DigitalDreamer',
        thumbnail: '/placeholder.png',
        likes: 890,
        matchScore: 94,
        reason: 'Similar to posts you liked recently',
        tags: ['Digital Art', 'Cyberpunk', 'WIP'],
        createdAt: '5 hours ago'
      },
      {
        id: 103,
        title: 'My Art Journey: 2024 Recap',
        creator: 'ArtisticSoul',
        thumbnail: '/placeholder.png',
        likes: 2310,
        matchScore: 91,
        reason: 'Trending in your network',
        tags: ['Art Journey', 'Inspiration'],
        createdAt: '1 day ago'
      }
    ],
    tags: [
      { name: 'Character Design', score: 98, count: 234, trending: true },
      { name: 'Digital Painting', score: 96, count: 189, trending: false },
      { name: 'VTuber', score: 93, count: 156, trending: true },
      { name: 'Anime Style', score: 91, count: 412, trending: false },
      { name: '3D Modeling', score: 88, count: 98, trending: true }
    ],
    communities: [
      { name: 'Character Artists Hub', members: 4520, score: 97, active: 234 },
      { name: 'Anime Creators United', members: 8910, score: 94, active: 567 },
      { name: 'VTuber Central', members: 3240, score: 91, active: 189 }
    ]
  });

  const refreshRecommendations = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  };

  const followCreator = async (creatorId) => {
    try {
      await fetch('/api/relationships/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ creatorId })
      });
      
      // Remove from recommendations
      setRecommendations(prev => ({
        ...prev,
        creators: prev.creators.filter(c => c.id !== creatorId)
      }));
    } catch (error) {
      console.error('Failed to follow creator:', error);
    }
  };

  const dismissRecommendation = (type, id) => {
    setRecommendations(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.id !== id)
    }));
  };

  if (loading) {
    return (
      <div className="ai-recommendations loading">
        <div className="spinner"></div>
        <p>Finding perfect matches for you...</p>
      </div>
    );
  }

  return (
    <div className="ai-recommendations">
      <div className="recommendations-header">
        <div className="header-content">
          <h2>🤖 AI Recommendations</h2>
          <p>Personalized picks based on your activity</p>
        </div>
        <button 
          className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
          onClick={refreshRecommendations}
          disabled={refreshing}
        >
          🔄
        </button>
      </div>

      <div className="recommendation-tabs">
        <button 
          className={activeTab === 'creators' ? 'active' : ''}
          onClick={() => setActiveTab('creators')}
        >
          👥 Creators ({recommendations.creators.length})
        </button>
        <button 
          className={activeTab === 'posts' ? 'active' : ''}
          onClick={() => setActiveTab('posts')}
        >
          📝 Posts ({recommendations.posts.length})
        </button>
        <button 
          className={activeTab === 'tags' ? 'active' : ''}
          onClick={() => setActiveTab('tags')}
        >
          🏷️ Tags ({recommendations.tags.length})
        </button>
        <button 
          className={activeTab === 'communities' ? 'active' : ''}
          onClick={() => setActiveTab('communities')}
        >
          🌐 Communities ({recommendations.communities.length})
        </button>
      </div>

      <div className="recommendations-content">
        {activeTab === 'creators' && (
          <CreatorRecommendations 
            creators={recommendations.creators}
            onFollow={followCreator}
            onDismiss={(id) => dismissRecommendation('creators', id)}
          />
        )}

        {activeTab === 'posts' && (
          <PostRecommendations 
            posts={recommendations.posts}
            onDismiss={(id) => dismissRecommendation('posts', id)}
          />
        )}

        {activeTab === 'tags' && (
          <TagRecommendations 
            tags={recommendations.tags}
          />
        )}

        {activeTab === 'communities' && (
          <CommunityRecommendations 
            communities={recommendations.communities}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Creator Recommendations Component
 */
const CreatorRecommendations = ({ creators, onFollow, onDismiss }) => (
  <div className="creator-recommendations">
    {creators.map(creator => (
      <div key={creator.id} className="creator-card">
        <div className="match-badge">{creator.matchScore}% Match</div>
        <button 
          className="dismiss-btn"
          onClick={() => onDismiss(creator.id)}
          title="Not interested"
        >
          ✕
        </button>
        
        <img src={creator.avatar} alt={creator.name} className="creator-avatar" />
        
        <h3>{creator.name}</h3>
        <div className="creator-stats">
          <span>👥 {(creator.followers / 1000).toFixed(1)}K followers</span>
          <span className={`tier-badge ${creator.tier}`}>{creator.tier}</span>
        </div>
        
        <div className="creator-tags">
          {creator.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        
        <p className="match-reason">💡 {creator.reason}</p>
        
        <button 
          className="follow-btn"
          onClick={() => onFollow(creator.id)}
        >
          Follow
        </button>
      </div>
    ))}
  </div>
);

/**
 * Post Recommendations Component
 */
const PostRecommendations = ({ posts, onDismiss }) => (
  <div className="post-recommendations">
    {posts.map(post => (
      <div key={post.id} className="post-card">
        <div className="match-badge">{post.matchScore}% Match</div>
        <button 
          className="dismiss-btn"
          onClick={() => onDismiss(post.id)}
          title="Not interested"
        >
          ✕
        </button>
        
        <img src={post.thumbnail} alt={post.title} className="post-thumbnail" />
        
        <div className="post-info">
          <h4>{post.title}</h4>
          <p className="post-creator">by {post.creator}</p>
          
          <div className="post-meta">
            <span>❤️ {post.likes.toLocaleString()}</span>
            <span>{post.createdAt}</span>
          </div>
          
          <div className="post-tags">
            {post.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
          
          <p className="match-reason">💡 {post.reason}</p>
          
          <button className="view-btn" onClick={() => window.location.href = `/post/${post.id}`}>
            View Post
          </button>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Tag Recommendations Component
 */
const TagRecommendations = ({ tags }) => (
  <div className="tag-recommendations">
    {tags.map(tag => (
      <div key={tag.name} className="tag-card">
        <div className="tag-header">
          <h4>#{tag.name}</h4>
          {tag.trending && <span className="trending-badge">🔥 Trending</span>}
        </div>
        
        <div className="tag-stats">
          <span>📊 {tag.score}% Match</span>
          <span>📝 {tag.count} posts</span>
        </div>
        
        <button 
          className="explore-btn"
          onClick={() => window.location.href = `/explore?tag=${tag.name}`}
        >
          Explore
        </button>
      </div>
    ))}
  </div>
);

/**
 * Community Recommendations Component
 */
const CommunityRecommendations = ({ communities }) => (
  <div className="community-recommendations">
    {communities.map(community => (
      <div key={community.name} className="community-card">
        <h4>{community.name}</h4>
        
        <div className="community-stats">
          <div className="stat">
            <span className="stat-value">{(community.members / 1000).toFixed(1)}K</span>
            <span className="stat-label">Members</span>
          </div>
          <div className="stat">
            <span className="stat-value">{community.active}</span>
            <span className="stat-label">Active now</span>
          </div>
          <div className="stat">
            <span className="stat-value">{community.score}%</span>
            <span className="stat-label">Match</span>
          </div>
        </div>
        
        <button 
          className="join-btn"
          onClick={() => window.location.href = `/community/${community.name}`}
        >
          Join Community
        </button>
      </div>
    ))}
  </div>
);

export default AIRecommendations;
