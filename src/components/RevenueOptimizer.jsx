/* eslint-disable */
import React, { useState, useEffect } from 'react';
import './RevenueOptimizer.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Revenue Optimizer Component
 * AI-powered forecasting, pricing recommendations, A/B testing, insights
 */
export default function RevenueOptimizer() {
    const [activeTab, setActiveTab] = useState('forecast'); // forecast, pricing, ab-tests, insights, churn
    const [forecast, setForecast] = useState(null);
    const [pricingRec, setPricingRec] = useState(null);
    const [abTests, setAbTests] = useState([]);
    const [insights, setInsights] = useState(null);
    const [churnRisk, setChurnRisk] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const userId = localStorage.getItem('userId');
    const isCreator = localStorage.getItem('userTier') !== 'free';

    useEffect(() => {
        if (userId && isCreator) {
            loadForecast(6); // Default 6 months
            loadInsights();
            loadChurnRisk();
        }
    }, []);

    const loadForecast = async (months) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/revenue-optimizer/forecast/${userId}?months=${months}`);
            const data = await response.json();
            setForecast(data);
        } catch (error) {
            console.error('Failed to load forecast:', error);
        }
        setLoading(false);
    };

    const loadPricingRecommendation = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/revenue-optimizer/pricing-recommendation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    creatorId: userId,
                    currentPrice: 10, // Example
                    contentType: 'subscription',
                    followerCount: 5000,
                    engagementRate: 4.2
                })
            });
            const data = await response.json();
            setPricingRec(data);
        } catch (error) {
            console.error('Failed to load pricing recommendation:', error);
        }
        setLoading(false);
    };

    const loadInsights = async () => {
        try {
            const response = await fetch(`${API_URL}/api/revenue-optimizer/insights/${userId}`);
            const data = await response.json();
            setInsights(data);
        } catch (error) {
            console.error('Failed to load insights:', error);
        }
    };

    const loadChurnRisk = async () => {
        try {
            const response = await fetch(`${API_URL}/api/revenue-optimizer/churn-risk/${userId}`);
            const data = await response.json();
            setChurnRisk(data);
        } catch (error) {
            console.error('Failed to load churn risk:', error);
        }
    };

    const handleCreateABTest = async () => {
        const variantA = prompt('Variant A (e.g., $9.99):');
        const variantB = prompt('Variant B (e.g., $14.99):');
        const metric = prompt('Success metric (e.g., conversion, revenue):');
        const duration = prompt('Duration (days):');
        
        if (!variantA || !variantB || !metric || !duration) return;

        try {
            const response = await fetch(`${API_URL}/api/revenue-optimizer/ab-test/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    creatorId: userId,
                    testName: `Price Test: ${variantA} vs ${variantB}`,
                    variantA,
                    variantB,
                    successMetric: metric,
                    durationDays: parseInt(duration)
                })
            });
            if (response.ok) {
                alert('A/B test created!');
                // Reload tests
            }
        } catch (error) {
            console.error('Failed to create A/B test:', error);
        }
    };

    if (!isCreator) {
        return (
            <div className="revenue-optimizer-container">
                <div className="upgrade-prompt">
                    <h2>🚀 Revenue Optimizer</h2>
                    <p>Upgrade to creator tier to access AI-powered revenue optimization tools</p>
                    <button className="upgrade-btn">Upgrade Now</button>
                </div>
            </div>
        );
    }

    return (
        <div className="revenue-optimizer-container">
            <div className="optimizer-header">
                <h1>💰 Revenue Optimizer</h1>
                <p>AI-powered insights to maximize your earnings</p>
            </div>

            <div className="optimizer-tabs">
                <button 
                    className={activeTab === 'forecast' ? 'active' : ''}
                    onClick={() => setActiveTab('forecast')}
                >
                    📈 Forecast
                </button>
                <button 
                    className={activeTab === 'pricing' ? 'active' : ''}
                    onClick={() => { setActiveTab('pricing'); loadPricingRecommendation(); }}
                >
                    💵 Pricing
                </button>
                <button 
                    className={activeTab === 'ab-tests' ? 'active' : ''}
                    onClick={() => setActiveTab('ab-tests')}
                >
                    🧪 A/B Tests
                </button>
                <button 
                    className={activeTab === 'insights' ? 'active' : ''}
                    onClick={() => setActiveTab('insights')}
                >
                    💡 Insights
                </button>
                <button 
                    className={activeTab === 'churn' ? 'active' : ''}
                    onClick={() => setActiveTab('churn')}
                >
                    ⚠️ Churn Risk
                </button>
            </div>

            {activeTab === 'forecast' && (
                <div className="forecast-section">
                    <div className="section-header">
                        <h2>Revenue Forecast</h2>
                        <div className="timeframe-selector">
                            <button onClick={() => loadForecast(3)}>3 Months</button>
                            <button onClick={() => loadForecast(6)} className="active">6 Months</button>
                            <button onClick={() => loadForecast(12)}>12 Months</button>
                        </div>
                    </div>
                    {loading ? (
                        <div className="loading">Calculating forecast...</div>
                    ) : forecast ? (
                        <div className="forecast-content">
                            <div className="forecast-summary">
                                <div className="summary-card">
                                    <div className="label">Current Monthly</div>
                                    <div className="value">${forecast.currentMonthlyRevenue?.toLocaleString() || 0}</div>
                                </div>
                                <div className="summary-card">
                                    <div className="label">Projected ({forecast.months}mo)</div>
                                    <div className="value">${forecast.projectedRevenue?.toLocaleString() || 0}</div>
                                </div>
                                <div className="summary-card">
                                    <div className="label">Growth Rate</div>
                                    <div className="value">{forecast.growthRate?.toFixed(2)}%</div>
                                </div>
                                <div className="summary-card">
                                    <div className="label">Confidence</div>
                                    <div className="value">{forecast.confidence || 'Medium'}</div>
                                </div>
                            </div>
                            <div className="forecast-chart">
                                <h3>Revenue Projection</h3>
                                <div className="chart-placeholder">
                                    {forecast.monthlyBreakdown?.map((month, i) => (
                                        <div key={i} className="chart-bar">
                                            <div 
                                                className="bar-fill" 
                                                style={{ 
                                                    height: `${(month.revenue / forecast.projectedRevenue) * 100}%` 
                                                }}
                                            ></div>
                                            <div className="bar-label">${(month.revenue / 1000).toFixed(1)}k</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">No forecast data available</div>
                    )}
                </div>
            )}

            {activeTab === 'pricing' && (
                <div className="pricing-section">
                    <h2>AI Pricing Recommendations</h2>
                    {loading ? (
                        <div className="loading">Analyzing pricing...</div>
                    ) : pricingRec ? (
                        <div className="pricing-content">
                            <div className="recommendation-card">
                                <div className="rec-header">
                                    <h3>Recommended Price</h3>
                                    <div className="price-display">${pricingRec.recommendedPrice}</div>
                                </div>
                                <div className="rec-reasoning">
                                    <strong>Why this price?</strong>
                                    <p>{pricingRec.reasoning}</p>
                                </div>
                                <div className="rec-comparison">
                                    <div className="comparison-item">
                                        <div className="label">Current Price</div>
                                        <div className="value">${pricingRec.currentPrice}</div>
                                    </div>
                                    <div className="comparison-item">
                                        <div className="label">Recommended</div>
                                        <div className="value">${pricingRec.recommendedPrice}</div>
                                    </div>
                                    <div className="comparison-item">
                                        <div className="label">Est. Impact</div>
                                        <div className="value positive">+{pricingRec.estimatedImpact}%</div>
                                    </div>
                                </div>
                                <button className="apply-btn">Apply This Price</button>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <button className="generate-btn" onClick={loadPricingRecommendation}>
                                Generate Pricing Recommendation
                            </button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'ab-tests' && (
                <div className="ab-tests-section">
                    <div className="section-header">
                        <h2>A/B Tests</h2>
                        <button className="create-btn" onClick={handleCreateABTest}>
                            + Create Test
                        </button>
                    </div>
                    <div className="tests-list">
                        {abTests.map(test => (
                            <div key={test.id} className="test-card">
                                <div className="test-header">
                                    <h3>{test.test_name}</h3>
                                    <span className={`status-badge ${test.status}`}>{test.status}</span>
                                </div>
                                <div className="test-variants">
                                    <div className="variant">
                                        <div className="variant-label">Variant A</div>
                                        <div className="variant-value">{test.variant_a}</div>
                                        <div className="variant-stats">
                                            <span>Impressions: {test.impressions_a}</span>
                                            <span>Conversions: {test.conversions_a}</span>
                                            <span>Rate: {test.conversion_rate_a?.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                    <div className="vs">VS</div>
                                    <div className="variant">
                                        <div className="variant-label">Variant B</div>
                                        <div className="variant-value">{test.variant_b}</div>
                                        <div className="variant-stats">
                                            <span>Impressions: {test.impressions_b}</span>
                                            <span>Conversions: {test.conversions_b}</span>
                                            <span>Rate: {test.conversion_rate_b?.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                </div>
                                {test.winner && (
                                    <div className="test-winner">
                                        🏆 Winner: Variant {test.winner.toUpperCase()}
                                    </div>
                                )}
                            </div>
                        ))}
                        {abTests.length === 0 && (
                            <div className="empty-state">
                                <p>No A/B tests yet. Create one to optimize your pricing!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'insights' && (
                <div className="insights-section">
                    <h2>AI Revenue Insights</h2>
                    {insights ? (
                        <div className="insights-content">
                            <div className="insight-card priority-high">
                                <div className="insight-icon">🎯</div>
                                <div className="insight-content">
                                    <h3>Top Opportunity</h3>
                                    <p>{insights.opportunities?.[0]}</p>
                                    <div className="recommended-action">
                                        <strong>Recommended Action:</strong>
                                        <p>{insights.actions?.[0]}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="insights-grid">
                                {insights.opportunities?.slice(1).map((opp, i) => (
                                    <div key={i} className="insight-card">
                                        <div className="insight-icon">💡</div>
                                        <div className="insight-content">
                                            <p>{opp}</p>
                                            <div className="insight-action">{insights.actions?.[i + 1]}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="loading">Analyzing your revenue data...</div>
                    )}
                </div>
            )}

            {activeTab === 'churn' && (
                <div className="churn-section">
                    <h2>Subscriber Churn Risk</h2>
                    {churnRisk ? (
                        <div className="churn-content">
                            <div className="churn-summary">
                                <div className="risk-gauge">
                                    <div className={`gauge-level ${churnRisk.riskLevel}`}>
                                        <div className="gauge-value">{churnRisk.riskScore?.toFixed(1)}</div>
                                        <div className="gauge-label">{churnRisk.riskLevel} Risk</div>
                                    </div>
                                </div>
                            </div>
                            <div className="at-risk-subscribers">
                                <h3>At-Risk Subscribers</h3>
                                <div className="subscribers-list">
                                    {churnRisk.atRiskSubscribers?.map((sub, i) => (
                                        <div key={i} className="subscriber-card">
                                            <div className="subscriber-info">
                                                <span className="username">{sub.username}</span>
                                                <span className="risk-badge">{sub.riskLevel}</span>
                                            </div>
                                            <div className="subscriber-meta">
                                                <span>Last seen: {sub.daysSinceLastSeen} days ago</span>
                                                <span>Subscribed: {sub.subscriptionAge} days</span>
                                            </div>
                                            <button className="reach-out-btn">Reach Out</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="loading">Analyzing churn risk...</div>
                    )}
                </div>
            )}
        </div>
    );
}
