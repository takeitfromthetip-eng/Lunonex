/**
 * User Menu Component
 * Displays user info with logout option and account management
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthSupabase.jsx';
import { checkTierAccess } from '../utils/tierAccess';
import { supabase } from '../lib/supabase';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [tierInfo, setTierInfo] = useState(null);
  const [userData, setUserData] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    // Get tier info from localStorage
    const userId = localStorage.getItem('userId');
    const userTier = localStorage.getItem('userTier');
    const userEmail = localStorage.getItem('userEmail') || user?.email;

    if (userEmail) {
      const access = checkTierAccess(userId, userTier, userEmail);
      setTierInfo(access);
      loadUserData(userEmail);
    }
  }, [user]);

  async function loadUserData(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, display_name, use_real_name')
        .eq('email', email)
        .single();
      
      if (!error && data) {
        setUserData(data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      
      // Clear all localStorage items
      const itemsToKeep = ['theme', 'language', 'cookieConsent'];
      const allItems = Object.keys(localStorage);
      
      allItems.forEach(key => {
        if (!itemsToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      // Reload page to login screen
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  const userEmail = user?.email || localStorage.getItem('userEmail') || localStorage.getItem('ownerEmail');
  
  // Get display name from userData based on preference
  let displayName;
  if (userData) {
    if (userData.use_real_name && userData.display_name) {
      displayName = userData.display_name;
    } else if (userData.username) {
      displayName = `@${userData.username}`;
    } else {
      displayName = userEmail?.split('@')[0] || 'User';
    }
  } else {
    displayName = user?.user_metadata?.display_name || userEmail?.split('@')[0] || 'User';
  }

  if (!userEmail && !user) {
    return null; // Don't show menu if not logged in
  }

  return (
    <div style={styles.container} ref={menuRef}>
      {/* User Avatar Button */}
      <button
        style={styles.avatarButton}
        onClick={() => setIsOpen(!isOpen)}
        title="User Menu"
      >
        <div style={styles.avatar}>
          {tierInfo?.isOwner ? '👑' : tierInfo?.isVIP ? '⭐' : '👤'}
        </div>
        <span style={styles.displayName}>{displayName}</span>
        <span style={styles.chevron}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={styles.dropdown}>
          {/* User Info Section */}
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {tierInfo?.isOwner ? '👑' : tierInfo?.isVIP ? '⭐' : '👤'}
            </div>
            <div style={styles.userDetails}>
              <div style={styles.userName}>{displayName}</div>
              <div style={styles.userEmail}>{userEmail}</div>
              {tierInfo && (
                <div style={styles.userTier}>
                  {tierInfo.isOwner && <span style={styles.badge}>👑 OWNER</span>}
                  {tierInfo.isVIP && !tierInfo.isOwner && <span style={styles.badge}>⭐ VIP</span>}
                  {tierInfo.hasFreeContentAccess && (
                    <span style={{...styles.badge, background: '#10b981'}}>✅ Unlimited Access</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={styles.divider}></div>

          {/* Menu Items */}
          <button style={styles.menuItem} onClick={() => {
            setIsOpen(false);
            window.location.href = '/profile';
          }}>
            <span style={styles.menuIcon}>👤</span>
            <span>Profile</span>
          </button>

          <button style={styles.menuItem} onClick={() => {
            setIsOpen(false);
            window.location.href = '/settings';
          }}>
            <span style={styles.menuIcon}>⚙️</span>
            <span>Settings</span>
          </button>

          {tierInfo?.isOwner && (
            <button style={styles.menuItem} onClick={() => {
              setIsOpen(false);
              window.location.href = '/admin';
            }}>
              <span style={styles.menuIcon}>🔧</span>
              <span>Admin Panel</span>
            </button>
          )}

          <div style={styles.divider}></div>

          {/* Logout Button */}
          <button 
            style={{...styles.menuItem, ...styles.logoutButton}} 
            onClick={handleLogout}
          >
            <span style={styles.menuIcon}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 10000,
  },
  avatarButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 16px',
    background: 'rgba(255, 255, 255, 0.95)',
    border: '2px solid #667eea',
    borderRadius: '24px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.2s ease',
  },
  avatar: {
    fontSize: '20px',
    lineHeight: '1',
  },
  displayName: {
    maxWidth: '150px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chevron: {
    fontSize: '10px',
    marginLeft: '4px',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    width: '280px',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  userAvatar: {
    fontSize: '40px',
    lineHeight: '1',
  },
  userDetails: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: '16px',
    fontWeight: 700,
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userEmail: {
    fontSize: '12px',
    opacity: 0.9,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userTier: {
    display: 'flex',
    gap: '6px',
    marginTop: '8px',
    flexWrap: 'wrap',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 8px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: 600,
  },
  divider: {
    height: '1px',
    background: '#e5e7eb',
    margin: '8px 0',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 16px',
    background: 'none',
    border: 'none',
    fontSize: '14px',
    fontWeight: 500,
    color: '#333',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.2s ease',
  },
  menuIcon: {
    fontSize: '18px',
  },
  logoutButton: {
    color: '#ef4444',
    fontWeight: 600,
  },
};
