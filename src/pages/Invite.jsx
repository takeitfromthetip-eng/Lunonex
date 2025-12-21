import React, { useState, useEffect } from 'react';
import { validateInvite } from '../utils/api';
import './Invite.css';

/**
 * Special invite code page
 * - Friends & Family: 50 people, full access, $5/month minimum
 * - VIP Family: 2 people (mom & stepdad), 100% free forever
 */

const Invite = () => {
    const [inviteCode, setInviteCode] = useState('');
    const [codeInfo, setCodeInfo] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check URL for invite code
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
            setInviteCode(code);
            validateCode(code);
        }
    }, []);

    const validateCode = async (code) => {
        setIsValidating(true);
        setError('');

        try {
            const data = await validateInvite(code);

            if (data.valid) {
                setCodeInfo(data);
            } else {
                setError(data.message || 'Invalid or expired invite code');
            }
        } catch (err) {
            setError('Failed to validate code. Please try again.');
        } finally {
            setIsValidating(false);
        }
    };

    const handleSignup = () => {
        // Store invite code and redirect to signup
        localStorage.setItem('invite_code', inviteCode);
        window.location.href = `/signup?invite=${inviteCode}`;
    };

    if (isValidating) {
        return (
            <div className="invite-page">
                <div className="invite-card">
                    <div className="loading-spinner">⏳</div>
                    <p>Validating your invite code...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="invite-page">
                <div className="invite-card error">
                    <h1>❌ Invalid Invite Code</h1>
                    <p>{error}</p>
                    <button onClick={() => window.location.href = '/'}>
                        Go to Homepage
                    </button>
                </div>
            </div>
        );
    }

    if (!codeInfo) {
        return (
            <div className="invite-page">
                <div className="invite-card">
                    <h1>🎟️ Enter Your Invite Code</h1>
                    <input
                        type="text"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        placeholder="ENTER-CODE-HERE"
                        className="code-input"
                    />
                    <button onClick={() => validateCode(inviteCode)}>
                        Validate Code
                    </button>
                </div>
            </div>
        );
    }

    const isFriendsFamily = codeInfo.code_type === 'friends_family';
    const isVIPFamily = codeInfo.code_type === 'vip_family';

    return (
        <div className="invite-page">
            <div className="invite-card success">
                <div className="success-badge">
                    {isVIPFamily ? '👑' : '🎉'}
                </div>

                <h1>
                    {isVIPFamily ? 'VIP Family Access' : 'Friends & Family Access'}
                </h1>

                <div className="access-details">
                    <h3>What You Get:</h3>
                    <ul>
                        <li>✅ Full access to all 5 creator tools</li>
                        <li>✅ Audio Editor (Pro features)</li>
                        <li>✅ Comic Maker (Unlimited panels)</li>
                        <li>✅ Graphic Designer (All templates)</li>
                        <li>✅ Photo Editor (Premium filters)</li>
                        <li>✅ VR/AR Studio (Complete toolkit)</li>
                        <li>✅ Export in all formats</li>
                        <li>✅ Priority support</li>
                    </ul>

                    {isFriendsFamily && (
                        <div className="pricing-info">
                            <h3>💰 Special Pricing:</h3>
                            <p>
                                Pay what works for you ($5 - $500/month) toward full unlock.
                                <br />
                                <strong>Minimum: $5/month</strong>
                                <br />
                                Every payment counts toward permanent ownership!
                            </p>
                        </div>
                    )}

                    {isVIPFamily && (
                        <div className="vip-info">
                            <h3>👑 VIP Benefits:</h3>
                            <p>
                                <strong>100% FREE FOREVER</strong>
                                <br />
                                Test everything, make some money, enjoy!
                            </p>
                        </div>
                    )}

                    <div className="availability">
                        <p>
                            <strong>Spots Available:</strong>{' '}
                            {codeInfo.max_uses - codeInfo.current_uses} / {codeInfo.max_uses}
                        </p>
                    </div>
                </div>

                <button className="cta-button" onClick={handleSignup}>
                    {isVIPFamily ? '👑 Claim VIP Access' : '🎉 Create Your Account'}
                </button>

                <p className="terms">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default Invite;
