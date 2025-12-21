import React, { useState } from 'react';

/**
 * ModelAssetLibrary - Pre-built 3D models for VR/AR creators
 * 
 * Features:
 * - Characters, props, environments
 * - Searchable/filterable
 * - One-click import to VR/AR studio
 * - Preview before download
 * - Free & premium models
 */
export default function ModelAssetLibrary() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);

  const categories = [
    { id: 'all', name: 'All Assets', icon: '📦', count: 247 },
    { id: 'characters', name: 'Characters', icon: '🧑', count: 45 },
    { id: 'props', name: 'Props', icon: '🎨', count: 89 },
    { id: 'environments', name: 'Environments', icon: '🏞️', count: 34 },
    { id: 'furniture', name: 'Furniture', icon: '🪑', count: 52 },
    { id: 'vehicles', name: 'Vehicles', icon: '🚗', count: 27 }
  ];

  const models = [
    {
      id: 1,
      name: 'Anime Girl Character',
      category: 'characters',
      thumbnail: '👧',
      format: 'GLB',
      size: '2.4 MB',
      polygons: '12.5K',
      isPremium: false,
      tags: ['anime', 'character', 'rigged']
    },
    {
      id: 2,
      name: 'Cyberpunk Street',
      category: 'environments',
      thumbnail: '🌃',
      format: 'GLB',
      size: '18.7 MB',
      polygons: '89.2K',
      isPremium: true,
      tags: ['cyberpunk', 'street', 'neon']
    },
    {
      id: 3,
      name: 'Katana Sword',
      category: 'props',
      thumbnail: '⚔️',
      format: 'GLB',
      size: '1.1 MB',
      polygons: '5.4K',
      isPremium: false,
      tags: ['weapon', 'sword', 'anime']
    },
    {
      id: 4,
      name: 'Gaming Chair',
      category: 'furniture',
      thumbnail: '🪑',
      format: 'GLB',
      size: '3.2 MB',
      polygons: '15.8K',
      isPremium: false,
      tags: ['furniture', 'chair', 'gaming']
    },
    {
      id: 5,
      name: 'Mecha Robot',
      category: 'characters',
      thumbnail: '🤖',
      format: 'GLB',
      size: '8.9 MB',
      polygons: '42.3K',
      isPremium: true,
      tags: ['robot', 'mecha', 'rigged']
    },
    {
      id: 6,
      name: 'Futuristic Car',
      category: 'vehicles',
      thumbnail: '🚗',
      format: 'GLB',
      size: '6.5 MB',
      polygons: '28.7K',
      isPremium: true,
      tags: ['car', 'vehicle', 'futuristic']
    },
    {
      id: 7,
      name: 'Magical Staff',
      category: 'props',
      thumbnail: '✨',
      format: 'GLB',
      size: '1.8 MB',
      polygons: '7.2K',
      isPremium: false,
      tags: ['magic', 'staff', 'fantasy']
    },
    {
      id: 8,
      name: 'Space Station',
      category: 'environments',
      thumbnail: '🛸',
      format: 'GLB',
      size: '24.3 MB',
      polygons: '105.6K',
      isPremium: true,
      tags: ['space', 'station', 'sci-fi']
    },
    {
      id: 9,
      name: 'Japanese Garden',
      category: 'environments',
      thumbnail: '🎋',
      format: 'GLB',
      size: '15.2 MB',
      polygons: '65.4K',
      isPremium: true,
      tags: ['garden', 'japanese', 'zen']
    },
    {
      id: 10,
      name: 'Holographic Display',
      category: 'props',
      thumbnail: '📱',
      format: 'GLB',
      size: '2.1 MB',
      polygons: '9.8K',
      isPremium: false,
      tags: ['tech', 'hologram', 'ui']
    }
  ];

  const filteredModels = models.filter(model => {
    const matchesCategory = selectedCategory === 'all' || model.category === selectedCategory;
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleImport = (model) => {
    alert(`Importing "${model.name}" to your VR/AR Creator Studio...\n\nModel will be added to your object library and ready to use!`);
  };

  const handlePreview = (model) => {
    setSelectedModel(model);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      minHeight: '100vh',
      padding: '40px 20px',
      color: 'white'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '36px',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🧊 3D Model Library
        </h1>
        <p style={{ color: '#aaa', fontSize: '18px', marginBottom: '40px' }}>
          Pre-built models ready for your VR/AR projects
        </p>

        {/* Search & Filters */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '40px'
        }}>
          <input
            type="text"
            placeholder="Search models, tags, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '15px 20px',
              borderRadius: '12px',
              fontSize: '16px',
              marginBottom: '25px'
            }}
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '15px'
          }}>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: '15px',
                  background: selectedCategory === category.id ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `2px solid ${selectedCategory === category.id ? '#667eea' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '5px' }}>
                  {category.icon}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>
                  {category.name}
                </div>
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '3px' }}>
                  {category.count}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Model Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '25px',
          marginBottom: '40px'
        }}>
          {filteredModels.map(model => (
            <div
              key={model.id}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '20px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => handlePreview(model)}
            >
              <div style={{
                width: '100%',
                height: '200px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '80px',
                marginBottom: '15px',
                position: 'relative'
              }}>
                {model.thumbnail}
                {model.isPremium && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    👑 PRO
                  </div>
                )}
              </div>

              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                marginBottom: '10px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {model.name}
              </h3>

              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '15px',
                flexWrap: 'wrap'
              }}>
                {model.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    style={{
                      padding: '4px 10px',
                      background: 'rgba(102, 126, 234, 0.2)',
                      border: '1px solid rgba(102, 126, 234, 0.4)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#aaa'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#aaa',
                marginBottom: '15px'
              }}>
                <span>{model.format}</span>
                <span>{model.size}</span>
                <span>{model.polygons} polys</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleImport(model);
                }}
                style={{
                  width: '100%',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                ⬇️ Import
              </button>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredModels.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#aaa'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
            <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>No models found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}

        {/* Model Preview Modal */}
        {selectedModel && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '40px'
            }}
            onClick={() => setSelectedModel(null)}
          >
            <div
              style={{
                background: 'rgba(26, 26, 46, 0.95)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '40px',
                maxWidth: '800px',
                width: '100%'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '30px'
              }}>
                <div>
                  <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>
                    {selectedModel.name}
                  </h2>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {selectedModel.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(102, 126, 234, 0.2)',
                          border: '1px solid rgba(102, 126, 234, 0.4)',
                          borderRadius: '15px',
                          fontSize: '12px',
                          color: '#aaa'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedModel(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: 'white',
                    padding: '10px 15px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '20px'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{
                width: '100%',
                height: '400px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '120px',
                marginBottom: '30px'
              }}>
                {selectedModel.thumbnail}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                marginBottom: '30px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>
                    Format
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>
                    {selectedModel.format}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>
                    File Size
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>
                    {selectedModel.size}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>
                    Polygons
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>
                    {selectedModel.polygons}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleImport(selectedModel)}
                style={{
                  width: '100%',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '18px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                ⬇️ Import to VR/AR Studio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
