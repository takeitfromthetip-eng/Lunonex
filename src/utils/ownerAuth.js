// 🔐 OWNER ACCESS - Simple localStorage Check
// Only polotuspossumus@gmail.com gets admin access

// Your owner email - ONLY this email gets admin access
const OWNER_EMAIL = 'polotuspossumus@gmail.com';

/**
 * Check if current user is the verified owner
 * @returns {boolean} True if owner email is set in localStorage
 */
export function isOwner() {
  const email = localStorage.getItem('ownerEmail');
  const userId = localStorage.getItem('userId');
  
  return email?.toLowerCase() === OWNER_EMAIL.toLowerCase() || userId === 'owner';
}

/**
 * Require owner authentication
 * @returns {boolean} True if owner
 */
export function requireOwner() {
  const isOwnerUser = isOwner();

  if (!isOwnerUser) {
    console.log('🚫 Not owner');
    return false;
  }

  // Set owner localStorage flags
  localStorage.setItem('adminAuthenticated', 'true');
  localStorage.setItem('userId', 'owner');
  localStorage.setItem('ownerEmail', OWNER_EMAIL);
  localStorage.setItem('hasOnboarded', 'true');
  localStorage.setItem('legalAccepted', 'true');
  localStorage.setItem('tosAccepted', 'true');
  localStorage.setItem('userTier', 'LIFETIME_VIP');

  return true;
}

/**
 * Get current user's role
 * @returns {string} 'owner' or 'user'
 */
export function getUserRole() {
  return isOwner() ? 'owner' : 'user';
}

export default {
  isOwner,
  requireOwner,
  getUserRole,
  OWNER_EMAIL
};
