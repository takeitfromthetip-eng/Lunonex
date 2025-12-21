import React, { useState, useEffect } from 'react';
import './InstallPWA.css';

/**
 * Install PWA prompt component
 * Shows when app is installable and not yet installed
 */
const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the default browser prompt
            e.preventDefault();

            // Save the event for later use
            setDeferredPrompt(e);

            // Show our custom prompt
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowPrompt(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;

        console.log(`User response to install prompt: ${outcome}`);

        // Clear the deferred prompt
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-prompt-dismissed', 'true');
    };

    // Don't show if dismissed before
    if (localStorage.getItem('pwa-prompt-dismissed') === 'true') {
        return null;
    }

    if (!showPrompt) return null;

    return (
        <div className="install-pwa">
            <div className="install-pwa-content">
                <div className="install-pwa-icon">📱</div>
                <div className="install-pwa-text">
                    <h3>Install ForTheWeebs</h3>
                    <p>Get the full app experience with offline access!</p>
                </div>
                <div className="install-pwa-actions">
                    <button onClick={handleInstallClick} className="install-btn">
                        Install
                    </button>
                    <button onClick={handleDismiss} className="dismiss-btn">
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPWA;
