import React, { useState, useEffect } from 'react';
import './LaunchCountdown.css';

/**
 * Launch Countdown Timer with Early Bird Pricing
 * 
 * Creates urgency and FOMO for early adopters
 * Discounted tool unlocks before official launch
 */

export const LaunchCountdown = () => {
    const [timeLeft, setTimeLeft] = useState({});
    const [isLaunched, setIsLaunched] = useState(false);

    // Set launch date (example: December 1, 2025)
    const launchDate = new Date('2025-12-01T00:00:00').getTime();

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = launchDate - now;

            if (distance < 0) {
                setIsLaunched(true);
                clearInterval(timer);
            } else {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (isLaunched) {
        return (
            <div className="launch-complete-banner">
                <h2>🎉 ForTheWeebs is LIVE!</h2>
                <p>Early bird pricing has ended. Standard pricing now in effect.</p>
            </div>
        );
    }

    return (
        <div className="launch-countdown-container">
            <div className="countdown-badge">
                ⚡ LIMITED TIME EARLY BIRD PRICING
            </div>

            <h1 className="countdown-title">
                Official Launch Countdown
            </h1>

            <div className="countdown-timer">
                <div className="time-block">
                    <span className="time-value">{timeLeft.days || '0'}</span>
                    <span className="time-label">Days</span>
                </div>
                <div className="time-separator">:</div>
                <div className="time-block">
                    <span className="time-value">{timeLeft.hours || '0'}</span>
                    <span className="time-label">Hours</span>
                </div>
                <div className="time-separator">:</div>
                <div className="time-block">
                    <span className="time-value">{timeLeft.minutes || '0'}</span>
                    <span className="time-label">Minutes</span>
                </div>
                <div className="time-separator">:</div>
                <div className="time-block">
                    <span className="time-value">{timeLeft.seconds || '0'}</span>
                    <span className="time-label">Seconds</span>
                </div>
            </div>

            <div className="early-bird-details">
                <h2>🚀 Lock In Early Bird Prices Before Launch!</h2>
                <p className="early-bird-description">
                    Get <strong>30% OFF</strong> all tool unlocks during pre-launch period.
                    Prices increase to standard rates after launch.
                </p>

                <div className="pricing-comparison">
                    <div className="price-column early-bird">
                        <div className="column-header">
                            <h3>Early Bird</h3>
                            <span className="badge">Available Now</span>
                        </div>
                        <div className="prices">
                            <div className="price-item">
                                <span className="tool-name">📸 Photo Tools</span>
                                <span className="price"><s>$25</s> <strong>$18</strong></span>
                            </div>
                            <div className="price-item">
                                <span className="tool-name">🎨 Design Studio</span>
                                <span className="price"><s>$50</s> <strong>$35</strong></span>
                            </div>
                            <div className="price-item">
                                <span className="tool-name">📚 Comic Creator</span>
                                <span className="price"><s>$75</s> <strong>$53</strong></span>
                            </div>
                            <div className="price-item">
                                <span className="tool-name">🎵 Audio Studio</span>
                                <span className="price"><s>$100</s> <strong>$70</strong></span>
                            </div>
                            <div className="price-item">
                                <span className="tool-name">🎬 CGI Studio</span>
                                <span className="price"><s>$200</s> <strong>$140</strong></span>
                            </div>
                            <div className="price-item">
                                <span className="tool-name">🤖 AI Studio</span>
                                <span className="price"><s>$200</s> <strong>$140</strong></span>
                            </div>
                            <div className="price-item">
                                <span className="tool-name">🎭 AR/VR Studio</span>
                                <span className="price"><s>$500</s> <strong>$350</strong></span>
                            </div>
                            <div className="price-item highlight">
                                <span className="tool-name">🌟 Full Platform</span>
                                <span className="price"><s>$500</s> <strong>$350</strong></span>
                            </div>
                            <div className="price-item special">
                                <span className="tool-name">👑 Super Admin</span>
                                <span className="price"><s>$1000</s> <strong>$700</strong></span>
                            </div>
                        </div>
                    </div>

                    <div className="price-column post-launch">
                        <div className="column-header">
                            <h3>After Launch</h3>
                            <span className="badge warning">Standard Pricing</span>
                        </div>
                        <div className="prices">
                            <div className="price-item">
                                <span className="tool-name">📸 Photo Tools</span>
                                <span className="price">$25</span>
                            </div>
                            <div className="price-item">
                                <span className="tool-name">🎨 Design Studio</span>
                                <span className="price">$50</span>
                            </div>
                            <div className="price-item">
                                <span className="tool-name">📚 Comic Creator</span>
                                <span className="price">$75</span>
                            </div>
                            <div className="price-item">
                                <span className="tool-name">🎵 Audio Studio</span>
                                <span className="price">$100</span>
                            </div>
                            <div className="price-item">
                                <span className="tool-name">🎬 CGI Studio</span>
                                <span className="price">$200</span>
                            </div>
                            <div className="price-item">
                                <span className="tool-name">🤖 AI Studio</span>
                                <span className="price">$200</span>
                            </div>
                            <div className="price-item">
                                <span className="tool-name">🎭 AR/VR Studio</span>
                                <span className="price">$500</span>
                            </div>
                            <div className="price-item highlight">
                                <span className="tool-name">🌟 Full Platform</span>
                                <span className="price">$500</span>
                            </div>
                            <div className="price-item special">
                                <span className="tool-name">👑 Super Admin</span>
                                <span className="price">$1000</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="savings-highlight">
                    <h3>💰 Your Potential Savings</h3>
                    <div className="savings-grid">
                        <div className="savings-card">
                            <span className="savings-icon">📸</span>
                            <p>Single Tool</p>
                            <strong>Save $7-150</strong>
                        </div>
                        <div className="savings-card">
                            <span className="savings-icon">🌟</span>
                            <p>Full Platform</p>
                            <strong>Save $150</strong>
                        </div>
                        <div className="savings-card">
                            <span className="savings-icon">👑</span>
                            <p>Super Admin</p>
                            <strong>Save $300</strong>
                        </div>
                    </div>
                </div>

                <div className="cta-section">
                    <button className="early-bird-cta" onClick={() => window.location.href = '/?premium=true'}>
                        🔥 Unlock Now & Save 30%
                    </button>
                    <p className="cta-subtitle">
                        ⏰ Early bird pricing ends when timer hits zero. Don't miss out!
                    </p>
                </div>
            </div>

            {/* Urgency Messages */}
            {timeLeft.days < 7 && (
                <div className="urgency-banner">
                    ⚠️ <strong>FINAL WEEK!</strong> Early bird pricing ends in {timeLeft.days} days. Lock in savings now!
                </div>
            )}

            {timeLeft.days < 1 && timeLeft.hours < 24 && (
                <div className="urgency-banner critical">
                    🚨 <strong>LAST DAY!</strong> Early bird pricing ends in {timeLeft.hours} hours {timeLeft.minutes} minutes!
                </div>
            )}
        </div>
    );
};

export default LaunchCountdown;
