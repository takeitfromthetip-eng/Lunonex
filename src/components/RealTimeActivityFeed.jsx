import React, { useState, useEffect, useRef } from 'react';
import './RealTimeActivityFeed.css';

/**
 * Real-Time Activity Feed
 * Live updates using Server-Sent Events (SSE) or WebSocket
 */
export const RealTimeActivityFeed = ({ userId }) => {
  const [activities, setActivities] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [filter, setFilter] = useState('all'); // all, posts, comments, likes, subs
  const eventSourceRef = useRef(null);

  useEffect(() => {
    connectToActivityStream();
    return () => disconnectFromActivityStream();
  }, []);

  const connectToActivityStream = () => {
    try {
      // Use Server-Sent Events for real-time updates
      const eventSource = new EventSource(`/api/activity/stream?userId=${userId}`);
      
      eventSource.onopen = () => {
        console.log('✅ Activity stream connected');
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const activity = JSON.parse(event.data);
          handleNewActivity(activity);
        } catch (err) {
          console.error('Failed to parse activity:', err);
        }
      };

      eventSource.onerror = () => {
        console.error('❌ Activity stream disconnected');
        setIsConnected(false);
        
        // Reconnect after 5 seconds
        setTimeout(() => {
          connectToActivityStream();
        }, 5000);
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('Failed to connect to activity stream:', error);
      
      // Fallback to polling
      startPolling();
    }
  };

  const disconnectFromActivityStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const handleNewActivity = (activity) => {
    setActivities(prev => {
      // Add animation flag
      const newActivity = { ...activity, isNew: true };
      
      // Remove animation flag after 3 seconds
      setTimeout(() => {
        setActivities(current => 
          current.map(a => a.id === activity.id ? { ...a, isNew: false } : a)
        );
      }, 3000);

      // Keep only last 50 activities
      const updated = [newActivity, ...prev].slice(0, 50);
      return updated;
    });

    // Show notification for important events
    if (activity.type === 'subscription' || activity.type === 'tip') {
      showNotification(activity);
    }
  };

  const showNotification = (activity) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('ForTheWeebs', {
        body: getActivityText(activity),
        icon: '/icon-192.png',
        badge: '/badge-72.png'
      });
    }
  };

  const startPolling = () => {
    // Fallback: Poll every 10 seconds
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/activity/recent?userId=${userId}&limit=10`);
        const data = await response.json();
        
        if (data.activities) {
          data.activities.forEach(activity => {
            // Only add if not already in list
            setActivities(prev => {
              const exists = prev.some(a => a.id === activity.id);
              return exists ? prev : [activity, ...prev].slice(0, 50);
            });
          });
        }
      } catch (error) {
        console.error('Polling failed:', error);
      }
    }, 10000);

    return () => clearInterval(pollInterval);
  };

  const getActivityIcon = (type) => {
    const icons = {
      post: '📝',
      comment: '💬',
      like: '❤️',
      follow: '👥',
      subscription: '💎',
      tip: '💰',
      share: '🔄',
      mention: '@',
      milestone: '🎉'
    };
    return icons[type] || '📌';
  };

  const getActivityText = (activity) => {
    const { type, user, target, data } = activity;
    
    switch (type) {
      case 'post':
        return `${user.name} created a new post`;
      case 'comment':
        return `${user.name} commented on ${target.title || 'a post'}`;
      case 'like':
        return `${user.name} liked your ${target.type}`;
      case 'follow':
        return `${user.name} started following you`;
      case 'subscription':
        return `${user.name} subscribed to your channel!`;
      case 'tip':
        return `${user.name} sent you a $${data.amount} tip!`;
      case 'share':
        return `${user.name} shared your post`;
      case 'mention':
        return `${user.name} mentioned you in a ${target.type}`;
      case 'milestone':
        return `🎉 You reached ${data.milestone}!`;
      default:
        return 'New activity';
    }
  };

  const getActivityLink = (activity) => {
    const { type, target } = activity;
    
    switch (type) {
      case 'post':
      case 'comment':
      case 'like':
        return `/post/${target.postId}`;
      case 'follow':
      case 'subscription':
        return `/profile/${activity.user.id}`;
      default:
        return null;
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="realtime-activity-feed">
      <div className="feed-header">
        <h2>⚡ Live Activity</h2>
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? 'Live' : 'Connecting...'}</span>
        </div>
      </div>

      <div className="activity-filters">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={filter === 'post' ? 'active' : ''} 
          onClick={() => setFilter('post')}
        >
          📝 Posts
        </button>
        <button 
          className={filter === 'comment' ? 'active' : ''} 
          onClick={() => setFilter('comment')}
        >
          💬 Comments
        </button>
        <button 
          className={filter === 'like' ? 'active' : ''} 
          onClick={() => setFilter('like')}
        >
          ❤️ Likes
        </button>
        <button 
          className={filter === 'subscription' ? 'active' : ''} 
          onClick={() => setFilter('subscription')}
        >
          💎 Subs
        </button>
      </div>

      <div className="activity-list">
        {filteredActivities.length === 0 ? (
          <div className="empty-activity">
            <p>No recent activity</p>
            <span>Check back soon!</span>
          </div>
        ) : (
          filteredActivities.map((activity, idx) => (
            <ActivityItem
              key={`${activity.id}-${idx}`}
              activity={activity}
              icon={getActivityIcon(activity.type)}
              text={getActivityText(activity)}
              link={getActivityLink(activity)}
              timeAgo={formatTimeAgo(activity.timestamp)}
            />
          ))
        )}
      </div>

      {/* Live Stats */}
      <div className="live-stats">
        <div className="stat">
          <span className="stat-icon">👥</span>
          <span className="stat-value">{activities.filter(a => a.type === 'follow').length}</span>
          <span className="stat-label">New Followers</span>
        </div>
        <div className="stat">
          <span className="stat-icon">💎</span>
          <span className="stat-value">{activities.filter(a => a.type === 'subscription').length}</span>
          <span className="stat-label">New Subs</span>
        </div>
        <div className="stat">
          <span className="stat-icon">❤️</span>
          <span className="stat-value">{activities.filter(a => a.type === 'like').length}</span>
          <span className="stat-label">Likes</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Activity Item Component
 */
const ActivityItem = ({ activity, icon, text, link, timeAgo }) => {
  const handleClick = () => {
    if (link) {
      window.location.href = link;
    }
  };

  return (
    <div 
      className={`activity-item ${activity.isNew ? 'new-activity' : ''} ${link ? 'clickable' : ''}`}
      onClick={handleClick}
    >
      <div className="activity-icon">{icon}</div>
      <div className="activity-content">
        <div className="activity-text">{text}</div>
        <div className="activity-time">{timeAgo}</div>
      </div>
      {activity.data?.amount && (
        <div className="activity-badge">${activity.data.amount}</div>
      )}
    </div>
  );
};

export default RealTimeActivityFeed;
