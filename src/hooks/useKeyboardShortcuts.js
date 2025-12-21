import { useEffect, useCallback } from 'react';
import { showToast } from '../components/Toast';

export function useKeyboardShortcuts(shortcuts) {
  const handleKeyPress = useCallback((event) => {
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;
    const alt = event.altKey;

    for (const shortcut of shortcuts) {
      const match =
        shortcut.key.toLowerCase() === key &&
        !!shortcut.ctrl === ctrl &&
        !!shortcut.shift === shift &&
        !!shortcut.alt === alt;

      if (match) {
        event.preventDefault();
        shortcut.action();
        if (shortcut.showToast) {
          showToast(shortcut.description, 'info');
        }
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
}

// Common keyboard shortcuts
export const SHORTCUTS = {
  SAVE: { key: 's', ctrl: true, description: 'Save project' },
  UNDO: { key: 'z', ctrl: true, description: 'Undo' },
  REDO: { key: 'y', ctrl: true, description: 'Redo' },
  EXPORT: { key: 'e', ctrl: true, shift: true, description: 'Export project' },
  NEW: { key: 'n', ctrl: true, description: 'New project' },
  HELP: { key: '?', shift: true, description: 'Show help' },
  SEARCH: { key: 'k', ctrl: true, description: 'Quick search' },
};
