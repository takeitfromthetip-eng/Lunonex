/**
 * Tier Access Control System
 * 
 * Tier Structure:
 * 1. Owner + VIPs (10 max) - FREE EVERYTHING FOREVER
 * 2. $1000/month - Power users (admin powers, pay creator fees)
 * 3. $500/month - Full unlock (no admin, pay creator fees)
 * 4. $250/month - Premium (no VR/AR)
 * 5. $100/month - Standard (basic CGI)
 * 6. $50/month - Basic (minimal)
 * 7. $15 + $5/month - Adult access only
 * 8. FREE - Family friendly, safe
 */

import { isLifetimeVIP, isOwner as checkIsOwner } from '../../utils/vipAccess.js';

export const TIERS = {
  OWNER: 'OWNER',
  VIP: 'LIFETIME_VIP',
  PREMIUM_1000: 'PREMIUM_1000',
  PREMIUM_500: 'PREMIUM_500',
  PREMIUM_250: 'PREMIUM_250',
  STANDARD_100: 'STANDARD_100',
  BASIC_50: 'BASIC_50',
  ADULT_15: 'ADULT_15',
  FREE: 'FREE'
};

// Owner email for hardcoded checks
const OWNER_EMAIL = 'polotuspossumus@gmail.com';

export const checkTierAccess = (userId, userTier, userEmail) => {
  // Check owner first - polotuspossumus@gmail.com gets EVERYTHING
  const isOwner = checkIsOwner(userEmail) || userId === 'owner' || userEmail === OWNER_EMAIL || userTier === TIERS.OWNER;
  
  // Check for VIP - includes LIFETIME_VIP, platinum tier, and isLifetimeVIP() check
  const isVIP = userTier === TIERS.VIP || userTier === 'platinum' || isLifetimeVIP(userEmail) || userTier === 'LIFETIME_VIP';

  // VIPs automatically get PREMIUM_1000 tier benefits + admin powers
  const effectiveTier = isOwner ? TIERS.OWNER : (isVIP ? TIERS.PREMIUM_1000 : (userTier || TIERS.FREE));

  return {
    // Core tier info
    tier: isOwner ? TIERS.OWNER : (isVIP ? TIERS.VIP : (userTier || TIERS.FREE)),
    effectiveTier, // What tier benefits they actually get
    isOwner,
    isVIP,

    // Admin powers - OWNER + VIPs ONLY (not even $1000 tier)
    hasAdminPowers: isOwner || isVIP,

    // Free content access - Owner and VIPs get everything free
    hasFreeContentAccess: isOwner || isVIP,
    
    // CGI Features
    hasCGI: {
      full: isOwner || isVIP || userTier === TIERS.PREMIUM_1000 || userTier === TIERS.PREMIUM_500,
      advanced: isOwner || isVIP || userTier === TIERS.PREMIUM_1000 || userTier === TIERS.PREMIUM_500 || userTier === TIERS.PREMIUM_250,
      basic: isOwner || isVIP || [TIERS.PREMIUM_1000, TIERS.PREMIUM_500, TIERS.PREMIUM_250, TIERS.STANDARD_100].includes(userTier),
      minimal: isOwner || isVIP || [TIERS.PREMIUM_1000, TIERS.PREMIUM_500, TIERS.PREMIUM_250, TIERS.STANDARD_100, TIERS.BASIC_50].includes(userTier)
    },
    
    // VR/AR Access - Owner, VIPs, $1000, and $500 tiers only
    hasVRAR: isOwner || isVIP || userTier === TIERS.PREMIUM_1000 || userTier === TIERS.PREMIUM_500,
    
    // Content access
    canViewAdultContent: isOwner || isVIP || [TIERS.PREMIUM_1000, TIERS.PREMIUM_500, TIERS.PREMIUM_250, TIERS.STANDARD_100, TIERS.BASIC_50, TIERS.ADULT_15].includes(userTier),
    
    // Feature limits
    features: {
      videoEffects: isOwner || isVIP || [TIERS.PREMIUM_1000, TIERS.PREMIUM_500, TIERS.PREMIUM_250, TIERS.STANDARD_100].includes(userTier),
      liveStreaming: isOwner || isVIP || [TIERS.PREMIUM_1000, TIERS.PREMIUM_500, TIERS.PREMIUM_250].includes(userTier),
      customBackgrounds: isOwner || isVIP || [TIERS.PREMIUM_1000, TIERS.PREMIUM_500, TIERS.PREMIUM_250, TIERS.STANDARD_100].includes(userTier),
      faceFilters: isOwner || isVIP || [TIERS.PREMIUM_1000, TIERS.PREMIUM_500].includes(userTier),
      arStickers: isOwner || isVIP || [TIERS.PREMIUM_1000, TIERS.PREMIUM_500].includes(userTier),
      textOverlays: isOwner || isVIP || [TIERS.PREMIUM_1000, TIERS.PREMIUM_500, TIERS.PREMIUM_250, TIERS.STANDARD_100, TIERS.BASIC_50].includes(userTier),
      colorGrading: isOwner || isVIP || [TIERS.PREMIUM_1000, TIERS.PREMIUM_500, TIERS.PREMIUM_250].includes(userTier),
      audioReactive: isOwner || isVIP || [TIERS.PREMIUM_1000, TIERS.PREMIUM_500].includes(userTier),
      particleEffects: isOwner || isVIP || [TIERS.PREMIUM_1000, TIERS.PREMIUM_500, TIERS.PREMIUM_250].includes(userTier),
      greenScreen: isOwner || isVIP || [TIERS.PREMIUM_1000, TIERS.PREMIUM_500].includes(userTier),
    }
  };
};

export const getTierName = (tier) => {
  const names = {
    [TIERS.OWNER]: 'Owner',
    [TIERS.VIP]: 'VIP',
    [TIERS.PREMIUM_1000]: '$1000 Power User',
    [TIERS.PREMIUM_500]: '$500 Full Unlock',
    [TIERS.PREMIUM_250]: '$250 Premium',
    [TIERS.STANDARD_100]: '$100 Standard',
    [TIERS.BASIC_50]: '$50 Basic',
    [TIERS.ADULT_15]: 'Adult Access',
    [TIERS.FREE]: 'Free'
  };
  return names[tier] || 'Free';
};

export const getTierPrice = (tier) => {
  const prices = {
    [TIERS.OWNER]: 0,
    [TIERS.VIP]: 0,
    [TIERS.PREMIUM_1000]: 100000, // $1000 in cents
    [TIERS.PREMIUM_500]: 50000,   // $500
    [TIERS.PREMIUM_250]: 25000,   // $250
    [TIERS.STANDARD_100]: 10000,  // $100
    [TIERS.BASIC_50]: 5000,       // $50
    [TIERS.ADULT_15]: 1500,       // $15 one-time + $5/month
    [TIERS.FREE]: 0
  };
  return prices[tier] || 0;
};
