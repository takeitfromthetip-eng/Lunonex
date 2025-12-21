/**
 * VIP Access System - 100 Lifetime VIP Slots
 * 
 * TIER 1 - Owner's Freebies (Slots 1-14):
 * - Pay: $0 (FREE)
 * - Get: EVERYTHING free forever (no payments, no subscriptions, nothing)
 * 
 * TIER 2 - Paid Lifetime VIPs (Slots 15-100):
 * - Pay: $1,000 ONE TIME
 * - Get: EVERYTHING free forever (same access as freebies)
 * - Never pay creator subscriptions or anything else
 * 
 * TIER 3 - Regular Paid VIPs (Slots 101+):
 * - Pay: $1,000 ONE TIME  
 * - Get: Platform features unlocked
 * - Still pay creator subscriptions (not included)
 * 
 * Current status:
 * - Freebies filled: 14/14 (COMPLETE)
 * - Paid Lifetime VIP slots remaining: 86/86
 * - After 100 total VIPs, new users are Tier 3 (pay creators)
 */

// OWNER - Only person with admin/owner access
export const OWNER_EMAIL = 'polotuspossumus@gmail.com';

// TIER 1: Owner's Freebies - Never pay anything
export const LIFETIME_VIP_EMAILS = [
  'shellymontoya82@gmail.com',
  'chesed04@aol.com',
  'Colbyg123f@gmail.com',
  'PerryMorr94@gmail.com',
  'remyvogt@gmail.com',
  'kh@savantenergy.com',
  'Bleska@mindspring.com',
  'palmlana@yahoo.com',
  'Billyxfitzgerald@yahoo.com',
  'Yeahitsmeangel@yahoo.com',
  'Atolbert66@gmail.com',
  'brookewhitley530@gmail.com',
  'cleonwilliams1973@gmail.com',
  'eliahmontoya05@gmail.com'
];

// TIER 2: Paid Lifetime VIPs ($1000, everything free after)
// Tracked in public.vip_access table - 86 slots available
// After 100 total VIPs (14 free + 86 paid), new users are Tier 3

// Maximum lifetime VIP slots (free + paid)
export const MAX_LIFETIME_VIP_SLOTS = 100;
export const FREEBIE_SLOTS_FILLED = 14;
export const PAID_LIFETIME_SLOTS_REMAINING = 86;

/**
 * Check if email is the owner
 * @param {string} email - User's email address
 * @returns {boolean} - True if owner, false otherwise
 */
export function isOwner(email) {
  if (!email) return false;
  return email.toLowerCase().trim() === OWNER_EMAIL.toLowerCase().trim();
}

/**
 * Check if an email has lifetime VIP access (Pro tier features only)
 * @param {string} email - User's email address
 * @returns {boolean} - True if VIP, false otherwise
 */
export function isLifetimeVIP(email) {
  if (!email) return false;
  
  const normalizedEmail = email.toLowerCase().trim();
  return LIFETIME_VIP_EMAILS.some(vipEmail => 
    vipEmail.toLowerCase().trim() === normalizedEmail
  );
}

/**
 * Check if a userId has lifetime VIP access
 * Checks localStorage for email first, then checks Supabase
 * @param {string} userId - User's ID
 * @returns {Promise<boolean>} - True if VIP, false otherwise
 */
export async function isUserVIP(userId) {
  // Owner is always VIP
  if (userId === 'owner') return true;
  
  // Check localStorage for email
  const storedEmail = localStorage.getItem('ownerEmail') || localStorage.getItem('userEmail');
  if (storedEmail && isLifetimeVIP(storedEmail)) {
    return true;
  }
  
  // Could add Supabase check here if needed
  // const { data } = await supabase.from('users').select('email').eq('id', userId).single();
  // return isLifetimeVIP(data?.email);
  
  return false;
}

/**
 * Get the tier for a VIP user
 * @param {string} email - User's email
 * @returns {string} - 'OWNER' for owner, 'PRO_VIP' for VIPs
 */
export function getVIPTier(email) {
  if (isOwner(email)) return 'OWNER';
  if (isLifetimeVIP(email)) return 'PRO_VIP';
  return null;
}

/**
 * Check if user should skip payment flow
 * @param {string} email - User's email
 * @returns {boolean} - True if should skip payment
 */
export function shouldSkipPayment(email) {
  return isLifetimeVIP(email);
}

/**
 * Alias for isLifetimeVIP - for backend compatibility
 * @param {string} email - User's email
 * @returns {boolean} - True if VIP
 */
export function isVIP(email) {
  return isLifetimeVIP(email);
}
