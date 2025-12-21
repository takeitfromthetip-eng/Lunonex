/* eslint-disable */
import React, { useState } from 'react';

export function VRContentManager({ userId }) {
  const [content, setContent] = useState([]);
  const [editingContent, setEditingContent] = useState(null);

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{
        fontSize: '32px',
        marginBottom: '30px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        🎬 My VR Content
      </h2>

      {editingContent ? (
        <VRContentEditor
          content={editingContent}
          onSave={(updated) => {
            setContent(prev => prev.map(c => c.id === updated.id ? updated : c));
            setEditingContent(null);
          }}
          onCancel={() => setEditingContent(null)}
        />
      ) : (
        <>
          <button
            onClick={() => setEditingContent({ id: Date.now(), title: 'New VR Experience', price: 0, isPublic: false })}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '30px'
            }}
          >
            + Create New VR Experience
          </button>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {content.map(item => (
              <VRContentCard
                key={item.id}
                content={item}
                onEdit={() => setEditingContent(item)}
                onDelete={() => setContent(prev => prev.filter(c => c.id !== item.id))}
              />
            ))}
          </div>

          {content.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'rgba(102, 126, 234, 0.05)',
              borderRadius: '15px',
              border: '2px dashed rgba(102, 126, 234, 0.3)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎭</div>
              <h3 style={{ marginBottom: '10px' }}>No VR Content Yet</h3>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Create your first immersive VR experience and start earning!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function VRContentCard({ content, onEdit, onDelete }) {
  const [stats, setStats] = useState({ views: 0, earnings: 0 });

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '15px',
      padding: '20px',
      color: 'white',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: content.isPublic ? '#4CAF50' : '#FF9800',
        padding: '5px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {content.isPublic ? '🌐 Public' : '🔒 Private'}
      </div>

      <h3 style={{ marginTop: '10px', marginBottom: '15px' }}>{content.title}</h3>

      <div style={{
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '15px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>💰 Price:</span>
          <strong>${content.price}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>👁️ Views:</span>
          <strong>{stats.views}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>💵 Earnings:</span>
          <strong>${stats.earnings}</strong>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onEdit}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ✏️ Edit
        </button>
        <button
          onClick={onDelete}
          style={{
            background: 'rgba(255,0,0,0.3)',
            border: '1px solid rgba(255,0,0,0.5)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

function VRContentEditor({ content, onSave, onCancel }) {
  const [formData, setFormData] = useState(content);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      padding: '40px',
      color: 'white',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h3 style={{ fontSize: '24px', marginBottom: '30px' }}>
        {content.id ? '✏️ Edit VR Experience' : '✨ Create VR Experience'}
      </h3>

      <div style={{ marginBottom: '25px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px'
          }}
        />
      </div>

      <div style={{ marginBottom: '25px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Description
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ marginBottom: '25px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Price (USD) - You keep 100% profit!
        </label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          min="0"
          step="0.01"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px'
          }}
        />
        <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.9 }}>
          Set to $0 for free access
        </div>
      </div>

      <div style={{ marginBottom: '25px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
          <span style={{ fontWeight: 'bold' }}>
            Make Public (visible to all users)
          </span>
        </label>
      </div>

      <div style={{ marginBottom: '25px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Content Rating
        </label>
        <select
          value={formData.rating || 'G'}
          onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          <option value="G">G - General Audiences</option>
          <option value="PG">PG - Parental Guidance</option>
          <option value="PG-13">PG-13 - Parents Strongly Cautioned</option>
          <option value="R">R - Restricted</option>
          <option value="XXX">XXX - Adult Only</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '15px' }}>
        <button
          onClick={() => onSave(formData)}
          style={{
            flex: 1,
            background: 'white',
            color: '#667eea',
            border: 'none',
            padding: '15px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          💾 Save
        </button>
        <button
          onClick={onCancel}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '15px 30px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
