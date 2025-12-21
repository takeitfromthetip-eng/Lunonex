/* eslint-disable */
import React from 'react';
import { TIERS, getTierName, checkTierAccess } from '../utils/tierAccess';

/**
 * TierBadge - Visual indicator of user's current tier
 * Shows tier name, icon, and key benefits
 */
export default function TierBadge({ userId, userTier, userEmail, showDetails = false }) {
  const access = checkTierAccess(userId, userTier, userEmail);
  
  const tierConfig = {
    [TIERS.OWNER]: {
      icon: '👑',
      name: 'Owner',
      color: '#FFD700',
      gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      description: 'Platform Owner - Everything FREE'
    },
    [TIERS.VIP]: {
      icon: '💎',
      name: 'Lifetime VIP',
      color: '#C0C0C0',
      gradient: 'linear-gradient(135deg, #C0C0C0 0%, #E5E4E2 100%)',
      description: 'Everything FREE - Admin Powers'
    },
    [TIERS.PREMIUM_1000]: {
      icon: '🔱',
      name: '$1000 Admin',
      color: '#8B00FF',
      gradient: 'linear-gradient(135deg, #8B00FF 0%, #4B0082 100%)',
      description: 'Full Admin Powers'
    },
    [TIERS.PREMIUM_500]: {
      icon: '💠',
      name: '$500 Full',
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'All Features'
    },
    [TIERS.PREMIUM_250]: {
      icon: '🚀',
      name: '$250',
      color: '#3B82F6',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      description: 'Standard Access'
    },
    [TIERS.STANDARD_100]: {
      icon: '⭐',
      name: '$100',
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      description: 'Basic Plus'
    },
    [TIERS.BASIC_50]: {
      icon: '✓',
      name: '$50',
      color: '#6B7280',
      gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
      description: 'Basic'
    },
    [TIERS.ADULT_15]: {
      icon: '🔞',
      name: 'Adult',
      color: '#EF4444',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      description: 'Adult Content'
    },
    [TIERS.FREE]: {
      icon: '🌱',
      name: 'Free',
      color: '#9CA3AF',
      gradient: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
      description: 'Family Friendly'
    }
  };

  const config = tierConfig[access.tier] || tierConfig[TIERS.FREE];

  if (!showDetails) {
    // Compact badge for navigation/profile
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: config.gradient,
        padding: '6px 16px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '0.9rem',
        fontWeight: '700',
        boxShadow: `0 4px 12px ${config.color}40`
      }}>
        <span>{config.icon}</span>
        <span>{config.name}</span>
      </div>
    );
  }

  // Detailed badge with features
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '24px',
      border: `2px solid ${config.color}`,
      boxShadow: `0 8px 30px ${config.color}30`
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: '3rem'
        }}>
          {config.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '900',
            background: config.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {config.name}
          </h3>
          <p style={{
            margin: '4px 0 0 0',
            opacity: 0.8,
            fontSize: '0.95rem'
          }}>
            {config.description}
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginTop: '16px'
      }}>
        {/* Admin Powers */}
        <div style={{
          background: access.hasAdminPowers ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: access.hasAdminPowers ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '0.85rem'
        }}>
          <div style={{ fontWeight: '700', marginBottom: '4px' }}>
            {access.hasAdminPowers ? '✅' : '❌'} Admin Powers
          </div>
        </div>

        {/* Free Content */}
        <div style={{
          background: access.hasFreeContentAccess ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: access.hasFreeContentAccess ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '0.85rem'
        }}>
          <div style={{ fontWeight: '700', marginBottom: '4px' }}>
            {access.hasFreeContentAccess ? '✅' : '⚠️'} Content Access
          </div>
          <div style={{ opacity: 0.7, fontSize: '0.75rem' }}>
            {access.hasFreeContentAccess ? 'All FREE' : 'Pay Creators'}
          </div>
        </div>

        {/* CGI Level */}
        <div style={{
          background: access.hasCGI.full ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: access.hasCGI.full ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '0.85rem'
        }}>
          <div style={{ fontWeight: '700', marginBottom: '4px' }}>
            {access.hasCGI.full ? '✅' : access.hasCGI.advanced ? '⚠️' : '❌'} CGI Effects
          </div>
          <div style={{ opacity: 0.7, fontSize: '0.75rem' }}>
            {access.hasCGI.full ? 'Full (24+)' : 
             access.hasCGI.advanced ? 'Advanced (18)' : 
             access.hasCGI.basic ? 'Basic (12)' : 
             access.hasCGI.minimal ? 'Minimal (6)' : 'None'}
          </div>
        </div>

        {/* VR/AR */}
        <div style={{
          background: access.hasVRAR ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: access.hasVRAR ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '0.85rem'
        }}>
          <div style={{ fontWeight: '700', marginBottom: '4px' }}>
            {access.hasVRAR ? '✅' : '❌'} VR/AR
          </div>
        </div>

        {/* Live Streaming */}
        <div style={{
          background: access.features.liveStreaming ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: access.features.liveStreaming ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '0.85rem'
        }}>
          <div style={{ fontWeight: '700', marginBottom: '4px' }}>
            {access.features.liveStreaming ? '✅' : '❌'} Live Streaming
          </div>
        </div>

        {/* Video Effects */}
        <div style={{
          background: access.features.videoEffects ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: access.features.videoEffects ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '0.85rem'
        }}>
          <div style={{ fontWeight: '700', marginBottom: '4px' }}>
            {access.features.videoEffects ? '✅' : '❌'} Video Calls
          </div>
        </div>
      </div>

      {/* Upgrade prompt for non-premium tiers */}
      {access.tier !== TIERS.OWNER && access.tier !== TIERS.VIP && access.tier !== TIERS.PREMIUM_1000 && (
        <div style={{
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <a 
            href="/pricing"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '12px 32px',
              borderRadius: '25px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.95rem',
              transition: 'transform 0.2s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🚀 Upgrade to Unlock More
          </a>
        </div>
      )}
    </div>
  );
}
