/* eslint-disable */
/**
 * REVENUE SPLIT SYSTEM
 * Determines what % creators keep based on their tier
 * 
 * RULES:
 * - FREE: 50% (creators only get social + creator economy features)
 * - $15-$50: 80% 
 * - $100+: 100% (they paid, they keep everything)
 * 
 * PAYMENT PROGRESSION:
 * - After 4 monthly payments, unlock $50 tier features
 * - Can continue paying $15/month toward full $1000 unlock
 * - Get each tier's features as they reach payment milestones
 */

export const TIER_REVENUE_SPLITS = {
  FREE: 0.50,           // Free users: 50%
  ADULT_15: 0.80,       // $15/month: 80%
  BASIC_50: 0.80,       // $50/month: 80%
  STANDARD_100: 1.00,   // $100/month: 100%
  PREMIUM_250: 1.00,    // $250/month: 100%
  PREMIUM_500: 1.00,    // $500/month: 100%
  PREMIUM_1000: 1.00,   // $1000 one-time: 100%
  VIP: 1.00             // VIP: 100%
};

/**
 * Calculate revenue split based on user tier
 * @param {number} amount - Payment amount
 * @param {string} userTier - User's tier (FREE, BASIC_50, etc)
 * @param {number} totalPaid - Total amount user has paid (for progression)
 * @returns {object} - Breakdown of fees and payouts
 */
export function calculateRevenueSplit(amount, userTier = 'FREE', totalPaid = 0) {
  // Payment processor fee (Stripe: 2.9% + $0.30)
  const processorFee = (amount * 0.029) + 0.30;
  const netAmount = amount - processorFee;

  // Get creator split based on tier
  let creatorSplit = TIER_REVENUE_SPLITS[userTier] || 0.50;
  
  // Calculate platform fee (inverse of creator split)
  const platformFee = netAmount * (1 - creatorSplit);
  const creatorPayout = netAmount - platformFee;

  return {
    total: amount,
    processorFee,
    platformFee,
    creatorPayout,
    creatorSplit: creatorSplit * 100, // Convert to percentage
    breakdown: {
      processor: `$${processorFee.toFixed(2)} (Stripe fee)`,
      platform: `$${platformFee.toFixed(2)} (${((1 - creatorSplit) * 100).toFixed(0)}%)`,
      creator: `$${creatorPayout.toFixed(2)} (${(creatorSplit * 100).toFixed(0)}%)`
    }
  };
}

/**
 * Calculate tier unlocks based on total paid
 * Users paying monthly can work toward full unlock
 * @param {number} totalPaid - Total amount user has paid
 * @returns {object} - Current tier and next unlock info
 */
export function calculateTierProgression(totalPaid) {
  const milestones = [
    { threshold: 0, tier: 'FREE', split: 50 },
    { threshold: 60, tier: 'BASIC_50', split: 80, unlock: '4 payments of $15 = $50 tier features' },
    { threshold: 100, tier: 'STANDARD_100', split: 100 },
    { threshold: 250, tier: 'PREMIUM_250', split: 100 },
    { threshold: 500, tier: 'PREMIUM_500', split: 100 },
    { threshold: 1000, tier: 'PREMIUM_1000', split: 100 }
  ];

  const current = [...milestones].reverse().find(m => totalPaid >= m.threshold) || milestones[0];
  const next = milestones.find(m => m.threshold > totalPaid);

  return {
    currentTier: current.tier,
    currentSplit: current.split,
    totalPaid,
    nextTier: next?.tier,
    nextSplit: next?.split,
    amountToNext: next ? next.threshold - totalPaid : 0,
    message: current.unlock || 'Keep paying to unlock higher tiers!'
  };
}

/**
 * Check if user qualifies for $50 unlock after 4 payments
 * @param {number} paymentCount - Number of monthly payments made
 * @param {number} monthlyAmount - Amount paid each month
 * @returns {boolean} - True if unlocked
 */
export function check50DollarUnlock(paymentCount, monthlyAmount = 15) {
  return paymentCount >= 4 && monthlyAmount >= 15;
}

/**
 * Adult content specific splits (CCBill processor)
 * @param {number} amount - Payment amount
 * @param {string} userTier - User's tier
 * @returns {object} - Breakdown with CCBill fees
 */
export function calculateAdultContentSplit(amount, userTier = 'FREE') {
  // CCBill takes 10.5% + $0.30
  const processorFee = (amount * 0.105) + 0.30;
  const netAmount = amount - processorFee;

  // Get creator split based on tier
  const creatorSplit = TIER_REVENUE_SPLITS[userTier] || 0.50;
  const platformFee = netAmount * (1 - creatorSplit);
  const creatorPayout = netAmount - platformFee;

  return {
    total: amount,
    processorFee,
    platformFee,
    creatorPayout,
    creatorSplit: creatorSplit * 100,
    breakdown: {
      ccbill: `$${processorFee.toFixed(2)} (10.5% + $0.30)`,
      platform: `$${platformFee.toFixed(2)} (${((1 - creatorSplit) * 100).toFixed(0)}%)`,
      creator: `$${creatorPayout.toFixed(2)} (${(creatorSplit * 100).toFixed(0)}%)`
    }
  };
}

module.exports = {
  TIER_REVENUE_SPLITS,
  calculateRevenueSplit,
  calculateTierProgression,
  check50DollarUnlock,
  calculateAdultContentSplit
};
