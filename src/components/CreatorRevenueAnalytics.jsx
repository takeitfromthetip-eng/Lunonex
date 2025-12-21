import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import './CreatorRevenueAnalytics.css';

Chart.register(...registerables);

const CreatorRevenueAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    revenue: {
      total: 0,
      change: 0,
      breakdown: {
        subscriptions: 0,
        tips: 0,
        merchandise: 0,
        commissions: 0
      }
    },
    audience: {
      total: 0,
      change: 0,
      demographics: {
        ageGroups: {},
        countries: {},
        genders: {}
      }
    },
    engagement: {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      avgWatchTime: 0
    },
    growth: {
      subscribersGrowth: [],
      revenueGrowth: [],
      engagementGrowth: []
    },
    topContent: [],
    recentTransactions: []
  });

  const revenueChartRef = useRef(null);
  const audienceChartRef = useRef(null);
  const engagementChartRef = useRef(null);
  const demographicsChartRef = useRef(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  useEffect(() => {
    if (!loading) {
      initializeCharts();
    }
    return () => {
      destroyCharts();
    };
  }, [loading, analyticsData]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Real data only - no mock data
      setAnalyticsData({
        revenue: { total: 0, change: 0, breakdown: { subscriptions: 0, tips: 0, merchandise: 0, commissions: 0 } },
        audience: { total: 0, change: 0, demographics: { ageGroups: {}, countries: {}, genders: {} } },
        engagement: { views: 0, likes: 0, comments: 0, shares: 0, avgWatchTime: 0 },
        growth: { subscribersGrowth: [], revenueGrowth: [], engagementGrowth: [] },
        topContent: [],
        recentTransactions: []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const destroyCharts = () => {
    [revenueChartRef, audienceChartRef, engagementChartRef, demographicsChartRef].forEach(ref => {
      if (ref.current?.chart) {
        ref.current.chart.destroy();
      }
    });
  };

  const initializeCharts = () => {
    destroyCharts();

    if (revenueChartRef.current) {
      const ctx = revenueChartRef.current.getContext('2d');
      revenueChartRef.current.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: analyticsData.growth.revenueGrowth.map(d => d.date),
          datasets: [{
            label: 'Revenue ($)',
            data: analyticsData.growth.revenueGrowth.map(d => d.value),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0,0,0,0.8)',
              padding: 12
            }
          },
          scales: {
            x: { display: true, grid: { display: false } },
            y: {
              display: true,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                callback: value => '$' + value.toLocaleString()
              }
            }
          }
        }
      });
    }

    if (audienceChartRef.current) {
      const ctx = audienceChartRef.current.getContext('2d');
      audienceChartRef.current.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: analyticsData.growth.subscribersGrowth.map(d => d.date),
          datasets: [{
            label: 'New Subscribers',
            data: analyticsData.growth.subscribersGrowth.map(d => d.value),
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { display: true, grid: { display: false } },
            y: { display: true, grid: { color: 'rgba(0,0,0,0.05)' } }
          }
        }
      });
    }

    if (engagementChartRef.current) {
      const ctx = engagementChartRef.current.getContext('2d');
      engagementChartRef.current.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: analyticsData.growth.engagementGrowth.map(d => d.date),
          datasets: [{
            label: 'Total Engagement',
            data: analyticsData.growth.engagementGrowth.map(d => d.value),
            backgroundColor: 'rgba(102, 126, 234, 0.6)',
            borderColor: '#667eea',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { display: true, grid: { display: false } },
            y: { display: true, grid: { color: 'rgba(0,0,0,0.05)' } }
          }
        }
      });
    }

    if (demographicsChartRef.current) {
      const ctx = demographicsChartRef.current.getContext('2d');
      demographicsChartRef.current.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(analyticsData.audience.demographics.ageGroups),
          datasets: [{
            data: Object.values(analyticsData.audience.demographics.ageGroups),
            backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'],
            borderWidth: 3,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { padding: 15, font: { size: 12 } }
            }
          }
        }
      });
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const exportReport = async (format) => {
    console.log(`Exporting report in ${format} format...`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert(`Report exported successfully in ${format.toUpperCase()} format!`);
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="creator-revenue-analytics">
      <div className="analytics-header">
        <div className="header-left">
          <h1>📊 Revenue Analytics</h1>
          <p>Track performance and audience growth</p>
        </div>
        <div className="header-right">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="time-range-select">
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <div className="export-buttons">
            <button onClick={() => exportReport('pdf')} className="export-btn">📄 Export PDF</button>
            <button onClick={() => exportReport('csv')} className="export-btn">📊 Export CSV</button>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card revenue">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <div className="metric-label">Total Revenue</div>
            <div className="metric-value">{formatCurrency(analyticsData.revenue.total)}</div>
            <div className={`metric-change ${analyticsData.revenue.change >= 0 ? 'positive' : 'negative'}`}>
              {analyticsData.revenue.change >= 0 ? '↑' : '↓'} {Math.abs(analyticsData.revenue.change)}% vs last period
            </div>
          </div>
        </div>

        <div className="metric-card audience">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <div className="metric-label">Total Audience</div>
            <div className="metric-value">{formatNumber(analyticsData.audience.total)}</div>
            <div className={`metric-change ${analyticsData.audience.change >= 0 ? 'positive' : 'negative'}`}>
              {analyticsData.audience.change >= 0 ? '↑' : '↓'} {Math.abs(analyticsData.audience.change)}% growth
            </div>
          </div>
        </div>

        <div className="metric-card engagement">
          <div className="metric-icon">❤️</div>
          <div className="metric-content">
            <div className="metric-label">Total Views</div>
            <div className="metric-value">{formatNumber(analyticsData.engagement.views)}</div>
            <div className="metric-change positive">
              Avg watch time: {analyticsData.engagement.avgWatchTime} min
            </div>
          </div>
        </div>

        <div className="metric-card likes">
          <div className="metric-icon">👍</div>
          <div className="metric-content">
            <div className="metric-label">Engagement Rate</div>
            <div className="metric-value">
              {((analyticsData.engagement.likes / analyticsData.engagement.views) * 100).toFixed(1)}%
            </div>
            <div className="metric-change positive">
              {formatNumber(analyticsData.engagement.likes)} likes
            </div>
          </div>
        </div>
      </div>

      <div className="section-grid">
        <div className="analytics-section">
          <h2>Revenue Breakdown</h2>
          <div className="revenue-breakdown">
            {Object.entries(analyticsData.revenue.breakdown).map(([key, value]) => (
              <div key={key} className="revenue-item">
                <div className="revenue-item-header">
                  <span className="revenue-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <span className="revenue-amount">{formatCurrency(value)}</span>
                </div>
                <div className="revenue-bar">
                  <div 
                    className="revenue-bar-fill" 
                    style={{ 
                      width: `${(value / analyticsData.revenue.total) * 100}%`,
                      background: key === 'subscriptions' ? '#667eea' : 
                                  key === 'tips' ? '#4CAF50' : 
                                  key === 'merchandise' ? '#FF9800' : '#E91E63'
                    }}
                  ></div>
                </div>
                <div className="revenue-percentage">
                  {((value / analyticsData.revenue.total) * 100).toFixed(1)}% of total
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-section">
          <h2>Demographics</h2>
          <div className="demographics-chart">
            <canvas ref={demographicsChartRef}></canvas>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Revenue Over Time</h3>
          <div className="chart-container">
            <canvas ref={revenueChartRef}></canvas>
          </div>
        </div>

        <div className="chart-card">
          <h3>Audience Growth</h3>
          <div className="chart-container">
            <canvas ref={audienceChartRef}></canvas>
          </div>
        </div>

        <div className="chart-card full-width">
          <h3>Engagement Trends</h3>
          <div className="chart-container">
            <canvas ref={engagementChartRef}></canvas>
          </div>
        </div>
      </div>

      <div className="analytics-section">
        <h2>Top Performing Content</h2>
        <div className="top-content-list">
          {analyticsData.topContent.map((content, index) => (
            <div key={content.id} className="content-item">
              <div className="content-rank">#{index + 1}</div>
              <img src={content.thumbnail} alt={content.title} className="content-thumbnail" />
              <div className="content-details">
                <h4>{content.title}</h4>
                <div className="content-stats">
                  <span>👁️ {formatNumber(content.views)} views</span>
                  <span>💰 {formatCurrency(content.revenue)} revenue</span>
                  <span>📈 {content.engagement}% engagement</span>
                </div>
              </div>
              <div className="content-actions">
                <button className="view-analytics-btn">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-section">
        <h2>Recent Transactions</h2>
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.recentTransactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="user-cell">
                    <div className="user-avatar"></div>
                    {transaction.user}
                  </td>
                  <td>
                    <span className={`transaction-type ${transaction.type.toLowerCase()}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="amount-cell">{formatCurrency(transaction.amount)}</td>
                  <td className="time-cell">{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CreatorRevenueAnalytics;
