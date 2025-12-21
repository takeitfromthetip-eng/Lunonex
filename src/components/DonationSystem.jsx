/* eslint-disable */
import React, { useState } from 'react';

/**
 * DonationSystem - Flexible donation system with tier unlock tracking
 * - Donations count towards CREATOR ($500) or SUPER_ADMIN ($1000) tier unlock
 * - Or can be purely charity (user's choice)
 * - Limited to 100 SUPER_ADMIN spots
 */
export function DonationSystem({ userId, currentTier = 'FREE', totalDonated = 0 }) {
  const [amount, setAmount] = useState('');
  const [applyToUnlock, setApplyToUnlock] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const TIERS = {
    FREE: { price: 0, name: 'Free', features: ['Photo Tools', 'Content Planner'] },
    CREATOR: { price: 500, name: 'Creator Pro', features: ['All Free features', 'VR/AR Studio', 'AI Generator', 'No watermarks'] },
    SUPER_ADMIN: { price: 1000, name: 'Super Admin', features: ['All Creator features', 'Platform Powers', 'Earnings Dashboard', 'Advanced Analytics'], slotsAvailable: 100 }
  };

  const [superAdminSlotsLeft, setSuperAdminSlotsLeft] = useState(98); // Mock: 2 already taken

  const remainingForCreator = Math.max(0, TIERS.CREATOR.price - totalDonated);
  const remainingForSuperAdmin = Math.max(0, TIERS.SUPER_ADMIN.price - totalDonated);

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setResult({ success: false, message: 'Please enter a valid amount' });
      return;
    }

    const donationAmount = parseFloat(amount);
    setProcessing(true);

    try {
      // Call Stripe API to process payment
      const response = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: donationAmount,
          applyToUnlock,
          currentTier
        })
      });

      const data = await response.json();

      if (data.success) {
        const newTotal = totalDonated + donationAmount;
        let unlockMessage = '';

        if (applyToUnlock) {
          if (newTotal >= TIERS.SUPER_ADMIN.price && currentTier !== 'SUPER_ADMIN' && superAdminSlotsLeft > 0) {
            unlockMessage = '🎉 You unlocked SUPER_ADMIN tier! You now have platform super powers!';
          } else if (newTotal >= TIERS.CREATOR.price && currentTier === 'FREE') {
            unlockMessage = '🎉 You unlocked CREATOR tier! VR/AR Studio and all premium tools are now yours!';
          } else if (newTotal < TIERS.CREATOR.price) {
            unlockMessage = `💰 $${(TIERS.CREATOR.price - newTotal).toFixed(2)} more to unlock CREATOR tier!`;
          } else if (newTotal < TIERS.SUPER_ADMIN.price) {
            unlockMessage = `💰 $${(TIERS.SUPER_ADMIN.price - newTotal).toFixed(2)} more to unlock SUPER_ADMIN tier!`;
          }
        }

        setResult({
          success: true,
          message: applyToUnlock
            ? `Thank you for your donation! ${unlockMessage}`
            : `Thank you for your generous charity donation of $${donationAmount.toFixed(2)}! ❤️`
        });
        setAmount('');
      } else {
        setResult({ success: false, message: data.message || 'Payment failed' });
      }
    } catch (err) {
      setResult({ success: false, message: 'Error processing donation: ' + err.message });
    } finally {
      setProcessing(false);
    }
  };

  const quickAmounts = [5, 10, 25, 50, 100, 250, 500, 1000];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      padding: '40px',
      color: 'white',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
          ❤️ Support ForTheWeebs
        </h1>
        <p style={{ fontSize: '18px', opacity: 0.9 }}>
          Donate any amount • Unlock premium tiers • Or give as charity
        </p>
      </div>

      {/* Current Status */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '15px',
        padding: '25px',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Current Tier</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{TIERS[currentTier]?.name || 'Free'}</div>
          </div>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Total Donated</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>${totalDonated.toFixed(2)}</div>
          </div>
        </div>

        {/* Progress to next tier */}
        {currentTier === 'FREE' && (
          <div>
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>
              Progress to CREATOR tier: ${totalDonated.toFixed(2)} / $500
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '10px',
              height: '20px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: '#4CAF50',
                height: '100%',
                width: `${Math.min(100, (totalDonated / 500) * 100)}%`,
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        )}

        {currentTier === 'CREATOR' && (
          <div>
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>
              Progress to SUPER_ADMIN tier: ${totalDonated.toFixed(2)} / $1000
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '10px',
              height: '20px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: '#FFD700',
                height: '100%',
                width: `${Math.min(100, (totalDonated / 1000) * 100)}%`,
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        )}
      </div>

      {/* SUPER_ADMIN Slots Counter */}
      {currentTier !== 'SUPER_ADMIN' && (
        <div style={{
          background: 'rgba(255, 215, 0, 0.2)',
          border: '2px solid #FFD700',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
            👑 SUPER_ADMIN Slots Remaining
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#FFD700' }}>
            {superAdminSlotsLeft} / 100
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '10px' }}>
            Limited to 100 people with platform super powers!
          </div>
        </div>
      )}

      {/* Donation Amount */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '15px',
        padding: '30px',
        marginBottom: '30px'
      }}>
        <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Choose Amount</h3>

        {/* Quick Amount Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          marginBottom: '20px'
        }}>
          {quickAmounts.map(amt => (
            <button
              key={amt}
              onClick={() => setAmount(amt.toString())}
              style={{
                background: amount === amt.toString() ? 'white' : 'rgba(255,255,255,0.2)',
                color: amount === amt.toString() ? '#667eea' : 'white',
                border: 'none',
                padding: '15px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              ${amt}
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Custom Amount
          </label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '24px', marginRight: '10px' }}>$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="1"
              style={{
                flex: 1,
                padding: '15px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            />
          </div>
        </div>

        {/* Apply to Unlock Toggle */}
        <div style={{
          marginTop: '25px',
          padding: '20px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '10px'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
                Apply to tier unlock?
              </div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>
                {applyToUnlock
                  ? 'This donation will count towards unlocking premium tiers'
                  : 'This will be a pure charity donation (not applied to tiers)'}
              </div>
            </div>
            <input
              type="checkbox"
              checked={applyToUnlock}
              onChange={(e) => setApplyToUnlock(e.target.checked)}
              style={{
                width: '24px',
                height: '24px',
                cursor: 'pointer'
              }}
            />
          </label>
        </div>

        {/* What You'll Get */}
        {applyToUnlock && amount && parseFloat(amount) > 0 && (
          <div style={{
            marginTop: '20px',
            padding: '20px',
            background: 'rgba(76, 175, 80, 0.2)',
            border: '2px solid #4CAF50',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
              What you'll get:
            </div>
            {totalDonated + parseFloat(amount) >= 1000 && currentTier !== 'SUPER_ADMIN' && superAdminSlotsLeft > 0 && (
              <div style={{ fontSize: '14px' }}>
                🎉 <strong>SUPER_ADMIN tier unlocked!</strong> Platform super powers, earnings dashboard, advanced analytics
              </div>
            )}
            {totalDonated + parseFloat(amount) >= 500 && totalDonated + parseFloat(amount) < 1000 && currentTier === 'FREE' && (
              <div style={{ fontSize: '14px' }}>
                🎉 <strong>CREATOR tier unlocked!</strong> VR/AR Studio, AI Generator, no watermarks
              </div>
            )}
            {totalDonated + parseFloat(amount) < 500 && (
              <div style={{ fontSize: '14px' }}>
                💰 ${(500 - totalDonated - parseFloat(amount)).toFixed(2)} more needed for CREATOR tier
              </div>
            )}
          </div>
        )}

        {/* Donate Button */}
        <button
          onClick={handleDonate}
          disabled={processing || !amount || parseFloat(amount) <= 0}
          style={{
            width: '100%',
            background: processing ? '#ccc' : 'white',
            color: processing ? '#666' : '#667eea',
            border: 'none',
            padding: '20px',
            borderRadius: '15px',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: processing ? 'not-allowed' : 'pointer',
            marginTop: '20px',
            transition: 'all 0.3s'
          }}
        >
          {processing ? '⏳ Processing...' : `❤️ Donate $${amount || '0.00'}`}
        </button>
      </div>

      {/* Result Message */}
      {result && (
        <div style={{
          background: result.success ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
          border: `2px solid ${result.success ? '#4CAF50' : '#f44336'}`,
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>
            {result.success ? '🎉' : '❌'}
          </div>
          <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{result.message}</p>
        </div>
      )}

      {/* Tier Comparison */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '15px',
        padding: '30px'
      }}>
        <h3 style={{ fontSize: '24px', marginBottom: '20px', textAlign: 'center' }}>
          💎 Tier Benefits
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {Object.entries(TIERS).map(([key, tier]) => (
            <div
              key={key}
              style={{
                background: currentTier === key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                border: currentTier === key ? '3px solid #FFD700' : '2px solid rgba(255,255,255,0.1)',
                borderRadius: '15px',
                padding: '25px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>
                {key === 'SUPER_ADMIN' ? '👑' : key === 'CREATOR' ? '🎨' : '🆓'}
              </div>
              <h4 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
                {tier.name}
              </h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: '#FFD700' }}>
                ${tier.price}
              </div>
              {key === 'SUPER_ADMIN' && (
                <div style={{ fontSize: '12px', marginBottom: '10px', color: '#FFD700' }}>
                  {superAdminSlotsLeft} / {tier.slotsAvailable} slots left
                </div>
              )}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', textAlign: 'left' }}>
                {tier.features.map((feature, i) => (
                  <li key={i} style={{
                    padding: '8px 0',
                    borderTop: i > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                  }}>
                    ✓ {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Thank You Message */}
      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        opacity: 0.9
      }}>
        <p style={{ fontSize: '16px' }}>
          Every donation helps us build better tools and keep the platform ad-free! ❤️
        </p>
        <p style={{ fontSize: '14px', marginTop: '10px' }}>
          Thank you for supporting independent creators!
        </p>
      </div>
    </div>
  );
}
