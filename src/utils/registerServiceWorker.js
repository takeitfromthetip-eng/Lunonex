/**
 * Register service worker for PWA offline support
 * Only registers in production builds
 */

export function registerServiceWorker() {
    // Only register in production
    if (process.env.NODE_ENV !== 'production') {
        console.log('Service worker not registered in development');
        return;
    }

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
        console.log('Service workers not supported');
        return;
    }

    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration.scope);

                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60000); // Check every minute

                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            if (confirm('New version available! Reload to update?')) {
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                                window.location.reload();
                            }
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });

        // Handle controller change (when new SW takes over)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    });
}

/**
 * Unregister service worker (for development/testing)
 */
export function unregisterServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister();
                console.log('Service Worker unregistered');
            })
            .catch((error) => {
                console.error('Error unregistering Service Worker:', error);
            });
    }
}

/**
 * Check if app is running in standalone mode (installed PWA)
 */
export function isStandalone() {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://')
    );
}

/**
 * Check if online/offline
 */
export function checkOnlineStatus() {
    return navigator.onLine;
}

// Export online status checker as hook-ready
export function setupOnlineListener(callback) {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));

    return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
    };
}
