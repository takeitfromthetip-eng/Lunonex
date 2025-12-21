import { useState, useEffect } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 * Respects prefers-reduced-motion media query
 * Returns boolean - true if reduced motion preferred
 */
export function useReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e) => {
            setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return prefersReducedMotion;
}

/**
 * Get animation duration based on reduced motion preference
 * @param {number} normalDuration - Duration in ms when animations are enabled
 * @returns {number} Duration (0 if reduced motion, normal otherwise)
 */
export function getAnimationDuration(normalDuration = 300) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mediaQuery.matches ? 0 : normalDuration;
}
