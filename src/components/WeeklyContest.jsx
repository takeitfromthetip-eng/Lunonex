import React, { useState } from 'react';
import './WeeklyContest.css';

const WeeklyContest = () => {
    const [activeTab, setActiveTab] = useState('current');
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);

    // Current contest data
    const currentContest = {
        theme: "Cyberpunk Dreams",
        description: "Create the most stunning cyberpunk-themed content. Videos, art, music - anything goes!",
        prizePool: 500,
        endsIn: "3 days 14 hours",
        totalEntries: 147,
        totalVotes: 3842,
        platformFee: 75, // 15% of prize pool
        creatorWins: 425, // 85% of prize pool
        category: "Open Theme",
        rules: [
            "Must be original content created on ForTheWeebs",
            "Can be video, audio, design, or VR project",
            "Entries close 48 hours before voting ends",
            "One vote per user - vote wisely!",
            "Winner takes 85% ($425), platform keeps 15% ($75)"
        ]
    };

    // Top entries
    const entries = [
        {
            id: 1,
            rank: 1,
            title: "Neon Nights - Music Video",
            creator: "@sarahcreates",
            avatar: "👩‍🎨",
            thumbnail: "🎬",
            votes: 892,
            tool: "Video Editor",
            duration: "2:34",
            views: 12847,
            description: "Synthwave music video with custom VFX and color grading",
            trending: true
        },
        {
            id: 2,
            rank: 2,
            title: "Electric Dreams Album Art",
            creator: "@alexvfx",
            avatar: "🎨",
            thumbnail: "🖼️",
            votes: 784,
            tool: "Design Suite",
            views: 9234,
            description: "Retro-futuristic album cover with neon typography"
        },
        {
            id: 3,
            rank: 3,
            title: "Cyberpunk City VR Experience",
            creator: "@vrmaster",
            avatar: "🥽",
            thumbnail: "🌆",
            votes: 671,
            tool: "VR Studio",
            views: 7891,
            description: "Fully immersive cyberpunk cityscape you can explore"
        },
        {
            id: 4,
            rank: 4,
            title: "Synthwave Beats Pack",
            creator: "@beatmaker",
            avatar: "🎵",
            thumbnail: "🎹",
            votes: 542,
            tool: "Audio Studio",
            views: 6543,
            description: "10 original synthwave tracks with retro vibes"
        },
        {
            id: 5,
            rank: 5,
            title: "Neon Samurai Illustration",
            creator: "@artgod",
            avatar: "🖌️",
            thumbnail: "🗾",
            votes: 489,
            tool: "Photo Editor",
            views: 5234,
            description: "Hand-drawn cyberpunk samurai with glowing effects"
        }
    ];

    // Past winners
    const pastWinners = [
        {
            week: "Week 11",
            theme: "Halloween Horror",
            winner: "@sarahcreates",
            title: "Haunted VHS Effect",
            prize: 425,
            votes: 1247
        },
        {
            week: "Week 10",
            theme: "Lo-Fi Chill",
            winner: "@beatmaker",
            title: "Rainy Day Study Mix",
            prize: 425,
            votes: 1089
        },
        {
            week: "Week 9",
            theme: "Abstract Art",
            winner: "@alexvfx",
            title: "Liquid Dreams",
            prize: 425,
            votes: 956
        }
    ];

    const handleVote = (entryId) => {
        if (!hasVoted) {
            setHasVoted(true);
            setSelectedEntry(entryId);
            // In real app: API call to record vote
        }
    };

    const shareEntry = (entry) => {
        // In real app: Generate share link with tracking
        const shareUrl = `https://fortheweebs.netlify.app/contest/${entry.id}`;
        navigator.clipboard.writeText(shareUrl);
        alert('Share link copied! Share to get more votes!');
    };

    return (
        <div className="weekly-contest">
            <div className="contest-header">
                <div className="contest-hero">
                    <h1>🏆 Weekly Contest</h1>
                    <p className="subtitle">Compete for $500 prize pool every week! Community decides the winner.</p>
                </div>

                <div className="contest-stats">
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-label">Prize Pool</div>
                        <div className="stat-value">${currentContest.prizePool}</div>
                        <div className="stat-detail">Winner gets ${currentContest.creatorWins}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⏱️</div>
                        <div className="stat-label">Ends In</div>
                        <div className="stat-value">{currentContest.endsIn}</div>
                        <div className="stat-detail">Vote before time runs out</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-label">Total Entries</div>
                        <div className="stat-value">{currentContest.totalEntries}</div>
                        <div className="stat-detail">{currentContest.totalVotes} votes cast</div>
                    </div>
                </div>
            </div>

            {/* Contest Info Banner */}
            <div className="contest-info-banner">
                <div className="theme-badge">
                    <span className="badge-icon">🎨</span>
                    <div className="theme-info">
                        <div className="theme-label">This Week's Theme</div>
                        <div className="theme-name">{currentContest.theme}</div>
                    </div>
                </div>
                <div className="theme-description">{currentContest.description}</div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'current' ? 'active' : ''}`}
                    onClick={() => setActiveTab('current')}
                >
                    🎯 Current Contest
                </button>
                <button
                    className={`tab ${activeTab === 'rules' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rules')}
                >
                    📋 Rules & Info
                </button>
                <button
                    className={`tab ${activeTab === 'winners' ? 'active' : ''}`}
                    onClick={() => setActiveTab('winners')}
                >
                    🏅 Past Winners
                </button>
            </div>

            {/* Current Contest Tab */}
            {activeTab === 'current' && (
                <div className="tab-content active">
                    {hasVoted && (
                        <div className="vote-confirmation">
                            <div className="confirmation-icon">✅</div>
                            <div className="confirmation-text">
                                <strong>Vote Recorded!</strong> Share your favorite entry to help them win!
                            </div>
                        </div>
                    )}

                    <div className="entries-grid">
                        {entries.map((entry) => (
                            <div
                                key={entry.id}
                                className={`entry-card ${selectedEntry === entry.id ? 'voted' : ''} ${entry.trending ? 'trending' : ''}`}
                            >
                                {entry.trending && <div className="trending-badge">🔥 Trending</div>}
                                {entry.rank <= 3 && (
                                    <div className={`rank-badge rank-${entry.rank}`}>
                                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                                        #{entry.rank}
                                    </div>
                                )}

                                <div className="entry-thumbnail">
                                    <div className="thumbnail-placeholder">{entry.thumbnail}</div>
                                    <div className="entry-stats-overlay">
                                        <span>👁️ {entry.views.toLocaleString()}</span>
                                        <span>🗳️ {entry.votes}</span>
                                    </div>
                                </div>

                                <div className="entry-content">
                                    <div className="entry-header">
                                        <div className="creator-info">
                                            <span className="creator-avatar">{entry.avatar}</span>
                                            <span className="creator-name">{entry.creator}</span>
                                        </div>
                                        <div className="tool-badge">{entry.tool}</div>
                                    </div>

                                    <h3 className="entry-title">{entry.title}</h3>
                                    <p className="entry-description">{entry.description}</p>

                                    <div className="vote-section">
                                        <div className="vote-count">
                                            <span className="vote-icon">🗳️</span>
                                            <span className="vote-number">{entry.votes} votes</span>
                                        </div>
                                        <div className="entry-actions">
                                            <button
                                                className={`vote-btn ${selectedEntry === entry.id ? 'voted' : ''}`}
                                                onClick={() => handleVote(entry.id)}
                                                disabled={hasVoted}
                                            >
                                                {selectedEntry === entry.id ? '✅ Voted' : hasVoted ? 'Already Voted' : '🗳️ Vote'}
                                            </button>
                                            <button
                                                className="share-btn"
                                                onClick={() => shareEntry(entry)}
                                            >
                                                📤 Share
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="submit-cta">
                        <h3>Got something amazing? Enter the contest!</h3>
                        <p>Create your project in any of our 6 tools and submit before entries close.</p>
                        <button className="submit-btn">📤 Submit Your Entry</button>
                    </div>
                </div>
            )}

            {/* Rules Tab */}
            {activeTab === 'rules' && (
                <div className="tab-content active">
                    <div className="rules-section">
                        <h2>📋 Contest Rules</h2>
                        <ul className="rules-list">
                            {currentContest.rules.map((rule, index) => (
                                <li key={index}>{rule}</li>
                            ))}
                        </ul>

                        <div className="prize-breakdown">
                            <h3>💰 Prize Breakdown</h3>
                            <div className="breakdown-bar">
                                <div className="breakdown-segment creator" style={{ width: '85%' }}>
                                    <span className="segment-label">Winner: $425 (85%)</span>
                                </div>
                                <div className="breakdown-segment platform" style={{ width: '15%' }}>
                                    <span className="segment-label">Platform: $75 (15%)</span>
                                </div>
                            </div>
                            <p className="breakdown-note">
                                Platform fee covers payment processing, hosting contest infrastructure, and moderation.
                            </p>
                        </div>

                        <div className="how-it-works">
                            <h3>🎯 How It Works</h3>
                            <div className="steps-grid">
                                <div className="step-card">
                                    <div className="step-number">1</div>
                                    <h4>Create</h4>
                                    <p>Make something awesome in any of our 6 pro tools</p>
                                </div>
                                <div className="step-card">
                                    <div className="step-number">2</div>
                                    <h4>Submit</h4>
                                    <p>Enter your project before submission deadline</p>
                                </div>
                                <div className="step-card">
                                    <div className="step-number">3</div>
                                    <h4>Share</h4>
                                    <p>Get your friends to vote for your entry</p>
                                </div>
                                <div className="step-card">
                                    <div className="step-number">4</div>
                                    <h4>Win</h4>
                                    <p>Most votes wins $425 straight to your account</p>
                                </div>
                            </div>
                        </div>

                        <div className="viral-info">
                            <h3>🚀 Viral Growth Stats</h3>
                            <p>
                                <strong>Every contest generates 50,000+ social shares!</strong> Winners typically share their victory,
                                losers share "vote for me next week," and everyone shares entries they love. It's free marketing on steroids.
                            </p>
                            <div className="viral-stats-grid">
                                <div className="viral-stat">
                                    <div className="stat-big">50K+</div>
                                    <div className="stat-label">Social Shares/Week</div>
                                </div>
                                <div className="viral-stat">
                                    <div className="stat-big">3,842</div>
                                    <div className="stat-label">Votes This Week</div>
                                </div>
                                <div className="viral-stat">
                                    <div className="stat-big">147</div>
                                    <div className="stat-label">Entries Submitted</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Past Winners Tab */}
            {activeTab === 'winners' && (
                <div className="tab-content active">
                    <div className="winners-section">
                        <h2>🏅 Hall of Fame</h2>
                        <p className="winners-intro">Celebrating our talented community of winners!</p>

                        <div className="winners-list">
                            {pastWinners.map((winner, index) => (
                                <div key={index} className="winner-card">
                                    <div className="winner-badge">
                                        <span className="trophy-icon">🏆</span>
                                        <span className="week-label">{winner.week}</span>
                                    </div>
                                    <div className="winner-content">
                                        <div className="winner-theme">{winner.theme}</div>
                                        <h3 className="winner-title">{winner.title}</h3>
                                        <div className="winner-meta">
                                            <span className="winner-name">{winner.winner}</span>
                                            <span className="winner-votes">{winner.votes} votes</span>
                                        </div>
                                    </div>
                                    <div className="winner-prize">
                                        <div className="prize-amount">${winner.prize}</div>
                                        <div className="prize-label">Prize Won</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="legacy-cta">
                            <h3>Leave Your Mark</h3>
                            <p>Join the ranks of legendary creators. This week's theme: <strong>{currentContest.theme}</strong></p>
                            <button className="legacy-btn">🎯 Enter This Week's Contest</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklyContest;
