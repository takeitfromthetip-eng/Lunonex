import React, { useState } from 'react';
import './ReferralRewards.css';

const ReferralRewards = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [copiedCode, setCopiedCode] = useState(false);

    // User referral data
    const userData = {
        referralCode: 'FTW-SARAH-2024',
        personalLink: 'https://fortheweebs.netlify.app/signup?ref=FTW-SARAH-2024',
        referralsCount: 7,
        successfulReferrals: 4,
        rewardsEarned: 4, // months of free Pro
        rewardsPending: 2, // friends who signed up but haven't upgraded yet
        nextReward: 3, // need 3 more for next free month
        totalEarnings: 196, // 4 months × $49/mo value
        rank: 'Gold Recruiter', // Bronze → Silver → Gold → Platinum
        shareLinks: {
            twitter: `https://twitter.com/intent/tweet?text=Check out @ForTheWeebs - the best creative platform! Join with my link and we both get rewards: https://fortheweebs.netlify.app/signup?ref=FTW-SARAH-2024`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=https://fortheweebs.netlify.app/signup?ref=FTW-SARAH-2024`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=https://fortheweebs.netlify.app/signup?ref=FTW-SARAH-2024`,
            reddit: `https://www.reddit.com/submit?url=https://fortheweebs.netlify.app/signup?ref=FTW-SARAH-2024&title=ForTheWeebs - Best Creative Platform`,
            email: `mailto:?subject=Check out ForTheWeebs&body=I've been using ForTheWeebs and it's amazing! Join with my link: https://fortheweebs.netlify.app/signup?ref=FTW-SARAH-2024`
        }
    };

    // Referred friends
    const referredFriends = [
        {
            id: 1,
            name: 'Alex Chen',
            status: 'active',
            joined: '2 weeks ago',
            tier: 'Pro',
            earned: 1, // months credited
            avatar: '👨‍🎨'
        },
        {
            id: 2,
            name: 'Jamie Lee',
            status: 'active',
            joined: '1 month ago',
            tier: 'Pro',
            earned: 1,
            avatar: '👩‍💻'
        },
        {
            id: 3,
            name: 'Mike Rodriguez',
            status: 'pending',
            joined: '3 days ago',
            tier: 'Free',
            earned: 0,
            avatar: '🎬'
        },
        {
            id: 4,
            name: 'Sarah Kim',
            status: 'active',
            joined: '2 months ago',
            tier: 'Enterprise',
            earned: 1,
            avatar: '🎨'
        }
    ];

    // Reward tiers
    const rewardTiers = [
        {
            referrals: 3,
            reward: '1 Month Free Pro',
            value: 49,
            icon: '🥉',
            rank: 'Bronze',
            unlocked: true
        },
        {
            referrals: 10,
            reward: '3 Months Free Pro',
            value: 147,
            icon: '🥈',
            rank: 'Silver',
            unlocked: false
        },
        {
            referrals: 25,
            reward: '6 Months Free Pro + Exclusive Badge',
            value: 294,
            icon: '🥇',
            rank: 'Gold',
            unlocked: false
        },
        {
            referrals: 50,
            reward: '1 Year Free Pro + VIP Status',
            value: 588,
            icon: '💎',
            rank: 'Platinum',
            unlocked: false
        },
        {
            referrals: 100,
            reward: 'Lifetime Pro + Revenue Share',
            value: 'Priceless',
            icon: '👑',
            rank: 'Legend',
            unlocked: false
        }
    ];

    // Top recruiters leaderboard
    const topRecruiters = [
        { rank: 1, name: '@techguru', referrals: 234, rewards: '2 Years Free', avatar: '🧙‍♂️' },
        { rank: 2, name: '@designqueen', referrals: 189, rewards: '18 Months Free', avatar: '👸' },
        { rank: 3, name: '@videomaster', referrals: 156, rewards: '15 Months Free', avatar: '🎬' },
        { rank: 4, name: '@sarahcreates', referrals: 7, rewards: '4 Months Free', avatar: '👩‍🎨' } // user's rank
    ];

    const copyReferralLink = () => {
        navigator.clipboard.writeText(userData.personalLink);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const shareToSocial = (platform) => {
        window.open(userData.shareLinks[platform], '_blank', 'width=600,height=400');
    };

    return (
        <div className="referral-rewards">
            <div className="referral-header">
                <h1>💎 Referral Rewards</h1>
                <p className="subtitle">Invite 3 friends = 1 month free Pro. It's that simple.</p>
            </div>

            {/* Stats Dashboard */}
            <div className="referral-stats">
                <div className="stat-card-ref primary">
                    <div className="stat-icon">🎁</div>
                    <div className="stat-content">
                        <div className="stat-label">Rewards Earned</div>
                        <div className="stat-value">{userData.rewardsEarned} Months Free</div>
                        <div className="stat-detail">${userData.totalEarnings} value</div>
                    </div>
                </div>
                <div className="stat-card-ref">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <div className="stat-label">Successful Referrals</div>
                        <div className="stat-value">{userData.successfulReferrals}</div>
                        <div className="stat-detail">{userData.referralsCount} total signups</div>
                    </div>
                </div>
                <div className="stat-card-ref">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <div className="stat-label">Next Reward In</div>
                        <div className="stat-value">{userData.nextReward} Referrals</div>
                        <div className="stat-detail">1 month free Pro</div>
                    </div>
                </div>
                <div className="stat-card-ref">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-content">
                        <div className="stat-label">Current Rank</div>
                        <div className="stat-value">{userData.rank}</div>
                        <div className="stat-detail">Top 5% of recruiters</div>
                    </div>
                </div>
            </div>

            {/* Progress Bar to Next Reward */}
            <div className="reward-progress">
                <div className="progress-header">
                    <span className="progress-label">Progress to Next Reward</span>
                    <span className="progress-count">{userData.successfulReferrals}/6 Referrals</span>
                </div>
                <div className="progress-bar-ref">
                    <div
                        className="progress-fill-ref"
                        style={{ width: `${(userData.successfulReferrals / 6) * 100}%` }}
                    />
                </div>
                <div className="progress-message">
                    Just {6 - userData.successfulReferrals} more friends to unlock 2 months free Pro! 🎉
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    📊 Dashboard
                </button>
                <button
                    className={`tab ${activeTab === 'share' ? 'active' : ''}`}
                    onClick={() => setActiveTab('share')}
                >
                    📤 Share & Invite
                </button>
                <button
                    className={`tab ${activeTab === 'rewards' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rewards')}
                >
                    🎁 Reward Tiers
                </button>
                <button
                    className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('leaderboard')}
                >
                    🏆 Leaderboard
                </button>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <div className="tab-content active">
                    <div className="friends-section">
                        <h2>👥 Your Referred Friends</h2>
                        <div className="friends-list">
                            {referredFriends.map(friend => (
                                <div key={friend.id} className={`friend-card ${friend.status}`}>
                                    <div className="friend-avatar">{friend.avatar}</div>
                                    <div className="friend-info">
                                        <div className="friend-name">{friend.name}</div>
                                        <div className="friend-meta">
                                            <span className="friend-tier">{friend.tier}</span>
                                            <span className="friend-joined">{friend.joined}</span>
                                        </div>
                                    </div>
                                    <div className="friend-status">
                                        {friend.status === 'active' ? (
                                            <div className="status-badge active">
                                                ✅ Active - {friend.earned}mo earned
                                            </div>
                                        ) : (
                                            <div className="status-badge pending">
                                                ⏳ Pending upgrade
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="viral-loop-info">
                        <h3>🚀 How It Works</h3>
                        <div className="info-steps">
                            <div className="info-step">
                                <div className="step-num">1</div>
                                <div className="step-content">
                                    <h4>Share Your Link</h4>
                                    <p>Send your unique referral link to friends</p>
                                </div>
                            </div>
                            <div className="info-step">
                                <div className="step-num">2</div>
                                <div className="step-content">
                                    <h4>They Sign Up</h4>
                                    <p>Your friend creates an account using your link</p>
                                </div>
                            </div>
                            <div className="info-step">
                                <div className="step-num">3</div>
                                <div className="step-content">
                                    <h4>They Upgrade</h4>
                                    <p>When they purchase any paid tier, you get credit</p>
                                </div>
                            </div>
                            <div className="info-step">
                                <div className="step-num">4</div>
                                <div className="step-content">
                                    <h4>You Get Rewarded</h4>
                                    <p>Every 3 referrals = 1 month free Pro automatically</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Share & Invite Tab */}
            {activeTab === 'share' && (
                <div className="tab-content active">
                    <div className="share-section">
                        <h2>📤 Share Your Referral Link</h2>

                        <div className="link-box">
                            <div className="link-display">
                                <div className="link-label">Your Personal Link</div>
                                <div className="link-url">{userData.personalLink}</div>
                            </div>
                            <button
                                className={`copy-btn ${copiedCode ? 'copied' : ''}`}
                                onClick={copyReferralLink}
                            >
                                {copiedCode ? '✅ Copied!' : '📋 Copy Link'}
                            </button>
                        </div>

                        <div className="code-box">
                            <div className="code-label">Your Referral Code</div>
                            <div className="code-display">{userData.referralCode}</div>
                        </div>

                        <div className="social-share">
                            <h3>🌐 Share on Social Media</h3>
                            <div className="social-buttons">
                                <button className="social-btn twitter" onClick={() => shareToSocial('twitter')}>
                                    <span className="social-icon">🐦</span>
                                    Share on Twitter
                                </button>
                                <button className="social-btn facebook" onClick={() => shareToSocial('facebook')}>
                                    <span className="social-icon">📘</span>
                                    Share on Facebook
                                </button>
                                <button className="social-btn linkedin" onClick={() => shareToSocial('linkedin')}>
                                    <span className="social-icon">💼</span>
                                    Share on LinkedIn
                                </button>
                                <button className="social-btn reddit" onClick={() => shareToSocial('reddit')}>
                                    <span className="social-icon">🔴</span>
                                    Share on Reddit
                                </button>
                                <button className="social-btn email" onClick={() => shareToSocial('email')}>
                                    <span className="social-icon">📧</span>
                                    Share via Email
                                </button>
                            </div>
                        </div>

                        <div className="share-tips">
                            <h3>💡 Pro Tips for Maximum Referrals</h3>
                            <ul className="tips-list">
                                <li>Share your best projects with your referral link in the description</li>
                                <li>Post tutorials showing how you create on ForTheWeebs</li>
                                <li>Join creator communities and share when relevant (no spam!)</li>
                                <li>Add your link to your social media bios</li>
                                <li>Tell friends about specific features they'd love</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Reward Tiers Tab */}
            {activeTab === 'rewards' && (
                <div className="tab-content active">
                    <div className="tiers-section">
                        <h2>🎁 Unlock Epic Rewards</h2>
                        <p className="tiers-intro">The more friends you invite, the better the rewards get!</p>

                        <div className="tiers-grid">
                            {rewardTiers.map((tier, index) => (
                                <div key={index} className={`tier-card-ref ${tier.unlocked ? 'unlocked' : 'locked'}`}>
                                    <div className="tier-icon">{tier.icon}</div>
                                    <div className="tier-rank">{tier.rank}</div>
                                    <div className="tier-requirement">{tier.referrals} Referrals</div>
                                    <div className="tier-reward">{tier.reward}</div>
                                    <div className="tier-value">
                                        {typeof tier.value === 'number' ? `$${tier.value} value` : tier.value}
                                    </div>
                                    {tier.unlocked && (
                                        <div className="unlocked-badge">✅ Unlocked!</div>
                                    )}
                                    {!tier.unlocked && userData.successfulReferrals > 0 && (
                                        <div className="progress-to-tier">
                                            {tier.referrals - userData.successfulReferrals} more to unlock
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="lifetime-offer">
                            <h3>👑 The Ultimate Goal: Lifetime Pro</h3>
                            <p>
                                Refer 100 friends and get <strong>Lifetime Pro access</strong> + <strong>revenue share</strong> from
                                your referrals' payments. That's right - you become a partner in their success!
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
                <div className="tab-content active">
                    <div className="leaderboard-section">
                        <h2>🏆 Top Recruiters</h2>
                        <p className="leaderboard-intro">See how you stack up against the best referrers!</p>

                        <div className="leaderboard-list">
                            {topRecruiters.map(recruiter => (
                                <div
                                    key={recruiter.rank}
                                    className={`leaderboard-item ${recruiter.name === '@sarahcreates' ? 'current-user' : ''} ${recruiter.rank <= 3 ? `rank-${recruiter.rank}` : ''}`}
                                >
                                    <div className="recruiter-rank">
                                        {recruiter.rank === 1 ? '🥇' : recruiter.rank === 2 ? '🥈' : recruiter.rank === 3 ? '🥉' : `#${recruiter.rank}`}
                                    </div>
                                    <div className="recruiter-avatar">{recruiter.avatar}</div>
                                    <div className="recruiter-info">
                                        <div className="recruiter-name">{recruiter.name}</div>
                                        <div className="recruiter-stats">
                                            {recruiter.referrals} referrals • {recruiter.rewards}
                                        </div>
                                    </div>
                                    {recruiter.name === '@sarahcreates' && (
                                        <div className="you-badge">← You!</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="viral-stats-ref">
                            <h3>📊 Referral Program Stats</h3>
                            <div className="viral-grid">
                                <div className="viral-card">
                                    <div className="viral-number">12,847</div>
                                    <div className="viral-label">Total Referrals</div>
                                </div>
                                <div className="viral-card">
                                    <div className="viral-number">$628K</div>
                                    <div className="viral-label">Value Rewarded</div>
                                </div>
                                <div className="viral-card">
                                    <div className="viral-number">34%</div>
                                    <div className="viral-label">Conversion Rate</div>
                                </div>
                                <div className="viral-card">
                                    <div className="viral-number">2.8x</div>
                                    <div className="viral-label">Viral Coefficient</div>
                                </div>
                            </div>
                            <p className="viral-note">
                                <strong>Exponential growth!</strong> Every user who signs up invites 2.8 friends on average.
                                That's why referrals are our #1 growth channel - costing $0 in ads!
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferralRewards;
