import { useState, useCallback } from 'react';

/**
 * Mico AI + CGI Integration Hook
 * Allows Mico to control CGI effects via natural language
 */
export function useMicoCGI(videoProcessorRef) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);

  // Parse Mico command and execute CGI action
  const executeMicoCommand = useCallback(async (command) => {
    setIsProcessing(true);
    setLastCommand(command);

    try {
      const response = await fetch('/api/mico/cgi-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });

      const result = await response.json();

      if (result.action && videoProcessorRef?.current) {
        await executeAction(result.action, videoProcessorRef);
      }

      setIsProcessing(false);
      return result;

    } catch (error) {
      console.error('Mico CGI command failed:', error);
      setIsProcessing(false);
      return { error: error.message };
    }
  }, [videoProcessorRef]);

  // Execute CGI action
  const executeAction = async (action, processorRef) => {
    const { type, effectId, params } = action;

    switch (type) {
      case 'add_effect':
        processorRef.current.addEffectById(effectId, params);
        break;

      case 'remove_effect':
        processorRef.current.removeEffectById(effectId);
        break;

      case 'toggle_effect':
        processorRef.current.toggleEffectById(effectId);
        break;

      case 'adjust_intensity':
        processorRef.current.adjustEffectIntensity(effectId, params.intensity);
        break;

      case 'clear_all':
        processorRef.current.clearAllEffects();
        break;

      case 'apply_preset':
        processorRef.current.applyPreset(params.presetName);
        break;

      default:
        console.warn('Unknown action type:', type);
    }
  };

  return {
    executeMicoCommand,
    isProcessing,
    lastCommand
  };
}

/**
 * Voice Command Parser
 * Converts natural language to CGI actions
 */
export const parseCGICommand = (command) => {
  const lower = command.toLowerCase();

  // Add effects
  if (lower.includes('add') || lower.includes('enable') || lower.includes('turn on')) {
    if (lower.includes('grayscale') || lower.includes('black and white')) {
      return { action: { type: 'add_effect', effectId: 'grayscale' } };
    }
    if (lower.includes('neon') || lower.includes('glow')) {
      return { action: { type: 'add_effect', effectId: 'neonglow' } };
    }
    if (lower.includes('blur') && lower.includes('background')) {
      return { action: { type: 'add_effect', effectId: 'blur' } };
    }
    if (lower.includes('glasses')) {
      return { action: { type: 'add_effect', effectId: 'arglasses' } };
    }
    if (lower.includes('mustache')) {
      return { action: { type: 'add_effect', effectId: 'armustache' } };
    }
    if (lower.includes('anime eyes')) {
      return { action: { type: 'add_effect', effectId: 'animeeyes' } };
    }
    if (lower.includes('beautify') || lower.includes('smooth')) {
      return { action: { type: 'add_effect', effectId: 'facebeautify' } };
    }
    if (lower.includes('cube')) {
      return { action: { type: 'add_effect', effectId: 'floatingcube' } };
    }
    if (lower.includes('hearts')) {
      return { action: { type: 'add_effect', effectId: 'floatinghearts' } };
    }
    if (lower.includes('stars')) {
      return { action: { type: 'add_effect', effectId: 'spinningstars' } };
    }
  }

  // Remove effects
  if (lower.includes('remove') || lower.includes('disable') || lower.includes('turn off')) {
    if (lower.includes('all')) {
      return { action: { type: 'clear_all' } };
    }
    // Parse specific effect to remove
    const effectMatch = extractEffectId(lower);
    if (effectMatch) {
      return { action: { type: 'remove_effect', effectId: effectMatch } };
    }
  }

  // Adjust intensity
  if (lower.includes('increase') || lower.includes('decrease') || lower.includes('set')) {
    const intensityMatch = lower.match(/(\d+)%?/);
    if (intensityMatch) {
      const intensity = parseInt(intensityMatch[1]) / 100;
      return {
        action: {
          type: 'adjust_intensity',
          effectId: extractEffectId(lower),
          params: { intensity }
        }
      };
    }
  }

  // Presets
  if (lower.includes('preset') || lower.includes('style')) {
    if (lower.includes('professional') || lower.includes('pro')) {
      return { action: { type: 'apply_preset', params: { presetName: 'professional' } } };
    }
    if (lower.includes('fun') || lower.includes('party')) {
      return { action: { type: 'apply_preset', params: { presetName: 'fun' } } };
    }
    if (lower.includes('anime') || lower.includes('kawaii')) {
      return { action: { type: 'apply_preset', params: { presetName: 'anime' } } };
    }
  }

  return { error: 'Could not understand command. Try: "add neon glow", "enable blur", "remove all effects"' };
};

const extractEffectId = (text) => {
  const effects = {
    'grayscale': 'grayscale',
    'neon': 'neonglow',
    'blur': 'blur',
    'glasses': 'arglasses',
    'mustache': 'armustache',
    'anime': 'animeeyes',
    'beautify': 'facebeautify',
    'cube': 'floatingcube',
    'hearts': 'floatinghearts',
    'stars': 'spinningstars'
  };

  for (const [keyword, effectId] of Object.entries(effects)) {
    if (text.includes(keyword)) return effectId;
  }

  return null;
};
