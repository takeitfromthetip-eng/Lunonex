/* eslint-disable */
import React, { useState, useEffect } from 'react';
import './CreatorDashboard.css';
import './components/TipsAndDonations.css';
import './components/CommissionMarketplace.css';
import './components/PremiumSubscription.css';
import { TermsOfService } from "./components/TermsOfService";
import { CreatorAgreementGate } from "./components/CreatorAgreementGate";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import { Switch } from '@radix-ui/react-switch';
import { LegalDocumentsList } from "./components/LegalDocumentsList";
import TierInfo from "./components/TierInfo";
import UpgradePrompt from "./components/UpgradePrompt";
import VaultEntryList from "./components/VaultEntryList";
import { ARVRStudioPro } from "./components/ARVRStudioPro";
import WebXRExperience from "./components/WebXRExperience";
import VRARCreatorStudio from "./components/VRARCreatorStudio";
import Model3DViewer from "./components/Model3DViewer";
import VRRecordingStudio from "./components/VRRecordingStudio";
import ModelAssetLibrary from "./components/ModelAssetLibrary";
import ContentExportBackup from "./components/ContentExportBackup";
import CreatorCollaboration from "./components/CreatorCollaboration";
import { UnifiedSocialFeed } from "./components/UnifiedSocialFeed";
import { AIContentGenerator } from "./components/AIContentGenerator";
import AdvancedFileEditor from "./components/AdvancedFileEditor";
import { PhotoToolsHub } from "./components/PhotoToolsHub";
import { FacialMediaSorter } from "./components/FacialMediaSorter";
import { ContentPlannerPro } from "./components/ContentPlannerPro";
import { InfluencerVerification } from "./components/InfluencerVerification";
import { FamilyAccessSystem } from "./components/FamilyAccessSystem";
import { AudioProductionStudioPro } from "./components/AudioProductionStudioPro";
import GraphicDesignSuitePro from "./components/GraphicDesignSuitePro";
import { PrintOnDemand } from "./components/PrintOnDemand";
import { TradingCardDesigner } from "./components/TradingCardDesigner";
import { TipsAndDonations } from "./components/TipsAndDonations";
import CommissionMarketplace from "./components/CommissionMarketplace";
import { PremiumSubscription } from "./components/PremiumSubscription";
import Marketplace from "./components/Marketplace";
import MerchStore from "./components/MerchStore";
import NotificationBadge from "./notifications/NotificationBadge";
import MessageBadge from "./messaging/MessageBadge";
import MessagingSystem from "./messaging/MessagingSystem";
import AdvancedSearch from "./components/AdvancedSearch";
import ModerationDashboard from "./components/ModerationDashboard";
import MicoDevPanel from "./components/MicoDevPanel";
import FAQ from "./components/FAQ";
import AccountSettings from "./components/AccountSettings";
import AccountManagement from "./components/AccountManagement";

import { ToolLockGate } from "./components/ToolLockGate";
import { DevBalanceManager } from "./components/DevBalanceManager";
import { getUserBalance } from "./utils/toolUnlockSystem";
import { ProfileCreator } from "./components/ProfileCreator";
import { AIVideoGenerator } from "./components/AIVideoGenerator";
import { ProPhotoEditor } from "./components/ProPhotoEditor";
import { LanguageSelector } from "./components/LanguageSelector";
import { t } from "./utils/i18n";
import DeviceManager from "./components/DeviceManager";
import { isOwner } from "./utils/ownerAuth";
import { isVIP } from "./utils/vipAccess";
import UserProfileManager from "./components/UserProfileManager";
import SocialFeed from "./components/SocialFeed";
import CGIVideoCall from "./components/CGIVideoCall";
import VideoEditorPro from "./components/VideoEditorPro";

// New feature imports
import ThreeDModelViewer from "./components/ThreeDModelViewer";
import CollaborationRoom from "./components/CollaborationRoom";
import CloudRenderManager from "./components/CloudRenderManager";
import TimelineVideoEditor from "./components/TimelineVideoEditor";
import AssetLibrary from "./components/AssetLibrary";
import VoiceChatRoom from "./components/VoiceChatRoom";
import CreatorRevenueAnalytics from "./components/CreatorRevenueAnalytics";
import LiveStreamingStudio from "./components/LiveStreamingStudio";
import CommunityModTools from "./components/CommunityModTools";
import FanRewardsSystem from "./components/FanRewardsSystem";
import ExperimentalLab from "./components/ExperimentalLab";
import MythicLayer from "./components/MythicLayer";
import CreatorOverview from "./components/CreatorOverview";
import QuickCreateFAB from "./components/QuickCreateFAB";
import { CreatorAnalytics } from "./components/CreatorAnalytics";

export const CreatorDashboard = ({ userId, ipAddress = "127.0.0.1", tier = "free" }) => {
  // STRICT ADMIN CHECK - Only polotuspossumus@gmail.com
  const ownerEmail = localStorage.getItem('ownerEmail') || localStorage.getItem('userEmail');
  const storedUserId = localStorage.getItem('userId');
  const isAdminUser = (ownerEmail === 'polotuspossumus@gmail.com') || (storedUserId === 'owner');
  const isVipUser = isVIP(ownerEmail) || isAdminUser;
  
  const [isAdmin, setIsAdmin] = useState(isAdminUser);
  const [tosAccepted, setTosAccepted] = useState(isAdminUser ? true : false);
  const [creatorAgreementAccepted, setCreatorAgreementAccepted] = useState(isAdminUser ? true : false);
  const [currentTier] = useState(tier || 'General Access');
  const userTier = tier; // Add userTier variable for compatibility
  const [userBalance, setUserBalance] = useState(0);
  const [activeTab, setActiveTab] = useState('overview'); // Track active tab for navigation
  const version = "1.8.0"; // Production version with VR/AR

  /**
   * PASSIVE FEATURES (No Tabs - Run in Background):
   * - Media Processor (FacialMediaSorter): Automatically detects/sorts uploaded photos by faces
   * - Devices (DeviceManager): Manages device access passively across all tools
   * These work silently in the background without cluttering the navigation
   */

  // Check if user is verified owner - STRICT CHECK
  useEffect(() => {
    const checkOwner = async () => {
      const ownerStatus = await isOwner();
      // ONLY grant admin if verified owner
      setIsAdmin(ownerStatus);
      if (ownerStatus) {
        setTosAccepted(true);
        setCreatorAgreementAccepted(true);
        console.log('👑 Owner dashboard access granted');
      } else {
        console.log('🚫 Admin access denied - not owner');
      }
    };
    checkOwner();
  }, [userId]);

  // Load user balance on mount
  useEffect(() => {
    const balance = getUserBalance(userId);
    setUserBalance(balance);
  }, [userId]);

  // Check for pending family access code (client-side only)
  useEffect(() => {
    const pendingCode = localStorage.getItem('pending_family_code');
    if (pendingCode) {
      console.log('🎁 Redeeming family access code:', pendingCode);

      // Grant family access immediately (client-side)
      localStorage.setItem(`family_access_${userId}`, pendingCode);
      localStorage.setItem('family_access_type', 'free');
      localStorage.removeItem('pending_family_code');

      // Show success message
      setTimeout(() => {
        alert(`🎉 Welcome to ForTheWeebs!\n\nYour family access has been activated!\n\n✅ You now have FULL FREE ACCESS to all features!\n\n🚀 Start exploring your dashboard!`);
      }, 500);

      console.log('✅ Family access granted!');
    }
  }, [userId]);

  if (!tosAccepted) {
    return <TermsOfService onAccept={() => setTosAccepted(true)} />;
  }
  if (!creatorAgreementAccepted) {
    return (
      <CreatorAgreementGate
        userId={userId}
        ipAddress={ipAddress}
        version={version}
        onAccepted={() => setCreatorAgreementAccepted(true)}
      />
    );
  }
  return (
    <>
    <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="overview" className="dashboard-tabs">
      <TabsList>
        <TabsTrigger value="overview">📊 Overview</TabsTrigger>
        <TabsTrigger value="social">🌟 Social Feed</TabsTrigger>
        {isVipUser && <TabsTrigger value="accounts">👥 My Accounts</TabsTrigger>}
        <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
        <TabsTrigger value="help">❓ FAQ & Help</TabsTrigger>
        <TabsTrigger value="video">🎬 Video Editor</TabsTrigger>
        <TabsTrigger value="audio">🎵 Audio Production</TabsTrigger>
        <TabsTrigger value="arvr">🎭 AR/VR Studio</TabsTrigger>
        <TabsTrigger value="photo">📸 Photo Tools</TabsTrigger>
        <TabsTrigger value="design">🎨 Graphic Design</TabsTrigger>
        <TabsTrigger value="merch">🛍️ Merch Store</TabsTrigger>
        <TabsTrigger value="marketplace">🏪 Marketplace</TabsTrigger>
        {isVipUser && <TabsTrigger value="mythic" style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: '2px solid #FFD700',
          fontWeight: 'bold'
        }}>🌟 MYTHIC LAYER</TabsTrigger>}
        {isVipUser && <TabsTrigger value="experimental" style={{ 
          background: 'linear-gradient(135deg, #F44336 0%, #E91E63 100%)',
          color: 'white',
          border: '2px solid #FFC107'
        }}>⚠️ EXPERIMENTAL</TabsTrigger>}
      </TabsList>
      <TabsContent value="accounts">
        <AccountManagement />
      </TabsContent>
      <TabsContent value="settings">
        <AccountSettings userId={userId} />
      </TabsContent>
      <TabsContent value="help">
        <FAQ />
      </TabsContent>
      <TabsContent value="overview">
        <CreatorOverview 
          userId={userId}
          userTier={currentTier}
          isAdmin={isAdmin}
          isVip={currentTier === 'vip' || currentTier === 'PREMIUM_1000' || currentTier === 'LIFETIME_VIP'}
          creatorName={ownerEmail?.split('@')[0] || 'Creator'}
          onNavigate={setActiveTab}
        />
      </TabsContent>
      <TabsContent value="analytics">
        <CreatorAnalytics userId={userId} creatorId={userId} />
      </TabsContent>
      <TabsContent value="social">
        <SocialFeed userId={userId} userTier={currentTier} />
      </TabsContent>
      <TabsContent value="video">
        <ToolLockGate userId={userId} toolId="video">
          <div>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
                onClick={() => {
                  const editor = document.getElementById('video-editor-section');
                  if (editor) editor.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                ✂️ Video Editor
              </button>
              <button 
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
                onClick={() => {
                  const cgi = document.getElementById('cgi-section');
                  if (cgi) cgi.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                🎬 CGI Studio
              </button>
              <button 
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
                onClick={() => {
                  const ai = document.getElementById('ai-generator-section');
                  if (ai) ai.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                🤖 AI Generator
              </button>
              <button 
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
                onClick={() => {
                  const gif = document.getElementById('gif-generator-section');
                  if (gif) gif.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                🎞️ GIF Maker
              </button>
            </div>
            
            {/* Video Editor Section */}
            <div id="video-editor-section" style={{ marginBottom: '40px' }}>
              <h2 style={{ marginBottom: '20px', color: '#667eea' }}>✂️ Professional Video Editor</h2>
              <p style={{ color: '#888', marginBottom: '20px' }}>Timeline editing, transitions, effects, green screen - destroys Clipchamp, rivals Premiere Pro</p>
              <VideoEditorPro />
            </div>

            {/* CGI Section */}
            <div id="cgi-section" style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid rgba(102, 126, 234, 0.3)' }}>
              <h2 style={{ marginBottom: '20px', color: '#667eea' }}>🎬 CGI Video Studio</h2>
              <CGIVideoCall />
            </div>

            {/* AI Generator Section */}
            <div id="ai-generator-section" style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid rgba(102, 126, 234, 0.3)' }}>
              <h2 style={{ marginBottom: '20px', color: '#667eea' }}>🤖 AI Content Generator</h2>
              <AIContentGenerator userId={userId} />
            </div>

            {/* GIF Generator Section */}
            <div id="gif-generator-section" style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid rgba(102, 126, 234, 0.3)' }}>
              <h2 style={{ marginBottom: '20px', color: '#667eea' }}>🎞️ GIF Generator</h2>
              <div style={{ padding: '40px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', textAlign: 'center' }}>
                <h3 style={{ color: '#888', marginBottom: '15px' }}>GIF Maker Coming Soon</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>Convert videos to GIFs, add text overlays, optimize file size</p>
              </div>
            </div>
          </div>
        </ToolLockGate>
      </TabsContent>
      <TabsContent value="audio">
        <ToolLockGate userId={userId} toolId="audio">
          <AudioProductionStudioPro userId={userId} />
        </ToolLockGate>
      </TabsContent>
      <TabsContent value="arvr">
        <ToolLockGate userId={userId} toolId="arvr">
          <ARVRStudioPro userId={userId} />
        </ToolLockGate>
      </TabsContent>
      <TabsContent value="photo">
        <ToolLockGate userId={userId} toolId="photo">
          <PhotoToolsHub userId={userId} />
        </ToolLockGate>
      </TabsContent>
      <TabsContent value="design">
        <ToolLockGate userId={userId} toolId="design">
          <GraphicDesignSuitePro />
        </ToolLockGate>
      </TabsContent>
      <TabsContent value="mythic">
        <MythicLayer 
          userId={userId} 
          creatorName={ownerEmail?.split('@')[0] || 'Creator'}
        />
      </TabsContent>
      <TabsContent value="vr-recording">
        <ToolLockGate userId={userId} toolId="arvr">
          <VRRecordingStudio userId={userId} />
        </ToolLockGate>
      </TabsContent>
      <TabsContent value="3d-library">
        <ToolLockGate userId={userId} toolId="arvr">
          <ModelAssetLibrary userId={userId} />
        </ToolLockGate>
      </TabsContent>
      <TabsContent value="backup">
        <ContentExportBackup userId={userId} />
      </TabsContent>
      <TabsContent value="file-editor">
        <AdvancedFileEditor userId={userId} />
      </TabsContent>
      <TabsContent value="overlays">
        <OverlayPanel />
        <div style={{ marginTop: 32 }}>
          <h3>Your Vault Entries</h3>
          <VaultEntryList userId={userId} />
        </div>
      </TabsContent>
      <TabsContent value="tips">
        {userId === 'owner' ? (
          <TipsAndDonations creatorId={userId} creatorName={userId} />
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '24px', color: '#ff6b6b', marginBottom: '16px' }}>🔒 Tips Disabled</h2>
            <p style={{ fontSize: '16px', color: '#888' }}>Tipping requires PhotoDNA API for content moderation.</p>
          </div>
        )}
      </TabsContent>
      <TabsContent value="commissions">
        <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '24px', color: '#ff6b6b', marginBottom: '16px' }}>🔒 Commissions Disabled</h2>
          <p style={{ fontSize: '16px', color: '#888' }}>Commission marketplace requires PhotoDNA API for content moderation.</p>
        </div>
      </TabsContent>
      <TabsContent value="premium">
        <PremiumSubscription userId={userId} currentTier={currentTier} />
      </TabsContent>
      <TabsContent value="payments">
        <PaymentPanel />
      </TabsContent>
      <TabsContent value="legal">
        <LegalDocumentsList userId={userId} />
      </TabsContent>
      {isAdmin && (
        <TabsContent value="family-access">
          <FamilyAccessSystem userId={userId} isAdmin={isAdmin} />
        </TabsContent>
      )}
      {userId === "owner" && (
        <TabsContent value="earnings">
          <OwnerEarningsPanel />
        </TabsContent>
      )}
      {userId === "owner" && (
        <TabsContent value="devices">
          <DeviceManager isOwner={true} />
        </TabsContent>
      )}
      {userId === "owner" && (
        <TabsContent value="moderation">
          <ModerationDashboard />
        </TabsContent>
      )}
      {userId === "owner" && (
        <TabsContent value="mico">
          <MicoDevPanel />
        </TabsContent>
      )}
      {isAdmin && (
        <TabsContent value="profiles">
          <UserProfileManager />
        </TabsContent>
      )}
      <TabsContent value="3d-model">
        <ThreeDModelViewer userId={userId} />
      </TabsContent>
      <TabsContent value="collab-room">
        <CollaborationRoom userId={userId} />
      </TabsContent>
      <TabsContent value="cloud-render">
        <CloudRenderManager userId={userId} />
      </TabsContent>
      <TabsContent value="video-editor">
        <TimelineVideoEditor userId={userId} />
      </TabsContent>
      <TabsContent value="asset-lib">
        <AssetLibrary userId={userId} />
      </TabsContent>
      <TabsContent value="voice-chat">
        <VoiceChatRoom userId={userId} />
      </TabsContent>
      <TabsContent value="revenue">
        <CreatorRevenueAnalytics userId={userId} />
      </TabsContent>
      <TabsContent value="modtools">
        <CommunityModTools userId={userId} />
      </TabsContent>
      <TabsContent value="merch">
        <MerchStore userId={userId} />
      </TabsContent>
      <TabsContent value="marketplace">
        <div style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
            🏪 Creator Marketplace
          </h2>
          <p style={{ fontSize: '16px', color: '#888', marginBottom: '30px' }}>
            Buy and sell assets, templates, presets, and more
          </p>
          <Marketplace />
        </div>
      </TabsContent>
      <TabsContent value="rewards">
        <FanRewardsSystem userId={userId} />
      </TabsContent>
      <TabsContent value="experimental">
        <ExperimentalLab 
          userId={userId} 
          userTier={userTier}
          isAdmin={isAdmin}
          isVip={userTier === 'vip' || userTier === 'PREMIUM_1000' || userTier === 'LIFETIME_VIP'}
        />
      </TabsContent>
    </Tabs>

    {/* Quick Create Floating Action Button */}
    <QuickCreateFAB onNavigate={setActiveTab} />
    </>
  );
};

export const OwnerEarningsPanel = () => {
  const [topEarners] = useState([
    { username: "creator1", profit: 1200 },
    { username: "creator2", profit: 950 },
    { username: "creator3", profit: 800 },
  ]);
  return (
    <div style={{ padding: 24 }}>
      <h2>Top Earning Creators</h2>
      <ul>
        {topEarners.map((c) => (
          <li key={c.username}>
            <strong>{c.username}</strong>: ${c.profit.toLocaleString()}
          </li>
        ))}
      </ul>
      <p style={{ marginTop: 24, color: '#888' }}>
        Only visible to platform owner. Replace with real data for live tracking.
      </p>
    </div>
  );
};

export const OverlayPanel = () => {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="overlay-panel">
      <label className="overlay-label">
        Anime Overlay Enabled
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </label>
    </div>
  );
};

export const OverviewPanel = ({ userId }) => {
  const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('ownerEmail');
  const isOwner = userEmail === 'polotuspossumus@gmail.com';
  
  const [showTutorial, setShowTutorial] = useState(() => {
    // Owner never sees tutorial
    if (isOwner) return false;
    // Check if user has dismissed tutorial
    return localStorage.getItem(`tutorial_dismissed_${userId}`) !== 'true';
  });

  const dismissTutorial = () => {
    localStorage.setItem(`tutorial_dismissed_${userId}`, 'true');
    setShowTutorial(false);
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Clean Welcome Header */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: '#fff',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>
            Welcome Back! 👋
          </h2>
          <p style={{ opacity: 0.9, fontSize: '14px' }}>
            All your creative tools are ready to use
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <NotificationBadge />
        </div>
      </div>

      {/* Optional Tutorial (dismissable) */}
      {showTutorial && (
        <div style={{
          background: 'rgba(0, 255, 255, 0.05)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(0, 255, 255, 0.2)',
          marginBottom: '20px',
          position: 'relative',
        }}>
          <button
            onClick={dismissTutorial}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '5px 10px',
            }}
          >
            ✕
          </button>

          <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', color: '#0ff' }}>
            🎓 Quick Start Guide
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginTop: '15px',
          }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
              <strong style={{ color: '#0ff' }}>📸 Photo Editor</strong>
              <p style={{ fontSize: '13px', opacity: 0.8, marginTop: '5px' }}>
                Layers, masks, blend modes - professional editing power
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
              <strong style={{ color: '#0ff' }}>🎬 CGI Video</strong>
              <p style={{ fontSize: '13px', opacity: 0.8, marginTop: '5px' }}>
                Turn photos into AI-generated videos
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
              <strong style={{ color: '#0ff' }}>🎵 Audio Studio</strong>
              <p style={{ fontSize: '13px', opacity: 0.8, marginTop: '5px' }}>
                Multi-track recording with pro effects
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
              <strong style={{ color: '#0ff' }}>👤 Profile</strong>
              <p style={{ fontSize: '13px', opacity: 0.8, marginTop: '5px' }}>
                MySpace-style with music libraries
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Cards - No Marketing Fluff */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          padding: '20px',
          borderRadius: '12px',
          color: '#fff',
          cursor: 'pointer',
        }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>📸 Photo Tools</h3>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            Pro Editor • Mass Processor • Filters
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb, #f5576c)',
          padding: '20px',
          borderRadius: '12px',
          color: '#fff',
          cursor: 'pointer',
        }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>🎵 Audio</h3>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            Multi-track • Effects • Export
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
          padding: '20px',
          borderRadius: '12px',
          color: '#fff',
          cursor: 'pointer',
        }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>🎬 CGI Video</h3>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            Photo → Style → Video
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
          padding: '20px',
          borderRadius: '12px',
          color: '#fff',
          cursor: 'pointer',
        }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>👤 Profile</h3>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            Showcase • Music • Content
          </p>
        </div>
      </div>

      {/* Dev balance manager - OWNER ONLY */}
      {userId === "owner" && (
        <div style={{ marginTop: '20px' }}>
          <DevBalanceManager userId={userId} />
        </div>
      )}
    </div>
  );
};

export const PaymentPanel = () => (
  <div style={{ padding: 24 }}>
    <h2>Payments</h2>
    <p>Payment history and actions will appear here.</p>
  </div>
);
