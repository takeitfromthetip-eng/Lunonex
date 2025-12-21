/* eslint-disable */
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider, useAuth } from "./components/AuthSupabase.jsx";
import { LegalDocumentsList } from "./components/LegalDocumentsList.jsx";
import CreatorSignup from "./CreatorSignup.jsx";
import PaymentModule from "./PaymentModule.jsx";
import { CreatorDashboard } from "./CreatorDashboard.jsx";
import BugReporter from "./components/BugReporter.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { ToastContainer } from "./components/Toast.jsx";
import { ThemeProvider } from "./components/ThemeToggle.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import A11ySkipLink from "./components/A11ySkipLink.jsx";
import InstallPWA from "./components/InstallPWA.jsx";
import CommandPalette from "./components/CommandPalette.jsx";
import QuickActions from "./components/QuickActions.jsx";
import AchievementSystem from "./components/AchievementSystem.jsx";
import InteractiveTutorial from "./components/InteractiveTutorial.jsx";
import HelpButton from "./components/HelpButton.jsx";
import Invite from "./pages/Invite.jsx";
import { NotificationProvider } from "./notifications/NotificationProvider.jsx";
import EngagementTracker from "./components/EngagementTracker.jsx";
import MicoAssistant from "./components/MicoAssistant.jsx";
import MicoDevPanel from "./components/MicoDevPanel.jsx";
import QuickAccessWidget from "./components/QuickAccessWidget.jsx";
import UserMenu from "./components/UserMenu.jsx";
import Login from "./components/Login.jsx";
import { registerServiceWorker } from "./utils/registerServiceWorker.js";
import { autoLoginOwner, isDeviceTrusted } from "./utils/deviceAuth.js";
import { requireOwner, isOwner } from "./utils/ownerAuth.js";
import { isLifetimeVIP, shouldSkipPayment } from './utils/vipAccess.js';
import { initMobileTouchOptimizations, isCapacitor } from './utils/mobileOptimizations';
import { validateAdminSession, isActualOwner, grantAdminAccess } from './utils/adminSecurity';
import './utils/notifications.js'; // Import notification handler
import featureDetector from './utils/featureDetection.js';
import FeatureDisabledBanner from './components/FeatureDisabledBanner.jsx';
import { initBugFixer } from './utils/bugFixer.js';

// Register service worker for PWA support
registerServiceWorker();

// Initialize bug fixer - automatic error tracking
if (typeof window !== 'undefined') {
  initBugFixer();
}

// Initialize mobile optimizations
if (typeof window !== 'undefined') {
  initMobileTouchOptimizations();
  
  // Log platform info
  if (isCapacitor()) {
    console.log('🚀 Running in Capacitor native app');
  } else {
    console.log('🌐 Running in web browser');
  }
}

// SECURITY: Validate admin session on page load - remove invalid admin keys
validateAdminSession();

// CHECK OWNER ACCESS BEFORE ANYTHING RENDERS - ONLY FOR ACTUAL OWNER
const currentEmail = localStorage.getItem('ownerEmail') || localStorage.getItem('userEmail');
const currentUserId = localStorage.getItem('userId');

if (isActualOwner(currentEmail) || currentUserId === 'owner') {
  // Verify and grant proper owner access
  grantAdminAccess(currentEmail || 'polotuspossumus@gmail.com');
}

function AppFlow() {
  // FORCE OWNER ACCESS FIRST - Before any state logic
  const currentEmail = localStorage.getItem('ownerEmail') || localStorage.getItem('userEmail');
  const currentUserId = localStorage.getItem('userId');

  // If this is the actual owner, ensure admin access
  if (isActualOwner(currentEmail) || currentUserId === 'owner') {
    grantAdminAccess(currentEmail || 'polotuspossumus@gmail.com');
  }

  // Feature detection state
  const [features, setFeatures] = useState(featureDetector.getFeatures());

  // Subscribe to feature updates
  useEffect(() => {
    const unsubscribe = featureDetector.subscribe(setFeatures);
    featureDetector.checkFeatures(); // Check on mount
    return unsubscribe;
  }, []);

  const [step, setStep] = useState(() => {
    // Check for URL parameters first
    const params = new URLSearchParams(window.location.search);
    
    // PERSISTENT AUTH CHECK - if "stay logged in" is active and valid
    const persistentAuth = localStorage.getItem('persistentAuth');
    const authExpiry = localStorage.getItem('authExpiry');
    const now = Date.now();
    
    if (persistentAuth === 'true' && authExpiry && now < parseInt(authExpiry)) {
      // Valid persistent session - check if owner
      const ownerEmail = localStorage.getItem('ownerEmail');
      const userId = localStorage.getItem('userId');
      
      if (userId === 'owner' && isActualOwner(ownerEmail)) {
        console.log('🔐 Persistent session active - auto-login');
        return 3; // Dashboard
      }
      
      // Regular user with persistent auth
      if (localStorage.getItem('authToken')) {
        return 3; // Dashboard
      }
    } else if (persistentAuth) {
      // Expired persistent auth - clear it
      localStorage.removeItem('persistentAuth');
      localStorage.removeItem('authExpiry');
    }
    
    // OWNER CHECK - if owner credentials exist but no persistent auth, show login
    const ownerEmail = localStorage.getItem('ownerEmail');
    const userId = localStorage.getItem('userId');
    
    if (userId === 'owner' && isActualOwner(ownerEmail)) {
      // Owner exists but no persistent auth - require login
      return 'login';
    }

    // REGULAR USER CHECK - if has auth token, go to dashboard
    if (localStorage.getItem('authToken')) {
      return 3; // Dashboard
    }

    // MICO DIRECT ACCESS
    if (params.get('mico') === 'true') {
      console.log('🧠 Mico direct access mode activated');
      return 'mico';
    }

    // OWNER RESTORE MODE
    if (params.get('restore') === 'owner' && isActualOwner(ownerEmail)) {
      grantAdminAccess('polotuspossumus@gmail.com');
      window.history.replaceState({}, '', '/');
      return 3; // Dashboard
    }

    // TRUSTED DEVICE AUTO-LOGIN (already validates owner email)
    if (autoLoginOwner()) {
      console.log('✅ Trusted device auto-login successful');
      return 3; // Dashboard
    }

    // FAMILY ACCESS CODE CHECK
    const familyCode = params.get('familyCode') || params.get('family') || params.get('code');
    if (familyCode) {
      console.log('🎁 Family code found:', familyCode);
      // Store the family access code
      localStorage.setItem('pending_family_code', familyCode);
      localStorage.setItem(`family_access_user`, familyCode);
      console.log('✅ Family code stored, will start at legal/TOS');
      // Family members still need to accept legal docs - start at step 0
      return 0;
    }

    // Check legal acceptance status first (used by multiple checks below)
    const hasAcceptedLegal = localStorage.getItem('legalAccepted') === 'true';
    const hasOnboarded = localStorage.getItem('hasOnboarded') === 'true';

    // REFERRAL CODE CHECK
    const refCode = params.get('ref') || params.get('referral') || params.get('invite');
    if (refCode) {
      localStorage.setItem('referral_code', refCode);
      console.log('🎉 Referral code detected:', refCode);
      // Start at signup step (1) if they have a referral and accepted legal
      return hasAcceptedLegal ? (hasOnboarded ? 3 : 1) : 0;
    }

    // ?app=true CHECK - Launch Dashboard button
    const skipToApp = params.get('app') === 'true';
    if (skipToApp) {
      // SECURITY: Only if already authenticated
      const hasAuthToken = localStorage.getItem('authToken');
      const hasValidOwnerAccess = isActualOwner(localStorage.getItem('ownerEmail')) && localStorage.getItem('userId') === 'owner';
      
      if (hasAuthToken || hasValidOwnerAccess) {
        return 3; // Go directly to dashboard
      } else {
        // Not authenticated - show login
        return 'login';
      }
    }

    // DEFAULT FLOW
    if (hasAcceptedLegal) {
      // Returning user who accepted legal - show login screen
      return 'login';
    } else {
      // New user - start at Legal (step 0)
      return 0;
    }
  });
  const [userTier, setUserTier] = useState("free");
  const [isAdmin, setIsAdmin] = useState(() => {
    // SECURITY: Only actual owner gets admin state
    const userId = localStorage.getItem("userId");
    const adminAuth = localStorage.getItem("adminAuthenticated");
    const ownerEmail = localStorage.getItem("ownerEmail");
    
    return (userId === "owner" || adminAuth === "true") && isActualOwner(ownerEmail);
  });
  const [referralCode] = useState(() => localStorage.getItem('referral_code'));
  const [hasFamilyAccess] = useState(() => !!localStorage.getItem('pending_family_code') || !!localStorage.getItem('family_access_user'));

  console.log('🚀 AppFlow render:', { step, isAdmin, hasFamilyAccess });

  // Check if this is the invite page
  if (window.location.pathname === '/invite' || window.location.pathname.startsWith('/invite/')) {
    return <Invite />;
  }

  // Check if user is authenticated (owner OR regular user with auth token)
  const hasAuth = localStorage.getItem('authToken') || 
                  (localStorage.getItem('userId') === 'owner' && isActualOwner(localStorage.getItem('ownerEmail')));

  // If not authenticated, show the onboarding flow (starts at step 0)
  // Once they complete onboarding, they'll be logged in and redirected to dashboard
  if (!hasAuth) {
    // If they're at root and not authenticated, start onboarding flow
    // step 0 = legal docs, step 1 = signup, step 2 = payment, step 3 = dashboard
    // The existing step logic below handles this
  }

  // Check if this is admin panel (owner only)
  if (window.location.pathname === '/admin') {
    // SECURITY: Only actual owner can access admin panel
    if (isAdmin && isActualOwner(localStorage.getItem('ownerEmail'))) {
      const AdminPanel = require('./components/AdminPanel').default;
      return <AdminPanel />;
    } else {
      // Redirect to home
      console.warn('⚠️ Non-owner attempted admin panel access');
      window.location.href = '/';
      return null;
    }
  }

  // Check if this is a landing site page
  const landingPaths = ['/apply', '/trial', '/parental-controls', '/compliance-2257', '/admin/applications'];
  if (landingPaths.includes(window.location.pathname)) {
    const LandingSite = require('./LandingSite').default;
    return <LandingSite />;
  }

  const userId = isAdmin ? "owner" : `user_${Date.now()}`;

  const handleLegalAccepted = () => {
    // Mark all required legal docs as accepted
    const legalAcceptances = {};
    // Assuming standard docs: tos, privacy, community-guidelines, etc.
    ['tos', 'privacy', 'community-guidelines', 'dmca', 'coppa', 'age-verification'].forEach(docId => {
      legalAcceptances[docId] = true;
    });
    localStorage.setItem("legalAccepted", JSON.stringify(legalAcceptances));
    localStorage.setItem("tosAccepted", "true");
    localStorage.setItem("privacyAccepted", "true");
    setStep(1);
  };

  const handleSignupComplete = () => setStep(2);

  const handlePaymentComplete = (tier) => {
    setUserTier(tier || "free");
    localStorage.setItem("hasOnboarded", "true");
    setStep(3);
  };

  const handleSkipPayment = () => {
    setUserTier("free");
    localStorage.setItem("hasOnboarded", "true");
    setStep(3);
  };

  // Check if user is VIP and auto-grant access
  useEffect(() => {
    if (step === 2) {
      const userEmail = localStorage.getItem('ownerEmail') || localStorage.getItem('userEmail');
      if (userEmail && shouldSkipPayment(userEmail)) {
        console.log('🌟 LIFETIME VIP DETECTED - Skipping payment, granting full access');
        localStorage.setItem('userTier', 'LIFETIME_VIP');
        localStorage.setItem("hasOnboarded", "true");
        setUserTier('LIFETIME_VIP');
        setStep(3);
      }
    }
  }, [step]);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <React.StrictMode>
          {step === 'mico' ? (
            // Direct Mico interface mode
            <MicoDevPanel />
          ) : (
            <>
              <A11ySkipLink />
              <ToastContainer />
              <FeatureDisabledBanner features={features} />
              {(step === 3 || localStorage.getItem('userId')) && <UserMenu />}
              <InstallPWA />
              <CommandPalette />
              <QuickActions />
              <AchievementSystem userId={userId} />
              <InteractiveTutorial onComplete={() => console.log('Tutorial completed!')} />
              <HelpButton />
              {step === 'login' && (
                <Login onLogin={() => {
                  // After successful login, go to dashboard
                  setStep(3);
                }} />
              )}
              {step === 0 && (<div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}><h1 style={{ marginBottom: '30px' }}>📜 Terms & Privacy</h1><LegalDocumentsList userId={userId} /><button onClick={handleLegalAccepted} style={{ marginTop: 24, padding: '16px 32px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px' }}>Accept & Continue →</button><div style={{ marginTop: '20px', textAlign: 'center' }}><p style={{ color: '#666', fontSize: '14px' }}>Already have an account? <button onClick={() => setStep('login')} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px', fontWeight: 600 }}>Sign In</button></p></div></div>)}
              {step === 1 && (<div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}><h1 style={{ marginBottom: '30px' }}>✨ Create Your Account</h1>{referralCode && (<div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '16px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center' }}><div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div><div style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>You've been referred!</div><div style={{ color: 'rgba(255,255,255,0.9)', marginTop: '8px' }}>Code: <strong>{referralCode}</strong></div><div style={{ color: 'rgba(255,255,255,0.85)', marginTop: '4px', fontSize: '0.9rem' }}>You'll get special bonuses when you sign up!</div></div>)}<CreatorSignup /><button onClick={handleSignupComplete} style={{ marginTop: 24, padding: '16px 32px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px' }}>Continue to Pricing →</button><div style={{ marginTop: '20px', textAlign: 'center' }}><p style={{ color: '#666', fontSize: '14px' }}>Already have an account? <button onClick={() => setStep('login')} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px', fontWeight: 600 }}>Sign In</button></p></div></div>)}
              {step === 2 && (<div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}><h1 style={{ marginBottom: '10px' }}>💎 Choose Your Tier</h1><p style={{ marginBottom: '30px', opacity: 0.8 }}>Start free or unlock premium creator tools</p><PaymentModule onPaymentComplete={handlePaymentComplete} /><button onClick={handleSkipPayment} style={{ marginTop: 24, padding: '16px 32px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: '#667eea', border: '2px solid #667eea', borderRadius: '8px' }}>Skip - Start with Free Tools</button></div>)}
              {step === 3 && (
                <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
                  <CreatorDashboard userId={userId} tier={userTier} />
                </div>
              )}
              <BugReporter />
              <CookieConsent />
              <MicoAssistant />
              <QuickAccessWidget />
            </>
          )}
        </React.StrictMode>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <AuthProvider>
    <NotificationProvider>
      <EngagementTracker>
        <AppFlow />
      </EngagementTracker>
    </NotificationProvider>
  </AuthProvider>
);
