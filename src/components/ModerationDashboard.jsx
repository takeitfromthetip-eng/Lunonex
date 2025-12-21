import React, { useState, useEffect } from 'react';
import { isOwner } from '../utils/ownerAuth';

export default function ModerationDashboard() {
  const [isOwnerUser, setIsOwnerUser] = useState(false);
  const [reports, setReports] = useState([
    { id: 1, type: 'spam', content: 'Suspicious content reported', reporter: 'user123', status: 'pending', date: '2025-11-15' },
    { id: 2, type: 'abuse', content: 'Inappropriate behavior', reporter: 'user456', status: 'pending', date: '2025-11-14' },
    { id: 3, type: 'copyright', content: 'Copyright violation claim', reporter: 'user789', status: 'resolved', date: '2025-11-13' }
  ]);

  useEffect(() => {
    const checkOwner = async () => {
      const ownerStatus = await isOwner();
      setIsOwnerUser(ownerStatus);
    };
    checkOwner();
  }, []);

  if (!isOwnerUser) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>🔒 Owner Access Only</h2>
        <p style={{ color: '#6b7280' }}>This dashboard is restricted to the platform owner.</p>
      </div>
    );
  }

  const handleAction = (reportId, action) => {
    console.log(`Action ${action} on report ${reportId}`);
    setReports(reports.map(r =>
      r.id === reportId ? { ...r, status: action === 'approve' ? 'resolved' : 'dismissed' } : r
    ));
  };

  const pendingReports = reports.filter(r => r.status === 'pending');

  return (
    <div style={{ padding: '24px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        padding: '24px',
        borderRadius: '12px',
        color: 'white',
        marginBottom: '24px'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
          🛡️ Moderation Dashboard
        </h1>
        <p style={{ opacity: 0.9 }}>
          Review and manage reported content
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>
            {pendingReports.length}
          </div>
          <div style={{ color: '#6b7280', marginTop: '4px' }}>Pending Reports</div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
            {reports.filter(r => r.status === 'resolved').length}
          </div>
          <div style={{ color: '#6b7280', marginTop: '4px' }}>Resolved</div>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>
            {reports.length}
          </div>
          <div style={{ color: '#6b7280', marginTop: '4px' }}>Total Reports</div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Recent Reports</h2>
        </div>

        {reports.map(report => (
          <div
            key={report.id}
            style={{
              padding: '16px',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: report.status === 'pending' ? '#fef3c7' : 'white'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: report.type === 'spam' ? '#fee2e2' :
                    report.type === 'abuse' ? '#fecaca' : '#dbeafe',
                  color: report.type === 'spam' ? '#991b1b' :
                    report.type === 'abuse' ? '#7f1d1d' : '#1e40af'
                }}>
                  {report.type}
                </span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: report.status === 'pending' ? '#fef3c7' : '#d1fae5',
                  color: report.status === 'pending' ? '#92400e' : '#065f46'
                }}>
                  {report.status}
                </span>
              </div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>{report.content}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Reported by: {report.reporter} • {report.date}
              </div>
            </div>

            {report.status === 'pending' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleAction(report.id, 'approve')}
                  style={{
                    padding: '8px 16px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}
                >
                  Resolve
                </button>
                <button
                  onClick={() => handleAction(report.id, 'dismiss')}
                  style={{
                    padding: '8px 16px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
