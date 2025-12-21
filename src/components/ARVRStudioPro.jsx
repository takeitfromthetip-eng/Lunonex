import React, { useState } from 'react';
import { ARVRContentPanelWithPaywall as ARVROriginal } from './ARVRContentPanelWithPaywall';

/**
 * ARVRStudioPro - Professional AR/VR content creation interface
 * Industry-standard UI inspired by Unity, Unreal Engine, Blender
 */
export function ARVRStudioPro({ userId }) {
  const [activeMode, setActiveMode] = useState('ar');
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  const MODES = [
    { id: 'ar', name: 'AR Creator', icon: '📱' },
    { id: 'vr', name: 'VR Studio', icon: '🥽' },
    { id: '3d', name: '3D Modeling', icon: '🎨' },
    { id: 'animation', name: 'Animation', icon: '🎬' },
    { id: 'effects', name: 'Effects', icon: '✨' }
  ];

  return (
    <div className="arvr-studio-pro">
      {/* Professional Header */}
      <div className="professional-header" style={{
        background: '#2d2d2d',
        borderBottom: '1px solid #3e3e3e',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#cccccc' }}>
            🎭 AR/VR Studio
          </h2>

          {/* Mode Selector Dropdown */}
          <select
            value={activeMode}
            onChange={(e) => setActiveMode(e.target.value)}
            style={{
              background: '#1e1e1e',
              border: '1px solid #3e3e3e',
              borderRadius: '4px',
              padding: '8px 32px 8px 12px',
              color: '#cccccc',
              fontSize: '14px',
              cursor: 'pointer',
              minWidth: '200px'
            }}
          >
            {MODES.map(mode => (
              <option key={mode.id} value={mode.id}>
                {mode.icon} {mode.name}
              </option>
            ))}
          </select>

          {/* View Controls */}
          <div style={{ display: 'flex', gap: '8px', marginLeft: '20px' }}>
            <button
              style={{
                background: '#404040',
                border: '1px solid #555',
                borderRadius: '4px',
                padding: '6px 12px',
                color: '#cccccc',
                cursor: 'pointer',
                fontSize: '11px'
              }}
              title="Perspective View"
            >
              Perspective
            </button>
            <button
              style={{
                background: '#404040',
                border: '1px solid #555',
                borderRadius: '4px',
                padding: '6px 12px',
                color: '#cccccc',
                cursor: 'pointer',
                fontSize: '11px'
              }}
              title="Top View"
            >
              Top
            </button>
            <button
              style={{
                background: '#404040',
                border: '1px solid #555',
                borderRadius: '4px',
                padding: '6px 12px',
                color: '#cccccc',
                cursor: 'pointer',
                fontSize: '11px'
              }}
              title="Front View"
            >
              Front
            </button>
            <button
              style={{
                background: '#404040',
                border: '1px solid #555',
                borderRadius: '4px',
                padding: '6px 12px',
                color: '#cccccc',
                cursor: 'pointer',
                fontSize: '11px'
              }}
              title="Side View"
            >
              Side
            </button>
          </div>
        </div>

        {/* Right-side controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            style={{
              background: '#4a9eff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            ▶️ Preview
          </button>
          <button
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            style={{
              background: leftPanelCollapsed ? '#404040' : 'transparent',
              border: '1px solid #3e3e3e',
              borderRadius: '4px',
              padding: '6px 12px',
              color: '#cccccc',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title="Toggle Hierarchy"
          >
            📋
          </button>
          <button
            onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            style={{
              background: rightPanelCollapsed ? '#404040' : 'transparent',
              border: '1px solid #3e3e3e',
              borderRadius: '4px',
              padding: '6px 12px',
              color: '#cccccc',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title="Toggle Inspector"
          >
            🔧
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 61px)',
        background: '#1e1e1e'
      }}>
        {/* Left Panel - Scene Hierarchy */}
        {!leftPanelCollapsed && (
          <div style={{
            width: '280px',
            background: '#252525',
            borderRight: '1px solid #3e3e3e',
            overflowY: 'auto',
            padding: '16px'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#999',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px'
              }}>
                Scene Hierarchy
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { name: '📹 Main Camera', level: 0 },
                  { name: '💡 Directional Light', level: 0 },
                  { name: '🎨 Environment', level: 0 },
                  { name: '  🌳 Ground Plane', level: 1 },
                  { name: '  🏔️ Background', level: 1 },
                  { name: '🎭 AR Objects', level: 0 },
                  { name: '  📦 Model_01', level: 1 },
                  { name: '  📦 Model_02', level: 1 }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px',
                      paddingLeft: `${8 + item.level * 16}px`,
                      background: idx === 6 ? '#404040' : 'transparent',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#cccccc',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d2d'}
                    onMouseLeave={(e) => e.currentTarget.style.background = idx === 6 ? '#404040' : 'transparent'}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
              <button
                style={{
                  width: '100%',
                  marginTop: '12px',
                  background: '#404040',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  padding: '8px',
                  color: '#cccccc',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                + Add Object
              </button>
            </div>

            {/* Asset Library */}
            <div style={{
              background: '#1e1e1e',
              border: '1px solid #3e3e3e',
              borderRadius: '6px',
              padding: '16px',
              marginTop: '20px'
            }}>
              <h4 style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#ffffff',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Asset Library
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['📦 3D Models', '🎨 Materials', '🖼️ Textures', '🎬 Animations', '🔊 Audio', '✨ Particles'].map((category, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px',
                      background: '#252525',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#cccccc',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2d2d2d'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#252525'}
                  >
                    {category}
                  </div>
                ))}
              </div>
            </div>

            {/* Modes */}
            <div style={{
              background: '#1e1e1e',
              border: '1px solid #3e3e3e',
              borderRadius: '6px',
              padding: '16px',
              marginTop: '16px'
            }}>
              <h4 style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#ffffff',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Creation Modes
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {MODES.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setActiveMode(mode.id)}
                    style={{
                      background: activeMode === mode.id ? '#404040' : '#252525',
                      border: activeMode === mode.id ? '1px solid #555' : '1px solid transparent',
                      borderRadius: '4px',
                      padding: '8px 10px',
                      color: activeMode === mode.id ? '#ffffff' : '#cccccc',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{mode.icon}</span>
                    <span>{mode.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Center - Viewport/3D View */}
        <div style={{
          flex: 1,
          background: '#1a1a1a',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Grid Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(70, 70, 70, 0.3) 25%, rgba(70, 70, 70, 0.3) 26%, transparent 27%, transparent 74%, rgba(70, 70, 70, 0.3) 75%, rgba(70, 70, 70, 0.3) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(70, 70, 70, 0.3) 25%, rgba(70, 70, 70, 0.3) 26%, transparent 27%, transparent 74%, rgba(70, 70, 70, 0.3) 75%, rgba(70, 70, 70, 0.3) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px',
            pointerEvents: 'none'
          }} />

          {/* Original AR/VR Component */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            padding: '20px'
          }}>
            <ARVROriginal userId={userId} />
          </div>

          {/* Viewport Controls */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            display: 'flex',
            gap: '8px'
          }}>
            <button
              style={{
                background: '#404040',
                border: '1px solid #555',
                borderRadius: '4px',
                padding: '8px 12px',
                color: '#cccccc',
                cursor: 'pointer',
                fontSize: '11px',
                backdropFilter: 'blur(10px)'
              }}
              title="Select Tool"
            >
              ↖️ Select
            </button>
            <button
              style={{
                background: '#404040',
                border: '1px solid #555',
                borderRadius: '4px',
                padding: '8px 12px',
                color: '#cccccc',
                cursor: 'pointer',
                fontSize: '11px',
                backdropFilter: 'blur(10px)'
              }}
              title="Move Tool"
            >
              ↔️ Move
            </button>
            <button
              style={{
                background: '#404040',
                border: '1px solid #555',
                borderRadius: '4px',
                padding: '8px 12px',
                color: '#cccccc',
                cursor: 'pointer',
                fontSize: '11px',
                backdropFilter: 'blur(10px)'
              }}
              title="Rotate Tool"
            >
              🔄 Rotate
            </button>
            <button
              style={{
                background: '#404040',
                border: '1px solid #555',
                borderRadius: '4px',
                padding: '8px 12px',
                color: '#cccccc',
                cursor: 'pointer',
                fontSize: '11px',
                backdropFilter: 'blur(10px)'
              }}
              title="Scale Tool"
            >
              ⤢ Scale
            </button>
          </div>
        </div>

        {/* Right Panel - Inspector/Properties */}
        {!rightPanelCollapsed && (
          <div style={{
            width: '320px',
            background: '#252525',
            borderLeft: '1px solid #3e3e3e',
            overflowY: 'auto',
            padding: '16px'
          }}>
            <h3 style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '16px'
            }}>
              Inspector
            </h3>

            {/* Transform Properties */}
            <div style={{
              background: '#1e1e1e',
              border: '1px solid #3e3e3e',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h4 style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#ffffff',
                marginBottom: '12px'
              }}>
                Transform
              </h4>

              {['Position', 'Rotation', 'Scale'].map((prop) => (
                <div key={prop} style={{ marginBottom: '12px' }}>
                  <label style={{
                    fontSize: '11px',
                    color: '#999',
                    display: 'block',
                    marginBottom: '6px'
                  }}>
                    {prop}
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['X', 'Y', 'Z'].map((axis) => (
                      <div key={axis} style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '10px',
                          color: '#666',
                          marginBottom: '2px'
                        }}>
                          {axis}
                        </div>
                        <input
                          type="number"
                          defaultValue={prop === 'Scale' ? '1.00' : '0.00'}
                          step="0.01"
                          style={{
                            width: '100%',
                            background: '#252525',
                            border: '1px solid #3e3e3e',
                            borderRadius: '3px',
                            padding: '4px 6px',
                            color: '#cccccc',
                            fontSize: '11px'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Material Properties */}
            <div style={{
              background: '#1e1e1e',
              border: '1px solid #3e3e3e',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h4 style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#ffffff',
                marginBottom: '12px'
              }}>
                Material
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{
                    fontSize: '11px',
                    color: '#999',
                    display: 'block',
                    marginBottom: '6px'
                  }}>
                    Shader
                  </label>
                  <select style={{
                    width: '100%',
                    background: '#252525',
                    border: '1px solid #3e3e3e',
                    borderRadius: '4px',
                    padding: '6px',
                    color: '#cccccc',
                    fontSize: '11px'
                  }}>
                    <option>Standard</option>
                    <option>Metallic</option>
                    <option>Glossy</option>
                    <option>Emissive</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    fontSize: '11px',
                    color: '#999',
                    display: 'block',
                    marginBottom: '6px'
                  }}>
                    Base Color
                  </label>
                  <input
                    type="color"
                    defaultValue="#ffffff"
                    style={{
                      width: '100%',
                      height: '32px',
                      background: '#252525',
                      border: '1px solid #3e3e3e',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    fontSize: '11px',
                    color: '#999',
                    display: 'block',
                    marginBottom: '6px'
                  }}>
                    Metallic
                  </label>
                  <input
                    type="range"
                    defaultValue="0"
                    min="0"
                    max="100"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{
                    fontSize: '11px',
                    color: '#999',
                    display: 'block',
                    marginBottom: '6px'
                  }}>
                    Roughness
                  </label>
                  <input
                    type="range"
                    defaultValue="50"
                    min="0"
                    max="100"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#999',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px'
              }}>
                Quick Actions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button style={{
                  background: '#404040',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  padding: '10px',
                  color: '#cccccc',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textAlign: 'left'
                }}>
                  📦 Import Model
                </button>
                <button style={{
                  background: '#404040',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  padding: '10px',
                  color: '#cccccc',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textAlign: 'left'
                }}>
                  💾 Export Scene
                </button>
                <button style={{
                  background: '#404040',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  padding: '10px',
                  color: '#cccccc',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textAlign: 'left'
                }}>
                  📱 Test on Device
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .arvr-studio-pro {
          background: #1e1e1e;
          color: #cccccc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          min-height: 100vh;
        }

        .arvr-studio-pro select:focus,
        .arvr-studio-pro button:focus,
        .arvr-studio-pro input:focus {
          outline: 2px solid #4a9eff;
          outline-offset: 2px;
        }

        .arvr-studio-pro button:hover {
          opacity: 0.9;
        }

        .arvr-studio-pro input[type="range"] {
          accent-color: #4a9eff;
        }
      `}</style>
    </div>
  );
}
