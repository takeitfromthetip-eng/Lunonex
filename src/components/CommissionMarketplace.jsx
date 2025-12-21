/* eslint-disable */
// COMMISSION MARKETPLACE - Creators offer custom commissions, platform takes 15%

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { createCommission, getAllCommissions, getUserCommissions } from '../utils/databaseSupabase';
import { useAuth } from './AuthSupabase.jsx';
import './CommissionMarketplace.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_PLACEHOLDER');

function CommissionMarketplace({ userId, isCreator }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('browse'); // browse, my-commissions, create
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const [newCommission, setNewCommission] = useState({
    title: '',
    description: '',
    price: '',
    turnaroundDays: 7,
    slots: 1,
    tags: []
  });

  // Fetch commissions on mount
  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const data = await getAllCommissions();
      setCommissions(data || []);
    } catch (err) {
      console.error('Failed to fetch commissions:', err);
      setCommissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommission = async () => {
    if (!newCommission.title || !newCommission.price) {
      setError('Title and price are required');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      await createCommission({
        creatorId: user?.id || userId,
        ...newCommission
      });

      // Add to local list
      setCommissions(prev => [...prev, data.commission]);

      // Reset form
      setNewCommission({
        title: '',
        description: '',
        price: '',
        turnaroundDays: 7,
        slots: 1,
        tags: []
      });

      setActiveTab('my-commissions');
      alert('✅ Commission listed successfully!');

    } catch (err) {
      console.error('Commission creation error:', err);
      setError(err.message || 'Failed to create commission');
    } finally {
      setProcessing(false);
    }
  };

  const handlePurchaseCommission = async (commission) => {
    if (!window.confirm(`Purchase "${commission.title}" for $${commission.price}?`)) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Create payment intent
      const response = await fetch('/api/commissions/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commissionId: commission.id,
          buyerId: userId,
          creatorId: commission.creatorId,
          price: commission.price,
          title: commission.title
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      // Load Stripe and confirm payment
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error: stripeError } = await stripe.confirmCardPayment(data.clientSecret);

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Success!
      alert(`✅ Commission purchased! The creator will be notified.\n\nYou paid: $${commission.price}\nCreator receives: $${data.creatorAmount}\nPlatform fee: $${data.platformFee}`);

    } catch (err) {
      console.error('Commission purchase error:', err);
      setError(err.message || 'Purchase failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="commission-marketplace">
      <div className="marketplace-header">
        <h1>🎨 Commission Marketplace</h1>
        <p className="marketplace-subtitle">
          Hire creators for custom artwork • Creators keep 100% (only Stripe processing ~2.9%)
        </p>
      </div>

      <div className="marketplace-tabs">
        <button
          className={activeTab === 'browse' ? 'active' : ''}
          onClick={() => setActiveTab('browse')}
        >
          🔍 Browse Commissions
        </button>
        {isCreator && (
          <>
            <button
              className={activeTab === 'my-commissions' ? 'active' : ''}
              onClick={() => setActiveTab('my-commissions')}
            >
              📋 My Commissions
            </button>
            <button
              className={activeTab === 'create' ? 'active' : ''}
              onClick={() => setActiveTab('create')}
            >
              ➕ Create Listing
            </button>
          </>
        )}
      </div>

      {/* Browse Commissions */}
      {activeTab === 'browse' && (
        <div className="browse-section">
          <div className="filters">
            <input type="text" placeholder="🔍 Search commissions..." className="search-bar" />
            <select className="filter-select">
              <option>All Categories</option>
              <option>Character Design</option>
              <option>Portraits</option>
              <option>Comic Pages</option>
              <option>Trading Cards</option>
              <option>Logos</option>
            </select>
            <select className="filter-select">
              <option>Any Price</option>
              <option>Under $50</option>
              <option>$50-$100</option>
              <option>$100-$200</option>
              <option>$200+</option>
            </select>
          </div>

          <div className="commissions-grid">
            {commissions.map(comm => (
              <div key={comm.id} className="commission-card">
                <div className="commission-creator">
                  <img src={comm.creatorAvatar} alt={comm.creatorName} className="creator-avatar" />
                  <div>
                    <h4>{comm.creatorName}</h4>
                    <div className="creator-stats">
                      ⭐ {comm.rating} • {comm.completedCount} completed
                    </div>
                  </div>
                </div>

                <h3 className="commission-title">{comm.title}</h3>
                <p className="commission-description">{comm.description}</p>

                <div className="commission-details">
                  <div className="detail-item">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value price">${comm.price}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Turnaround:</span>
                    <span className="detail-value">{comm.turnaroundDays} days</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Available Slots:</span>
                    <span className="detail-value slots">{comm.slots} open</span>
                  </div>
                </div>

                <div className="commission-tags">
                  {comm.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>

                <button
                  className="btn-primary commission-btn"
                  onClick={() => handlePurchaseCommission(comm)}
                  disabled={processing}
                >
                  {processing ? '⏳ Processing...' : '💼 Request Commission'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Commission Listing */}
      {activeTab === 'create' && isCreator && (
        <div className="create-section">
          <div className="create-form">
            <h2>Create Commission Listing</h2>

            <div className="form-group">
              <label>Commission Title *</label>
              <input
                type="text"
                placeholder="e.g., Character Illustration, Portrait, Comic Page"
                value={newCommission.title}
                onChange={e => setNewCommission({ ...newCommission, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                placeholder="Describe what you'll create, your style, any limitations..."
                value={newCommission.description}
                onChange={e => setNewCommission({ ...newCommission, description: e.target.value })}
                rows={5}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price (USD) *</label>
                <input
                  type="number"
                  placeholder="150"
                  value={newCommission.price}
                  onChange={e => setNewCommission({ ...newCommission, price: e.target.value })}
                />
                <small>You receive 100% (${parseFloat(newCommission.price || 0).toFixed(2)}) - Stripe takes ~2.9%</small>
              </div>

              <div className="form-group">
                <label>Turnaround Time</label>
                <select
                  value={newCommission.turnaroundDays}
                  onChange={e => setNewCommission({ ...newCommission, turnaroundDays: parseInt(e.target.value) })}
                >
                  <option value={3}>3 days</option>
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                </select>
              </div>

              <div className="form-group">
                <label>Available Slots</label>
                <input
                  type="number"
                  placeholder="3"
                  min="1"
                  max="10"
                  value={newCommission.slots}
                  onChange={e => setNewCommission({ ...newCommission, slots: parseInt(e.target.value) })}
                />
                <small>How many clients you can take</small>
              </div>
            </div>

            <div className="form-group">
              <label>Upload Examples</label>
              <div className="upload-area">
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} id="examples-upload" />
                <label htmlFor="examples-upload" className="upload-btn">
                  📁 Upload Example Images
                </label>
                <small>Show potential clients your work</small>
              </div>
            </div>

            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="anime, character, fullbody, color"
                onChange={e => setNewCommission({ ...newCommission, tags: e.target.value.split(',').map(t => t.trim()) })}
              />
            </div>

            <div className="pricing-breakdown">
              <h3>Pricing Breakdown</h3>
              <div className="breakdown-row">
                <span>Client pays:</span>
                <span className="amount">${newCommission.price || 0}</span>
              </div>
              <div className="breakdown-row">
                <span>Platform fee (15%):</span>
                <span className="fee">-${((newCommission.price || 0) * 0.15).toFixed(2)}</span>
              </div>
              <div className="breakdown-row">
                <span>Payment processing (Stripe 2.9% + $0.30):</span>
                <span className="fee">-${(((newCommission.price || 0) * 0.029) + 0.30).toFixed(2)}</span>
              </div>
              <div className="breakdown-row total">
                <span>You receive:</span>
                <span className="amount">${((newCommission.price || 0) * 0.85 - ((newCommission.price || 0) * 0.029) - 0.30).toFixed(2)}</span>
              </div>
            </div>

            <button className="btn-primary create-btn" onClick={handleCreateCommission}>
              🎨 Create Commission Listing
            </button>
          </div>
        </div>
      )}

      {/* My Commissions */}
      {activeTab === 'my-commissions' && isCreator && (
        <div className="my-commissions-section">
          <h2>My Commission Listings</h2>
          <div className="commissions-grid">
            {commissions.filter(c => c.creatorId === userId).length > 0 ? (
              commissions.filter(c => c.creatorId === userId).map(comm => (
                <div key={comm.id} className="commission-card my-card">
                  <div className="card-status">
                    <span className="status-badge active">Active</span>
                    <button className="edit-btn">✏️ Edit</button>
                  </div>
                  <h3>{comm.title}</h3>
                  <p>{comm.description}</p>
                  <div className="card-stats">
                    <span>💰 ${comm.price}</span>
                    <span>⏱️ {comm.turnaroundDays} days</span>
                    <span>📊 {comm.slots} slots</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>You haven't created any commission listings yet.</p>
                <button className="btn-primary" onClick={() => setActiveTab('create')}>
                  Create Your First Listing
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CommissionMarketplace;
