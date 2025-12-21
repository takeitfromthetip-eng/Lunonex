/* eslint-disable */
/**
 * AD POLICY ENFORCEMENT
 * 
 * RULES:
 * 1. Paid content (any tier) = ZERO ads/endorsements allowed
 * 2. Free content = Ads allowed on profile, free posts
 * 3. Platform shows ads to free users only (optional)
 * 4. Paid subscribers never see ads
 * 
 * VIOLATIONS:
 * - Product endorsements in paid content
 * - Sponsor mentions in paid content
 * - Third-party ads in paid content
 * - Affiliate links in paid content
 */

const AD_DETECTION_PATTERNS = [
  // Direct ad mentions
  /\b(sponsored|advertisement|ad break|brought to you by)\b/i,
  
  // Product endorsements
  /\b(affiliate link|promo code|discount code|use code)\b/i,
  
  // Common sponsor phrases
  /\b(this video is sponsored|thanks to our sponsor|special thanks to)\b/i,
  
  // Brand mentions that look like ads
  /\b(check out|visit|buy now|get yours|limited time)\b.*\b(\.com|\.net|\.org)\b/i,
  
  // Affiliate markers
  /\b(amzn\.to|bit\.ly|geni\.us|share\.link)\b/i,
];

/**
 * Check if content contains advertising
 */
export function detectAds(content) {
  const violations = [];
  
  for (const pattern of AD_DETECTION_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      violations.push({
        type: 'POTENTIAL_AD',
        matched: matches[0],
        severity: 'HIGH'
      });
    }
  }
  
  return {
    hasAds: violations.length > 0,
    violations,
    confidence: violations.length > 0 ? 'LIKELY' : 'CLEAN'
  };
}

/**
 * Check if user can post ads based on content tier
 */
export function canPostAds(contentTier, userTier) {
  // Free content = ads allowed
  if (contentTier === 'FREE') {
    return {
      allowed: true,
      reason: 'Ads permitted in free content'
    };
  }
  
  // ANY paid tier = NO ads
  if (['BASIC', 'PREMIUM', 'VIP', 'LIFETIME'].includes(contentTier)) {
    return {
      allowed: false,
      reason: 'Ads prohibited in paid content - subscribers paid for ad-free experience'
    };
  }
  
  return {
    allowed: false,
    reason: 'Unknown content tier'
  };
}

/**
 * Validate content before upload
 */
export async function validateContentForAds(content, metadata) {
  const { tier, title, description } = metadata;
  
  // Only check paid content
  if (tier === 'FREE') {
    return {
      approved: true,
      message: 'Free content - ads allowed'
    };
  }
  
  // Check title
  const titleCheck = detectAds(title || '');
  if (titleCheck.hasAds) {
    return {
      approved: false,
      violations: titleCheck.violations,
      message: 'Advertising detected in title. Paid content cannot contain ads or endorsements.'
    };
  }
  
  // Check description
  const descCheck = detectAds(description || '');
  if (descCheck.hasAds) {
    return {
      approved: false,
      violations: descCheck.violations,
      message: 'Advertising detected in description. Paid content cannot contain ads or endorsements.'
    };
  }
  
  // Check content body
  const contentCheck = detectAds(content || '');
  if (contentCheck.hasAds) {
    return {
      approved: false,
      violations: contentCheck.violations,
      message: 'Advertising detected in content. Paid content must be 100% ad-free.'
    };
  }
  
  return {
    approved: true,
    message: 'Content is ad-free'
  };
}

/**
 * Should user see platform ads?
 */
export function shouldShowPlatformAds(userTier) {
  // Free users = show ads (if you implement platform ads later)
  if (userTier === 'FREE' || !userTier) {
    return true;
  }
  
  // Any paid tier = no platform ads ever
  return false;
}

/**
 * Should user see creator profile ads?
 * All creators can have ads on profiles, but only free users see them
 */
export function shouldShowCreatorProfileAds(viewerTier) {
  // Free users see all ads
  if (viewerTier === 'FREE' || !viewerTier) {
    return true;
  }
  
  // Paid subscribers never see profile ads
  return false;
}

/**
 * Log ad violation
 */
export async function logAdViolation(userId, contentId, violations) {
  const violationData = {
    user_id: userId,
    content_id: contentId,
    violation_type: 'AD_IN_PAID_CONTENT',
    violations: violations,
    severity: 'HIGH',
    detected_at: new Date().toISOString(),
    action_taken: 'CONTENT_BLOCKED'
  };
  
  console.error('🚫 AD POLICY VIOLATION:', violationData);
  
  // Log to database (integrate with your piracy/moderation system)
  // await supabase.from('policy_violations').insert(violationData);
  
  return violationData;
}

/**
 * Get ad policy for display to users
 */
export function getAdPolicyText() {
  return `
📢 ForTheWeebs Ad Policy

✅ PROFILE ADS:
- ALL creators can have ads on their profile
- Free users will see profile ads
- Paid subscribers never see profile ads

✅ FREE CONTENT:
- Ads allowed in free posts
- You can mention sponsors

❌ PAID CONTENT (ALL TIERS):
- ZERO ads allowed
- No product endorsements
- No sponsor mentions
- No affiliate links
- No promo codes
- Subscribers paid for ad-free content

⚠️ VIOLATIONS:
- 1st offense: Content removed + warning
- 2nd offense: Content removed + 7-day suspension
- 3rd offense: Permanent ban

💰 MONETIZATION:
- Profile ads = always visible to free users
- Paid content = must be 100% ad-free
- Want more money? Offer higher tiers or exclusive content
  `;
}
