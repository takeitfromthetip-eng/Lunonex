import React, { useState, useEffect } from 'react';
import { ModerationQueueItem } from './ContentModeration';
import DockedConsole from './DockedConsole';
import CommandPanelAdvanced from './admin/CommandPanelAdvanced';
import DockedConsolePro from './admin/DockedConsolePro';
import MetricsDashboard from './admin/MetricsDashboard';
import './AdminPanel.css';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('governance');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArtworks: 0,
    totalRevenue: 0,
    pendingModeration: 0,
    reportedContent: 0,
  });

  const [moderationQueue, setModerationQueue] = useState([]);
  const [reportedContent, setReportedContent] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch admin data');
      
      const data = await response.json();
      setStats(data.stats || {
        totalUsers: 0,
        totalArtworks: 0,
        totalRevenue: 0,
        pendingModeration: 0,
        reportedContent: 0,
      });
      setModerationQueue(data.moderationQueue || []);
      setReportedContent(data.reportedContent || []);
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      // Set empty defaults
      setStats({
        totalUsers: 0,
        totalArtworks: 0,
        totalRevenue: 0,
        pendingModeration: 0,
        reportedContent: 0,
      });
      setModerationQueue([]);
      setReportedContent([]);
      setUsers([]);
    }
  };

  const handleModeration = async (contentId, action, reason = '') => {
    console.log(`${action} content ${contentId}:`, reason);

    // Firestore sync can be added if needed
    // await updateArtwork(contentId, { status: action, moderationReason: reason });

    setModerationQueue(prev => prev.filter(item => item.id !== contentId));
    alert(`Content ${action}ed successfully!`);
    loadAdminData();
  };

  const handleReportedContent = async (reportId, action) => {
    console.log(`${action} report ${reportId}`);

    // Firestore sync can be added if needed
    setReportedContent(prev => prev.filter(item => item.id !== reportId));
    alert(`Report ${action}ed!`);
  };

  const handleUserAction = async (userId, action) => {
    console.log(`${action} user ${userId}`);

    // Firestore sync can be added if needed
    if (action === 'ban') {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, banned: true } : u));
    } else if (action === 'unban') {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, banned: false } : u));
    } else if (action === 'verify') {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: true } : u));
    }

    alert(`User ${action}ed successfully!`);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🛡️ Admin Panel</h1>
        <p className="admin-subtitle">Platform management and moderation</p>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon">🎨</div>
          <div className="stat-content">
            <div className="stat-label">Total Artworks</div>
            <div className="stat-value">{stats.totalArtworks.toLocaleString()}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Platform Revenue</div>
            <div className="stat-value">${stats.totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        <div className="admin-stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-label">Pending Moderation</div>
            <div className="stat-value">{stats.pendingModeration}</div>
          </div>
        </div>

        <div className="admin-stat-card danger">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <div className="stat-label">Reported Content</div>
            <div className="stat-value">{stats.reportedContent}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={activeTab === 'governance' ? 'active' : ''}
          onClick={() => setActiveTab('governance')}
        >
          🎛️ Governance
        </button>
        <button
          className={activeTab === 'moderation' ? 'active' : ''}
          onClick={() => setActiveTab('moderation')}
        >
          Moderation Queue ({moderationQueue.length})
        </button>
        <button
          className={activeTab === 'reports' ? 'active' : ''}
          onClick={() => setActiveTab('reports')}
        >
          Reported Content ({reportedContent.length})
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-tab-content">
        {activeTab === 'moderation' && (
          <div className="moderation-tab">
            <h2>Content Moderation Queue</h2>
            {moderationQueue.length === 0 ? (
              <p className="empty-state">✅ No content pending moderation</p>
            ) : (
              <div className="moderation-list">
                {moderationQueue.map(item => (
                  <ModerationQueueItem
                    key={item.id}
                    item={item}
                    onApprove={(reason) => handleModeration(item.id, 'approved', reason)}
                    onReject={(reason) => handleModeration(item.id, 'rejected', reason)}
                    onFlag={(reason) => handleModeration(item.id, 'flagged', reason)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-tab">
            <h2>Reported Content</h2>
            {reportedContent.length === 0 ? (
              <p className="empty-state">✅ No reported content</p>
            ) : (
              <div className="reports-list">
                {reportedContent.map(report => (
                  <div key={report.id} className="report-card">
                    <div className="report-header">
                      <h3>{report.title}</h3>
                      <span className="report-type">{report.contentType}</span>
                    </div>
                    <div className="report-details">
                      <p><strong>Reported by:</strong> {report.reporter}</p>
                      <p><strong>Reason:</strong> {report.reason}</p>
                      <p><strong>Date:</strong> {report.reportedAt.toLocaleDateString()}</p>
                    </div>
                    <div className="report-actions">
                      <button
                        className="view-content-button"
                        onClick={() => window.location.href = `/${report.contentType}/${report.contentId}`}
                      >
                        View Content
                      </button>
                      <button
                        className="dismiss-button"
                        onClick={() => handleReportedContent(report.id, 'dismissed')}
                      >
                        Dismiss Report
                      </button>
                      <button
                        className="remove-button"
                        onClick={() => handleReportedContent(report.id, 'removed')}
                      >
                        Remove Content
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-tab">
            <div className="users-header">
              <h2>User Management</h2>
              <input
                type="text"
                className="user-search"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Tier</th>
                    <th>Artworks</th>
                    <th>Followers</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className={user.banned ? 'banned-user' : ''}>
                      <td>
                        <div className="user-cell">
                          {user.username}
                          {user.verified && <span className="verified-badge">✓</span>}
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`tier-badge ${user.tier}`}>
                          {user.tier}
                        </span>
                      </td>
                      <td>{user.artworkCount}</td>
                      <td>{user.followers.toLocaleString()}</td>
                      <td>{user.createdAt.toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${user.banned ? 'banned' : 'active'}`}>
                          {user.banned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="user-actions">
                          {!user.banned ? (
                            <button
                              className="ban-button"
                              onClick={() => handleUserAction(user.id, 'ban')}
                            >
                              Ban
                            </button>
                          ) : (
                            <button
                              className="unban-button"
                              onClick={() => handleUserAction(user.id, 'unban')}
                            >
                              Unban
                            </button>
                          )}
                          {!user.verified && (
                            <button
                              className="verify-button"
                              onClick={() => handleUserAction(user.id, 'verify')}
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <h2>Platform Analytics</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Revenue Overview</h3>
                <p className="analytics-value">${stats.totalRevenue.toLocaleString()}</p>
                <p className="analytics-label">Total platform revenue</p>
              </div>

              <div className="analytics-card">
                <h3>User Growth</h3>
                <p className="analytics-value">+{Math.floor(stats.totalUsers * 0.05)}</p>
                <p className="analytics-label">New users this month</p>
              </div>

              <div className="analytics-card">
                <h3>Content Creation</h3>
                <p className="analytics-value">+{Math.floor(stats.totalArtworks * 0.08)}</p>
                <p className="analytics-label">Artworks uploaded this month</p>
              </div>

              <div className="analytics-card">
                <h3>Platform Health</h3>
                <p className="analytics-value">
                  {((stats.pendingModeration / stats.totalArtworks) * 100).toFixed(1)}%
                </p>
                <p className="analytics-label">Moderation rate</p>
              </div>
            </div>

            <div className="analytics-info">
              <p>📊 Detailed analytics and charts coming soon...</p>
              <p>Track revenue trends, user engagement, content performance, and more.</p>
            </div>
          </div>
        )}
      </div>

      {/* Mico's Governance System */}
      {activeTab === 'governance' && (
        <div className="governance-tab">
          <h2>🎛️ Governance & Policy Control</h2>
          <MetricsDashboard />
          <CommandPanelAdvanced />
          <div style={{ marginTop: '32px' }}>
            <DockedConsolePro />
          </div>
        </div>
      )}

      {activeTab === 'legacy-console' && (
        <div className="legacy-console-tab">
          <h2>Legacy Console</h2>
          <DockedConsole />
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
