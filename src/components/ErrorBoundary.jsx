/* eslint-disable */
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Log error to server for monitoring in production (only if API is available)
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      try {
        fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: error?.toString(),
            stack: error?.stack,
            componentStack: errorInfo?.componentStack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          })
        }).catch(err => {
          // Silently fail if error logging endpoint doesn't exist
          console.debug('Error logging endpoint not available');
        });
      } catch (err) {
        // Silently fail
        console.debug('Error logging failed');
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#ff6b6b', color: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️ Oops!</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>Something went wrong. Don't worry, you can report this!</p>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', marginBottom: '20px', maxWidth: '600px', textAlign: 'left' }}>
            <strong>Error Details:</strong>
            <pre style={{ fontSize: '0.9rem', marginTop: '10px', overflow: 'auto', maxHeight: '200px' }}>
              {this.state.error?.toString()}
              {'\n\n'}
              {this.state.error?.stack}
            </pre>
          </div>
          <button onClick={() => window.location.reload()} style={{ padding: '14px 32px', background: 'white', color: '#ff6b6b', border: 'none', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: '600' }}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
