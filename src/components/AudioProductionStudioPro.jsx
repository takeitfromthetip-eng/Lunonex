/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';
import { AudioProductionStudio as AudioStudioOriginal } from './AudioProductionStudio';

/**
 * AudioProductionStudioPro - Professional DAW interface
 * Industry-standard UI inspired by Pro Tools, Logic Pro, Ableton Live
 */
export function AudioProductionStudioPro({ userId }) {
    const [activeView, setActiveView] = useState('mixer');
    const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
    const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
    const [bpm, setBpm] = useState(120);
    const [timeSignature, setTimeSignature] = useState('4/4');
    const [masterVolume, setMasterVolume] = useState(80);

    const VIEWS = [
        { id: 'mixer', name: 'Mixer', icon: '🎚️' },
        { id: 'arrange', name: 'Arrangement', icon: '🎼' },
        { id: 'edit', name: 'Editor', icon: '✂️' },
        { id: 'effects', name: 'Effects', icon: '🎛️' },
        { id: 'beats', name: 'Beat Maker', icon: '🥁' },
        { id: 'vocals', name: 'Vocal Studio', icon: '🎤' },
        { id: 'mastering', name: 'Mastering', icon: '💿' }
    ];

    return (
        <div className="audio-production-pro">
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
                        🎵 Audio Production
                    </h2>

                    {/* View Selector Dropdown */}
                    <select
                        value={activeView}
                        onChange={(e) => setActiveView(e.target.value)}
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
                        {VIEWS.map(view => (
                            <option key={view.id} value={view.id}>
                                {view.icon} {view.name}
                            </option>
                        ))}
                    </select>

                    {/* Transport Controls */}
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '20px' }}>
                        <button
                            style={{
                                background: '#404040',
                                border: '1px solid #555',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                color: '#cccccc',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                            title="Play/Pause"
                        >
                            ▶️
                        </button>
                        <button
                            style={{
                                background: '#404040',
                                border: '1px solid #555',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                color: '#cccccc',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                            title="Stop"
                        >
                            ⏹️
                        </button>
                        <button
                            style={{
                                background: '#c41e3a',
                                border: '1px solid #a01828',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                color: '#ffffff',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                            title="Record"
                        >
                            ⏺️
                        </button>
                        <button
                            style={{
                                background: '#404040',
                                border: '1px solid #555',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                color: '#cccccc',
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}
                            title="Loop"
                        >
                            🔁
                        </button>
                    </div>

                    {/* Tempo & Time Signature */}
                    <div style={{ display: 'flex', gap: '12px', marginLeft: '20px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '12px', color: '#999' }}>BPM:</span>
                            <input
                                type="number"
                                value={bpm}
                                onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
                                min="40"
                                max="300"
                                style={{
                                    background: '#1e1e1e',
                                    border: '1px solid #3e3e3e',
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    color: '#cccccc',
                                    fontSize: '13px',
                                    width: '60px'
                                }}
                            />
                        </div>
                        <select
                            value={timeSignature}
                            onChange={(e) => setTimeSignature(e.target.value)}
                            style={{
                                background: '#1e1e1e',
                                border: '1px solid #3e3e3e',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                color: '#cccccc',
                                fontSize: '13px'
                            }}
                        >
                            <option>4/4</option>
                            <option>3/4</option>
                            <option>6/8</option>
                            <option>5/4</option>
                            <option>7/8</option>
                        </select>
                    </div>
                </div>

                {/* Right-side controls */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '12px' }}>
                        <span style={{ fontSize: '12px', color: '#999' }}>Master</span>
                        <input
                            type="range"
                            value={masterVolume}
                            onChange={(e) => setMasterVolume(parseInt(e.target.value))}
                            min="0"
                            max="100"
                            style={{ width: '100px' }}
                        />
                        <span style={{ fontSize: '12px', color: '#cccccc', width: '35px' }}>{masterVolume}%</span>
                    </div>
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
                        title="Toggle Browser"
                    >
                        📁
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
                        ℹ️
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div style={{
                display: 'flex',
                height: 'calc(100vh - 61px)',
                background: '#1e1e1e'
            }}>
                {/* Left Panel - Browser/Samples */}
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
                                Quick Access
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {VIEWS.map(view => (
                                    <button
                                        key={view.id}
                                        onClick={() => setActiveView(view.id)}
                                        style={{
                                            background: activeView === view.id ? '#404040' : 'transparent',
                                            border: activeView === view.id ? '1px solid #555' : '1px solid transparent',
                                            borderRadius: '4px',
                                            padding: '10px 12px',
                                            color: activeView === view.id ? '#ffffff' : '#cccccc',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            textAlign: 'left',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span style={{ fontSize: '16px' }}>{view.icon}</span>
                                        <span>{view.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sample Browser */}
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
                                Sample Library
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {['🥁 Drums', '🎹 Keys', '🎸 Guitar', '🎻 Strings', '🎺 Brass', '🎵 FX'].map((category, idx) => (
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

                        {/* Effects Rack */}
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
                                Effects
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {['EQ', 'Compressor', 'Reverb', 'Delay', 'Chorus', 'Distortion'].map((effect, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: '6px 8px',
                                            background: '#252525',
                                            borderRadius: '3px',
                                            fontSize: '11px',
                                            color: '#999',
                                            cursor: 'grab'
                                        }}
                                        draggable
                                    >
                                        {effect}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Center - Main Work Area */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    background: '#1a1a1a',
                    position: 'relative'
                }}>
                    {/* Render original studio component inside */}
                    <div style={{ padding: '20px' }}>
                        <AudioStudioOriginal userId={userId} />
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
                            Track Inspector
                        </h3>

                        {/* Track Properties */}
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
                                Track 1 - Audio
                            </h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <label style={{
                                        fontSize: '11px',
                                        color: '#999',
                                        display: 'block',
                                        marginBottom: '6px'
                                    }}>
                                        Track Name
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="Audio Track 1"
                                        style={{
                                            width: '100%',
                                            background: '#252525',
                                            border: '1px solid #3e3e3e',
                                            borderRadius: '4px',
                                            padding: '6px',
                                            color: '#cccccc',
                                            fontSize: '12px'
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
                                        Volume
                                    </label>
                                    <input
                                        type="range"
                                        defaultValue="80"
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
                                        Pan
                                    </label>
                                    <input
                                        type="range"
                                        defaultValue="50"
                                        min="0"
                                        max="100"
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button style={{
                                        flex: 1,
                                        background: '#404040',
                                        border: '1px solid #555',
                                        borderRadius: '4px',
                                        padding: '8px',
                                        color: '#cccccc',
                                        cursor: 'pointer',
                                        fontSize: '11px'
                                    }}>
                                        Mute
                                    </button>
                                    <button style={{
                                        flex: 1,
                                        background: '#404040',
                                        border: '1px solid #555',
                                        borderRadius: '4px',
                                        padding: '8px',
                                        color: '#cccccc',
                                        cursor: 'pointer',
                                        fontSize: '11px'
                                    }}>
                                        Solo
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Plugin Chain */}
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
                                Plugin Chain
                            </h4>
                            <div style={{
                                fontSize: '11px',
                                color: '#666',
                                textAlign: 'center',
                                padding: '20px'
                            }}>
                                Drop effects here
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
                                    🎤 Record Audio
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
                                    📂 Import Files
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
                                    💾 Export Mix
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .audio-production-pro {
          background: #1e1e1e;
          color: #cccccc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          min-height: 100vh;
        }

        .audio-production-pro select:focus,
        .audio-production-pro button:focus,
        .audio-production-pro input:focus {
          outline: 2px solid #4a9eff;
          outline-offset: 2px;
        }

        .audio-production-pro button:hover {
          opacity: 0.9;
        }

        .audio-production-pro input[type="range"] {
          accent-color: #4a9eff;
        }
      `}</style>
        </div>
    );
}
