import React from 'react';
import './A11ySkipLink.css';

/**
 * Accessibility skip link - allows keyboard users to skip navigation
 * Appears on Tab focus, hidden otherwise
 */
const A11ySkipLink = () => {
    return (
        <a href="#main-content" className="skip-link">
            Skip to main content
        </a>
    );
};

export default A11ySkipLink;
