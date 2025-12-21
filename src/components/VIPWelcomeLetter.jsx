import React, { useState } from 'react';

/**
 * VIP Welcome Letter - Shown to $1000 tier holders upon first login
 * Explains superpowers without revealing owner's specific use cases
 */

export const VIPWelcomeLetter = ({ onDismiss }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.95)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '900px',
        width: '100%',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        borderRadius: '20px',
        padding: '60px',
        color: '#fff',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* VIP Badge */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            padding: '15px 40px',
            borderRadius: '50px',
            fontSize: '1.2rem',
            fontWeight: '900',
            color: '#000',
            boxShadow: '0 6px 25px rgba(255, 215, 0, 0.5)',
            marginBottom: '20px'
          }}>
            👑 VIP MEMBER - $1000 TIER 👑
          </div>
        </div>

        {/* Page 1: Welcome */}
        {currentPage === 1 && (
          <div>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '900',
              textAlign: 'center',
              marginBottom: '30px',
              background: 'linear-gradient(135deg, #FFD700 0%, #FF6B6B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Welcome to Elite Access
            </h1>

            <div style={{
              fontSize: '1.3rem',
              lineHeight: '1.8',
              marginBottom: '40px',
              textAlign: 'center'
            }}>
              Thank you for joining the exclusive group of 100 VIP members who power this platform.
            </div>

            <div style={{
              background: 'rgba(255,215,0,0.1)',
              border: '2px solid rgba(255,215,0,0.3)',
              borderRadius: '15px',
              padding: '30px',
              marginBottom: '30px'
            }}>
              <h2 style={{
                fontSize: '1.8rem',
                marginBottom: '20px',
                color: '#FFD700'
              }}>
                Your VIP Benefits:
              </h2>

              <div style={{ fontSize: '1.2rem', lineHeight: '2' }}>
                <div style={{ marginBottom: '15px' }}>
                  ✅ <strong>FREE Lifetime Access</strong> - All content, all creators, forever
                </div>
                <div style={{ marginBottom: '15px' }}>
                  ✅ <strong>Three AI Superpowers</strong> - Advanced tools unavailable to others
                </div>
                <div style={{ marginBottom: '15px' }}>
                  ✅ <strong>Zero Monthly Fees</strong> - No subscriptions, no per-creator charges
                </div>
                <div style={{ marginBottom: '15px' }}>
                  ✅ <strong>Priority Support</strong> - Direct access to platform assistance
                </div>
                <div>
                  ✅ <strong>Exclusive Community</strong> - Join 99 other elite members
                </div>
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              fontSize: '1.1rem',
              opacity: 0.9
            }}>
              The next pages will explain your three exclusive AI superpowers.
            </div>
          </div>
        )}

        {/* Page 2: Universal AI Content Generator */}
        {currentPage === 2 && (
          <div>
            <div style={{
              textAlign: 'center',
              fontSize: '5rem',
              marginBottom: '20px'
            }}>
              ⚡
            </div>

            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              textAlign: 'center',
              marginBottom: '30px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Superpower #1: Universal AI Generator
            </h1>

            <div style={{
              fontSize: '1.2rem',
              lineHeight: '1.8',
              marginBottom: '30px'
            }}>
              <p style={{ marginBottom: '20px' }}>
                Create <strong>any type of content</strong> from reference images and your creative vision.
              </p>

              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '15px',
                padding: '30px',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#f093fb' }}>
                  How It Works:
                </h3>
                <ol style={{ paddingLeft: '25px', lineHeight: '2' }}>
                  <li>Upload reference images (characters, scenes, objects, anything)</li>
                  <li>Describe what you want to create in detailed context</li>
                  <li>Choose content type: Video, Image, Audio, or Animation</li>
                  <li>Select output style: Realistic, Anime, Artistic, Cinematic, 3D, or Pixel Art</li>
                  <li>AI generates your custom content</li>
                </ol>
              </div>

              <div style={{
                background: 'rgba(240,147,251,0.1)',
                border: '2px solid rgba(240,147,251,0.3)',
                borderRadius: '15px',
                padding: '25px'
              }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#f5576c' }}>
                  Advanced Features:
                </h3>
                <ul style={{ paddingLeft: '25px', lineHeight: '2' }}>
                  <li><strong>Style Transfer Technology</strong> - Creates similar content without copying originals (avoids copyright)</li>
                  <li><strong>Context-Aware AI</strong> - Understands your creative vision and generates accordingly</li>
                  <li><strong>Multi-Format Output</strong> - Videos, images, audio, animations - all from one tool</li>
                  <li><strong>Professional Quality</strong> - HD output suitable for commercial use</li>
                </ul>
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              fontSize: '1.1rem',
              opacity: 0.8,
              fontStyle: 'italic'
            }}>
              Use this power for any creative project - the possibilities are limitless.
            </div>
          </div>
        )}

        {/* Page 3: AI Studio */}
        {currentPage === 3 && (
          <div>
            <div style={{
              textAlign: 'center',
              fontSize: '5rem',
              marginBottom: '20px'
            }}>
              🎨
            </div>

            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              textAlign: 'center',
              marginBottom: '30px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Superpower #2: AI Studio
            </h1>

            <div style={{
              fontSize: '1.2rem',
              lineHeight: '1.8',
              marginBottom: '30px'
            }}>
              <p style={{ marginBottom: '20px' }}>
                A specialized suite of <strong>three powerful AI modules</strong> for advanced content creation.
              </p>

              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '15px',
                padding: '30px',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#667eea' }}>
                  Module 1: Character Recognition
                </h3>
                <p style={{ marginBottom: '15px' }}>
                  Upload any character image and AI identifies:
                </p>
                <ul style={{ paddingLeft: '25px', lineHeight: '1.8' }}>
                  <li>Character name and source material</li>
                  <li>Visual traits and characteristics</li>
                  <li>Voice profile for synthesis</li>
                  <li>95%+ accuracy confidence scores</li>
                </ul>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '15px',
                padding: '30px',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#764ba2' }}>
                  Module 2: Voice Synthesis
                </h3>
                <p style={{ marginBottom: '15px' }}>
                  Generate character voice audio:
                </p>
                <ul style={{ paddingLeft: '25px', lineHeight: '1.8' }}>
                  <li>Input text → Character speaks it in their voice</li>
                  <li>High-quality voice cloning technology</li>
                  <li>Natural speech patterns and emotions</li>
                  <li>Export audio files for any project</li>
                </ul>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '15px',
                padding: '30px'
              }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#f5576c' }}>
                  Module 3: CGI Video Generator
                </h3>
                <p style={{ marginBottom: '15px' }}>
                  Create CGI videos with:
                </p>
                <ul style={{ paddingLeft: '25px', lineHeight: '1.8' }}>
                  <li>Multiple reference images</li>
                  <li>Generated voice audio integration</li>
                  <li>Style presets (realistic, anime, artistic, cinematic)</li>
                  <li>Style transfer to avoid copyright issues</li>
                </ul>
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              fontSize: '1.1rem',
              opacity: 0.8,
              fontStyle: 'italic'
            }}>
              Perfect for content creators, artists, and storytellers.
            </div>
          </div>
        )}

        {/* Page 4: Facial Media Sorter */}
        {currentPage === 4 && (
          <div>
            <div style={{
              textAlign: 'center',
              fontSize: '5rem',
              marginBottom: '20px'
            }}>
              👤
            </div>

            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '900',
              textAlign: 'center',
              marginBottom: '30px',
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Superpower #3: Facial Media Sorter
            </h1>

            <div style={{
              fontSize: '1.2rem',
              lineHeight: '1.8',
              marginBottom: '30px'
            }}>
              <p style={{ marginBottom: '20px' }}>
                <strong>Organize thousands of images instantly</strong> with AI-powered facial recognition and intelligent naming.
              </p>

              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '15px',
                padding: '30px',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#00d4ff' }}>
                  The Problem It Solves:
                </h3>
                <p style={{ lineHeight: '1.8' }}>
                  Have hundreds or thousands of images that need organizing? Manually sorting and naming them would take days or weeks. This tool does it automatically in minutes.
                </p>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '15px',
                padding: '30px',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#0099ff' }}>
                  How It Works:
                </h3>
                <ol style={{ paddingLeft: '25px', lineHeight: '2' }}>
                  <li><strong>Bulk Upload</strong> - Drop in hundreds or thousands of images</li>
                  <li><strong>AI Analysis</strong> - Detects and groups all faces automatically</li>
                  <li><strong>Smart Naming</strong> - Assign character names to each group</li>
                  <li><strong>Sequential Numbering</strong> - Files renamed: CharacterName_001.jpg, CharacterName_002.jpg, etc.</li>
                  <li><strong>Organized Download</strong> - Get all files properly named and sorted</li>
                </ol>
              </div>

              <div style={{
                background: 'rgba(0,212,255,0.1)',
                border: '2px solid rgba(0,212,255,0.3)',
                borderRadius: '15px',
                padding: '25px'
              }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#00d4ff' }}>
                  Key Features:
                </h3>
                <ul style={{ paddingLeft: '25px', lineHeight: '2' }}>
                  <li><strong>Face Detection</strong> - Identifies all faces across your image library</li>
                  <li><strong>Face Clustering</strong> - Groups identical faces together automatically</li>
                  <li><strong>Character Recognition</strong> - AI suggests character names</li>
                  <li><strong>Batch Renaming</strong> - Apply naming rules to entire groups instantly</li>
                  <li><strong>Group Downloads</strong> - Download by character or all at once</li>
                </ul>
              </div>
            </div>

            <div style={{
              textAlign: 'center',
              fontSize: '1.1rem',
              opacity: 0.8,
              fontStyle: 'italic'
            }}>
              Save hours of manual work - let AI organize your media library.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '50px',
          paddingTop: '30px',
          borderTop: '2px solid rgba(255,255,255,0.1)'
        }}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '15px 30px',
              background: currentPage === 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            ← Previous
          </button>

          <div style={{
            display: 'flex',
            gap: '10px'
          }}>
            {[1, 2, 3, 4].map(page => (
              <div
                key={page}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: currentPage === page ? '#FFD700' : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </div>

          {currentPage < totalPages ? (
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              style={{
                padding: '15px 30px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={onDismiss}
              style={{
                padding: '15px 40px',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontSize: '1.2rem',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)'
              }}
            >
              Enter Platform →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
