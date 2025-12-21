import React, { useState, useEffect } from 'react';
import './KeyboardShortcuts.css';

const KeyboardShortcuts = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleKeyPress = (e) => {
            // Show overlay when '?' is pressed (Shift + /)
            if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                // Don't trigger if user is typing in an input
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    setIsVisible(prev => !prev);
                }
            }

            // Close overlay with Escape
            if (e.key === 'Escape' && isVisible) {
                setIsVisible(false);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isVisible]);

    const shortcuts = {
        'General': [
            { keys: ['?'], description: 'Show/hide keyboard shortcuts' },
            { keys: ['Ctrl', 'S'], description: 'Save project' },
            { keys: ['Ctrl', 'Z'], description: 'Undo' },
            { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
            { keys: ['Ctrl', 'C'], description: 'Copy' },
            { keys: ['Ctrl', 'V'], description: 'Paste' },
            { keys: ['Ctrl', 'X'], description: 'Cut' },
            { keys: ['Ctrl', 'A'], description: 'Select all' },
            { keys: ['Ctrl', 'F'], description: 'Find' },
            { keys: ['Delete'], description: 'Delete selected' },
            { keys: ['Esc'], description: 'Close dialog/deselect' },
        ],
        'Video Editor': [
            { keys: ['Space'], description: 'Play/pause' },
            { keys: ['K'], description: 'Play/pause (alternative)' },
            { keys: ['J'], description: 'Rewind' },
            { keys: ['L'], description: 'Fast forward' },
            { keys: ['I'], description: 'Mark in point' },
            { keys: ['O'], description: 'Mark out point' },
            { keys: ['Ctrl', 'K'], description: 'Split/cut clip' },
            { keys: ['Ctrl', 'D'], description: 'Duplicate clip' },
            { keys: ['←', '→'], description: 'Move frame by frame' },
            { keys: ['Shift', '←', '→'], description: 'Move 10 frames' },
            { keys: ['Home'], description: 'Go to start' },
            { keys: ['End'], description: 'Go to end' },
            { keys: ['Ctrl', 'M'], description: 'Add marker' },
            { keys: ['Ctrl', 'E'], description: 'Export video' },
        ],
        'Photo Editor': [
            { keys: ['B'], description: 'Brush tool' },
            { keys: ['E'], description: 'Eraser tool' },
            { keys: ['T'], description: 'Text tool' },
            { keys: ['R'], description: 'Rectangle tool' },
            { keys: ['V'], description: 'Move tool' },
            { keys: ['C'], description: 'Crop tool' },
            { keys: ['H'], description: 'Hand tool (pan)' },
            { keys: ['Z'], description: 'Zoom tool' },
            { keys: ['['], description: 'Decrease brush size' },
            { keys: [']'], description: 'Increase brush size' },
            { keys: ['Ctrl', '+'], description: 'Zoom in' },
            { keys: ['Ctrl', '-'], description: 'Zoom out' },
            { keys: ['Ctrl', '0'], description: 'Fit to screen' },
            { keys: ['Ctrl', 'L'], description: 'Levels adjustment' },
        ],
        'Audio Editor': [
            { keys: ['Space'], description: 'Play/pause' },
            { keys: ['S'], description: 'Solo track' },
            { keys: ['M'], description: 'Mute track' },
            { keys: ['R'], description: 'Record' },
            { keys: ['Ctrl', 'T'], description: 'Split audio' },
            { keys: ['Ctrl', 'J'], description: 'Join clips' },
            { keys: ['Ctrl', 'G'], description: 'Group clips' },
            { keys: ['Ctrl', 'Shift', 'N'], description: 'Normalize audio' },
            { keys: ['Ctrl', 'Shift', 'F'], description: 'Fade in/out' },
            { keys: ['Alt', '↑'], description: 'Increase volume' },
            { keys: ['Alt', '↓'], description: 'Decrease volume' },
        ],
        'Design Tool': [
            { keys: ['T'], description: 'Text tool' },
            { keys: ['R'], description: 'Rectangle' },
            { keys: ['O'], description: 'Ellipse' },
            { keys: ['L'], description: 'Line' },
            { keys: ['P'], description: 'Pen tool' },
            { keys: ['V'], description: 'Selection tool' },
            { keys: ['Ctrl', 'G'], description: 'Group elements' },
            { keys: ['Ctrl', 'Shift', 'G'], description: 'Ungroup elements' },
            { keys: ['Ctrl', '['], description: 'Send backward' },
            { keys: ['Ctrl', ']'], description: 'Bring forward' },
            { keys: ['Ctrl', 'Shift', '['], description: 'Send to back' },
            { keys: ['Ctrl', 'Shift', ']'], description: 'Bring to front' },
            { keys: ['Ctrl', 'R'], description: 'Show rulers' },
        ],
        'VR Editor': [
            { keys: ['W', 'A', 'S', 'D'], description: 'Move camera' },
            { keys: ['Q', 'E'], description: 'Up/down' },
            { keys: ['Mouse'], description: 'Look around' },
            { keys: ['Shift'], description: 'Move faster' },
            { keys: ['Ctrl'], description: 'Move slower' },
            { keys: ['F'], description: 'Focus on object' },
            { keys: ['G'], description: 'Toggle grid' },
            { keys: ['Alt', 'Mouse'], description: 'Orbit camera' },
        ],
        'Collaboration': [
            { keys: ['Ctrl', 'Shift', 'C'], description: 'Open chat' },
            { keys: ['Ctrl', 'Shift', 'I'], description: 'Invite collaborator' },
            { keys: ['Ctrl', 'Shift', 'U'], description: 'Toggle user list' },
            { keys: ['@'], description: 'Mention user in chat' },
        ],
        'AI Assistant': [
            { keys: ['Ctrl', 'Shift', 'A'], description: 'Open AI assistant' },
            { keys: ['Ctrl', '/'], description: 'AI command palette' },
            { keys: ['Tab'], description: 'Accept AI suggestion' },
        ],
    };

    if (!isVisible) {
        return (
            <div className="shortcuts-hint">
                Press <kbd>?</kbd> for keyboard shortcuts
            </div>
        );
    }

    return (
        <div className="shortcuts-overlay" onClick={() => setIsVisible(false)}>
            <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
                <div className="shortcuts-header">
                    <h2>⌨️ Keyboard Shortcuts</h2>
                    <button className="close-shortcuts" onClick={() => setIsVisible(false)}>
                        ✕
                    </button>
                </div>

                <div className="shortcuts-subtitle">
                    Master ForTheWeebs like a pro! Press <kbd>Esc</kbd> or click outside to close.
                </div>

                <div className="shortcuts-grid">
                    {Object.entries(shortcuts).map(([category, items]) => (
                        <div key={category} className="shortcuts-category">
                            <h3 className="category-title">{category}</h3>
                            <div className="shortcuts-list">
                                {items.map((shortcut, index) => (
                                    <div key={index} className="shortcut-item">
                                        <div className="shortcut-keys">
                                            {shortcut.keys.map((key, i) => (
                                                <React.Fragment key={i}>
                                                    <kbd>{key}</kbd>
                                                    {i < shortcut.keys.length - 1 && <span className="key-separator">+</span>}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        <div className="shortcut-description">{shortcut.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="shortcuts-footer">
                    <div className="pro-tip">
                        💡 <strong>Pro Tip:</strong> Most shortcuts work across all tools for consistency!
                    </div>
                    <div className="shortcuts-legend">
                        <span><kbd>Ctrl</kbd> = Control key</span>
                        <span><kbd>Shift</kbd> = Shift key</span>
                        <span><kbd>Alt</kbd> = Alt/Option key</span>
                        <span><kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> = Arrow keys</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KeyboardShortcuts;
