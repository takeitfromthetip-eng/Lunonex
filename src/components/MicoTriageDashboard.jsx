import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkTierAccess } from '../utils/tierAccess';
import { supabase } from '../lib/supabase';

/**
 * OWNER-ONLY Dashboard to view Mico's bug triage
 * Shows what Mico decided about each bug report
 */
export default function MicoTriageDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all'); // all, legitimate, spam, malicious
  const [loading, setLoading] = useState(true);

  const tierAccess = checkTierAccess(user?.id, user?.tier, user?.email);

  // Only owner can see this
  if (!tierAccess.isOwner) return null;

  useEffect(() => {
    loadBugReports();
  }, [filter]);

  const loadBugReports = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('bug_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Failed to load bug reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fb923c',
      triaged: '#3b82f6',
      pending_fix: '#8b5cf6',
      fixed: '#10b981',
      discarded: '#6b7280',
      spam: '#ef4444',
      malicious: '#dc2626'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#dc2626',
      high: '#f97316',
      medium: '#eab308',
      low: '#3b82f6',
      none: '#6b7280'
    };
    return colors[priority] || '#6b7280';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.95)',
      zIndex: 10000,
      overflowY: 'auto',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', color: 'white' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>
          🧠 Mico Bug Triage Dashboard
        </h1>
        <p style={{ opacity: 0.7, marginBottom: '30px' }}>
          Mico automatically analyzes bug reports and decides: Legitimate, Spam, or Malicious
        </p>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'triaged', 'legitimate', 'spam', 'malicious', 'fixed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '10px 20px',
                background: filter === f ? '#667eea' : 'rgba(255,255,255,0.1)',
                border: filter === f ? '2px solid #667eea' : '2px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontWeight: filter === f ? 'bold' : 'normal'
              }}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.2)',
            border: '2px solid rgba(59, 130, 246, 0.5)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#3b82f6' }}>
              {reports.filter(r => r.status === 'triaged' || r.status === 'legitimate').length}
            </div>
            <div style={{ opacity: 0.8 }}>Legitimate Bugs</div>
          </div>

          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '2px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ef4444' }}>
              {reports.filter(r => r.status === 'spam').length}
            </div>
            <div style={{ opacity: 0.8 }}>Spam/Crap</div>
          </div>

          <div style={{
            background: 'rgba(220, 38, 38, 0.2)',
            border: '2px solid rgba(220, 38, 38, 0.5)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#dc2626' }}>
              {reports.filter(r => r.status === 'malicious').length}
            </div>
            <div style={{ opacity: 0.8 }}>Malicious Attempts</div>
          </div>

          <div style={{
            background: 'rgba(16, 185, 129, 0.2)',
            border: '2px solid rgba(16, 185, 129, 0.5)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981' }}>
              {reports.filter(r => r.status === 'fixed').length}
            </div>
            <div style={{ opacity: 0.8 }}>Fixed</div>
          </div>
        </div>

        {/* Bug Reports List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
            <div>Loading bug reports...</div>
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
            <div>No bug reports found</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reports.map(report => (
              <div
                key={report.id}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: `2px solid ${getStatusColor(report.status)}`,
                  borderRadius: '12px',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        padding: '4px 12px',
                        background: getStatusColor(report.status),
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {report.status}
                      </span>

                      {report.priority && report.priority !== 'none' && (
                        <span style={{
                          padding: '4px 12px',
                          background: getPriorityColor(report.priority),
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {report.priority}
                        </span>
                      )}

                      {report.category && (
                        <span style={{
                          padding: '4px 12px',
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          opacity: 0.8
                        }}>
                          {report.category}
                        </span>
                      )}

                      {report.auto_fixable && (
                        <span style={{
                          padding: '4px 12px',
                          background: 'rgba(16, 185, 129, 0.3)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#10b981'
                        }}>
                          ✨ Auto-fixable
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '12px', opacity: 0.6 }}>
                      From: {report.email || 'Anonymous'} ({report.tier || 'FREE'})
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.6 }}>
                      {new Date(report.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <strong>Description:</strong>
                  <div style={{
                    marginTop: '8px',
                    padding: '12px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '6px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {report.description}
                  </div>
                </div>

                {report.url && (
                  <div style={{ marginBottom: '15px', fontSize: '13px', opacity: 0.7 }}>
                    <strong>URL:</strong> {report.url}
                  </div>
                )}

                {report.mico_analysis && (
                  <div style={{
                    marginTop: '15px',
                    padding: '15px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    border: '2px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#667eea' }}>
                      🧠 Mico's Analysis:
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <strong>Reasoning:</strong>
                      <div style={{ marginTop: '5px', opacity: 0.9 }}>
                        {report.mico_analysis.reasoning}
                      </div>
                    </div>

                    {report.mico_analysis.suggested_fix && (
                      <div>
                        <strong>Suggested Fix:</strong>
                        <div style={{ marginTop: '5px', opacity: 0.9 }}>
                          {report.mico_analysis.suggested_fix}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {report.logs && report.logs.length > 0 && (
                  <details style={{ marginTop: '15px' }}>
                    <summary style={{ cursor: 'pointer', opacity: 0.7 }}>
                      View Logs ({report.logs.length})
                    </summary>
                    <div style={{
                      marginTop: '10px',
                      padding: '12px',
                      background: 'rgba(0,0,0,0.5)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {report.logs.map((log, idx) => (
                        <div key={idx} style={{ marginBottom: '8px' }}>
                          <span style={{ color: log.type === 'error' ? '#ef4444' : '#fb923c' }}>
                            [{log.type}]
                          </span> {log.message}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
