/* eslint-disable */
/**
 * Admin Security - Centralized admin access control
 * ONLY polotuspossumus@gmail.com gets admin access
 * VIPs get perks and payment bypass but NOT admin
 */

const OWNER_EMAIL = 'polotuspossumus@gmail.com';
const OWNER_USERNAME = 'polotuspossumus';

/**
 * Check if email/username belongs to the actual owner
 * @param {string} emailOrUsername - Email or username to check
 * @returns {boolean} - True only if polotuspossumus@gmail.com
 */
export function isActualOwner(emailOrUsername) {
  if (!emailOrUsername) return false;
  
  const normalized = emailOrUsername.toLowerCase().trim();
  return normalized === OWNER_EMAIL.toLowerCase() || 
         normalized === OWNER_USERNAME.toLowerCase();
}

/**
 * Grant admin access - ONLY for actual owner
 * @param {string} email - Email to verify
 * @param {string} username - Username to verify (optional)
 */
export function grantAdminAccess(email, username = '') {
  // Verify this is actually the owner
  if (!isActualOwner(email) && !isActualOwner(username)) {
    console.error('🚨 SECURITY: Blocked admin access attempt for non-owner:', { email, username });
    return false;
  }

  // Grant full owner access
  localStorage.setItem('ownerEmail', OWNER_EMAIL);
  localStorage.setItem('userId', 'owner');
  localStorage.setItem('username', OWNER_USERNAME);
  localStorage.setItem('adminAuthenticated', 'true');
  localStorage.setItem('userTier', 'LIFETIME_VIP');
  localStorage.setItem('hasOnboarded', 'true');
  localStorage.setItem('legalAccepted', 'true');
  localStorage.setItem('tosAccepted', 'true');
  
  console.log('✅ Admin access granted to owner');
  return true;
}

/**
 * Check if current session has valid admin access
 * @returns {boolean} - True only if owner is logged in
 */
export function hasValidAdminAccess() {
  const storedEmail = localStorage.getItem('ownerEmail');
  const userId = localStorage.getItem('userId');
  const adminAuth = localStorage.getItem('adminAuthenticated');
  
  // All three must be valid
  return storedEmail === OWNER_EMAIL && 
         userId === 'owner' && 
         adminAuth === 'true';
}

/**
 * Revoke admin access (security cleanup)
 */
export function revokeAdminAccess() {
  localStorage.removeItem('adminAuthenticated');
  localStorage.removeItem('userId');
  localStorage.removeItem('ownerEmail');
  console.log('🔒 Admin access revoked');
}

/**
 * Validate session on page load
 * If admin keys are present but invalid, remove them
 */
export function validateAdminSession() {
  const adminAuth = localStorage.getItem('adminAuthenticated');
  const userId = localStorage.getItem('userId');
  const ownerEmail = localStorage.getItem('ownerEmail');
  
  // If any admin keys exist, verify they're valid
  if (adminAuth === 'true' || userId === 'owner') {
    if (!hasValidAdminAccess()) {
      console.warn('⚠️ Invalid admin session detected - cleaning up');
      revokeAdminAccess();
      return false;
    }
  }
  
  return hasValidAdminAccess();
}

export { OWNER_EMAIL, OWNER_USERNAME };
