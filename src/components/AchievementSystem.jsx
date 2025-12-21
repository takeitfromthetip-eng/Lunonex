import React, { useState, useEffect } from 'react';
import './AchievementSystem.css';

/**
 * Gamification achievement system
 * Tracks user milestones and displays achievement unlocks
 */

const ACHIEVEMENTS = [
    {
        id: 'first_project',
        title: 'First Steps',
        description: 'Created your first project',
        icon: '🎨',
        points: 10,
        rarity: 'common'
    },
    {
        id: 'five_projects',
        title: 'Getting Started',
        description: 'Created 5 projects',
        icon: '🚀',
        points: 25,
        rarity: 'common'
    },
    {
        id: 'first_export',
        title: 'Sharing is Caring',
        description: 'Exported your first creation',
        icon: '📤',
        points: 15,
        rarity: 'common'
    },
    {
        id: 'speed_demon',
        title: 'Speed Demon',
        description: 'Used 5 keyboard shortcuts',
        icon: '⚡',
        points: 20,
        rarity: 'uncommon'
    },
    {
        id: 'night_owl',
        title: 'Night Owl',
        description: 'Created at 3 AM',
        icon: '🦉',
        points: 15,
        rarity: 'uncommon'
    },
    {
        id: 'power_user',
        title: 'Power User',
        description: 'Used all 5 creator tools',
        icon: '💪',
        points: 50,
        rarity: 'rare'
    },
    {
        id: 'vip_supporter',
        title: 'VIP Supporter',
        description: 'Subscribed to VIP tier',
        icon: '👑',
        points: 100,
        rarity: 'epic'
    },
    {
        id: 'master_creator',
        title: 'Master Creator',
        description: 'Created 100 projects',
        icon: '🏆',
        points: 200,
        rarity: 'legendary'
    }
];

const AchievementSystem = ({ userId }) => {
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);
    const [recentUnlock, setRecentUnlock] = useState(null);
    const [totalPoints, setTotalPoints] = useState(0);

    useEffect(() => {
        // Load achievements from localStorage
        const saved = localStorage.getItem(`achievements_${userId}`);
        if (saved) {
            const unlocked = JSON.parse(saved);
            setUnlockedAchievements(unlocked);

            const points = unlocked.reduce((sum, id) => {
                const achievement = ACHIEVEMENTS.find(a => a.id === id);
                return sum + (achievement?.points || 0);
            }, 0);
            setTotalPoints(points);
        }
    }, [userId]);

    const unlockAchievement = (achievementId) => {
        if (unlockedAchievements.includes(achievementId)) return;

        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!achievement) return;

        const newUnlocked = [...unlockedAchievements, achievementId];
        setUnlockedAchievements(newUnlocked);
        setTotalPoints(prev => prev + achievement.points);
        setRecentUnlock(achievement);

        // Save to localStorage
        localStorage.setItem(`achievements_${userId}`, JSON.stringify(newUnlocked));

        // Hide notification after 5 seconds
        setTimeout(() => setRecentUnlock(null), 5000);
    };

    // Expose unlock function globally
    useEffect(() => {
        window.unlockAchievement = unlockAchievement;
    }, [unlockedAchievements]);

    return (
        <>
            {/* Achievement unlock notification */}
            {recentUnlock && (
                <div className="achievement-unlock">
                    <div className="achievement-content">
                        <div className="achievement-icon-large">{recentUnlock.icon}</div>
                        <div className="achievement-details">
                            <div className="achievement-unlock-title">Achievement Unlocked!</div>
                            <div className="achievement-name">{recentUnlock.title}</div>
                            <div className="achievement-description">{recentUnlock.description}</div>
                            <div className="achievement-points">+{recentUnlock.points} points</div>
                        </div>
                    </div>
                    <div className={`achievement-rarity ${recentUnlock.rarity}`}>
                        {recentUnlock.rarity}
                    </div>
                </div>
            )}

            {/* Achievement progress panel */}
            <div className="achievement-panel">
                <div className="achievement-header">
                    <h3>🏆 Achievements</h3>
                    <div className="achievement-stats">
                        <span className="points-display">{totalPoints} pts</span>
                        <span className="unlock-count">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
                    </div>
                </div>

                <div className="achievement-grid">
                    {ACHIEVEMENTS.map(achievement => {
                        const isUnlocked = unlockedAchievements.includes(achievement.id);
                        return (
                            <div
                                key={achievement.id}
                                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'} ${achievement.rarity}`}
                                title={achievement.description}
                            >
                                <div className="achievement-icon">{achievement.icon}</div>
                                <div className="achievement-title">{achievement.title}</div>
                                {isUnlocked && (
                                    <div className="achievement-badge">✓</div>
                                )}
                                {!isUnlocked && (
                                    <div className="achievement-lock">🔒</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default AchievementSystem;
export { ACHIEVEMENTS };
