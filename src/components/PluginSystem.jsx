import React, { useState, useEffect } from 'react';
import './PluginSystem.css';

const PluginSystem = ({ currentTool = 'video' }) => {
    const [installedPlugins, setInstalledPlugins] = useState([]);
    const [availablePlugins, setAvailablePlugins] = useState([]);
    const [activeTab, setActiveTab] = useState('installed');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('popular');
    const [pluginDetails, setPluginDetails] = useState(null);
    const [isInstalling, setIsInstalling] = useState(null);

    // Mock plugin marketplace data
    const mockPlugins = [
        // Video Plugins
        { id: 1, name: 'AI Upscaler', developer: 'TechVision Labs', category: 'video', type: 'effect', price: 4.99, rating: 4.8, downloads: 45230, size: '12 MB', description: 'AI-powered 4K/8K upscaling - Make any video look like it was shot in 4K', version: '2.1.0', revenue: '70% to you', tags: ['ai', 'upscale', 'quality'], icon: '🎯', toolCompatibility: ['video', 'photo'] },
        { id: 2, name: 'Cinematic LUTs Pack', developer: 'ColorGrade Pro', category: 'video', type: 'effect', price: 9.99, rating: 4.9, downloads: 67890, size: '8 MB', description: '50 Hollywood-grade color grading presets - Instant film look', version: '3.0.1', revenue: '70% to you', tags: ['color', 'lut', 'cinematic'], icon: '🎨', toolCompatibility: ['video', 'photo'] },
        { id: 3, name: 'Auto Subtitle Generator', developer: 'AI Speech Inc', category: 'video', type: 'tool', price: 7.99, rating: 4.7, downloads: 34567, size: '15 MB', description: 'Generate perfect subtitles with AI speech recognition - 95% accuracy', version: '1.5.2', revenue: '70% to you', tags: ['ai', 'subtitles', 'accessibility'], icon: '💬', toolCompatibility: ['video', 'audio'] },
        { id: 4, name: 'Smooth Cam Stabilizer', developer: 'SteadyShot Studio', category: 'video', type: 'effect', price: 5.99, rating: 4.6, downloads: 28945, size: '10 MB', description: 'Remove camera shake like a gimbal - AI-powered stabilization', version: '2.0.0', revenue: '70% to you', tags: ['stabilize', 'smooth', 'ai'], icon: '🎥', toolCompatibility: ['video'] },

        // Photo Plugins
        { id: 5, name: 'Portrait Retouch AI', developer: 'BeautyTech AI', category: 'photo', type: 'effect', price: 6.99, rating: 4.9, downloads: 89234, size: '18 MB', description: 'Professional portrait retouching in 1 click - Skin, eyes, teeth, everything', version: '4.2.1', revenue: '70% to you', tags: ['portrait', 'ai', 'retouch'], icon: '👤', toolCompatibility: ['photo'] },
        { id: 6, name: 'Sky Replacement Pro', developer: 'SkySwap Studios', category: 'photo', type: 'effect', price: 4.99, rating: 4.7, downloads: 45678, size: '25 MB', description: '1000+ sky presets - Replace boring skies with dramatic ones instantly', version: '3.1.0', revenue: '70% to you', tags: ['sky', 'landscape', 'effect'], icon: '🌅', toolCompatibility: ['photo'] },
        { id: 7, name: 'Object Eraser', developer: 'MagicEraser Co', category: 'photo', type: 'tool', price: 5.99, rating: 4.8, downloads: 67234, size: '14 MB', description: 'Remove unwanted objects with AI-powered content-aware fill', version: '2.3.1', revenue: '70% to you', tags: ['remove', 'clean', 'ai'], icon: '✨', toolCompatibility: ['photo', 'video'] },

        // Audio Plugins
        { id: 8, name: 'Vocal Isolator AI', developer: 'AudioAI Labs', category: 'audio', type: 'effect', price: 8.99, rating: 4.9, downloads: 34567, size: '20 MB', description: 'Extract vocals or remove them - Perfect stems separation with AI', version: '3.0.2', revenue: '70% to you', tags: ['vocal', 'stem', 'ai'], icon: '🎤', toolCompatibility: ['audio'] },
        { id: 9, name: 'Mastering Suite Pro', developer: 'MasterSound Inc', category: 'audio', type: 'effect', price: 12.99, rating: 4.8, downloads: 23456, size: '22 MB', description: 'Professional mastering chain - Sound like a $500/hr studio', version: '5.1.0', revenue: '70% to you', tags: ['mastering', 'professional', 'studio'], icon: '🎚️', toolCompatibility: ['audio'] },
        { id: 10, name: 'Beat Detective', developer: 'RhythmTech', category: 'audio', type: 'tool', price: 6.99, rating: 4.6, downloads: 19876, size: '12 MB', description: 'Auto-detect BPM and quantize to grid - Perfect timing every time', version: '2.1.1', revenue: '70% to you', tags: ['beat', 'timing', 'quantize'], icon: '🥁', toolCompatibility: ['audio', 'video'] },

        // Design Plugins
        { id: 11, name: 'Logo Generator AI', developer: 'BrandForge AI', category: 'design', type: 'tool', price: 9.99, rating: 4.7, downloads: 56789, size: '16 MB', description: 'Generate 100+ logo variations from text - AI-powered branding', version: '1.8.0', revenue: '70% to you', tags: ['logo', 'ai', 'branding'], icon: '🏷️', toolCompatibility: ['design'] },
        { id: 12, name: 'Smart Layout Assistant', developer: 'DesignFlow Pro', category: 'design', type: 'tool', price: 5.99, rating: 4.8, downloads: 43210, size: '10 MB', description: 'AI suggests perfect layouts - Golden ratio, hierarchy, spacing', version: '2.0.3', revenue: '70% to you', tags: ['layout', 'ai', 'design'], icon: '📐', toolCompatibility: ['design'] },
        { id: 13, name: 'Font Pairing AI', developer: 'TypeGenius', category: 'design', type: 'tool', price: 4.99, rating: 4.6, downloads: 38765, size: '8 MB', description: 'Find perfect font combinations - Never use Comic Sans again', version: '1.5.0', revenue: '70% to you', tags: ['font', 'typography', 'ai'], icon: '🔤', toolCompatibility: ['design'] },

        // VR Plugins
        { id: 14, name: 'Physics Engine Pro', developer: 'VR Dynamics', category: 'vr', type: 'tool', price: 14.99, rating: 4.9, downloads: 12345, size: '35 MB', description: 'Realistic physics simulation - Gravity, collisions, cloth, fluids', version: '4.0.0', revenue: '70% to you', tags: ['physics', 'simulation', 'realistic'], icon: '🌊', toolCompatibility: ['vr'] },
        { id: 15, name: 'VR Hand Tracking', developer: 'GestureVR Inc', category: 'vr', type: 'tool', price: 11.99, rating: 4.7, downloads: 9876, size: '28 MB', description: 'Full hand tracking support - No controllers needed', version: '2.2.0', revenue: '70% to you', tags: ['hand-tracking', 'gesture', 'vr'], icon: '✋', toolCompatibility: ['vr'] },
        { id: 16, name: 'VR Environment Pack', developer: '3D Worlds Studio', category: 'vr', type: 'asset', price: 19.99, rating: 4.8, downloads: 15432, size: '150 MB', description: '50 VR environments - Sci-fi, fantasy, realistic, everything', version: '1.0.0', revenue: '70% to you', tags: ['environment', 'scene', 'asset'], icon: '🏔️', toolCompatibility: ['vr'] },

        // Free Plugins
        { id: 17, name: 'Basic Color Picker', developer: 'OpenTools Foundation', category: 'design', type: 'tool', price: 0, rating: 4.5, downloads: 123456, size: '2 MB', description: 'Simple eyedropper color picker - Open source', version: '1.0.0', revenue: 'Free', tags: ['color', 'picker', 'free'], icon: '🎨', toolCompatibility: ['design', 'photo', 'video'] },
        { id: 18, name: 'Noise Remover', developer: 'Community Audio Tools', category: 'audio', type: 'effect', price: 0, rating: 4.4, downloads: 98765, size: '5 MB', description: 'Remove background noise - Open source', version: '2.1.0', revenue: 'Free', tags: ['noise', 'clean', 'free'], icon: '🔇', toolCompatibility: ['audio', 'video'] },
    ];

    useEffect(() => {
        // Simulate loading installed plugins
        setInstalledPlugins([
            mockPlugins[0], // AI Upscaler
            mockPlugins[4], // Portrait Retouch AI
            mockPlugins[16], // Basic Color Picker (free)
        ]);

        // Set available plugins (exclude installed)
        setAvailablePlugins(mockPlugins);
    }, []);

    const filteredPlugins = availablePlugins
        .filter(plugin => {
            // Search filter
            if (searchQuery && !plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
                return false;
            }

            // Category filter
            if (categoryFilter !== 'all' && plugin.category !== categoryFilter) {
                return false;
            }

            // Tool compatibility filter (only show plugins compatible with current tool)
            if (currentTool && !plugin.toolCompatibility.includes(currentTool)) {
                return false;
            }

            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'popular') return b.downloads - a.downloads;
            if (sortBy === 'rating') return b.rating - a.rating;
            if (sortBy === 'price-low') return a.price - b.price;
            if (sortBy === 'price-high') return b.price - a.price;
            if (sortBy === 'newest') return b.id - a.id;
            return 0;
        });

    const handleInstall = async (plugin) => {
        setIsInstalling(plugin.id);

        // Simulate installation (3 seconds)
        await new Promise(resolve => setTimeout(resolve, 3000));

        setInstalledPlugins([...installedPlugins, plugin]);
        setIsInstalling(null);
        alert(`✅ ${plugin.name} installed successfully!\n\nYou can now use it in your ${currentTool} projects.`);
    };

    const handleUninstall = (plugin) => {
        if (window.confirm(`Uninstall ${plugin.name}?`)) {
            setInstalledPlugins(installedPlugins.filter(p => p.id !== plugin.id));
            alert(`🗑️ ${plugin.name} uninstalled successfully!`);
        }
    };

    const openPluginDetails = (plugin) => {
        setPluginDetails(plugin);
    };

    const closePluginDetails = () => {
        setPluginDetails(null);
    };

    const categories = ['all', 'video', 'photo', 'audio', 'design', 'vr'];

    const isInstalled = (pluginId) => installedPlugins.some(p => p.id === pluginId);

    return (
        <div className="plugin-system">
            <div className="plugin-header">
                <div className="header-left">
                    <h2>🧩 Plugin Marketplace</h2>
                    <p>Extend ForTheWeebs with community plugins • 70% revenue to developers</p>
                </div>
                <div className="header-stats">
                    <div className="stat">
                        <span className="stat-value">{installedPlugins.length}</span>
                        <span className="stat-label">Installed</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">{mockPlugins.length}</span>
                        <span className="stat-label">Available</span>
                    </div>
                </div>
            </div>

            <div className="plugin-tabs">
                <button
                    className={`tab ${activeTab === 'installed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('installed')}
                >
                    Installed ({installedPlugins.length})
                </button>
                <button
                    className={`tab ${activeTab === 'marketplace' ? 'active' : ''}`}
                    onClick={() => setActiveTab('marketplace')}
                >
                    Marketplace ({filteredPlugins.length})
                </button>
                <button
                    className={`tab ${activeTab === 'develop' ? 'active' : ''}`}
                    onClick={() => setActiveTab('develop')}
                >
                    Develop Plugins
                </button>
            </div>

            {activeTab === 'marketplace' && (
                <div className="marketplace-controls">
                    <input
                        type="text"
                        className="plugin-search"
                        placeholder="🔍 Search plugins, tags, developers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <div className="filter-controls">
                        <select
                            className="category-select"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>

                        <select
                            className="sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="popular">Most Popular</option>
                            <option value="rating">Highest Rated</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="newest">Newest First</option>
                        </select>
                    </div>
                </div>
            )}

            {activeTab === 'installed' && (
                <div className="plugins-grid">
                    {installedPlugins.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📦</div>
                            <h3>No plugins installed yet</h3>
                            <p>Browse the marketplace to extend ForTheWeebs with powerful plugins</p>
                            <button
                                className="btn-primary"
                                onClick={() => setActiveTab('marketplace')}
                            >
                                Browse Marketplace
                            </button>
                        </div>
                    ) : (
                        installedPlugins.map(plugin => (
                            <div key={plugin.id} className="plugin-card installed">
                                <div className="plugin-icon">{plugin.icon}</div>
                                <div className="plugin-info">
                                    <h3>{plugin.name}</h3>
                                    <p className="plugin-developer">by {plugin.developer}</p>
                                    <p className="plugin-description">{plugin.description}</p>
                                    <div className="plugin-meta">
                                        <span className="plugin-version">v{plugin.version}</span>
                                        <span className="plugin-size">{plugin.size}</span>
                                        <span className="plugin-rating">⭐ {plugin.rating}</span>
                                    </div>
                                    <div className="plugin-tags">
                                        {plugin.tags.map(tag => (
                                            <span key={tag} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="plugin-actions">
                                    <button
                                        className="btn-details"
                                        onClick={() => openPluginDetails(plugin)}
                                    >
                                        Details
                                    </button>
                                    <button
                                        className="btn-uninstall"
                                        onClick={() => handleUninstall(plugin)}
                                    >
                                        Uninstall
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'marketplace' && (
                <div className="plugins-grid">
                    {filteredPlugins.map(plugin => (
                        <div key={plugin.id} className="plugin-card">
                            <div className="plugin-icon">{plugin.icon}</div>
                            <div className="plugin-info">
                                <h3>{plugin.name}</h3>
                                <p className="plugin-developer">by {plugin.developer}</p>
                                <p className="plugin-description">{plugin.description}</p>
                                <div className="plugin-meta">
                                    <span className="plugin-price">
                                        {plugin.price === 0 ? 'FREE' : `$${plugin.price.toFixed(2)}`}
                                    </span>
                                    <span className="plugin-rating">⭐ {plugin.rating}</span>
                                    <span className="plugin-downloads">⬇ {plugin.downloads.toLocaleString()}</span>
                                </div>
                                <div className="plugin-tags">
                                    {plugin.tags.map(tag => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="plugin-actions">
                                <button
                                    className="btn-details"
                                    onClick={() => openPluginDetails(plugin)}
                                >
                                    Details
                                </button>
                                {isInstalled(plugin.id) ? (
                                    <button className="btn-installed" disabled>
                                        ✓ Installed
                                    </button>
                                ) : (
                                    <button
                                        className="btn-install"
                                        onClick={() => handleInstall(plugin)}
                                        disabled={isInstalling === plugin.id}
                                    >
                                        {isInstalling === plugin.id ? 'Installing...' : 'Install'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'develop' && (
                <div className="develop-section">
                    <div className="develop-hero">
                        <h2>💰 Build Plugins, Earn 70% Revenue</h2>
                        <p className="develop-subtitle">Create once, earn forever. Thousands of creators waiting for your plugins.</p>
                    </div>

                    <div className="develop-grid">
                        <div className="develop-card">
                            <div className="develop-icon">📚</div>
                            <h3>Plugin SDK</h3>
                            <p>Complete TypeScript SDK with hooks, UI components, and utilities</p>
                            <code>npm install @fortheweebs/plugin-sdk</code>
                        </div>

                        <div className="develop-card">
                            <div className="develop-icon">🎨</div>
                            <h3>UI Components</h3>
                            <p>Pre-built React components matching ForTheWeebs design system</p>
                            <code>import {'{Button, Panel}'} from '@fortheweebs/ui'</code>
                        </div>

                        <div className="develop-card">
                            <div className="develop-icon">⚡</div>
                            <h3>Hot Reload</h3>
                            <p>Instant preview your plugin changes - No restart needed</p>
                            <code>npm run dev -- --watch</code>
                        </div>

                        <div className="develop-card">
                            <div className="develop-icon">💸</div>
                            <h3>70% Revenue</h3>
                            <p>You keep 70% of sales. Auto-payouts via Stripe every month.</p>
                            <strong>Average: $2,340/month for top plugins</strong>
                        </div>

                        <div className="develop-card">
                            <div className="develop-icon">📊</div>
                            <h3>Analytics Dashboard</h3>
                            <p>Track downloads, reviews, revenue, and user engagement</p>
                            <code>dashboard.fortheweebs.com/plugins</code>
                        </div>

                        <div className="develop-card">
                            <div className="develop-icon">🚀</div>
                            <h3>Easy Publishing</h3>
                            <p>One command to publish. We handle hosting, payments, updates.</p>
                            <code>ftw publish --auto-update</code>
                        </div>
                    </div>

                    <div className="develop-cta">
                        <button className="btn-primary-large">
                            📖 Read Plugin Development Guide
                        </button>
                        <button className="btn-secondary-large">
                            🎯 View Example Plugins (GitHub)
                        </button>
                    </div>

                    <div className="developer-stats">
                        <div className="dev-stat">
                            <span className="dev-stat-value">234</span>
                            <span className="dev-stat-label">Plugin Developers</span>
                        </div>
                        <div className="dev-stat">
                            <span className="dev-stat-value">$127K</span>
                            <span className="dev-stat-label">Paid to Devs (Total)</span>
                        </div>
                        <div className="dev-stat">
                            <span className="dev-stat-value">4.7★</span>
                            <span className="dev-stat-label">Avg Plugin Rating</span>
                        </div>
                    </div>
                </div>
            )}

            {pluginDetails && (
                <div className="plugin-details-modal" onClick={closePluginDetails}>
                    <div className="plugin-details-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" onClick={closePluginDetails}>×</button>

                        <div className="details-header">
                            <div className="details-icon">{pluginDetails.icon}</div>
                            <div className="details-title">
                                <h2>{pluginDetails.name}</h2>
                                <p className="details-developer">by {pluginDetails.developer}</p>
                            </div>
                            <div className="details-price-badge">
                                {pluginDetails.price === 0 ? 'FREE' : `$${pluginDetails.price.toFixed(2)}`}
                            </div>
                        </div>

                        <div className="details-stats">
                            <div className="detail-stat">
                                <span className="stat-icon">⭐</span>
                                <span className="stat-text">{pluginDetails.rating} rating</span>
                            </div>
                            <div className="detail-stat">
                                <span className="stat-icon">⬇</span>
                                <span className="stat-text">{pluginDetails.downloads.toLocaleString()} downloads</span>
                            </div>
                            <div className="detail-stat">
                                <span className="stat-icon">📦</span>
                                <span className="stat-text">{pluginDetails.size}</span>
                            </div>
                            <div className="detail-stat">
                                <span className="stat-icon">🔄</span>
                                <span className="stat-text">v{pluginDetails.version}</span>
                            </div>
                        </div>

                        <div className="details-description">
                            <h3>Description</h3>
                            <p>{pluginDetails.description}</p>
                        </div>

                        <div className="details-compatibility">
                            <h3>Compatible Tools</h3>
                            <div className="compatibility-badges">
                                {pluginDetails.toolCompatibility.map(tool => (
                                    <span key={tool} className="compatibility-badge">{tool}</span>
                                ))}
                            </div>
                        </div>

                        <div className="details-tags">
                            <h3>Tags</h3>
                            <div className="tags-list">
                                {pluginDetails.tags.map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>
                        </div>

                        <div className="details-revenue">
                            <h3>Developer Revenue</h3>
                            <p className="revenue-info">{pluginDetails.revenue} - ForTheWeebs takes 30% for hosting, payments, and platform maintenance</p>
                        </div>

                        <div className="details-actions">
                            {isInstalled(pluginDetails.id) ? (
                                <button className="btn-installed-large" disabled>
                                    ✓ Already Installed
                                </button>
                            ) : (
                                <button
                                    className="btn-install-large"
                                    onClick={() => handleInstall(pluginDetails)}
                                    disabled={isInstalling === pluginDetails.id}
                                >
                                    {isInstalling === pluginDetails.id ? 'Installing...' : `Install for ${pluginDetails.price === 0 ? 'FREE' : `$${pluginDetails.price.toFixed(2)}`}`}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PluginSystem;
