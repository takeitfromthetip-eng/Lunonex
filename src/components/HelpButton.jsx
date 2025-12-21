import React, { useState } from 'react';
import BugReporter from './BugReporter';
import './HelpButton.css';

/**
 * Floating help button - Always accessible
 */

const HelpButton = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isBugReporterOpen, setIsBugReporterOpen] = useState(false);

    const handleMenuAction = (action) => {
        setIsMenuOpen(false);

        switch (action) {
            case 'tutorial':
                if (window.startTutorial) window.startTutorial();
                break;
            case 'help':
                window.open('/help', '_blank');
                break;
            case 'shortcuts':
                if (window.showKeyboardShortcuts) {
                    window.showKeyboardShortcuts();
                } else {
                    alert('Press Shift+? to view all keyboard shortcuts!');
                }
                break;
            case 'feedback':
                setIsBugReporterOpen(true);
                break;
            default:
                break;
        }
    };

    return (
        <>
            <button
                className="help-button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                title="Need help?"
            >
                ?
            </button>

            {isMenuOpen && (
                <>
                    <div
                        className="help-menu-overlay"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="help-menu">
                        <button onClick={() => handleMenuAction('tutorial')}>
                            🎓 Start Tutorial
                        </button>
                        <button onClick={() => handleMenuAction('help')}>
                            📚 Help Center
                        </button>
                        <button onClick={() => handleMenuAction('shortcuts')}>
                            ⌨️ Keyboard Shortcuts
                        </button>
                        <button onClick={() => handleMenuAction('feedback')}>
                            � Report Bug
                        </button>
                    </div>
                </>
            )}

            <BugReporter
                isOpen={isBugReporterOpen}
                onClose={() => setIsBugReporterOpen(false)}
            />
        </>
    );
};

export default HelpButton;
