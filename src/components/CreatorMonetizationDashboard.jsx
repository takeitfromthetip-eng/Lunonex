/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// PROFESSIONAL CREATOR MONETIZATION & ANALYTICS DASHBOARD
export function CreatorMonetizationDashboard({ userId }) {
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, 1y
  const [revenueData, setRevenueData] = useState([]);
  const [contentPerformance, setContentPerformance] = useState([]);
  const [revenueSources, setRevenueSources] = useState([]);

  useEffect(() => {
    loadAnalytics(userId, timeRange);
  }, [userId, timeRange]);

  const loadAnalytics = async (userId, range) => {
    try {
      const data = await fetchAnalytics(userId, range);
      if (data) {
        setRevenueData(data.revenueData || []);
        setContentPerformance(data.contentPerformance || []);
        setRevenueSources(data.revenueSources || []);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Set empty arrays for empty state
      setRevenueData([]);
      setContentPerformance([]);
      setRevenueSources([]);
    }
  };

  return (
    <div style={{ padding: '40px', background: '#0a0a0a', minHeight: '100vh', color: 'white' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: '36px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0
        }}>
          💰 Creator Analytics & Earnings
        </h1>

        <div style={{ display: 'flex', gap: '10px' }}>
          {['7d', '30d', '90d', '1y'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                background: timeRange === range ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <MetricCard
          title="Total Earnings"
          value="$12,547"
          change="+23.5%"
          icon="💵"
          color="#4CAF50"
        />
        <MetricCard
          title="Total Views"
          value="1.2M"
          change="+15.2%"
          icon="👁️"
          color="#2196F3"
        />
        <MetricCard
          title="Active Subscribers"
          value="8,432"
          change="+8.7%"
          icon="👥"
          color="#FF9800"
        />
        <MetricCard
          title="Avg. Revenue/View"
          value="$0.0104"
          change="+2.1%"
          icon="📊"
          color="#9C27B0"
        />
      </div>

      {/* Revenue Chart */}
      <ChartCard title="Revenue Over Time">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line type="monotone" dataKey="earnings" stroke="#4CAF50" strokeWidth={3} />
            <Line type="monotone" dataKey="views" stroke="#2196F3" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Content Performance */}
        <ChartCard title="Top Performing Content">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contentPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="title" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
              />
              <Bar dataKey="revenue" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue Sources */}
        <ChartCard title="Revenue Sources">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueSources}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueSources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Detailed Transactions */}
      <div style={{ marginTop: '40px' }}>
        <TransactionHistory userId={userId} />
      </div>

      {/* Payout Settings */}
      <div style={{ marginTop: '40px' }}>
        <PayoutSettings userId={userId} />
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, icon, color }) {
  const isPositive = change.startsWith('+');

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '15px',
      padding: '25px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        fontSize: '40px',
        opacity: 0.3
      }}>
        {icon}
      </div>

      <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '10px' }}>
        {title}
      </div>

      <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', color }}>
        {value}
      </div>

      <div style={{
        fontSize: '14px',
        color: isPositive ? '#4CAF50' : '#f44336',
        fontWeight: 'bold'
      }}>
        {change} this period
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '15px',
      padding: '25px'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'white' }}>{title}</h3>
      {children}
    </div>
  );
}

function TransactionHistory({ userId }) {
  const transactions = [
    { id: 1, date: '2025-11-08', type: 'VR Content Sale', amount: '$125.00', status: 'completed' },
    { id: 2, date: '2025-11-07', type: 'Subscription', amount: '$49.99', status: 'completed' },
    { id: 3, date: '2025-11-06', type: 'AR Experience', amount: '$75.50', status: 'completed' },
    { id: 4, date: '2025-11-05', type: 'Tip', amount: '$10.00', status: 'completed' },
    { id: 5, date: '2025-11-04', type: 'VR Content Sale', amount: '$200.00', status: 'pending' },
  ];

  return (
    <ChartCard title="Recent Transactions">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '15px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '15px' }}>{tx.date}</td>
                <td style={{ padding: '15px' }}>{tx.type}</td>
                <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', color: '#4CAF50' }}>
                  {tx.amount}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <span style={{
                    background: tx.status === 'completed' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                    color: tx.status === 'completed' ? '#4CAF50' : '#FF9800',
                    padding: '5px 15px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {tx.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

function PayoutSettings({ userId }) {
  return (
    <ChartCard title="Payout Settings">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div>
          <h4 style={{ marginTop: 0, color: '#667eea' }}>Payment Method</h4>
          <select style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            fontSize: '16px'
          }}>
            <option>PayPal</option>
            <option>Bank Transfer</option>
            <option>Stripe</option>
            <option>Bitcoin (Auto-converted to USD)</option>
            <option>Ethereum (Auto-converted to USD)</option>
          </select>

          <h4 style={{ marginTop: '25px', color: '#667eea' }}>Payout Frequency</h4>
          <select style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            fontSize: '16px'
          }}>
            <option>Weekly</option>
            <option>Bi-weekly</option>
            <option>Monthly</option>
          </select>
        </div>

        <div>
          <h4 style={{ marginTop: 0, color: '#667eea' }}>Available Balance</h4>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '30px',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
              $2,847.50
            </div>
            <button style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '15px'
            }}>
              Request Payout
            </button>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

async function fetchAnalytics(userId, timeRange) {
  // Fetch analytics from backend
  try {
    const response = await fetch(`/api/analytics?userId=${userId}&range=${timeRange}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch analytics:', err);
  }
}
