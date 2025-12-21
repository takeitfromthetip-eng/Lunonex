/**
 * ADMIN SECURITY DASHBOARD
 * Real-time monitoring of security threats, fraud, and system health
 */

import React, { useState, useEffect } from 'react';
import { getModerationStats } from '../utils/aiModeration';
import { getFraudStats } from '../utils/paymentSecurity';
import { checkSecurityHeaders } from '../utils/securityCore';
import { AuditLogger } from '../utils/securityCore';

export default function SecurityDashboard() {
  const [moderationStats, setModerationStats] = useState(null);
  const [fraudStats, setFraudStats] = useState(null);
  const [securityHeaders, setSecurityHeaders] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      const [modStats, frStats, headers, logs] = await Promise.all([
        Promise.resolve(getModerationStats()),
        getFraudStats(),
        checkSecurityHeaders(window.location.origin),
        Promise.resolve(AuditLogger.getLogs()),
      ]);

      setModerationStats(modStats);
      setFraudStats(frStats);
      setSecurityHeaders(headers);
      setAuditLogs(logs.slice(-20)); // Last 20 logs
      setLoading(false);
    } catch (error) {
      console.error('Error loading security data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="security-dashboard loading">Loading security data...</div>;
  }

  return (
    <div className="security-dashboard">
      <h1>🔒 Security Dashboard</h1>

      {/* Overall Security Score */}
      <div className="security-score-card">
        <h2>Overall Security Score</h2>
        <div className="score-display">
          <div className="score-circle">
            {securityHeaders?.score || 0}%
          </div>
          <div className="score-details">
            <p>{securityHeaders?.missing?.length || 0} security headers missing</p>
            <p>Critical: {moderationStats?.bySeverity?.CRITICAL || 0}, High: {moderationStats?.bySeverity?.HIGH || 0}</p>
            <p>Fraud Risk: {fraudStats?.byRiskLevel?.critical || 0} critical</p>
          </div>
        </div>
      </div>

      {/* Content Moderation Stats */}
      <div className="dashboard-section">
        <h2>📊 Content Moderation</h2>
        <div className="stats-grid">
          <StatCard
            title="Total Scans"
            value={moderationStats?.total || 0}
            icon="🔍"
          />
          <StatCard
            title="Approved"
            value={moderationStats?.approved || 0}
            color="green"
            icon="✅"
          />
          <StatCard
            title="Blocked"
            value={moderationStats?.blocked || 0}
            color="red"
            icon="🚫"
          />
          <StatCard
            title="Review Required"
            value={moderationStats?.reviewRequired || 0}
            color="orange"
            icon="⚠️"
          />
        </div>

        <div className="violations-breakdown">
          <h3>Top Violations</h3>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Count</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(moderationStats?.byViolationType || {})
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([type, count]) => (
                  <tr key={type}>
                    <td>{type}</td>
                    <td>{count}</td>
                    <td>
                      <span className={`severity-badge ${getSeverityClass(type)}`}>
                        {getSeverity(type)}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fraud Detection Stats */}
      <div className="dashboard-section">
        <h2>💳 Fraud Detection</h2>
        <div className="stats-grid">
          <StatCard
            title="Total Analyzed"
            value={fraudStats?.total || 0}
            icon="🔍"
          />
          <StatCard
            title="Low Risk"
            value={fraudStats?.byRiskLevel?.low || 0}
            color="green"
            icon="✅"
          />
          <StatCard
            title="Medium Risk"
            value={fraudStats?.byRiskLevel?.medium || 0}
            color="yellow"
            icon="⚠️"
          />
          <StatCard
            title="High Risk"
            value={fraudStats?.byRiskLevel?.high || 0}
            color="orange"
            icon="🔸"
          />
          <StatCard
            title="Critical"
            value={fraudStats?.byRiskLevel?.critical || 0}
            color="red"
            icon="🚨"
          />
          <StatCard
            title="Blocked"
            value={fraudStats?.blocked || 0}
            color="red"
            icon="🚫"
          />
        </div>

        <div className="risk-factors">
          <h3>Top Risk Factors</h3>
          <table>
            <thead>
              <tr>
                <th>Factor</th>
                <th>Count</th>
                <th>Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(fraudStats?.topRiskFactors || {})
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([factor, count]) => (
                  <tr key={factor}>
                    <td>{factor.replace(/_/g, ' ')}</td>
                    <td>{count}</td>
                    <td>{getRiskScore(factor)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Headers */}
      <div className="dashboard-section">
        <h2>🛡️ Security Headers</h2>
        <div className="headers-list">
          {Object.entries(securityHeaders?.headers || {}).map(([header, value]) => (
            <div key={header} className={`header-item ${value ? 'present' : 'missing'}`}>
              <span className="header-name">{header}</span>
              <span className="header-status">
                {value ? '✅ Present' : '❌ Missing'}
              </span>
              {value && <span className="header-value">{value}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Audit Logs */}
      <div className="dashboard-section">
        <h2>📜 Recent Activity</h2>
        <div className="audit-logs">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>User</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, index) => (
                <tr key={index}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.event}</td>
                  <td>{log.userId}</td>
                  <td>{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .security-dashboard {
          padding: 20px;
          background: linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%);
          color: white;
          min-height: 100vh;
        }

        .security-dashboard h1 {
          font-size: 32px;
          margin-bottom: 30px;
          text-align: center;
        }

        .security-score-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          text-align: center;
        }

        .score-circle {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: conic-gradient(
            #00ff88 ${(securityHeaders?.score || 0) * 3.6}deg,
            #333 ${(securityHeaders?.score || 0) * 3.6}deg
          );
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          font-weight: bold;
          margin: 0 auto 20px;
          position: relative;
        }

        .score-circle::before {
          content: '';
          position: absolute;
          width: 120px;
          height: 120px;
          background: #1e1e2e;
          border-radius: 50%;
        }

        .score-circle::after {
          content: attr(data-score);
          position: relative;
          z-index: 1;
        }

        .dashboard-section {
          background: rgba(255, 255, 255, 0.05);
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 25px;
        }

        .dashboard-section h2 {
          font-size: 24px;
          margin-bottom: 20px;
          border-bottom: 2px solid #00ff88;
          padding-bottom: 10px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.08);
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-card .icon {
          font-size: 36px;
          margin-bottom: 10px;
        }

        .stat-card .title {
          font-size: 14px;
          color: #aaa;
          margin-bottom: 5px;
        }

        .stat-card .value {
          font-size: 32px;
          font-weight: bold;
        }

        .stat-card.green .value {
          color: #00ff88;
        }

        .stat-card.red .value {
          color: #ff4444;
        }

        .stat-card.orange .value {
          color: #ffaa00;
        }

        .stat-card.yellow .value {
          color: #ffee00;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }

        thead {
          background: rgba(0, 255, 136, 0.1);
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        th {
          font-weight: bold;
          color: #00ff88;
        }

        tr:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .severity-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }

        .severity-badge.critical {
          background: #ff4444;
        }

        .severity-badge.high {
          background: #ffaa00;
        }

        .severity-badge.medium {
          background: #ffee00;
          color: #333;
        }

        .severity-badge.low {
          background: #00ff88;
          color: #333;
        }

        .headers-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .header-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .header-item.present {
          border-left: 4px solid #00ff88;
        }

        .header-item.missing {
          border-left: 4px solid #ff4444;
        }

        .header-name {
          font-weight: bold;
          flex: 1;
        }

        .header-status {
          margin-right: 15px;
        }

        .header-value {
          font-size: 12px;
          color: #aaa;
          max-width: 400px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-size: 24px;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .score-circle {
            width: 120px;
            height: 120px;
            font-size: 36px;
          }

          .score-circle::before {
            width: 90px;
            height: 90px;
          }

          table {
            font-size: 14px;
          }

          th, td {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
}

function StatCard({ title, value, color = 'white', icon }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="icon">{icon}</div>
      <div className="title">{title}</div>
      <div className="value">{value.toLocaleString()}</div>
    </div>
  );
}

function getSeverityClass(type) {
  if (type.includes('CRITICAL') || type.includes('PROHIBITED')) return 'critical';
  if (type.includes('HIGH') || type.includes('COPYRIGHT')) return 'high';
  if (type.includes('MEDIUM') || type.includes('SPAM')) return 'medium';
  return 'low';
}

function getSeverity(type) {
  if (type.includes('CRITICAL') || type.includes('PROHIBITED')) return 'CRITICAL';
  if (type.includes('HIGH') || type.includes('COPYRIGHT')) return 'HIGH';
  if (type.includes('MEDIUM') || type.includes('SPAM')) return 'MEDIUM';
  return 'LOW';
}

function getRiskScore(factor) {
  const scores = {
    VPN_DETECTED: 15,
    TOR_DETECTED: 25,
    RAPID_PURCHASES: 20,
    NEW_ACCOUNT: 10,
    MULTIPLE_CARDS: 10,
    HIGH_VALUE: 15,
    PREVIOUSLY_DECLINED: 20,
    CHARGEBACK_HISTORY: 30,
  };
  return scores[factor] || 5;
}
