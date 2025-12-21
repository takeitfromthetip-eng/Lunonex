import React, { useState, useEffect } from 'react';
import './Discovery.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Creator Discovery Component
 * Search, trending, recommendations, featured creators
 */
export default function Discovery() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [trending, setTrending] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [niches, setNiches] = useState([]);
    const [selectedNiche, setSelectedNiche] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('featured'); // featured, search, trending, niches

    useEffect(() => {
        loadFeatured();
        loadTrending();
        loadNiches();
    }, []);

    const loadFeatured = async () => {
        try {
            const response = await fetch(`${API_URL}/api/discovery/featured`);
            const data = await response.json();
            setFeatured(data.featured || []);
        } catch (error) {
            console.error('Failed to load featured creators:', error);
        }
    };

    const loadTrending = async () => {
        try {
            const response = await fetch(`${API_URL}/api/discovery/trending?limit=10`);
            const data = await response.json();
            setTrending(data.trending || []);
        } catch (error) {
            console.error('Failed to load trending creators:', error);
        }
    };

    const loadNiches = async () => {
        try {
            const response = await fetch(`${API_URL}/api/discovery/niches`);
            const data = await response.json();
            setNiches(data.niches || []);
        } catch (error) {
            console.error('Failed to load niches:', error);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(
                `${API_URL}/api/discovery/search?query=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();
            setSearchResults(data.results || []);
            setActiveTab('search');
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNicheSelect = async (niche) => {
        setSelectedNiche(niche);
        setLoading(true);
        try {
            const response = await fetch(
                `${API_URL}/api/discovery/search?niche=${encodeURIComponent(niche)}`
            );
            const data = await response.json();
            setSearchResults(data.results || []);
            setActiveTab('search');
        } catch (error) {
            console.error('Niche search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const CreatorCard = ({ creator }) => (
        <div className="creator-card">
            <img 
                src={creator.avatar_url || '/default-avatar.png'} 
                alt={creator.display_name}
                className="creator-avatar"
            />
            <div className="creator-info">
                <h3>{creator.display_name}</h3>
                <p className="creator-username">@{creator.username}</p>
                {creator.niche && <span className="creator-niche">{creator.niche}</span>}
                {creator.verified && <span className="verified-badge">✓</span>}
                <p className="creator-bio">{creator.bio?.substring(0, 100)}</p>
                <div className="creator-stats">
                    <span>{creator.follower_count || 0} followers</span>
                    {creator.tags && (
                        <div className="creator-tags">
                            {creator.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
                <button className="btn-follow">Follow</button>
            </div>
        </div>
    );

    return (
        <div className="discovery-page">
            <header className="discovery-header">
                <h1>Discover Creators</h1>
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Search creators, tags, or niches..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="btn-search" disabled={loading}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </header>

            <div className="discovery-tabs">
                <button 
                    className={activeTab === 'featured' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('featured')}
                >
                    Featured
                </button>
                <button 
                    className={activeTab === 'trending' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('trending')}
                >
                    Trending
                </button>
                <button 
                    className={activeTab === 'niches' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('niches')}
                >
                    By Niche
                </button>
                {searchResults.length > 0 && (
                    <button 
                        className={activeTab === 'search' ? 'tab active' : 'tab'}
                        onClick={() => setActiveTab('search')}
                    >
                        Search Results ({searchResults.length})
                    </button>
                )}
            </div>

            <div className="discovery-content">
                {activeTab === 'featured' && (
                    <div className="creators-grid">
                        {featured.map(creator => (
                            <CreatorCard key={creator.id} creator={creator} />
                        ))}
                    </div>
                )}

                {activeTab === 'trending' && (
                    <div className="creators-grid">
                        {trending.map(creator => (
                            <CreatorCard key={creator.id} creator={creator} />
                        ))}
                    </div>
                )}

                {activeTab === 'niches' && (
                    <div className="niches-list">
                        {niches.map(niche => (
                            <div 
                                key={niche.name} 
                                className="niche-card"
                                onClick={() => handleNicheSelect(niche.name)}
                            >
                                <h3>{niche.name}</h3>
                                <p>{niche.count} creators</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'search' && (
                    <div>
                        {selectedNiche && (
                            <div className="search-info">
                                <p>Showing creators in: <strong>{selectedNiche}</strong></p>
                                <button onClick={() => setSelectedNiche(null)}>Clear filter</button>
                            </div>
                        )}
                        <div className="creators-grid">
                            {searchResults.map(creator => (
                                <CreatorCard key={creator.id} creator={creator} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
