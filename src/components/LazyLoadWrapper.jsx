/* eslint-disable */
/**
 * Lazy Load Wrapper Component
 * Provides loading states and error boundaries for lazy-loaded components
 */

import React, { Suspense } from 'react';

// Loading spinner component
function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      padding: '20px'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid rgba(102, 126, 234, 0.3)',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{
        marginTop: '16px',
        color: '#667eea',
        fontSize: '14px',
        fontWeight: 500
      }}>
        {message}
      </p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Error fallback component
function ErrorFallback({ error, retry }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      padding: '20px',
      background: 'rgba(239, 68, 68, 0.1)',
      borderRadius: '8px',
      margin: '20px'
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '16px'
      }}>
        ⚠️
      </div>
      <h3 style={{
        color: '#dc2626',
        marginBottom: '8px'
      }}>
        Failed to load component
      </h3>
      <p style={{
        color: '#666',
        fontSize: '14px',
        marginBottom: '16px',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        {error?.message || 'An error occurred while loading this component'}
      </p>
      {retry && (
        <button
          onClick={retry}
          style={{
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// Main lazy load wrapper
export function LazyLoadWrapper({
  children,
  fallback = <LoadingSpinner />,
  onError
}) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}

// HOC for lazy loading components
export function withLazyLoad(importFunc, options = {}) {
  const LazyComponent = React.lazy(importFunc);
  const {
    fallback = <LoadingSpinner />,
    onError
  } = options;

  return React.memo((props) => (
    <LazyLoadWrapper fallback={fallback} onError={onError}>
      <LazyComponent {...props} />
    </LazyLoadWrapper>
  ));
}

// Preload a lazy component
export function preloadComponent(importFunc) {
  const Component = React.lazy(importFunc);
  // Trigger the import immediately
  importFunc();
  return Component;
}

// Conditional lazy loading based on viewport
export function LazyLoadOnVisible({
  children,
  rootMargin = '50px',
  threshold = 0.01
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef();

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={ref}>
      {isVisible ? children : <LoadingSpinner message="Loading section..." />}
    </div>
  );
}

export { LoadingSpinner, ErrorFallback };
