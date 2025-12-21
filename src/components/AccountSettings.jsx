/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { generateTwoFactorCode, storeTwoFactorCode, sendTwoFactorCode } from '../utils/twoFactorAuth';

/**
 * Account Settings - Comprehensive user settings
 * Categories: Security, Account, Privacy, Notifications, Content, Appearance
 */
export default function AccountSettings({ userId }) {
  const [activeCategory, setActiveCategory] = useState('security');
  
  // Security settings
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [email, setEmail] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [testCode, setTestCode] = useState('');
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Account settings
  const [autoRenewSubs, setAutoRenewSubs] = useState(true);
  const [downloadQuality, setDownloadQuality] = useState('high');
  
  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [showWatchHistory, setShowWatchHistory] = useState(true);
  const [allowDMs, setAllowDMs] = useState(true);
  
  // Notification settings
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [creatorUpdates, setCreatorUpdates] = useState(true);
  const [newContentAlerts, setNewContentAlerts] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);
  
  // Content settings
  const [contentFilter, setContentFilter] = useState('all');
  const [autoplayVideos, setAutoplayVideos] = useState(true);
  const [streamQuality, setStreamQuality] = useState('auto');
  
  // Appearance settings
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [profileBgType, setProfileBgType] = useState('color');
  const [profileBgUrl, setProfileBgUrl] = useState('');
  const [profileAudioUrl, setProfileAudioUrl] = useState('');
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [clickSound, setClickSound] = useState('');
  const [notificationSound, setNotificationSound] = useState('');
  const [messageSound, setMessageSound] = useState('');

  useEffect(() => {
    // Load all settings from localStorage
    const enabled = localStorage.getItem('twoFA_enabled') === 'true';
    const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('ownerEmail');
    setTwoFAEnabled(enabled);
    setEmail(userEmail);
    
    // Load other settings
    setAutoRenewSubs(localStorage.getItem('autoRenewSubs') !== 'false');
    setDownloadQuality(localStorage.getItem('downloadQuality') || 'high');
    setProfileVisibility(localStorage.getItem('profileVisibility') || 'public');
    setShowWatchHistory(localStorage.getItem('showWatchHistory') !== 'false');
    setAllowDMs(localStorage.getItem('allowDMs') !== 'false');
    setEmailNotifs(localStorage.getItem('emailNotifs') !== 'false');
    setCreatorUpdates(localStorage.getItem('creatorUpdates') !== 'false');
    setNewContentAlerts(localStorage.getItem('newContentAlerts') !== 'false');
    setPaymentReminders(localStorage.getItem('paymentReminders') !== 'false');
    setContentFilter(localStorage.getItem('contentFilter') || 'all');
    setAutoplayVideos(localStorage.getItem('autoplayVideos') !== 'false');
    setStreamQuality(localStorage.getItem('streamQuality') || 'auto');
    setTheme(localStorage.getItem('theme') || 'dark');
    setLanguage(localStorage.getItem('language') || 'en');
    setProfileBgType(localStorage.getItem('profileBgType') || 'color');
    setProfileBgUrl(localStorage.getItem('profileBgUrl') || '');
    setProfileAudioUrl(localStorage.getItem('profileAudioUrl') || '');
    setSoundEffectsEnabled(localStorage.getItem('soundEffectsEnabled') !== 'false');
    setClickSound(localStorage.getItem('clickSound') || '');
    setNotificationSound(localStorage.getItem('notificationSound') || '');
    setMessageSound(localStorage.getItem('messageSound') || '');
  }, []);

  // 2FA handlers
  const handleEnable2FA = async () => {
    setLoading(true);
    setMessage('');

    try {
      const code = generateTwoFactorCode();
      storeTwoFactorCode(email, code);
      setTestCode(code);
      await sendTwoFactorCode(email, code);
      setShowTestDialog(true);
      setMessage('✅ Test code sent to your email. Enter it to enable 2FA.');
    } catch (error) {
      setMessage('❌ Failed to send test code. Please try again.');
    }
    
    setLoading(false);
  };

  const handleVerifyAndEnable = () => {
    if (verificationCode === testCode) {
      localStorage.setItem('twoFA_enabled', 'true');
      setTwoFAEnabled(true);
      setShowTestDialog(false);
      setVerificationCode('');
      setMessage('✅ 2FA enabled successfully! You will need a code on your next login.');
    } else {
      setMessage('❌ Invalid code. Please try again.');
    }
  };

  const handleDisable2FA = () => {
    setShowConfirmDialog(true);
  };

  const confirmDisable = () => {
    localStorage.setItem('twoFA_enabled', 'false');
    setTwoFAEnabled(false);
    setShowConfirmDialog(false);
    setMessage('✅ 2FA disabled. You can log in with just your password now.');
  };

  // Setting handlers
  const handleToggle = (setter, storageKey, value) => {
    const newValue = !value;
    setter(newValue);
    localStorage.setItem(storageKey, newValue.toString());
  };

  const handleSelect = (setter, storageKey, value) => {
    setter(value);
    localStorage.setItem(storageKey, value);
  };

  const categories = [
    { id: 'security', icon: '🔒', label: 'Security' },
    { id: 'account', icon: '👤', label: 'Account' },
    { id: 'privacy', icon: '🔐', label: 'Privacy' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'content', icon: '🎬', label: 'Content' },
    { id: 'appearance', icon: '🎨', label: 'Appearance' }
  ];

  const renderSecurity = () => (
    <div>
      <h3 style={{ marginBottom: '20px' }}>🔒 Security Settings</h3>
      
      {/* 2FA Status */}
      <div style={{
        padding: '20px',
        background: twoFAEnabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        border: `2px solid ${twoFAEnabled ? '#22c55e' : '#ef4444'}`,
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: 0, marginBottom: '8px' }}>
              {twoFAEnabled ? '✅ 2FA Enabled' : '⚠️ 2FA Disabled'}
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
              {twoFAEnabled 
                ? 'Your account is protected with two-factor authentication'
                : 'Enable 2FA for extra security on your account'
              }
            </p>
          </div>
          <button
            onClick={twoFAEnabled ? handleDisable2FA : handleEnable2FA}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: twoFAEnabled ? '#ef4444' : '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            {loading ? 'Processing...' : (twoFAEnabled ? 'Disable' : 'Enable')}
          </button>
        </div>
      </div>

      <div style={{
        padding: '15px',
        background: 'rgba(102, 126, 234, 0.1)',
        borderRadius: '8px',
        marginBottom: '15px'
      }}>
        <strong>How 2FA Works:</strong>
        <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>We send a 6-digit code to {email}</li>
          <li>Enter the code to complete login</li>
          <li>Codes expire after 10 minutes</li>
        </ul>
      </div>

      <div style={{
        padding: '15px',
        background: 'rgba(251, 191, 36, 0.1)',
        border: '1px solid #fbbf24',
        borderRadius: '8px',
        fontSize: '0.9rem'
      }}>
        <strong>⚠️ Important:</strong> Make sure you have access to {email}.<br/>
        <a href="/account-recovery" style={{ color: '#667eea', fontWeight: 600 }}>
          Set up account recovery →
        </a>
      </div>
    </div>
  );

  const renderAccount = () => (
    <div>
      <h3 style={{ marginBottom: '20px' }}>👤 Account Settings</h3>
      
      <SettingItem
        icon="🔄"
        title="Auto-Renew Subscriptions"
        description="Automatically renew your creator subscriptions"
        enabled={autoRenewSubs}
        onToggle={() => handleToggle(setAutoRenewSubs, 'autoRenewSubs', autoRenewSubs)}
      />

      <SettingSelect
        icon="📥"
        title="Download Quality"
        description="Default quality for downloaded content"
        value={downloadQuality}
        options={[
          { value: 'low', label: 'Low (480p) - Save space' },
          { value: 'medium', label: 'Medium (720p) - Balanced' },
          { value: 'high', label: 'High (1080p) - Best quality' },
          { value: 'source', label: 'Source - Original file' }
        ]}
        onChange={(val) => handleSelect(setDownloadQuality, 'downloadQuality', val)}
      />

      <div style={{
        padding: '15px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid #ef4444',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <strong>⚠️ Danger Zone</strong>
        <button style={{
          display: 'block',
          marginTop: '10px',
          padding: '10px 15px',
          background: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 600
        }}>
          Delete Account
        </button>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div>
      <h3 style={{ marginBottom: '20px' }}>🔐 Privacy Settings</h3>
      
      <SettingSelect
        icon="👁️"
        title="Profile Visibility"
        description="Who can see your profile and activity"
        value={profileVisibility}
        options={[
          { value: 'public', label: 'Public - Anyone can see' },
          { value: 'followers', label: 'Followers Only' },
          { value: 'private', label: 'Private - Only you' }
        ]}
        onChange={(val) => handleSelect(setProfileVisibility, 'profileVisibility', val)}
      />

      <SettingItem
        icon="📜"
        title="Show Watch History"
        description="Display your viewing history on your profile"
        enabled={showWatchHistory}
        onToggle={() => handleToggle(setShowWatchHistory, 'showWatchHistory', showWatchHistory)}
      />

      <SettingItem
        icon="💬"
        title="Allow Direct Messages"
        description="Let other users send you DMs"
        enabled={allowDMs}
        onToggle={() => handleToggle(setAllowDMs, 'allowDMs', allowDMs)}
      />

      <div style={{
        padding: '15px',
        background: 'rgba(102, 126, 234, 0.1)',
        borderRadius: '8px',
        marginTop: '20px',
        fontSize: '0.9rem'
      }}>
        <strong>💡 Tip:</strong> Set profile to private while browsing anonymously. 
        Creators you support will still see you.
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div>
      <h3 style={{ marginBottom: '20px' }}>🔔 Notification Settings</h3>
      
      <SettingItem
        icon="📧"
        title="Email Notifications"
        description="Receive notifications via email"
        enabled={emailNotifs}
        onToggle={() => handleToggle(setEmailNotifs, 'emailNotifs', emailNotifs)}
      />

      <SettingItem
        icon="✨"
        title="Creator Updates"
        description="Get notified when creators you follow post"
        enabled={creatorUpdates}
        onToggle={() => handleToggle(setCreatorUpdates, 'creatorUpdates', creatorUpdates)}
      />

      <SettingItem
        icon="🎬"
        title="New Content Alerts"
        description="Instant alerts for new premium content"
        enabled={newContentAlerts}
        onToggle={() => handleToggle(setNewContentAlerts, 'newContentAlerts', newContentAlerts)}
      />

      <SettingItem
        icon="💳"
        title="Payment Reminders"
        description="Reminders for subscription renewals and payments"
        enabled={paymentReminders}
        onToggle={() => handleToggle(setPaymentReminders, 'paymentReminders', paymentReminders)}
      />

      <div style={{
        padding: '15px',
        background: 'rgba(34, 197, 94, 0.1)',
        borderRadius: '8px',
        marginTop: '20px',
        fontSize: '0.9rem'
      }}>
        <strong>✅ Pro Tip:</strong> Enable creator updates to never miss exclusive drops 
        from your favorite creators!
      </div>
    </div>
  );

  const renderContent = () => (
    <div>
      <h3 style={{ marginBottom: '20px' }}>🎬 Content Settings</h3>
      
      <SettingSelect
        icon="🔞"
        title="Content Filter"
        description="Control what type of content you see"
        value={contentFilter}
        options={[
          { value: 'all', label: 'All Content (18+)' },
          { value: 'moderated', label: 'Moderated - Filter extreme content' },
          { value: 'safe', label: 'Safe - Family friendly only' }
        ]}
        onChange={(val) => handleSelect(setContentFilter, 'contentFilter', val)}
      />

      <SettingItem
        icon="▶️"
        title="Autoplay Videos"
        description="Automatically play videos when browsing"
        enabled={autoplayVideos}
        onToggle={() => handleToggle(setAutoplayVideos, 'autoplayVideos', autoplayVideos)}
      />

      <SettingSelect
        icon="📡"
        title="Stream Quality"
        description="Video streaming quality preference"
        value={streamQuality}
        options={[
          { value: 'auto', label: 'Auto - Adaptive based on connection' },
          { value: 'low', label: 'Low (480p) - Save data' },
          { value: 'medium', label: 'Medium (720p)' },
          { value: 'high', label: 'High (1080p)' },
          { value: 'ultra', label: 'Ultra (4K) - High data usage' }
        ]}
        onChange={(val) => handleSelect(setStreamQuality, 'streamQuality', val)}
      />

      <div style={{
        padding: '15px',
        background: 'rgba(251, 191, 36, 0.1)',
        border: '1px solid #fbbf24',
        borderRadius: '8px',
        marginTop: '20px',
        fontSize: '0.9rem'
      }}>
        <strong>💡 Data Saver:</strong> Use Auto or Low quality on mobile to save data. 
        High/Ultra recommended on WiFi only.
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div>
      <h3 style={{ marginBottom: '20px' }}>🎨 Appearance Settings</h3>
      
      <SettingSelect
        icon="🌙"
        title="Theme"
        description="Choose your interface theme"
        value={theme}
        options={[
          { value: 'dark', label: 'Dark - Easy on the eyes' },
          { value: 'light', label: 'Light - Bright & clean' },
          { value: 'anime', label: 'Anime - Vibrant colors' },
          { value: 'cyberpunk', label: 'Cyberpunk - Neon vibes' }
        ]}
        onChange={(val) => handleSelect(setTheme, 'theme', val)}
      />

      <SettingSelect
        icon="🌐"
        title="Language"
        description="Interface language"
        value={language}
        options={[
          { value: 'en', label: 'English' },
          { value: 'ja', label: '日本語 (Japanese)' },
          { value: 'es', label: 'Español (Spanish)' },
          { value: 'fr', label: 'Français (French)' },
          { value: 'de', label: 'Deutsch (German)' },
          { value: 'ko', label: '한국어 (Korean)' },
          { value: 'zh', label: '中文 (Chinese)' }
        ]}
        onChange={(val) => handleSelect(setLanguage, 'language', val)}
      />

      <h4 style={{ marginTop: '30px', marginBottom: '15px' }}>🖼️ Profile Customization</h4>

      <SettingSelect
        icon="🎨"
        title="Profile Background Type"
        description="Choose what to display on your profile"
        value={profileBgType}
        options={[
          { value: 'color', label: 'Solid Color' },
          { value: 'gradient', label: 'Gradient' },
          { value: 'image', label: 'Image' },
          { value: 'video', label: 'Video Loop' },
          { value: 'gif', label: 'Animated GIF' }
        ]}
        onChange={(val) => handleSelect(setProfileBgType, 'profileBgType', val)}
      />

      <SettingFileInput
        icon="📁"
        title="Profile Background URL"
        description="Upload or paste URL for your profile background (image/video/gif)"
        value={profileBgUrl}
        onChange={(val) => handleSelect(setProfileBgUrl, 'profileBgUrl', val)}
        placeholder="https://example.com/background.mp4"
      />

      <SettingFileInput
        icon="🎵"
        title="Profile Audio"
        description="Add background music/audio to your profile page"
        value={profileAudioUrl}
        onChange={(val) => handleSelect(setProfileAudioUrl, 'profileAudioUrl', val)}
        placeholder="https://example.com/my-theme.mp3"
      />

      <h4 style={{ marginTop: '30px', marginBottom: '15px' }}>🔊 Sound Effects</h4>

      <SettingItem
        icon="🔔"
        title="Enable Sound Effects"
        description="Play sounds for clicks, notifications, and messages"
        enabled={soundEffectsEnabled}
        onToggle={() => handleToggle(setSoundEffectsEnabled, 'soundEffectsEnabled', soundEffectsEnabled)}
      />

      {soundEffectsEnabled && (
        <>
          <SettingFileInput
            icon="🖱️"
            title="Click Sound"
            description="Sound to play when clicking buttons/links"
            value={clickSound}
            onChange={(val) => handleSelect(setClickSound, 'clickSound', val)}
            placeholder="https://example.com/click.mp3"
          />

          <SettingFileInput
            icon="🔔"
            title="Notification Sound"
            description="Sound for new notifications"
            value={notificationSound}
            onChange={(val) => handleSelect(setNotificationSound, 'notificationSound', val)}
            placeholder="https://example.com/notification.mp3"
          />

          <SettingFileInput
            icon="💬"
            title="Message Sound"
            description="Sound for new DMs"
            value={messageSound}
            onChange={(val) => handleSelect(setMessageSound, 'messageSound', val)}
            placeholder="https://example.com/message.mp3"
          />
        </>
      )}

      <div style={{
        padding: '15px',
        background: 'rgba(102, 126, 234, 0.1)',
        borderRadius: '8px',
        marginTop: '20px',
        fontSize: '0.9rem'
      }}>
        <strong>💡 Pro Tip:</strong> Use short video loops (under 10MB) for backgrounds. 
        Keep audio files under 5MB for faster loading!
      </div>
    </div>
  );

  const renderCategory = () => {
    switch(activeCategory) {
      case 'security': return renderSecurity();
      case 'account': return renderAccount();
      case 'privacy': return renderPrivacy();
      case 'notifications': return renderNotifications();
      case 'content': return renderContent();
      case 'appearance': return renderAppearance();
      default: return renderSecurity();
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      color: 'white'
    }}>
      {/* Category Sidebar */}
      <div style={{
        minWidth: '200px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '12px',
        padding: '15px',
        height: 'fit-content'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', opacity: 0.7 }}>SETTINGS</h3>
        {categories.map(cat => (
          <div
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              background: activeCategory === cat.id ? 'rgba(102, 126, 234, 0.3)' : 'transparent',
              border: activeCategory === cat.id ? '2px solid #667eea' : '2px solid transparent',
              marginBottom: '8px',
              transition: 'all 0.2s',
              fontWeight: activeCategory === cat.id ? 600 : 400
            }}
          >
            {cat.icon} {cat.label}
          </div>
        ))}
      </div>

      {/* Settings Content */}
      <div style={{
        flex: 1,
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '12px',
        padding: '30px'
      }}>
        {renderCategory()}
        
        {/* Messages */}
        {message && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: message.includes('✅') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}
      </div>

      {/* Test Code Dialog */}
      {showTestDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1a1a2e',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            border: '2px solid #667eea'
          }}>
            <h3>Verify Your Email</h3>
            <p style={{ opacity: 0.8 }}>
              We sent a 6-digit code to {email}. Enter it below to enable 2FA.
            </p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '1.2rem',
                textAlign: 'center',
                letterSpacing: '0.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.3)',
                color: 'white',
                marginBottom: '20px'
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowTestDialog(false);
                  setVerificationCode('');
                  setMessage('');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyAndEnable}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Verify & Enable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disable Confirmation Dialog */}
      {showConfirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1a1a2e',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            border: '2px solid #ef4444'
          }}>
            <h3>⚠️ Disable 2FA?</h3>
            <p style={{ opacity: 0.8 }}>
              Are you sure you want to disable two-factor authentication? 
              Your account will be less secure.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setShowConfirmDialog(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDisable}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Yes, Disable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable toggle setting component
function SettingItem({ icon, title, description, enabled, onToggle }) {
  return (
    <div style={{
      padding: '15px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '8px',
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
          {icon} {title}
        </div>
        <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
          {description}
        </div>
      </div>
      <label style={{
        position: 'relative',
        display: 'inline-block',
        width: '50px',
        height: '24px'
      }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span style={{
          position: 'absolute',
          cursor: 'pointer',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: enabled ? '#22c55e' : '#4b5563',
          transition: '0.3s',
          borderRadius: '24px'
        }}>
          <span style={{
            position: 'absolute',
            content: '',
            height: '18px',
            width: '18px',
            left: enabled ? '29px' : '3px',
            bottom: '3px',
            background: 'white',
            transition: '0.3s',
            borderRadius: '50%'
          }} />
        </span>
      </label>
    </div>
  );
}

// Reusable select setting component
function SettingSelect({ icon, title, description, value, options, onChange }) {
  return (
    <div style={{
      padding: '15px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '8px',
      marginBottom: '12px'
    }}>
      <div style={{ fontWeight: 600, marginBottom: '4px' }}>
        {icon} {title}
      </div>
      <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '10px' }}>
        {description}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(0,0,0,0.3)',
          color: 'white',
          fontSize: '0.9rem',
          cursor: 'pointer'
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background: '#1a1a2e' }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Reusable file input setting component
function SettingFileInput({ icon, title, description, value, onChange, placeholder }) {
  return (
    <div style={{
      padding: '15px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '8px',
      marginBottom: '12px'
    }}>
      <div style={{ fontWeight: 600, marginBottom: '4px' }}>
        {icon} {title}
      </div>
      <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '10px' }}>
        {description}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(0,0,0,0.3)',
          color: 'white',
          fontSize: '0.9rem'
        }}
      />
      {value && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          background: 'rgba(34, 197, 94, 0.1)',
          borderRadius: '4px',
          fontSize: '0.8rem',
          color: '#22c55e'
        }}>
          ✅ Currently set: {value.substring(0, 50)}{value.length > 50 ? '...' : ''}
        </div>
      )}
    </div>
  );
}
