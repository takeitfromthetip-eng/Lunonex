import React, { useState, useEffect } from 'react';
import {
    registerOwnerDevice,
    getTrustedDevices,
    removeDevice,
    getCurrentDeviceInfo,
    generateRecoveryPassphrase,
    linkDeviceWithPassphrase
} from '../utils/deviceAuth';

/**
 * Device Manager - Manage trusted devices and recovery
 */
export default function DeviceManager({ isOwner }) {
    const [devices, setDevices] = useState([]);
    const [currentDevice, setCurrentDevice] = useState(null);
    const [showRecovery, setShowRecovery] = useState(false);
    const [recoveryPassphrase, setRecoveryPassphrase] = useState('');
    const [showLinkDevice, setShowLinkDevice] = useState(false);
    const [linkPassphrase, setLinkPassphrase] = useState('');
    const [linkDeviceType, setLinkDeviceType] = useState('mobile');

    useEffect(() => {
        loadDeviceInfo();
    }, []);

    const loadDeviceInfo = () => {
        const info = getCurrentDeviceInfo();
        setCurrentDevice(info);
        setDevices(getTrustedDevices());
    };

    const handleRegisterDevice = () => {
        const deviceType = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
        registerOwnerDevice(deviceType);
        loadDeviceInfo();
        alert('✅ This device has been registered as a trusted device!');
    };

    const handleGenerateRecovery = () => {
        const passphrase = generateRecoveryPassphrase();
        setRecoveryPassphrase(passphrase);
        setShowRecovery(true);
    };

    const handleCopyPassphrase = () => {
        navigator.clipboard.writeText(recoveryPassphrase);
        alert('✅ Recovery passphrase copied to clipboard!\n\nStore this somewhere safe - you\'ll need it to add new devices.');
    };

    const handleLinkDevice = () => {
        const result = linkDeviceWithPassphrase(linkPassphrase, linkDeviceType);
        if (result.success) {
            alert(`✅ ${result.message}\n\nThis device is now trusted and will auto-login.`);
            setShowLinkDevice(false);
            setLinkPassphrase('');
            loadDeviceInfo();
        } else {
            alert(`❌ ${result.error}\n\nPlease check your recovery passphrase and try again.`);
        }
    };

    const handleRemoveDevice = (deviceId) => {
        if (confirm('Are you sure you want to remove this device?\n\nIt will no longer auto-login.')) {
            removeDevice(deviceId);
            loadDeviceInfo();
            alert('✅ Device removed from trusted devices list.');
        }
    };

    if (!isOwner) {
        return null;
    }

    return (
        <div style={{
            background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
            padding: '30px',
            borderRadius: '20px',
            color: '#fff',
            maxWidth: '900px',
            margin: '30px auto'
        }}>
            <h2 style={{ fontSize: '28px', marginBottom: '10px', fontWeight: 'bold' }}>
                🔐 Device Management
            </h2>
            <p style={{ opacity: 0.7, marginBottom: '30px' }}>
                Manage trusted devices and recovery access
            </p>

            {/* Current Device Status */}
            <div style={{
                background: currentDevice?.isTrusted ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `2px solid ${currentDevice?.isTrusted ? '#22c55e' : '#ef4444'}`,
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '30px'
            }}>
                <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>📱 Current Device</h3>
                <div style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.8' }}>
                    <div><strong>Device ID:</strong> {currentDevice?.deviceId || 'Unknown'}</div>
                    <div><strong>Status:</strong> {currentDevice?.isTrusted ? '✅ Trusted (Auto-login enabled)' : '❌ Not trusted'}</div>
                    <div><strong>Type:</strong> {/Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? '📱 Mobile' : '💻 Desktop'}</div>
                </div>

                {!currentDevice?.isTrusted && (
                    <button
                        onClick={handleRegisterDevice}
                        style={{
                            marginTop: '15px',
                            padding: '12px 24px',
                            background: '#22c55e',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}
                    >
                        ✅ Register This Device
                    </button>
                )}
            </div>

            {/* Recovery System */}
            <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '2px solid #3b82f6',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '30px'
            }}>
                <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>🔑 Recovery System</h3>
                <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '15px' }}>
                    Generate a recovery passphrase to link new devices if you lose access to your current ones.
                    <br />
                    <strong>Store this passphrase safely - it's your backup!</strong>
                </p>

                {!showRecovery ? (
                    <button
                        onClick={handleGenerateRecovery}
                        style={{
                            padding: '12px 24px',
                            background: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}
                    >
                        🔑 Generate Recovery Passphrase
                    </button>
                ) : (
                    <div>
                        <div style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            padding: '15px',
                            borderRadius: '8px',
                            marginBottom: '15px',
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            wordBreak: 'break-all'
                        }}>
                            {recoveryPassphrase}
                        </div>
                        <button
                            onClick={handleCopyPassphrase}
                            style={{
                                padding: '10px 20px',
                                background: '#10b981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}
                        >
                            📋 Copy Passphrase
                        </button>
                    </div>
                )}
            </div>

            {/* Link New Device */}
            <div style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '2px solid #a855f7',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '30px'
            }}>
                <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>📲 Link New Device</h3>
                <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '15px' }}>
                    Use your recovery passphrase to add a new phone or computer.
                </p>

                {!showLinkDevice ? (
                    <button
                        onClick={() => setShowLinkDevice(true)}
                        style={{
                            padding: '12px 24px',
                            background: '#a855f7',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}
                    >
                        📲 Link Device
                    </button>
                ) : (
                    <div>
                        <select
                            value={linkDeviceType}
                            onChange={(e) => setLinkDeviceType(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                color: '#fff',
                                marginBottom: '15px',
                                fontSize: '14px'
                            }}
                        >
                            <option value="mobile">📱 Mobile Device</option>
                            <option value="desktop">💻 Desktop/Laptop</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Enter recovery passphrase..."
                            value={linkPassphrase}
                            onChange={(e) => setLinkPassphrase(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                color: '#fff',
                                marginBottom: '15px',
                                fontSize: '14px'
                            }}
                        />

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={handleLinkDevice}
                                disabled={!linkPassphrase.trim()}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: linkPassphrase.trim() ? '#10b981' : '#4b5563',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: linkPassphrase.trim() ? 'pointer' : 'not-allowed',
                                    fontWeight: 'bold',
                                    fontSize: '14px'
                                }}
                            >
                                ✅ Link This Device
                            </button>
                            <button
                                onClick={() => {
                                    setShowLinkDevice(false);
                                    setLinkPassphrase('');
                                }}
                                style={{
                                    padding: '12px 24px',
                                    background: '#6b7280',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Trusted Devices List */}
            <div>
                <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>📱 Trusted Devices ({devices.length})</h3>
                {devices.length === 0 ? (
                    <p style={{ opacity: 0.7, fontSize: '14px' }}>No trusted devices yet. Register this device to enable auto-login.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {devices.map((device) => (
                            <div
                                key={device.id}
                                style={{
                                    background: device.id === currentDevice?.deviceId ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                    border: device.id === currentDevice?.deviceId ? '2px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.1)',
                                    padding: '15px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{ fontSize: '14px' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                        {device.type === 'mobile' ? '📱' : '💻'} {device.type === 'mobile' ? 'Mobile Device' : 'Desktop'}
                                        {device.id === currentDevice?.deviceId && ' (This Device)'}
                                    </div>
                                    <div style={{ opacity: 0.7, fontSize: '12px' }}>
                                        Registered: {new Date(device.registeredAt).toLocaleDateString()}
                                    </div>
                                    <div style={{ opacity: 0.7, fontSize: '12px' }}>
                                        Last access: {new Date(device.lastAccess).toLocaleString()}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveDevice(device.id)}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#ef4444',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    🗑️ Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
