// Tool Unlock System - Tracks which tools users have unlocked

import { isLifetimeVIP } from './vipAccess';

export const TOOL_PRICES = {
  photo: 25,
  design: 50,
  comics: 75,
  audio: 100,
  cgi: 200,
  ai: 200,
  arvr: 500,
  full_platform: 500, // Unlocks everything (same price as AR/VR alone, better deal)
  super_admin_powers: 1000 // Secret superpowers
};

export const TOOL_NAMES = {
  photo: '📸 Photo Tools Hub',
  design: '🎨 Graphic Design Studio',
  comics: '📚 Comic Book Creator',
  audio: '🎵 Audio Production Studio',
  cgi: '🎬 CGI Content Studio',
  ai: '🤖 AI Content Studio',
  arvr: '🎭 AR/VR Studio',
  super_admin_powers: '🤫 Shhh... It\'s a Secret'
};

/**
 * Check if user has unlocked a specific tool
 * @param {string} userId - User ID
 * @param {string} toolId - Tool ID (photo, design, comics, audio, arvr)
 * @returns {boolean} - True if unlocked
 */
export function isToolUnlocked(userId, toolId) {
  try {
    // Admin/owner always has access
    if (userId === 'owner' || userId === 'admin') {
      return true;
    }

    // Check if user is VIP by email
    const userEmail = localStorage.getItem('ownerEmail') || localStorage.getItem('userEmail');
    if (userEmail && isLifetimeVIP(userEmail)) {
      return true;
    }

    // Check if user has LIFETIME_VIP tier
    const userTier = localStorage.getItem('userTier');
    if (userTier === 'LIFETIME_VIP' || userTier === 'platinum') {
      return true;
    }

    // Check family access code
    const familyAccessCode = localStorage.getItem(`family_access_${userId}`);
    if (familyAccessCode) {
      return true; // Family gets everything free
    }

    // Check if user has full platform unlock
    const fullUnlock = localStorage.getItem(`unlock_full_platform_${userId}`);
    if (fullUnlock === 'true') {
      return true;
    }

    // Check individual tool unlock
    const toolUnlock = localStorage.getItem(`unlock_${toolId}_${userId}`);
    return toolUnlock === 'true';
  } catch (error) {
    console.error('Error checking tool unlock:', error);
    return false; // Fail closed - if error, show as locked
  }
}

/**
 * Unlock a tool for a user
 * @param {string} userId - User ID
 * @param {string} toolId - Tool ID or 'full_platform'
 * @param {string} paymentMethod - 'balance' or 'card'
 * @param {number} amount - Amount paid
 * @returns {object} - Success status and message
 */
export function unlockTool(userId, toolId, paymentMethod, amount) {
  try {
    const expectedPrice = TOOL_PRICES[toolId];

    if (!expectedPrice) {
      return { success: false, message: 'Invalid tool ID' };
    }

    if (amount < expectedPrice) {
      return { success: false, message: `Insufficient payment. Need $${expectedPrice}, got $${amount}` };
    }

    // Save unlock to localStorage (in production: save to database)
    localStorage.setItem(`unlock_${toolId}_${userId}`, 'true');
    localStorage.setItem(`unlock_${toolId}_${userId}_date`, new Date().toISOString());
    localStorage.setItem(`unlock_${toolId}_${userId}_method`, paymentMethod);
    localStorage.setItem(`unlock_${toolId}_${userId}_amount`, amount);

    // If full platform unlock, also mark all individual tools as unlocked
    if (toolId === 'full_platform') {
      Object.keys(TOOL_PRICES).forEach(tool => {
        if (tool !== 'full_platform') {
          localStorage.setItem(`unlock_${tool}_${userId}`, 'true');
        }
      });
    }

    return {
      success: true,
      message: `Successfully unlocked ${TOOL_NAMES[toolId] || 'Full Platform Access'}!`,
      toolId,
      unlockedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error unlocking tool:', error);
    return {
      success: false,
      message: 'An error occurred while unlocking. Please try again or contact support.'
    };
  }
}

/**
 * Get all unlocked tools for a user
 * @param {string} userId - User ID
 * @returns {array} - Array of unlocked tool IDs
 */
export function getUnlockedTools(userId) {
  if (userId === 'owner' || userId === 'admin') {
    return Object.keys(TOOL_PRICES); // All tools
  }

  const familyAccessCode = localStorage.getItem(`family_access_${userId}`);
  if (familyAccessCode) {
    return Object.keys(TOOL_PRICES); // All tools
  }

  const unlockedTools = [];

  Object.keys(TOOL_PRICES).forEach(toolId => {
    if (isToolUnlocked(userId, toolId)) {
      unlockedTools.push(toolId);
    }
  });

  return unlockedTools;
}

/**
 * Get user's balance (in production: fetch from database)
 * @param {string} userId - User ID
 * @returns {number} - User's balance in dollars
 */
export function getUserBalance(userId) {
  const balance = localStorage.getItem(`balance_${userId}`);
  return parseFloat(balance) || 0;
}

/**
 * Deduct from user's balance
 * @param {string} userId - User ID
 * @param {number} amount - Amount to deduct
 * @returns {boolean} - Success status
 */
export function deductBalance(userId, amount) {
  const currentBalance = getUserBalance(userId);

  if (currentBalance < amount) {
    return false; // Insufficient funds
  }

  const newBalance = currentBalance - amount;
  localStorage.setItem(`balance_${userId}`, newBalance.toString());

  return true;
}

/**
 * Add to user's balance (from earnings)
 * @param {string} userId - User ID
 * @param {number} amount - Amount to add
 * @param {string} source - Source of earnings ('tip', 'commission', 'print')
 */
export function addBalance(userId, amount, source) {
  const currentBalance = getUserBalance(userId);
  const newBalance = currentBalance + amount;

  localStorage.setItem(`balance_${userId}`, newBalance.toString());

  // Log transaction (in production: save to database)
  const transactions = JSON.parse(localStorage.getItem(`transactions_${userId}`) || '[]');
  transactions.push({
    type: 'credit',
    amount,
    source,
    balance: newBalance,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(`transactions_${userId}`, JSON.stringify(transactions));

  return newBalance;
}

/**
 * Grant family access to a user
 * @param {string} userId - User ID
 * @param {string} accessCode - Family access code
 */
export function grantFamilyAccess(userId, accessCode) {
  localStorage.setItem(`family_access_${userId}`, accessCode);
  localStorage.setItem(`family_access_${userId}_granted`, new Date().toISOString());
}

/**
 * Check if user has adult content access
 * @param {string} userId - User ID
 * @returns {boolean} - True if has access
 */
export function hasAdultAccess(userId) {
  // Admin/owner always has access
  if (userId === 'owner' || userId === 'admin') {
    return true;
  }

  // Check if user has full platform unlock (includes adult content)
  const fullUnlock = localStorage.getItem(`unlock_full_platform_${userId}`);
  if (fullUnlock === 'true') {
    return true;
  }

  // Check if user has active adult content subscription ($5/month)
  const adultSubscription = localStorage.getItem(`adult_subscription_${userId}`);
  const subscriptionExpiry = localStorage.getItem(`adult_subscription_expiry_${userId}`);

  if (adultSubscription === 'active' && subscriptionExpiry) {
    const expiryDate = new Date(subscriptionExpiry);
    return expiryDate > new Date(); // Not expired
  }

  return false;
}

/**
 * Get unlock progress for display
 * @param {string} userId - User ID
 * @returns {object} - Progress data
 */
export function getUnlockProgress(userId) {
  const unlockedTools = getUnlockedTools(userId);
  const totalTools = Object.keys(TOOL_NAMES).length;
  const balance = getUserBalance(userId);

  const totalSpent = unlockedTools.reduce((sum, toolId) => {
    if (toolId === 'full_platform') return sum;
    const amount = localStorage.getItem(`unlock_${toolId}_${userId}_amount`);
    return sum + (parseFloat(amount) || 0);
  }, 0);

  return {
    unlockedCount: unlockedTools.length,
    totalCount: totalTools,
    percentage: Math.round((unlockedTools.length / totalTools) * 100),
    balance,
    totalSpent,
    unlockedTools,
    hasFullAccess: isToolUnlocked(userId, 'full_platform')
  };
}

export default {
  TOOL_PRICES,
  TOOL_NAMES,
  isToolUnlocked,
  unlockTool,
  getUnlockedTools,
  getUserBalance,
  deductBalance,
  addBalance,
  grantFamilyAccess,
  hasAdultAccess,
  getUnlockProgress
};
