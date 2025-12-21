/* eslint-disable */
import React, { useState } from 'react';
import './FanRewardsSystem.css';

const FanRewardsSystem = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userPoints, setUserPoints] = useState(3450);
  const [userTier, setUserTier] = useState('Gold');
  const [achievements, setAchievements] = useState([
    { id: 1, name: 'First Purchase', description: 'Made your first purchase', icon: '🛒', unlocked: true, points: 100 },
    { id: 2, name: 'Loyal Fan', description: 'Subscribed for 6 months', icon: '⭐', unlocked: true, points: 500 },
    { id: 3, name: 'Super Supporter', description: 'Donated over $100', icon: '💎', unlocked: true, points: 1000 },
    { id: 4, name: 'Content Creator', description: 'Uploaded 10 posts', icon: '🎨', unlocked: false, points: 300, progress: 6 },
    { id: 5, name: 'Community Leader', description: 'Invited 20 friends', icon: '👥', unlocked: false, points: 750, progress: 12 },
    { id: 6, name: 'Mega Fan', description: 'Reach Diamond tier', icon: '💠', unlocked: false, points: 2000 }
  ]);

  const [tiers] = useState([
    {
      name: 'Bronze',
      minPoints: 0,
      color: '#CD7F32',
      perks: ['5% store discount', 'Early access to content', 'Bronze badge']
    },
    {
      name: 'Silver',
      minPoints: 1000,
      color: '#C0C0C0',
      perks: ['10% store discount', 'Exclusive content', 'Silver badge', 'Priority support']
    },
    {
      name: 'Gold',
      minPoints: 3000,
      color: '#FFD700',
      perks: ['15% store discount', 'All exclusive content', 'Gold badge', 'Priority support', 'Monthly gift']
    },
    {
      name: 'Platinum',
      minPoints: 7000,
      color: '#E5E4E2',
      perks: ['20% store discount', 'All perks', 'Platinum badge', '24/7 priority support', 'Monthly gift', 'Custom requests']
    },
    {
      name: 'Diamond',
      minPoints: 15000,
      color: '#B9F2FF',
      perks: ['25% store discount', 'Ultimate perks', 'Diamond badge', 'VIP support', 'Monthly gift', 'Direct creator contact', 'Featured member']
    }
  ]);

  const [rewardsShop] = useState([
    {
      id: 1,
      name: 'Exclusive Desktop Wallpaper',
      cost: 500,
      category: 'digital',
      icon: '🖼️',
      description: 'High-res CGI artwork wallpaper'
    },
    {
      id: 2,
      name: 'Custom Name Color in Chat',
      cost: 750,
      category: 'feature',
      icon: '🎨',
      description: 'Stand out with a custom chat name color'
    },
    {
      id: 3,
      name: '1 Month Premium Subscription',
      cost: 1000,
      category: 'subscription',
      icon: '⭐',
      description: 'Free premium access for 1 month'
    },
    {
      id: 4,
      name: 'Signed Digital Art Print',
      cost: 1500,
      category: 'digital',
      icon: '🖌️',
      description: 'Digitally signed artwork from creator'
    },
    {
      id: 5,
      name: 'Video Call with Creator',
      cost: 5000,
      category: 'experience',
      icon: '📹',
      description: '30-minute video call session'
    },
    {
      id: 6,
      name: 'Custom Character Commission',
      cost: 10000,
      category: 'experience',
      icon: '🎭',
      description: 'Custom CGI character designed for you'
    }
  ]);

  const [pointsHistory] = useState([
    { id: 1, action: 'Purchase: T-Shirt', points: 150, date: '2024-11-24', type: 'earned' },
    { id: 2, action: 'Redeemed: Wallpaper', points: -500, date: '2024-11-23', type: 'spent' },
    { id: 3, action: 'Achievement: Super Supporter', points: 1000, date: '2024-11-22', type: 'earned' },
    { id: 4, action: 'Monthly Bonus', points: 200, date: '2024-11-20', type: 'earned' },
    { id: 5, action: 'Referral Bonus', points: 300, date: '2024-11-19', type: 'earned' }
  ]);

  const getCurrentTierIndex = () => {
    return tiers.findIndex(tier => tier.name === userTier);
  };

  const getNextTier = () => {
    const currentIndex = getCurrentTierIndex();
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  };

  const getProgressToNextTier = () => {
    const nextTier = getNextTier();
    if (!nextTier) return 100;
    const currentTierPoints = tiers[getCurrentTierIndex()].minPoints;
    const pointsNeeded = nextTier.minPoints - currentTierPoints;
    const pointsEarned = userPoints - currentTierPoints;
    return Math.min((pointsEarned / pointsNeeded) * 100, 100);
  };

  const redeemReward = (reward) => {
    if (userPoints >= reward.cost) {
      setUserPoints(userPoints - reward.cost);
      alert(`Redeemed: ${reward.name} for ${reward.cost} points!`);
    } else {
      alert(`Not enough points! You need ${reward.cost - userPoints} more points.`);
    }
  };

  return (
    <div className="fan-rewards-system">
      <div className="rewards-header">
        <h1>🎁 Fan Rewards Program</h1>
        <div className="user-stats">
          <div className="points-display">
            <span className="points-icon">⭐</span>
            <div>
              <div className="points-label">Your Points</div>
              <div className="points-value">{userPoints.toLocaleString()}</div>
            </div>
          </div>
          <div className="tier-display" style={{ background: `linear-gradient(135deg, ${tiers[getCurrentTierIndex()].color} 0%, ${tiers[getCurrentTierIndex()].color}99 100%)` }}>
            <div className="tier-badge">{userTier}</div>
            <div className="tier-label">Current Tier</div>
          </div>
        </div>
      </div>

      <div className="rewards-tabs">
        <button className={`rewards-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          📊 Overview
        </button>
        <button className={`rewards-tab ${activeTab === 'achievements' ? 'active' : ''}`} onClick={() => setActiveTab('achievements')}>
          🏆 Achievements
        </button>
        <button className={`rewards-tab ${activeTab === 'shop' ? 'active' : ''}`} onClick={() => setActiveTab('shop')}>
          🛒 Rewards Shop
        </button>
        <button className={`rewards-tab ${activeTab === 'tiers' ? 'active' : ''}`} onClick={() => setActiveTab('tiers')}>
          💎 Tiers
        </button>
        <button className={`rewards-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          📜 History
        </button>
      </div>

      <div className="rewards-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="tier-progress-card">
              <h2>Tier Progress</h2>
              {getNextTier() ? (
                <>
                  <div className="progress-info">
                    <span>{userTier}</span>
                    <span>{getNextTier().name}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${getProgressToNextTier()}%` }}></div>
                  </div>
                  <p className="progress-text">
                    {getNextTier().minPoints - userPoints} points until {getNextTier().name}
                  </p>
                </>
              ) : (
                <p className="max-tier">🎉 You've reached the maximum tier!</p>
              )}
            </div>

            <div className="quick-stats">
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-info">
                  <div className="stat-value">{achievements.filter(a => a.unlocked).length}/{achievements.length}</div>
                  <div className="stat-label">Achievements</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-info">
                  <div className="stat-value">{userPoints.toLocaleString()}</div>
                  <div className="stat-label">Total Points</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💎</div>
                <div className="stat-info">
                  <div className="stat-value">{userTier}</div>
                  <div className="stat-label">Current Tier</div>
                </div>
              </div>
            </div>

            <div className="ways-to-earn">
              <h2>Ways to Earn Points</h2>
              <div className="earn-methods">
                <div className="earn-method">
                  <span className="earn-icon">🛒</span>
                  <div>
                    <h4>Make Purchases</h4>
                    <p>Earn 5 points per $1 spent</p>
                  </div>
                </div>
                <div className="earn-method">
                  <span className="earn-icon">📝</span>
                  <div>
                    <h4>Create Content</h4>
                    <p>50 points per approved post</p>
                  </div>
                </div>
                <div className="earn-method">
                  <span className="earn-icon">👥</span>
                  <div>
                    <h4>Refer Friends</h4>
                    <p>250 points per referral</p>
                  </div>
                </div>
                <div className="earn-method">
                  <span className="earn-icon">💬</span>
                  <div>
                    <h4>Engage Daily</h4>
                    <p>10 points per day active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-section">
            <h2>Achievements</h2>
            <div className="achievements-grid">
              {achievements.map(achievement => (
                <div key={achievement.id} className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
                  <div className="achievement-icon">{achievement.icon}</div>
                  <h3>{achievement.name}</h3>
                  <p>{achievement.description}</p>
                  <div className="achievement-points">+{achievement.points} points</div>
                  {achievement.unlocked ? (
                    <div className="achievement-status unlocked">✓ Unlocked</div>
                  ) : (
                    <>
                      {achievement.progress && (
                        <div className="achievement-progress">
                          <div className="progress-bar-small">
                            <div className="progress-fill-small" style={{ width: `${(achievement.progress / 20) * 100}%` }}></div>
                          </div>
                          <span>{achievement.progress}/20</span>
                        </div>
                      )}
                      <div className="achievement-status locked">🔒 Locked</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shop' && (
          <div className="shop-section">
            <h2>Rewards Shop</h2>
            <div className="rewards-grid">
              {rewardsShop.map(reward => (
                <div key={reward.id} className="reward-card">
                  <div className="reward-icon-large">{reward.icon}</div>
                  <h3>{reward.name}</h3>
                  <p>{reward.description}</p>
                  <div className="reward-cost">
                    <span className="cost-icon">⭐</span>
                    <span className="cost-value">{reward.cost.toLocaleString()} points</span>
                  </div>
                  <button 
                    className="redeem-btn" 
                    onClick={() => redeemReward(reward)}
                    disabled={userPoints < reward.cost}
                  >
                    {userPoints >= reward.cost ? 'Redeem' : 'Not Enough Points'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tiers' && (
          <div className="tiers-section">
            <h2>Membership Tiers</h2>
            <div className="tiers-list">
              {tiers.map((tier, index) => (
                <div 
                  key={tier.name} 
                  className={`tier-card ${tier.name === userTier ? 'current' : ''}`}
                  style={{ borderColor: tier.color }}
                >
                  <div className="tier-header" style={{ background: tier.color }}>
                    <h3>{tier.name}</h3>
                    <p>{tier.minPoints.toLocaleString()}+ points</p>
                  </div>
                  <div className="tier-perks">
                    <h4>Perks:</h4>
                    <ul>
                      {tier.perks.map((perk, i) => (
                        <li key={i}>✓ {perk}</li>
                      ))}
                    </ul>
                  </div>
                  {tier.name === userTier && (
                    <div className="current-tier-badge">Your Current Tier</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-section">
            <h2>Points History</h2>
            <div className="history-list">
              {pointsHistory.map(item => (
                <div key={item.id} className="history-item">
                  <div className="history-icon">{item.type === 'earned' ? '💰' : '🎁'}</div>
                  <div className="history-details">
                    <div className="history-action">{item.action}</div>
                    <div className="history-date">{item.date}</div>
                  </div>
                  <div className={`history-points ${item.type}`}>
                    {item.points > 0 ? '+' : ''}{item.points}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FanRewardsSystem;
