import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import './MetricsDashboard.css';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, ArcElement, Tooltip, Legend);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const MetricsDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 2000); // Refresh every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/metrics/dashboard`);
      if (res.ok) {
        const data = await res.json();
        setDashboard(data);
        setLoading(false);

        // Update history for line chart (keep last 30 data points)
        setHistory((prev) => [
          ...prev.slice(-29),
          {
            ts: Date.now(),
            overrides: data.snapshot.overridesIssued,
            blocked: data.snapshot.blockedActions,
            unauthorized: data.snapshot.unauthorizedAttempts,
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  };

  if (loading || !dashboard) {
    return <div className="metrics-dashboard loading">Loading metrics...</div>;
  }

  const { snapshot, security, impact, ledger } = dashboard;

  // Line chart data (trend over time)
  const lineData = {
    labels: history.map((h) => new Date(h.ts).toLocaleTimeString()),
    datasets: [
      {
        label: 'Overrides',
        data: history.map((h) => h.overrides),
        borderColor: '#39ff14',
        backgroundColor: 'rgba(57, 255, 20, 0.2)',
        tension: 0.3,
      },
      {
        label: 'Blocked',
        data: history.map((h) => h.blocked),
        borderColor: '#ff00ff',
        backgroundColor: 'rgba(255, 0, 255, 0.2)',
        tension: 0.3,
      },
    ],
  };

  // Doughnut chart data (distribution)
  const doughnutData = {
    labels: ['Overrides', 'Unauthorized', 'Blocked'],
    datasets: [
      {
        data: [snapshot.overridesIssued, snapshot.unauthorizedAttempts, snapshot.blockedActions],
        backgroundColor: ['#39ff14', '#ffea00', '#ff00ff'],
        borderColor: ['#1d1d1d', '#1d1d1d', '#1d1d1d'],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#39ff14',
          font: {
            family: "'Courier New', monospace",
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#00ffff' },
        grid: { color: 'rgba(0, 255, 255, 0.1)' },
      },
      y: {
        ticks: { color: '#00ffff' },
        grid: { color: 'rgba(0, 255, 255, 0.1)' },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#39ff14',
          font: {
            family: "'Courier New', monospace",
          },
        },
      },
    },
  };

  return (
    <div className="metrics-dashboard">
      <div className="dashboard-header">
        <h2>📊 Governance Metrics Dashboard</h2>
        <span className="last-updated">
          Last updated: {new Date(dashboard.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Metric Cards */}
      <div className="cards">
        <div className="card">
          <span className="label">Overrides issued</span>
          <span className="value">{snapshot.overridesIssued}</span>
        </div>
        <div className="card">
          <span className="label">Unauthorized attempts</span>
          <span className="value warn">{snapshot.unauthorizedAttempts}</span>
        </div>
        <div className="card">
          <span className="label">Blocked actions</span>
          <span className="value">{snapshot.blockedActions}</span>
        </div>
        <div className="card">
          <span className="label">Avg latency (ms)</span>
          <span className="value">{Math.round(snapshot.avgLatencyMs)}</span>
        </div>
      </div>

      {/* Charts */}
      <div className="charts">
        <div className="chart">
          <h4>📈 Governance Activity Trend</h4>
          {history.length > 1 ? (
            <Line data={lineData} options={chartOptions} />
          ) : (
            <div className="no-data">Collecting data...</div>
          )}
        </div>
        <div className="chart">
          <h4>📊 Action Distribution</h4>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>

      {/* Security Summary */}
      <div className="metrics-section">
        <h3>🛡️ Security Summary</h3>
        <div className="metrics-grid">
          <div className="metric-card threat-level">
            <div className="metric-label">Threat Level</div>
            <div className={`metric-value level-${security.threatLevel.toLowerCase()}`}>
              {security.threatLevel}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Total Threats</div>
            <div className="metric-value">{security.totalThreats}</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">System Health</div>
            <div className="metric-value">{impact.systemHealth}%</div>
            <div className="health-bar">
              <div
                className="health-fill"
                style={{
                  width: `${impact.systemHealth}%`,
                  backgroundColor:
                    impact.systemHealth > 80
                      ? '#10b981'
                      : impact.systemHealth > 50
                      ? '#f59e0b'
                      : '#ef4444',
                }}
              />
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Avg Latency</div>
            <div className="metric-value">{impact.avgLatencyMs}ms</div>
          </div>
        </div>
      </div>

      {/* Ledger Stats */}
      {ledger && ledger.totalRecords > 0 && (
        <div className="metrics-section">
          <h3>📋 External Ledger</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Total Records</div>
              <div className="metric-value">{ledger.totalRecords}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Ledger Size</div>
              <div className="metric-value">{ledger.fileSizeKB} KB</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Oldest Record</div>
              <div className="metric-value metric-timestamp">
                {ledger.oldestRecord
                  ? new Date(ledger.oldestRecord).toLocaleString()
                  : 'N/A'}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Newest Record</div>
              <div className="metric-value metric-timestamp">
                {ledger.newestRecord
                  ? new Date(ledger.newestRecord).toLocaleString()
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsDashboard;
