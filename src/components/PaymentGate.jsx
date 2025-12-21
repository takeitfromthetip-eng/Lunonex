/* eslint-disable */
import React, { useState } from 'react';

// Payment tier constants
export const TIERS = {
  FREE: { price: 0, name: 'Free', features: ['View content', 'Basic features'] },
  CREATOR: {
    price: 500,
    name: 'Creator Pro',
    features: [
      '100% profit on all sales',
      'Full AR/VR content creation',
      'Cloud upload & storage',
      '3D model viewer',
      'VR gallery creation',
      'Advanced creator tools'
    ]
  },
  SUPER_ADMIN: {
    price: 1000,
    name: 'Super Admin',
    features: [
      'Everything in Creator Pro',
      '100% profit on all sales',
      'View ALL content FREE',
      'AI Content Auto-Generator',
      'Advanced analytics',
      'Priority support',
      'Access to exclusive features',
      'Super admin privileges'
    ]
  }
};

export function PaymentGate({ requiredTier, currentTier, children, userId }) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Check if user has required tier
  const hasAccess = () => {
    // Owner always has access to everything
    const ownerEmail = localStorage.getItem('ownerEmail') || localStorage.getItem('userEmail');
    const storedUserId = localStorage.getItem('userId');
    if (ownerEmail === 'polotuspossumus@gmail.com' || storedUserId === 'owner') {
      return true;
    }
    
    if (requiredTier === 'CREATOR') {
      return currentTier === 'CREATOR' || currentTier === 'SUPER_ADMIN';
    }
    if (requiredTier === 'SUPER_ADMIN') {
      return currentTier === 'SUPER_ADMIN';
    }
    return true; // FREE tier
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  const tier = TIERS[requiredTier];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      padding: '50px',
      color: 'white',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '50px auto'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>

      <h2 style={{ fontSize: '32px', marginBottom: '15px', fontWeight: 'bold' }}>
        {tier.name} Required
      </h2>

      <p style={{ fontSize: '18px', marginBottom: '30px', opacity: 0.9 }}>
        Upgrade to unlock this feature
      </p>

      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '15px',
        padding: '30px',
        marginBottom: '30px',
        textAlign: 'left'
      }}>
        <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
          ${tier.price}
        </div>
        <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '20px' }}>
          One-time payment
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {tier.features.map((feature, i) => (
            <li key={i} style={{
              padding: '10px 0',
              borderTop: i > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => {
          // Redirect to payment page
          window.location.href = `/payment?tier=${requiredTier}&userId=${userId}`;
        }}
        style={{
          background: 'white',
          color: '#667eea',
          border: 'none',
          padding: '18px 40px',
          borderRadius: '30px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        Upgrade to {tier.name}
      </button>

      <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.8 }}>
        One-time payment • Keep 100% profit forever
      </p>
    </div>
  );
}

// Hook to check user tier from localStorage or API
export function useUserTier(userId) {
  const [tier, setTier] = useState('FREE');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const checkTier = async () => {
      try {
        // Check localStorage first
        const storedTier = localStorage.getItem(`userTier_${userId}`);
        if (storedTier) {
          setTier(storedTier);
        }

        // Then verify with backend
        const response = await fetch(`/api/user-tier?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTier(data.tier);
          localStorage.setItem(`userTier_${userId}`, data.tier);
        }
      } catch (err) {
        console.error('Failed to check tier:', err);
      } finally {
        setLoading(false);
      }
    };

    checkTier();
  }, [userId]);

  return { tier, loading };
}
