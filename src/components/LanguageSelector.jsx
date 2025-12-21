/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
    LANGUAGES,
    getCurrentLanguage,
    setLanguage,
    getAvailableLanguages
} from '../utils/i18n';

/**
 * Language Selector Component
 * Allows users to select from 50+ languages
 * Automatically applies RTL for Arabic, Hebrew, Persian, Urdu
 */
export function LanguageSelector({ onLanguageChange }) {
    const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
    const [showSelector, setShowSelector] = useState(false);
    const availableLanguages = getAvailableLanguages();

    const handleLanguageChange = (langCode) => {
        setLanguage(langCode);
        setCurrentLang(langCode);
        setShowSelector(false);

        if (onLanguageChange) {
            onLanguageChange(langCode);
        }

        // Reload page to apply translations
        window.location.reload();
    };

    const currentLanguage = LANGUAGES[currentLang] || LANGUAGES.en;

    return (
        <>
            <button
                onClick={() => setShowSelector(!showSelector)}
                style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                <span style={{ fontSize: '1.2rem' }}>{currentLanguage.flag}</span>
                <span>{currentLanguage.nativeName}</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>▼</span>
            </button>

            {showSelector && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setShowSelector(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.7)',
                            zIndex: 999
                        }}
                    />

                    {/* Selector Modal */}
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: '#1a1a2e',
                        border: '2px solid #667eea',
                        borderRadius: '15px',
                        padding: '30px',
                        zIndex: 1000,
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        maxWidth: '800px',
                        width: '90%'
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{
                                margin: 0,
                                color: 'white',
                                fontSize: '1.5rem'
                            }}>
                                🌍 Select Your Language
                            </h3>
                            <button
                                onClick={() => setShowSelector(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    padding: '5px 10px'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Popular Languages */}
                        <div style={{ marginBottom: '30px' }}>
                            <h4 style={{
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: '0.9rem',
                                marginBottom: '15px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                Popular Languages
                            </h4>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                gap: '10px'
                            }}>
                                {['en', 'es', 'fr', 'de', 'ja', 'zh-CN', 'ko', 'pt', 'ar', 'ru', 'hi', 'it'].map(code => {
                                    const lang = LANGUAGES[code];
                                    return (
                                        <button
                                            key={code}
                                            onClick={() => handleLanguageChange(code)}
                                            style={{
                                                background: currentLang === code ? '#667eea' : 'rgba(255,255,255,0.1)',
                                                border: currentLang === code ? '2px solid #764ba2' : '1px solid rgba(255,255,255,0.2)',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                textAlign: 'left',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (currentLang !== code) {
                                                    e.target.style.background = 'rgba(102, 126, 234, 0.3)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (currentLang !== code) {
                                                    e.target.style.background = 'rgba(255,255,255,0.1)';
                                                }
                                            }}
                                        >
                                            <span style={{ fontSize: '1.5rem' }}>{lang.flag}</span>
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{lang.nativeName}</div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{lang.name}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* All Languages */}
                        <div>
                            <h4 style={{
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: '0.9rem',
                                marginBottom: '15px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                All Languages ({availableLanguages.length})
                            </h4>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                gap: '10px'
                            }}>
                                {availableLanguages
                                    .sort((a, b) => a.nativeName.localeCompare(b.nativeName))
                                    .map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => handleLanguageChange(lang.code)}
                                            style={{
                                                background: currentLang === lang.code ? '#667eea' : 'rgba(255,255,255,0.1)',
                                                border: currentLang === lang.code ? '2px solid #764ba2' : '1px solid rgba(255,255,255,0.2)',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                textAlign: 'left',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (currentLang !== lang.code) {
                                                    e.target.style.background = 'rgba(102, 126, 234, 0.3)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (currentLang !== lang.code) {
                                                    e.target.style.background = 'rgba(255,255,255,0.1)';
                                                }
                                            }}
                                        >
                                            <span style={{ fontSize: '1.5rem' }}>{lang.flag}</span>
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{lang.nativeName}</div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{lang.name}</div>
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        </div>

                        {/* Footer Note */}
                        <p style={{
                            marginTop: '20px',
                            fontSize: '0.85rem',
                            opacity: 0.7,
                            textAlign: 'center',
                            color: 'white'
                        }}>
                            ✨ Interface automatically adapts to your language<br />
                            🔄 RTL support for Arabic, Hebrew, Persian & Urdu
                        </p>
                    </div>
                </>
            )}
        </>
    );
}

export default LanguageSelector;
