/* eslint-disable */
import React, { useState } from 'react';
import { analyzeImagesForFaces, enhanceGroupsWithSuggestions } from '../utils/clientFaceDetection';

/**
 * Facial Media Sorter - FREE for everyone!
 *
 * Uses client-side TensorFlow.js face detection (no API keys needed)
 * Detects faces, groups by similarity, organizes with smart naming
 *
 * FREE: Full facial sorting with AI grouping
 * ENHANCED (Secret): Advanced character suggestions (requires super_admin_powers)
 */

export const FacialMediaSorter = ({ userId, tier, hasSuperAdminPowers = false }) => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0, facesFound: 0 });
  const [groupedFaces, setGroupedFaces] = useState([]);
  const [renamingRules, setRenamingRules] = useState({});

  const handleBulkUpload = (e) => {
    const files = Array.from(e.target.files);
    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            url: event.target.result,
            name: file.name,
            size: file.size,
            originalFile: file
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(images => {
      setUploadedImages(prev => [...prev, ...images]);
    });
  };

  const handleAnalyze = async () => {
    if (uploadedImages.length === 0) {
      alert('Please upload images first');
      return;
    }

    setAnalyzing(true);
    setAnalysisProgress({ current: 0, total: uploadedImages.length, facesFound: 0 });

    try {
      // Use client-side face detection (free, no API keys)
      const result = await analyzeImagesForFaces(
        uploadedImages,
        (progress) => {
          setAnalysisProgress(progress);
        }
      );

      if (result.success && result.groups.length > 0) {
        // Enhance groups with smart suggestions
        const enhancedGroups = enhanceGroupsWithSuggestions(result.groups);
        setGroupedFaces(enhancedGroups);

        // Initialize renaming rules
        const rules = {};
        enhancedGroups.forEach(group => {
          rules[group.id] = {
            characterName: group.suggestedName,
            startNumber: 1
          };
        });
        setRenamingRules(rules);
      } else {
        alert('⚠️ No faces detected in uploaded images. Try different photos.');
      }
    } catch (error) {
      console.error('Face analysis error:', error);
      alert(`❌ Face detection failed: ${error.message}\n\nTry refreshing the page.`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleNameChange = (groupId, newName) => {
    setRenamingRules(prev => ({
      ...prev,
      [groupId]: newName
    }));
  };

  const handleApplyRenaming = () => {
    if (groupedFaces.length === 0) {
      alert('⚠️ No groups to download');
      return;
    }

    const totalImages = groupedFaces.reduce((sum, g) => sum + g.images.length, 0);
    const message = `📦 Downloading ${totalImages} images from ${groupedFaces.length} groups...\n\nFiles will be named according to your settings.\n\nYour browser may ask permission for multiple downloads.`;
    alert(message);

    let downloadIndex = 0;
    groupedFaces.forEach((group) => {
      const characterName = renamingRules[group.id] || group.suggestedName || `Character_${group.id}`;

      group.images.forEach((img, imgIndex) => {
        setTimeout(() => {
          try {
            const link = document.createElement('a');
            const fileName = `${characterName}_${String(imgIndex + 1).padStart(3, '0')}.jpg`;
            link.download = fileName;
            link.href = img.url;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (downloadIndex === totalImages - 1) {
              setTimeout(() => {
                alert('✅ All downloads complete!');
              }, 500);
            }
          } catch (error) {
            console.error('Download failed:', error);
            alert(`❌ Failed to download image from ${characterName}. Please try again.`);
          }
          downloadIndex++;
        }, downloadIndex * 800);
      });
    });
  };

  const handleDownloadGroup = (group) => {
    const characterName = renamingRules[group.id] || group.suggestedName || `Character_${group.id}`;
    const imageCount = group.images.length;

    if (imageCount === 0) {
      alert('⚠️ No images to download in this group');
      return;
    }

    alert(`📦 Downloading ${imageCount} images for ${characterName}...\n\nYour browser may ask permission for multiple downloads.`);

    group.images.forEach((img, index) => {
      setTimeout(() => {
        try {
          const link = document.createElement('a');
          const fileName = `${characterName}_${String(index + 1).padStart(3, '0')}.jpg`;
          link.download = fileName;
          link.href = img.url;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          if (index === imageCount - 1) {
            setTimeout(() => {
              alert(`✅ Download complete for ${characterName}!`);
            }, 500);
          }
        } catch (error) {
          console.error('Download failed:', error);
          alert(`❌ Failed to download ${fileName}. Please try again.`);
        }
      }, index * 800);
    });
  };

  return (
    <div style={{
      padding: '40px',
      maxWidth: '1600px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #141E30 0%, #243B55 100%)',
      borderRadius: '20px',
      color: '#fff',
      minHeight: '80vh'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <div style={{
          display: 'inline-block',
          background: hasSuperAdminPowers
            ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '8px 24px',
          borderRadius: '30px',
          fontSize: '0.9rem',
          fontWeight: '700',
          marginBottom: '20px',
          boxShadow: hasSuperAdminPowers
            ? '0 4px 15px rgba(139, 92, 246, 0.5)'
            : '0 4px 15px rgba(102, 126, 234, 0.4)'
        }}>
          👤 FACIAL RECOGNITION SORTER {hasSuperAdminPowers ? '🔥 ENHANCED' : '(FREE)'}
        </div>
        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: '900',
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Smart Media Organizer
        </h1>
        <p style={{
          fontSize: '1.2rem',
          opacity: 0.8,
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          Upload images → AI groups by face → Auto-name by character → Download organized
        </p>
      </div>

      {/* Upload Section */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <label style={{
            flex: 1,
            padding: '40px',
            border: '3px dashed rgba(255,255,255,0.3)',
            borderRadius: '15px',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.03)',
            transition: 'all 0.3s'
          }}
            onMouseEnter={(e) => e.target.style.borderColor = '#667eea'}
            onMouseLeave={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleBulkUpload}
              style={{ display: 'none' }}
            />
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📁</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              Upload Images for Analysis
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '10px' }}>
              {uploadedImages.length} images uploaded
            </div>
          </label>

          <button
            onClick={handleAnalyze}
            disabled={uploadedImages.length === 0 || analyzing}
            style={{
              padding: '40px 50px',
              background: (uploadedImages.length === 0 || analyzing) ? '#666' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '15px',
              color: '#fff',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: (uploadedImages.length === 0 || analyzing) ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              whiteSpace: 'nowrap'
            }}
          >
            {analyzing ? '🔄 Analyzing...' : '🔍 Analyze & Group'}
          </button>
        </div>

        {/* Stats Bar */}
        {uploadedImages.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '15px',
            padding: '20px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '10px',
            justifyContent: 'space-around'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#00d4ff' }}>
                {uploadedImages.length}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Total Images</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#667eea' }}>
                {groupedFaces.length}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Groups Found</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#28a745' }}>
                {groupedFaces.reduce((sum, g) => sum + g.faceCount, 0)}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Faces Detected</div>
            </div>
          </div>
        )}
      </div>

      {/* Analysis In Progress */}
      {analyzing && (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderRadius: '15px',
          border: '2px solid rgba(102, 126, 234, 0.3)',
          marginBottom: '40px'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '20px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            🧠
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '10px' }}>
            AI Face Detection in Progress
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '30px' }}>
            Processing {analysisProgress.current} of {analysisProgress.total} images...
          </div>
          <div style={{
            padding: '15px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '10px',
            maxWidth: '600px',
            margin: '0 auto 20px auto',
            fontSize: '0.9rem'
          }}>
            <strong>Pipeline:</strong> Face Detection → Feature Extraction → Similarity Clustering
          </div>
          <div style={{
            fontSize: '1.2rem',
            color: '#00d4ff',
            fontWeight: '700'
          }}>
            {analysisProgress.facesFound} faces detected so far
          </div>
        </div>
      )}

      {/* Grouped Results */}
      {groupedFaces.length > 0 && !analyzing && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px'
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>
              📊 Grouped by Face ({groupedFaces.length} groups)
            </h2>
            <button
              onClick={handleApplyRenaming}
              style={{
                padding: '15px 40px',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(40, 167, 69, 0.4)'
              }}
            >
              💾 Apply Renaming & Download All
            </button>
          </div>

          <div style={{ display: 'grid', gap: '30px' }}>
            {groupedFaces.map((group, index) => (
              <div
                key={group.id}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '15px',
                  padding: '30px',
                  border: '2px solid rgba(255,255,255,0.1)'
                }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '300px 1fr',
                  gap: '30px'
                }}>
                  {/* Group Info */}
                  <div>
                    <div style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '10px',
                      padding: '20px',
                      marginBottom: '20px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
                        👤
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                        Group {index + 1}
                      </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <strong>Detected Character:</strong>
                      <div style={{
                        marginTop: '5px',
                        padding: '10px',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '5px'
                      }}>
                        {group.detectedCharacter}
                      </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <strong>Face Count:</strong> {group.faceCount}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <strong>Confidence:</strong> {(group.confidence * 100).toFixed(1)}%
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                        📝 Set Character Name:
                      </label>
                      <input
                        type="text"
                        value={renamingRules[group.id] || group.suggestedName}
                        onChange={(e) => handleNameChange(group.id, e.target.value)}
                        placeholder="Character name..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(255,255,255,0.1)',
                          border: '2px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '1rem'
                        }}
                      />
                      <div style={{
                        marginTop: '10px',
                        fontSize: '0.85rem',
                        opacity: 0.7,
                        padding: '10px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '5px'
                      }}>
                        Files will be named:<br />
                        <strong>{renamingRules[group.id] || group.suggestedName}_001.jpg</strong><br />
                        <strong>{renamingRules[group.id] || group.suggestedName}_002.jpg</strong><br />
                        etc.
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadGroup(group)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      ⬇️ Download This Group
                    </button>
                  </div>

                  {/* Image Grid */}
                  <div>
                    <div style={{
                      marginBottom: '15px',
                      fontSize: '1.1rem',
                      fontWeight: '600'
                    }}>
                      Preview ({group.images.length} images):
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                      gap: '10px',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      padding: '10px',
                      background: 'rgba(0,0,0,0.2)',
                      borderRadius: '10px'
                    }}>
                      {group.images.slice(0, 20).map((img, i) => (
                        <div
                          key={i}
                          style={{
                            aspectRatio: '1/1',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '2px solid rgba(255,255,255,0.2)',
                            position: 'relative'
                          }}
                        >
                          <img
                            src={img.url}
                            alt={`${group.characterName} ${i + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: '5px',
                            right: '5px',
                            background: 'rgba(0,0,0,0.7)',
                            borderRadius: '5px',
                            padding: '3px 8px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {String(i + 1).padStart(3, '0')}
                          </div>
                        </div>
                      ))}
                      {group.images.length > 20 && (
                        <div style={{
                          aspectRatio: '1/1',
                          borderRadius: '8px',
                          border: '2px dashed rgba(255,255,255,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          opacity: 0.7
                        }}>
                          +{group.images.length - 20} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '15px',
        fontSize: '0.9rem',
        opacity: 0.8,
        textAlign: 'center'
      }}>
        <strong>🧠 AI-Powered Facial Recognition:</strong> This tool uses advanced face detection and clustering algorithms to automatically group your images by character, then applies intelligent naming with numerical sequences for easy organization.
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};
