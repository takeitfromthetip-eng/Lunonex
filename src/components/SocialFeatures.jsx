/* eslint-disable */
import React, { useState, useEffect } from 'react';
import './SocialFeatures.css';

// Comment Section Component
export function CommentSection({ artworkId, comments: initialComments = [] }) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Firestore comment loading can be implemented here
    // const fetchComments = async () => {
    //   const commentsData = await getArtworkComments(artworkId);
    //   setComments(commentsData);
    // };
    // fetchComments();
  }, [artworkId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    // Firestore createComment can be added here for persistence
    const comment = {
      id: Date.now().toString(),
      userId: 'current-user-id',
      username: 'CurrentUser',
      avatar: null,
      text: newComment,
      createdAt: new Date(),
      likes: 0,
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    setIsSubmitting(false);

    // await createComment({
    //   artworkId,
    //   userId: currentUser.uid,
    //   text: newComment
    // });
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;

    // Firestore delete can be implemented here
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  return (
    <div className="comment-section">
      <h3>Comments ({comments.length})</h3>

      <form className="comment-form" onSubmit={handleSubmitComment}>
        <textarea
          className="comment-input"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          maxLength={500}
        />
        <div className="comment-form-footer">
          <span className="char-count">{newComment.length}/500</span>
          <button
            type="submit"
            className="submit-comment-button"
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-avatar">
                {comment.avatar ? (
                  <img src={comment.avatar} alt={comment.username} />
                ) : (
                  <div className="avatar-placeholder">
                    {comment.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-username">{comment.username}</span>
                  <span className="comment-time">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="comment-text">{comment.text}</p>
                <div className="comment-actions">
                  <button className="comment-like-button">
                    ❤️ {comment.likes > 0 && comment.likes}
                  </button>
                  <button className="comment-reply-button">Reply</button>
                  <button
                    className="comment-delete-button"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Social Actions Component (Like, Share buttons)
export function SocialActions({
  artworkId,
  initialLikes = 0,
  initialLiked = false,
  onLike,
  onShare
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleLike = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikes(prev => newLikedState ? prev + 1 : prev - 1);

    // Firestore like/unlike operations can be added here
    if (onLike) {
      onLike(newLikedState);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}`,
      copy: url
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }

    setShowShareMenu(false);
    if (onShare) {
      onShare(platform);
    }
  };

  return (
    <div className="social-actions">
      <button
        className={`social-button like-button ${isLiked ? 'liked' : ''}`}
        onClick={handleLike}
      >
        {isLiked ? '❤️' : '🤍'} {likes > 0 && likes.toLocaleString()}
      </button>

      <div className="share-dropdown">
        <button
          className="social-button share-button"
          onClick={() => setShowShareMenu(!showShareMenu)}
        >
          🔗 Share
        </button>
        {showShareMenu && (
          <div className="share-menu">
            <button onClick={() => handleShare('twitter')}>
              🐦 Share on Twitter
            </button>
            <button onClick={() => handleShare('facebook')}>
              📘 Share on Facebook
            </button>
            <button onClick={() => handleShare('reddit')}>
              🔴 Share on Reddit
            </button>
            <button onClick={() => handleShare('pinterest')}>
              📌 Share on Pinterest
            </button>
            <button onClick={() => handleShare('copy')}>
              📋 Copy Link
            </button>
          </div>
        )}
      </div>

      <button className="social-button bookmark-button">
        🔖 Save
      </button>
    </div>
  );
}

// Notification Bell Component
export function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Firestore notification loading can be implemented here
    const mockNotifications = [
      {
        id: '1',
        type: 'like',
        message: 'AnimeFan42 liked your artwork "Sunset Dreams"',
        time: new Date(Date.now() - 3600000),
        read: false,
        link: '/artwork/123'
      },
      {
        id: '2',
        type: 'comment',
        message: 'MangaLover commented on your artwork',
        time: new Date(Date.now() - 7200000),
        read: false,
        link: '/artwork/456'
      },
      {
        id: '3',
        type: 'follow',
        message: 'WeebMaster started following you',
        time: new Date(Date.now() - 86400000),
        read: true,
        link: '/profile/weebmaster'
      },
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Firestore update for read status can be added here
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    // Firestore batch update can be implemented here
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'follow': return '👤';
      case 'commission': return '✨';
      case 'tip': return '💝';
      default: return '🔔';
    }
  };

  const formatTime = (time) => {
    const diff = Date.now() - new Date(time).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="notification-bell">
      <button
        className="bell-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-all-read" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="no-notifications">No notifications</p>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => {
                    markAsRead(notification.id);
                    window.location.href = notification.link;
                  }}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {formatTime(notification.time)}
                    </span>
                  </div>
                  {!notification.read && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="notification-footer">
            <a href="/notifications">View all notifications</a>
          </div>
        </div>
      )}
    </div>
  );
}

// Follow Button Component
export function FollowButton({ userId, initialFollowing = false, onFollowChange }) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);

    const newState = !isFollowing;
    setIsFollowing(newState);

    // Firestore follow/unfollow operations can be implemented here
    // await followUser(currentUserId, userId);
    // or
    // await unfollowUser(currentUserId, userId);

    if (onFollowChange) {
      onFollowChange(newState);
    }

    setIsLoading(false);
  };

  return (
    <button
      className={`follow-button ${isFollowing ? 'following' : ''}`}
      onClick={handleFollow}
      disabled={isLoading}
    >
      {isLoading ? '...' : isFollowing ? '✓ Following' : '+ Follow'}
    </button>
  );
}
