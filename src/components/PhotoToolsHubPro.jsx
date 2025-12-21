import React, { useState } from 'react';
import { PhotoEnhancementSuite } from './PhotoEnhancementSuite';
import { DuplicatePhotoDetector } from './DuplicatePhotoDetector';
import { ProPhotoFilters } from './ProPhotoFilters';
import { BatchPhotoProcessor } from './BatchPhotoProcessor';
import { AdvancedPhotoEditor } from './AdvancedPhotoEditor';
import { MassPhotoProcessor } from './MassPhotoProcessor';
import { ProPhotoEditor } from './ProPhotoEditor';
import { MemeGenerator } from './MemeGenerator';
import { NFTMinter } from './NFTMinter';
import UniversalFilterSystem from './filters/UniversalFilterSystem';

/**
 * PhotoToolsHubPro - Professional photo editing suite
 * Industry-standard dark UI inspired by Lightroom, Photoshop, Capture One
 */
export function PhotoToolsHubPro({ userId }) {
    const [activeTool, setActiveTool] = useState('enhance');
    const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
    const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

    const TOOLS = [
        { id: 'filters', name: '🔥 Universal Filters', icon: '🎨', component: UniversalFilterSystem },
        { id: 'enhance', name: 'Photo Enhancement', icon: '✨', component: PhotoEnhancementSuite },
        { id: 'pro', name: 'Pro Editor', icon: '🎨', component: ProPhotoEditor },
        { id: 'meme', name: 'Meme Generator', icon: '😂', component: MemeGenerator },
        { id: 'nft', name: 'NFT Minter', icon: '💎', component: NFTMinter },
        { id: 'advanced', name: 'Advanced Editor', icon: '🔧', component: AdvancedPhotoEditor },
        { id: 'mass', name: 'Mass Processor', icon: '📁', component: MassPhotoProcessor },
        { id: 'oldfilters', name: 'Old Pro Filters', icon: '🎭', component: ProPhotoFilters },
        { id: 'duplicates', name: 'Find Duplicates', icon: '🔍', component: DuplicatePhotoDetector },
        { id: 'batch', name: 'Batch Process', icon: '📦', component: BatchPhotoProcessor }
    ];

    const ActiveComponent = TOOLS.find(t => t.id === activeTool)?.component || PhotoEnhancementSuite;

    return (
        <div className="photo-tools-pro">
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
                        📸 Photo Tools
                    </h2>

                    {/* Tool Selector Dropdown */}
                    <select
                        value={activeTool}
                        onChange={(e) => setActiveTool(e.target.value)}
                        style={{
                            background: '#1e1e1e',
                            border: '1px solid #3e3e3e',
                            borderRadius: '4px',
                            padding: '8px 32px 8px 12px',
                            color: '#cccccc',
                            fontSize: '14px',
                            cursor: 'pointer',
                            minWidth: '220px'
                        }}
                    >
                        {TOOLS.map(tool => (
                            <option key={tool.id} value={tool.id}>
                                {tool.icon} {tool.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Right-side controls */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                        title="Toggle Library Panel"
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
                        title="Toggle Adjustments Panel"
                    >
                        🎛️
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div style={{
                display: 'flex',
                height: 'calc(100vh - 61px)',
                background: '#1e1e1e'
            }}>
                {/* Left Panel - Library/Presets */}
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
                                {TOOLS.map(tool => (
                                    <button
                                        key={tool.id}
                                        onClick={() => setActiveTool(tool.id)}
                                        style={{
                                            background: activeTool === tool.id ? '#404040' : 'transparent',
                                            border: activeTool === tool.id ? '1px solid #555' : '1px solid transparent',
                                            borderRadius: '4px',
                                            padding: '10px 12px',
                                            color: activeTool === tool.id ? '#ffffff' : '#cccccc',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            textAlign: 'left',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span style={{ fontSize: '16px' }}>{tool.icon}</span>
                                        <span>{tool.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tool Info */}
                        <div style={{
                            background: '#1e1e1e',
                            border: '1px solid #3e3e3e',
                            borderRadius: '6px',
                            padding: '16px',
                            marginTop: '20px'
                        }}>
                            <h4 style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#ffffff',
                                marginBottom: '8px'
                            }}>
                                {TOOLS.find(t => t.id === activeTool)?.name}
                            </h4>
                            <p style={{
                                fontSize: '12px',
                                color: '#999',
                                lineHeight: '1.5',
                                margin: 0
                            }}>
                                {activeTool === 'enhance' && 'Auto-enhance brightness, contrast, saturation, and sharpness with AI-powered adjustments.'}
                                {activeTool === 'pro' && 'Professional photo editor with advanced controls and layer support.'}
                                {activeTool === 'meme' && 'Create viral memes with classic templates and custom text overlays.'}
                                {activeTool === 'nft' && 'Turn your art into NFTs. Free to mint - creators keep 65% + 10% royalties on resales.'}
                                {activeTool === 'advanced' && 'Advanced editing tools with precision controls for professional workflows.'}
                                {activeTool === 'mass' && 'Process entire folders of images with consistent settings and batch operations.'}
                                {activeTool === 'filters' && 'Apply professional-grade filters including Radiance, Golden, Frost, and more.'}
                                {activeTool === 'duplicates' && 'Detect duplicate images even if resized, compressed, or slightly modified.'}
                                {activeTool === 'batch' && 'Batch process multiple images with consistent settings and automated workflows.'}
                            </p>
                        </div>

                        {/* Features List */}
                        <div style={{ marginTop: '20px' }}>
                            <h3 style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#999',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: '12px'
                            }}>
                                Features
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                    { icon: '✨', text: 'Auto Enhancement' },
                                    { icon: '✂️', text: 'Smart Crop' },
                                    { icon: '🔧', text: 'Pixel Restoration' },
                                    { icon: '🎨', text: '18+ Pro Filters' },
                                    { icon: '😂', text: 'Meme Generator' },
                                    { icon: '💎', text: 'NFT Minter (Free)' },
                                    { icon: '🔍', text: 'Duplicate Detection' },
                                    { icon: '📦', text: 'Batch Processing' },
                                    { icon: '💾', text: 'Works Offline' },
                                    { icon: '🚫', text: 'No Censorship' }
                                ].map((feature, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            fontSize: '12px',
                                            color: '#cccccc'
                                        }}
                                    >
                                        <span style={{ fontSize: '14px' }}>{feature.icon}</span>
                                        <span>{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Center - Main Tool Area */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    background: '#1e1e1e',
                    padding: '20px'
                }}>
                    <div style={{
                        maxWidth: '1400px',
                        margin: '0 auto'
                    }}>
                        <ActiveComponent userId={userId} />
                    </div>
                </div>

                {/* Right Panel - Adjustments (collapsible) */}
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
                            Quick Adjustments
                        </h3>

                        {/* Quick Settings for Current Tool */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Common Adjustments */}
                            <div>
                                <label style={{
                                    fontSize: '12px',
                                    color: '#cccccc',
                                    display: 'block',
                                    marginBottom: '8px'
                                }}>
                                    Quality Preset
                                </label>
                                <select style={{
                                    width: '100%',
                                    background: '#1e1e1e',
                                    border: '1px solid #3e3e3e',
                                    borderRadius: '4px',
                                    padding: '8px',
                                    color: '#cccccc',
                                    fontSize: '13px'
                                }}>
                                    <option>Maximum Quality</option>
                                    <option>High Quality</option>
                                    <option>Balanced</option>
                                    <option>Fast Processing</option>
                                </select>
                            </div>

                            <div>
                                <label style={{
                                    fontSize: '12px',
                                    color: '#cccccc',
                                    display: 'block',
                                    marginBottom: '8px'
                                }}>
                                    Output Format
                                </label>
                                <select style={{
                                    width: '100%',
                                    background: '#1e1e1e',
                                    border: '1px solid #3e3e3e',
                                    borderRadius: '4px',
                                    padding: '8px',
                                    color: '#cccccc',
                                    fontSize: '13px'
                                }}>
                                    <option>PNG (Lossless)</option>
                                    <option>JPEG (High Quality)</option>
                                    <option>WEBP (Modern)</option>
                                    <option>TIFF (Professional)</option>
                                </select>
                            </div>

                            {/* Divider */}
                            <div style={{
                                height: '1px',
                                background: '#3e3e3e',
                                margin: '8px 0'
                            }} />

                            {/* Tool-Specific Options */}
                            <div>
                                <h4 style={{
                                    fontSize: '12px',
                                    color: '#ffffff',
                                    marginBottom: '12px',
                                    fontWeight: 600
                                }}>
                                    Tool Options
                                </h4>
                                <div style={{
                                    fontSize: '12px',
                                    color: '#999',
                                    lineHeight: '1.6'
                                }}>
                                    {activeTool === 'enhance' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="checkbox" defaultChecked />
                                                <span>Auto-correct exposure</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="checkbox" defaultChecked />
                                                <span>Smart sharpening</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="checkbox" />
                                                <span>Noise reduction</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="checkbox" />
                                                <span>Color correction</span>
                                            </label>
                                        </div>
                                    )}
                                    {activeTool === 'batch' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="checkbox" defaultChecked />
                                                <span>Preserve metadata</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="checkbox" />
                                                <span>Resize images</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="checkbox" />
                                                <span>Watermark</span>
                                            </label>
                                        </div>
                                    )}
                                    {activeTool === 'duplicates' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="checkbox" defaultChecked />
                                                <span>Check file hash</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="checkbox" defaultChecked />
                                                <span>Visual similarity</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input type="checkbox" />
                                                <span>Include subfolders</span>
                                            </label>
                                        </div>
                                    )}
                                    {!['enhance', 'batch', 'duplicates'].includes(activeTool) && (
                                        <p>Tool-specific options will appear here based on your current selection.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .photo-tools-pro {
          background: #1e1e1e;
          color: #cccccc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          min-height: 100vh;
        }

        .photo-tools-pro select:focus,
        .photo-tools-pro button:focus {
          outline: 2px solid #4a9eff;
          outline-offset: 2px;
        }

        .photo-tools-pro button:hover {
          background: #404040 !important;
        }

        .photo-tools-pro input[type="checkbox"] {
          accent-color: #4a9eff;
        }
      `}</style>
        </div>
    );
}
