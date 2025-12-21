import React from 'react';

const tierMap = {
  'free': { name: 'Free Tier', next: 'Supporter Creator', cost: 35, profit: '85%', features: ['Basic photo tools', 'Content planner', 'Community access'] },
  'General Access': { name: 'Free Tier', next: 'Supporter Creator', cost: 35, profit: '85%', features: ['Basic photo tools', 'Content planner', 'Community access'] },
  'Supporter Creator': { name: 'Supporter Creator', next: 'Legacy Creator', cost: 50, profit: '95%', features: ['Advanced AR/VR tools', 'Priority support', 'Custom branding'] },
  'Legacy Creator': { name: 'Legacy Creator', next: 'Standard Founder', cost: 100, profit: '100%', features: ['Full platform access', 'API access', 'White label options'] },
  'Standard Founder': { name: 'Standard Founder', next: 'Mythic Founder', cost: 0, profit: '100%', features: ['Lifetime access', 'Revenue sharing', 'Platform governance'] },
};

export default function TierInfo({ currentTier }) {
  const info = tierMap[currentTier?.toLowerCase()] || tierMap['free'];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      padding: '24px',
      borderRadius: '12px',
      color: '#000',
      marginBottom: '24px',
      boxShadow: '0 8px 24px rgba(255, 215, 0, 0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '4px' }}>Your Current Tier</div>
          <div style={{ fontSize: '2rem', fontWeight: '900' }}>{info.name}</div>
        </div>
        {info.next && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '4px' }}>Upgrade to</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '700' }}>{info.next}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>${info.cost}/mo</div>
          </div>
        )}
      </div>
      {info.features && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>✨ Your Features:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {info.features.map((feature, i) => (
              <span key={i} style={{
                background: 'rgba(0,0,0,0.1)',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}>
                ✓ {feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
