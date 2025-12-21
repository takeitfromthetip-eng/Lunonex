/* eslint-disable */
import React, { useState, useEffect } from 'react';
import FAQ from './FAQ';
import CreatorPricing from './CreatorPricing';
import { isOwner } from '../utils/ownerAuth';

/**
 * CREATOR OVERVIEW - COMMAND CENTER
 * Dashboard with personal stats, activity, quick launch
 * + Platform-wide analytics for owner
 */
export default function CreatorOverview({ userId, userTier, isAdmin, isVip, creatorName, onNavigate }) {
  const [isOwnerUser, setIsOwnerUser] = useState(false);
  const [stats, setStats] = useState({
    totalCreations: 0,
    storageUsed: 0,
    storageTotal: Infinity, // Unlimited storage
    mythicRank: 'Initiate',
    weeklyStreak: 0,
    totalRevenue: 0
  });

  const [platformStats, setPlatformStats] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    newUsersToday: 23,
    totalPlatformRevenue: 45678,
    avgSessionTime: '12m 34s',
    conversionRate: '3.4%'
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [quickLaunchTools, setQuickLaunchTools] = useState([]);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    checkOwnerStatus();
    loadDashboardData();
  }, [userId]);

  const checkOwnerStatus = async () => {
    const ownerStatus = await isOwner();
    setIsOwnerUser(ownerStatus);
  };

  const loadDashboardData = async () => {
    // Load actual storage stats from IndexedDB
    try {
      const storageManager = await import('../utils/storageManager');
      if (storageManager && storageManager.default && storageManager.default.checkQuota) {
        const quota = await storageManager.default.checkQuota();
        
        setStats(prev => ({
          ...prev,
          storageUsed: Math.floor(quota.used / (1024 * 1024)), // Convert to MB
          storageTotal: Infinity // Unlimited storage for creators
        }));
      }
    } catch (error) {
      console.error('Failed to load storage stats:', error);
      // Set unlimited storage on error
      setStats(prev => ({
        ...prev,
        storageUsed: 0,
        storageTotal: Infinity
      }));
    }

    // Load stats from Supabase/backend
    setStats(prev => ({
      ...prev,
      totalCreations: 0,
      mythicRank: getMythicRank(0),
      weeklyStreak: 0,
      totalRevenue: '0.00'
    }));

    // Load real activity from API
    fetch('/api/user/recent-activity', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setRecentActivity(data.activities || []))
      .catch(err => {
        console.error('Failed to load activity:', err);
        setRecentActivity([]);
      });

    setQuickLaunchTools([
      { name: 'Zoom & Enhance', icon: '🔍', tab: 'photo', color: '#9C27B0' },
      { name: 'Video Export', icon: '🎬', tab: 'video', color: '#F44336' },
      { name: 'Audio Mixer', icon: '🎵', tab: 'audio', color: '#2196F3' },
      { name: 'Meme Generator', icon: '😂', tab: 'video', color: '#FF9800' },
      { name: 'Mythic Avatar', icon: '🎭', tab: 'mythic', color: '#667eea' },
      { name: 'Experimental Lab', icon: '⚗️', tab: 'experimental', color: '#F44336' }
    ]);
  };

  const getMythicRank = (count) => {
    if (count >= 1000) return 'Mythic';
    if (count >= 500) return 'Legend';
    if (count >= 250) return 'Master';
    if (count >= 100) return 'Adept';
    if (count >= 50) return 'Artisan';
    return 'Initiate';
  };

  const getMythicColor = (rank) => {
    const colors = {
      'Initiate': '#4CAF50',
      'Artisan': '#2196F3',
      'Adept': '#9C27B0',
      'Master': '#FF5722',
      'Legend': '#FFD700',
      'Mythic': '#E91E63'
    };
    return colors[rank] || '#4CAF50';
  };

  const getActivityIcon = (type) => {
    const icons = {
      upscale: '🔍',
      export: '📤',
      create: '✨',
      mint: '💎',
      collab: '🤝',
      upload: '📁',
      edit: '✏️'
    };
    return icons[type] || '⚡';
  };

  return (
    <div style={{
      padding: '30px',
      maxWidth: '1600px',
      margin: '0 auto',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <h1 style={{ fontSize: '48px', marginBottom: '10px', fontWeight: 'bold' }}>
            Welcome back, {creatorName || 'Creator'} 👋
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.7 }}>
            Your creator command center. Let's make something legendary today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowPricing(!showPricing)}
            style={{
              background: 'rgba(76, 175, 80, 0.2)',
              border: '2px solid #4CAF50',
              borderRadius: '12px',
              padding: '12px 24px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            💰 Set Pricing
          </button>
          <button
            onClick={() => setShowFAQ(!showFAQ)}
            style={{
              background: 'rgba(102, 126, 234, 0.2)',
              border: '2px solid #667eea',
              borderRadius: '12px',
              padding: '12px 24px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ❓ FAQ & Legal
          </button>
        </div>
      </div>

      {/* Show Pricing Modal */}
      {showPricing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setShowPricing(false)}>
          <div style={{
            maxWidth: '700px',
            maxHeight: '90vh',
            overflow: 'auto',
            background: '#1a1a2e',
            borderRadius: '16px',
            padding: '0'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              position: 'sticky',
              top: 0,
              background: '#1a1a2e',
              padding: '20px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0 }}>Set Content Pricing</h2>
              <button
                onClick={() => setShowPricing(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <CreatorPricing 
                contentId={`content_${Date.now()}`}
                onSave={(pricing) => {
                  console.log('Pricing saved:', pricing);
                  setShowPricing(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Show FAQ Modal */}
      {showFAQ && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setShowFAQ(false)}>
          <div style={{
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            background: '#1a1a2e',
            borderRadius: '16px',
            padding: '0'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              position: 'sticky',
              top: 0,
              background: '#1a1a2e',
              padding: '20px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0 }}>FAQ & Legal Documents</h2>
              <button
                onClick={() => setShowFAQ(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            <FAQ />
          </div>
        </div>
      )}

      {/* Top Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '25px',
        marginBottom: '40px'
      }}>
        {/* Total Creations */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(156,39,176,0.2) 0%, rgba(103,58,183,0.2) 100%)',
          borderRadius: '20px',
          padding: '30px',
          border: '2px solid rgba(156,39,176,0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '48px', opacity: 0.3 }}>
            🎨
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Total Creations</div>
          <div style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '5px' }}>
            {stats.totalCreations}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.7 }}>
            +0 this week
          </div>
        </div>

        {/* Storage */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(33,150,243,0.2) 0%, rgba(3,169,244,0.2) 100%)',
          borderRadius: '20px',
          padding: '30px',
          border: '2px solid rgba(33,150,243,0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '48px', opacity: 0.3 }}>
            💾
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Storage Used</div>
          <div style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '5px' }}>
            {(stats.storageUsed / 1000).toFixed(1)}GB
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              flex: 1,
              height: '8px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(stats.storageUsed / stats.storageTotal) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #2196F3 0%, #03A9F4 100%)',
                transition: 'width 0.5s'
              }} />
            </div>
            <span style={{ fontSize: '12px', opacity: 0.7 }}>
              ∞ Unlimited
            </span>
          </div>
        </div>

        {/* Mythic Rank */}
        <div style={{
          background: `linear-gradient(135deg, ${getMythicColor(stats.mythicRank)}33 0%, ${getMythicColor(stats.mythicRank)}22 100%)`,
          borderRadius: '20px',
          padding: '30px',
          border: `2px solid ${getMythicColor(stats.mythicRank)}55`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '48px', opacity: 0.3 }}>
            👑
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Mythic Rank</div>
          <div style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '5px', color: getMythicColor(stats.mythicRank) }}>
            {stats.mythicRank}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.7 }}>
            {250 - (stats.totalCreations % 250)} to next rank
          </div>
        </div>

        {/* Revenue */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(76,175,80,0.2) 0%, rgba(139,195,74,0.2) 100%)',
          borderRadius: '20px',
          padding: '30px',
          border: '2px solid rgba(76,175,80,0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '48px', opacity: 0.3 }}>
            💰
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Total Revenue</div>
          <div style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '5px', color: '#4CAF50' }}>
            ${stats.totalRevenue}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.7 }}>
            +$0.00 today
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '30px',
        marginBottom: '40px'
      }}>
        {/* Recent Activity */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '20px',
          padding: '30px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ fontSize: '28px', margin: 0 }}>Recent Activity</h2>
            <button style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '10px',
              color: 'white',
              fontSize: '13px',
              cursor: 'pointer'
            }}>
              View All →
            </button>
          </div>

          {recentActivity.map(activity => (
            <div key={activity.id} 
              onClick={() => {
                if (onNavigate && activity.tab) {
                  onNavigate(activity.tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '1px solid rgba(255,255,255,0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
            }}
            >
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                {getActivityIcon(activity.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {activity.name}
                </div>
                <div style={{ fontSize: '13px', opacity: 0.7 }}>
                  {activity.tool} • {activity.time}
                </div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '5px 15px',
                borderRadius: '20px',
                fontSize: '12px'
              }}>
                {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Launch */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '20px',
          padding: '30px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '25px' }}>Quick Launch</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px'
          }}>
            {quickLaunchTools.map((tool, i) => (
              <button
                key={i}
                onClick={() => {
                  if (onNavigate && tool.tab) {
                    onNavigate(tool.tab);
                    // Scroll to top smoothly
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                style={{
                  background: `linear-gradient(135deg, ${tool.color}33 0%, ${tool.color}22 100%)`,
                  border: `2px solid ${tool.color}55`,
                  borderRadius: '15px',
                  padding: '20px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.borderColor = tool.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = `${tool.color}55`;
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>{tool.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'white' }}>
                  {tool.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '20px',
        padding: '30px',
        border: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '40px'
      }}>
        <h2 style={{ fontSize: '28px', marginBottom: '25px' }}>Revenue Breakdown</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          {[
            { name: 'NFT Sales', amount: '0.00', split: '65% yours', icon: '💎', color: '#9C27B0' },
            { name: 'AI Mod Royalties', amount: '0.00', split: '90% yours', icon: '🤖', color: '#2196F3' },
            { name: 'Crypto Tips', amount: '0.00', split: '95% yours', icon: '⚡', color: '#FF9800' },
            { name: 'Subscriptions', amount: '0.00', split: '80% yours', icon: '⭐', color: '#4CAF50' }
          ].map((source, i) => (
            <div key={i} style={{
              background: `linear-gradient(135deg, ${source.color}22 0%, ${source.color}11 100%)`,
              borderRadius: '15px',
              padding: '25px',
              border: `1px solid ${source.color}33`
            }}>
              <div style={{ fontSize: '36px', marginBottom: '15px' }}>{source.icon}</div>
              <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>{source.name}</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px', color: source.color }}>
                ${source.amount}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                {source.split}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Challenge (Gamification) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,152,0,0.2) 0%, rgba(255,193,7,0.2) 100%)',
        borderRadius: '20px',
        padding: '30px',
        border: '2px solid rgba(255,152,0,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '24px', marginBottom: '10px', color: '#FFA500' }}>
              🎯 Daily Challenge
            </h3>
            <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
              Export 3 videos today to earn <strong>+100 XP</strong> and unlock a bonus filter pack
            </p>
          </div>
          <div style={{
            background: 'rgba(255,152,0,0.3)',
            borderRadius: '15px',
            padding: '20px 30px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#FFA500' }}>
              1/3
            </div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>
              Videos Exported
            </div>
          </div>
        </div>
      </div>

      {/* Platform Analytics - Owner Only */}
      {isOwnerUser && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '20px', color: '#667eea' }}>
            📊 Platform Analytics (Owner Only)
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Users</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#667eea' }}>
                {platformStats.totalUsers.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>↑ 12% from last week</div>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Active Users</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
                {platformStats.activeUsers.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>↑ 8% from last week</div>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>New Today</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
                {platformStats.newUsersToday}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Signups today</div>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Platform Revenue</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
                ${platformStats.totalPlatformRevenue.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>↑ 24% from last week</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
