import React from 'react';
import './FallbackUI.css';

export function ErrorFallback({ error, resetError }) {
  return (
    <div className="error-fallback">
      <div className="error-fallback-content">
        <div className="error-icon">⚠️</div>
        <h2>Oops! Something went wrong</h2>
        <p className="error-message">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <div className="error-actions">
          <button onClick={resetError} className="btn-primary">
            Try Again
          </button>
          <button onClick={() => window.location.href = '/'} className="btn-secondary">
            Go Home
          </button>
        </div>
        <details className="error-details">
          <summary>Technical Details</summary>
          <pre>{error?.stack}</pre>
        </details>
      </div>
    </div>
  );
}

export function LoadingFallback({ message = 'Loading...' }) {
  return (
    <div className="loading-fallback">
      <div className="loading-spinner-large"></div>
      <p>{message}</p>
    </div>
  );
}

export function NotFoundFallback() {
  return (
    <div className="error-fallback">
      <div className="error-fallback-content">
        <div className="error-icon">🔍</div>
        <h2>404 - Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <button onClick={() => window.location.href = '/'} className="btn-primary">
          Go Home
        </button>
      </div>
    </div>
  );
}

export function OfflineFallback() {
  return (
    <div className="error-fallback">
      <div className="error-fallback-content">
        <div className="error-icon">📡</div>
        <h2>You're Offline</h2>
        <p>Please check your internet connection and try again.</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Retry
        </button>
      </div>
    </div>
  );
}
