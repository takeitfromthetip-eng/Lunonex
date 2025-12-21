/**
 * Tier Features - Define what each tier can access
 * Used for feature gates throughout the app
 *
 * NOTE: Mico AI is FREE for EVERYONE - we don't monetize Microsoft Copilot's work
 *
 * TIER STRUCTURE (matching Stripe price IDs):
 * - elite: $1000 one-time (was "sovereign")
 * - vip: $500 one-time (was "full_monthly"/"full_lifetime")
 * - premium: $250 one-time (was "half")
 * - enhanced: $100 one-time (was "advanced")
 * - standard: $50 one-time (was "basic")
 * - adult: $15/month subscription (adult content access)
 */

export const TIER_FEATURES = {
  elite: {
    // CGI Effects
    cgi_effects: true,
    cgi_effect_count: 24,
    cgi_presets: 12,

    // Video Features
    video_calls: true,
    recording: true,
    screen_sharing: true,

    // AI Features (FREE for all tiers!)
    mico_ai: true,
    mico_commands: 'unlimited',
    mico_file_ops: true,
    mico_cgi_control: true, // Only Elite can control CGI via Mico

    // Premium Features
    priority_support: true,
    vip_status: true,
    custom_branding: true,
    api_access: true,
    analytics: true,
    admin_panel: true,

    // Limits
    max_video_length: 'unlimited',
    max_uploads_per_day: 'unlimited',
    storage_gb: 'unlimited',

    // Display
    display_name: 'Elite',
    display_badge: '👑',
    display_color: '#FFD700'
  },

  vip: {
    // CGI Effects
    cgi_effects: false,
    cgi_effect_count: 0,
    cgi_presets: 12,

    // Video Features
    video_calls: false,
    recording: true,
    screen_sharing: false,

    // AI Features
    mico_ai: true,
    mico_commands: 'unlimited',
    mico_file_ops: true,

    // Premium Features
    priority_support: true,
    custom_branding: true,
    api_access: true,
    analytics: true,

    // Limits
    max_video_length: 'unlimited',
    max_uploads_per_day: 'unlimited',
    storage_gb: 'unlimited',

    // Display
    display_name: 'VIP',
    display_badge: '💎',
    display_color: '#667eea'
  },

  premium: {
    // CGI Effects
    cgi_effects: true,
    cgi_effect_count: 12,
    cgi_presets: 6,

    // Video Features
    video_calls: false,
    recording: true,
    screen_sharing: false,

    // AI Features
    mico_ai: true,
    mico_commands: 'unlimited',
    mico_file_ops: false,

    // Premium Features
    custom_branding: false,
    analytics: true,

    // Limits
    max_video_length: 'unlimited',
    max_uploads_per_day: 'unlimited',
    storage_gb: 'unlimited',

    // Display
    display_name: 'Premium',
    display_badge: '⭐',
    display_color: '#764ba2'
  },

  enhanced: {
    // CGI Effects
    cgi_effects: true,
    cgi_effect_count: 6,
    cgi_presets: 3,

    // Video Features
    video_calls: false,
    recording: true,
    screen_sharing: false,

    // AI Features
    mico_ai: true,
    mico_commands: 'unlimited',
    mico_file_ops: false,

    // Premium Features
    analytics: false,

    // Limits
    max_video_length: 'unlimited',
    max_uploads_per_day: 'unlimited',
    storage_gb: 'unlimited',

    // Display
    display_name: 'Enhanced',
    display_badge: '🚀',
    display_color: '#48bb78'
  },

  standard: {
    // CGI Effects
    cgi_effects: true,
    cgi_effect_count: 3,
    cgi_presets: 0,

    // Video Features
    video_calls: false,
    recording: true,
    screen_sharing: false,

    // AI Features
    mico_ai: true,
    mico_commands: 'unlimited',

    // Limits
    max_video_length: 'unlimited',
    max_uploads_per_day: 'unlimited',
    storage_gb: 'unlimited',

    // Display
    display_name: 'Standard',
    display_badge: '✓',
    display_color: '#4299e1'
  },

  adult: {
    // Adult content subscription - no CGI features
    cgi_effects: false,
    cgi_effect_count: 0,
    cgi_presets: 0,

    // Video Features
    video_calls: false,
    recording: false,
    screen_sharing: false,

    // AI Features
    mico_ai: true,

    // Adult Features
    adult_content_access: true,

    // Limits
    max_video_length: 'unlimited',
    max_uploads_per_day: 'unlimited',
    storage_gb: 'unlimited',

    // Display
    display_name: 'Adult Subscription',
    display_badge: '🔞',
    display_color: '#e53e3e'
  },

  free: {
    // CGI Effects
    cgi_effects: false,
    cgi_effect_count: 0,
    cgi_presets: 0,

    // Video Features
    video_calls: false,
    recording: false,
    screen_sharing: false,

    // AI Features
    mico_ai: true,

    // Limits
    max_video_length: 'unlimited',
    max_uploads_per_day: 'unlimited',
    storage_gb: 'unlimited',

    // Display
    display_name: 'Free',
    display_badge: '',
    display_color: '#a0aec0'
  }
};

/**
 * Check if user has access to feature
 * @param {string} tier - User's tier
 * @param {string} feature - Feature to check
 * @returns {boolean}
 */
export function hasFeature(tier, feature) {
  return TIER_FEATURES[tier]?.[feature] === true;
}

/**
 * Get feature limit/value
 * @param {string} tier - User's tier
 * @param {string} feature - Feature to get limit for
 * @returns {any}
 */
export function getFeatureLimit(tier, feature) {
  return TIER_FEATURES[tier]?.[feature];
}

/**
 * Get all features for a tier
 * @param {string} tier - User's tier
 * @returns {object}
 */
export function getTierFeatures(tier) {
  return TIER_FEATURES[tier] || TIER_FEATURES.free;
}

/**
 * Check if tier allows specific CGI effect
 * @param {string} tier - User's tier
 * @param {number} effectIndex - Index of effect (0-23)
 * @returns {boolean}
 */
export function canUseEffect(tier, effectIndex) {
  const allowedCount = getFeatureLimit(tier, 'cgi_effect_count');
  if (allowedCount === 'unlimited' || allowedCount === 24) return true;
  return effectIndex < allowedCount;
}

/**
 * Get tier display info
 * @param {string} tier - User's tier
 * @returns {object}
 */
export function getTierDisplay(tier) {
  const features = getTierFeatures(tier);
  return {
    name: features.display_name,
    badge: features.display_badge,
    color: features.display_color
  };
}

/**
 * Compare two tiers (for upgrades/downgrades)
 * @param {string} tierA
 * @param {string} tierB
 * @returns {number} - Positive if A > B, negative if A < B, 0 if equal
 */
export function compareTiers(tierA, tierB) {
  const tierOrder = ['free', 'adult', 'standard', 'enhanced', 'premium', 'vip', 'elite'];
  return tierOrder.indexOf(tierA) - tierOrder.indexOf(tierB);
}

/**
 * Check if upgrade is available
 * @param {string} currentTier
 * @param {string} targetTier
 * @returns {boolean}
 */
export function canUpgradeTo(currentTier, targetTier) {
  return compareTiers(targetTier, currentTier) > 0;
}

/**
 * Get recommended upgrade tier
 * @param {string} currentTier
 * @returns {string}
 */
export function getRecommendedUpgrade(currentTier) {
  const upgradePaths = {
    free: 'standard',
    adult: 'standard',
    standard: 'enhanced',
    enhanced: 'premium',
    premium: 'vip',
    vip: 'elite'
  };
  return upgradePaths[currentTier] || 'elite';
}

/**
 * Get tier pricing info
 * @param {string} tier
 * @returns {object}
 */
export function getTierPricing(tier) {
  const pricing = {
    elite: { amount: 1000, period: 'one-time', setup: 0 },
    vip: { amount: 500, period: 'one-time', setup: 0 },
    premium: { amount: 250, period: 'one-time', setup: 0 },
    enhanced: { amount: 100, period: 'one-time', setup: 0 },
    standard: { amount: 50, period: 'one-time', setup: 0 },
    adult: { amount: 15, period: 'monthly', setup: 0 },
    free: { amount: 0, period: 'free', setup: 0 }
  };
  return pricing[tier] || pricing.free;
}
