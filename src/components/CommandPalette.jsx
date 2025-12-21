/* eslint-disable */
import React, { useState, useEffect } from 'react';
import './CommandPalette.css';

/**
 * Command Palette (Ctrl+K) - Quick access to all features
 * Inspired by VS Code, Raycast, and modern developer tools
 */

const COMMANDS = [
    // Creation Commands
    { id: 'new_audio', label: 'New Audio Project', icon: '🎵', category: 'Create', action: 'create_audio' },
    { id: 'new_comic', label: 'New Comic Project', icon: '📚', category: 'Create', action: 'create_comic' },
    { id: 'new_graphic', label: 'New Graphic Project', icon: '🎨', category: 'Create', action: 'create_graphic' },
    { id: 'new_photo', label: 'New Photo Project', icon: '📷', category: 'Create', action: 'create_photo' },
    { id: 'new_vr', label: 'New VR/AR Project', icon: '🥽', category: 'Create', action: 'create_vr' },

    // Navigation
    { id: 'go_dashboard', label: 'Go to Dashboard', icon: '🏠', category: 'Navigate', action: 'navigate_dashboard' },
    { id: 'go_projects', label: 'Go to Projects', icon: '📁', category: 'Navigate', action: 'navigate_projects' },
    { id: 'go_settings', label: 'Go to Settings', icon: '⚙️', category: 'Navigate', action: 'navigate_settings' },

    // Actions
    { id: 'export', label: 'Export Current Project', icon: '📤', category: 'Action', action: 'export_project', shortcut: 'Ctrl+E' },
    { id: 'save', label: 'Save Project', icon: '💾', category: 'Action', action: 'save_project', shortcut: 'Ctrl+S' },
    { id: 'share', label: 'Share Project', icon: '🔗', category: 'Action', action: 'share_project' },
    { id: 'duplicate', label: 'Duplicate Project', icon: '📋', category: 'Action', action: 'duplicate_project' },

    // View
    { id: 'toggle_theme', label: 'Toggle Dark/Light Theme', icon: '🌓', category: 'View', action: 'toggle_theme' },
    { id: 'toggle_sidebar', label: 'Toggle Sidebar', icon: '📐', category: 'View', action: 'toggle_sidebar' },
    { id: 'fullscreen', label: 'Toggle Fullscreen', icon: '⛶', category: 'View', action: 'toggle_fullscreen' },

    // Help
    { id: 'shortcuts', label: 'View Keyboard Shortcuts', icon: '⌨️', category: 'Help', action: 'show_shortcuts', shortcut: 'Shift+?' },
    { id: 'tutorial', label: 'Start Tutorial', icon: '🎓', category: 'Help', action: 'start_tutorial' },
    { id: 'feedback', label: 'Send Feedback', icon: '💬', category: 'Help', action: 'send_feedback' },
];

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Open with Ctrl+K or Cmd+K
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
                setSearch('');
                setSelectedIndex(0);
            }

            // Close with Escape
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }

            // Navigate with arrow keys
            if (isOpen) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIndex(prev => Math.max(prev - 1, 0));
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    executeCommand(filteredCommands[selectedIndex]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, search]);

    const filteredCommands = COMMANDS.filter(cmd =>
        cmd.label.toLowerCase().includes(search.toLowerCase()) ||
        cmd.category.toLowerCase().includes(search.toLowerCase())
    );

    const executeCommand = (command) => {
        if (!command) return;

        console.log('Executing command:', command.action);

        // Execute command action
        switch (command.action) {
            case 'toggle_theme':
                document.querySelector('[data-theme-toggle]')?.click();
                break;
            case 'toggle_fullscreen':
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
                break;
            case 'show_shortcuts':
                // Trigger keyboard shortcuts help
                if (window.showKeyboardShortcuts) {
                    window.showKeyboardShortcuts();
                }
                break;
            case 'start_tutorial':
                // Restart onboarding
                localStorage.removeItem('onboarding-complete');
                window.location.reload();
                break;
            default:
                alert(`Command "${command.label}" coming soon!`);
        }

        setIsOpen(false);
        setSearch('');
    };

    if (!isOpen) return null;

    // Group commands by category
    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) acc[cmd.category] = [];
        acc[cmd.category].push(cmd);
        return acc;
    }, {});

    return (
        <>
            <div className="command-palette-overlay" onClick={() => setIsOpen(false)} />
            <div className="command-palette">
                <div className="command-search">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Type a command or search..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setSelectedIndex(0);
                        }}
                        autoFocus
                    />
                    <kbd className="search-hint">ESC</kbd>
                </div>

                <div className="command-results">
                    {Object.keys(groupedCommands).length === 0 ? (
                        <div className="no-results">
                            <div className="no-results-icon">🔍</div>
                            <div>No commands found</div>
                        </div>
                    ) : (
                        Object.entries(groupedCommands).map(([category, commands]) => (
                            <div key={category} className="command-group">
                                <div className="command-category">{category}</div>
                                {commands.map((cmd, idx) => {
                                    const globalIndex = filteredCommands.indexOf(cmd);
                                    return (
                                        <div
                                            key={cmd.id}
                                            className={`command-item ${globalIndex === selectedIndex ? 'selected' : ''}`}
                                            onClick={() => executeCommand(cmd)}
                                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                                        >
                                            <span className="command-icon">{cmd.icon}</span>
                                            <span className="command-label">{cmd.label}</span>
                                            {cmd.shortcut && (
                                                <kbd className="command-shortcut">{cmd.shortcut}</kbd>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                <div className="command-footer">
                    <span className="command-tip">
                        💡 Tip: Use <kbd>↑</kbd> <kbd>↓</kbd> to navigate, <kbd>Enter</kbd> to select
                    </span>
                </div>
            </div>
        </>
    );
};

export default CommandPalette;
