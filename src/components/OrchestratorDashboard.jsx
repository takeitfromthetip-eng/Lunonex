import React, { useState, useEffect } from 'react';
import './OrchestratorDashboard.css';

/**
 * AI ORCHESTRATOR DASHBOARD
 *
 * Control panel for your multi-agent AI system
 * Watch your AI army work in real-time
 */

const OrchestratorDashboard = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Forms
  const [contentPrompt, setContentPrompt] = useState('');
  const [contentStyle, setContentStyle] = useState('cinematic');

  useEffect(() => {
    fetchStatus();

    if (autoRefresh) {
      const interval = setInterval(fetchStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/orchestrator/status');
      const data = await response.json();
      setStatus(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch status:', error);
      setLoading(false);
    }
  };

  const startOrchestrator = async () => {
    try {
      await fetch('/api/orchestrator/start', { method: 'POST' });
      fetchStatus();
    } catch (error) {
      console.error('Failed to start:', error);
    }
  };

  const stopOrchestrator = async () => {
    try {
      await fetch('/api/orchestrator/stop', { method: 'POST' });
      fetchStatus();
    } catch (error) {
      console.error('Failed to stop:', error);
    }
  };

  const autoCreateContent = async () => {
    if (!contentPrompt.trim()) {
      alert('Enter a content prompt first!');
      return;
    }

    try {
      const response = await fetch('/api/orchestrator/auto-create-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('userId') || 'owner',
          prompt: contentPrompt,
          style: contentStyle
        })
      });

      const data = await response.json();
      alert(`Content creation started!\nTask IDs:\n${JSON.stringify(data, null, 2)}`);
      setContentPrompt('');
    } catch (error) {
      console.error('Auto-create failed:', error);
      alert('Failed to start content creation');
    }
  };

  const generateDailyReport = async () => {
    try {
      const response = await fetch('/api/orchestrator/daily-report', {
        method: 'POST'
      });

      const data = await response.json();
      alert(`Daily report generation started!\nTask ID: ${data.taskId}`);
    } catch (error) {
      console.error('Report generation failed:', error);
      alert('Failed to generate report');
    }
  };

  if (loading) {
    return (
      <div className="orchestrator-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading AI Orchestrator...</p>
      </div>
    );
  }

  const totalTasks = status.agents.reduce((sum, agent) => sum + agent.tasksCompleted, 0);

  return (
    <div className="orchestrator-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🤖 AI Orchestrator</h1>
          <p className="subtitle">Multi-Agent System Control Panel</p>
        </div>
        <div className="header-right">
          <div className={`status-badge ${status.isRunning ? 'running' : 'stopped'}`}>
            {status.isRunning ? '🟢 RUNNING' : '🔴 STOPPED'}
          </div>
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{status.queuedTasks}</div>
            <div className="stat-label">Queued Tasks</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{totalTasks}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">{status.agents.filter(a => a.status === 'working').length}</div>
            <div className="stat-label">Active Agents</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{status.agents.length}</div>
            <div className="stat-label">Total Agents</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <h2>System Controls</h2>
        <div className="control-buttons">
          {!status.isRunning ? (
            <button className="btn btn-success" onClick={startOrchestrator}>
              ▶️ Start Orchestrator
            </button>
          ) : (
            <button className="btn btn-danger" onClick={stopOrchestrator}>
              ⏸️ Stop Orchestrator
            </button>
          )}
          <button className="btn btn-secondary" onClick={fetchStatus}>
            🔄 Refresh Status
          </button>
        </div>
      </div>

      {/* Agent Status */}
      <div className="agents-section">
        <h2>Agent Status</h2>
        <div className="agents-grid">
          {status.agents.map(agent => (
            <div key={agent.role} className={`agent-card ${agent.status}`}>
              <div className="agent-header">
                <div className="agent-icon">{getAgentIcon(agent.role)}</div>
                <div className="agent-info">
                  <h3>{agent.role.toUpperCase()}</h3>
                  <div className={`agent-status ${agent.status}`}>
                    {agent.status === 'working' ? '⚡ Working' : '💤 Idle'}
                  </div>
                </div>
              </div>
              <div className="agent-stats">
                <div className="agent-stat">
                  <span className="stat-label">Tasks Completed:</span>
                  <span className="stat-value">{agent.tasksCompleted}</span>
                </div>
                <div className="agent-stat">
                  <span className="stat-label">Last Active:</span>
                  <span className="stat-value">{getTimeAgo(agent.lastActive)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>

        {/* Auto Create Content */}
        <div className="action-card">
          <h3>🎬 Auto-Create Content</h3>
          <p>Let AI generate, moderate, and optimize content automatically</p>
          <div className="action-form">
            <textarea
              placeholder="Enter your content idea... (e.g., 'Create a cinematic trailer for a sci-fi adventure')"
              value={contentPrompt}
              onChange={(e) => setContentPrompt(e.target.value)}
              rows={3}
            />
            <select value={contentStyle} onChange={(e) => setContentStyle(e.target.value)}>
              <option value="cinematic">Cinematic</option>
              <option value="anime">Anime</option>
              <option value="realistic">Realistic</option>
              <option value="cartoon">Cartoon</option>
              <option value="abstract">Abstract</option>
            </select>
            <button className="btn btn-primary" onClick={autoCreateContent}>
              🚀 Create & Publish
            </button>
          </div>
        </div>

        {/* Daily Report */}
        <div className="action-card">
          <h3>📊 Generate Daily Report</h3>
          <p>Get AI-powered business intelligence and insights</p>
          <button className="btn btn-primary" onClick={generateDailyReport}>
            📈 Generate Report
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="info-panel">
        <h3>ℹ️ How It Works</h3>
        <ul>
          <li><strong>CREATOR Agent:</strong> Generates content plans and assets</li>
          <li><strong>MODERATOR Agent:</strong> Ensures content safety and compliance</li>
          <li><strong>OPTIMIZER Agent:</strong> Maximizes revenue and engagement</li>
          <li><strong>ANALYST Agent:</strong> Provides business intelligence</li>
          <li><strong>ASSISTANT Agent:</strong> Helps users with questions</li>
          <li><strong>ORCHESTRATOR Agent:</strong> Coordinates complex workflows</li>
        </ul>
        <p className="info-note">
          💡 The orchestrator processes tasks automatically. Higher priority tasks run first.
        </p>
      </div>
    </div>
  );
};

// Helper functions
function getAgentIcon(role) {
  const icons = {
    creator: '🎨',
    moderator: '🛡️',
    optimizer: '💰',
    analyst: '📊',
    assistant: '💬',
    orchestrator: '🎭'
  };
  return icons[role] || '🤖';
}

function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default OrchestratorDashboard;
