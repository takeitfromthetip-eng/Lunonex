import { useEffect, useRef } from 'react';
import { showToast } from './Toast';

export function useAutoSave(projectData, saveFunction, interval = 30000) {
  const savedData = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Don't auto-save if data hasn't changed
    if (JSON.stringify(projectData) === JSON.stringify(savedData.current)) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      try {
        await saveFunction(projectData);
        savedData.current = projectData;
        showToast('Project auto-saved', 'success');
      } catch (error) {
        console.error('Auto-save failed:', error);
        showToast('Auto-save failed. Your changes may not be saved.', 'warning');
      }
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [projectData, saveFunction, interval]);

  return {
    saveNow: async () => {
      try {
        await saveFunction(projectData);
        savedData.current = projectData;
        showToast('Project saved successfully', 'success');
      } catch (error) {
        console.error('Save failed:', error);
        showToast('Failed to save project', 'error');
      }
    }
  };
}
