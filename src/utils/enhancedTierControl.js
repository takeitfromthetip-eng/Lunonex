/* eslint-disable */
/**
 * ENHANCED TIER ACCESS CONTROL SYSTEM
 * Prevents users from accessing features they haven't paid for
 * Includes watermarking, export restrictions, and feature gating
 */

import { TIERS, checkTierAccess } from './tierAccess';
import { supabase } from '../lib/supabase';

// Feature definitions with tier requirements
export const FEATURE_TIERS = {
  // Core Features
  PROJECT_LIMIT: {
    [TIERS.FREE]: 5,
    [TIERS.ADULT_15]: 10,
    [TIERS.BASIC_50]: 25,
    [TIERS.STANDARD_100]: 100,
    [TIERS.PREMIUM_250]: 500,
    [TIERS.PREMIUM_500]: -1, // Unlimited
    [TIERS.PREMIUM_1000]: -1,
    [TIERS.VIP]: -1,
    [TIERS.OWNER]: -1,
  },

  STORAGE_LIMIT_GB: {
    [TIERS.FREE]: 0.1, // 100MB
    [TIERS.ADULT_15]: 0.5, // 500MB
    [TIERS.BASIC_50]: 2,
    [TIERS.STANDARD_100]: 10,
    [TIERS.PREMIUM_250]: 50,
    [TIERS.PREMIUM_500]: 200,
    [TIERS.PREMIUM_1000]: 500,
    [TIERS.VIP]: -1, // Unlimited
    [TIERS.OWNER]: -1,
  },

  EXPORT_QUALITY: {
    [TIERS.FREE]: '720p',
    [TIERS.ADULT_15]: '720p',
    [TIERS.BASIC_50]: '1080p',
    [TIERS.STANDARD_100]: '1080p',
    [TIERS.PREMIUM_250]: '4K',
    [TIERS.PREMIUM_500]: '4K',
    [TIERS.PREMIUM_1000]: '8K',
    [TIERS.VIP]: '8K',
    [TIERS.OWNER]: '8K',
  },

  WATERMARK_REMOVAL: {
    [TIERS.FREE]: false,
    [TIERS.ADULT_15]: false,
    [TIERS.BASIC_50]: false,
    [TIERS.STANDARD_100]: true,
    [TIERS.PREMIUM_250]: true,
    [TIERS.PREMIUM_500]: true,
    [TIERS.PREMIUM_1000]: true,
    [TIERS.VIP]: true,
    [TIERS.OWNER]: true,
  },

  // CGI Features
  CGI_EFFECTS: {
    [TIERS.FREE]: ['basic_filters'],
    [TIERS.ADULT_15]: ['basic_filters'],
    [TIERS.BASIC_50]: ['basic_filters', 'color_grading'],
    [TIERS.STANDARD_100]: ['basic_filters', 'color_grading', 'text_overlays', 'backgrounds'],
    [TIERS.PREMIUM_250]: ['basic_filters', 'color_grading', 'text_overlays', 'backgrounds', 'particle_effects', 'live_streaming'],
    [TIERS.PREMIUM_500]: 'ALL',
    [TIERS.PREMIUM_1000]: 'ALL',
    [TIERS.VIP]: 'ALL',
    [TIERS.OWNER]: 'ALL',
  },

  // Advanced Features
  VR_AR_ACCESS: {
    [TIERS.FREE]: false,
    [TIERS.ADULT_15]: false,
    [TIERS.BASIC_50]: false,
    [TIERS.STANDARD_100]: false,
    [TIERS.PREMIUM_250]: false,
    [TIERS.PREMIUM_500]: true,
    [TIERS.PREMIUM_1000]: true,
    [TIERS.VIP]: true,
    [TIERS.OWNER]: true,
  },

  AI_TOOLS: {
    [TIERS.FREE]: [],
    [TIERS.ADULT_15]: [],
    [TIERS.BASIC_50]: ['ai_captions'],
    [TIERS.STANDARD_100]: ['ai_captions', 'ai_thumbnails'],
    [TIERS.PREMIUM_250]: ['ai_captions', 'ai_thumbnails', 'ai_script_writer'],
    [TIERS.PREMIUM_500]: ['ai_captions', 'ai_thumbnails', 'ai_script_writer', 'ai_voice', 'ai_avatars'],
    [TIERS.PREMIUM_1000]: 'ALL',
    [TIERS.VIP]: 'ALL',
    [TIERS.OWNER]: 'ALL',
  },

  ADMIN_PANEL: {
    [TIERS.FREE]: false,
    [TIERS.ADULT_15]: false,
    [TIERS.BASIC_50]: false,
    [TIERS.STANDARD_100]: false,
    [TIERS.PREMIUM_250]: false,
    [TIERS.PREMIUM_500]: false,
    [TIERS.PREMIUM_1000]: false, // Even $1000 tier doesn't get admin
    [TIERS.VIP]: true,
    [TIERS.OWNER]: true,
  },

  API_ACCESS: {
    [TIERS.FREE]: false,
    [TIERS.ADULT_15]: false,
    [TIERS.BASIC_50]: false,
    [TIERS.STANDARD_100]: false,
    [TIERS.PREMIUM_250]: false,
    [TIERS.PREMIUM_500]: true,
    [TIERS.PREMIUM_1000]: true,
    [TIERS.VIP]: true,
    [TIERS.OWNER]: true,
  },

  CLOUD_RENDERING: {
    [TIERS.FREE]: false,
    [TIERS.ADULT_15]: false,
    [TIERS.BASIC_50]: false,
    [TIERS.STANDARD_100]: false,
    [TIERS.PREMIUM_250]: true,
    [TIERS.PREMIUM_500]: true,
    [TIERS.PREMIUM_1000]: true,
    [TIERS.VIP]: true,
    [TIERS.OWNER]: true,
  },

  COLLABORATION: {
    [TIERS.FREE]: 0, // No collaborators
    [TIERS.ADULT_15]: 0,
    [TIERS.BASIC_50]: 1,
    [TIERS.STANDARD_100]: 3,
    [TIERS.PREMIUM_250]: 10,
    [TIERS.PREMIUM_500]: 50,
    [TIERS.PREMIUM_1000]: -1, // Unlimited
    [TIERS.VIP]: -1,
    [TIERS.OWNER]: -1,
  },
};

/**
 * Check if user can access a specific feature
 */
export function canAccessFeature(userId, userTier, featureName) {
  const access = checkTierAccess(userId, userTier);
  const featureTiers = FEATURE_TIERS[featureName];

  if (!featureTiers) {
    console.warn(`Unknown feature: ${featureName}`);
    return false;
  }

  const tierValue = featureTiers[access.tier];

  // Handle boolean features
  if (typeof tierValue === 'boolean') {
    return tierValue;
  }

  // Handle array features (list of allowed items)
  if (Array.isArray(tierValue)) {
    return tierValue;
  }

  // Handle numeric features (limits)
  if (typeof tierValue === 'number') {
    return tierValue;
  }

  // Handle "ALL" access
  if (tierValue === 'ALL') {
    return true;
  }

  return false;
}

/**
 * Get feature value for user's tier
 */
export function getFeatureValue(userTier, featureName) {
  const featureTiers = FEATURE_TIERS[featureName];
  if (!featureTiers) return null;

  return featureTiers[userTier] || featureTiers[TIERS.FREE];
}

/**
 * Check if user has reached their limit for a feature
 */
export async function checkFeatureUsage(userId, featureName) {
  try {
    // Get user's tier
    const { data: userData, error } = await supabase
      .from('users')
      .select('tier, feature_usage')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const limit = getFeatureValue(userData.tier, featureName);

    // Unlimited access
    if (limit === -1 || limit === 'ALL') {
      return {
        allowed: true,
        usage: 0,
        limit: -1,
        remaining: -1,
      };
    }

    // Check current usage
    const usage = userData.feature_usage?.[featureName] || 0;

    return {
      allowed: usage < limit,
      usage,
      limit,
      remaining: Math.max(0, limit - usage),
    };

  } catch (error) {
    console.error('Error checking feature usage:', error);
    return {
      allowed: false,
      error: error.message,
    };
  }
}

/**
 * Increment feature usage counter
 */
export async function incrementFeatureUsage(userId, featureName) {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('feature_usage')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const currentUsage = userData.feature_usage || {};
    currentUsage[featureName] = (currentUsage[featureName] || 0) + 1;

    await supabase
      .from('users')
      .update({ feature_usage: currentUsage })
      .eq('id', userId);

    return { success: true, newUsage: currentUsage[featureName] };

  } catch (error) {
    console.error('Error incrementing feature usage:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Apply watermark to free tier exports
 */
export function applyWatermark(content, userId, userTier) {
  const canRemove = getFeatureValue(userTier, 'WATERMARK_REMOVAL');

  if (canRemove) {
    return content; // No watermark for paid tiers
  }

  // Apply watermark for free tiers
  return {
    ...content,
    watermark: {
      text: 'Made with ForTheWeebs.com',
      position: 'bottom-right',
      opacity: 0.7,
      size: '14px',
      color: 'white',
      userId: userId.slice(0, 8), // For tracking leaks
    },
  };
}

/**
 * Restrict export quality based on tier
 */
export function getExportQuality(userTier) {
  return getFeatureValue(userTier, 'EXPORT_QUALITY');
}

/**
 * Quality presets
 */
export const QUALITY_PRESETS = {
  '480p': { width: 854, height: 480, bitrate: 1500 },
  '720p': { width: 1280, height: 720, bitrate: 2500 },
  '1080p': { width: 1920, height: 1080, bitrate: 5000 },
  '4K': { width: 3840, height: 2160, bitrate: 20000 },
  '8K': { width: 7680, height: 4320, bitrate: 50000 },
};

export function getQualitySettings(userTier) {
  const quality = getExportQuality(userTier);
  return QUALITY_PRESETS[quality] || QUALITY_PRESETS['720p'];
}

/**
 * Enforce tier limits on upload
 */
export async function validateUpload(userId, userTier, fileSize) {
  const storageLimit = getFeatureValue(userTier, 'STORAGE_LIMIT_GB') * 1024 * 1024 * 1024; // Convert to bytes

  if (storageLimit === -1) {
    return { allowed: true, unlimited: true };
  }

  try {
    // Get current storage usage
    const { data, error } = await supabase
      .from('users')
      .select('storage_used')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const currentUsage = data.storage_used || 0;
    const newUsage = currentUsage + fileSize;

    if (newUsage > storageLimit) {
      return {
        allowed: false,
        reason: 'STORAGE_LIMIT_EXCEEDED',
        message: `Storage limit exceeded. Used: ${(currentUsage / (1024 * 1024)).toFixed(2)}MB / ${(storageLimit / (1024 * 1024)).toFixed(2)}MB`,
        currentUsage,
        limit: storageLimit,
      };
    }

    return {
      allowed: true,
      currentUsage,
      limit: storageLimit,
      remaining: storageLimit - newUsage,
    };

  } catch (error) {
    console.error('Error validating upload:', error);
    return { allowed: false, error: error.message };
  }
}

/**
 * Update storage usage after upload/delete
 */
export async function updateStorageUsage(userId, sizeDelta) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('storage_used')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const newUsage = Math.max(0, (data.storage_used || 0) + sizeDelta);

    await supabase
      .from('users')
      .update({ storage_used: newUsage })
      .eq('id', userId);

    return { success: true, newUsage };

  } catch (error) {
    console.error('Error updating storage usage:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Feature gate component props
 */
export function createFeatureGate(featureName, userTier) {
  const hasAccess = canAccessFeature(null, userTier, featureName);
  const value = getFeatureValue(userTier, featureName);

  return {
    hasAccess,
    value,
    upgrade: !hasAccess, // Show upgrade prompt if no access
    upgradeMessage: getUpgradeMessage(featureName, userTier),
  };
}

/**
 * Generate upgrade message for locked features
 */
function getUpgradeMessage(featureName, currentTier) {
  // Find the minimum tier that unlocks this feature
  const featureTiers = FEATURE_TIERS[featureName];
  if (!featureTiers) return 'Upgrade to access this feature';

  const tierOrder = [
    TIERS.FREE,
    TIERS.ADULT_15,
    TIERS.BASIC_50,
    TIERS.STANDARD_100,
    TIERS.PREMIUM_250,
    TIERS.PREMIUM_500,
    TIERS.PREMIUM_1000,
    TIERS.VIP,
  ];

  for (const tier of tierOrder) {
    const value = featureTiers[tier];

    // Feature is unlocked at this tier
    if (value === true || value === 'ALL' || (Array.isArray(value) && value.length > 0)) {
      const tierName = getTierDisplayName(tier);
      const price = getTierPrice(tier);

      return {
        message: `Upgrade to ${tierName} to unlock this feature`,
        tier,
        tierName,
        price,
        cta: `Upgrade to ${tierName}`,
      };
    }
  }

  return {
    message: 'This feature is not available in your current plan',
    tier: null,
  };
}

/**
 * Get tier display name
 */
function getTierDisplayName(tier) {
  const names = {
    [TIERS.FREE]: 'Free',
    [TIERS.ADULT_15]: 'Adult ($15 + $5/mo)',
    [TIERS.BASIC_50]: 'Basic ($50/mo)',
    [TIERS.STANDARD_100]: 'Standard ($100/mo)',
    [TIERS.PREMIUM_250]: 'Premium ($250/mo)',
    [TIERS.PREMIUM_500]: 'Pro ($500/mo)',
    [TIERS.PREMIUM_1000]: 'Power User ($1000/mo)',
    [TIERS.VIP]: 'VIP (Lifetime)',
  };
  return names[tier] || 'Unknown';
}

/**
 * Get tier price in dollars
 */
function getTierPrice(tier) {
  const prices = {
    [TIERS.FREE]: 0,
    [TIERS.ADULT_15]: 20, // $15 + $5/mo
    [TIERS.BASIC_50]: 50,
    [TIERS.STANDARD_100]: 100,
    [TIERS.PREMIUM_250]: 250,
    [TIERS.PREMIUM_500]: 500,
    [TIERS.PREMIUM_1000]: 1000,
    [TIERS.VIP]: 0, // Special invite only
  };
  return prices[tier] || 0;
}

/**
 * Log feature access attempts (for analytics)
 */
export function logFeatureAccess(userId, featureName, allowed) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId,
    featureName,
    allowed,
  };

  // In production: Send to analytics service
  console.log('[FEATURE_ACCESS]', logEntry);
}

/**
 * Get tier comparison for pricing page
 */
export function getTierComparison() {
  const tiers = [
    TIERS.FREE,
    TIERS.ADULT_15,
    TIERS.BASIC_50,
    TIERS.STANDARD_100,
    TIERS.PREMIUM_250,
    TIERS.PREMIUM_500,
    TIERS.PREMIUM_1000,
  ];

  return tiers.map(tier => ({
    tier,
    name: getTierDisplayName(tier),
    price: getTierPrice(tier),
    features: {
      projects: getFeatureValue(tier, 'PROJECT_LIMIT'),
      storage: getFeatureValue(tier, 'STORAGE_LIMIT_GB'),
      quality: getFeatureValue(tier, 'EXPORT_QUALITY'),
      watermark: !getFeatureValue(tier, 'WATERMARK_REMOVAL'),
      cgi: getFeatureValue(tier, 'CGI_EFFECTS'),
      vrAr: getFeatureValue(tier, 'VR_AR_ACCESS'),
      ai: getFeatureValue(tier, 'AI_TOOLS'),
      api: getFeatureValue(tier, 'API_ACCESS'),
      cloudRender: getFeatureValue(tier, 'CLOUD_RENDERING'),
      collaborators: getFeatureValue(tier, 'COLLABORATION'),
    },
  }));
}

export default {
  canAccessFeature,
  getFeatureValue,
  checkFeatureUsage,
  incrementFeatureUsage,
  applyWatermark,
  getExportQuality,
  getQualitySettings,
  validateUpload,
  updateStorageUsage,
  createFeatureGate,
  logFeatureAccess,
  getTierComparison,
  FEATURE_TIERS,
  QUALITY_PRESETS,
};
