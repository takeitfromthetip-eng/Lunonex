/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import './ABTestingFramework.css';

/**
 * A/B Testing Framework
 * Built-in experimentation system for features, pricing, UI
 */
export const ABTestingFramework = ({ userId, userTier }) => {
  const [experiments, setExperiments] = useState([]);
  const [activeExperiments, setActiveExperiments] = useState([]);
  const [results, setResults] = useState({});
  const [creatingExperiment, setCreatingExperiment] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState(null);

  useEffect(() => {
    loadExperiments();
    checkActiveExperiments();
  }, [userId]);

  const loadExperiments = async () => {
    try {
      const response = await fetch('/api/experiments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setExperiments(data.experiments);
      } else {
        // Use mock data for development
        setExperiments(generateMockExperiments());
      }
    } catch (error) {
      console.error('Failed to load experiments:', error);
      setExperiments(generateMockExperiments());
    }
  };

  const generateMockExperiments = () => [
    {
      id: 'exp-001',
      name: 'New Pricing Model',
      description: 'Test $4.99 vs $5.99 basic tier pricing',
      status: 'active',
      type: 'pricing',
      variants: [
        { id: 'A', name: 'Control ($5.99)', traffic: 50, conversions: 234, views: 1240 },
        { id: 'B', name: 'Test ($4.99)', traffic: 50, conversions: 289, views: 1198 }
      ],
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      metrics: ['conversion_rate', 'revenue', 'user_satisfaction'],
      winner: null
    },
    {
      id: 'exp-002',
      name: 'CTA Button Color',
      description: 'Test purple vs green "Subscribe" button',
      status: 'completed',
      type: 'ui',
      variants: [
        { id: 'A', name: 'Purple Button', traffic: 50, conversions: 567, views: 2340 },
        { id: 'B', name: 'Green Button', traffic: 50, conversions: 612, views: 2298 }
      ],
      startDate: '2024-01-01',
      endDate: '2024-01-14',
      metrics: ['click_rate', 'conversion_rate'],
      winner: 'B',
      improvement: 7.9
    },
    {
      id: 'exp-003',
      name: 'Onboarding Flow',
      description: 'Single page vs multi-step onboarding',
      status: 'draft',
      type: 'feature',
      variants: [
        { id: 'A', name: 'Single Page', traffic: 50, conversions: 0, views: 0 },
        { id: 'B', name: 'Multi-Step', traffic: 50, conversions: 0, views: 0 }
      ],
      startDate: null,
      endDate: null,
      metrics: ['completion_rate', 'time_to_complete', 'drop_off_rate']
    }
  ];

  const checkActiveExperiments = () => {
    // Check which experiments user is enrolled in
    const enrolled = getEnrolledExperiments(userId);
    setActiveExperiments(enrolled);
  };

  const getEnrolledExperiments = (userId) => {
    // Use consistent hashing to assign users to variants
    const active = experiments.filter(exp => exp.status === 'active');
    
    return active.map(exp => {
      const variantId = assignVariant(userId, exp.id, exp.variants);
      return {
        experimentId: exp.id,
        experimentName: exp.name,
        variantId: variantId,
        variantName: exp.variants.find(v => v.id === variantId)?.name
      };
    });
  };

  const assignVariant = (userId, experimentId, variants) => {
    // Consistent hash-based assignment
    const hash = simpleHash(userId + experimentId);
    const buckets = variants.reduce((acc, v) => acc + v.traffic, 0);
    const bucket = hash % buckets;
    
    let cumulative = 0;
    for (const variant of variants) {
      cumulative += variant.traffic;
      if (bucket < cumulative) {
        return variant.id;
      }
    }
    
    return variants[0].id; // Fallback
  };

  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  const createExperiment = async (experimentData) => {
    try {
      const response = await fetch('/api/experiments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(experimentData)
      });
      
      const data = await response.json();
      if (data.success) {
        setExperiments(prev => [...prev, data.experiment]);
        setCreatingExperiment(false);
      }
    } catch (error) {
      console.error('Failed to create experiment:', error);
    }
  };

  const startExperiment = async (experimentId) => {
    try {
      await fetch(`/api/experiments/${experimentId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setExperiments(prev => prev.map(exp => 
        exp.id === experimentId ? { ...exp, status: 'active' } : exp
      ));
    } catch (error) {
      console.error('Failed to start experiment:', error);
    }
  };

  const stopExperiment = async (experimentId) => {
    try {
      await fetch(`/api/experiments/${experimentId}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setExperiments(prev => prev.map(exp => 
        exp.id === experimentId ? { ...exp, status: 'completed' } : exp
      ));
    } catch (error) {
      console.error('Failed to stop experiment:', error);
    }
  };

  const calculateSignificance = (variantA, variantB) => {
    const rateA = variantA.conversions / variantA.views;
    const rateB = variantB.conversions / variantB.views;
    
    // Simplified z-test for proportions
    const pooledRate = (variantA.conversions + variantB.conversions) / (variantA.views + variantB.views);
    const se = Math.sqrt(pooledRate * (1 - pooledRate) * (1/variantA.views + 1/variantB.views));
    const z = Math.abs((rateA - rateB) / se);
    
    // p-value approximation (95% confidence = z > 1.96)
    const significant = z > 1.96;
    const pValue = 2 * (1 - normalCDF(Math.abs(z)));
    
    return {
      significant,
      zScore: z.toFixed(2),
      pValue: pValue.toFixed(4),
      confidence: ((1 - pValue) * 100).toFixed(1)
    };
  };

  const normalCDF = (x) => {
    // Approximation of normal cumulative distribution function
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - prob : prob;
  };

  const declareWinner = (experimentId, winnerId) => {
    setExperiments(prev => prev.map(exp => 
      exp.id === experimentId ? { ...exp, winner: winnerId, status: 'completed' } : exp
    ));
  };

  return (
    <div className="ab-testing-framework">
      <div className="framework-header">
        <div>
          <h2>🎯 A/B Testing Framework</h2>
          <p>Run experiments to optimize conversions</p>
        </div>
        <button 
          className="create-experiment-btn"
          onClick={() => setCreatingExperiment(true)}
        >
          + New Experiment
        </button>
      </div>

      {/* Active Experiments Alert */}
      {activeExperiments.length > 0 && (
        <div className="active-experiments-alert">
          <h3>🔬 You're enrolled in {activeExperiments.length} active experiment(s):</h3>
          <ul>
            {activeExperiments.map(exp => (
              <li key={exp.experimentId}>
                <strong>{exp.experimentName}</strong> - Variant: {exp.variantName}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Experiments List */}
      <div className="experiments-tabs">
        <button className="active">All ({experiments.length})</button>
        <button>Active ({experiments.filter(e => e.status === 'active').length})</button>
        <button>Completed ({experiments.filter(e => e.status === 'completed').length})</button>
        <button>Drafts ({experiments.filter(e => e.status === 'draft').length})</button>
      </div>

      <div className="experiments-list">
        {experiments.map(experiment => (
          <ExperimentCard
            key={experiment.id}
            experiment={experiment}
            onStart={() => startExperiment(experiment.id)}
            onStop={() => stopExperiment(experiment.id)}
            onViewDetails={() => setSelectedExperiment(experiment)}
            onDeclareWinner={declareWinner}
            calculateSignificance={calculateSignificance}
          />
        ))}
      </div>

      {/* Experiment Details Modal */}
      {selectedExperiment && (
        <ExperimentDetails
          experiment={selectedExperiment}
          onClose={() => setSelectedExperiment(null)}
          calculateSignificance={calculateSignificance}
        />
      )}

      {/* Create Experiment Modal */}
      {creatingExperiment && (
        <CreateExperimentModal
          onClose={() => setCreatingExperiment(false)}
          onCreate={createExperiment}
        />
      )}
    </div>
  );
};

/**
 * Experiment Card Component
 */
const ExperimentCard = ({ experiment, onStart, onStop, onViewDetails, onDeclareWinner, calculateSignificance }) => {
  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'green', text: '🟢 Active' },
      completed: { color: 'blue', text: '✅ Completed' },
      draft: { color: 'gray', text: '📝 Draft' }
    };
    return badges[status] || badges.draft;
  };

  const variantA = experiment.variants[0];
  const variantB = experiment.variants[1];
  const conversionRateA = variantA.views > 0 ? (variantA.conversions / variantA.views * 100).toFixed(2) : 0;
  const conversionRateB = variantB.views > 0 ? (variantB.conversions / variantB.views * 100).toFixed(2) : 0;

  const significance = experiment.status === 'active' && variantA.views > 100 
    ? calculateSignificance(variantA, variantB) 
    : null;

  return (
    <div className={`experiment-card status-${experiment.status}`}>
      <div className="experiment-header">
        <div>
          <h3>{experiment.name}</h3>
          <p className="experiment-description">{experiment.description}</p>
        </div>
        <span className={`status-badge ${getStatusBadge(experiment.status).color}`}>
          {getStatusBadge(experiment.status).text}
        </span>
      </div>

      <div className="variants-comparison">
        <div className="variant-column">
          <h4>Variant A: {variantA.name}</h4>
          <div className="variant-stats">
            <div className="stat">
              <span className="stat-label">Views</span>
              <span className="stat-value">{variantA.views.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Conversions</span>
              <span className="stat-value">{variantA.conversions.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Rate</span>
              <span className="stat-value">{conversionRateA}%</span>
            </div>
          </div>
        </div>

        <div className="vs-divider">vs</div>

        <div className="variant-column">
          <h4>Variant B: {variantB.name}</h4>
          <div className="variant-stats">
            <div className="stat">
              <span className="stat-label">Views</span>
              <span className="stat-value">{variantB.views.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Conversions</span>
              <span className="stat-value">{variantB.conversions.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Rate</span>
              <span className="stat-value">{conversionRateB}%</span>
            </div>
          </div>
        </div>
      </div>

      {significance && (
        <div className={`significance-banner ${significance.significant ? 'significant' : 'not-significant'}`}>
          {significance.significant ? (
            <>
              ✅ <strong>Statistically Significant!</strong> (p = {significance.pValue}, {significance.confidence}% confidence)
            </>
          ) : (
            <>
              ⏳ Not yet significant (need more data for {significance.confidence}% confidence)
            </>
          )}
        </div>
      )}

      {experiment.winner && (
        <div className="winner-banner">
          🏆 Winner: Variant {experiment.winner} (+{experiment.improvement}% improvement)
        </div>
      )}

      <div className="experiment-actions">
        {experiment.status === 'draft' && (
          <button className="action-btn start-btn" onClick={onStart}>
            ▶️ Start Experiment
          </button>
        )}
        {experiment.status === 'active' && (
          <>
            <button className="action-btn stop-btn" onClick={onStop}>
              ⏹️ Stop Experiment
            </button>
            {significance?.significant && (
              <button 
                className="action-btn winner-btn"
                onClick={() => {
                  const winner = conversionRateB > conversionRateA ? 'B' : 'A';
                  onDeclareWinner(experiment.id, winner);
                }}
              >
                🏆 Declare Winner
              </button>
            )}
          </>
        )}
        <button className="action-btn details-btn" onClick={onViewDetails}>
          📊 View Details
        </button>
      </div>
    </div>
  );
};

/**
 * Experiment Details Modal (placeholder)
 */
const ExperimentDetails = ({ experiment, onClose, calculateSignificance }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h2>{experiment.name}</h2>
      <p>Detailed analytics coming soon...</p>
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);

/**
 * Create Experiment Modal (placeholder)
 */
const CreateExperimentModal = ({ onClose, onCreate }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h2>Create New Experiment</h2>
      <p>Experiment creation form coming soon...</p>
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);

export default ABTestingFramework;
