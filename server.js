/* eslint-disable */
console.log('🚀 Starting ForTheWeebs API Server...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);

const express = require('express');
const http = require('http');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

console.log('✅ Express and dotenv loaded');

// ============================================================================
// SOVEREIGN SELF-HEALING SYSTEM - Boot Phase
// ============================================================================
const { validateConfig } = require('./utils/configValidation');
const { installCrashHandlers, ensureArtifactDir } = require('./utils/server-safety');
const { startMemoryMonitor } = require('./utils/memory');
const { metricsMiddleware } = require('./utils/observability');

// Validate configuration at boot
try {
  validateConfig();
} catch (error) {
  console.error('❌ CRITICAL: Configuration validation failed:', error.message);
  process.exit(1);
}

// Install crash handlers (replaces old error listeners)
installCrashHandlers();

// Ensure artifact directory exists
ensureArtifactDir();

// Start memory monitoring
startMemoryMonitor();

console.log('✅ Self-healing system initialized');

// ============================================================================
// ENVIRONMENT VARIABLE VALIDATION
// ============================================================================
const REQUIRED_ENV = ['STRIPE_SECRET_KEY', 'OPENAI_API_KEY', 'JWT_SECRET'];
const OPTIONAL_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'PHOTODNA_API_KEY'];

const missing = REQUIRED_ENV.filter(key => !process.env[key]);
const optional_missing = OPTIONAL_ENV.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ CRITICAL: Missing required environment variables:', missing.join(', '));
  console.error('💡 Add these to your .env file before starting the server');
  process.exit(1);
}

if (optional_missing.length > 0) {
  console.warn('⚠️  Optional environment variables missing:', optional_missing.join(', '));
  console.warn('💡 Some features may be disabled without these');
}

console.log('✅ Environment validation passed');

const app = express();
const server = http.createServer(app);
const PORT = parseInt(process.env.PORT || '3001', 10);

// Debug PORT
if (!process.env.PORT) {
  console.warn('⚠️  PORT not set in environment, defaulting to 3001');
}

// Trust Railway/Vercel proxy for rate limiting
app.set('trust proxy', true);

console.log('📡 Port:', PORT);

// Security Headers
const { securityHeaders, wafFilter } = require('./utils/networkProtection');
app.use(securityHeaders);

// WAF protection on public routes (before rate limiting)
app.use('/userfix', wafFilter);
app.use('/api', wafFilter);

// Rate Limiting (general + tier-based)
const { apiLimiter } = require('./utils/apiRateLimiter');
const { rateLimitByTier } = require('./api/rate-limiter.js');
app.use('/api', apiLimiter); // General rate limiting
app.use('/api', rateLimitByTier); // Tier-based rate limiting

// DATA PRIVACY ENFORCEMENT - WE NEVER SELL USER DATA
const { dataPrivacyMiddleware } = require('./utils/dataPrivacyEnforcement');
app.use('/api', dataPrivacyMiddleware);
console.log('🔒 Data privacy enforcement active - user data selling is BLOCKED');

// ============================================================================
// REQUEST ID TRACING MIDDLEWARE
// ============================================================================
app.use((req, res, next) => {
  req.id = crypto.randomUUID().slice(0, 8);
  req.startTime = Date.now();

  // Log all requests with timing
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const status = res.statusCode;
    const emoji = status < 400 ? '✅' : status < 500 ? '⚠️' : '❌';
    console.log(`[${req.id}] ${emoji} ${req.method} ${req.path} - ${status} (${duration}ms)`);
  });

  next();
});

// Middleware
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Trust first proxy (Railway/Vercel) - must be before rate limiting
app.set('trust proxy', 1);

// Metrics collection middleware (must be early)
app.use(metricsMiddleware);

app.use(cors({
    origin: ['https://fortheweebs.vercel.app', 'http://localhost:3003', 'http://localhost:3002'],
    credentials: true
}));

// CRITICAL: Raw body parsing for webhooks BEFORE JSON parsing
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use('/webhooks/coinbase', express.raw({ type: 'application/json' }));
app.use('/api/stripe-webhook', express.raw({ type: 'application/json' }));

// For all other routes (JSON)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Disable x-powered-by header for security
app.disable('x-powered-by');

// Initialize Policy Engine and SSE Artifact Stream
const { initArtifactStream, sseRoute } = require('./api/services/sse');
const policyEngine = require('./api/policy/policyEngine');
const { notaryRecord } = require('./api/services/notary');

initArtifactStream();

// Wire policy changes to artifact stream and notary
policyEngine.on('policy:changed', (evt) => {
  // Push to artifact stream
  global.artifactStream.push({
    timestamp: evt.ts,
    type: 'POLICY',
    severity: 'info',
    message: `Updated ${evt.type}.${evt.key}=${evt.value} v${evt.version}`,
    data: evt,
  });

  // Record in notary ledger
  notaryRecord({
    actor: 'policy_engine',
    command: `update_${evt.type}`,
    key: evt.key,
    value: evt.value,
    oldValue: evt.oldValue,
    version: evt.version,
  });
});

// SSE artifact stream endpoint
app.get('/api/artifacts/stream', sseRoute);

// Feature flags
const { featureFlags } = require('./config/featureFlags');

// Root route - API info
app.get('/', (req, res) => {
    res.json({
        name: 'ForTheWeebs API',
        version: '2.1.0',
        status: 'running',
        documentation: '/health',
        endpoints: {
            health: '/health',
            api: '/api/*'
        },
        message: 'Welcome to ForTheWeebs Creator Platform API'
    });
});

// Health check with feature status
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        features: featureFlags.getStatus()
    });
});

// Feature status endpoint
app.get('/api/features/status', (req, res) => {
    res.json({
        status: featureFlags.getStatus(),
        disabled: featureFlags.getDisabledFeatures(),
        message: featureFlags.socialMediaEnabled
            ? 'All features enabled'
            : 'Social media features will be enabled once PhotoDNA API key is configured'
    });
});

// Explicit metrics endpoint (Prometheus format)
app.get('/metrics', (req, res) => {
  const { metricsCollector } = require('./utils/observability');
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.send(metricsCollector.getMetrics());
});

// Socket.io setup for WebRTC signaling
let io;
try {
    const { Server } = require('socket.io');
    const { router: signalingRouter, setupSignaling } = require('./api/signaling');

    io = new Server(server, {
        cors: {
            origin: ['https://fortheweebs.vercel.app', 'http://localhost:3003', 'http://localhost:3002'],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    setupSignaling(io);
    app.use('/api/calls', signalingRouter);
    console.log('✅ WebRTC signaling server initialized');
} catch (error) {
    // Socket.io or signaling module not available - skip WebRTC features
}

// API Routes - Load individually with error handling
const routes = [
    // ===== SOVEREIGN SELF-HEALING SYSTEM =====
    { path: '/api/health', file: './api/health', name: '🩹 Self-Healing Health (Liveness/Readiness/Artifacts)' },
    { path: '/bugfixer', file: './api/bugfixer/console', name: '🔧 Bug Fixer Console (Diagnostics/Remediation/Auto-Heal)' },
    { path: '/userfix/feedback', file: './api/userfix/feedback', name: '📝 User Feedback & Bug Reports' },
    { path: '/userfix/auto', file: './api/userfix/autonomousSuggestions', name: '🤖 Autonomous Suggestions (Auto-Apply)' },
    { path: '/webhooks', file: './api/routes/webhooks', name: '🔗 Payment Webhooks (Stripe/Coinbase)' },
    
    // Payment & Monetization - HYBRID SYSTEM
    { path: '/api/crypto', file: './api/coinbase', name: '💎 Crypto Payments (BTC, ETH, USDC) - Adult Content' },
    { path: '/api/stripe-connect', file: './api/stripe-connect', name: '💳 Stripe Connect - Non-Adult Creators Only' },
    { path: '/api/payment-router', file: './api/payment-router', name: '🔀 Payment Router (AI-Powered SFW/Adult Detection)' },
    { path: '/api/subscriptions', file: './api/routes/subscriptions', name: 'Subscriptions (Creator Monetization)' },

    // Social Media Core
    { path: '/api/posts', file: './api/routes/posts', name: 'Posts (Feed)' },
    { path: '/api/comments', file: './api/routes/comments', name: 'Comments & Replies' },
    { path: '/api/relationships', file: './api/routes/relationships', name: 'Friends & Follows' },
    { path: '/api/messages', file: './api/routes/messages', name: 'Direct Messages' },
    { path: '/api/notifications', file: './api/routes/notifications', name: 'Notifications' },
    { path: '/api/welcome', file: './api/routes/welcome', name: 'Welcome New Users' },
    { path: '/api/moderation', file: './api/routes/moderation', name: 'Auto-Moderation' },

    // User & Access Control
    { path: '/api/tier-access', file: './api/tier-access', name: 'Tier Access' },
    { path: '/api/tier-upgrades', file: './api/tier-upgrades', name: 'Tier Upgrades' },
    { path: '/api/blocks', file: './api/block-enforcement', name: 'Block Enforcement' },
    { path: '/api', file: './api/user-tier', name: 'User Tier' },
    { path: '/api/auth', file: './api/auth', name: 'Authentication (JWT)' },
    { path: '/api/family-access', file: './api/family-access', name: 'Family Access' },
    { path: '/api/accounts', file: './api/accounts', name: 'Multi-Account System' },
    { path: '/api/user', file: './api/user', name: 'User Info & VIP Status' },
    { path: '/api/legal', file: './api/routes/legal', name: 'Legal Acceptance Tracking' },
    { path: '/api/legal-receipts', file: './api/legal-receipts', name: 'Legal Receipts (Lifetime-Locked)' },

    // Admin & System
    { path: '/api/admin', file: './api/admin-stats', name: 'Admin Stats & Health' },

    // Content & AI
    { path: '/api/ai', file: './api/ai', name: 'AI' },
    { path: '/api/ai-content', file: './api/ai-content', name: 'AI Content' },
    { path: '/api/ai/review', file: './api/ai-review-content', name: 'AI Auto-Review (Copyright)' },
    { path: '/api/upload', file: './api/upload-protected', name: 'Upload (Protected)' },
    { path: '/api/moderation', file: './api/moderation-actions', name: 'AI CSAM Moderation' },

    // Advanced Features
    { path: '/api/analytics', file: './api/routes/analytics', name: 'Analytics Dashboard' },
    { path: '/api/activity', file: './api/routes/activity', name: 'Real-Time Activity Feed' },
    { path: '/api/experiments', file: './api/routes/experiments', name: 'A/B Testing Framework' },

    // Creator Tools
    { path: '/api/creator-applications', file: './api/creator-applications', name: 'Creator Applications' },
    { path: '/api/trial', file: './api/trial', name: 'Free Trial System' },
    { path: '/api/creator-copyright', file: './api/creator-copyright-requests', name: 'Creator Copyright Requests (AI-Validated)' },

    // Mico AI & Governance
    { path: '/api/mico', file: './api/mico', name: 'Mico AI' },
    { path: '/api/mico-hybrid', file: './api/mico-hybrid', name: 'Mico Hybrid (Mico + Claude)' },
    { path: '/api/governance', file: './api/governance', name: 'Mico Governance (Notary + Policy Overrides)' },
    { path: '/api/queue', file: './api/routes/queue', name: 'Queue Control (Sovereign)' },
    { path: '/api/metrics', file: './api/routes/metrics', name: 'Governance Metrics' },

    // AI ORCHESTRATOR - Multi-Agent System
    { path: '/api/orchestrator', file: './api/ai-orchestrator', name: 'AI Orchestrator (Multi-Agent Coordination)' },

    // Developer Tools
    { path: '/api/auto-implement-suggestions', file: './src/routes/auto-implement-suggestions', name: 'Auto-Implement Suggestions' },
    { path: '/api/auto-answer-questions', file: './src/routes/auto-answer-questions', name: 'Auto-Answer Questions' },
    { path: '/api/debugger-to-cloud', file: './src/routes/debugger-to-cloud', name: 'Cloud Bug Fixer' },
    { path: '/api/issues', file: './api/issues', name: 'Issues' },
    { path: '/api/bug-fixer', file: './api/bug-fixer', name: 'Bug Fixer (Auto Error Tracking)' },
    
    // User Activity
    { path: '/api/user', file: './api/user-activity', name: 'User Activity' },

    // New Feature APIs (Nov 26, 2025 Update)
    // REMOVED DUPLICATE: { path: '/api/moderation', file: './api/moderation', name: 'Community Moderation System' },
    { path: '/api/social', file: './api/social', name: 'Social Feed & Discovery' },
    { path: '/api/merch', file: './api/merch', name: 'Merchandise Store' },
    { path: '/api/rewards', file: './api/rewards', name: 'Fan Rewards & Loyalty' },
    { path: '/api/collaboration', file: './api/collaboration', name: 'Collaboration Rooms' },
    { path: '/api/render', file: './api/render', name: 'Cloud Rendering' },
    // REMOVED DUPLICATE: { path: '/api/analytics', file: './api/analytics', name: 'Creator Analytics' },
    
    // ===== PHASE 3: SOCIAL FEATURES (NO PHOTODNA REQUIRED) =====
    { path: '/api/discovery', file: './api/discovery', name: '🔍 Creator Discovery (Search, Trending, Recommendations)' },
    { path: '/api/community', file: './api/community', name: '🏘️ Community (Forums, Events, Discussions)' },
    
    // ===== PHASE 4: CREATOR ECONOMY (NO PHOTODNA REQUIRED) =====
    { path: '/api/marketplace', file: './api/marketplace', name: '🛒 Marketplace (Asset Sales, Templates, Creator-to-Creator)' },
    { path: '/api/partnerships', file: './api/partnerships', name: '🤝 Partnerships (Brand Deals, Sponsorships, Affiliates)' },
    { path: '/api/education', file: './api/education', name: '🎓 Education (Courses, Tutorials, Mentorship, Certifications)' },
    { path: '/api/revenue-optimizer', file: './api/revenue-optimizer', name: '💰 Revenue Optimizer (Forecasting, Pricing, A/B Tests, Insights)' },
    
    // Epic Features (Dec 3, 2025 - Mico's Vision)
    { path: '/api/epic', file: './api/epic-features', name: 'Epic Features (Style DNA, Proof, Scene Intel, XR Exports)' },
    
    // Sovereignty Epic Features - Phase 2 (Dec 3, 2025)
    { path: '/api/time-machine', file: './api/time-machine', name: 'Time Machine (Version Control)' },
    { path: '/api/virtual-studio', file: './api/virtual-studio', name: 'Virtual Studio (Background Replacement)' },
    { path: '/api/scene-intelligence', file: './api/scene-intelligence', name: 'Scene Intelligence (Cinematic Effects)' },
    { path: '/api/deepfake-protection', file: './api/deepfake-protection', name: 'Deepfake Protection (Face Signatures)' },
    { path: '/api/ai-style-learning', file: './api/ai-style-learning', name: 'AI Style Learning (Edit Patterns)' },
    { path: '/api/scene-removal', file: './api/scene-removal', name: 'Scene Removal (Object Removal)' },
    { path: '/api/prompt-to-content', file: './api/prompt-to-content', name: 'Prompt-to-Content (Text-to-Media)' },
    { path: '/api/invisible-watermark', file: './api/invisible-watermark', name: 'Invisible Watermark (LSB Steganography)' },
    { path: '/api/content-dna', file: './api/content-dna', name: 'Content DNA (Perceptual Hashing)' },
    { path: '/api/collaboration-ghosts', file: './api/collaboration-ghosts', name: 'Collaboration Ghosts (Multiplayer)' },
    { path: '/api/gratitude-logger', file: './api/gratitude-logger', name: 'Gratitude Logger (Artifact Tracking)' },
    { path: '/api/ai/generative-fill', file: './api/ai-generative-fill', name: '🤖 AI Generative Fill (Figma Killer)' },
    { path: '/api/ai/segment-object', file: './api/ai-generative-fill', name: '🎯 Smart Object Selection (SAM)' },
    { path: '/api/ai/inpaint', file: './api/ai-generative-fill', name: '🗑️ AI Object Removal (Inpainting)' },
    { path: '/api/ai/outpaint', file: './api/ai-generative-fill', name: '🔲 AI Image Extension (Outpainting)' },
    
    // AI Audio Production - Logic Pro/Ableton/iZotope Killer
    { path: '/api/audio/stem-split', file: './api/audio-production', name: '🎵 AI Stem Separation (iZotope $399 → FREE)' },
    { path: '/api/audio/master', file: './api/audio-production', name: '🎛️ AI Mastering (LANDR $29/mo → FREE)' },
    { path: '/api/audio/pitch-correct', file: './api/audio-production', name: '🎤 Auto-Tune (Antares $399 → FREE)' },
    { path: '/api/audio/tempo-detect', file: './api/audio-production', name: '⏱️ BPM Detection (Spotify API)' },
    { path: '/api/audio/quantize', file: './api/audio-production', name: '📐 Smart Quantize (Logic Pro Feature)' },
    { path: '/api/audio/session-player', file: './api/audio-production', name: '🎹 AI Session Players (Logic $200 → FREE)' },
    { path: '/api/audio/spatial-audio', file: './api/audio-production', name: '🔊 Spatial Audio (Dolby Atmos)' },
    
    // VR/AR Production - Unity/Unreal Killer
    { path: '/api/vr/generate-3d', file: './api/vr-ar-production', name: '🎨 Text-to-3D (Unity $200/mo → FREE)' },
    { path: '/api/vr/optimize-mesh', file: './api/vr-ar-production', name: '⚡ VR Mesh Optimizer (Quest/VIVE)' },
    { path: '/api/vr/generate-environment', file: './api/vr-ar-production', name: '🌍 AI VR Environment Generator' },
    { path: '/api/vr/export-scene', file: './api/vr-ar-production', name: '📦 Multi-Platform Export (WebXR/Quest/Vision Pro)' },
    { path: '/api/vr/edit-360-video', file: './api/vr-ar-production', name: '🎥 360° Video Editor' },
    { path: '/api/vr/train-gesture', file: './api/vr-ar-production', name: '✋ Hand Gesture Trainer' },
    
    // MICO PRIORITY FEATURES - Critical Migration Tools
    { path: '/api/psd/import-psd', file: './api/psd-support', name: '📁 PSD Import (Photoshop Migration)' },
    { path: '/api/psd/export-psd', file: './api/psd-support', name: '💾 PSD Export (Photoshop Compatibility)' },
    { path: '/api/comic/generate-panels', file: './api/comic-panel-generator', name: '🎨 AI Comic Panel Generator (NO COMPETITOR HAS THIS)' },
    { path: '/api/comic/generate-speech-bubbles', file: './api/comic-panel-generator', name: '💬 AI Speech Bubble Generator' },
    { path: '/api/templates', file: './api/template-marketplace', name: '📚 Template Marketplace (Canva Killer)' },
    
    // Image Processing
    { path: '/api', file: './api/crop', name: '✂️ Auto-Crop & Image Processing' },
    
    // ===== INDUSTRY-CRUSHING AI FEATURES (Best on Market) =====
    
    // 🎨 PHOTO TOOLS (Photoshop/Lightroom Destroyers)
    { path: '/api/ai/remove-background', file: './api/ai-background-removal', name: '🎭 AI Background Removal (Remove.bg $299/month → FREE)' },
    { path: '/api/photo/enhance', file: './api/ai-photo-enhancer', name: '✨ AI Photo Enhancer (Photoshop/Lightroom Killer)' },
    { path: '/api/photo/search', file: './api/ai-image-search', name: '🔍 AI Image Search & Organization (Google Photos Killer)' },
    
    // 🎬 VIDEO TOOLS (Premiere/Final Cut Annihilators)
    { path: '/api/ai/upscale-video', file: './api/ai-video-upscale', name: '📺 AI Video Upscaling 4K+120fps (Topaz $299 → FREE)' },
    { path: '/api/ai/clip-video', file: './api/ai-video-clipper', name: '✂️ Smart Video Clipper (OpusClip $129/month → FREE)' },
    { path: '/api/video/effects', file: './api/ai-video-effects', name: '🎥 Hollywood Video Effects (Premiere/Final Cut Killer)' },
    { path: '/api/ai/color-grade', file: './api/ai-color-grading', name: '🎨 AI Color Grading (DaVinci $295 → FREE)' },
    { path: '/api/ai/generate-thumbnail', file: './api/ai-thumbnail', name: '🖼️ AI Thumbnail Generator (TubeBuddy $19/month → FREE)' },
    
    // 🎙️ AUDIO TOOLS (Studio-Grade Destroyers)
    { path: '/api/ai/music-from-hum', file: './api/ai-music-from-hum', name: '🎶 AI Music from Humming (WORLD FIRST - No Competitor)' },
    { path: '/api/ai/voice-clone', file: './api/ai-voice-cloning', name: '🎤 Voice Cloning + TTS (ElevenLabs $330/year → FREE)' },
    { path: '/api/voice/isolate', file: './api/ai-voice-isolation', name: '🔇 Voice Isolation + Noise Removal (Krisp/iZotope Killer)' },
    { path: '/api/podcast', file: './api/ai-podcast-studio', name: '🎙️ AI Podcast Studio (Riverside $924/year → FREE)' },
    
    // 📹 STREAMING & RECORDING (OBS/Streamlabs Obliteration)
    { path: '/api/stream', file: './api/ai-live-streaming', name: '📡 Multi-Platform Streaming Studio (OBS/Streamlabs Killer)' },
    { path: '/api/screen-recorder', file: './api/ai-screen-recorder', name: '🎥 Screen Recorder + Auto-Editor (Loom/Descript Killer)' },
    { path: '/api/ai/motion-capture', file: './api/ai-motion-capture', name: '🕺 Webcam Motion Capture (Rokoko $2500 suit → Webcam)' },
    { path: '/api/ai/create-avatar', file: './api/ai-avatar', name: '👤 Real-Time AI Avatar (Ready Player Me Killer)' },
    
    // 🤖 PRODUCTIVITY TOOLS (Workflow Automation)
    { path: '/api/ai/subtitle-emoji', file: './api/ai-subtitle-emoji', name: '💬 AI Subtitles + Emoji (Rev $1.50/min → FREE)' },
    { path: '/api/ai/write-script', file: './api/ai-script-writer', name: '📝 AI Script Writer (Viral Content Generator)' },
    { path: '/api/meeting', file: './api/ai-meeting-summarizer', name: '📊 AI Meeting Summarizer (Fireflies/Otter/Grain Killer)' },
    
    // 💼 MARKETING & BUSINESS TOOLS (Agency-Crushing)
    { path: '/api/ads', file: './api/ai-ad-generator', name: '📢 AI Ad Generator (AdCreative/Copy.ai/Jasper Killer)' },
    { path: '/api/social-scheduler', file: './api/ai-social-scheduler', name: '📅 Social Media Scheduler (Buffer/Hootsuite $1,332/year → FREE)' },
    { path: '/api/meme', file: './api/ai-meme-generator', name: '😂 AI Meme Generator (Imgflip/Kapwing Killer)' },
    { path: '/api/product-photo', file: './api/ai-product-photography', name: '📸 AI Product Photography (Pebblely $480/year → FREE)' },
    
    // 🌐 WEB & AUTOMATION TOOLS (SaaS Annihilators)
    { path: '/api/website', file: './api/ai-website-builder', name: '🏗️ AI Website Builder (Webflow/Wix/Squarespace Killer)' },
    { path: '/api/storage', file: './api/cloud-storage', name: '☁️ AI Cloud Storage (Dropbox $144/year → FREE)' },
    { path: '/api/email', file: './api/email-marketing', name: '📧 Email Marketing (Mailchimp $348/year → FREE)' },
    { path: '/api/forms', file: './api/form-builder', name: '📝 Form Builder (Typeform $300/year → FREE)' },
    { path: '/api/seo', file: './api/ai-seo-optimizer', name: '🔍 SEO Optimizer (Ahrefs/SEMrush $1,188/year → FREE)' },
    { path: '/api/copyright', file: './api/ai-copyright-protection', name: '🛡️ Copyright Protection (WORLD FIRST - Blockchain + AI)' },
    { path: '/api/collab', file: './api/ai-collaboration-hub', name: '🤝 Collaboration Hub (Figma/Miro/Notion $420/year → FREE)' },
    
    // 🛡️ SECURITY & DETECTION (Unique Features)
    { path: '/api/deepfake/detect', file: './api/ai-deepfake-detector', name: '🔍 Deepfake Detector & Watermark (INDUSTRY UNIQUE)' },
    
    // 💰 API MARKETPLACE (MONEY PRINTER)
    { path: '/api/developer', file: './api/developer-portal', name: '🔑 API Key Management (Generate, Revoke, Rotate Keys)' },
    { path: '/api/developer/dashboard', file: './api/developer-dashboard', name: '📊 Developer Dashboard (Analytics & Usage Stats)' },
    { path: '/api/developer/billing', file: './api/api-billing', name: '💳 API Billing (Stripe Subscriptions & Overages)' }
];

let loadedCount = 0;
let failedCount = 0;
let blockedCount = 0;

const { requirePhotoDNA } = require('./config/featureFlags');

routes.forEach(({ path, file, name, requirePhotoDNA: needsPhotoDNA }) => {
    try {
        const route = require(file);

        // DEBUG: Log router details for /api/social
        if (path === '/api/social') {
            console.log(`🔍 DEBUG /api/social:`, {
                type: typeof route,
                hasStack: !!route.stack,
                stackLength: route.stack?.length,
                routes: route.stack?.map(r => ({
                    path: r.route?.path,
                    methods: Object.keys(r.route?.methods || {})
                }))
            });
        }

        // Apply PhotoDNA middleware if required
        if (needsPhotoDNA) {
            if (featureFlags.socialMediaEnabled) {
                app.use(path, route);
                console.log(`✅ ${name}`);
                loadedCount++;
            } else {
                // Block with middleware that returns 503
                app.use(path, requirePhotoDNA);
                console.log(`🔒 ${name} (blocked until PhotoDNA configured)`);
                blockedCount++;
            }
        } else {
            app.use(path, route);
            console.log(`✅ ${name}`);
            loadedCount++;
        }
    } catch (error) {
        console.warn(`⚠️  ${name} (skipped - ${error.message.substring(0, 40)})`);
        failedCount++;
    }
});

console.log(`\n📊 Routes loaded: ${loadedCount}/${routes.length} ${failedCount > 0 ? `(${failedCount} skipped)` : ''}`);
if (blockedCount > 0) {
    console.log(`🔒 ${blockedCount} routes blocked pending PhotoDNA API key`);
    console.log(`💡 Add PHOTODNA_API_KEY to .env to enable social media features`);
}

// ============================================================================
// DIRECT POST ENDPOINT - Workaround for Express router mounting issue
// ============================================================================
app.post('/api/social/post', express.json(), async (req, res) => {
    try {
        const { userId, content, visibility = 'public', mediaUrl = null } = req.body;

        if (!userId || !content) {
            return res.status(400).json({ error: 'Missing required fields: userId and content' });
        }

        const mockPost = {
            id: Date.now(),
            userId,
            userName: 'User',
            avatar: '👤',
            content,
            visibility: visibility.toLowerCase(),
            mediaUrl,
            timestamp: new Date().toISOString(),
            likes: 0,
            commentsCount: 0,
            shares: 0
        };

        console.log(`✅ [DIRECT POST] Created post ${mockPost.id} by ${userId}`);
        res.json({ post: mockPost });
    } catch (error) {
        console.error('❌ [DIRECT POST] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// ============================================================================
// ASYNC STARTUP - NO RACE CONDITIONS
// ============================================================================
async function startServer() {
    return new Promise((resolve, reject) => {
        console.log('🎯 Attempting to start server on port', PORT);
        
        server.listen(PORT, '0.0.0.0', (err) => {
            if (err) {
                console.error('❌ Failed to start server:', err);
                reject(err);
            } else {
                console.log(`✅ Server started successfully!`);
                console.log('🔍 Server is running and ready for requests...');
                console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 ForTheWeebs API Server                              ║
║                                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                                 ║
║   Port: ${PORT}                                              ║
║   URL: http://localhost:${PORT}                             ║
║                                                           ║
║   Endpoints:                                              ║
║   - GET  /health                                          ║
║   - POST /api/create-checkout-session                     ║
║   - POST /api/stripe-webhook                              ║
║   - GET  /api/user/:userId/tier                           ║
║   - POST /api/ai/analyze-screenshot                       ║
║   - POST /api/ai/generate-fix                             ║
║   - POST /api/ai/create-pr                                ║
║   - GET  /api/family-access/list                          ║
║   - POST /api/family-access/generate                      ║
║   - GET  /api/family-access/verify                        ║
║   - POST /api/family-access/redeem                        ║
║   - DELETE /api/family-access/delete                      ║
║   - GET  /api/mico/status                🧠               ║
║   - POST /api/mico/chat                  🧠               ║
║   - POST /api/mico/tool/*                🧠               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
                `);
                resolve();
            }
        });
    });
}

// Start server and keep alive
(async () => {
    try {
        await startServer();
        console.log(`✅ Server is running on http://localhost:${PORT}`);
        
        // ===== SOVEREIGN SELF-HEALING SYSTEM - Post-Startup =====
        const { metricsCollector } = require('./utils/observability');
        const { startSLOMonitor } = require('./api/userfix/autoRevert');
        const { startNightlyUpload } = require('./api/bugfixer/upload');
        
        // Start SLO monitoring and auto-revert
        startSLOMonitor(metricsCollector);
        console.log('✅ SLO monitor started');
        
        // Start nightly artifact uploads
        startNightlyUpload();
        console.log('✅ Nightly artifact upload scheduled');
        
        // Start retention extension scheduler
        console.log('📅 Initializing legal receipts retention scheduler...');
        require('./scripts/scheduler');
        console.log('✅ Scheduler initialized');
        
        // Heartbeat to keep process alive
        const timer = setInterval(() => {
            const metrics = metricsCollector.getMetrics();
            console.log(`💓 Server alive | Requests: ${metrics.requests.total} | Errors: ${metrics.requests.errors} | Memory: ${metrics.memory.heapUsedMB}MB`);
        }, 60000); // Every minute
        
        console.log('✅ Heartbeat started');
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
})();

// DO NOT ADD ANY CODE HERE - Node.js will exit if main script finishes!

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
    // Don't crash - just log it
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error.message);
    if (error.stack) {
        console.error('Stack:', error.stack);
    }
    // Don't exit - keep server running
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

// Don't handle SIGINT - let it work normally
// process.on('SIGINT', () => {
//     console.log('\n👋 Shutting down gracefully...');
//     server.close(() => {
//         console.log('✅ Server closed');
//         process.exit(0);
//     });
// });

// Don't export - we're running as standalone server, not a module
// module.exports = app;
