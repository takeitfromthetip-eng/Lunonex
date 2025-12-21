import React, { useState, useEffect } from 'react';
import './Marketplace.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Marketplace Component
 * Browse and purchase assets, templates, presets from creators
 */
export default function Marketplace() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [sortBy, setSortBy] = useState('popular');
    const [loading, setLoading] = useState(false);
    const [myPurchases, setMyPurchases] = useState([]);
    const [view, setView] = useState('browse'); // browse or purchases

    const userId = localStorage.getItem('userId'); // Get from auth

    useEffect(() => {
        loadCategories();
        loadItems();
        if (userId) {
            loadMyPurchases();
        }
    }, [selectedCategory, sortBy]);

    const loadCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/api/marketplace/categories`);
            const data = await response.json();
            setCategories(data.categories || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadItems = async () => {
        setLoading(true);
        try {
            let url = `${API_URL}/api/marketplace/browse?sort=${sortBy}`;
            if (selectedCategory) {
                url += `&category=${selectedCategory}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            setItems(data.items || []);
        } catch (error) {
            console.error('Failed to load items:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMyPurchases = async () => {
        try {
            const response = await fetch(`${API_URL}/api/marketplace/my-purchases/${userId}`);
            const data = await response.json();
            setMyPurchases(data.purchases || []);
        } catch (error) {
            console.error('Failed to load purchases:', error);
        }
    };

    const handlePurchase = async (itemId) => {
        if (!userId) {
            alert('Please log in to purchase items');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/marketplace/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, buyerId: userId })
            });

            const data = await response.json();

            if (data.clientSecret) {
                // Redirect to Stripe checkout
                alert('Redirecting to payment...');
                // Implement Stripe payment flow here
            }
        } catch (error) {
            console.error('Purchase failed:', error);
            alert('Purchase failed. Please try again.');
        }
    };

    const ItemCard = ({ item }) => (
        <div className="marketplace-item">
            <div className="item-preview">
                {item.preview_images && item.preview_images.length > 0 ? (
                    <img src={item.preview_images[0]} alt={item.title} />
                ) : (
                    <div className="no-preview">No preview available</div>
                )}
                {item.type && <span className="item-type">{item.type}</span>}
            </div>
            <div className="item-info">
                <h3>{item.title}</h3>
                <p className="item-seller">
                    by {item.seller?.display_name || 'Unknown'}
                    {item.seller?.verified && <span className="verified">✓</span>}
                </p>
                <p className="item-description">
                    {item.description?.substring(0, 100)}...
                </p>
                <div className="item-tags">
                    {item.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                    ))}
                </div>
                <div className="item-footer">
                    <div className="item-stats">
                        <span>⭐ {item.rating_avg?.toFixed(1) || 'New'}</span>
                        <span>🛒 {item.sales_count || 0} sales</span>
                    </div>
                    <div className="item-price">
                        <strong>${(item.price / 100).toFixed(2)}</strong>
                        <button 
                            className="btn-purchase"
                            onClick={() => handlePurchase(item.id)}
                        >
                            Purchase
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const PurchaseCard = ({ purchase }) => (
        <div className="purchase-card">
            <img 
                src={purchase.item?.preview_images?.[0] || '/default-item.png'} 
                alt={purchase.item?.title}
                className="purchase-thumb"
            />
            <div className="purchase-info">
                <h4>{purchase.item?.title}</h4>
                <p>by {purchase.seller?.display_name}</p>
                <p className="purchase-date">
                    Purchased {new Date(purchase.completed_at).toLocaleDateString()}
                </p>
                <button className="btn-download">Download Files</button>
            </div>
        </div>
    );

    return (
        <div className="marketplace-page">
            <header className="marketplace-header">
                <h1>Marketplace</h1>
                <p>Assets, templates, and tools from creators</p>
                
                <div className="marketplace-nav">
                    <button 
                        className={view === 'browse' ? 'nav-btn active' : 'nav-btn'}
                        onClick={() => setView('browse')}
                    >
                        Browse
                    </button>
                    {userId && (
                        <button 
                            className={view === 'purchases' ? 'nav-btn active' : 'nav-btn'}
                            onClick={() => setView('purchases')}
                        >
                            My Purchases ({myPurchases.length})
                        </button>
                    )}
                </div>
            </header>

            {view === 'browse' ? (
                <>
                    <div className="marketplace-controls">
                        <div className="categories">
                            <button
                                className={!selectedCategory ? 'category-btn active' : 'category-btn'}
                                onClick={() => setSelectedCategory(null)}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={selectedCategory === cat.id ? 'category-btn active' : 'category-btn'}
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    {cat.icon} {cat.name} ({cat.itemCount})
                                </button>
                            ))}
                        </div>
                        
                        <div className="sort-controls">
                            <label>Sort by:</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="popular">Most Popular</option>
                                <option value="recent">Recently Added</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                                <option value="rating">Highest Rated</option>
                            </select>
                        </div>
                    </div>

                    <div className="marketplace-grid">
                        {loading ? (
                            <div className="loading">Loading items...</div>
                        ) : items.length > 0 ? (
                            items.map(item => <ItemCard key={item.id} item={item} />)
                        ) : (
                            <div className="no-items">No items found in this category</div>
                        )}
                    </div>
                </>
            ) : (
                <div className="purchases-list">
                    <h2>My Purchases</h2>
                    {myPurchases.length > 0 ? (
                        myPurchases.map(purchase => (
                            <PurchaseCard key={purchase.id} purchase={purchase} />
                        ))
                    ) : (
                        <div className="no-purchases">
                            <p>You haven't purchased anything yet</p>
                            <button onClick={() => setView('browse')}>Browse Marketplace</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
