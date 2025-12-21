import React, { useState, useEffect } from 'react';
import './OnboardingTour.css';

const tourSteps = [
  {
    id: 'welcome',
    title: '👋 Welcome to ForTheWeebs!',
    description: 'Let\'s take a quick tour of your new creator dashboard.',
    target: null,
    position: 'center'
  },
  {
    id: 'tools',
    title: '🎨 Creator Tools',
    description: 'Access all your creative tools here: Audio Studio, Comic Creator, Graphic Design, and more!',
    target: '.creator-tools',
    position: 'bottom'
  },
  {
    id: 'projects',
    title: '📁 Your Projects',
    description: 'View and manage all your projects in one place. Projects auto-save every 30 seconds!',
    target: '.projects-section',
    position: 'top'
  },
  {
    id: 'shortcuts',
    title: '⌨️ Keyboard Shortcuts',
    description: 'Use Ctrl+S to save, Ctrl+E to export, and Ctrl+K for quick search.',
    target: null,
    position: 'center'
  },
  {
    id: 'theme',
    title: '🌓 Theme Toggle',
    description: 'Switch between light and dark mode with the button in the top right.',
    target: '.theme-toggle',
    position: 'left'
  },
  {
    id: 'complete',
    title: '🎉 You\'re All Set!',
    description: 'Start creating amazing content for the anime community!',
    target: null,
    position: 'center'
  }
];

export function OnboardingTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(() => {
    return !localStorage.getItem('onboardingCompleted');
  });

  useEffect(() => {
    if (isActive && currentStep < tourSteps.length) {
      const target = tourSteps[currentStep].target;
      if (target) {
        const element = document.querySelector(target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('tour-highlight');
          return () => element.classList.remove('tour-highlight');
        }
      }
    }
  }, [currentStep, isActive]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setIsActive(false);
    if (onComplete) onComplete();
  };

  if (!isActive) return null;

  const step = tourSteps[currentStep];

  return (
    <>
      <div className="tour-overlay" onClick={handleSkip}></div>
      <div className={`tour-tooltip tour-position-${step.position}`}>
        <div className="tour-header">
          <h3>{step.title}</h3>
          <button onClick={handleSkip} className="tour-close">×</button>
        </div>
        <p className="tour-description">{step.description}</p>
        <div className="tour-footer">
          <span className="tour-progress">
            {currentStep + 1} of {tourSteps.length}
          </span>
          <div className="tour-actions">
            <button onClick={handleSkip} className="tour-skip">Skip</button>
            <button onClick={handleNext} className="tour-next">
              {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'} →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
