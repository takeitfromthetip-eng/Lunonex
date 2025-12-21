import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './CreatorDashboard.css';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import { RealTimeActivityFeed } from './RealTimeActivityFeed';
import { AIRecommendations } from './AIRecommendations';
import { PerformanceOptimizer } from './PerformanceOptimizer';
import { ABTestingFramework } from './ABTestingFramework';
import { GeneralMediaSorter } from './GeneralMediaSorter';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function CreatorDashboard({ userId }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [stats, setStats] = useState({
    balance: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    followers: 0,
    artworkViews: 0,
    commissionsPending: 0,
    commissionsCompleted: 0,
    activeSubscribers: 0,
  });

  const [earningsData, setEarningsData] = useState({
    labels: [],
    datasets: [],
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [commissionRequests, setCommissionRequests] = useState([]);
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [userId, timeRange]);

  const loadDashboardData = async () => {
    // Firestore queries can be added here if needed
    // Mock data for now

    // Earnings chart data
    const labels = timeRange === 'week'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : timeRange === 'month'
        ? Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const data = labels.map(() => 0);

    setEarningsData({
      labels,
      datasets: [
        {
          label: 'Earnings ($)',
          data,
          borderColor: '#e91e63',
          backgroundColor: 'rgba(233, 30, 99, 0.1)',
          tension: 0.4,
        },
      ],
    });

    // Mock stats
    setStats({
      balance: 2847.50,
      totalEarnings: 12450.00,
      monthlyEarnings: 1820.00,
      followers: 3524,
      artworkViews: 45230,
      commissionsPending: 5,
      commissionsCompleted: 42,
      activeSubscribers: 128,
    });

    // Mock transactions
    setRecentTransactions([
      { id: '1', type: 'tip', amount: 50.00, from: 'AnimeFan42', date: '2024-01-15', status: 'completed' },
      { id: '2', type: 'commission', amount: 250.00, from: 'ArtLover99', date: '2024-01-14', status: 'completed' },
      { id: '3', type: 'subscription', amount: 10.00, from: 'WeebMaster', date: '2024-01-14', status: 'completed' },
      { id: '4', type: 'tip', amount: 25.00, from: 'MangaReader', date: '2024-01-13', status: 'completed' },
      { id: '5', type: 'commission', amount: 150.00, from: 'CosplayQueen', date: '2024-01-12', status: 'completed' },
    ]);

    // Mock commission requests
    setCommissionRequests([
      {
        id: '1',
        buyer: 'AnimeFan42',
        title: 'Custom Character Art',
        type: 'Full Body Illustration',
        price: 250.00,
        deadline: '2024-02-01',
        status: 'pending',
        description: 'Need a full body character illustration in anime style...'
      },
      {
        id: '2',
        buyer: 'MangaLover',
        title: 'OC Portrait',
        type: 'Portrait',
        price: 150.00,
        deadline: '2024-01-28',
        status: 'in_progress',
        description: 'Portrait of my original character...'
      },
    ]);

    // Mock subscribers
    setSubscribers([
      { id: '1', username: 'WeebMaster', tier: 'unlimited', since: '2023-12-01', avatar: null },
      { id: '2', username: 'AnimeFan42', tier: 'adult', since: '2024-01-05', avatar: null },
      { id: '3', username: 'MangaReader', tier: 'adult', since: '2024-01-10', avatar: null },
    ]);
  };

  const handlePayout = async () => {
    if (stats.balance < 50) {
      alert('Minimum payout amount is $50.00');
      return;
    }

    if (confirm(`Request payout of $${stats.balance.toFixed(2)}?`)) {
      // Stripe Connect payout can be implemented here
      alert('Payout request submitted! Funds will be transferred within 2-3 business days.');
    }
  };

  const handleCommissionAction = async (commissionId, action) => {
    // Commission actions (accept, reject, complete, cancel) can be implemented here
    console.log(`Commission ${commissionId}: ${action}`);
    alert(`Commission ${action}ed successfully!`);
    loadDashboardData();
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value}`,
        },
      },
    },
  };

  return (
    <div className="creator-dashboard">
      <div className="dashboard-header">
        <h1>Creator Dashboard</h1>
        <button className="payout-button" onClick={handlePayout}>
          💰 Request Payout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card balance-card">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <div className="stat-label">Available Balance</div>
            <div className="stat-value">${stats.balance.toFixed(2)}</div>
            <div className="stat-sublabel">Ready to withdraw</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">Monthly Earnings</div>
            <div className="stat-value">${stats.monthlyEarnings.toFixed(2)}</div>
            <div className="stat-sublabel">This month</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Total Earnings</div>
            <div className="stat-value">${stats.totalEarnings.toFixed(2)}</div>
            <div className="stat-sublabel">All time</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-label">Followers</div>
            <div className="stat-value">{stats.followers.toLocaleString()}</div>
            <div className="stat-sublabel">Total followers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-content">
            <div className="stat-label">Artwork Views</div>
            <div className="stat-value">{stats.artworkViews.toLocaleString()}</div>
            <div className="stat-sublabel">Total views</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✨</div>
          <div className="stat-content">
            <div className="stat-label">Commissions</div>
            <div className="stat-value">{stats.commissionsPending} / {stats.commissionsCompleted}</div>
            <div className="stat-sublabel">Pending / Completed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌟</div>
          <div className="stat-content">
            <div className="stat-label">Subscribers</div>
            <div className="stat-value">{stats.activeSubscribers}</div>
            <div className="stat-sublabel">Active subscribers</div>
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="earnings-chart-container">
        <div className="chart-header">
          <h2>Earnings Overview</h2>
          <div className="time-range-selector">
            <button
              className={timeRange === 'week' ? 'active' : ''}
              onClick={() => setTimeRange('week')}
            >
              Week
            </button>
            <button
              className={timeRange === 'month' ? 'active' : ''}
              onClick={() => setTimeRange('month')}
            >
              Month
            </button>
            <button
              className={timeRange === 'year' ? 'active' : ''}
              onClick={() => setTimeRange('year')}
            >
              Year
            </button>
          </div>
        </div>
        <div className="chart-wrapper">
          <Line data={earningsData} options={chartOptions} />
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'transactions' ? 'active' : ''}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button
          className={activeTab === 'commissions' ? 'active' : ''}
          onClick={() => setActiveTab('commissions')}
        >
          Commissions ({stats.commissionsPending})
        </button>
        <button
          className={activeTab === 'subscribers' ? 'active' : ''}
          onClick={() => setActiveTab('subscribers')}
        >
          Subscribers ({stats.activeSubscribers})
        </button>
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button
          className={activeTab === 'activity' ? 'active' : ''}
          onClick={() => setActiveTab('activity')}
        >
          ⚡ Activity
        </button>
        <button
          className={activeTab === 'recommendations' ? 'active' : ''}
          onClick={() => setActiveTab('recommendations')}
        >
          🤖 AI
        </button>
        <button
          className={activeTab === 'performance' ? 'active' : ''}
          onClick={() => setActiveTab('performance')}
        >
          📊 Performance
        </button>
        <button
          className={activeTab === 'experiments' ? 'active' : ''}
          onClick={() => setActiveTab('experiments')}
        >
          🎯 A/B Tests
        </button>
        <button
          className={activeTab === 'mediaSorter' ? 'active' : ''}
          onClick={() => setActiveTab('mediaSorter')}
        >
          🎬 Media Processor
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="section">
              <h3>Recent Activity</h3>
              <p>Your latest earnings, commissions, and subscriber updates.</p>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="transactions-content">
            <h3>Recent Transactions</h3>
            <div className="transactions-table">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>From</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <span className={`transaction-type ${transaction.type}`}>
                          {transaction.type === 'tip' && '💝'}
                          {transaction.type === 'commission' && '✨'}
                          {transaction.type === 'subscription' && '🌟'}
                          {' '}
                          {transaction.type}
                        </span>
                      </td>
                      <td>{transaction.from}</td>
                      <td className="amount">${transaction.amount.toFixed(2)}</td>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`status ${transaction.status}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'commissions' && (
          <div className="commissions-content">
            <h3>Commission Requests</h3>
            <div className="commission-list">
              {commissionRequests.map((commission) => (
                <div key={commission.id} className="commission-card">
                  <div className="commission-header">
                    <div>
                      <h4>{commission.title}</h4>
                      <p className="commission-buyer">from {commission.buyer}</p>
                    </div>
                    <div className="commission-price">${commission.price.toFixed(2)}</div>
                  </div>
                  <div className="commission-details">
                    <p><strong>Type:</strong> {commission.type}</p>
                    <p><strong>Deadline:</strong> {new Date(commission.deadline).toLocaleDateString()}</p>
                    <p><strong>Description:</strong> {commission.description}</p>
                  </div>
                  <div className="commission-actions">
                    {commission.status === 'pending' && (
                      <>
                        <button
                          className="accept-button"
                          onClick={() => handleCommissionAction(commission.id, 'accept')}
                        >
                          ✓ Accept
                        </button>
                        <button
                          className="reject-button"
                          onClick={() => handleCommissionAction(commission.id, 'reject')}
                        >
                          ✗ Reject
                        </button>
                      </>
                    )}
                    {commission.status === 'in_progress' && (
                      <button
                        className="complete-button"
                        onClick={() => handleCommissionAction(commission.id, 'complete')}
                      >
                        ✓ Mark Complete
                      </button>
                    )}
                  </div>
                  <div className={`commission-status ${commission.status}`}>
                    {commission.status.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'subscribers' && (
          <div className="subscribers-content">
            <h3>Your Subscribers</h3>
            <div className="subscribers-list">
              {subscribers.map((subscriber) => (
                <div key={subscriber.id} className="subscriber-card">
                  <div className="subscriber-avatar">
                    {subscriber.avatar ? (
                      <img src={subscriber.avatar} alt={subscriber.username} />
                    ) : (
                      <div className="avatar-placeholder">
                        {subscriber.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="subscriber-info">
                    <div className="subscriber-username">{subscriber.username}</div>
                    <div className="subscriber-tier">
                      <span className={`tier-badge ${subscriber.tier}`}>
                        {subscriber.tier === 'adult' && '🔞'}
                        {subscriber.tier === 'unlimited' && '⭐'}
                        {subscriber.tier === 'super_admin' && '👑'}
                        {' '}
                        {subscriber.tier}
                      </span>
                    </div>
                    <div className="subscriber-since">
                      Member since {new Date(subscriber.since).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <AdvancedAnalytics 
            userId={userId} 
            userTier="premium"
            isOwner={true}
          />
        )}

        {activeTab === 'activity' && (
          <RealTimeActivityFeed userId={userId} />
        )}

        {activeTab === 'recommendations' && (
          <AIRecommendations 
            userId={userId}
            userTier="premium"
            userPreferences={{}}
          />
        )}

        {activeTab === 'performance' && (
          <PerformanceOptimizer 
            onOptimizationApplied={(result) => {
              console.log('Optimization applied:', result);
            }}
          />
        )}

        {activeTab === 'experiments' && (
          <ABTestingFramework 
            userId={userId}
            userTier="premium"
          />
        )}

        {activeTab === 'mediaSorter' && (
          <GeneralMediaSorter userId={userId} />
        )}
      </div>
    </div>
  );
}

export default CreatorDashboard;
