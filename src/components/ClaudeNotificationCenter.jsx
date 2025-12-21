/* eslint-disable */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkTierAccess } from '../utils/tierAccess';
import { supabase } from '../lib/supabase';

/**
 * OWNER-ONLY Notification Center for Claude
 * See all bug reports and suggestions that need your attention
 */
export default function ClaudeNotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('unread'); // unread, all, bug_report, suggestion
  const [loading, setLoading] = useState(true);

  const tierAccess = checkTierAccess(user?.id, user?.tier, user?.email);

  // Only owner can see this
  if (!tierAccess.isOwner) return null;

  useEffect(() => {
    loadNotifications();

    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('claude_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter === 'unread') {
        query = query.eq('status', 'unread');
      } else if (filter === 'bug_report' || filter === 'suggestion') {
        query = query.eq('type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await supabase
        .from('claude_notifications')
        .update({
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', id);

      loadNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAsResolved = async (id) => {
    try {
      await supabase
        .from('claude_notifications')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', id);

      loadNotifications();
    } catch (error) {
      console.error('Failed to mark as resolved:', error);
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <>
      {/* Floating notification button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          background: unreadCount > 0 ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        🔔
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: '#fbbf24',
            color: '#000',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white'
          }}>
            {unreadCount}
          </div>
        )}
      </button>

      {/* Notification panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '500px',
        height: '100vh',
        background: 'rgba(0,0,0,0.95)',
        zIndex: 9999,
        overflowY: 'auto',
        padding: '20px',
        color: 'white',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.5)'
      }}>
        <h2 style={{ marginBottom: '10px', fontSize: '24px' }}>
          🔔 Claude Notifications
        </h2>
        <p style={{ opacity: 0.7, marginBottom: '20px', fontSize: '14px' }}>
          Bug reports and suggestions that need your attention
        </p>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['unread', 'all', 'bug_report', 'suggestion'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                background: filter === f ? '#667eea' : 'rgba(255,255,255,0.1)',
                border: filter === f ? '2px solid #667eea' : '2px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '13px',
                textTransform: 'capitalize'
              }}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
            <div>No notifications</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {notifications.map(notif => (
              <div
                key={notif.id}
                style={{
                  background: notif.status === 'unread' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${notif.status === 'unread' ? '#ef4444' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: '8px',
                  padding: '15px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{
                    padding: '4px 10px',
                    background: notif.type === 'bug_report' ? '#ef4444' : '#8b5cf6',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {notif.type === 'bug_report' ? '🐛 Bug' : '💡 Suggestion'}
                  </span>
                  <span style={{ fontSize: '12px', opacity: 0.6 }}>
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>

                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  {notif.title}
                </div>

                {notif.data && (
                  <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '10px' }}>
                    <div><strong>User:</strong> {notif.data.user} ({notif.data.tier})</div>
                    {notif.data.url && <div><strong>URL:</strong> {notif.data.url}</div>}
                    {notif.data.description && (
                      <div style={{
                        marginTop: '8px',
                        padding: '10px',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '4px',
                        maxHeight: '100px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {notif.data.description || notif.data.suggestion}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  {notif.status === 'unread' && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#3b82f6',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => markAsResolved(notif.id)}
                    style={{
                      padding: '6px 12px',
                      background: '#10b981',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
