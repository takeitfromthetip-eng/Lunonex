import React, { useState, useEffect } from 'react';
import './Partnerships.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Partnerships Component
 * Brand deals, sponsorships, affiliate programs
 */
export default function Partnerships() {
    const [activeTab, setActiveTab] = useState('opportunities'); // opportunities, deals, affiliates, stats
    const [opportunities, setOpportunities] = useState([]);
    const [myDeals, setMyDeals] = useState([]);
    const [affiliates, setAffiliates] = useState([]);
    const [myAffiliateStats, setMyAffiliateStats] = useState(null);
    const [partnershipStats, setPartnershipStats] = useState({});
    const [loading, setLoading] = useState(false);
    
    const userId = localStorage.getItem('userId');
    const isCreator = localStorage.getItem('userTier') !== 'free';

    useEffect(() => {
        loadOpportunities();
        loadAffiliates();
        if (userId && isCreator) {
            loadMyDeals();
            loadMyAffiliateStats();
            loadPartnershipStats();
        }
    }, []);

    const loadOpportunities = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/partnerships/opportunities`);
            const data = await response.json();
            setOpportunities(data.opportunities || []);
        } catch (error) {
            console.error('Failed to load opportunities:', error);
        }
        setLoading(false);
    };

    const loadMyDeals = async () => {
        try {
            const response = await fetch(`${API_URL}/api/partnerships/my-deals/${userId}`);
            const data = await response.json();
            setMyDeals(data.deals || []);
        } catch (error) {
            console.error('Failed to load deals:', error);
        }
    };

    const loadAffiliates = async () => {
        try {
            const response = await fetch(`${API_URL}/api/partnerships/affiliates`);
            const data = await response.json();
            setAffiliates(data.programs || []);
        } catch (error) {
            console.error('Failed to load affiliates:', error);
        }
    };

    const loadMyAffiliateStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/partnerships/affiliates/my-earnings/${userId}`);
            const data = await response.json();
            setMyAffiliateStats(data);
        } catch (error) {
            console.error('Failed to load affiliate stats:', error);
        }
    };

    const loadPartnershipStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/partnerships/stats/${userId}`);
            const data = await response.json();
            setPartnershipStats(data.stats || {});
        } catch (error) {
            console.error('Failed to load partnership stats:', error);
        }
    };

    const handleApply = async (opportunityId) => {
        if (!isCreator) {
            alert('Only creators can apply for partnerships');
            return;
        }
        const pitch = prompt('Tell the brand why you\'re a great fit (pitch):');
        const portfolio = prompt('Portfolio URL (optional):');
        const compensation = prompt('Desired compensation ($):');
        
        if (!pitch || !compensation) return;

        try {
            const response = await fetch(`${API_URL}/api/partnerships/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    opportunityId,
                    creatorId: userId,
                    pitch,
                    portfolioUrl: portfolio || null,
                    requestedCompensation: parseFloat(compensation)
                })
            });
            if (response.ok) {
                alert('Application submitted!');
                loadOpportunities();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to apply');
            }
        } catch (error) {
            console.error('Application failed:', error);
        }
    };

    const handleJoinAffiliate = async (programId) => {
        if (!isCreator) {
            alert('Only creators can join affiliate programs');
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/partnerships/affiliates/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    programId,
                    creatorId: userId
                })
            });
            if (response.ok) {
                const data = await response.json();
                alert(`Joined! Your affiliate code: ${data.affiliateCode}`);
                loadAffiliates();
                loadMyAffiliateStats();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to join');
            }
        } catch (error) {
            console.error('Failed to join affiliate:', error);
        }
    };

    const handleSubmitDeliverable = async (dealId) => {
        const contentUrl = prompt('Content URL (link to deliverable):');
        const metrics = prompt('Performance metrics (e.g., views, engagement):');
        if (!contentUrl) return;

        try {
            const response = await fetch(`${API_URL}/api/partnerships/campaign/deliverable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    partnershipId: dealId,
                    contentUrl,
                    metrics: metrics || null
                })
            });
            if (response.ok) {
                alert('Deliverable submitted!');
                loadMyDeals();
            }
        } catch (error) {
            console.error('Failed to submit deliverable:', error);
        }
    };

    return (
        <div className="partnerships-container">
            <div className="partnerships-header">
                <h1>🤝 Partnerships</h1>
                <p>Brand deals, sponsorships, and affiliate programs</p>
            </div>

            {isCreator && partnershipStats && (
                <div className="partnership-stats">
                    <div className="stat-card">
                        <div className="stat-value">{partnershipStats.activeDeals || 0}</div>
                        <div className="stat-label">Active Deals</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">${partnershipStats.totalEarnings?.toLocaleString() || 0}</div>
                        <div className="stat-label">Total Earnings</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{partnershipStats.completedDeals || 0}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{partnershipStats.pendingApplications || 0}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                </div>
            )}

            <div className="partnerships-tabs">
                <button 
                    className={activeTab === 'opportunities' ? 'active' : ''}
                    onClick={() => setActiveTab('opportunities')}
                >
                    🎯 Opportunities
                </button>
                {isCreator && (
                    <button 
                        className={activeTab === 'deals' ? 'active' : ''}
                        onClick={() => setActiveTab('deals')}
                    >
                        📋 My Deals
                    </button>
                )}
                <button 
                    className={activeTab === 'affiliates' ? 'active' : ''}
                    onClick={() => setActiveTab('affiliates')}
                >
                    💰 Affiliates
                </button>
            </div>

            {activeTab === 'opportunities' && (
                <div className="opportunities-section">
                    <h2>Brand Partnership Opportunities</h2>
                    {loading ? (
                        <div className="loading">Loading opportunities...</div>
                    ) : (
                        <div className="opportunities-grid">
                            {opportunities.map(opp => (
                                <div key={opp.id} className="opportunity-card">
                                    <div className="brand-logo">
                                        <span className="brand-initial">{opp.brand_name?.charAt(0) || 'B'}</span>
                                    </div>
                                    <div className="opportunity-content">
                                        <h3>{opp.campaign_name}</h3>
                                        <div className="brand-name">by {opp.brand_name}</div>
                                        <p className="opportunity-description">{opp.description}</p>
                                        <div className="opportunity-details">
                                            <span className="budget">💵 ${opp.budget_min?.toLocaleString()} - ${opp.budget_max?.toLocaleString()}</span>
                                            <span className="category">{opp.category}</span>
                                            {opp.deadline && (
                                                <span className="deadline">⏰ Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                        <div className="requirements">
                                            <strong>Requirements:</strong>
                                            <ul>
                                                {opp.min_followers && <li>Min {opp.min_followers.toLocaleString()} followers</li>}
                                                {opp.min_engagement_rate && <li>{opp.min_engagement_rate}% engagement rate</li>}
                                                {opp.content_types && <li>Content: {opp.content_types.join(', ')}</li>}
                                            </ul>
                                        </div>
                                        <div className="opportunity-footer">
                                            <span className="applications">👥 {opp.application_count || 0} applications</span>
                                            <button 
                                                className="apply-btn"
                                                onClick={() => handleApply(opp.id)}
                                            >
                                                Apply Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'deals' && isCreator && (
                <div className="deals-section">
                    <h2>My Active Partnerships</h2>
                    <div className="deals-list">
                        {myDeals.map(deal => (
                            <div key={deal.id} className="deal-card">
                                <div className="deal-header">
                                    <h3>{deal.campaign_name}</h3>
                                    <span className={`status-badge ${deal.status}`}>{deal.status}</span>
                                </div>
                                <div className="deal-content">
                                    <div className="brand-info">
                                        <span>🏢 {deal.brand_name}</span>
                                    </div>
                                    <div className="deal-meta">
                                        <span>💰 ${deal.agreed_compensation?.toLocaleString()}</span>
                                        <span>📅 Start: {new Date(deal.start_date).toLocaleDateString()}</span>
                                        {deal.end_date && <span>📅 End: {new Date(deal.end_date).toLocaleDateString()}</span>}
                                    </div>
                                    <div className="deliverables">
                                        <strong>Deliverables: {deal.deliverables_count || 0}</strong>
                                    </div>
                                    {deal.status === 'active' && (
                                        <button 
                                            className="submit-btn"
                                            onClick={() => handleSubmitDeliverable(deal.id)}
                                        >
                                            Submit Deliverable
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {myDeals.length === 0 && (
                            <div className="empty-state">
                                <p>No active partnerships yet. Browse opportunities to apply!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'affiliates' && (
                <div className="affiliates-section">
                    <h2>Affiliate Programs</h2>
                    {myAffiliateStats && (
                        <div className="affiliate-earnings">
                            <h3>My Affiliate Performance</h3>
                            <div className="earnings-stats">
                                <div className="earning-stat">
                                    <div className="value">${myAffiliateStats.totalEarnings?.toFixed(2) || 0}</div>
                                    <div className="label">Total Earnings</div>
                                </div>
                                <div className="earning-stat">
                                    <div className="value">{myAffiliateStats.totalClicks || 0}</div>
                                    <div className="label">Clicks</div>
                                </div>
                                <div className="earning-stat">
                                    <div className="value">{myAffiliateStats.totalConversions || 0}</div>
                                    <div className="label">Conversions</div>
                                </div>
                                <div className="earning-stat">
                                    <div className="value">{myAffiliateStats.conversionRate?.toFixed(2) || 0}%</div>
                                    <div className="label">Conv. Rate</div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="affiliates-grid">
                        {affiliates.map(program => (
                            <div key={program.id} className="affiliate-card">
                                <div className="affiliate-header">
                                    <h3>{program.program_name}</h3>
                                    <span className="commission-badge">{program.commission_rate}% commission</span>
                                </div>
                                <p className="affiliate-description">{program.description}</p>
                                <div className="affiliate-details">
                                    <span>🎯 {program.category}</span>
                                    <span>💰 Cookie: {program.cookie_duration} days</span>
                                    {program.min_payout && <span>Min payout: ${program.min_payout}</span>}
                                </div>
                                <div className="affiliate-stats">
                                    <span>👥 {program.total_affiliates || 0} affiliates</span>
                                    <span>💵 Avg. monthly: ${program.average_monthly_commission?.toFixed(0) || 0}</span>
                                </div>
                                <button 
                                    className="join-btn"
                                    onClick={() => handleJoinAffiliate(program.id)}
                                >
                                    Join Program
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
