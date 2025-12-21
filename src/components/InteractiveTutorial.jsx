import React, { useState, useEffect } from 'react';
import './InteractiveTutorial.css';

/**
 * Interactive click-through tutorial system
 * Guides users through the platform with step-by-step instructions
 */

const TUTORIAL_STEPS = [
    {
        id: 'welcome',
        title: '👋 Welcome to ForTheWeebs!',
        description: 'Let\'s take a quick tour of your new creator platform. This will only take 2 minutes!',
        target: null,
        position: 'center',
        actions: ['Next']
    },
    {
        id: 'command_palette',
        title: '⚡ Command Palette',
        description: 'Press Ctrl+K (or Cmd+K on Mac) anytime to instantly access any feature. Try it now!',
        target: 'body',
        position: 'center',
        highlight: 'Press Ctrl+K',
        actions: ['Try it', 'Skip', 'Next']
    },
    {
        id: 'quick_actions',
        title: '🚀 Quick Actions',
        description: 'Click this floating button for instant access to New Project, Save, Export, and Share.',
        target: '.quick-actions-trigger',
        position: 'left',
        actions: ['Next', 'Skip']
    },
    {
        id: 'creator_tools',
        title: '🎨 5 Powerful Creator Tools',
        description: 'You have access to Audio Editor, Comic Maker, Graphic Designer, Photo Editor, and VR/AR Studio. Each tool is designed for professional content creation.',
        target: null,
        position: 'center',
        actions: ['Show Me Tools', 'Next']
    },
    {
        id: 'auto_save',
        title: '💾 Auto-Save',
        description: 'Your work is automatically saved every 30 seconds. Never lose your progress!',
        target: null,
        position: 'center',
        actions: ['Got it!', 'Next']
    },
    {
        id: 'keyboard_shortcuts',
        title: '⌨️ Keyboard Shortcuts',
        description: 'Use Ctrl+S to save, Ctrl+E to export, Ctrl+K to search. Press Shift+? anytime to see all shortcuts.',
        target: null,
        position: 'center',
        actions: ['View All Shortcuts', 'Next']
    },
    {
        id: 'theme_toggle',
        title: '🌓 Theme Toggle',
        description: 'Switch between dark and light mode to match your preference. Look for the theme button in the top corner.',
        target: '[data-theme-toggle]',
        position: 'bottom',
        actions: ['Try it', 'Next']
    },
    {
        id: 'achievements',
        title: '🏆 Achievements',
        description: 'Unlock achievements as you create! Track your progress and earn points. Check the achievements panel to see what you can unlock.',
        target: null,
        position: 'center',
        actions: ['View Achievements', 'Next']
    },
    {
        id: 'help_resources',
        title: '📚 Help & Resources',
        description: 'Need help? Access the full documentation, video tutorials, and command reference from the help menu or Command Palette.',
        target: null,
        position: 'center',
        actions: ['Open Help Center', 'Next']
    },
    {
        id: 'complete',
        title: '🎉 You\'re All Set!',
        description: 'You\'re ready to start creating amazing content! Remember: Press Ctrl+K for quick access to everything, and check out the full tutorials when you need detailed guidance.',
        target: null,
        position: 'center',
        actions: ['Start Creating!', 'Restart Tour']
    }
];

const InteractiveTutorial = ({ onComplete }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        // Check if user has completed tutorial
        const hasCompleted = localStorage.getItem('tutorial-completed');
        if (!hasCompleted) {
            // Show tutorial after a short delay
            setTimeout(() => setIsActive(true), 1000);
        }

        // Global function to restart tutorial
        window.startTutorial = () => {
            setCurrentStep(0);
            setIsActive(true);
            setIsMinimized(false);
        };
    }, []);

    const handleNext = () => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            completeTutorial();
        }
    };

    const handleSkip = () => {
        completeTutorial();
    };

    const completeTutorial = () => {
        localStorage.setItem('tutorial-completed', 'true');
        setIsActive(false);
        if (onComplete) onComplete();

        // Unlock first achievement
        if (window.unlockAchievement) {
            window.unlockAchievement('first_steps');
        }
    };

    const handleAction = (action) => {
        switch (action) {
            case 'Next':
                handleNext();
                break;
            case 'Skip':
                handleSkip();
                break;
            case 'Try it':
                // Highlight the feature
                handleNext();
                break;
            case 'Show Me Tools':
                // Navigate to tools
                handleNext();
                break;
            case 'View All Shortcuts':
                if (window.showKeyboardShortcuts) {
                    window.showKeyboardShortcuts();
                }
                handleNext();
                break;
            case 'View Achievements':
                // Show achievements panel
                handleNext();
                break;
            case 'Open Help Center':
                window.open('/help', '_blank');
                handleNext();
                break;
            case 'Start Creating!':
                completeTutorial();
                break;
            case 'Restart Tour':
                setCurrentStep(0);
                break;
            default:
                handleNext();
        }
    };

    if (!isActive) return null;

    const step = TUTORIAL_STEPS[currentStep];

    if (isMinimized) {
        return (
            <button
                className="tutorial-minimized"
                onClick={() => setIsMinimized(false)}
                title="Resume Tutorial"
            >
                📚 Resume Tutorial ({currentStep + 1}/{TUTORIAL_STEPS.length})
            </button>
        );
    }

    return (
        <>
            <div className="tutorial-overlay" />

            <div className={`tutorial-card ${step.position}`}>
                <div className="tutorial-header">
                    <div className="tutorial-progress">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                            />
                        </div>
                        <span className="progress-text">
                            Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                        </span>
                    </div>
                    <div className="tutorial-controls">
                        <button
                            className="tutorial-minimize"
                            onClick={() => setIsMinimized(true)}
                            title="Minimize"
                        >
                            ➖
                        </button>
                        <button
                            className="tutorial-close"
                            onClick={handleSkip}
                            title="Exit Tutorial"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="tutorial-content">
                    <h2 className="tutorial-title">{step.title}</h2>
                    <p className="tutorial-description">{step.description}</p>

                    {step.highlight && (
                        <div className="tutorial-highlight">
                            <kbd>{step.highlight}</kbd>
                        </div>
                    )}
                </div>

                <div className="tutorial-actions">
                    {step.actions.map((action, idx) => (
                        <button
                            key={idx}
                            className={`tutorial-btn ${idx === 0 ? 'primary' : 'secondary'}`}
                            onClick={() => handleAction(action)}
                        >
                            {action}
                        </button>
                    ))}
                </div>

                <div className="tutorial-footer">
                    <button
                        className="tutorial-link"
                        onClick={() => window.open('/tutorials', '_blank')}
                    >
                        📖 View Full Tutorials
                    </button>
                </div>
            </div>
        </>
    );
};

export default InteractiveTutorial;
export { TUTORIAL_STEPS };
