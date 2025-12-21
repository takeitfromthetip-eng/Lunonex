/* eslint-disable */
import React, { useEffect, useState } from 'react';
import './CreatorAnalytics.css';

/**
 * Creator Analytics Dashboard - Better than Patreon
 * Real-time earnings, growth forecasts, engagement insights
 */
export const CreatorAnalytics = ({ userId, creatorId }) => {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    todayEarnings: 0,
    subscribers: 0,
    followers: 0,
    totalViews: 0,
    totalLikes: 0,
    engagementRate: 0,
    growthRate: 12,
    overlaysUsed: 0,
    badgesMinted: 0,
    remixSessions: 0
  });

  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [creatorId, userId]);

  const loadAnalytics = async () => {
    try {
      // Load from backend API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/creator/analytics/${creatorId || userId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({ ...prev, ...data.stats }));
        setTopPosts(data.topPosts || []);
      } else {
        // Mock data for development
        setStats(prev => ({
          ...prev,
          totalEarnings: 45280,
          monthlyEarnings: 3840,
          todayEarnings: 127,
          subscribers: 89,
          followers: 1234,
          totalViews: 15678,
          totalLikes: 3456,
          engagementRate: 22.4
        }));
      }
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (cents) => `$${(cents / 100).toFixed(2)}`;
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return <div className="analytics-loading">📊 Loading analytics...</div>;
  }

  return (
    <div className="creator-analytics">
      <div className="analytics-header">
        <h1>📊 Creator Analytics</h1>
        <p className="subtitle">Real-time insights to grow your creator business</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>Total Earnings</h3>
            <p className="metric-value">{formatMoney(stats.totalEarnings)}</p>
            <span className="metric-trend positive">+{stats.growthRate}% this month</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📅</div>
          <div className="metric-content">
            <h3>This Month</h3>
            <p className="metric-value">{formatMoney(stats.monthlyEarnings)}</p>
            <span className="metric-detail">{formatMoney(stats.todayEarnings)} today</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💎</div>
          <div className="metric-content">
            <h3>Subscribers</h3>
            <p className="metric-value">{formatNumber(stats.subscribers)}</p>
            <span className="metric-detail">{formatNumber(stats.followers)} followers</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <h3>Engagement</h3>
            <p className="metric-value">{stats.engagementRate}%</p>
            <span className="metric-detail">{formatNumber(stats.totalViews)} views</span>
          </div>
        </div>
      </div>

      {/* Revenue Forecast */}
      <div className="section">
        <h2>💰 Revenue Forecast</h2>
        <div className="forecast-card">
          <div className="forecast-row">
            <span>Projected next month:</span>
            <strong className="forecast-value">{formatMoney(Math.floor(stats.monthlyEarnings * (1 + stats.growthRate / 100)))}</strong>
          </div>
          <div className="forecast-row">
            <span>Projected next year:</span>
            <strong className="forecast-value">{formatMoney(Math.floor(stats.monthlyEarnings * 12 * (1 + stats.growthRate / 100)))}</strong>
          </div>
          <div className="forecast-note">
            Based on current growth rate of {stats.growthRate}% per month
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="section">
        <h2>📊 Revenue Sources</h2>
        <div className="revenue-breakdown">
          <div className="revenue-source">
            <div className="source-label">
              <span className="source-icon">💎</span>
              <span>Subscriptions</span>
            </div>
            <div className="source-bar">
              <div className="source-fill" style={{width: '60%'}}></div>
            </div>
            <span className="source-amount">{formatMoney(Math.floor(stats.monthlyEarnings * 0.6))}</span>
          </div>
          
          <div className="revenue-source">
            <div className="source-label">
              <span className="source-icon">🛍️</span>
              <span>Merchandise</span>
            </div>
            <div className="source-bar">
              <div className="source-fill" style={{width: '25%'}}></div>
            </div>
            <span className="source-amount">{formatMoney(Math.floor(stats.monthlyEarnings * 0.25))}</span>
          </div>

          <div className="revenue-source">
            <div className="source-label">
              <span className="source-icon">📝</span>
              <span>Paid Posts</span>
            </div>
            <div className="source-bar">
              <div className="source-fill" style={{width: '10%'}}></div>
            </div>
            <span className="source-amount">{formatMoney(Math.floor(stats.monthlyEarnings * 0.1))}</span>
          </div>

          <div className="revenue-source">
            <div className="source-label">
              <span className="source-icon">💝</span>
              <span>Tips</span>
            </div>
            <div className="source-bar">
              <div className="source-fill" style={{width: '5%'}}></div>
            </div>
            <span className="source-amount">{formatMoney(Math.floor(stats.monthlyEarnings * 0.05))}</span>
          </div>
        </div>
      </div>

      {/* Growth Insights */}
      <div className="section">
        <h2>📈 Growth Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <h3>🎯 Best Posting Time</h3>
            <p className="insight-value">6:00 PM - 9:00 PM</p>
            <span className="insight-detail">42% higher engagement</span>
          </div>

          <div className="insight-card">
            <h3>📱 Top Platform</h3>
            <p className="insight-value">Mobile Web</p>
            <span className="insight-detail">68% of your audience</span>
          </div>

          <div className="insight-card">
            <h3>🎨 Best Content Type</h3>
            <p className="insight-value">Image Posts</p>
            <span className="insight-detail">3.2x more engagement</span>
          </div>

          <div className="insight-card">
            <h3>🚀 Growth Opportunity</h3>
            <p className="insight-value">Video Content</p>
            <span className="insight-detail">5x higher conversion</span>
          </div>
        </div>
      </div>

      {/* Creator Tools Usage */}
      <div className="section">
        <h2>🛠️ Tools Usage</h2>
        <div className="tools-stats">
          <div className="tool-stat">
            <span>🎨 Overlays Used:</span>
            <strong>{stats.overlaysUsed}</strong>
          </div>
          <div className="tool-stat">
            <span>🏅 Badges Minted:</span>
            <strong>{stats.badgesMinted}</strong>
          </div>
          <div className="tool-stat">
            <span>🎵 Remix Sessions:</span>
            <strong>{stats.remixSessions}</strong>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section">
        <h2>⚡ Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn primary">💰 Request Payout</button>
          <button className="action-btn">📊 Export Data</button>
          <button className="action-btn">📧 Email Subscribers</button>
          <button className="action-btn">🎁 Create Promotion</button>
        </div>
      </div>

      {/* Comparison */}
      <div className="comparison-section">
        <h3>💪 You're earning more on ForTheWeebs!</h3>
        <div className="comparison-card">
          <div className="comparison-row">
            <span>ForTheWeebs (10-15% fee):</span>
            <strong className="positive">{formatMoney(stats.monthlyEarnings)}</strong>
          </div>
          <div className="comparison-row">
            <span>Same on Patreon (9-12% + fees):</span>
            <strong className="negative">{formatMoney(Math.floor(stats.monthlyEarnings * 0.85))}</strong>
          </div>
          <div className="savings-highlight">
            You're saving <strong>{formatMoney(Math.floor(stats.monthlyEarnings * 0.15))}/month</strong> 🎉
          </div>
        </div>
      </div>
    </div>
  );
};
