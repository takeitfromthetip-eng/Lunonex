import React, { useState, useEffect } from 'react';
import api from '../utils/backendApi';
import { FeatureBlocker } from './FeatureDisabledBanner';
import featureDetector from '../utils/featureDetection';
import './NotificationCenter.css';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [features, setFeatures] = useState(featureDetector.getFeatures());

  useEffect(() => {
    const unsubscribe = featureDetector.subscribe(setFeatures);
    featureDetector.checkFeatures();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (features.socialMedia) {
      loadNotifications();
      loadUnreadCount();

      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        loadUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [features.socialMedia]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.notifications.getAll();
      setNotifications(data.notifications || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await api.notifications.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.notifications.markAsRead(notificationId);
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await api.notifications.delete(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      const deleted = notifications.find(n => n.id === notificationId);
      if (deleted && !deleted.read) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'LIKE': return '❤️';
      case 'COMMENT': return '💬';
      case 'FOLLOW': return '👁️';
      case 'FRIEND_REQUEST': return '👥';
      case 'MESSAGE': return '✉️';
      case 'MENTION': return '🔔';
      case 'SUBSCRIPTION': return '💎';
      default: return '🔔';
    }
  };

  return (
    <FeatureBlocker feature="socialMedia" features={features}>
      <div className="notification-center">
        <div className="notification-header">
          <h2>🔔 Notifications</h2>
          {unreadCount > 0 && (
            <div className="unread-badge">{unreadCount} unread</div>
          )}
          {notifications.length > 0 && (
            <button className="mark-all-read-btn" onClick={handleMarkAllRead}>
              Mark all as read
            </button>
          )}
        </div>

        {error && (
          <div className="notification-error">{error}</div>
        )}

        {loading ? (
          <div className="notification-loading">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">
            <div className="empty-icon">🔔</div>
            <h3>No notifications yet</h3>
            <p>When you get likes, comments, or messages, they'll show up here.</p>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-text">
                    <strong>{notification.actor?.username || 'Someone'}</strong>
                    {' '}
                    {notification.message || 'interacted with your content'}
                  </div>
                  <div className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
                {!notification.read && (
                  <div className="notification-unread-dot"></div>
                )}
                <button
                  className="notification-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.id);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </FeatureBlocker>
  );
}

// Unread count badge for nav
export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [features, setFeatures] = useState(featureDetector.getFeatures());

  useEffect(() => {
    const unsubscribe = featureDetector.subscribe(setFeatures);
    featureDetector.checkFeatures();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!features.socialMedia) return;

    const loadCount = async () => {
      try {
        const data = await api.notifications.getUnreadCount();
        setUnreadCount(data.count || 0);
      } catch (err) {
        console.error('Failed to load unread count:', err);
      }
    };

    loadCount();
    const interval = setInterval(loadCount, 30000); // Poll every 30s

    return () => clearInterval(interval);
  }, [features.socialMedia]);

  if (!features.socialMedia || unreadCount === 0) return null;

  return (
    <div className="notification-badge">{unreadCount}</div>
  );
}
