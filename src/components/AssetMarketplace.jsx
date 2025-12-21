/* eslint-disable */
// AssetMarketplace.jsx
// The feature that turns users into revenue (10-20% cut from every sale)
/**
 * Creator Asset Marketplace - Buy/sell templates, graphics, fonts, presets
 * Users can monetize their creations
 */
// Unity Asset Store exists (but for games, not creative content).
// We have EVERYTHING: templates, plugins, 3D models, audio, video, fonts, presets - ALL IN ONE PLACE.

import React, { useState, useEffect } from 'react';
import './AssetMarketplace.css';

const AssetMarketplace = ({ userBalance = 0, onPurchase, onSell }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [category, setCategory] = useState('all');
    const [sortBy, setSortBy] = useState('popular');
    const [searchQuery, setSearchQuery] = useState('');
    const [assets, setAssets] = useState([]);
    const [cart, setCart] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [myAssets, setMyAssets] = useState([]);
    const [earnings, setEarnings] = useState(2847.50); // Mock earnings

    // Mock marketplace data
    useEffect(() => {
        const mockAssets = [
            {
                id: 1,
                name: 'Cinematic LUT Pack',
                category: 'video',
                price: 29.99,
                author: 'ColorGradePro',
                rating: 4.9,
                downloads: 15420,
                thumbnail: '🎬',
                description: '50 professional color grading LUTs for cinematic look',
                tags: ['video', 'color', 'grading', 'cinematic'],
                fileSize: '125 MB'
            },
            {
                id: 2,
                name: 'Pro Audio Mastering Chain',
                category: 'audio',
                price: 49.99,
                author: 'AudioMasterStudio',
                rating: 5.0,
                downloads: 8932,
                thumbnail: '🎵',
                description: 'Professional mastering plugin chain with presets',
                tags: ['audio', 'mastering', 'plugin', 'professional'],
                fileSize: '89 MB'
            },
            {
                id: 3,
                name: 'Minimalist Logo Templates',
                category: 'design',
                price: 19.99,
                author: 'DesignMinimal',
                rating: 4.8,
                downloads: 23104,
                thumbnail: '✨',
                description: '100 minimalist logo templates for instant branding',
                tags: ['design', 'logo', 'template', 'branding'],
                fileSize: '342 MB'
            },
            {
                id: 4,
                name: 'Realistic VR Environments',
                category: 'vr',
                price: 79.99,
                author: 'VR_WorldBuilder',
                rating: 4.9,
                downloads: 4521,
                thumbnail: '🌍',
                description: '10 photorealistic VR environment scenes',
                tags: ['vr', '3d', 'environment', 'realistic'],
                fileSize: '2.4 GB'
            },
            {
                id: 5,
                name: 'Portrait Retouching Presets',
                category: 'photo',
                price: 14.99,
                author: 'PortraitPro_Studio',
                rating: 4.7,
                downloads: 31240,
                thumbnail: '📸',
                description: '30 one-click portrait retouching presets',
                tags: ['photo', 'portrait', 'retouch', 'preset'],
                fileSize: '45 MB'
            },
            {
                id: 6,
                name: 'Royalty-Free Music Pack',
                category: 'audio',
                price: 39.99,
                author: 'SoundtrackPro',
                rating: 4.8,
                downloads: 12304,
                thumbnail: '🎼',
                description: '50 royalty-free tracks for commercial use',
                tags: ['audio', 'music', 'royalty-free', 'commercial'],
                fileSize: '1.2 GB'
            },
            {
                id: 7,
                name: 'Animated Lower Thirds',
                category: 'video',
                price: 24.99,
                author: 'MotionGraphicsX',
                rating: 4.9,
                downloads: 18765,
                thumbnail: '📺',
                description: '40 animated lower third templates',
                tags: ['video', 'motion', 'animation', 'template'],
                fileSize: '156 MB'
            },
            {
                id: 8,
                name: '3D Character Models',
                category: 'vr',
                price: 99.99,
                author: '3DModelMaster',
                rating: 5.0,
                downloads: 3421,
                thumbnail: '🧑',
                description: '15 rigged 3D character models for VR/AR',
                tags: ['3d', 'character', 'rigged', 'vr'],
                fileSize: '890 MB'
            },
            {
                id: 9,
                name: 'Typography Bundle',
                category: 'design',
                price: 34.99,
                author: 'FontArtisan',
                rating: 4.8,
                downloads: 9876,
                thumbnail: '🔤',
                description: '25 premium fonts with commercial license',
                tags: ['font', 'typography', 'design', 'commercial'],
                fileSize: '78 MB'
            },
            {
                id: 10,
                name: 'Photo Actions Pack',
                category: 'photo',
                price: 16.99,
                author: 'ActionMaster',
                rating: 4.6,
                downloads: 27654,
                thumbnail: '⚡',
                description: '100 time-saving photo editing actions',
                tags: ['photo', 'editing', 'action', 'automation'],
                fileSize: '23 MB'
            }
        ];

        setAssets(mockAssets);

        // Mock user's uploaded assets
        setMyAssets([
            {
                id: 'my-1',
                name: 'My Custom Preset Pack',
                category: 'photo',
                price: 12.99,
                sales: 234,
                earnings: 2431.56,
                status: 'active'
            },
            {
                id: 'my-2',
                name: 'Audio Effect Plugin',
                category: 'audio',
                price: 19.99,
                sales: 87,
                earnings: 415.94,
                status: 'active'
            }
        ]);
    }, []);

    const filteredAssets = assets.filter(asset => {
        const matchesCategory = category === 'all' || asset.category === category;
        const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const sortedAssets = [...filteredAssets].sort((a, b) => {
        switch (sortBy) {
            case 'popular': return b.downloads - a.downloads;
            case 'rating': return b.rating - a.rating;
            case 'price-low': return a.price - b.price;
            case 'price-high': return b.price - a.price;
            case 'newest': return b.id - a.id;
            default: return 0;
        }
    });

    const addToCart = (asset) => {
        if (!cart.find(item => item.id === asset.id)) {
            setCart([...cart, asset]);
        }
    };

    const removeFromCart = (assetId) => {
        setCart(cart.filter(item => item.id !== assetId));
    };

    const checkout = () => {
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        if (window.confirm(`Purchase ${cart.length} items for $${total.toFixed(2)}?`)) {
            onPurchase && onPurchase(cart);
            setCart([]);
            setShowCart(false);
            alert('Purchase successful! 🎉');
        }
    };

    const uploadAsset = () => {
        alert('Asset upload feature coming soon! You\'ll be able to sell your creations here.');
        setShowUploadModal(false);
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
    const platformFee = cartTotal * 0.15; // 15% platform fee
    const sellerGets = cartTotal * 0.85; // 85% goes to seller

    return (
        <div className={`asset-marketplace ${isOpen ? 'open' : 'minimized'}`}>
            {!isOpen && (
                <button className="btn-open-marketplace" onClick={() => setIsOpen(true)}>
                    <span className="marketplace-icon">🛒</span>
                    Asset Marketplace
                    {cart.length > 0 && (
                        <span className="cart-badge">{cart.length}</span>
                    )}
                </button>
            )}

            {isOpen && (
                <div className="marketplace-panel">
                    <div className="marketplace-header">
                        <div className="marketplace-title">
                            <span className="marketplace-icon-large">🛒</span>
                            <div>
                                <h3>Asset Marketplace</h3>
                                <p className="marketplace-subtitle">Buy & Sell Creative Assets</p>
                            </div>
                        </div>
                        <div className="header-actions">
                            <button className="btn-upload" onClick={() => setShowUploadModal(true)}>
                                📤 Sell
                            </button>
                            <button className="btn-cart" onClick={() => setShowCart(true)}>
                                🛒 Cart ({cart.length})
                            </button>
                            <button className="btn-close-marketplace" onClick={() => setIsOpen(false)}>
                                ×
                            </button>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="stats-bar">
                        <div className="stat">
                            <span className="stat-value">${earnings.toFixed(2)}</span>
                            <span className="stat-label">Your Earnings</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">{myAssets.reduce((sum, a) => sum + a.sales, 0)}</span>
                            <span className="stat-label">Your Sales</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">{assets.length.toLocaleString()}</span>
                            <span className="stat-label">Total Assets</span>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="filters-section">
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search assets, tags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="filter-controls">
                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="all">All Categories</option>
                                <option value="video">🎬 Video</option>
                                <option value="audio">🎵 Audio</option>
                                <option value="photo">📸 Photo</option>
                                <option value="design">✨ Design</option>
                                <option value="vr">🌍 VR/AR</option>
                            </select>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="popular">Most Popular</option>
                                <option value="rating">Highest Rated</option>
                                <option value="newest">Newest</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {/* Assets Grid */}
                    <div className="assets-section">
                        <div className="assets-grid">
                            {sortedAssets.length === 0 ? (
                                <div className="no-results">
                                    <p>No assets found</p>
                                    <p>Try a different search or category</p>
                                </div>
                            ) : (
                                sortedAssets.map(asset => (
                                    <div key={asset.id} className="asset-card">
                                        <div className="asset-thumbnail">{asset.thumbnail}</div>
                                        <div className="asset-info">
                                            <h4 className="asset-name">{asset.name}</h4>
                                            <p className="asset-author">by {asset.author}</p>
                                            <p className="asset-description">{asset.description}</p>
                                            <div className="asset-tags">
                                                {asset.tags.slice(0, 3).map((tag, i) => (
                                                    <span key={i} className="asset-tag">{tag}</span>
                                                ))}
                                            </div>
                                            <div className="asset-stats">
                                                <span className="asset-rating">⭐ {asset.rating}</span>
                                                <span className="asset-downloads">⬇️ {asset.downloads.toLocaleString()}</span>
                                                <span className="asset-size">📦 {asset.fileSize}</span>
                                            </div>
                                            <div className="asset-footer">
                                                <span className="asset-price">${asset.price}</span>
                                                <button className="btn-add-cart" onClick={() => addToCart(asset)}>
                                                    {cart.find(item => item.id === asset.id) ? '✓ In Cart' : '+ Add'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Upload Modal */}
                    {showUploadModal && (
                        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>📤 Sell Your Assets</h3>
                                    <button onClick={() => setShowUploadModal(false)}>×</button>
                                </div>
                                <div className="modal-body">
                                    <p><strong>Start earning from your creations!</strong></p>
                                    <div className="upload-info">
                                        <div className="upload-benefit">
                                            <span className="benefit-icon">💰</span>
                                            <div>
                                                <strong>85% Revenue Share</strong>
                                                <p>You keep most of the profit</p>
                                            </div>
                                        </div>
                                        <div className="upload-benefit">
                                            <span className="benefit-icon">🌍</span>
                                            <div>
                                                <strong>Global Reach</strong>
                                                <p>Millions of potential buyers</p>
                                            </div>
                                        </div>
                                        <div className="upload-benefit">
                                            <span className="benefit-icon">📊</span>
                                            <div>
                                                <strong>Analytics Dashboard</strong>
                                                <p>Track sales and earnings</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="upload-note">
                                        Upload templates, presets, plugins, models, audio, fonts, and more!
                                    </p>
                                    <button className="btn-upload-now" onClick={uploadAsset}>
                                        Upload Asset
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cart Modal */}
                    {showCart && (
                        <div className="modal-overlay" onClick={() => setShowCart(false)}>
                            <div className="modal-content cart-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>🛒 Your Cart ({cart.length})</h3>
                                    <button onClick={() => setShowCart(false)}>×</button>
                                </div>
                                <div className="modal-body">
                                    {cart.length === 0 ? (
                                        <div className="cart-empty">
                                            <p>Your cart is empty</p>
                                            <p>Browse assets and add them to cart</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="cart-items">
                                                {cart.map(item => (
                                                    <div key={item.id} className="cart-item">
                                                        <span className="cart-item-icon">{item.thumbnail}</span>
                                                        <div className="cart-item-info">
                                                            <strong>{item.name}</strong>
                                                            <span className="cart-item-author">by {item.author}</span>
                                                        </div>
                                                        <span className="cart-item-price">${item.price}</span>
                                                        <button className="btn-remove" onClick={() => removeFromCart(item.id)}>
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="cart-summary">
                                                <div className="summary-row">
                                                    <span>Subtotal:</span>
                                                    <span>${cartTotal.toFixed(2)}</span>
                                                </div>
                                                <div className="summary-row">
                                                    <span>Platform Fee (15%):</span>
                                                    <span>${platformFee.toFixed(2)}</span>
                                                </div>
                                                <div className="summary-row total">
                                                    <span><strong>Total:</strong></span>
                                                    <span><strong>${cartTotal.toFixed(2)}</strong></span>
                                                </div>
                                                <p className="seller-note">
                                                    Sellers receive: ${sellerGets.toFixed(2)} (85%)
                                                </p>
                                            </div>
                                            <button className="btn-checkout" onClick={checkout}>
                                                💳 Checkout
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AssetMarketplace;
