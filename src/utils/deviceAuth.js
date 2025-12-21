/**
 * Device Authentication System
 * - Primary device auto-login
 * - Secondary device (phone) support
 * - Recovery passphrase backup
 */

// Generate unique device fingerprint
export const generateDeviceFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('ForTheWeebs', 2, 2);

    const fingerprint = {
        canvas: canvas.toDataURL(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: Date.now()
    };

    // Create hash of fingerprint
    const fingerprintString = JSON.stringify(fingerprint);
    let hash = 0;
    for (let i = 0; i < fingerprintString.length; i++) {
        const char = fingerprintString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return `device_${Math.abs(hash).toString(36)}`;
};

// Register this device as owner device
export const registerOwnerDevice = (deviceType = 'desktop') => {
    const deviceId = generateDeviceFingerprint();
    const deviceInfo = {
        id: deviceId,
        type: deviceType, // 'desktop' or 'mobile'
        registeredAt: new Date().toISOString(),
        lastAccess: new Date().toISOString(),
        userAgent: navigator.userAgent,
        verified: true
    };

    // Store device info
    localStorage.setItem('owner_device_id', deviceId);
    localStorage.setItem('owner_device_info', JSON.stringify(deviceInfo));

    // Add to trusted devices list
    const trustedDevices = getTrustedDevices();
    if (!trustedDevices.find(d => d.id === deviceId)) {
        trustedDevices.push(deviceInfo);
        localStorage.setItem('trusted_devices', JSON.stringify(trustedDevices));
    }

    console.log('✅ Device registered as owner device:', deviceId);
    return deviceId;
};

// Check if current device is trusted
export const isDeviceTrusted = () => {
    const currentDeviceId = generateDeviceFingerprint();
    const trustedDevices = getTrustedDevices();
    const isTrusted = trustedDevices.some(d => d.id === currentDeviceId);

    if (isTrusted) {
        // Update last access
        updateDeviceAccess(currentDeviceId);
    }

    return isTrusted;
};

// Get list of trusted devices
export const getTrustedDevices = () => {
    try {
        const devices = localStorage.getItem('trusted_devices');
        return devices ? JSON.parse(devices) : [];
    } catch {
        return [];
    }
};

// Update device last access time
const updateDeviceAccess = (deviceId) => {
    const trustedDevices = getTrustedDevices();
    const device = trustedDevices.find(d => d.id === deviceId);
    if (device) {
        device.lastAccess = new Date().toISOString();
        localStorage.setItem('trusted_devices', JSON.stringify(trustedDevices));
    }
};

// Generate recovery passphrase (BIP39-style words)
export const generateRecoveryPassphrase = () => {
    // Use fixed passphrase: "mico code pineapple"
    const passphraseString = 'mico code pineapple';

    // Store encrypted hash of passphrase
    const hash = btoa(passphraseString); // Simple encoding (you could use crypto.subtle for real encryption)
    localStorage.setItem('recovery_passphrase_hash', hash);

    return passphraseString;
};

// Verify recovery passphrase
export const verifyRecoveryPassphrase = (inputPassphrase) => {
    const storedHash = localStorage.getItem('recovery_passphrase_hash');
    if (!storedHash) return false;

    const inputHash = btoa(inputPassphrase.trim().toLowerCase());
    return inputHash === storedHash;
};

// Link new device using recovery passphrase
export const linkDeviceWithPassphrase = (passphrase, deviceType = 'mobile') => {
    if (!verifyRecoveryPassphrase(passphrase)) {
        return { success: false, error: 'Invalid recovery passphrase' };
    }

    const deviceId = registerOwnerDevice(deviceType);

    return {
        success: true,
        deviceId: deviceId,
        message: 'Device successfully linked!'
    };
};

// Auto-login for trusted devices - ONLY FOR OWNER
export const autoLoginOwner = () => {
    // SECURITY: Only owner email can use trusted device auto-login
    const storedEmail = localStorage.getItem('ownerEmail');
    if (storedEmail !== 'polotuspossumus@gmail.com') {
        console.warn('⚠️ Non-owner attempted trusted device login');
        return false;
    }
    
    if (isDeviceTrusted()) {
        localStorage.setItem('userId', 'owner');
        localStorage.setItem('userTier', 'LIFETIME_VIP');
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('tosAccepted', 'true');
        localStorage.setItem('creatorAgreementAccepted', 'true');
        localStorage.setItem('hasOnboarded', 'true');
        console.log('✅ Auto-login: Owner authenticated via trusted device');
        return true;
    }
    return false;
};

// Remove device from trusted list
export const removeDevice = (deviceId) => {
    const trustedDevices = getTrustedDevices();
    const updated = trustedDevices.filter(d => d.id !== deviceId);
    localStorage.setItem('trusted_devices', JSON.stringify(updated));
    console.log('🗑️ Device removed:', deviceId);
};

// Get current device info
export const getCurrentDeviceInfo = () => {
    const deviceId = generateDeviceFingerprint();
    const isTrusted = isDeviceTrusted();
    const trustedDevices = getTrustedDevices();
    const deviceInfo = trustedDevices.find(d => d.id === deviceId);

    return {
        deviceId,
        isTrusted,
        info: deviceInfo || null,
        totalTrustedDevices: trustedDevices.length
    };
};
