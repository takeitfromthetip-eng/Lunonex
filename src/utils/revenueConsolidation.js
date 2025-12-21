/**
 * Revenue Consolidation System
 * All creator profile payments route to main owner account
 * Owner: polotuspossumus@gmail.com
 */

const OWNER_EMAIL = 'polotuspossumus@gmail.com';

/**
 * Get the payout account for current profile
 * All profiles pay to owner account
 */
export function getPayoutAccount() {
  // Always return owner account regardless of active profile
  return {
    email: OWNER_EMAIL,
    accountType: 'primary',
    consolidatedPayments: true
  };
}

/**
 * Get revenue settings for current profile
 */
export function getRevenueSettings() {
  const activeProfile = localStorage.getItem('activeProfile');
  
  if (activeProfile) {
    const profile = JSON.parse(activeProfile);
    return profile.revenueSettings || {
      primaryAccount: OWNER_EMAIL,
      payoutEmail: OWNER_EMAIL,
      consolidatedPayments: true
    };
  }

  // Default to owner account
  return {
    primaryAccount: OWNER_EMAIL,
    payoutEmail: OWNER_EMAIL,
    consolidatedPayments: true
  };
}

/**
 * Process payment for any profile
 * Routes all payments to owner Stripe account
 */
export async function processPayment(amount, currency = 'usd', metadata = {}) {
  const payoutAccount = getPayoutAccount();
  
  // Add profile context to metadata
  const activeProfile = localStorage.getItem('activeProfile');
  const enhancedMetadata = {
    ...metadata,
    payoutAccount: payoutAccount.email,
    creatorProfile: activeProfile ? JSON.parse(activeProfile).name : 'Main',
    consolidatedPayment: true
  };

  console.log('💰 Processing payment:', {
    amount,
    currency,
    payoutTo: payoutAccount.email,
    metadata: enhancedMetadata
  });

  // In production, this calls your Stripe API
  // All payments use owner's Stripe Connected Account
  return {
    success: true,
    payoutAccount: payoutAccount.email,
    amount,
    currency,
    metadata: enhancedMetadata
  };
}

/**
 * Get earnings breakdown by profile
 */
export function getEarningsByProfile() {
  // Retrieve earnings data from localStorage or API
  const earningsData = JSON.parse(localStorage.getItem('profileEarnings') || '{}');
  
  return {
    total: Object.values(earningsData).reduce((sum, val) => sum + val, 0),
    byProfile: earningsData,
    consolidatedAccount: OWNER_EMAIL
  };
}

/**
 * Record earnings for current profile
 */
export function recordEarnings(amount, source = 'unknown') {
  const activeProfile = localStorage.getItem('activeProfile');
  const profileName = activeProfile ? JSON.parse(activeProfile).name : 'Main';
  
  const earningsData = JSON.parse(localStorage.getItem('profileEarnings') || '{}');
  earningsData[profileName] = (earningsData[profileName] || 0) + amount;
  
  localStorage.setItem('profileEarnings', JSON.stringify(earningsData));
  
  console.log(`💵 Recorded $${amount} for ${profileName} from ${source}`);
  
  return earningsData;
}

export default {
  getPayoutAccount,
  getRevenueSettings,
  processPayment,
  getEarningsByProfile,
  recordEarnings,
  OWNER_EMAIL
};
