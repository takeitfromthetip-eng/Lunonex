// Two-Factor Authentication System
// Simple email-based 2FA with 6-digit codes

export function generateTwoFactorCode() {
  // Generate random 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeTwoFactorCode(email, code) {
  const expiryTime = Date.now() + (10 * 60 * 1000); // 10 minutes
  
  localStorage.setItem(`2fa_code_${email}`, code);
  localStorage.setItem(`2fa_expiry_${email}`, expiryTime.toString());
  
  return true;
}

export function verifyTwoFactorCode(email, inputCode) {
  const storedCode = localStorage.getItem(`2fa_code_${email}`);
  const expiry = localStorage.getItem(`2fa_expiry_${email}`);
  
  if (!storedCode || !expiry) {
    return { valid: false, error: 'No 2FA code found' };
  }
  
  // Check if expired
  if (Date.now() > parseInt(expiry)) {
    clearTwoFactorCode(email);
    return { valid: false, error: 'Code expired. Request a new one.' };
  }
  
  // Verify code
  if (storedCode === inputCode.trim()) {
    clearTwoFactorCode(email);
    return { valid: true };
  }
  
  return { valid: false, error: 'Invalid code' };
}

export function clearTwoFactorCode(email) {
  localStorage.removeItem(`2fa_code_${email}`);
  localStorage.removeItem(`2fa_expiry_${email}`);
}

export function isTwoFactorEnabled(email) {
  return localStorage.getItem(`2fa_enabled_${email}`) === 'true';
}

export function enableTwoFactor(email) {
  localStorage.setItem(`2fa_enabled_${email}`, 'true');
}

export function disableTwoFactor(email) {
  localStorage.removeItem(`2fa_enabled_${email}`);
  clearTwoFactorCode(email);
}

export async function sendTwoFactorCode(email, code) {
  // In production, this would call your backend API to send email
  // For now, we'll just log it and show a notification
  
  console.log(`📧 2FA Code for ${email}: ${code}`);
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/send-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to send 2FA code:', error);
    // Show code to user in dev mode
    if (import.meta.env.DEV) {
      alert(`DEV MODE: Your 2FA code is ${code}`);
    }
    return true; // Allow in dev mode
  }
}
