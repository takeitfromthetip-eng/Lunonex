import React, { useState } from 'react';
import { useNotifications } from './NotificationProvider';

export default function NotificationBadge() {
  const { notifications, unreadCount, removeNotification, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.5rem',
          padding: '0.5rem'
        }}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              background: '#ff4444',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '300px',
            maxWidth: '400px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1000,
            marginTop: '0.5rem'
          }}
        >
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Clear all
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
              No notifications
            </div>
          ) : (
            <div>
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    background: notif.type === 'error' ? '#fff5f5' :
                      notif.type === 'success' ? '#f0fff4' : 'white'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#999' }}>
                      {notif.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <button
                    onClick={() => removeNotification(notif.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      color: '#999',
                      marginLeft: '0.5rem'
                    }}
                    aria-label="Dismiss"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
