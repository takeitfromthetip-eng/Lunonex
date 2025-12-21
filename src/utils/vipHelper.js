/* eslint-disable */
// VIP Access Helper
// TIER SYSTEM:
// - Owner (1) + 12 VIPs = FREE FOREVER, unlimited access, NO creator subscriptions
// - 87 Elite $1000 Payers = FREE FOREVER, unlimited access, NO creator subscriptions (first come, first served)
// - Everyone else who pays $1000 = All superpowers BUT still pays creator subscriptions

const LIFETIME_VIP_EMAILS = [
  'polotuspossumus@gmail.com', // Owner
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
  'brookewhitley530@gmail.com'
];

// Total elite slots: 100 (1 owner + 12 VIPs + 87 $1000 payers)
const ELITE_SLOTS_TOTAL = 100;
const LIFETIME_VIP_COUNT = 13; // Owner + 12 VIPs
const ELITE_PAID_SLOTS = 87; // First 87 people who pay $1000

export function hasVIPAccess(email) {
  if (!email) return false;
  
  // Check lifetime VIP list (owner + 12 VIPs)
  if (LIFETIME_VIP_EMAILS.includes(email.toLowerCase())) {
    return true;
  }
  
  // Check if user paid for $1000 tier (also VIP)
  const userTier = localStorage.getItem('userTier');
  return userTier === 'PREMIUM_1000' || userTier === 'LIFETIME_VIP' || userTier === 'ELITE_1000';
}

// Check if user is in the elite 100 (free creator content access)
export function isEliteMember(email) {
  if (!email) return false;
  
  // Owner + 12 VIPs are always elite
  if (LIFETIME_VIP_EMAILS.includes(email.toLowerCase())) {
    return true;
  }
  
  // Check if user is in first 87 paid $1000 tier members
  const userTier = localStorage.getItem('userTier');
  const isEliteSlot = localStorage.getItem('eliteSlot') === 'true';
  
  return (userTier === 'PREMIUM_1000' || userTier === 'ELITE_1000') && isEliteSlot === true;
}

// Check if user needs to pay for creator subscriptions
export function needsCreatorSubscriptions(email) {
  // Elite members (100 total) never pay creator subscriptions
  if (isEliteMember(email)) {
    return false;
  }
  
  // Everyone else pays creator subscriptions
  return true;
}

export function isOwner(email) {
  return email?.toLowerCase() === 'polotuspossumus@gmail.com';
}

export function canBypassPayment(email, userId) {
  // Owner and lifetime VIP list bypass all payment gates forever
  if (isOwner(email)) return true;
  if (LIFETIME_VIP_EMAILS.includes(email?.toLowerCase())) return true;
  
  // Elite 87 $1000 payers bypass all payment gates forever
  if (isEliteMember(email)) return true;
  
  // Everyone else must pay (even $1000 tier holders who aren't in elite 87)
  return false;
}

export function canBypassCreatorSubscriptions(email) {
  // Only elite 100 (owner + 12 VIPs + 87 paid) bypass creator subscriptions
  return isEliteMember(email);
}

export function shouldGetAdminAccess(email) {
  // ONLY polotuspossumus@gmail.com gets admin access - PERIOD
  // $1000 tier customers are VIPs but NOT admins
  return email?.toLowerCase() === 'polotuspossumus@gmail.com';
}

export { LIFETIME_VIP_EMAILS };
