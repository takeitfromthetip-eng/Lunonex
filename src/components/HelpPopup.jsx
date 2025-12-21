import React, { useState } from 'react';

/**
 * HelpPopup - Reusable help popup for showing feature descriptions
 * Shows a small "?" button that opens a modal with feature info
 */
export function HelpPopup({ title, features, showOnFirstVisit = false, storageKey }) {
    const [isOpen, setIsOpen] = useState(() => {
        if (showOnFirstVisit && storageKey) {
            const seen = localStorage.getItem(`help_seen_${storageKey}`);
            return !seen;
        }
        return false;
    });

    const handleClose = () => {
        if (storageKey) {
            localStorage.setItem(`help_seen_${storageKey}`, 'true');
        }
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                title="Help & Features"
            >
                ?
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%)',
                borderRadius: '20px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                padding: '40px',
                color: 'white',
                position: 'relative',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}>
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        color: 'white',
                        fontSize: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    ×
                </button>

                {/* Title */}
                <h2 style={{
                    fontSize: '32px',
                    marginBottom: '30px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    {title}
                </h2>

                {/* Features Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '15px',
                                padding: '20px',
                                transition: 'transform 0.2s',
                                cursor: 'default'
                            }}
                        >
                            <div style={{ fontSize: '40px', marginBottom: '15px' }}>{feature.icon}</div>
                            <h3 style={{ fontSize: '18px', marginBottom: '10px', fontWeight: 'bold' }}>
                                {feature.title}
                            </h3>
                            <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.5' }}>
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Got It Button */}
                <button
                    onClick={handleClose}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                    Got it!
                </button>
            </div>
        </div>
    );
}
