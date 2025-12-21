import React from 'react';
import './Custom404.css';

const Custom404 = () => {
    const handleGoHome = () => {
        window.location.href = '/';
    };

    const handleGoToDashboard = () => {
        window.location.href = '/?app=true';
    };

    return (
        <div className="custom-404">
            <div className="custom-404-content">
                <div className="custom-404-icon">
                    <span className="custom-404-number">4</span>
                    <span className="custom-404-emoji">🎌</span>
                    <span className="custom-404-number">4</span>
                </div>

                <h1 className="custom-404-title">Page Not Found</h1>
                <p className="custom-404-description">
                    Looks like you've wandered into uncharted territory!
                    This page doesn't exist in our anime universe.
                </p>

                <div className="custom-404-actions">
                    <button onClick={handleGoHome} className="custom-404-btn primary">
                        🏠 Back to Home
                    </button>
                    <button onClick={handleGoToDashboard} className="custom-404-btn secondary">
                        🎨 Go to Dashboard
                    </button>
                </div>

                <div className="custom-404-suggestions">
                    <h3>Popular Pages:</h3>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/?app=true">Creator Dashboard</a></li>
                        <li><a href="/privacy.html">Privacy Policy</a></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Custom404;
