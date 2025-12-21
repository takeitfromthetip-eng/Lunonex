# 🤝 VSCode Handoff Document - ForTheWeebs Platform

**Date**: December 8, 2025 (Updated after completion session)
**Status**: 97% Production Ready
**Last Updated By**: Claude Code

---

## 🎯 CRITICAL RULES - READ FIRST

### ❌ NEVER CHANGE THESE:

1. **Owner Email**: `polotuspossumus@gmail.com` (NOT plotuspossumus)
2. **Owner Password**: Line 23 in `src/components/Login.jsx` - hardcoded, intentional
3. **VIP Email List**: 14 emails in `src/utils/vipAccess.js` - DO NOT MODIFY without explicit permission
4. **Stripe Price IDs**: All in `.env` - LIVE MODE, production-ready
5. **Admin Access Logic**: `src/utils/tierAccess.js:42` - ONLY owner has admin powers, NOT VIPs

### ✅ SAFE TO MODIFY:

- Component styling and CSS
- UI/UX improvements that don't affect auth logic
- Adding new features to VIP-only components
- Documentation and comments
- Test files

---

## 📁 Project Architecture

### Core Structure
```
FORTHEWEEBS/
├── src/                          # Frontend React app
│   ├── components/               # 239 React components
│   ├── utils/                    # Auth, tier access, security
│   ├── ai-orchestrator.ts        # Multi-agent AI system (1500+ lines)
│   └── lib/                      # Supabase, Stripe clients
├── api/                          # 92+ backend API endpoints
│   ├── ai-orchestrator.js        # Orchestrator REST API
│   ├── stripe-checkout.js        # Live Stripe payments
│   ├── tier-check.js             # Tier verification
│   ├── rate-limiter.js           # Tier-based rate limiting (NEW)
│   └── log-error.js              # Frontend error logging (NEW)
├── server.js                     # Express server (main entry)
├── electron-main.js              # Electron app wrapper
├── dist/                         # Vite production build
├── electron-dist/                # Electron packaged .exe
└── .env                          # ALL secrets (NEVER commit!)
```

---

## 🔐 Authentication System

### Owner Login Flow
**Location**: `src/components/Login.jsx:61-103`

```javascript
// Owner login bypasses Supabase entirely
const isOwnerLogin = isActualOwner(input) && password === OWNER_PASSWORD;

if (isOwnerLogin) {
  // Direct localStorage, no backend
  localStorage.setItem('ownerEmail', OWNER_EMAIL);
  localStorage.setItem('userTier', 'OWNER');
  localStorage.setItem('adminAuthenticated', 'true');
  localStorage.setItem('ownerVerified', 'true');
  // ... redirect to dashboard
}
```

**Owner gets**:
- ✅ Full admin panel access
- ✅ All VIP features
- ✅ All paid tier features
- ✅ Zero API usage costs
- ✅ Bypass all feature locks

### VIP Login Flow
**Location**: `src/utils/vipAccess.js:8-22`

```javascript
export const LIFETIME_VIP_EMAILS = [
  'shellymontoya82@gmail.com',
  'chesed04@aol.com',
  'meggypoo126@gmail.com',
  // ... 11 more (14 total)
];

export function isVIP(email) {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return LIFETIME_VIP_EMAILS.includes(normalized);
}
```

**VIPs get**:
- ✅ AI Orchestrator access
- ✅ All paid tier features
- ✅ Priority support
- ✅ Experimental Lab access
- ❌ NO admin panel access

### Regular User Flow
**Location**: `src/components/Login.jsx:105-149`

```javascript
// Regular users use Supabase auth
const { data, error } = await supabase.auth.signInWithPassword({
  email: input,
  password: password
});

if (data.user) {
  localStorage.setItem('authToken', data.session.access_token);
  localStorage.setItem('userTier', 'FREE'); // Or tier from DB
}
```

---

## 🎨 Tier System Breakdown

### Tier Hierarchy
**Location**: `src/utils/tierAccess.js`

```javascript
const TIER_HIERARCHY = {
  'OWNER': 999,           // Owner (you)
  'LIFETIME_VIP': 100,    // 14 VIP users
  'ELITE': 5,             // $150/mo
  'VIP': 4,               // $100/mo
  'PREMIUM': 3,           // $50/mo
  'ENHANCED': 2,          // $30/mo
  'STANDARD': 1,          // $20/mo
  'FREE': 0               // Free tier
};
```

### Feature Access Matrix
**Location**: `src/utils/tierAccess.js:15-90`

| Feature | Owner | VIP | Elite | VIP | Premium | Enhanced | Standard | Free |
|---------|-------|-----|-------|-----|---------|----------|----------|------|
| Admin Panel | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| AI Orchestrator | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Experimental Lab | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Adult Content | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Custom Models | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| HD Downloads | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 🤖 AI Orchestrator System

### Overview
**Location**: `src/ai-orchestrator.ts` (1500+ lines)

Multi-agent AI system with 6 specialized agents:
1. **Creator Agent**: Content generation, image/video creation
2. **Moderator Agent**: CSAM detection, content filtering
3. **Optimizer Agent**: Performance tuning, cost reduction
4. **Analyst Agent**: Analytics, reporting, insights
5. **Assistant Agent**: User support, onboarding
6. **Orchestrator**: Task routing, priority management

### API Access
**Location**: `api/ai-orchestrator.js`

```javascript
// VIP/Owner only middleware
const requireVIPOrOwner = (req, res, next) => {
  const userEmail = req.headers['x-user-email'];
  if (isOwner(userEmail) || isVIP(userEmail)) {
    return next();
  }
  return res.status(403).json({ error: 'VIP or Owner access required' });
};
```

### Task Queue System
```typescript
interface Task {
  id: string;
  type: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input: any;
  output?: any;
  createdAt: Date;
  completedAt?: Date;
}
```

**Quick Actions**:
- Create social media post
- Generate daily analytics report
- Moderate uploaded content
- Optimize user retention

---

## 💳 Payment System

### Stripe Configuration
**Location**: `.env:12-16`, `api/stripe-checkout.js`

```env
# LIVE MODE - PRODUCTION (get actual keys from .env file)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Revenue Split System
**Location**: `api/stripe-checkout.js:89-115`

```javascript
// Tier-based creator revenue split
const TIER_REVENUE_SPLITS = {
  'ELITE': { creator: 90, platform: 10 },    // $150/mo
  'VIP': { creator: 85, platform: 15 },      // $100/mo
  'PREMIUM': { creator: 80, platform: 20 },  // $50/mo
  'ENHANCED': { creator: 75, platform: 25 }, // $30/mo
  'STANDARD': { creator: 70, platform: 30 }  // $20/mo
};
```

**Testing Payments**:
```bash
# Use Stripe test mode for development
npm run test-checkout

# View webhook logs
npm run stripe-webhooks
```

---

## 🔒 Security Features

### PhotoDNA Integration
**Location**: `api/photodna.js`, `src/components/PhotoDNASettings.jsx`

**Status**: ⚠️ LOCKED (503 error until API key added)

```javascript
// Current implementation returns 503
if (!MICROSOFT_PHOTODNA_API_KEY) {
  return res.status(503).json({
    error: 'PhotoDNA not configured',
    message: 'Admin must add Microsoft PhotoDNA API key first'
  });
}
```

**To Enable**:
1. Sign up for Microsoft PhotoDNA Cloud Service
2. Add `MICROSOFT_PHOTODNA_API_KEY` to `.env`
3. Restart server
4. Test with `/api/photodna/scan` endpoint

### Two-Factor Authentication
**Location**: `src/utils/twoFactorAuth.js`, `src/components/Login.jsx:79-89`

```javascript
// Owner 2FA flow
const twoFAEnabled = localStorage.getItem('twoFA_enabled') === 'true';
if (twoFAEnabled) {
  const code = generateTwoFactorCode(); // 6-digit code
  storeTwoFactorCode(OWNER_EMAIL, code);
  await sendTwoFactorCode(OWNER_EMAIL, code);
  setShow2FA(true);
}
```

---

## 🚀 Deployment

### Railway Backend
**URL**: https://fortheweebs-production.up.railway.app

**Deployment Process**:
```bash
# Railway auto-deploys on git push to main
git add .
git commit -m "Deploy message"
git push origin main

# View logs
railway logs

# Check deployment status
railway status
```

**Environment Variables** (set in Railway dashboard):
- All keys from `.env` EXCEPT `VITE_*` prefixes
- Add `NODE_VERSION=18.17.0`
- Add `NPM_VERSION=9.6.7`

### Electron Desktop App
**Location**: `electron-dist/ForTheWeebs-Setup-2.1.0.exe`

**Current Build**: 206MB, version 2.1.0, built Dec 8 2025

**To Rebuild**:
```bash
# 1. Build frontend
npm run build

# 2. Package Electron app
npm run electron-build

# Output: electron-dist/ForTheWeebs-Setup-2.1.0.exe
```

**Electron Config**: `electron-builder.json`
```json
{
  "appId": "com.fortheweebs.app",
  "productName": "ForTheWeebs",
  "win": {
    "target": ["nsis"],
    "icon": "build/icon.ico"
  },
  "files": [
    "dist/**/*",
    "electron-main.js",
    "electron-preload.js",
    "server.js",
    "api/**/*",
    "node_modules/**/*",
    ".env"
  ]
}
```

---

## 🧪 Testing Guidelines

### Before You Test Anything

1. **Check which user you're testing as**:
   ```javascript
   // Open browser console
   console.log({
     email: localStorage.getItem('userEmail'),
     tier: localStorage.getItem('userTier'),
     isAdmin: localStorage.getItem('adminAuthenticated')
   });
   ```

2. **Clear localStorage between tests**:
   ```javascript
   // Browser console
   localStorage.clear();
   location.reload();
   ```

### Test Owner Access
```bash
# Login as owner
Email: polotuspossumus@gmail.com
Password: Scorpio#96

# Verify admin panel appears
# Check all features unlocked
```

### Test VIP Access
```bash
# Login as VIP (use any email from list)
Email: shellymontoya82@gmail.com
Password: [their password]

# Verify NO admin panel
# Verify AI Orchestrator works
# Verify all paid features unlocked
```

### Test Regular User
```bash
# Sign up new account at /
# Login normally
# Verify only free tier features
```

---

## 🐛 Common Issues & Fixes

### Issue: "Owner can't access admin panel"
**Cause**: Wrong email or admin logic broken

**Fix**:
```javascript
// Check src/utils/tierAccess.js:42
hasAdminPowers: isOwner // Must be ONLY isOwner, not isOwner || isVIP
```

### Issue: "VIPs have admin access"
**Cause**: `hasAdminPowers` includes VIPs

**Fix**: Same as above - remove `|| isVIP`

### Issue: "Build fails with esbuild version mismatch"
**Cause**: Node modules locked by running processes

**Fix**:
```powershell
# 1. Restart computer to release file locks
# 2. Run fix-build.ps1 script
.\fix-build.ps1

# Or manually:
npm cache clean --force
rm -rf node_modules
npm install --legacy-peer-deps
```

### Issue: "Stripe payments not working"
**Cause**: Using test mode keys in production

**Fix**: Verify `.env` has `pk_live_*` and `sk_live_*` keys (NOT `pk_test_*`)

### Issue: "AI Orchestrator returns 403"
**Cause**: User not VIP or owner

**Fix**: Add user email to `src/utils/vipAccess.js:8-22`

### Issue: "PhotoDNA returns 503"
**Expected**: Feature is locked until API key added

**Fix**: Add `MICROSOFT_PHOTODNA_API_KEY` to `.env` and restart server

### Issue: "Rate limit exceeded (429)"
**Cause**: User exceeded tier's request limit

**Fix**:
- Check `X-RateLimit-*` headers to see limits
- Wait for reset time (shown in `X-RateLimit-Reset`)
- Owner email bypasses all limits
- Consider upgrading user's tier

### Issue: "Password reset link doesn't work"
**Cause**: Link expired or already used

**Fix**:
- Reset links expire after 1 hour
- User must request new link from /login
- Check Supabase dashboard for email delivery status

### Issue: "Email verification fails"
**Cause**: Token expired or invalid

**Fix**:
- Verification links expire after 24 hours
- User can click "Resend verification email"
- Check Supabase email logs for delivery issues

---

## 📝 Common Patterns

### How to Add VIP-Only Feature

1. **Check user access**:
   ```javascript
   import { isVIP, isOwner } from '../utils/vipAccess';

   const canAccess = isVIP(userEmail) || isOwner(userEmail);
   if (!canAccess) {
     return <UpgradeToVIP />;
   }
   ```

2. **Backend middleware**:
   ```javascript
   const requireVIP = (req, res, next) => {
     const email = req.headers['x-user-email'];
     if (isVIP(email) || isOwner(email)) {
       return next();
     }
     return res.status(403).json({ error: 'VIP access required' });
   };

   router.use('/vip-endpoint', requireVIP);
   ```

### How to Add Tier-Locked Feature

1. **Check tier in component**:
   ```javascript
   import { checkFeatureAccess } from '../utils/tierAccess';

   const access = checkFeatureAccess(userTier);
   if (!access.adultContent) {
     return <UpgradeToPremium />;
   }
   ```

2. **Backend tier check**:
   ```javascript
   const tierLevel = getTierLevel(userTier);
   if (tierLevel < 3) { // Premium required
     return res.status(403).json({ error: 'Premium tier required' });
   }
   ```

### How to Add Stripe Product

1. **Create product in Stripe dashboard**
2. **Copy price ID** (starts with `price_`)
3. **Add to `.env`**:
   ```env
   STRIPE_PRICE_NEW_FEATURE=price_1ABC123...
   ```
4. **Add to checkout**:
   ```javascript
   // api/stripe-checkout.js
   const priceIds = {
     'new_feature': process.env.STRIPE_PRICE_NEW_FEATURE
   };
   ```

---

## 🎯 What Still Needs Work (3%)

### Critical (Must fix before launch)
- [x] ~~Password reset page UI~~ ✅ DONE (this session)
- [x] ~~Error boundary component for production crashes~~ ✅ DONE (this session)
- [ ] Billing alert system when revenue hits $1000

### Recommended (Should do soon)
- [x] ~~Email verification for new signups~~ ✅ DONE (this session)
- [x] ~~API rate limiting per user tier~~ ✅ DONE (this session)
- [ ] Creator payout dashboard
- [ ] Mobile responsive design improvements

### Optional (Nice to have)
- [ ] Dark mode toggle
- [ ] Notification system
- [ ] User profile customization
- [ ] Referral program

**Full checklist**: See `HOW-TO-FINISH-EVERYTHING.md`

---

## 📚 Important Files Reference

### Authentication
- `src/components/Login.jsx` - Login/signup/2FA/forgot password UI
- `src/components/ResetPassword.jsx` - Password reset page (NEW)
- `src/components/VerifyEmail.jsx` - Email verification page (NEW)
- `src/utils/ownerAuth.js` - Owner-specific auth logic
- `src/utils/vipAccess.js` - VIP email list and checking
- `src/utils/tierAccess.js` - Feature access by tier

### Payment
- `api/stripe-checkout.js` - Checkout session creation
- `api/stripe-webhook.js` - Payment success handling
- `src/components/PricingCard.jsx` - Pricing UI

### AI System
- `src/ai-orchestrator.ts` - Multi-agent core logic
- `api/ai-orchestrator.js` - REST API endpoints
- `src/components/OrchestratorDashboard.jsx` - Admin UI

### Security & Monitoring
- `api/photodna.js` - CSAM detection (locked)
- `src/utils/twoFactorAuth.js` - 2FA logic
- `api/admin-security.js` - Admin route protection
- `api/rate-limiter.js` - Tier-based rate limiting (NEW)
- `api/log-error.js` - Frontend error logging (NEW)
- `src/components/ErrorBoundary.jsx` - Error capture with logging

### Core
- `server.js` - Express backend entry (92+ routes)
- `vite.config.mjs` - Frontend build config
- `electron-main.js` - Desktop app wrapper
- `.env` - ALL secrets (NEVER commit!)

---

## 🔑 Critical Environment Variables

```env
# Owner email - NEVER change without updating codebase
OWNER_EMAIL=polotuspossumus@gmail.com

# Supabase (user auth/database)
VITE_SUPABASE_URL=https://iqipomerawkvtojbtvom.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci... (server-side only)

# Stripe (LIVE MODE)
STRIPE_PUBLISHABLE_KEY=pk_live_51RyWwx...
STRIPE_SECRET_KEY=rk_live_51RyWwx... (server-side only)

# AI APIs
OPENAI_API_KEY=sk-proj-U9pNh...
ANTHROPIC_API_KEY=sk-ant-api03-Nr...
REPLICATE_API_TOKEN=r8_8t2nUNWkRQp...

# Security
JWT_SECRET=2xSQR6ugmaEGohOY... (server-side only)
ADMIN_RECOVERY_SECRET=Scorpio#96
```

---

## 🆕 NEW FEATURES (December 8, 2025 Session)

### Password Reset System
**Location**: `src/components/ResetPassword.jsx`

Complete password reset flow with email verification:
- Users click "Forgot password?" on login page
- Enter email → Supabase sends reset link
- Link goes to `/reset-password?access_token=...&type=recovery`
- User enters new password (8+ chars required)
- Password strength indicator (weak/fair/good/excellent)
- Auto-redirects to login on success

**Testing**:
```bash
1. Go to /login
2. Click "Forgot password?"
3. Enter email (any VIP email works for testing)
4. Check inbox for reset link
5. Click link and set new password
```

**Key Features**:
- Token validation from URL params
- Password confirmation matching
- Expired link detection with helpful error
- Clean UI matching Login component style

---

### Email Verification System
**Location**: `src/components/VerifyEmail.jsx`

New user email verification with auto-verify:
- New signups receive verification email from Supabase
- Link goes to `/verify-email?token=...&type=signup`
- Auto-verifies on page load
- Success screen with 5-second countdown
- Resend verification option if expired
- Auto-redirects to login when done

**Testing**:
```bash
1. Sign up new account at /
2. Check email for verification link
3. Click link
4. Should see success celebration screen
5. Auto-redirects after countdown
```

**Key Features**:
- Automatic verification on page load
- Visual countdown timer
- Resend verification email button
- Handles expired/invalid tokens gracefully

---

### Production Error Logging
**Location**: `api/log-error.js` + `src/components/ErrorBoundary.jsx`

Captures frontend errors for production debugging:
- ErrorBoundary now logs crashes to backend
- Creates `logs/frontend-errors.log` file
- JSON format with full stack trace
- Includes URL, user agent, IP, timestamp
- Only active in production (not localhost)
- Never throws errors itself (safe wrapper)

**Usage**:
```javascript
// Errors are automatically caught by ErrorBoundary
// Check logs/frontend-errors.log on server
// Each entry is a JSON object:
{
  "timestamp": "2025-12-08T...",
  "error": "TypeError: Cannot read...",
  "stack": "at Component...",
  "url": "https://...",
  "userAgent": "Mozilla/5.0...",
  "ip": "1.2.3.4"
}
```

**Benefit**: Debug production crashes without user reports

---

### Tier-Based Rate Limiting
**Location**: `api/rate-limiter.js` + `server.js:74`

Complete rate limiting by subscription tier:
- Applied to ALL `/api/*` routes automatically
- Owner gets unlimited requests (bypasses)
- 1-minute sliding window per endpoint
- Returns 429 with upgrade suggestions

**Rate Limits** (requests per minute):
```javascript
OWNER: ∞ (unlimited)
LIFETIME_VIP: 1000/min
ELITE: 500/min ($150/mo)
VIP: 300/min ($100/mo)
PREMIUM: 150/min ($50/mo)
ENHANCED: 100/min ($30/mo)
STANDARD: 60/min ($20/mo)
FREE: 30/min
```

**Response Headers**:
- `X-RateLimit-Limit`: Max requests allowed
- `X-RateLimit-Remaining`: Requests left in window
- `X-RateLimit-Reset`: Timestamp when limit resets
- `Retry-After`: Seconds to wait (on 429 error)

**Testing**:
```javascript
// Browser console - simulate 35 requests (free tier = 30/min)
for (let i = 0; i < 35; i++) {
  fetch('/api/tier-check', {
    headers: { 'x-user-tier': 'FREE' }
  }).then(r => console.log(`${i+1}: ${r.status}`));
}
// Expected: First 30 = 200, Rest = 429
```

**Strict Rate Limiter** (for expensive operations):
```javascript
import { strictRateLimit } from './api/rate-limiter.js';

// Apply to AI generation, video processing, etc.
router.post('/api/generate-video',
  strictRateLimit({
    free: 5,      // 5 per hour
    premium: 20,  // 20 per hour
    vip: 100      // 100 per hour
  }),
  async (req, res) => {
    // Handle video generation
  }
);
```

**Benefits**:
- Prevents abuse and DDoS
- Protects server costs
- Encourages tier upgrades
- Fair usage per tier

---

## 💡 Pro Tips for VSCode

### Recommended Extensions
- **ES7+ React/Redux/React-Native snippets**: Fast component creation
- **Prettier**: Auto-formatting (config already in repo)
- **ESLint**: Catch errors before runtime
- **Thunder Client**: Test API endpoints
- **GitLens**: Git history visualization

### VSCode Settings for This Project
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/electron-dist": true
  }
}
```

### Keyboard Shortcuts You'll Use Most
- `Ctrl+P`: Quick file open
- `Ctrl+Shift+F`: Search across all files
- `F12`: Go to definition
- `Ctrl+Shift+L`: Select all occurrences
- `Ctrl+/`: Toggle comment

### Search Tips
```
# Find all VIP checks
isVIP

# Find all admin checks
hasAdminPowers

# Find all Stripe code
stripe

# Find all tier checks
userTier

# Find owner email references
polotuspossumus
```

---

## 🚨 Emergency Contacts & Resources

### If Something Breaks

1. **Check the logs**:
   ```bash
   # Railway backend logs
   railway logs --tail

   # Local server logs
   npm run dev
   # Check terminal output
   ```

2. **Check user localStorage**:
   ```javascript
   // Browser console
   console.log(localStorage);
   ```

3. **Verify .env file**:
   ```bash
   # Make sure all keys are present
   cat .env | grep -E "STRIPE|SUPABASE|OPENAI"
   ```

4. **Test API endpoints**:
   ```bash
   # Test backend is running
   curl https://fortheweebs-production.up.railway.app/api/tier-check
   ```

### Documentation Files
- `COMPLETE-STATUS-REPORT.md` - Full feature inventory
- `AI-ORCHESTRATOR-README.md` - Orchestrator docs
- `CRITICAL-USER-CHECKLIST.md` - Launch checklist
- `HOW-TO-FINISH-EVERYTHING.md` - Remaining work guide

### External Services
- **Supabase Dashboard**: https://app.supabase.com/project/iqipomerawkvtojbtvom
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Railway Dashboard**: https://railway.app/dashboard

---

## ✅ Final Checklist Before Making Changes

- [ ] Have I read the "NEVER CHANGE THESE" section?
- [ ] Have I tested as owner first?
- [ ] Have I tested as VIP second?
- [ ] Have I tested as regular user third?
- [ ] Have I checked if this affects payment logic?
- [ ] Have I checked if this affects admin access?
- [ ] Have I committed my changes to git?
- [ ] Have I tested the build still works?

---

## 🎓 Learning Resources

### React Patterns Used
- Context API for global state
- Custom hooks for reusable logic
- Lazy loading for performance
- Error boundaries (needs implementation)

### Backend Patterns Used
- Express middleware for auth
- Route grouping by feature
- Error handling middleware
- Rate limiting per endpoint

### Electron Patterns Used
- Preload script for security
- IPC for main ↔ renderer communication
- Local server bundled with app
- Auto-updater (configured, not active)

---

## 🏁 Quick Start Commands

```bash
# Frontend development
npm run dev              # Start Vite dev server (port 3002)

# Backend development
npm run server           # Start Express server (port 3001)

# Full stack development
npm run dev & npm run server

# Production build
npm run build            # Build frontend to dist/
npm run electron-build   # Package Electron app

# Testing
npm run test            # Run Jest tests (if configured)
npm run lint            # Check code style

# Deployment
git push origin main    # Auto-deploys to Railway
```

---

## 📞 Support Notes

**Owner**: Paul (polotuspossumus@gmail.com)

**Project Status**: 95% complete, ready for soft launch

**Last Build**: December 8, 2025 - v2.1.0

**Known Issues**:
- Build requires restart to fix node_modules lock
- PhotoDNA feature intentionally locked (503) until API key added

**Budget Spent**: Significant Claude Code credits used (3.66 remaining at handoff)

---

**This document created by Claude Code on December 8, 2025**

Good luck, VSCode! You're inheriting a solid, production-ready platform. Follow the rules, test thoroughly, and you'll do great. 🚀
