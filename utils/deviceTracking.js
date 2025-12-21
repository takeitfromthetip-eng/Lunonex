/* eslint-disable */
/**
 * IP TRACKING & DEVICE FINGERPRINTING
 * Prevents banned users from creating new accounts
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Track user's IP and device on upload/signup
 */
async function trackUserDevice(userId, req) {
  const ipAddress = getClientIP(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  const deviceFingerprint = generateDeviceFingerprint(req);
  
  try {
    await supabase
      .from('user_devices')
      .upsert({
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_fingerprint: deviceFingerprint,
        last_seen: new Date().toISOString()
      }, {
        onConflict: 'user_id,device_fingerprint'
      });
    
  } catch (error) {
    console.error('Error tracking device:', error);
  }
}

/**
 * Check if IP/device is associated with banned users
 */
async function checkBannedDevice(req) {
  const ipAddress = getClientIP(req);
  const deviceFingerprint = generateDeviceFingerprint(req);
  
  try {
    // Check if this IP or device is associated with banned users
    const { data: bannedUsers } = await supabase
      .from('user_devices')
      .select('user_id, user_bans!inner(*)')
      .or(`ip_address.eq.${ipAddress},device_fingerprint.eq.${deviceFingerprint}`)
      .eq('user_bans.is_active', true);
    
    if (bannedUsers && bannedUsers.length > 0) {
      return {
        isBanned: true,
        reason: 'IP or device associated with banned account',
        bannedUserId: bannedUsers[0].user_id,
        banDetails: bannedUsers[0].user_bans
      };
    }
    
    return { isBanned: false };
    
  } catch (error) {
    console.error('Error checking banned device:', error);
    return { isBanned: false };
  }
}

/**
 * Get client IP from request (handles proxies)
 */
function getClientIP(req) {
  // Check various headers in order of preference
  return req.headers['cf-connecting-ip'] || // Cloudflare
         req.headers['x-real-ip'] || // Nginx
         req.headers['x-forwarded-for']?.split(',')[0] || // Proxy
         req.connection?.remoteAddress || // Direct
         req.socket?.remoteAddress ||
         'unknown';
}

/**
 * Generate device fingerprint
 */
function generateDeviceFingerprint(req) {
  const components = [
    req.headers['user-agent'] || '',
    req.headers['accept-language'] || '',
    req.headers['accept-encoding'] || '',
    req.headers['sec-ch-ua'] || '', // Browser info
    req.headers['sec-ch-ua-platform'] || '' // OS info
  ];
  
  const combined = components.join('|');
  return crypto.createHash('sha256').update(combined).digest('hex').substring(0, 32);
}

/**
 * Check for account evasion (new account from banned device)
 */
async function detectAccountEvasion(userId, req) {
  const ipAddress = getClientIP(req);
  const deviceFingerprint = generateDeviceFingerprint(req);
  
  try {
    // Check if this IP/device was used by other users with piracy violations
    const { data: suspiciousUsers } = await supabase
      .from('user_devices')
      .select(`
        user_id,
        users!inner(id),
        user_strikes!inner(*)
      `)
      .or(`ip_address.eq.${ipAddress},device_fingerprint.eq.${deviceFingerprint}`)
      .neq('user_id', userId)
      .gte('user_strikes.strike_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
    
    if (suspiciousUsers && suspiciousUsers.length > 0) {
      // Log suspicious activity
      await supabase
        .from('suspicious_activity')
        .insert({
          user_id: userId,
          activity_type: 'POTENTIAL_ACCOUNT_EVASION',
          description: `New account from IP/device with ${suspiciousUsers.length} previous violations`,
          severity: 'HIGH',
          evidence: {
            shared_ip: ipAddress,
            shared_device: deviceFingerprint,
            previous_users: suspiciousUsers.map(u => u.user_id)
          },
          detected_at: new Date().toISOString()
        });
      
      // Create admin alert
      await supabase
        .from('admin_alerts')
        .insert({
          type: 'ACCOUNT_EVASION_SUSPECTED',
          severity: 'HIGH',
          user_id: userId,
          details: {
            shared_with: suspiciousUsers.length,
            ip: ipAddress,
            device: deviceFingerprint
          },
          requires_action: true
        });
      
      return {
        suspicious: true,
        sharedWithCount: suspiciousUsers.length,
        action: 'FLAGGED_FOR_REVIEW'
      };
    }
    
    return { suspicious: false };
    
  } catch (error) {
    console.error('Error detecting account evasion:', error);
    return { suspicious: false };
  }
}

/**
 * Check for VPN/proxy usage
 */
function detectVPN(req) {
  const ipAddress = getClientIP(req);
  
  // Common VPN/proxy indicators
  const vpnIndicators = [
    req.headers['x-forwarded-for']?.split(',').length > 2, // Multiple proxies
    req.headers['via'], // Proxy header
    req.headers['x-proxy-id'],
    /\b(vpn|proxy|tor)\b/i.test(req.headers['user-agent'] || '')
  ];
  
  const isVPN = vpnIndicators.some(indicator => indicator);
  
  return {
    detected: isVPN,
    confidence: isVPN ? 'MEDIUM' : 'LOW',
    // In production, use a VPN detection API (IPHub, IPQualityScore, etc.)
    note: 'Basic detection - consider VPN API for production'
  };
}

module.exports = {
  trackUserDevice,
  checkBannedDevice,
  getClientIP,
  generateDeviceFingerprint,
  detectAccountEvasion,
  detectVPN
};
