import React, { useState } from 'react';
import { reportBug, getBugReportContext } from '../utils/githubBugReporter';

/**
 * BugReporter - Always-accessible bug reporting button
 * Users can report bugs which auto-create GitHub Issues
 * AI will attempt to fix them automatically
 */
const BugReporter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [category, setCategory] = useState('frontend');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [issueUrl, setIssueUrl] = useState('');

  const handleSubmit = async () => {
    if (!title || !description) {
      alert('Please fill in title and description');
      return;
    }

    setSubmitting(true);

    try {
      // Use new GitHub bug reporter
      const result = await reportBug({
        title,
        description,
        severity,
        category,
        stepsToReproduce: steps,
        context: getBugReportContext(),
      });

      if (result.success) {
        setSubmitted(true);
        if (result.github?.issueUrl) {
          setIssueUrl(result.github.issueUrl);
        }
        
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
          setTitle('');
          setDescription('');
          setSteps('');
          setSeverity('medium');
          setCategory('frontend');
          setIssueUrl('');
        }, 5000);
      } else {
        alert('Failed to submit bug report. Please try again.');
      }
    } catch (error) {
      console.error('Bug report error:', error);
      alert('Failed to submit bug report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Bug Report Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a6f)',
          color: 'white',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(255, 107, 107, 0.4)',
          zIndex: 9999,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        title="Report a Bug"
      >
        🐛
      </button>

      {/* Bug Report Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            {!submitted ? (
              <>
                <h2 style={{ color: '#ff6b6b', marginBottom: '10px' }}>
                  🐛 Report a Bug
                </h2>
                <p style={{ color: '#666', marginBottom: '25px', fontSize: '0.9rem' }}>
                  Your report will be automatically reviewed and fixed by our AI system
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                    Bug Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of the issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                    What went wrong? *
                  </label>
                  <textarea
                    placeholder="Describe what happened..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                    Steps to Reproduce (Optional)
                  </label>
                  <textarea
                    placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                      Severity
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                      }}
                    >
                      <option value="frontend">Frontend/UI</option>
                      <option value="backend">Backend/API</option>
                      <option value="performance">Performance</option>
                      <option value="ui">Design/UX</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: submitting ? '#ccc' : '#ff6b6b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? 'Submitting...' : '🚀 Submit Bug Report'}
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
                <h3 style={{ color: '#28a745', marginBottom: '10px' }}>Report Submitted!</h3>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                  Bug report created as GitHub Issue.
                  {issueUrl && (
                    <>
                      <br />
                      <a 
                        href={issueUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#ff6b6b', textDecoration: 'underline' }}
                      >
                        View Issue on GitHub
                      </a>
                    </>
                  )}
                </p>
                <p style={{ color: '#999', fontSize: '0.9rem' }}>
                  Our team will review and fix this ASAP!
                </p>
              </div>
            )}

            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#999',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BugReporter;
