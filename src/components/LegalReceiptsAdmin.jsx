/* eslint-disable */
import React, { useState, useEffect } from 'react';
import './LegalReceiptsAdmin.css';

export function LegalReceiptsAdmin({ userId, isAdmin }) {
  const [receipts, setReceipts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      loadReceipts();
      loadStats();
    }
  }, [isAdmin]);

  const loadReceipts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/legal-receipts/admin/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setReceipts(data.receipts || []);
    } catch (error) {
      console.error('Error loading receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/legal-receipts/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredReceipts = receipts.filter(receipt => 
    receipt.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.receipt_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadReceipt = async (receiptId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/legal-receipts/admin/download/${receiptId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receiptId}.pdf`;
      a.click();
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt');
    }
  };

  const viewDetails = async (receiptId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/legal-receipts/admin/details/${receiptId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      setSelectedReceipt(data);
    } catch (error) {
      console.error('Error loading receipt details:', error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="admin-denied">
        <h2>🔒 Access Denied</h2>
        <p>Admin privileges required</p>
      </div>
    );
  }

  if (loading) {
    return <div className="admin-loading">Loading receipts...</div>;
  }

  return (
    <div className="legal-receipts-admin">
      <div className="admin-header">
        <h1>📋 Legal Receipts Administration</h1>
        <p>Immutable receipt management and audit trail</p>
      </div>

      {stats && (
        <div className="admin-stats">
          <div className="stat-card">
            <h3>{stats.total_receipts?.toLocaleString() || 0}</h3>
            <p>Total Receipts</p>
          </div>
          <div className="stat-card">
            <h3>{stats.this_month?.toLocaleString() || 0}</h3>
            <p>This Month</p>
          </div>
          <div className="stat-card">
            <h3>{stats.with_legal_hold?.toLocaleString() || 0}</h3>
            <p>Legal Holds</p>
          </div>
          <div className="stat-card">
            <h3>{stats.needing_extension?.toLocaleString() || 0}</h3>
            <p>Need Extension</p>
          </div>
        </div>
      )}

      <div className="admin-search">
        <input
          type="text"
          placeholder="🔍 Search by email, receipt ID, or user ID..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <button onClick={loadReceipts} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      <div className="receipts-table-container">
        <table className="receipts-table">
          <thead>
            <tr>
              <th>Receipt ID</th>
              <th>Email</th>
              <th>Accepted At</th>
              <th>Terms Version</th>
              <th>IP Address</th>
              <th>Retain Until</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReceipts.map(receipt => (
              <tr key={receipt.receipt_id}>
                <td className="mono">{receipt.receipt_id?.slice(0, 16)}...</td>
                <td>{receipt.email}</td>
                <td>{new Date(receipt.accepted_at).toLocaleString()}</td>
                <td>{receipt.terms_version}</td>
                <td className="mono">{receipt.ip_address}</td>
                <td>{new Date(receipt.retain_until_date).toLocaleDateString()}</td>
                <td className="actions">
                  <button 
                    onClick={() => viewDetails(receipt.receipt_id)}
                    className="btn-view"
                    title="View Details"
                  >
                    👁️
                  </button>
                  <button 
                    onClick={() => downloadReceipt(receipt.receipt_id)}
                    className="btn-download"
                    title="Download PDF"
                  >
                    📥
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredReceipts.length === 0 && (
          <div className="no-results">
            <p>No receipts found</p>
          </div>
        )}
      </div>

      {selectedReceipt && (
        <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>📄 Receipt Details</h2>
            <div className="receipt-details">
              <div className="detail-row">
                <strong>Receipt ID:</strong>
                <span className="mono">{selectedReceipt.receipt_id}</span>
              </div>
              <div className="detail-row">
                <strong>User ID:</strong>
                <span className="mono">{selectedReceipt.user_id}</span>
              </div>
              <div className="detail-row">
                <strong>Email:</strong>
                <span>{selectedReceipt.email}</span>
              </div>
              <div className="detail-row">
                <strong>Accepted:</strong>
                <span>{new Date(selectedReceipt.accepted_at).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <strong>IP Address:</strong>
                <span className="mono">{selectedReceipt.ip_address}</span>
              </div>
              <div className="detail-row">
                <strong>User Agent:</strong>
                <span className="small">{selectedReceipt.user_agent}</span>
              </div>
              <div className="detail-row">
                <strong>Terms Hash:</strong>
                <span className="mono small">{selectedReceipt.terms_hash}</span>
              </div>
              <div className="detail-row">
                <strong>Document Hash:</strong>
                <span className="mono small">{selectedReceipt.document_hash}</span>
              </div>
              <div className="detail-row">
                <strong>S3 Key:</strong>
                <span className="mono small">{selectedReceipt.s3_key}</span>
              </div>
              <div className="detail-row">
                <strong>S3 Version:</strong>
                <span className="mono small">{selectedReceipt.s3_version_id}</span>
              </div>
              <div className="detail-row">
                <strong>Retain Until:</strong>
                <span>{new Date(selectedReceipt.retain_until_date).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <strong>Legal Hold:</strong>
                <span className={selectedReceipt.legal_hold ? 'hold-active' : 'hold-inactive'}>
                  {selectedReceipt.legal_hold ? '🔒 Active' : '🔓 Inactive'}
                </span>
              </div>
            </div>
            <button onClick={() => setSelectedReceipt(null)} className="btn-close">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
