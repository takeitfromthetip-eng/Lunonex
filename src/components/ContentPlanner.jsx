import React, { useState, useEffect } from 'react';

/**
 * ContentPlanner - Plan future content, manage WIP, and organize completed content
 * Choose between cloud storage (Vercel Blob) or local storage (browser IndexedDB)
 */
export function ContentPlanner({ userId }) {
  const [view, setView] = useState('calendar'); // 'calendar', 'wip', 'completed'
  const [storageMode, setStorageMode] = useState('local'); // 'local', 'cloud'
  const [items, setItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    type: 'video', // 'video', 'image', 'photo', '3d', 'vr', 'audio'
    status: 'planned', // 'planned', 'in_progress', 'completed'
    files: [],
    tags: []
  });

  useEffect(() => {
    loadContent();
  }, [storageMode, view]);

  const loadContent = async () => {
    if (storageMode === 'local') {
      // Load from IndexedDB
      const localContent = await loadFromIndexedDB(view);
      setItems(localContent);
    } else {
      // Load from cloud
      const cloudContent = await loadFromCloud(userId, view);
      setItems(cloudContent);
    }
  };

  const loadFromIndexedDB = async (status) => {
    return new Promise((resolve) => {
      const request = indexedDB.open('ForTheWeebsContent', 1);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('content')) {
          db.createObjectStore('content', { keyPath: 'id' });
        }
      };

      request.onsuccess = (e) => {
        const db = e.target.result;
        const transaction = db.transaction(['content'], 'readonly');
        const store = transaction.objectStore('content');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          const allItems = getAllRequest.result || [];
          const statusMap = {
            'calendar': 'planned',
            'wip': 'in_progress',
            'completed': 'completed'
          };
          const filtered = allItems.filter(item => item.status === statusMap[status]);
          resolve(filtered);
        };

        getAllRequest.onerror = () => resolve([]);
      };

      request.onerror = () => resolve([]);
    });
  };

  const loadFromCloud = async (userId, status) => {
    try {
      const response = await fetch(`/api/content-planner?userId=${userId}&view=${status}`);
      const data = await response.json();
      return data.items || [];
    } catch (err) {
      console.error('Error loading from cloud:', err);
      return [];
    }
  };

  const saveContent = async (item) => {
    if (storageMode === 'local') {
      await saveToIndexedDB(item);
    } else {
      await saveToCloud(item);
    }
    loadContent();
  };

  const saveToIndexedDB = async (item) => {
    return new Promise((resolve) => {
      const request = indexedDB.open('ForTheWeebsContent', 1);

      request.onsuccess = (e) => {
        const db = e.target.result;
        const transaction = db.transaction(['content'], 'readwrite');
        const store = transaction.objectStore('content');
        store.put({ ...item, id: item.id || `local_${Date.now()}`, userId });
        transaction.oncomplete = () => resolve();
      };
    });
  };

  const saveToCloud = async (item) => {
    await fetch('/api/content-planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, item })
    });
  };

  const addNewContent = () => {
    const statusMap = {
      'calendar': 'planned',
      'wip': 'in_progress',
      'completed': 'completed'
    };
    const item = {
      ...newItem,
      id: `${storageMode}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: statusMap[view],
      createdAt: new Date().toISOString()
    };
    saveContent(item);
    setShowAddModal(false);
    setNewItem({
      title: '',
      description: '',
      scheduledDate: '',
      type: 'video',
      status: 'planned',
      files: [],
      tags: []
    });
  };

  const updateItemStatus = async (itemId, newStatus) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      await saveContent({ ...item, status: newStatus });
    }
  };

  const deleteItem = async (itemId) => {
    if (storageMode === 'local') {
      const request = indexedDB.open('ForTheWeebsContent', 1);
      request.onsuccess = (e) => {
        const db = e.target.result;
        const transaction = db.transaction(['content'], 'readwrite');
        const store = transaction.objectStore('content');
        store.delete(itemId);
        transaction.oncomplete = () => loadContent();
      };
    } else {
      await fetch(`/api/content-planner?id=${itemId}`, { method: 'DELETE' });
      loadContent();
    }
  };

  const exportData = async () => {
    const allData = await loadFromIndexedDB('all');
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `content-backup-${Date.now()}.json`;
    link.click();
  };

  const CONTENT_TYPES = [
    { id: 'video', name: 'Video', icon: '🎬' },
    { id: 'image', name: 'Image', icon: '🖼️' },
    { id: 'photo', name: 'Photo', icon: '📸' },
    { id: '3d', name: '3D Model', icon: '🎨' },
    { id: 'vr', name: 'VR/AR', icon: '🥽' },
    { id: 'audio', name: 'Audio', icon: '🎵' }
  ];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', color: 'white' }}>
          <h1 style={{ fontSize: '56px', fontWeight: 'bold', marginBottom: '15px' }}>
            📅 Content Planner
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9 }}>
            Plan future content • Track WIP • Organize completed work
          </p>
        </div>

        {/* Storage Mode Toggle */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Storage Mode</h3>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={() => setStorageMode('local')}
                  style={{
                    background: storageMode === 'local' ? 'white' : 'rgba(255,255,255,0.2)',
                    color: storageMode === 'local' ? '#667eea' : 'white',
                    border: 'none',
                    padding: '12px 30px',
                    borderRadius: '25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  💾 Local Storage
                </button>
                <button
                  onClick={() => setStorageMode('cloud')}
                  style={{
                    background: storageMode === 'cloud' ? 'white' : 'rgba(255,255,255,0.2)',
                    color: storageMode === 'cloud' ? '#667eea' : 'white',
                    border: 'none',
                    padding: '12px 30px',
                    borderRadius: '25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  ☁️ Cloud Storage
                </button>
              </div>
              <p style={{ fontSize: '13px', opacity: 0.8, marginTop: '10px' }}>
                {storageMode === 'local'
                  ? '✓ Works offline • Stored on your device • Export anytime'
                  : '✓ Access anywhere • Auto-sync • Backup included'}
              </p>
            </div>

            <button
              onClick={exportData}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid white',
                padding: '12px 30px',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              💾 Export Backup
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '30px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {[
            { id: 'calendar', name: '📅 Planned', count: items.filter(i => i.status === 'planned').length },
            { id: 'wip', name: '🚧 Work in Progress', count: items.filter(i => i.status === 'in_progress').length },
            { id: 'completed', name: '✅ Completed', count: items.filter(i => i.status === 'completed').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              style={{
                background: view === tab.id ? 'white' : 'rgba(255,255,255,0.2)',
                color: view === tab.id ? '#667eea' : 'white',
                border: 'none',
                padding: '15px 35px',
                borderRadius: '30px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {tab.name}
              <span style={{
                background: view === tab.id ? '#667eea' : 'rgba(255,255,255,0.3)',
                color: 'white',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px'
              }}>
                {tab.count || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Add Content Button */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              padding: '18px 50px',
              borderRadius: '30px',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}
          >
            ➕ Add New Content
          </button>
        </div>

        {/* Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '25px',
          marginBottom: '40px'
        }}>
          {items.map(item => (
            <div
              key={item.id}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '25px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                transition: 'transform 0.3s',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div style={{ fontSize: '32px' }}>
                  {CONTENT_TYPES.find(t => t.id === item.type)?.icon || '📄'}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => deleteItem(item.id)}
                    style={{
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                {item.title || 'Untitled'}
              </h3>

              {item.description && (
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px', lineHeight: '1.5' }}>
                  {item.description.substring(0, 100)}{item.description.length > 100 ? '...' : ''}
                </p>
              )}

              {item.scheduledDate && (
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>
                  📅 {new Date(item.scheduledDate).toLocaleDateString()}
                </div>
              )}

              {item.tags && item.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '15px' }}>
                  {item.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        background: '#e3f2fd',
                        color: '#1976d2',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Status Change Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                {item.status !== 'in_progress' && (
                  <button
                    onClick={() => updateItemStatus(item.id, 'in_progress')}
                    style={statusButtonStyle}
                  >
                    🚧 Start
                  </button>
                )}
                {item.status !== 'completed' && (
                  <button
                    onClick={() => updateItemStatus(item.id, 'completed')}
                    style={statusButtonStyle}
                  >
                    ✅ Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '60px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
            <h2 style={{ fontSize: '28px', marginBottom: '15px' }}>No Content Yet</h2>
            <p style={{ fontSize: '16px', opacity: 0.9 }}>
              Click "Add New Content" to start planning your content calendar
            </p>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2 style={{ fontSize: '32px', marginBottom: '25px', color: '#333' }}>
                Add New Content
              </h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Title</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  style={inputStyle}
                  placeholder="My awesome video"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  style={{ ...inputStyle, minHeight: '100px' }}
                  placeholder="What's this content about?"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Content Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {CONTENT_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setNewItem({ ...newItem, type: type.id })}
                      style={{
                        background: newItem.type === type.id ? '#667eea' : '#f5f5f5',
                        color: newItem.type === type.id ? 'white' : '#333',
                        border: 'none',
                        padding: '15px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      {type.icon} {type.name}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Scheduled Date (Optional)</label>
                <input
                  type="date"
                  value={newItem.scheduledDate}
                  onChange={(e) => setNewItem({ ...newItem, scheduledDate: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="gaming, tutorial, fun"
                  onChange={(e) => setNewItem({ ...newItem, tags: e.target.value.split(',').map(t => t.trim()) })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={addNewContent}
                  style={{
                    flex: 1,
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '10px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  ✅ Add Content
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    background: '#f5f5f5',
                    color: '#333',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '10px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 'bold',
  color: '#333',
  fontSize: '14px'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '2px solid #e0e0e0',
  fontSize: '16px',
  fontFamily: 'inherit'
};

const statusButtonStyle = {
  background: '#667eea',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 'bold',
  cursor: 'pointer',
  flex: 1
};
