// ExportPresets.jsx
// One-click export presets for all tools - intelligent settings optimization

import React, { useState } from 'react';
import './ExportPresets.css';

const ExportPresets = ({ toolType, projectData, onExport }) => {
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [customSettings, setCustomSettings] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    // Platform-optimized presets by tool type
    const presets = {
        video: [
            {
                id: 'youtube-4k',
                name: 'YouTube 4K',
                icon: '📺',
                platform: 'YouTube',
                settings: {
                    resolution: '3840x2160',
                    fps: 60,
                    bitrate: '50 Mbps',
                    codec: 'H.264',
                    format: 'MP4',
                    audio: 'AAC 320kbps'
                },
                description: 'Maximum quality for YouTube uploads',
                color: '#FF0000'
            },
            {
                id: 'youtube-1080p',
                name: 'YouTube 1080p',
                icon: '📺',
                platform: 'YouTube',
                settings: {
                    resolution: '1920x1080',
                    fps: 60,
                    bitrate: '12 Mbps',
                    codec: 'H.264',
                    format: 'MP4',
                    audio: 'AAC 192kbps'
                },
                description: 'Balanced quality and file size',
                color: '#FF0000'
            },
            {
                id: 'instagram-reel',
                name: 'Instagram Reel',
                icon: '📱',
                platform: 'Instagram',
                settings: {
                    resolution: '1080x1920',
                    fps: 30,
                    bitrate: '8 Mbps',
                    codec: 'H.264',
                    format: 'MP4',
                    audio: 'AAC 128kbps',
                    aspectRatio: '9:16'
                },
                description: 'Vertical video for Reels',
                color: '#E4405F'
            },
            {
                id: 'tiktok',
                name: 'TikTok',
                icon: '🎵',
                platform: 'TikTok',
                settings: {
                    resolution: '1080x1920',
                    fps: 30,
                    bitrate: '6 Mbps',
                    codec: 'H.264',
                    format: 'MP4',
                    audio: 'AAC 128kbps',
                    aspectRatio: '9:16'
                },
                description: 'Optimized for TikTok algorithm',
                color: '#000000'
            },
            {
                id: 'twitter',
                name: 'Twitter/X',
                icon: '🐦',
                platform: 'Twitter',
                settings: {
                    resolution: '1280x720',
                    fps: 30,
                    bitrate: '5 Mbps',
                    codec: 'H.264',
                    format: 'MP4',
                    audio: 'AAC 128kbps',
                    maxSize: '512 MB'
                },
                description: 'Under 2:20 duration limit',
                color: '#1DA1F2'
            },
            {
                id: 'linkedin',
                name: 'LinkedIn',
                icon: '💼',
                platform: 'LinkedIn',
                settings: {
                    resolution: '1920x1080',
                    fps: 30,
                    bitrate: '5 Mbps',
                    codec: 'H.264',
                    format: 'MP4',
                    audio: 'AAC 128kbps'
                },
                description: 'Professional video format',
                color: '#0077B5'
            }
        ],
        photo: [
            {
                id: 'instagram-post',
                name: 'Instagram Post',
                icon: '📷',
                platform: 'Instagram',
                settings: {
                    resolution: '1080x1080',
                    format: 'JPG',
                    quality: '95%',
                    colorSpace: 'sRGB',
                    aspectRatio: '1:1'
                },
                description: 'Square format, max quality',
                color: '#E4405F'
            },
            {
                id: 'facebook-cover',
                name: 'Facebook Cover',
                icon: '👥',
                platform: 'Facebook',
                settings: {
                    resolution: '820x312',
                    format: 'JPG',
                    quality: '90%',
                    colorSpace: 'sRGB'
                },
                description: 'Profile cover photo',
                color: '#1877F2'
            },
            {
                id: 'twitter-header',
                name: 'Twitter Header',
                icon: '🐦',
                platform: 'Twitter',
                settings: {
                    resolution: '1500x500',
                    format: 'JPG',
                    quality: '90%',
                    colorSpace: 'sRGB'
                },
                description: 'Profile banner image',
                color: '#1DA1F2'
            },
            {
                id: 'print-300dpi',
                name: 'Print Quality',
                icon: '🖨️',
                platform: 'Print',
                settings: {
                    resolution: 'Custom',
                    dpi: 300,
                    format: 'TIFF',
                    quality: '100%',
                    colorSpace: 'CMYK'
                },
                description: 'Professional printing',
                color: '#000000'
            },
            {
                id: 'web-optimized',
                name: 'Web Optimized',
                icon: '🌐',
                platform: 'Web',
                settings: {
                    resolution: '1920x1080',
                    format: 'WebP',
                    quality: '85%',
                    colorSpace: 'sRGB',
                    compression: 'Lossy'
                },
                description: 'Fast loading, good quality',
                color: '#4285F4'
            }
        ],
        audio: [
            {
                id: 'spotify',
                name: 'Spotify Upload',
                icon: '🎵',
                platform: 'Spotify',
                settings: {
                    format: 'WAV',
                    sampleRate: '44.1 kHz',
                    bitDepth: '16-bit',
                    channels: 'Stereo',
                    loudness: '-14 LUFS'
                },
                description: 'Spotify master quality',
                color: '#1DB954'
            },
            {
                id: 'podcast',
                name: 'Podcast',
                icon: '🎙️',
                platform: 'Podcast',
                settings: {
                    format: 'MP3',
                    bitrate: '128 kbps',
                    sampleRate: '44.1 kHz',
                    channels: 'Stereo',
                    loudness: '-16 LUFS'
                },
                description: 'Apple Podcasts, Spotify',
                color: '#9933CC'
            },
            {
                id: 'youtube-audio',
                name: 'YouTube Audio',
                icon: '📺',
                platform: 'YouTube',
                settings: {
                    format: 'AAC',
                    bitrate: '192 kbps',
                    sampleRate: '48 kHz',
                    channels: 'Stereo',
                    loudness: '-14 LUFS'
                },
                description: 'Optimized for YouTube',
                color: '#FF0000'
            },
            {
                id: 'mastered-wav',
                name: 'Mastered WAV',
                icon: '🎚️',
                platform: 'Professional',
                settings: {
                    format: 'WAV',
                    sampleRate: '48 kHz',
                    bitDepth: '24-bit',
                    channels: 'Stereo',
                    loudness: '-14 LUFS',
                    dither: 'Triangular'
                },
                description: 'Professional distribution',
                color: '#000000'
            }
        ],
        design: [
            {
                id: 'logo-package',
                name: 'Logo Package',
                icon: '✨',
                platform: 'Branding',
                settings: {
                    formats: ['PNG', 'SVG', 'PDF', 'EPS'],
                    resolutions: ['512x512', '1024x1024', '4096x4096'],
                    background: 'Transparent',
                    colorSpace: 'RGB + CMYK'
                },
                description: 'All formats for any use',
                color: '#000000'
            },
            {
                id: 'social-kit',
                name: 'Social Media Kit',
                icon: '📱',
                platform: 'Social',
                settings: {
                    formats: ['JPG', 'PNG'],
                    sizes: {
                        'Instagram Post': '1080x1080',
                        'Instagram Story': '1080x1920',
                        'Facebook Post': '1200x630',
                        'Twitter Post': '1200x675'
                    }
                },
                description: 'All social sizes at once',
                color: '#E4405F'
            },
            {
                id: 'print-ready',
                name: 'Print Ready',
                icon: '🖨️',
                platform: 'Print',
                settings: {
                    format: 'PDF',
                    dpi: 300,
                    colorSpace: 'CMYK',
                    bleed: '3mm',
                    cropMarks: true
                },
                description: 'Professional printing',
                color: '#000000'
            }
        ],
        vr: [
            {
                id: 'quest-2',
                name: 'Meta Quest 2/3',
                icon: '🥽',
                platform: 'Quest',
                settings: {
                    resolution: '3664x1920',
                    fps: 72,
                    format: 'APK',
                    renderQuality: 'High',
                    textureCompression: 'ASTC'
                },
                description: 'Optimized for Quest hardware',
                color: '#0467DF'
            },
            {
                id: 'steamvr',
                name: 'SteamVR',
                icon: '🎮',
                platform: 'SteamVR',
                settings: {
                    resolution: '2880x1600',
                    fps: 90,
                    format: 'EXE',
                    renderQuality: 'Ultra',
                    api: 'OpenXR'
                },
                description: 'PC VR high quality',
                color: '#000000'
            },
            {
                id: 'ar-preview',
                name: 'AR Preview',
                icon: '📱',
                platform: 'Mobile AR',
                settings: {
                    format: 'GLB',
                    fileSize: '<10 MB',
                    polygons: '<50k',
                    textures: '2k max'
                },
                description: 'Mobile AR optimized',
                color: '#4285F4'
            }
        ]
    };

    const currentPresets = presets[toolType] || [];

    const handleExport = async (preset) => {
        setSelectedPreset(preset);
        setIsExporting(true);
        setExportProgress(0);

        // Simulate export progress
        const progressInterval = setInterval(() => {
            setExportProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    setIsExporting(false);
                    onExport && onExport(preset, projectData);
                    alert(`✅ Exported successfully!\n\n${preset.name} (${preset.settings.format || preset.settings.formats?.join(', ')})`);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };

    return (
        <div className="export-presets">
            <div className="export-header">
                <h3>📤 Export Presets</h3>
                <p>One-click export optimized for any platform</p>
            </div>

            <div className="presets-grid">
                {currentPresets.map(preset => (
                    <div
                        key={preset.id}
                        className={`preset-card ${selectedPreset?.id === preset.id ? 'selected' : ''}`}
                        onClick={() => !isExporting && handleExport(preset)}
                        style={{ borderColor: preset.color }}
                    >
                        <div className="preset-icon" style={{ background: preset.color }}>
                            {preset.icon}
                        </div>
                        <div className="preset-info">
                            <h4>{preset.name}</h4>
                            <p className="preset-platform">{preset.platform}</p>
                            <p className="preset-description">{preset.description}</p>
                            <div className="preset-settings">
                                {Object.entries(preset.settings).slice(0, 3).map(([key, value]) => (
                                    <span key={key} className="setting-tag">
                                        {typeof value === 'object' ? `${Object.keys(value).length} sizes` : value}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isExporting && (
                <div className="export-progress-modal">
                    <div className="progress-content">
                        <h3>Exporting...</h3>
                        <p>{selectedPreset?.name}</p>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${exportProgress}%` }}></div>
                        </div>
                        <p className="progress-text">{exportProgress}%</p>
                    </div>
                </div>
            )}

            <button className="btn-custom-export" onClick={() => setCustomSettings(!customSettings)}>
                ⚙️ Custom Settings
            </button>
        </div>
    );
};

export default ExportPresets;
