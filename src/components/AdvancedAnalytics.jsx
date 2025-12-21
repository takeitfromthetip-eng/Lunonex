/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './AdvancedAnalytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Advanced Analytics Dashboard
 * Comprehensive platform metrics and insights
 */
export const AdvancedAnalytics = ({ userId, userTier, isOwner }) => {
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, all
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    users: { total: 0, growth: 0, active: 0 },
    revenue: { total: 0, growth: 0, mrr: 0 },
    content: { posts: 0, comments: 0, likes: 0 },
    engagement: { rate: 0, avgSession: 0, retention: 0 }
  });
  const [chartData, setChartData] = useState(null);
  const [topCreators, setTopCreators] = useState([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Simulate API call (replace with real endpoint)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data - replace with real API
      const mockMetrics = {
        users: {
          total: 1247,
          growth: 23.5,
          active: 892,
          new: 156
        },
        revenue: {
          total: 34580,
          growth: 18.2,
          mrr: 12400,
          arpu: 27.73
        },
        content: {
          posts: 4521,
          comments: 12304,
          likes: 45672,
          shares: 3421
        },
        engagement: {
          rate: 68.5,
          avgSession: 24.3,
          retention: 82.1,
          bounceRate: 32.4
        }
      };

      // User growth chart data
      const userGrowthData = {
        labels: getLast7Days(),
        datasets: [
          {
            label: 'Total Users',
            data: [1091, 1115, 1134, 1167, 1198, 1223, 1247],
            borderColor: 'rgb(102, 126, 234)',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Active Users',
            data: [784, 801, 819, 843, 861, 878, 892],
            borderColor: 'rgb(118, 75, 162)',
            backgroundColor: 'rgba(118, 75, 162, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      };

      // Revenue breakdown
      const revenueData = {
        labels: ['Free', '$15+$5', '$50', '$100', '$250', '$500', '$1000'],
        datasets: [{
          label: 'Revenue by Tier',
          data: [0, 3420, 8900, 6200, 7250, 5400, 3410],
          backgroundColor: [
            'rgba(200, 200, 200, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
          ],
          borderColor: [
            'rgba(200, 200, 200, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 2
        }]
      };

      // Top creators
      const mockTopCreators = [
        { name: 'AnimeArtist123', revenue: 4520, subs: 156, growth: 32.1 },
        { name: 'MangaMaster', revenue: 3840, subs: 142, growth: 28.5 },
        { name: 'WeebCreator', revenue: 3210, subs: 98, growth: 15.2 },
        { name: 'OtakuPro', revenue: 2890, subs: 87, growth: 24.8 },
        { name: 'CosplayQueen', revenue: 2650, subs: 79, growth: 19.3 }
      ];

      setMetrics(mockMetrics);
      setChartData({ userGrowth: userGrowthData, revenue: revenueData });
      setTopCreators(mockTopCreators);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setLoading(false);
    }
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return days;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercent = (num) => {
    return `${num.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="advanced-analytics">
      <div className="analytics-header">
        <h1>📊 Advanced Analytics</h1>
        <div className="time-range-selector">
          <button 
            className={timeRange === '7d' ? 'active' : ''} 
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </button>
          <button 
            className={timeRange === '30d' ? 'active' : ''} 
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </button>
          <button 
            className={timeRange === '90d' ? 'active' : ''} 
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </button>
          <button 
            className={timeRange === 'all' ? 'active' : ''} 
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard
          icon="👥"
          title="Total Users"
          value={formatNumber(metrics.users.total)}
          change={metrics.users.growth}
          subtitle={`${formatNumber(metrics.users.active)} active`}
        />
        <MetricCard
          icon="💰"
          title="Revenue"
          value={formatCurrency(metrics.revenue.total)}
          change={metrics.revenue.growth}
          subtitle={`${formatCurrency(metrics.revenue.mrr)} MRR`}
        />
        <MetricCard
          icon="📝"
          title="Posts"
          value={formatNumber(metrics.content.posts)}
          change={12.3}
          subtitle={`${formatNumber(metrics.content.comments)} comments`}
        />
        <MetricCard
          icon="📈"
          title="Engagement"
          value={formatPercent(metrics.engagement.rate)}
          change={5.2}
          subtitle={`${metrics.engagement.avgSession} min avg`}
        />
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>User Growth</h3>
          {chartData && (
            <Line 
              data={chartData.userGrowth} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                  y: { beginAtZero: false }
                }
              }}
            />
          )}
        </div>

        <div className="chart-card">
          <h3>Revenue by Tier</h3>
          {chartData && (
            <Doughnut 
              data={chartData.revenue}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right' }
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Top Creators */}
      <div className="top-creators-card">
        <h3>🏆 Top Creators</h3>
        <div className="creators-table">
          <table>
            <thead>
              <tr>
                <th>Creator</th>
                <th>Revenue</th>
                <th>Subscribers</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody>
              {topCreators.map((creator, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="creator-info">
                      <span className="rank">#{idx + 1}</span>
                      <span className="name">{creator.name}</span>
                    </div>
                  </td>
                  <td className="revenue">{formatCurrency(creator.revenue)}</td>
                  <td>{creator.subs}</td>
                  <td className={creator.growth > 0 ? 'positive' : 'negative'}>
                    {creator.growth > 0 ? '↑' : '↓'} {formatPercent(creator.growth)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="insights-grid">
        <div className="insight-card">
          <h4>💎 ARPU</h4>
          <p className="big-number">{formatCurrency(metrics.revenue.arpu)}</p>
          <span className="subtitle">Average Revenue Per User</span>
        </div>
        <div className="insight-card">
          <h4>🔄 Retention</h4>
          <p className="big-number">{formatPercent(metrics.engagement.retention)}</p>
          <span className="subtitle">7-Day Retention Rate</span>
        </div>
        <div className="insight-card">
          <h4>⏱️ Avg Session</h4>
          <p className="big-number">{metrics.engagement.avgSession} min</p>
          <span className="subtitle">Time on Platform</span>
        </div>
        <div className="insight-card">
          <h4>🎯 Bounce Rate</h4>
          <p className="big-number">{formatPercent(metrics.engagement.bounceRate)}</p>
          <span className="subtitle">Single Page Visits</span>
        </div>
      </div>

      {/* Export Options */}
      <div className="analytics-actions">
        <button className="export-btn">
          📥 Export CSV
        </button>
        <button className="export-btn">
          📊 Generate Report
        </button>
        <button className="export-btn">
          📧 Email Summary
        </button>
      </div>
    </div>
  );
};

/**
 * Metric Card Component
 */
const MetricCard = ({ icon, title, value, change, subtitle }) => {
  const isPositive = change > 0;
  
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <h4>{title}</h4>
        <p className="metric-value">{value}</p>
        <div className="metric-footer">
          <span className={`change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
          </span>
          <span className="subtitle">{subtitle}</span>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
