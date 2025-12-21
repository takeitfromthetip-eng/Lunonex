/* eslint-disable */
import React, { useState, useEffect } from 'react';
import './ApplicationReview.css';

const ApplicationReview = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionType, setDecisionType] = useState(null); // 'approve' or 'reject'
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/creator-applications/list?status=${filter}`);
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDecisionModal = (type) => {
    setDecisionType(type);
    setCustomMessage('');
    setShowDecisionModal(true);
  };

  const handleDecision = async () => {
    if (!selectedApp || !decisionType) return;

    try {
      const response = await fetch('/api/creator-applications/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          decision: decisionType,
          customMessage: customMessage || null,
          reviewedBy: req.user?.id || 'admin', // From auth context
          reviewedAt: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Application ${decisionType}ed successfully! Email sent to applicant.`);
        setShowDecisionModal(false);
        setSelectedApp(null);
        fetchApplications(); // Refresh list
      } else {
        alert(data.error || 'Failed to process decision');
      }
    } catch (error) {
      console.error('Decision error:', error);
      alert('Failed to process decision');
    }
  };

  return (
    <div className="application-review">
      <div className="review-header">
        <h1>Creator Applications</h1>
        <div className="filter-tabs">
          <button 
            className={filter === 'pending' ? 'active' : ''} 
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={filter === 'approved' ? 'active' : ''} 
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button 
            className={filter === 'rejected' ? 'active' : ''} 
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </div>
      </div>

      <div className="review-content">
        {/* Applications List */}
        <div className="applications-list">
          {loading ? (
            <div className="loading">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="empty-state">No applications found</div>
          ) : (
            applications.map((app) => (
              <div 
                key={app.id}
                className={`application-card ${selectedApp?.id === app.id ? 'selected' : ''}`}
                onClick={() => setSelectedApp(app)}
              >
                <div className="app-card-header">
                  <h3>{app.stageName}</h3>
                  <span className={`status-badge ${app.status}`}>{app.status}</span>
                </div>
                <p className="app-card-email">{app.email}</p>
                <p className="app-card-type">{app.contentType}</p>
                <p className="app-card-date">
                  Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Application Details */}
        {selectedApp && (
          <div className="application-details">
            <div className="details-header">
              <h2>{selectedApp.stageName}</h2>
              <span className={`status-badge ${selectedApp.status}`}>
                {selectedApp.status}
              </span>
            </div>

            <div className="details-section">
              <h3>Personal Information</h3>
              <div className="detail-row">
                <span className="label">Full Name:</span>
                <span>{selectedApp.fullName}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span>{selectedApp.email}</span>
              </div>
              {selectedApp.phoneNumber && (
                <div className="detail-row">
                  <span className="label">Phone:</span>
                  <span>{selectedApp.phoneNumber}</span>
                </div>
              )}
            </div>

            <div className="details-section">
              <h3>Content Information</h3>
              <div className="detail-row">
                <span className="label">Content Type:</span>
                <span>{selectedApp.contentType}</span>
              </div>
              <div className="detail-row">
                <span className="label">Monthly Volume:</span>
                <span>{selectedApp.monthlyContentVolume}</span>
              </div>
              <div className="detail-row">
                <span className="label">Adult Content:</span>
                <span>{selectedApp.hasAdultContent ? 'Yes' : 'No'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Total Followers:</span>
                <span>{selectedApp.currentFollowers}</span>
              </div>
              <div className="detail-block">
                <span className="label">Content Description:</span>
                <p>{selectedApp.contentDescription}</p>
              </div>
            </div>

            <div className="details-section">
              <h3>Social Media</h3>
              {Object.entries(selectedApp.socialLinks || {}).map(([platform, link]) => (
                link && (
                  <div key={platform} className="detail-row">
                    <span className="label">{platform}:</span>
                    <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                  </div>
                )
              ))}
            </div>

            <div className="details-section">
              <h3>Why Join ForTheWeebs?</h3>
              <p>{selectedApp.whyJoin}</p>
            </div>

            {selectedApp.status === 'pending' && (
              <div className="decision-actions">
                <button 
                  className="btn-approve" 
                  onClick={() => openDecisionModal('approve')}
                >
                  Approve Application
                </button>
                <button 
                  className="btn-reject" 
                  onClick={() => openDecisionModal('reject')}
                >
                  Reject Application
                </button>
              </div>
            )}

            {selectedApp.status !== 'pending' && selectedApp.reviewedAt && (
              <div className="review-info">
                <p><strong>Reviewed:</strong> {new Date(selectedApp.reviewedAt).toLocaleString()}</p>
                {selectedApp.reviewedBy && <p><strong>Reviewed By:</strong> {selectedApp.reviewedBy}</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {showDecisionModal && (
        <div className="modal-overlay" onClick={() => setShowDecisionModal(false)}>
          <div className="modal-content decision-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDecisionModal(false)}>×</button>
            
            <h2>{decisionType === 'approve' ? 'Approve Application' : 'Reject Application'}</h2>
            
            <p className="modal-description">
              {decisionType === 'approve' 
                ? 'This will send an acceptance email to the applicant with instructions to get started.'
                : 'This will send a rejection email to the applicant. You can optionally include feedback.'}
            </p>

            <div className="form-group">
              <label>Custom Message (Optional)</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows="5"
                placeholder={decisionType === 'approve' 
                  ? 'Add a personal welcome message...'
                  : 'Provide constructive feedback...'}
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowDecisionModal(false)}
              >
                Cancel
              </button>
              <button 
                className={decisionType === 'approve' ? 'btn-approve' : 'btn-reject'}
                onClick={handleDecision}
              >
                Confirm {decisionType === 'approve' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationReview;
