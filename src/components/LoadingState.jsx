import React from 'react';
import './LoadingState.css';

/**
 * Reusable Loading Component
 * Provides consistent loading UI across the platform
 */
export const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeClass = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  }[size];

  return (
    <div className="loading-spinner-container">
      <div className={`loading-spinner ${sizeClass}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

/**
 * Skeleton Loader for content placeholders
 */
export const SkeletonLoader = ({ type = 'post', count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (type === 'post') {
    return (
      <div className="skeleton-container">
        {skeletons.map((i) => (
          <div key={i} className="skeleton-post">
            <div className="skeleton-header">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-info">
                <div className="skeleton-line skeleton-line-short"></div>
                <div className="skeleton-line skeleton-line-tiny"></div>
              </div>
            </div>
            <div className="skeleton-content">
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line skeleton-line-medium"></div>
            </div>
            <div className="skeleton-actions">
              <div className="skeleton-button"></div>
              <div className="skeleton-button"></div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="skeleton-profile">
        <div className="skeleton-cover"></div>
        <div className="skeleton-avatar-large"></div>
        <div className="skeleton-line skeleton-line-short"></div>
        <div className="skeleton-line skeleton-line-medium"></div>
      </div>
    );
  }

  if (type === 'grid') {
    return (
      <div className="skeleton-grid">
        {skeletons.map((i) => (
          <div key={i} className="skeleton-card"></div>
        ))}
      </div>
    );
  }

  // Default: simple lines
  return (
    <div className="skeleton-lines">
      {skeletons.map((i) => (
        <div key={i} className="skeleton-line"></div>
      ))}
    </div>
  );
};

/**
 * Progress Bar Component
 */
export const ProgressBar = ({ progress = 0, message = '', color = '#667eea' }) => {
  return (
    <div className="progress-container">
      {message && <p className="progress-message">{message}</p>}
      <div className="progress-bar-bg">
        <div 
          className="progress-bar-fill" 
          style={{ 
            width: `${Math.min(100, Math.max(0, progress))}%`,
            background: color
          }}
        >
          <span className="progress-percentage">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Full Page Loader
 */
export const PageLoader = ({ message = 'Loading ForTheWeebs...' }) => {
  return (
    <div className="page-loader">
      <div className="page-loader-content">
        <div className="logo-animation">🎌</div>
        <LoadingSpinner size="large" message={message} />
      </div>
    </div>
  );
};

/**
 * Empty State Component
 */
export const EmptyState = ({ 
  icon = '📭', 
  title = 'Nothing Here Yet', 
  message = 'Create your first post to get started!',
  action = null
}) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-message">{message}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
};

export default LoadingSpinner;
