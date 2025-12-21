import React, { useState, useEffect } from 'react';
import './AutoSave.css';

const AutoSave = () => {
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [saveInterval, setSaveInterval] = useState(30); // seconds
    const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
    const [lastSaved, setLastSaved] = useState(new Date());
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
    const [activeTab, setActiveTab] = useState('overview');

    const projectHistory = [
        { id: 1, name: 'Cyberpunk Music Video.mp4', tool: 'Video Editor', savedAt: '2 minutes ago', size: '487 MB', synced: true },
        { id: 2, name: 'Logo Design v3.svg', tool: 'Design Suite', savedAt: '15 minutes ago', size: '2.3 MB', synced: true },
        { id: 3, name: 'Podcast Intro Mix.wav', tool: 'Audio Studio', savedAt: '1 hour ago', size: '124 MB', synced: true },
        { id: 4, name: 'VR Gallery Scene.vrw', tool: 'VR Studio', savedAt: '3 hours ago', size: '856 MB', synced: true },
        { id: 5, name: 'Instagram Reel Edit.mp4', tool: 'Video Editor', savedAt: '5 hours ago', size: '234 MB', synced: true },
        { id: 6, name: 'Beat Template v2.audio', tool: 'Audio Studio', savedAt: '1 day ago', size: '67 MB', synced: true },
    ];

    const storageStats = {
        used: 12.4,
        total: 100,
        percentUsed: 12.4,
        projects: 87,
        autoSaves: 1234,
        cloudBackups: 342,
    };

    const versionHistory = [
        { version: 8, savedAt: '2 mins ago', changes: 'Added outro transition', autoSave: false },
        { version: 7, savedAt: '5 mins ago', changes: 'Color grading adjustments', autoSave: true },
        { version: 6, savedAt: '10 mins ago', changes: 'Audio sync fixed', autoSave: true },
        { version: 5, savedAt: '15 mins ago', changes: 'Added background music', autoSave: false },
        { version: 4, savedAt: '20 mins ago', changes: 'Trimmed intro clip', autoSave: true },
        { version: 3, savedAt: '30 mins ago', changes: 'Text overlay added', autoSave: true },
    ];

    useEffect(() => {
        if (autoSaveEnabled) {
            const interval = setInterval(() => {
                setSaveStatus('saving');
                setTimeout(() => {
                    setLastSaved(new Date());
                    setSaveStatus('saved');
                }, 1000);
            }, saveInterval * 1000);

            return () => clearInterval(interval);
        }
    }, [autoSaveEnabled, saveInterval]);

    const formatTimeSince = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return `${seconds} seconds ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        return `${Math.floor(seconds / 3600)} hours ago`;
    };

    return (
        <div className="autosave-system">
            <div className="autosave-header">
                <div className="header-content">
                    <h1>💾 Auto-Save & Cloud Sync</h1>
                    <p className="header-subtitle">
                        Never lose work again · Auto-backup · Version history · Cloud storage
                    </p>
                </div>

                <div className="save-status-card">
                    <div className={`status-indicator status-${saveStatus}`}>
                        {saveStatus === 'saving' && '⏳ Saving...'}
                        {saveStatus === 'saved' && '✅ All changes saved'}
                        {saveStatus === 'error' && '⚠️ Save failed'}
                    </div>
                    <div className="last-saved-text">
                        Last saved: {formatTimeSince(lastSaved)}
                    </div>
                    {cloudSyncEnabled && (
                        <div className="cloud-sync-status">
                            ☁️ Synced to cloud
                        </div>
                    )}
                </div>
            </div>

            <div className="autosave-tabs">
                <button
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Overview
                </button>
                <button
                    className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    ⚙️ Settings
                </button>
                <button
                    className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    🕐 Version History
                </button>
                <button
                    className={`tab ${activeTab === 'storage' ? 'active' : ''}`}
                    onClick={() => setActiveTab('storage')}
                >
                    💾 Storage
                </button>
            </div>

            {activeTab === 'overview' && (
                <div className="overview-section">
                    <div className="overview-grid">
                        <div className="overview-card">
                            <div className="card-icon">💾</div>
                            <div className="card-content">
                                <div className="card-value">{storageStats.autoSaves.toLocaleString()}</div>
                                <div className="card-label">Auto-Saves This Month</div>
                                <div className="card-subtext">Avg every {saveInterval} seconds</div>
                            </div>
                        </div>

                        <div className="overview-card">
                            <div className="card-icon">☁️</div>
                            <div className="card-content">
                                <div className="card-value">{storageStats.cloudBackups}</div>
                                <div className="card-label">Cloud Backups</div>
                                <div className="card-subtext">{storageStats.used}GB used of {storageStats.total}GB</div>
                            </div>
                        </div>

                        <div className="overview-card">
                            <div className="card-icon">📁</div>
                            <div className="card-content">
                                <div className="card-value">{storageStats.projects}</div>
                                <div className="card-label">Projects Saved</div>
                                <div className="card-subtext">All time</div>
                            </div>
                        </div>

                        <div className="overview-card success">
                            <div className="card-icon">✅</div>
                            <div className="card-content">
                                <div className="card-value">0</div>
                                <div className="card-label">Work Lost</div>
                                <div className="card-subtext">100% protected</div>
                            </div>
                        </div>
                    </div>

                    <div className="recent-saves">
                        <h3>📂 Recent Projects</h3>
                        <div className="saves-list">
                            {projectHistory.map((project) => (
                                <div key={project.id} className="save-item">
                                    <div className="save-icon">
                                        {project.tool === 'Video Editor' && '🎬'}
                                        {project.tool === 'Design Suite' && '🎨'}
                                        {project.tool === 'Audio Studio' && '🎵'}
                                        {project.tool === 'VR Studio' && '🥽'}
                                    </div>
                                    <div className="save-info">
                                        <div className="save-name">{project.name}</div>
                                        <div className="save-meta">
                                            <span>{project.tool}</span>
                                            <span className="separator">•</span>
                                            <span>{project.size}</span>
                                            <span className="separator">•</span>
                                            <span>{project.savedAt}</span>
                                        </div>
                                    </div>
                                    {project.synced && (
                                        <div className="sync-badge">☁️ Synced</div>
                                    )}
                                    <button className="btn-restore">Restore</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="protection-info">
                        <div className="info-card">
                            <h3>🛡️ How Auto-Save Protects You</h3>
                            <ul>
                                <li><strong>Automatic Backups:</strong> Saves every {saveInterval} seconds while you work</li>
                                <li><strong>Cloud Sync:</strong> Instantly backed up to secure cloud storage</li>
                                <li><strong>Version History:</strong> Restore any previous version anytime</li>
                                <li><strong>Crash Protection:</strong> Work recovered if app closes unexpectedly</li>
                                <li><strong>Conflict Resolution:</strong> Smart merging when working across devices</li>
                            </ul>
                        </div>

                        <div className="info-card">
                            <h3>💡 Pro Tips</h3>
                            <ul>
                                <li>Lower save interval (10s) for critical work</li>
                                <li>Manual save (Ctrl+S) creates named checkpoint</li>
                                <li>Cloud sync works across all your devices</li>
                                <li>Version history kept for 30 days</li>
                                <li>Large files (&gt;500MB) save to cloud only</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="settings-section">
                    <div className="settings-card">
                        <h3>⚙️ Auto-Save Settings</h3>
                        <div className="settings-options">
                            <div className="setting-row">
                                <div className="setting-info">
                                    <strong>Enable Auto-Save</strong>
                                    <p>Automatically save changes while you work</p>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={autoSaveEnabled}
                                        onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="setting-row">
                                <div className="setting-info">
                                    <strong>Save Interval</strong>
                                    <p>How often to auto-save (in seconds)</p>
                                </div>
                                <select
                                    className="interval-select"
                                    value={saveInterval}
                                    onChange={(e) => setSaveInterval(parseInt(e.target.value))}
                                    disabled={!autoSaveEnabled}
                                >
                                    <option value={10}>10 seconds (High frequency)</option>
                                    <option value={30}>30 seconds (Recommended)</option>
                                    <option value={60}>60 seconds (Low frequency)</option>
                                    <option value={120}>2 minutes (Manual preferred)</option>
                                </select>
                            </div>

                            <div className="setting-row">
                                <div className="setting-info">
                                    <strong>Cloud Sync</strong>
                                    <p>Sync to cloud for cross-device access</p>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={cloudSyncEnabled}
                                        onChange={(e) => setCloudSyncEnabled(e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="setting-row">
                                <div className="setting-info">
                                    <strong>Conflict Resolution</strong>
                                    <p>How to handle edits from multiple devices</p>
                                </div>
                                <select className="interval-select">
                                    <option>Ask me (Recommended)</option>
                                    <option>Always use newest</option>
                                    <option>Always use local</option>
                                    <option>Always use cloud</option>
                                </select>
                            </div>

                            <div className="setting-row">
                                <div className="setting-info">
                                    <strong>Version History Length</strong>
                                    <p>How long to keep old versions</p>
                                </div>
                                <select className="interval-select">
                                    <option>7 days</option>
                                    <option>30 days (Recommended)</option>
                                    <option>90 days</option>
                                    <option>1 year (Pro)</option>
                                    <option>Forever (Pro)</option>
                                </select>
                            </div>

                            <div className="setting-row">
                                <div className="setting-info">
                                    <strong>Save Notifications</strong>
                                    <p>Show popup when auto-save happens</p>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" defaultChecked={false} />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="danger-zone">
                        <h3>⚠️ Danger Zone</h3>
                        <div className="danger-actions">
                            <button className="btn-danger">
                                Clear All Auto-Saves
                            </button>
                            <button className="btn-danger">
                                Delete Version History
                            </button>
                            <button className="btn-danger">
                                Disconnect Cloud Sync
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="history-section">
                    <div className="history-header">
                        <h3>🕐 Version History - Cyberpunk Music Video.mp4</h3>
                        <button className="btn-compare">Compare Versions</button>
                    </div>

                    <div className="version-timeline">
                        {versionHistory.map((version) => (
                            <div key={version.version} className="version-item">
                                <div className="version-marker">
                                    <div className="version-number">v{version.version}</div>
                                    {version.autoSave ? (
                                        <div className="auto-save-badge">🤖 Auto</div>
                                    ) : (
                                        <div className="manual-save-badge">👤 Manual</div>
                                    )}
                                </div>
                                <div className="version-content">
                                    <div className="version-changes">{version.changes}</div>
                                    <div className="version-time">{version.savedAt}</div>
                                </div>
                                <div className="version-actions">
                                    <button className="btn-preview">Preview</button>
                                    <button className="btn-restore-version">Restore</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="version-info">
                        <div className="info-icon">💡</div>
                        <div>
                            <strong>Version History Tips:</strong> Manual saves (Ctrl+S) create named checkpoints. Auto-saves happen in the background. You can restore any version within 30 days.
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'storage' && (
                <div className="storage-section">
                    <div className="storage-overview">
                        <div className="storage-chart">
                            <div className="chart-circle">
                                <svg width="200" height="200">
                                    <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="20" />
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="80"
                                        fill="none"
                                        stroke="url(#gradient)"
                                        strokeWidth="20"
                                        strokeDasharray={`${storageStats.percentUsed * 5.024} 502.4`}
                                        transform="rotate(-90 100 100)"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#ec4899" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="chart-center">
                                    <div className="chart-percentage">{storageStats.percentUsed}%</div>
                                    <div className="chart-label">Used</div>
                                </div>
                            </div>
                            <div className="storage-details">
                                <div className="storage-stat">
                                    <span className="stat-label">Used</span>
                                    <span className="stat-value">{storageStats.used}GB</span>
                                </div>
                                <div className="storage-stat">
                                    <span className="stat-label">Available</span>
                                    <span className="stat-value">{storageStats.total - storageStats.used}GB</span>
                                </div>
                                <div className="storage-stat">
                                    <span className="stat-label">Total</span>
                                    <span className="stat-value">{storageStats.total}GB</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="storage-upgrade">
                        <h3>💎 Upgrade Storage</h3>
                        <div className="storage-tiers">
                            <div className="tier-card">
                                <div className="tier-name">Free</div>
                                <div className="tier-storage">100GB</div>
                                <div className="tier-price">$0/month</div>
                                <div className="tier-current">Current Plan</div>
                            </div>
                            <div className="tier-card recommended">
                                <div className="tier-badge">Recommended</div>
                                <div className="tier-name">Pro</div>
                                <div className="tier-storage">1TB</div>
                                <div className="tier-price">$10/month</div>
                                <button className="btn-upgrade-tier">Upgrade</button>
                            </div>
                            <div className="tier-card">
                                <div className="tier-name">Enterprise</div>
                                <div className="tier-storage">Unlimited</div>
                                <div className="tier-price">$50/month</div>
                                <button className="btn-upgrade-tier">Upgrade</button>
                            </div>
                        </div>
                    </div>

                    <div className="storage-breakdown">
                        <h3>📊 Storage Breakdown</h3>
                        <div className="breakdown-list">
                            <div className="breakdown-item">
                                <div className="breakdown-label">
                                    <span className="breakdown-icon">🎬</span>
                                    <span>Video Projects</span>
                                </div>
                                <div className="breakdown-bar">
                                    <div className="breakdown-fill" style={{ width: '45%', background: '#8b5cf6' }}></div>
                                </div>
                                <div className="breakdown-value">5.6GB (45%)</div>
                            </div>
                            <div className="breakdown-item">
                                <div className="breakdown-label">
                                    <span className="breakdown-icon">🎵</span>
                                    <span>Audio Files</span>
                                </div>
                                <div className="breakdown-bar">
                                    <div className="breakdown-fill" style={{ width: '25%', background: '#ec4899' }}></div>
                                </div>
                                <div className="breakdown-value">3.1GB (25%)</div>
                            </div>
                            <div className="breakdown-item">
                                <div className="breakdown-label">
                                    <span className="breakdown-icon">🎨</span>
                                    <span>Design Files</span>
                                </div>
                                <div className="breakdown-bar">
                                    <div className="breakdown-fill" style={{ width: '20%', background: '#f59e0b' }}></div>
                                </div>
                                <div className="breakdown-value">2.5GB (20%)</div>
                            </div>
                            <div className="breakdown-item">
                                <div className="breakdown-label">
                                    <span className="breakdown-icon">📸</span>
                                    <span>Photos</span>
                                </div>
                                <div className="breakdown-bar">
                                    <div className="breakdown-fill" style={{ width: '10%', background: '#10b981' }}></div>
                                </div>
                                <div className="breakdown-value">1.2GB (10%)</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AutoSave;
