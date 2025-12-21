/* eslint-disable */
import React, { useState } from 'react';
// import { ARViewer, AR3DCard } from "./ARViewer";
// import { VRGallery, VRGalleryCard } from "./VRGallery";
// import { CloudUploader } from "./CloudUploader";
import { PaymentGate, useUserTier } from "./PaymentGate";
import { AIContentGenerator } from "./AIContentGenerator";
import { VRContentManager } from "./VRContentManager";
import { CGIConverter } from "./CGIConverter";

export function ARVRContentPanel({ userId }) {
  const { tier, loading } = useUserTier(userId);
  const [selectedAR, setSelectedAR] = useState(null);
  const [selectedVR, setSelectedVR] = useState(null);
  const [userContent, setUserContent] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  const handleUploadComplete = (urls) => {
    const newContent = urls.map(file => ({
      id: Date.now() + Math.random(),
      ...file,
      uploadedBy: userId,
      createdAt: new Date().toISOString()
    }));
    setUserContent(prev => [...newContent, ...prev]);
  };

  // Filter 3D models for AR
  const arContent = userContent.filter(item =>
    item.filename?.match(/\.(glb|gltf)$/i)
  );

  // Filter images for VR gallery
  const vrContent = userContent.filter(item =>
    item.filename?.match(/\.(jpg|jpeg|png|webp)$/i)
  );

  return (
    <PaymentGate requiredTier="CREATOR" currentTier={tier} userId={userId}>
      <div style={{ padding: '24px' }}>
        <h2 style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          ✨ AR/VR Content Studio
        </h2>

        <div style={{
          background: 'rgba(102, 126, 234, 0.1)',
          padding: '15px 20px',
          borderRadius: '10px',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '24px' }}>
            {tier === 'SUPER_ADMIN' ? '👑' : '💎'}
          </span>
          <div>
            <strong>
              {tier === 'SUPER_ADMIN' ? 'Super Admin' : 'Creator Pro'}
            </strong>
            {' • '}
            <span style={{ opacity: 0.8 }}>100% profit on all sales</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          borderBottom: '2px solid #eee'
        }}>
          {[
            { id: 'upload', label: '☁️ Upload', visible: true },
            { id: 'ar', label: '👓 AR Content', visible: true },
            { id: 'vr', label: '🥽 VR Galleries', visible: true },
            { id: 'ai', label: '🤖 AI Generator', visible: tier === 'SUPER_ADMIN' }
          ].filter(tab => tab.visible).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#666',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div>
            <div style={{ 
              padding: '40px', 
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: '12px',
              border: '2px dashed rgba(102, 126, 234, 0.3)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>☁️</div>
              <h3>Cloud Upload Coming Soon</h3>
              <p style={{ color: '#666', marginTop: '8px' }}>Upload AR/VR content directly to the cloud</p>
            </div>
          </div>
        )}

        {/* AR Content Tab */}
        {activeTab === 'ar' && (
          <div>
            <h3 style={{
              fontSize: '24px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              👓 AR 3D Models ({arContent.length})
            </h3>

            {selectedAR ? (
              <div>
                <button
                  onClick={() => setSelectedAR(null)}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    marginBottom: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  ← Back to Gallery
                </button>
                <ARViewer modelUrl={selectedAR.url} title={selectedAR.filename} />
              </div>
            ) : arContent.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {arContent.map(item => (
                  <AR3DCard
                    key={item.id}
                    title={item.filename}
                    modelUrl={item.url}
                    thumbnail={null}
                    onClick={() => setSelectedAR(item)}
                  />
                ))}
              </div>
            ) : (
              <div style={{
                background: 'rgba(102, 126, 234, 0.1)',
                border: '2px dashed rgba(102, 126, 234, 0.3)',
                borderRadius: '15px',
                padding: '40px',
                textAlign: 'center',
                color: '#666'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎭</div>
                <p>No AR content yet. Upload .glb or .gltf 3D models to get started!</p>
              </div>
            )}
          </div>
        )}

        {/* VR Gallery Tab */}
        {activeTab === 'vr' && (
          <div>
            <h3 style={{
              fontSize: '24px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              🥽 VR Galleries ({Math.ceil(vrContent.length / 8)})
            </h3>

            {selectedVR ? (
              <div>
                <button
                  onClick={() => setSelectedVR(null)}
                  style={{
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    marginBottom: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  ← Back to Galleries
                </button>
                <VRGallery
                  title={selectedVR.title}
                  items={selectedVR.items.map(img => ({
                    title: img.filename,
                    image: img.url,
                    onClick: () => window.open(img.url, '_blank')
                  }))}
                />
              </div>
            ) : vrContent.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {Array.from({ length: Math.ceil(vrContent.length / 8) }).map((_, i) => {
                  const galleryItems = vrContent.slice(i * 8, (i + 1) * 8);
                  return (
                    <VRGalleryCard
                      key={i}
                      title={`Gallery ${i + 1}`}
                      itemCount={galleryItems.length}
                      thumbnail={galleryItems[0]?.url}
                      onClick={() => setSelectedVR({
                        title: `Gallery ${i + 1}`,
                        items: galleryItems
                      })}
                    />
                  );
                })}
              </div>
            ) : (
              <div style={{
                background: 'rgba(118, 75, 162, 0.1)',
                border: '2px dashed rgba(118, 75, 162, 0.3)',
                borderRadius: '15px',
                padding: '40px',
                textAlign: 'center',
                color: '#666'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎨</div>
                <p>No VR galleries yet. Upload 8+ images to create your first VR gallery!</p>
              </div>
            )}
          </div>
        )}

        {/* AI Generator Tab - Super Admin Only */}
        {activeTab === 'ai' && tier === 'SUPER_ADMIN' && (
          <AIContentGenerator userId={userId} />
        )}
      </div>
    </PaymentGate>
  );
}

// Export alias for backwards compatibility
export { ARVRContentPanel as ARVRContentPanelWithPaywall };
