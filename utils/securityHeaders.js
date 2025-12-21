// Security Headers Middleware
// Adds important security headers to all responses

function securityHeaders(req, res, next) {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.openai.com; " +
        "media-src 'self' blob: https://*.supabase.co; " +
        "frame-src https://js.stripe.com; " +
        "object-src 'none';"
    );
    
    // Permissions Policy (formerly Feature Policy)
    res.setHeader('Permissions-Policy', 
        'geolocation=(), microphone=(), camera=(self)'
    );
    
    // Strict Transport Security (HTTPS only)
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 
            'max-age=31536000; includeSubDomains; preload'
        );
    }
    
    next();
}

module.exports = securityHeaders;
