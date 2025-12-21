import React, { useState } from 'react';

/**
 * Creator Content Pricing Component
 * Allows creators to set:
 * 1. Regular subscription pricing (daily, weekly, monthly, yearly)
 * 2. Special release custom pricing (one-time payments)
 */
export default function CreatorPricing({ contentId, onSave }) {
  const [pricingType, setPricingType] = useState('subscription'); // 'subscription' or 'special'
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [specialPrice, setSpecialPrice] = useState('');

  const handleSave = () => {
    const pricingData = {
      contentId,
      type: pricingType,
      ...(pricingType === 'subscription' 
        ? { price: parseFloat(price), frequency }
        : { price: parseFloat(specialPrice), frequency: 'one-time' }
      ),
      createdAt: new Date().toISOString()
    };

    if (onSave) {
      onSave(pricingData);
    }

    // Store in localStorage for now (move to backend later)
    const existingPricing = JSON.parse(localStorage.getItem('creatorPricing') || '{}');
    existingPricing[contentId] = pricingData;
    localStorage.setItem('creatorPricing', JSON.stringify(existingPricing));

    alert('Pricing saved successfully!');
  };

  return (
    <div style={{
      padding: '2rem',
      background: 'rgba(0,0,0,0.3)',
      borderRadius: '12px',
      maxWidth: '600px'
    }}>
      <h3 style={{ marginBottom: '1.5rem' }}>💰 Set Your Pricing</h3>

      {/* Pricing Type Selector */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
          Pricing Type
        </label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setPricingType('subscription')}
            style={{
              flex: 1,
              padding: '1rem',
              background: pricingType === 'subscription' ? '#667eea' : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            📅 Subscription
          </button>
          <button
            onClick={() => setPricingType('special')}
            style={{
              flex: 1,
              padding: '1rem',
              background: pricingType === 'special' ? '#667eea' : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ⭐ Special Release
          </button>
        </div>
      </div>

      {/* Subscription Pricing */}
      {pricingType === 'subscription' && (
        <>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Price ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="9.99"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.3)',
                color: 'white',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Billing Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.3)',
                color: 'white',
                fontSize: '1rem'
              }}
            >
              <option value="per-view">Pay Per View</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1rem' }}>
            Fans will be charged ${price || '0.00'} {frequency === 'per-view' ? 'each time they view' : frequency}
          </p>
        </>
      )}

      {/* Special Release Pricing */}
      {pricingType === 'special' && (
        <>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Special Release Price ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={specialPrice}
              onChange={(e) => setSpecialPrice(e.target.value)}
              placeholder="19.99"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.3)',
                color: 'white',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{
            padding: '1rem',
            background: 'rgba(102, 126, 234, 0.2)',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <p style={{ fontSize: '0.9rem', margin: 0 }}>
              💡 <strong>Special Release:</strong> One-time payment for exclusive content.
              This is perfect for limited editions, special events, or premium releases!
            </p>
          </div>

          <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1rem' }}>
            Fans will pay ${specialPrice || '0.00'} one time to access this content
          </p>
        </>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!price && !specialPrice}
        style={{
          width: '100%',
          padding: '1rem',
          background: (!price && !specialPrice) ? 'rgba(255,255,255,0.1)' : '#667eea',
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: (!price && !specialPrice) ? 'not-allowed' : 'pointer'
        }}
      >
        Save Pricing
      </button>
    </div>
  );
}
