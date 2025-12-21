import React, { useState, useEffect } from 'react';
import './CookieConsent.css';

const CookieConsent = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Check if user has already consented
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setVisible(false);

        // Initialize analytics if accepted
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setVisible(false);

        // Disable analytics if declined
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
    };

    if (!visible) return null;

    return (
        <div className="cookie-consent">
            <div className="cookie-content">
                <p>
                    🍪 We use cookies to enhance your experience, analyze site traffic, and personalize content.
                    By clicking "Accept", you consent to our use of cookies.
                </p>
                <div className="cookie-buttons">
                    <button onClick={handleAccept} className="accept-btn">
                        Accept All
                    </button>
                    <button onClick={handleDecline} className="decline-btn">
                        Decline
                    </button>
                    <a href="/privacy" className="privacy-link">Privacy Policy</a>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
