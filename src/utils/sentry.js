// Sentry Error Tracking Configuration
// To use: Get your DSN from sentry.io and add to environment variables

export function initSentry() {
    // Only initialize in production
    if (process.env.NODE_ENV !== 'production') {
        console.log('[Sentry] Skipping initialization in development');
        return;
    }

    const SENTRY_DSN = process.env.SENTRY_DSN || import.meta.env.VITE_SENTRY_DSN;

    if (!SENTRY_DSN) {
        console.warn('[Sentry] No DSN provided. Error tracking disabled.');
        return;
    }

    // Dynamically import Sentry to avoid bundle bloat in development
    import('@sentry/react').then((Sentry) => {
        Sentry.init({
            dsn: SENTRY_DSN,
            environment: process.env.NODE_ENV,
            integrations: [
                new Sentry.BrowserTracing(),
                new Sentry.Replay({
                    maskAllText: false,
                    blockAllMedia: false,
                }),
            ],

            // Performance Monitoring
            tracesSampleRate: 0.1, // Capture 10% of transactions

            // Session Replay
            replaysSessionSampleRate: 0.1, // 10% of sessions
            replaysOnErrorSampleRate: 1.0, // 100% when errors occur

            // Filter out noisy errors
            beforeSend(event, hint) {
                const error = hint.originalException;

                // Ignore certain errors
                if (error && error.message) {
                    const ignoredMessages = [
                        'ResizeObserver loop',
                        'Non-Error promise rejection',
                        'Loading chunk',
                    ];

                    for (const msg of ignoredMessages) {
                        if (error.message.includes(msg)) {
                            return null; // Don't send to Sentry
                        }
                    }
                }

                return event;
            },
        });

        console.log('[Sentry] Initialized successfully');
    }).catch((err) => {
        console.error('[Sentry] Failed to initialize:', err);
    });
}

// Manual error reporting
export function reportError(error, context = {}) {
    if (process.env.NODE_ENV === 'production' && window.Sentry) {
        window.Sentry.captureException(error, {
            contexts: { custom: context }
        });
    } else {
        console.error('[Error]', error, context);
    }
}

// Set user context
export function setUser(user) {
    if (window.Sentry) {
        window.Sentry.setUser({
            id: user.id,
            email: user.email,
            username: user.username,
        });
    }
}

// Clear user context (on logout)
export function clearUser() {
    if (window.Sentry) {
        window.Sentry.setUser(null);
    }
}
