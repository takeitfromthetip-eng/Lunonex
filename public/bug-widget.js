/**
 * Autonomous Bug Reporter - Drop this in ANY page
 * Automatically catches and reports all errors to your bug-fixer API
 * ZERO manual intervention needed
 */

(function() {
    'use strict';

    const BUG_API = 'http://localhost:3000/api/bug-fixer/report';
    let reportedErrors = new Set();

    // Catch all global errors
    window.addEventListener('error', function(event) {
        reportError({
            errorMessage: event.message,
            errorStack: event.error?.stack || 'No stack trace',
            errorType: 'frontend',
            severity: 'high',
            pageUrl: window.location.href,
            component: event.filename || 'unknown',
            lineNumber: event.lineno,
            columnNumber: event.colno
        });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        reportError({
            errorMessage: `Unhandled Promise: ${event.reason}`,
            errorStack: event.reason?.stack || 'No stack trace',
            errorType: 'frontend',
            severity: 'high',
            pageUrl: window.location.href,
            component: 'promise'
        });
    });

    // Catch console.error() calls
    const originalError = console.error;
    console.error = function(...args) {
        const errorMessage = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        reportError({
            errorMessage: `Console Error: ${errorMessage}`,
            errorType: 'frontend',
            severity: 'medium',
            pageUrl: window.location.href,
            component: 'console'
        });
        originalError.apply(console, args);
    };

    // Report error to API
    async function reportError(errorData) {
        // Deduplicate errors
        const errorKey = `${errorData.errorMessage}-${errorData.pageUrl}`;
        if (reportedErrors.has(errorKey)) {
            return; // Already reported
        }
        reportedErrors.add(errorKey);

        // Add user info
        errorData.userId = localStorage.getItem('userId') || 'anonymous';
        errorData.userEmail = localStorage.getItem('userEmail') || null;
        errorData.userAgent = navigator.userAgent;
        errorData.browserInfo = {
            width: window.innerWidth,
            height: window.innerHeight,
            language: navigator.language,
            platform: navigator.platform,
            vendor: navigator.vendor
        };
        errorData.additionalData = {
            url: window.location.href,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            localStorage: Object.keys(localStorage)
        };

        try {
            const response = await fetch(BUG_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(errorData)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Bug reported:', data.reportId);
            }
        } catch (err) {
            console.warn('Failed to report bug:', err);
        }
    }

    // Manual bug reporting function
    window.reportBug = function(message, severity = 'low') {
        reportError({
            errorMessage: message,
            errorType: 'manual',
            severity: severity,
            pageUrl: window.location.href,
            component: 'user-reported'
        });
    };

    console.log('🤖 Bug Reporter Active - All errors will be auto-reported');
})();
