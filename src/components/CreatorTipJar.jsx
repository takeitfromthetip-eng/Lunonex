/* eslint-disable */
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from './AuthSupabase.jsx';
import './TipJar.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * CreatorTipJar - Individual tip jar for each creator's profile
 * Fans can tip creators directly, platform takes 15% (or 0% for paid users)
 */
export function CreatorTipJar({ creatorId, creatorName, creatorTier }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const presetAmounts = [1, 5, 10, 25, 50, 100];

  // Calculate fees based on creator's tier
  const isPaidCreator = creatorTier && creatorTier !== 'free' && creatorTier !== 'adult';
  const platformFeePercent = isPaidCreator ? 0 : 15;

  const calculateFees = (tipAmount) => {
    const platformFee = tipAmount * (platformFeePercent / 100);
    const creatorReceives = tipAmount - platformFee;
    return { platformFee, creatorReceives };
  };

  const handleSendTip = async () => {
    const tipAmount = parseFloat(amount || customAmount);

    if (!tipAmount || tipAmount < 1) {
      setResult({ success: false, message: 'Minimum tip is $1' });
      return;
    }

    if (!user) {
      setResult({ success: false, message: 'Please log in to send tips' });
      return;
    }

    setProcessing(true);
    setResult(null);

    try {
      const stripe = await stripePromise;

      // Create payment intent
      const response = await fetch('/api/stripe-connect/send-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          tipperId: user.id,
          amount: tipAmount,
          message,
          paymentMethodId: 'pm_card_visa' // In production, use Stripe Elements
        })
      });

      const data = await response.json();

      if (data.success) {
        const { platformFee, creatorReceives } = calculateFees(tipAmount);

        setResult({
          success: true,
          message: `🎉 Tip sent! ${creatorName} receives $${creatorReceives.toFixed(2)} (Platform fee: $${platformFee.toFixed(2)})`
        });

        // Reset form
        setAmount('');
        setCustomAmount('');
        setMessage('');
      } else {
        setResult({ success: false, message: data.error || 'Payment failed' });
      }
    } catch (error) {
      console.error('Tip error:', error);
      setResult({ success: false, message: 'Error processing tip' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="creator-tip-jar" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      padding: '30px',
      color: 'white',
      marginTop: '20px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h3 style={{ fontSize: '28px', marginBottom: '10px' }}>
          💰 Tip {creatorName}
        </h3>
        <p style={{ opacity: 0.9, fontSize: '14px' }}>
          {platformFeePercent > 0
            ? `Creator receives ${100 - platformFeePercent}% • ${platformFeePercent}% platform fee`
            : 'Creator receives 100% • No platform fees! 🎉'
          }
        </p>
      </div>

      {/* Preset Amounts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        marginBottom: '20px'
      }}>
        {presetAmounts.map(preset => {
          const { creatorReceives } = calculateFees(preset);
          return (
            <button
              key={preset}
              onClick={() => {
                setAmount(preset);
                setCustomAmount('');
              }}
              style={{
                background: amount === preset ? 'white' : 'rgba(255,255,255,0.2)',
                color: amount === preset ? '#667eea' : 'white',
                border: 'none',
                padding: '15px',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <div>${preset}</div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
                (${creatorReceives.toFixed(2)} to creator)
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Amount */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Or enter custom amount:
        </label>
        <input
          type="number"
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(e.target.value);
            setAmount('');
          }}
          placeholder="Enter amount ($)"
          min="1"
          step="0.01"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px'
          }}
        />
      </div>

      {/* Message */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Add a message (optional):
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Say something nice..."
          maxLength={200}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            minHeight: '80px',
            resize: 'vertical'
          }}
        />
      </div>

      {/* Send Button */}
      <button
        onClick={handleSendTip}
        disabled={processing || (!amount && !customAmount)}
        style={{
          width: '100%',
          background: processing ? '#999' : 'white',
          color: '#667eea',
          border: 'none',
          padding: '15px',
          borderRadius: '10px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: processing ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s'
        }}
      >
        {processing ? '⏳ Processing...' : `💸 Send $${(parseFloat(amount || customAmount) || 0).toFixed(2)} Tip`}
      </button>

      {/* Result Message */}
      {result && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          borderRadius: '10px',
          background: result.success ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
          border: `2px solid ${result.success ? '#4CAF50' : '#f44336'}`,
          textAlign: 'center'
        }}>
          {result.message}
        </div>
      )}
    </div>
  );
}

export default CreatorTipJar;
