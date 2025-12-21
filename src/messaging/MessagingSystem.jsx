import React, { useState, useEffect } from 'react';
import api from '../utils/backendApi';

export default function MessagingSystem() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await api.messages.getConversations();
      setConversations(data.conversations || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Failed to load conversations');
      // Fallback to mock data
      setConversations([
        { id: 1, otherUser: { username: 'System' }, lastMessage: 'Welcome!', updatedAt: new Date().toISOString(), unreadCount: 0 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await api.messages.getConversation(conversationId);
      setMessages(data.messages || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages');
      setMessages([]);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const message = await api.messages.send(selectedConversation.otherUser.id, newMessage);
      setMessages([...messages, message]);
      setNewMessage('');
      setError(null);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    }
  };

  const unreadCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Messages</h1>
        {unreadCount > 0 && (
          <span style={{
            background: '#ff4444',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            {unreadCount} unread
          </span>
        )}
      </div>

      {error && (
        <div style={{ background: '#fee', padding: '12px', borderRadius: '8px', marginBottom: '16px', color: '#c00' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedConversation ? '1fr 2fr' : '1fr', gap: '20px' }}>
        {/* Conversations List */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '16px', textAlign: 'center' }}>Loading...</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>No conversations yet</div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  background: selectedConversation?.id === conv.id ? '#f9fafb' : (conv.unreadCount > 0 ? '#eff6ff' : 'white'),
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = selectedConversation?.id === conv.id ? '#f9fafb' : (conv.unreadCount > 0 ? '#eff6ff' : 'white')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: conv.unreadCount > 0 ? '700' : '400', fontSize: '0.875rem' }}>
                    {conv.otherUser?.username || 'Unknown'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {conv.lastMessage || 'No messages'}
                </div>
                {conv.unreadCount > 0 && (
                  <span style={{ fontSize: '0.75rem', color: '#667eea', fontWeight: '600' }}>
                    {conv.unreadCount} new
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Messages View */}
        {selectedConversation && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            height: '600px'
          }}>
            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {selectedConversation.otherUser?.username || 'Unknown'}
              </h2>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ marginBottom: '12px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>
                    {msg.sender?.username || 'Unknown'} • {new Date(msg.createdAt).toLocaleString()}
                  </div>
                  <div>{msg.body}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  padding: '8px 16px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
