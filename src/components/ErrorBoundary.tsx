// src/components/ErrorBoundary.tsx - React error boundary with crash reporting
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    
    // Report crash to backend
    this.reportCrash(error, errorInfo);
  }

  async reportCrash(error: Error, errorInfo: ErrorInfo) {
    try {
      const apiUrl = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:3002';
      
      await fetch(`${apiUrl}/userfix/feedback/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: 'crash',
          message: `Frontend crash: ${error.message}`,
          page_url: window.location.href,
          severity: 'high',
          metadata: {
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            userAgent: navigator.userAgent,
          },
        }),
      });
    } catch (err) {
      console.error('[ErrorBoundary] Failed to report crash:', err);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          <h1>😔 Something went wrong</h1>
          <p>We've been notified and are working on it.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
          {this.state.error && (
            <details style={{ marginTop: '1rem', textAlign: 'left' }}>
              <summary>Error details</summary>
              <pre style={{
                backgroundColor: '#f5f5f5',
                padding: '1rem',
                borderRadius: '4px',
                overflow: 'auto',
              }}>
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
