import React, { useState } from 'react';
import './QuickActions.css';

/**
 * Floating quick action button (Speed Dial)
 * Fast access to common actions
 */

const QuickActions = () => {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        { id: 'new', label: 'New Project', icon: '➕', color: '#10b981' },
        { id: 'save', label: 'Quick Save', icon: '💾', color: '#3b82f6' },
        { id: 'export', label: 'Export', icon: '📤', color: '#f59e0b' },
        { id: 'share', label: 'Share', icon: '🔗', color: '#8b5cf6' },
    ];

    const handleAction = (actionId) => {
        console.log('Quick action:', actionId);
        setIsOpen(false);

        switch (actionId) {
            case 'new':
                alert('New project dialog coming soon!');
                break;
            case 'save':
                if (window.saveProject) {
                    window.saveProject();
                }
                break;
            case 'export':
                if (window.exportProject) {
                    window.exportProject();
                }
                break;
            case 'share':
                if (window.shareProject) {
                    window.shareProject();
                }
                break;
        }
    };

    return (
        <>
            {isOpen && (
                <div
                    className="quick-actions-overlay"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`quick-actions ${isOpen ? 'open' : ''}`}>
                {isOpen && (
                    <div className="action-items">
                        {actions.map((action, index) => (
                            <button
                                key={action.id}
                                className="action-item"
                                style={{
                                    background: action.color,
                                    animationDelay: `${index * 0.05}s`
                                }}
                                onClick={() => handleAction(action.id)}
                                title={action.label}
                            >
                                <span className="action-icon">{action.icon}</span>
                                <span className="action-label">{action.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                <button
                    className={`quick-actions-trigger ${isOpen ? 'active' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Quick actions"
                >
                    {isOpen ? '✕' : '⚡'}
                </button>
            </div>
        </>
    );
};

export default QuickActions;
