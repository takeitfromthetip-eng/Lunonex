import React, { useState } from 'react';
import './TipJar.css';

const TipJar = () => {
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [customAmount, setCustomAmount] = useState('');
    const [message, setMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('tip'); // 'tip' or 'history'

    const presetAmounts = [1, 5, 10, 25, 50, 100];

    const tipHistory = [
        { id: 1, from: '@videofan23', amount: 10, message: 'Amazing work! 🔥', creator: '@sarahcreates', date: '2 hours ago', platformFee: 1.50 },
        { id: 2, from: '@designlover', amount: 25, message: 'This saved me so much time!', creator: '@alexvfx', date: '5 hours ago', platformFee: 3.75 },
        { id: 3, from: '@musichead', amount: 5, message: 'Love this beat template!', creator: '@mikethompsonmusic', date: '1 day ago', platformFee: 0.75 },
        { id: 4, from: '@gamer_pro', amount: 50, message: 'Best VR scene ever! 💯', creator: '@sarahcreates', date: '2 days ago', platformFee: 7.50 },
        { id: 5, from: '@streamer_jane', amount: 10, message: 'Stream overlays are perfect!', creator: '@alexvfx', date: '3 days ago', platformFee: 1.50 },
    ];

    const earnings = {
        today: 47,
        thisWeek: 312,
        thisMonth: 1845,
        allTime: 8934,
        platformFees: 1340, // 15% of allTime
    };

    const calculatePlatformFee = (amount) => {
        return (amount * 0.15).toFixed(2);
    };

    const calculateCreatorReceives = (amount) => {
        return (amount * 0.85).toFixed(2);
    };

    const handleSendTip = () => {
        const tipAmount = selectedAmount || parseFloat(customAmount);
        if (tipAmount && tipAmount >= 1) {
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setSelectedAmount(null);
                setCustomAmount('');
                setMessage('');
            }, 3000);
        }
    };

    return (
        <div className="tip-jar-system">
            <div className="tip-jar-header">
                <div className="header-content">
                    <h1>💰 Tip Jar</h1>
                    <p className="header-subtitle">
                        Support creators directly · You take home 85% · We take 15% platform fee
                    </p>
                </div>

                <div className="earnings-dashboard">
                    <div className="earnings-card">
                        <div className="earnings-label">Your Earnings</div>
                        <div className="earnings-amount">${earnings.thisMonth.toLocaleString()}</div>
                        <div className="earnings-period">This month</div>
                    </div>
                    <div className="earnings-breakdown">
                        <div className="breakdown-item">
                            <span className="breakdown-label">Today</span>
                            <span className="breakdown-value">${earnings.today}</span>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">This Week</span>
                            <span className="breakdown-value">${earnings.thisWeek}</span>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">All Time</span>
                            <span className="breakdown-value">${earnings.allTime.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="tip-jar-tabs">
                <button
                    className={`tab ${activeTab === 'tip' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tip')}
                >
                    💸 Send Tip
                </button>
                <button
                    className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    📊 Tip History
                </button>
            </div>

            {activeTab === 'tip' && (
                <div className="send-tip-section">
                    <div className="tip-form-container">
                        <div className="creator-preview">
                            <div className="creator-avatar-large">👩‍🎨</div>
                            <div className="creator-info">
                                <h2>@sarahcreates</h2>
                                <p className="creator-specialty">Motion Designer & VFX Artist</p>
                                <div className="creator-stats-mini">
                                    <span>12.4K followers</span>
                                    <span>•</span>
                                    <span>342 projects</span>
                                    <span>•</span>
                                    <span>$8,234 earned</span>
                                </div>
                            </div>
                        </div>

                        <div className="tip-form">
                            <div className="form-section">
                                <label className="form-label">Select Amount</label>
                                <div className="preset-amounts">
                                    {presetAmounts.map((amount) => (
                                        <button
                                            key={amount}
                                            className={`preset-btn ${selectedAmount === amount ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedAmount(amount);
                                                setCustomAmount('');
                                            }}
                                        >
                                            ${amount}
                                        </button>
                                    ))}
                                </div>
                                <div className="custom-amount-input">
                                    <span className="currency-symbol">$</span>
                                    <input
                                        type="number"
                                        placeholder="Custom amount"
                                        value={customAmount}
                                        onChange={(e) => {
                                            setCustomAmount(e.target.value);
                                            setSelectedAmount(null);
                                        }}
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <label className="form-label">Add a Message (Optional)</label>
                                <textarea
                                    className="tip-message-input"
                                    placeholder="Say something nice to the creator..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    maxLength={200}
                                />
                                <div className="char-count">{message.length}/200</div>
                            </div>

                            {(selectedAmount || customAmount) && (
                                <div className="tip-breakdown">
                                    <div className="breakdown-row">
                                        <span>Tip Amount</span>
                                        <span className="amount-highlight">
                                            ${selectedAmount || parseFloat(customAmount || 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="breakdown-row platform-fee-row">
                                        <span>
                                            Platform Fee (15%)
                                            <span className="fee-tooltip">
                                                ℹ️
                                                <span className="tooltip-content">
                                                    Covers payment processing, hosting, and platform maintenance
                                                </span>
                                            </span>
                                        </span>
                                        <span>
                                            -${calculatePlatformFee(selectedAmount || parseFloat(customAmount || 0))}
                                        </span>
                                    </div>
                                    <div className="breakdown-row creator-receives-row">
                                        <span>Creator Receives</span>
                                        <span className="creator-amount">
                                            ${calculateCreatorReceives(selectedAmount || parseFloat(customAmount || 0))}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <button
                                className="btn-send-tip"
                                onClick={handleSendTip}
                                disabled={!selectedAmount && !customAmount}
                            >
                                💰 Send Tip
                            </button>

                            {showSuccess && (
                                <div className="success-message">
                                    ✅ Tip sent successfully! The creator has been notified.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="tip-jar-info">
                        <div className="info-card">
                            <div className="info-icon">💡</div>
                            <h3>How It Works</h3>
                            <ul>
                                <li>Choose an amount and send a tip to any creator</li>
                                <li>Creator receives 85% instantly</li>
                                <li>ForTheWeebs takes 15% platform fee</li>
                                <li>Tips appear on creator's profile publicly</li>
                                <li>Optional message to show your support</li>
                            </ul>
                        </div>

                        <div className="info-card">
                            <div className="info-icon">🎯</div>
                            <h3>Why Tip Creators?</h3>
                            <ul>
                                <li>Support quality content you love</li>
                                <li>Encourage creators to make more</li>
                                <li>Get featured as a top supporter</li>
                                <li>Build relationships with creators</li>
                                <li>100% voluntary, no obligations</li>
                            </ul>
                        </div>

                        <div className="info-card revenue-model">
                            <div className="info-icon">📊</div>
                            <h3>Platform Economics</h3>
                            <div className="revenue-breakdown-visual">
                                <div className="revenue-bar">
                                    <div className="creator-share" style={{ width: '85%' }}>
                                        <span>Creator: 85%</span>
                                    </div>
                                    <div className="platform-share" style={{ width: '15%' }}>
                                        <span>Platform: 15%</span>
                                    </div>
                                </div>
                            </div>
                            <ul>
                                <li>Industry-best 85/15 split (vs Patreon's 92/8 but we have MORE features)</li>
                                <li>No monthly subscription fees</li>
                                <li>No hidden charges</li>
                                <li>Instant payouts</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="tip-history-section">
                    <div className="history-stats">
                        <div className="stat-card">
                            <div className="stat-icon">💰</div>
                            <div className="stat-content">
                                <div className="stat-value">${earnings.allTime.toLocaleString()}</div>
                                <div className="stat-label">Total Tips Received</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🏦</div>
                            <div className="stat-content">
                                <div className="stat-value">${(earnings.allTime - earnings.platformFees).toLocaleString()}</div>
                                <div className="stat-label">Your Take-Home (85%)</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">🔧</div>
                            <div className="stat-content">
                                <div className="stat-value">${earnings.platformFees.toLocaleString()}</div>
                                <div className="stat-label">Platform Fees (15%)</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">📈</div>
                            <div className="stat-content">
                                <div className="stat-value">47</div>
                                <div className="stat-label">Total Tips</div>
                            </div>
                        </div>
                    </div>

                    <div className="history-list">
                        <h3>Recent Tips</h3>
                        {tipHistory.map((tip) => (
                            <div key={tip.id} className="tip-history-item">
                                <div className="tip-history-avatar">💰</div>
                                <div className="tip-history-content">
                                    <div className="tip-history-header">
                                        <strong>{tip.from}</strong> tipped <strong>{tip.creator}</strong>
                                        <span className="tip-amount-badge">${tip.amount}</span>
                                    </div>
                                    {tip.message && (
                                        <div className="tip-history-message">"{tip.message}"</div>
                                    )}
                                    <div className="tip-history-breakdown">
                                        <span>Creator received: ${calculateCreatorReceives(tip.amount)}</span>
                                        <span className="separator">•</span>
                                        <span>Platform fee: ${tip.platformFee}</span>
                                        <span className="separator">•</span>
                                        <span className="tip-date">{tip.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="payout-info">
                        <div className="payout-card">
                            <h3>💳 Payout Settings</h3>
                            <p>Connect your payment method to receive tips instantly</p>
                            <div className="payout-methods">
                                <button className="payout-method-btn">
                                    <span className="method-icon">💳</span>
                                    <span>Credit/Debit Card</span>
                                </button>
                                <button className="payout-method-btn">
                                    <span className="method-icon">🏦</span>
                                    <span>Bank Account</span>
                                </button>
                                <button className="payout-method-btn">
                                    <span className="method-icon">📱</span>
                                    <span>PayPal</span>
                                </button>
                                <button className="payout-method-btn">
                                    <span className="method-icon">💸</span>
                                    <span>Cash App</span>
                                </button>
                            </div>
                            <div className="payout-notice">
                                Minimum payout: $10 · Instant transfer · No fees
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TipJar;
