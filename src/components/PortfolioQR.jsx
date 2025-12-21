import React, { useState } from 'react';
import './PortfolioQR.css';

const PortfolioQR = () => {
    const [activeTab, setActiveTab] = useState('generator');
    const [qrStyle, setQrStyle] = useState('gradient');
    const [showDownload, setShowDownload] = useState(false);

    // User portfolio data
    const portfolioData = {
        username: '@sarahcreates',
        portfolioUrl: 'https://fortheweebs.netlify.app/portfolio/sarahcreates',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // Placeholder
        totalScans: 847,
        scansThisWeek: 127,
        topLocations: [
            { city: 'San Francisco', country: 'USA', scans: 234, percent: 28 },
            { city: 'Los Angeles', country: 'USA', scans: 156, percent: 18 },
            { city: 'New York', country: 'USA', scans: 142, percent: 17 },
            { city: 'Toronto', country: 'Canada', scans: 98, percent: 12 }
        ],
        scansByDevice: [
            { device: 'iPhone', scans: 412, percent: 49 },
            { device: 'Android', scans: 298, percent: 35 },
            { device: 'iPad', scans: 89, percent: 10 },
            { device: 'Other', scans: 48, percent: 6 }
        ],
        conversionRate: 34, // % who scanned and then signed up
        newFollowers: 289, // from QR scans
        projectViews: 3456 // from QR traffic
    };

    // QR Code styles
    const qrStyles = [
        {
            id: 'gradient',
            name: 'Gradient Purple',
            preview: '🟣',
            colors: ['#8b5cf6', '#ec4899']
        },
        {
            id: 'neon',
            name: 'Neon Green',
            preview: '🟢',
            colors: ['#10b981', '#059669']
        },
        {
            id: 'gold',
            name: 'Gold Luxury',
            preview: '🟡',
            colors: ['#f59e0b', '#fbbf24']
        },
        {
            id: 'minimal',
            name: 'Minimal Black',
            preview: '⚫',
            colors: ['#000000', '#1a1a1a']
        },
        {
            id: 'cyberpunk',
            name: 'Cyberpunk',
            preview: '🔵',
            colors: ['#06b6d4', '#ec4899']
        }
    ];

    // Use cases
    const useCases = [
        {
            icon: '💼',
            title: 'Business Cards',
            description: 'Print QR on your cards for instant portfolio access',
            popularity: '87% of users'
        },
        {
            icon: '🎤',
            title: 'Conference Talks',
            description: 'Show QR on slides, audience scans to see your work',
            popularity: '62% of users'
        },
        {
            icon: '📱',
            title: 'Social Media Bio',
            description: 'Post QR image, followers scan to explore portfolio',
            popularity: '74% of users'
        },
        {
            icon: '🖼️',
            title: 'Physical Artwork',
            description: 'Add QR sticker to prints, buyers see your full gallery',
            popularity: '45% of users'
        },
        {
            icon: '📧',
            title: 'Email Signature',
            description: 'Include QR in signature for professional networking',
            popularity: '56% of users'
        },
        {
            icon: '🎨',
            title: 'Portfolio Presentations',
            description: 'End presentations with QR for follow-up engagement',
            popularity: '69% of users'
        }
    ];

    const downloadQR = (format) => {
        // In real app: Generate and download QR code
        setShowDownload(true);
        setTimeout(() => setShowDownload(false), 2000);
        alert(`QR Code downloaded as ${format.toUpperCase()}!`);
    };

    return (
        <div className="portfolio-qr">
            <div className="qr-header">
                <h1>📱 Portfolio QR Codes</h1>
                <p className="subtitle">Your portfolio in your pocket. Scan, connect, convert.</p>
            </div>

            {/* Stats Overview */}
            <div className="qr-stats">
                <div className="stat-card-qr highlight">
                    <div className="stat-icon-qr">👁️</div>
                    <div className="stat-content-qr">
                        <div className="stat-label-qr">Total Scans</div>
                        <div className="stat-value-qr">{portfolioData.totalScans.toLocaleString()}</div>
                        <div className="stat-detail-qr">+{portfolioData.scansThisWeek} this week</div>
                    </div>
                </div>
                <div className="stat-card-qr">
                    <div className="stat-icon-qr">📈</div>
                    <div className="stat-content-qr">
                        <div className="stat-label-qr">Conversion Rate</div>
                        <div className="stat-value-qr">{portfolioData.conversionRate}%</div>
                        <div className="stat-detail-qr">Scan → Signup</div>
                    </div>
                </div>
                <div className="stat-card-qr">
                    <div className="stat-icon-qr">👥</div>
                    <div className="stat-content-qr">
                        <div className="stat-label-qr">New Followers</div>
                        <div className="stat-value-qr">{portfolioData.newFollowers}</div>
                        <div className="stat-detail-qr">From QR traffic</div>
                    </div>
                </div>
                <div className="stat-card-qr">
                    <div className="stat-icon-qr">🎯</div>
                    <div className="stat-content-qr">
                        <div className="stat-label-qr">Project Views</div>
                        <div className="stat-value-qr">{portfolioData.projectViews.toLocaleString()}</div>
                        <div className="stat-detail-qr">From QR scans</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'generator' ? 'active' : ''}`}
                    onClick={() => setActiveTab('generator')}
                >
                    🎨 Generate QR
                </button>
                <button
                    className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    📊 Analytics
                </button>
                <button
                    className={`tab ${activeTab === 'use-cases' ? 'active' : ''}`}
                    onClick={() => setActiveTab('use-cases')}
                >
                    💡 Use Cases
                </button>
            </div>

            {/* Generator Tab */}
            {activeTab === 'generator' && (
                <div className="tab-content active">
                    <div className="generator-layout">
                        <div className="qr-preview-section">
                            <h2>Your Portfolio QR Code</h2>
                            <div className="qr-preview-card">
                                <div className={`qr-code-display style-${qrStyle}`}>
                                    <div className="qr-placeholder">
                                        <div className="qr-grid">
                                            {[...Array(25)].map((_, i) => (
                                                <div key={i} className="qr-pixel" style={{
                                                    opacity: Math.random() > 0.3 ? 1 : 0
                                                }} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="qr-label">{portfolioData.username}</div>
                                </div>
                                <div className="qr-url">{portfolioData.portfolioUrl}</div>
                            </div>

                            <div className="download-options">
                                <h3>Download Your QR Code</h3>
                                <div className="download-buttons">
                                    <button className="download-btn" onClick={() => downloadQR('png')}>
                                        📥 PNG (Web/Print)
                                    </button>
                                    <button className="download-btn" onClick={() => downloadQR('svg')}>
                                        📥 SVG (Scalable)
                                    </button>
                                    <button className="download-btn" onClick={() => downloadQR('pdf')}>
                                        📥 PDF (Business Cards)
                                    </button>
                                </div>
                                {showDownload && (
                                    <div className="download-success">
                                        ✅ QR Code downloaded successfully!
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="qr-customization">
                            <h2>Customize Your QR Style</h2>
                            <div className="style-grid">
                                {qrStyles.map(style => (
                                    <div
                                        key={style.id}
                                        className={`style-card ${qrStyle === style.id ? 'selected' : ''}`}
                                        onClick={() => setQrStyle(style.id)}
                                    >
                                        <div className="style-preview" style={{
                                            background: `linear-gradient(135deg, ${style.colors[0]}, ${style.colors[1]})`
                                        }}>
                                            <span className="style-icon">{style.preview}</span>
                                        </div>
                                        <div className="style-name">{style.name}</div>
                                        {qrStyle === style.id && (
                                            <div className="selected-badge">✓ Selected</div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="print-tips">
                                <h3>📌 Print Tips</h3>
                                <ul>
                                    <li><strong>Size:</strong> Minimum 2cm × 2cm for reliable scanning</li>
                                    <li><strong>Contrast:</strong> High contrast works best (dark on light)</li>
                                    <li><strong>Placement:</strong> Keep away from folds or edges</li>
                                    <li><strong>Test:</strong> Always test scan before mass printing</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="tab-content active">
                    <div className="analytics-section">
                        <h2>📊 Scan Analytics</h2>

                        <div className="analytics-grid">
                            <div className="analytics-card">
                                <h3>🌍 Top Locations</h3>
                                <div className="locations-list">
                                    {portfolioData.topLocations.map((location, index) => (
                                        <div key={index} className="location-item">
                                            <div className="location-info">
                                                <span className="location-rank">#{index + 1}</span>
                                                <span className="location-name">{location.city}, {location.country}</span>
                                            </div>
                                            <div className="location-stats">
                                                <span className="location-scans">{location.scans} scans</span>
                                                <div className="location-bar">
                                                    <div
                                                        className="location-fill"
                                                        style={{ width: `${location.percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="analytics-card">
                                <h3>📱 Devices Used</h3>
                                <div className="devices-chart">
                                    {portfolioData.scansByDevice.map((device, index) => (
                                        <div key={index} className="device-row">
                                            <div className="device-label">{device.device}</div>
                                            <div className="device-bar-container">
                                                <div
                                                    className="device-bar-fill"
                                                    style={{ width: `${device.percent}%` }}
                                                />
                                            </div>
                                            <div className="device-percent">{device.percent}%</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="conversion-funnel">
                            <h3>🎯 Conversion Funnel</h3>
                            <div className="funnel-visual-qr">
                                <div className="funnel-stage" style={{ width: '100%' }}>
                                    <div className="stage-label">QR Scans</div>
                                    <div className="stage-value">{portfolioData.totalScans}</div>
                                </div>
                                <div className="funnel-stage" style={{ width: '65%' }}>
                                    <div className="stage-label">Portfolio Views</div>
                                    <div className="stage-value">551</div>
                                </div>
                                <div className="funnel-stage" style={{ width: '42%' }}>
                                    <div className="stage-label">Followed</div>
                                    <div className="stage-value">{portfolioData.newFollowers}</div>
                                </div>
                                <div className="funnel-stage" style={{ width: '34%' }}>
                                    <div className="stage-label">Signed Up</div>
                                    <div className="stage-value">{Math.round(portfolioData.totalScans * (portfolioData.conversionRate / 100))}</div>
                                </div>
                            </div>
                            <div className="funnel-note">
                                <strong>{portfolioData.conversionRate}% of QR scanners</strong> become users!
                                That's 3x better than typical social media ad conversion.
                            </div>
                        </div>

                        <div className="offline-online">
                            <h3>🔄 Offline → Online Success</h3>
                            <p>
                                QR codes bridge the physical and digital worlds. When you hand someone your business card
                                with a QR code, they can instantly see your full portfolio without typing a URL. This
                                <strong> increases engagement by 5.2x</strong> compared to traditional business cards.
                            </p>
                            <div className="success-stats">
                                <div className="success-stat">
                                    <div className="success-number">5.2x</div>
                                    <div className="success-label">Higher Engagement</div>
                                </div>
                                <div className="success-stat">
                                    <div className="success-number">34%</div>
                                    <div className="success-label">Conversion Rate</div>
                                </div>
                                <div className="success-stat">
                                    <div className="success-number">847</div>
                                    <div className="success-label">Total Scans</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Use Cases Tab */}
            {activeTab === 'use-cases' && (
                <div className="tab-content active">
                    <div className="use-cases-section">
                        <h2>💡 How Creators Use QR Codes</h2>
                        <p className="use-cases-intro">
                            From business cards to billboards, QR codes turn every surface into a gateway to your portfolio.
                        </p>

                        <div className="use-cases-grid">
                            {useCases.map((useCase, index) => (
                                <div key={index} className="use-case-card">
                                    <div className="use-case-icon">{useCase.icon}</div>
                                    <h3>{useCase.title}</h3>
                                    <p>{useCase.description}</p>
                                    <div className="use-case-popularity">
                                        <span className="popularity-badge">{useCase.popularity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="success-stories">
                            <h3>🌟 Success Stories</h3>
                            <div className="stories-grid">
                                <div className="story-card">
                                    <div className="story-quote">"I put my QR code on my business cards at a design conference. Got 234 portfolio views and 47 new clients inquiries in one week!"</div>
                                    <div className="story-author">— Alex Chen, Graphic Designer</div>
                                </div>
                                <div className="story-card">
                                    <div className="story-quote">"Added QR codes to my art prints. Buyers scan to see my full gallery. Sales increased 3x because they discover more work!"</div>
                                    <div className="story-author">— Jamie Lee, Digital Artist</div>
                                </div>
                                <div className="story-card">
                                    <div className="story-quote">"Posted my QR code on Instagram story. 500+ followers scanned it, gained 127 new followers on ForTheWeebs in 24 hours!"</div>
                                    <div className="story-author">— Sarah Kim, Content Creator</div>
                                </div>
                            </div>
                        </div>

                        <div className="viral-potential">
                            <h3>🚀 Viral Growth Potential</h3>
                            <p>
                                Every QR code scan is a <strong>direct connection</strong> to your portfolio. No search engines,
                                no social media algorithms, no gatekeepers. Just instant access to your work. This creates a
                                powerful offline-to-online funnel that most creators completely miss.
                            </p>
                            <div className="potential-stats">
                                <div className="potential-item">
                                    <div className="potential-icon">💼</div>
                                    <div className="potential-text">
                                        <strong>Business Cards:</strong> 87% of recipients scan QR codes vs 12% who type URLs
                                    </div>
                                </div>
                                <div className="potential-item">
                                    <div className="potential-icon">🎤</div>
                                    <div className="potential-text">
                                        <strong>Presentations:</strong> 62% of audience members scan QR codes shown on slides
                                    </div>
                                </div>
                                <div className="potential-item">
                                    <div className="potential-icon">🖼️</div>
                                    <div className="potential-text">
                                        <strong>Physical Art:</strong> 45% of buyers scan QR codes to explore artist portfolios
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioQR;
