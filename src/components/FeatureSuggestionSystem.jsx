import React, { useState, useEffect } from 'react';

// AI-POWERED FEATURE SUGGESTION SYSTEM
export function FeatureSuggestionSystem({ userId }) {
  const [suggestion, setSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [mySuggestions, setMySuggestions] = useState([]);

  useEffect(() => {
    fetchMySuggestions();
  }, [userId]);

  const handleSubmit = async () => {
    if (!suggestion.trim()) return;

    setSubmitting(true);
    setResult(null);

    try {
      const response = await fetch('/api/suggest-feature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          suggestion,
          userId
        })
      });

      const data = await response.json();
      setResult(data);
      setSuggestion('');
      fetchMySuggestions();
    } catch (err) {
      console.error('Suggestion error:', err);
      setResult({ error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const fetchMySuggestions = async () => {
    try {
      const response = await fetch(`/api/my-suggestions?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setMySuggestions(data.suggestions || []);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    }
  };

  return (
    <div style={{ padding: '40px', background: '#0a0a0a', minHeight: '100vh', color: 'white' }}>
      <h1 style={{
        fontSize: '36px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '10px'
      }}>
        💡 Suggest a Feature
      </h1>

      <p style={{ fontSize: '18px', opacity: 0.8, marginBottom: '40px' }}>
        Our AI will analyze your suggestion, determine if it's feasible, and auto-build it if approved!
      </p>

      {/* Suggestion Form */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '40px',
        marginBottom: '40px'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
          🚀 What feature do you want?
        </h2>

        <textarea
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          placeholder="Example: I want a feature that lets me stream my VR content to Twitch and YouTube simultaneously with custom overlays..."
          style={{
            width: '100%',
            minHeight: '150px',
            padding: '20px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '16px',
            background: 'rgba(255,255,255,0.9)',
            color: '#333',
            resize: 'vertical',
            marginBottom: '20px'
          }}
        />

        <div style={{
          display: 'flex',
          gap: '15px',
          alignItems: 'center'
        }}>
          <button
            onClick={handleSubmit}
            disabled={submitting || !suggestion.trim()}
            style={{
              flex: 1,
              background: submitting ? 'rgba(255,255,255,0.3)' : 'white',
              color: submitting ? 'white' : '#667eea',
              border: 'none',
              padding: '18px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? '🤖 AI Analyzing...' : '✨ Submit Suggestion'}
          </button>

          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '15px 25px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Characters</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {suggestion.length}
            </div>
          </div>
        </div>

        {/* AI Analysis Result */}
        {result && (
          <AIAnalysisResult result={result} />
        )}
      </div>

      {/* My Suggestions List */}
      <MySuggestionsList suggestions={mySuggestions} />

      {/* How It Works */}
      <HowItWorks />
    </div>
  );
}

function AIAnalysisResult({ result }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'under_review': return '#FF9800';
      case 'rejected': return '#f44336';
      default: return '#2196F3';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✅';
      case 'under_review': return '🔍';
      case 'rejected': return '❌';
      default: return '🤖';
    }
  };

  return (
    <div style={{
      marginTop: '30px',
      background: 'rgba(0,0,0,0.3)',
      borderRadius: '15px',
      padding: '30px',
      border: `2px solid ${getStatusColor(result.status)}`
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '48px' }}>
          {getStatusIcon(result.status)}
        </div>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: '24px',
            color: getStatusColor(result.status)
          }}>
            {result.status === 'approved' && 'Approved & Building!'}
            {result.status === 'under_review' && 'Under Review'}
            {result.status === 'rejected' && 'Not Feasible'}
          </h3>
          <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '5px' }}>
            Analysis completed in {result.analysisTime || '2.3'}s
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '16px', marginBottom: '10px', color: '#667eea' }}>
          🤖 AI Analysis:
        </h4>
        <p style={{ fontSize: '15px', lineHeight: '1.6', opacity: 0.9 }}>
          {result.analysis || result.message}
        </p>
      </div>

      {/* Feasibility Score */}
      {result.feasibilityScore && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>
            Feasibility Score
          </h4>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
            height: '30px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              background: `linear-gradient(90deg, ${getStatusColor(result.status)}, #8BC34A)`,
              height: '100%',
              width: `${result.feasibilityScore}%`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'width 1s'
            }}>
              {result.feasibilityScore}%
            </div>
          </div>
        </div>
      )}

      {/* Estimated Build Time */}
      {result.estimatedTime && (
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '5px' }}>
              Estimated Build Time
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {result.estimatedTime}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '5px' }}>
              Complexity
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {result.complexity || 'Medium'}
            </div>
          </div>
        </div>
      )}

      {/* Build Progress */}
      {result.status === 'approved' && (
        <div style={{
          background: 'rgba(76, 175, 80, 0.2)',
          border: '1px solid #4CAF50',
          borderRadius: '10px',
          padding: '20px',
          marginTop: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <div style={{ fontSize: '24px' }}>🔨</div>
            <strong>AI is building your feature now!</strong>
          </div>

          <div style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.6' }}>
            • Creating components and API endpoints<br/>
            • Running tests and validation<br/>
            • Deploying to production<br/>
            <br/>
            <strong>You'll be notified when it's ready!</strong>
          </div>
        </div>
      )}

      {/* Rejection Reasons */}
      {result.status === 'rejected' && result.reasons && (
        <div style={{
          background: 'rgba(244, 67, 54, 0.2)',
          border: '1px solid #f44336',
          borderRadius: '10px',
          padding: '20px',
          marginTop: '20px'
        }}>
          <strong style={{ marginBottom: '10px', display: 'block' }}>
            Why this was rejected:
          </strong>
          <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
            {result.reasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MySuggestionsList({ suggestions }) {
  if (suggestions.length === 0) return null;

  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>
        📝 My Suggestions ({suggestions.length})
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {suggestions.map(suggestion => (
          <SuggestionCard key={suggestion.id} suggestion={suggestion} />
        ))}
      </div>
    </div>
  );
}

function SuggestionCard({ suggestion }) {
  const statusColors = {
    approved: '#4CAF50',
    building: '#2196F3',
    completed: '#9C27B0',
    under_review: '#FF9800',
    rejected: '#f44336'
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '15px',
      padding: '25px',
      transition: 'transform 0.2s'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '15px'
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>
            {suggestion.title || 'Feature Suggestion'}
          </h3>
          <p style={{ fontSize: '14px', opacity: 0.8, lineHeight: '1.5' }}>
            {suggestion.description}
          </p>
        </div>

        <div style={{
          background: statusColors[suggestion.status] || '#666',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          marginLeft: '20px'
        }}>
          {suggestion.status.replace('_', ' ')}
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '20px',
        fontSize: '13px',
        opacity: 0.7
      }}>
        <span>📅 {new Date(suggestion.createdAt).toLocaleDateString()}</span>
        <span>👍 {suggestion.upvotes || 0} upvotes</span>
        {suggestion.feasibilityScore && (
          <span>📊 {suggestion.feasibilityScore}% feasible</span>
        )}
      </div>

      {suggestion.status === 'completed' && suggestion.deployedUrl && (
        <div style={{ marginTop: '15px' }}>
          <a
            href={suggestion.deployedUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '20px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            🚀 Try New Feature
          </a>
        </div>
      )}
    </div>
  );
}

function HowItWorks() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '20px',
      padding: '40px'
    }}>
      <h2 style={{ fontSize: '28px', marginBottom: '30px' }}>
        🤖 How AI Feature Building Works
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '30px'
      }}>
        {[
          {
            step: '1',
            icon: '✍️',
            title: 'You Submit',
            desc: 'Describe the feature you want in plain English'
          },
          {
            step: '2',
            icon: '🤖',
            title: 'AI Analyzes',
            desc: 'AI checks feasibility, complexity, and value'
          },
          {
            step: '3',
            icon: '⚖️',
            title: 'Auto-Decision',
            desc: 'Approved if feasible & beneficial, rejected if not'
          },
          {
            step: '4',
            icon: '🔨',
            title: 'Auto-Build',
            desc: 'AI generates code, tests it, and deploys'
          },
          {
            step: '5',
            icon: '🚀',
            title: 'Live!',
            desc: 'Feature goes live automatically, you get notified'
          }
        ].map(item => (
          <div key={item.step} style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 15px',
              fontSize: '28px'
            }}>
              {item.icon}
            </div>
            <div style={{
              fontSize: '12px',
              opacity: 0.6,
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>
              STEP {item.step}
            </div>
            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>
              {item.title}
            </h3>
            <p style={{ fontSize: '14px', opacity: 0.8, lineHeight: '1.5' }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '40px',
        padding: '25px',
        background: 'rgba(102, 126, 234, 0.2)',
        borderRadius: '15px',
        border: '1px solid rgba(102, 126, 234, 0.3)'
      }}>
        <strong style={{ fontSize: '16px', display: 'block', marginBottom: '10px' }}>
          💡 Pro Tips:
        </strong>
        <ul style={{ marginLeft: '20px', lineHeight: '1.8', fontSize: '14px' }}>
          <li>Be specific about what you want</li>
          <li>Explain WHY you need it (helps AI understand value)</li>
          <li>Include examples if possible</li>
          <li>Bad suggestions are auto-rejected (spam, impossible, harmful)</li>
          <li>Good suggestions get built in hours, not weeks!</li>
        </ul>
      </div>
    </div>
  );
}
