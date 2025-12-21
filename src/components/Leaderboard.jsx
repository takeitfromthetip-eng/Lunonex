import React, { useState } from 'react';
import './Leaderboard.css';

const Leaderboard = () => {
    const [activeTab, setActiveTab] = useState('leaderboard');
    const [timeFilter, setTimeFilter] = useState('week');

    const topCreators = [
        { rank: 1, username: '@sarahcreates', avatar: '👩‍🎨', followers: 24789, projects: 342, likes: 156234, streak: 47, badges: ['🏆', '🔥', '⭐', '💎'] },
        { rank: 2, username: '@alexvfx', avatar: '🎬', followers: 18934, projects: 287, likes: 98765, streak: 34, badges: ['🏆', '🔥', '⭐'] },
        { rank: 3, username: '@mikethompsonmusic', avatar: '🎵', followers: 16234, projects: 423, likes: 87234, streak: 28, badges: ['🏆', '🔥', '💎'] },
        { rank: 4, username: '@designpro', avatar: '🎨', followers: 14567, projects: 198, likes: 76543, streak: 41, badges: ['🏆', '⭐'] },
        { rank: 5, username: '@vrmaster', avatar: '🥽', followers: 12834, projects: 156, likes: 65432, streak: 23, badges: ['🏆', '🔥'] },
        { rank: 6, username: '@editqueen', avatar: '✂️', followers: 11234, projects: 234, likes: 54321, streak: 19, badges: ['🏆'] },
        { rank: 7, username: '@audiowizard', avatar: '🎧', followers: 9876, projects: 312, likes: 43210, streak: 15, badges: ['🔥', '⭐'] },
        { rank: 8, username: '@photogod', avatar: '📸', followers: 8765, projects: 189, likes: 39876, streak: 31, badges: ['⭐', '💎'] },
        { rank: 9, username: '@animationking', avatar: '🎭', followers: 7654, projects: 267, likes: 35678, streak: 12, badges: ['🔥'] },
        { rank: 10, username: '@streamerlive', avatar: '📡', followers: 6543, projects: 145, likes: 31234, streak: 8, badges: ['⭐'] },
    ];

    const achievements = [
        {
            id: 1,
            icon: '🏆',
            name: 'Top Creator',
            description: 'Ranked #1 on the leaderboard',
            rarity: 'legendary',
            unlocked: false,
            requirement: 'Be #1 on weekly leaderboard',
            reward: 'Gold badge + Featured spot'
        },
        {
            id: 2,
            icon: '🔥',
            name: 'On Fire',
            description: '30-day project streak',
            rarity: 'epic',
            unlocked: true,
            requirement: 'Post projects 30 days in a row',
            reward: 'Fire badge + 2x visibility'
        },
        {
            id: 3,
            icon: '⭐',
            name: 'Rising Star',
            description: 'First 10K followers',
            rarity: 'rare',
            unlocked: true,
            requirement: 'Reach 10,000 followers',
            reward: 'Star badge + Profile boost'
        },
        {
            id: 4,
            icon: '💎',
            name: 'Diamond Creator',
            description: '100 published projects',
            rarity: 'rare',
            unlocked: true,
            requirement: 'Publish 100 projects',
            reward: 'Diamond badge + Template access'
        },
        {
            id: 5,
            icon: '👑',
            name: 'King of Content',
            description: '1M total views',
            rarity: 'legendary',
            unlocked: false,
            requirement: 'Reach 1 million project views',
            reward: 'Crown badge + VIP status'
        },
        {
            id: 6,
            icon: '🚀',
            name: 'Viral Hit',
            description: 'Project with 100K+ views',
            rarity: 'epic',
            unlocked: false,
            requirement: 'Single project reaches 100K views',
            reward: 'Rocket badge + Homepage feature'
        },
        {
            id: 7,
            icon: '💰',
            name: 'Money Maker',
            description: 'Earned $10K in tips',
            rarity: 'epic',
            unlocked: false,
            requirement: 'Receive $10,000 in tips',
            reward: 'Money badge + Premium features'
        },
        {
            id: 8,
            icon: '🎓',
            name: 'Early Adopter',
            description: 'Joined in first 1000 users',
            rarity: 'legendary',
            unlocked: true,
            requirement: 'Be among first 1000 users',
            reward: 'OG badge + Lifetime perks'
        },
        {
            id: 9,
            icon: '🤝',
            name: 'Community Hero',
            description: '1000+ collaborations',
            rarity: 'rare',
            unlocked: false,
            requirement: 'Collaborate on 1000 projects',
            reward: 'Hero badge + Collab priority'
        },
        {
            id: 10,
            icon: '⚡',
            name: 'Speed Demon',
            description: '100 projects in 30 days',
            rarity: 'epic',
            unlocked: false,
            requirement: 'Publish 100 projects in one month',
            reward: 'Lightning badge + Fast track'
        },
        {
            id: 11,
            icon: '🎯',
            name: 'Perfect Score',
            description: 'All projects 5-star rated',
            rarity: 'legendary',
            unlocked: false,
            requirement: 'Maintain 5.0 rating for 50+ projects',
            reward: 'Perfect badge + Quality seal'
        },
        {
            id: 12,
            icon: '🌟',
            name: 'Influencer',
            description: '50K+ followers',
            rarity: 'epic',
            unlocked: false,
            requirement: 'Reach 50,000 followers',
            reward: 'Influencer badge + Marketing tools'
        },
    ];

    const userStats = {
        rank: 47,
        totalPoints: 8234,
        nextRank: 8500,
        percentToNext: 91,
        followers: 3421,
        projects: 87,
        likes: 12345,
        streak: 9,
        badges: ['🔥', '⭐'],
    };

    return (
        <div className="leaderboard-system">
            <div className="leaderboard-header">
                <div className="header-content">
                    <h1>🏆 Leaderboard & Achievements</h1>
                    <p className="header-subtitle">
                        Compete, achieve, dominate · Badges, rankings, social proof
                    </p>
                </div>

                <div className="user-rank-card">
                    <div className="rank-badge">
                        <div className="rank-number">#{userStats.rank}</div>
                        <div className="rank-label">Your Rank</div>
                    </div>
                    <div className="rank-progress">
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${userStats.percentToNext}%` }}></div>
                        </div>
                        <div className="progress-text">
                            {userStats.totalPoints.toLocaleString()} / {userStats.nextRank.toLocaleString()} points
                        </div>
                        <div className="rank-next">
                            {userStats.nextRank - userStats.totalPoints} points to rank #{userStats.rank - 1}
                        </div>
                    </div>
                </div>
            </div>

            <div className="leaderboard-tabs">
                <button
                    className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('leaderboard')}
                >
                    🏆 Top Creators
                </button>
                <button
                    className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
                    onClick={() => setActiveTab('achievements')}
                >
                    🎯 Achievements
                </button>
                <button
                    className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    📊 My Stats
                </button>
            </div>

            {activeTab === 'leaderboard' && (
                <div className="leaderboard-section">
                    <div className="time-filters">
                        <button
                            className={`filter-btn ${timeFilter === 'day' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('day')}
                        >
                            Today
                        </button>
                        <button
                            className={`filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('week')}
                        >
                            This Week
                        </button>
                        <button
                            className={`filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('month')}
                        >
                            This Month
                        </button>
                        <button
                            className={`filter-btn ${timeFilter === 'alltime' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('alltime')}
                        >
                            All Time
                        </button>
                    </div>

                    <div className="top-three-podium">
                        {topCreators.slice(0, 3).map((creator) => (
                            <div key={creator.rank} className={`podium-card rank-${creator.rank}`}>
                                <div className="podium-rank">
                                    {creator.rank === 1 && '🥇'}
                                    {creator.rank === 2 && '🥈'}
                                    {creator.rank === 3 && '🥉'}
                                </div>
                                <div className="podium-avatar">{creator.avatar}</div>
                                <div className="podium-username">{creator.username}</div>
                                <div className="podium-stats">
                                    <div className="podium-stat">
                                        <span className="stat-icon">👥</span>
                                        <span>{(creator.followers / 1000).toFixed(1)}K</span>
                                    </div>
                                    <div className="podium-stat">
                                        <span className="stat-icon">❤️</span>
                                        <span>{(creator.likes / 1000).toFixed(0)}K</span>
                                    </div>
                                </div>
                                <div className="podium-badges">
                                    {creator.badges.map((badge, i) => (
                                        <span key={i} className="badge-icon">{badge}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="leaderboard-table">
                        {topCreators.slice(3).map((creator) => (
                            <div key={creator.rank} className="leaderboard-row">
                                <div className="row-rank">#{creator.rank}</div>
                                <div className="row-avatar">{creator.avatar}</div>
                                <div className="row-info">
                                    <div className="row-username">{creator.username}</div>
                                    <div className="row-badges">
                                        {creator.badges.map((badge, i) => (
                                            <span key={i} className="badge-small">{badge}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="row-stats">
                                    <div className="row-stat">
                                        <span className="stat-label">Followers</span>
                                        <span className="stat-value">{(creator.followers / 1000).toFixed(1)}K</span>
                                    </div>
                                    <div className="row-stat">
                                        <span className="stat-label">Projects</span>
                                        <span className="stat-value">{creator.projects}</span>
                                    </div>
                                    <div className="row-stat">
                                        <span className="stat-label">Likes</span>
                                        <span className="stat-value">{(creator.likes / 1000).toFixed(0)}K</span>
                                    </div>
                                    <div className="row-stat">
                                        <span className="stat-label">Streak</span>
                                        <span className="stat-value">{creator.streak}🔥</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'achievements' && (
                <div className="achievements-section">
                    <div className="achievements-summary">
                        <div className="summary-card">
                            <div className="summary-icon">🎯</div>
                            <div className="summary-content">
                                <div className="summary-value">{achievements.filter(a => a.unlocked).length}/{achievements.length}</div>
                                <div className="summary-label">Unlocked</div>
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-icon">⭐</div>
                            <div className="summary-content">
                                <div className="summary-value">{achievements.filter(a => a.rarity === 'legendary' && a.unlocked).length}</div>
                                <div className="summary-label">Legendary</div>
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-icon">💎</div>
                            <div className="summary-content">
                                <div className="summary-value">{achievements.filter(a => a.rarity === 'epic' && a.unlocked).length}</div>
                                <div className="summary-label">Epic</div>
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-icon">🌟</div>
                            <div className="summary-content">
                                <div className="summary-value">{achievements.filter(a => a.rarity === 'rare' && a.unlocked).length}</div>
                                <div className="summary-label">Rare</div>
                            </div>
                        </div>
                    </div>

                    <div className="achievements-grid">
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'} rarity-${achievement.rarity}`}
                            >
                                <div className="achievement-icon">{achievement.icon}</div>
                                <div className="achievement-info">
                                    <div className="achievement-name">{achievement.name}</div>
                                    <div className="achievement-description">{achievement.description}</div>
                                    <div className="achievement-requirement">{achievement.requirement}</div>
                                    <div className="achievement-reward">
                                        <span className="reward-label">Reward:</span> {achievement.reward}
                                    </div>
                                </div>
                                {achievement.unlocked && (
                                    <div className="unlocked-badge">✓ Unlocked</div>
                                )}
                                {!achievement.unlocked && (
                                    <div className="locked-overlay">
                                        <div className="lock-icon">🔒</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'stats' && (
                <div className="stats-section">
                    <div className="stats-grid">
                        <div className="stat-card-large">
                            <div className="stat-icon-large">👥</div>
                            <div className="stat-content-large">
                                <div className="stat-value-large">{userStats.followers.toLocaleString()}</div>
                                <div className="stat-label-large">Followers</div>
                                <div className="stat-growth">+234 this week (+7.3%)</div>
                            </div>
                        </div>

                        <div className="stat-card-large">
                            <div className="stat-icon-large">📁</div>
                            <div className="stat-content-large">
                                <div className="stat-value-large">{userStats.projects}</div>
                                <div className="stat-label-large">Projects</div>
                                <div className="stat-growth">+12 this week</div>
                            </div>
                        </div>

                        <div className="stat-card-large">
                            <div className="stat-icon-large">❤️</div>
                            <div className="stat-content-large">
                                <div className="stat-value-large">{userStats.likes.toLocaleString()}</div>
                                <div className="stat-label-large">Total Likes</div>
                                <div className="stat-growth">+1.2K this week</div>
                            </div>
                        </div>

                        <div className="stat-card-large">
                            <div className="stat-icon-large">🔥</div>
                            <div className="stat-content-large">
                                <div className="stat-value-large">{userStats.streak}</div>
                                <div className="stat-label-large">Day Streak</div>
                                <div className="stat-growth">Don't break it!</div>
                            </div>
                        </div>
                    </div>

                    <div className="gamification-info">
                        <div className="info-section">
                            <h3>🎮 How Points Work</h3>
                            <ul>
                                <li><strong>+100 points</strong> - Publish a project</li>
                                <li><strong>+10 points</strong> - Get a like</li>
                                <li><strong>+50 points</strong> - Get a comment</li>
                                <li><strong>+200 points</strong> - Get featured</li>
                                <li><strong>+500 points</strong> - Trending project</li>
                                <li><strong>+1000 points</strong> - Viral hit (100K+ views)</li>
                                <li><strong>+50 points/day</strong> - Maintain streak</li>
                            </ul>
                        </div>

                        <div className="info-section">
                            <h3>🏆 Rank Benefits</h3>
                            <ul>
                                <li><strong>Top 10:</strong> Homepage feature + Gold badge</li>
                                <li><strong>Top 50:</strong> Priority in search + Silver badge</li>
                                <li><strong>Top 100:</strong> Discovery boost + Bronze badge</li>
                                <li><strong>Top 1000:</strong> Profile highlight + Rising badge</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
