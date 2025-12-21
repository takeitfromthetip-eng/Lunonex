/* eslint-disable */
import React, { useState, useEffect } from 'react';
import './UserProfileManager.css';
import { isLifetimeVIP, LIFETIME_VIP_EMAILS } from '../utils/vipAccess';
import { getSuperAdminSlots } from '../utils/superAdminSlots';

/**
 * User Profile Manager - Allows owner to create and switch between multiple creator profiles
 * Owner maintains admin access across all profiles
 * All profiles appear as creator accounts to users
 * 
 * Feature Access:
 * - Owner (polotuspossumus@gmail.com): 4 profiles (1 main + 3 creator)
 * - VIP List: 4 profiles (1 main + 3 creator)
 * - $1000 Tier: 4 profiles (1 main + 3 creator)
 * - All earnings consolidated to main account
 */
export const UserProfileManager = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: '',
    email: '',
    style: 'casual',
    avatar: '👤',
    displayName: '',
    bio: ''
  });

  const avatarOptions = ['👤', '🎨', '🎮', '🎭', '🎪', '🎯', '🎸', '🎬', '📸', '✨', '🌟', '💫', '🎵', '🎹', '🎺', '🎻'];
  const styleOptions = ['casual', 'professional', 'creative', 'minimal', 'vibrant'];

  // Get super admin slot availability
  const [slotInfo] = useState(() => getSuperAdminSlots());

  // Check if user has access to multi-profile feature
  const checkMultiProfileAccess = () => {
    const ownerEmail = localStorage.getItem('ownerEmail');
    const userEmail = localStorage.getItem('userEmail') || ownerEmail;
    const userTier = localStorage.getItem('userTier');
    const userId = localStorage.getItem('userId');

    // Owner always has access
    if (userId === 'owner' || ownerEmail === 'polotuspossumus@gmail.com') {
      return { hasAccess: true, reason: 'owner', maxProfiles: 3 };
    }

    // VIP list members have access
    if (userEmail && isLifetimeVIP(userEmail)) {
      return { hasAccess: true, reason: 'vip', maxProfiles: 3 };
    }

    // $1000 tier has access
    if (userTier === 'PREMIUM_1000' || userTier === 'LIFETIME_VIP') {
      return { hasAccess: true, reason: 'premium', maxProfiles: 3 };
    }

    return { hasAccess: false, reason: 'none', maxProfiles: 0 };
  };

  const [accessStatus] = useState(checkMultiProfileAccess());

  // Load profiles from localStorage
  useEffect(() => {
    const storedProfiles = JSON.parse(localStorage.getItem('userProfiles') || '[]');
    setProfiles(storedProfiles);
    
    const activeProfile = localStorage.getItem('activeProfile');
    if (activeProfile) {
      setCurrentProfile(JSON.parse(activeProfile));
    }
  }, []);

  // Save profiles to localStorage
  const saveProfiles = (updatedProfiles) => {
    localStorage.setItem('userProfiles', JSON.stringify(updatedProfiles));
    setProfiles(updatedProfiles);
  };

  // Create new profile
  const handleCreateProfile = () => {
    if (!accessStatus.hasAccess) {
      alert('🔒 Multi-Profile Feature requires VIP access or $1000 tier');
      return;
    }

    if (!newProfile.name || !newProfile.email) {
      alert('Please enter a name and email');
      return;
    }

    if (profiles.length >= accessStatus.maxProfiles) {
      alert(`Maximum ${accessStatus.maxProfiles} creator profiles allowed`);
      return;
    }

    const profile = {
      id: `profile_${Date.now()}`,
      name: newProfile.name,
      email: newProfile.email,
      displayName: newProfile.displayName || newProfile.name,
      bio: newProfile.bio || `${newProfile.style.charAt(0).toUpperCase() + newProfile.style.slice(1)} content creator`,
      style: newProfile.style,
      avatar: newProfile.avatar,
      isCreator: true, // Mark as creator account
      tier: 'creator', // Creator tier
      // Revenue Settings - All payments route to main user's account
      revenueSettings: {
        primaryAccount: localStorage.getItem('ownerEmail') || localStorage.getItem('userEmail'),
        stripeConnectedAccount: null, // Uses main user's Stripe account
        payoutEmail: localStorage.getItem('ownerEmail') || localStorage.getItem('userEmail'),
        consolidatedPayments: true // All profiles pay to same account
      },
      createdAt: new Date().toISOString(),
      preferences: {
        theme: newProfile.style === 'minimal' ? 'light' : 'dark',
        notifications: true,
        autoSave: true,
        publicProfile: true
      }
    };

    const updatedProfiles = [...profiles, profile];
    saveProfiles(updatedProfiles);
    setShowCreateForm(false);
    setNewProfile({ name: '', email: '', style: 'casual', avatar: '👤', displayName: '', bio: '' });
  };

  // Switch to a profile
  const handleSwitchProfile = (profile) => {
    // Save current profile as active
    localStorage.setItem('activeProfile', JSON.stringify(profile));
    setCurrentProfile(profile);

    // Apply profile preferences
    if (profile.preferences.theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }

    // Update user context
    localStorage.setItem('currentUserEmail', profile.email);
    localStorage.setItem('currentUserName', profile.name);
    localStorage.setItem('userStyle', profile.style);
    localStorage.setItem('displayUserId', profile.id); // For display purposes
    
    // PRESERVE ADMIN ACCESS ONLY IF MAIN USER IS OWNER
    const mainEmail = localStorage.getItem('userEmail') || localStorage.getItem('ownerEmail');
    if (mainEmail === 'polotuspossumus@gmail.com') {
      localStorage.setItem('userId', 'owner');
      localStorage.setItem('ownerEmail', 'polotuspossumus@gmail.com');
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('ownerVerified', 'true');
    }

    alert(`Switched to ${profile.name}'s profile! You still have admin access. Refreshing...`);
    setTimeout(() => window.location.reload(), 500);
  };

  // Delete a profile
  const handleDeleteProfile = (profileId) => {
    if (!confirm('Delete this profile? This cannot be undone.')) return;

    const updatedProfiles = profiles.filter(p => p.id !== profileId);
    saveProfiles(updatedProfiles);

    if (currentProfile?.id === profileId) {
      localStorage.removeItem('activeProfile');
      setCurrentProfile(null);
    }
  };

  // Return to main admin profile
  const returnToAdmin = () => {
    const mainEmail = localStorage.getItem('ownerEmail') || localStorage.getItem('userEmail');
    const isOwnerOrVIP = localStorage.getItem('userId') === 'owner' || 
                         mainEmail === 'polotuspossumus@gmail.com' || 
                         isLifetimeVIP(mainEmail);

    localStorage.removeItem('activeProfile');
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('currentUserName');
    localStorage.removeItem('displayName');
    localStorage.removeItem('userBio');
    localStorage.removeItem('userStyle');
    localStorage.removeItem('isCreatorAccount');
    
    // Ensure admin access is preserved ONLY FOR OWNER (not VIPs)
    if (mainEmail === 'polotuspossumus@gmail.com') {
      localStorage.setItem('userId', 'owner');
      localStorage.setItem('ownerEmail', mainEmail);
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('ownerVerified', 'true');
      localStorage.setItem('userTier', 'LIFETIME_VIP');
    } else if (isLifetimeVIP(mainEmail)) {
      // VIPs get perks but NOT admin access
      localStorage.setItem('userTier', 'LIFETIME_VIP');
      localStorage.removeItem('adminAuthenticated');
      localStorage.removeItem('userId'); // Don't set to 'owner'
    }
    
    setCurrentProfile(null);
    alert('Returned to main admin profile! Refreshing...');
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="user-profile-manager">
      {!accessStatus.hasAccess && (
        <div className="access-denied-banner">
          <h3>🔒 Multi-Profile Feature Locked</h3>
          
          <div style={{ 
            background: slotInfo.remaining > 0 ? 'rgba(102, 126, 234, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `2px solid ${slotInfo.remaining > 0 ? '#667eea' : '#ef4444'}`,
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <strong style={{ fontSize: '18px' }}>
              {slotInfo.remaining > 0 ? (
                <>🎯 {slotInfo.remaining} / 100 Super Admin Slots Remaining</>
              ) : (
                <>❌ SOLD OUT - All 100 Slots Claimed!</>
              )}
            </strong>
          </div>

          <p>This premium feature requires:</p>
          <ul>
            <li>✨ <strong>VIP Access</strong> (Lifetime unlimited - invitation only), OR</li>
            <li>💎 <strong>$1,000 Premium Tier</strong> (One-time payment - Limited to 100 slots)</li>
          </ul>
          <p style={{ marginTop: '16px', fontSize: '16px' }}>
            <strong>Unlock the ability to create 3 additional creator profiles with consolidated revenue!</strong>
          </p>
          
          {slotInfo.remaining > 0 ? (
            <button 
              onClick={() => {
                // Navigate to premium subscription tab
                const urlParams = new URLSearchParams(window.location.search);
                urlParams.set('tab', 'premium');
                window.location.search = urlParams.toString();
              }}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '20px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              💎 Unlock $1,000 Tier Now ({slotInfo.remaining} left!)
            </button>
          ) : (
            <div style={{
              background: '#fee',
              color: '#c33',
              padding: '16px',
              borderRadius: '8px',
              marginTop: '20px',
              fontWeight: '600'
            }}>
              ⚠️ All 100 Super Admin slots have been sold. This tier is no longer available.
            </div>
          )}
        </div>
      )}

      {accessStatus.hasAccess && (
        <>
          <div className="profile-manager-header">
            <h2>👥 Creator Profile Manager</h2>
            <p className="subtitle">
              Create up to {accessStatus.maxProfiles} creator profiles for content monetization 
              ({accessStatus.reason === 'owner' ? '👑 Owner' : accessStatus.reason === 'vip' ? '✨ VIP' : '💎 Premium $1,000'} Access)
            </p>
          </div>

      {/* Current Profile Display */}
      {currentProfile && (
        <div className="current-profile-banner">
          <div className="profile-info">
            <span className="avatar">{currentProfile.avatar}</span>
            <div>
              <strong>{currentProfile.name}</strong>
              <span className="email">{currentProfile.email}</span>
              <span className="style-badge">{currentProfile.style}</span>
            </div>
          </div>
          <button onClick={returnToAdmin} className="return-btn">
            Return to Admin 👑
          </button>
        </div>
      )}

      {/* Profile List */}
      <div className="profiles-grid">
        {profiles.map(profile => (
          <div key={profile.id} className={`profile-card ${currentProfile?.id === profile.id ? 'active' : ''}`}>
            <div className="profile-card-header">
              <span className="avatar-large">{profile.avatar}</span>
              <button 
                onClick={() => handleDeleteProfile(profile.id)}
                className="delete-btn"
                title="Delete profile"
              >
                ×
              </button>
            </div>
            <h3>{profile.name}</h3>
            <p className="email">{profile.email}</p>
            <div className="style-info">
              <span className="style-badge">{profile.style}</span>
              <span className="theme-badge">{profile.preferences.theme}</span>
            </div>
            <button 
              onClick={() => handleSwitchProfile(profile)}
              className="switch-btn"
              disabled={currentProfile?.id === profile.id}
            >
              {currentProfile?.id === profile.id ? 'Current' : 'Switch to Profile'}
            </button>
          </div>
        ))}

        {/* Add Profile Card */}
        {profiles.length < accessStatus.maxProfiles && !showCreateForm && (
          <div className="profile-card add-card" onClick={() => setShowCreateForm(true)}>
            <div className="add-icon">+</div>
            <p>Add New Profile</p>
            <span className="slots-remaining">{accessStatus.maxProfiles - profiles.length} slot{accessStatus.maxProfiles - profiles.length !== 1 ? 's' : ''} remaining</span>
          </div>
        )}
      </div>

      {/* Create Profile Form */}
      {showCreateForm && (
        <div className="create-profile-form">
          <h3>Create New Profile</h3>
          
          <div className="form-group">
            <label>Profile Name (Internal)</label>
            <input
              type="text"
              value={newProfile.name}
              onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
              placeholder="e.g., Creative Persona"
              maxLength={30}
            />
          </div>

          <div className="form-group">
            <label>Display Name (Public)</label>
            <input
              type="text"
              value={newProfile.displayName}
              onChange={(e) => setNewProfile({...newProfile, displayName: e.target.value})}
              placeholder="How users will see you (e.g., ArtistPro)"
              maxLength={30}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={newProfile.email}
              onChange={(e) => setNewProfile({...newProfile, email: e.target.value})}
              placeholder="e.g., creative@fortheweebs.com"
            />
          </div>

          <div className="form-group">
            <label>Creator Bio</label>
            <textarea
              value={newProfile.bio}
              onChange={(e) => setNewProfile({...newProfile, bio: e.target.value})}
              placeholder="Tell users about this creator profile..."
              maxLength={200}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e1e8ed',
                borderRadius: '8px',
                fontSize: '15px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <div className="form-group">
            <label>Style</label>
            <select
              value={newProfile.style}
              onChange={(e) => setNewProfile({...newProfile, style: e.target.value})}
            >
              {styleOptions.map(style => (
                <option key={style} value={style}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Avatar</label>
            <div className="avatar-selector">
              {avatarOptions.map(avatar => (
                <button
                  key={avatar}
                  type="button"
                  className={`avatar-option ${newProfile.avatar === avatar ? 'selected' : ''}`}
                  onClick={() => setNewProfile({...newProfile, avatar})}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button onClick={handleCreateProfile} className="create-btn">
              Create Profile
            </button>
            <button onClick={() => setShowCreateForm(false)} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="info-panel">
        <h4>ℹ️ About Creator Profiles</h4>
        <ul>
          <li><strong>Main Profile:</strong> Your personal admin account</li>
          <li><strong>Creator Profiles ({accessStatus.maxProfiles} max):</strong> Public-facing monetizable creator accounts</li>
          <li>✅ VIP & Premium users keep <strong>full admin access</strong> on all profiles</li>
          <li>✅ Each profile appears as a <strong>separate creator</strong> to users</li>
          <li>✅ Monetize content independently on each profile</li>
          <li>✅ Switch instantly between all profiles</li>
          <li>💰 <strong>All revenue from all creator profiles routes to your main account</strong></li>
          <li>💡 Perfect for showcasing different content styles and monetization examples</li>
        </ul>
      </div>
        </>
      )}
    </div>
  );
};

export default UserProfileManager;
