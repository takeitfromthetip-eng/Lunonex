/* eslint-disable */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TIERS, getTierName, getTierPrice } from '../utils/tierAccess';
import { hasVIPAccess, isOwner } from '../utils/vipHelper';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function PricingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(null);
  const [ownerSpots, setOwnerSpots] = useState(null);
  const [vipSpots, setVipSpots] = useState(null);

  useEffect(() => {
    // Only check VIP status after user is loaded (not null or undefined)
    if (user !== null && user !== undefined) {
      if (user.email && (hasVIPAccess(user.email) || isOwner(user.email))) {
        // Use setTimeout to prevent blocking render
        setTimeout(() => {
          alert('You already have lifetime VIP access! No payment needed. 👑');
          window.location.href = '/';
        }, 100);
        return;
      }
    }

    // Check VIP availability (limited to 10)
    fetch(`${API_URL}/check-vip-availability`)
      .then(r => r.json())
      .then(data => setVipSpots(data.spotsRemaining))
      .catch(() => setVipSpots(10));
  }, [user]);

  const handleCheckout = async (tierKey) => {
    if (!user) {
      alert('Please log in to upgrade');
      window.location.href = '/login';
      return;
    }

    setLoading(tierKey);

    try {
      const response = await fetch(`${API_URL}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tierKey,
          userId: user.id,
          email: user.email
        })
      });

      const { url, error, message } = await response.json();

      if (error) {
        alert(message || error);
        setLoading(null);
        return;
      }

      window.location.href = url;
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  const tiers = [
    {
      key: TIERS.VIP,
      name: 'Lifetime VIP',
      icon: '👑',
      price: 'FREE (Owner Invitation Only)',
      badge: `LIMITED TO 10 - ${vipSpots || 0} SPOTS LEFT`,
      features: [
        '✅ Everything FREE forever',
        '✅ Admin powers (except removing owner)',
        '✅ All CGI effects (24+)',
        '✅ VR/AR features',
        '✅ Video calls with effects',
        '✅ Priority support',
        '✅ Custom branding',
        '✅ API access',
        '✅ Unlimited storage'
      ],
      highlight: true,
      disableCheckout: true,
      message: 'By owner invitation only'
    },
    {
      key: TIERS.PREMIUM_1000,
      name: '$1000',
      icon: '🔱',
      price: '$1,000/month',
      badge: '👑 Admin Toys & Super Powers',
      features: [
        '✅ Full admin powers',
        '✅ All features unlocked',
        '✅ All 24+ CGI effects',
        '✅ VR/AR features',
        '✅ Video calls with effects',
        '✅ Unlimited Mico AI',
        '✅ 1TB storage',
        '⚠️ Pay creator subscription fees'
      ],
      popular: true
    },
    {
      key: TIERS.PREMIUM_500,
      name: '$500 Full Access',
      icon: '💎',
      price: '$500/month',
      features: [
        '✅ All features (no admin)',
        '✅ All 24+ CGI effects',
        '✅ VR/AR features',
        '✅ Video calls with effects',
        '✅ 12 effect presets',
        '✅ Unlimited Mico AI',
        '✅ 500GB storage',
        '⚠️ Pay creator subscription fees'
      ]
    },
    {
      key: TIERS.PREMIUM_250,
      name: '$250 Standard',
      icon: '🚀',
      price: '$250/month',
      features: [
        '✅ 18 CGI effects',
        '✅ 8 effect presets',
        '✅ Video calls (no CGI)',
        '✅ Unlimited Mico AI (FREE)',
        '✅ Recording',
        '✅ 200GB storage',
        '❌ No VR/AR',
        '⚠️ Pay creator subscription fees'
      ]
    },
    {
      key: TIERS.STANDARD_100,
      name: '$100 Basic Plus',
      icon: '⭐',
      price: '$100/month',
      features: [
        '✅ 12 CGI effects',
        '✅ 6 effect presets',
        '✅ Unlimited Mico AI (FREE)',
        '✅ Recording',
        '✅ 100GB storage',
        '❌ No video calls',
        '❌ No VR/AR'
      ]
    },
    {
      key: TIERS.BASIC_50,
      name: '$50 Basic',
      icon: '✓',
      price: '$50/month',
      features: [
        '✅ 6 CGI effects',
        '✅ 3 effect presets',
        '✅ Unlimited Mico AI (FREE)',
        '✅ Recording',
        '✅ 50GB storage',
        '❌ No video calls',
        '❌ No VR/AR'
      ]
    },
    {
      key: TIERS.ADULT_15,
      name: 'Adult Content',
      icon: '🔞',
      price: '$15 setup + $5/month',
      features: [
        '✅ Adult content access',
        '✅ 3 CGI effects',
        '✅ Unlimited Mico AI (FREE)',
        '✅ Basic features',
        '✅ 10GB storage',
        '❌ No video calls',
        '❌ No VR/AR'
      ]
    },
    {
      key: TIERS.FREE,
      name: 'Free',
      icon: '🌱',
      price: 'FREE',
      features: [
        '✅ Family-friendly content',
        '✅ Unlimited Mico AI (FREE)',
        '✅ View posts',
        '✅ Basic messaging',
        '✅ Community access',
        '❌ No CGI effects',
        '❌ No premium features'
      ],
      disableCheckout: true,
      message: 'Always free!'
    }
  ];

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1>💰 ForTheWeebs Pricing</h1>
        <p>Choose the perfect tier for your creative journey</p>
        <div className="pricing-note">
          <strong>Owner & VIPs:</strong> Get everything FREE with admin powers! 
          <br />
          <strong>$1000 tier:</strong> Full admin powers but pays creator subscription fees
          <br />
          <strong>All other tiers:</strong> Pay for your own subscriptions to creators
        </div>
      </div>

      <div className="tiers-grid">
        {tiers.map((tier) => (
          <div 
            key={tier.key}
            className={`tier-card ${tier.highlight ? 'highlight' : ''} ${tier.popular ? 'popular' : ''}`}
          >
            {tier.badge && <div className="tier-badge">{tier.badge}</div>}
            {tier.popular && <div className="popular-badge">MOST POPULAR</div>}
            
            <div className="tier-icon">{tier.icon}</div>
            <h2>{tier.name}</h2>
            <div className="tier-price">{tier.price}</div>
            
            <ul className="tier-features">
              {tier.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>

            {tier.disableCheckout ? (
              <button className="btn-disabled" disabled>
                {tier.message || 'Not Available'}
              </button>
            ) : (
              <button
                className="btn-subscribe"
                onClick={() => handleCheckout(tier.key)}
                disabled={loading === tier.key}
              >
                {loading === tier.key ? 'Processing...' : `Get ${tier.name}`}
              </button>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .pricing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          padding: 60px 20px;
          color: white;
        }

        .pricing-header {
          text-align: center;
          max-width: 900px;
          margin: 0 auto 60px;
        }

        .pricing-header h1 {
          font-size: 3.5rem;
          font-weight: 900;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .pricing-header p {
          font-size: 1.3rem;
          opacity: 0.9;
          margin-bottom: 30px;
        }

        .pricing-note {
          background: rgba(255, 215, 0, 0.1);
          border: 2px solid rgba(255, 215, 0, 0.3);
          border-radius: 12px;
          padding: 20px;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .tiers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 30px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .tier-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px 30px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          position: relative;
          transition: all 0.3s ease;
        }

        .tier-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .tier-card.highlight {
          border: 3px solid #FFD700;
          background: linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,255,255,0.05) 100%);
        }

        .tier-card.popular {
          border: 3px solid #667eea;
          background: linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(255,255,255,0.05) 100%);
        }

        .tier-badge {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          background: #FFD700;
          color: #000;
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 900;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
          white-space: nowrap;
        }

        .popular-badge {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          background: #667eea;
          color: white;
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 900;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .tier-icon {
          font-size: 4rem;
          text-align: center;
          margin-bottom: 20px;
        }

        .tier-card h2 {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 15px;
          text-align: center;
        }

        .tier-price {
          font-size: 2rem;
          font-weight: 900;
          text-align: center;
          margin-bottom: 30px;
          color: #FFD700;
        }

        .tier-features {
          list-style: none;
          padding: 0;
          margin-bottom: 30px;
        }

        .tier-features li {
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .btn-subscribe {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-subscribe:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
        }

        .btn-subscribe:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-disabled {
          width: 100%;
          padding: 16px;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .pricing-header h1 {
            font-size: 2.5rem;
          }

          .tiers-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .tier-card {
            padding: 30px 20px;
          }
        }
      `}</style>
    </div>
  );
}
