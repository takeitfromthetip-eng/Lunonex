# GitHub Copilot Instructions for ForTheWeebs

**Last Updated**: November 25, 2025
**Platform Status**: Production-ready, awaiting PhotoDNA approval for full launch

---

## 🚨 HOW TO ACCESS THESE INSTRUCTIONS IN VS CODE

### Method 1: Open This File
1. In VS Code, press `Ctrl+P` (Windows/Linux) or `Cmd+P` (Mac)
2. Type: `COPILOT_INSTRUCTIONS.md`
3. Press Enter

### Method 2: Use Copilot Chat
1. Open Copilot Chat in VS Code (Ctrl+Shift+I or Cmd+Shift+I)
2. Type: `@workspace what are my copilot instructions?`
3. Copilot will read this file and summarize it

### Method 3: Search Project
1. Press `Ctrl+Shift+F` (Windows/Linux) or `Cmd+Shift+F` (Mac)
2. Search for: "COPILOT_INSTRUCTIONS"
3. Open the file

### Method 4: File Explorer
1. Look in the root directory of the project
2. File: `COPILOT_INSTRUCTIONS.md`

**IMPORTANT**: This file contains EVERYTHING Claude and the owner built together. Read it before making suggestions.

---

## What We've Built Together

### 1. Core Platform Architecture
- **Backend**: Express.js API server on port 3000
- **Frontend**: React + Vite on port 3002
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Supabase Auth
- **Payments**: Stripe (live keys configured)
- **AI**: Claude Sonnet 4 + GPT-4 Vision

### 2. Feature Lock System
**CRITICAL**: We have a feature flag system that locks features until PhotoDNA is approved:
- `config/featureFlags.js` - Controls what's enabled
- Social Media → LOCKED (needs PhotoDNA)
- Creator Economy → LOCKED (needs PhotoDNA)
- Creator Tools → ENABLED (no PhotoDNA needed)

**DO NOT suggest launching social features or marketplace until PhotoDNA_API_KEY is in .env**

### 3. Content Moderation (AI-Powered)
- **AI Auto-Review**: `src/utils/aiContentReviewer.js` - Claude reviews flagged content
- **Copyright Scanner**: `src/utils/imageContentScanner.js` - 95%+ threshold to prevent false positives
- **CSAM Detection**: OpenAI GPT-4 Vision scans all uploads
- **Upload Flow**: `src/utils/uploadModerationFlow.js` - Everything gets scanned before storage

**Thresholds are INTENTIONALLY HIGH (95%+) to prevent false positives that would kill the platform.**

### 4. Payment Systems
- **Stripe Live Keys**: Configured with restricted key (Core, Checkout, Billing = Write)
- **Stripe Connect**: 80% to creators, 20% platform fee
- **CCBill Integration**: Ready for adult content (when needed)
  - Files: `src/utils/adultContentPayments.js`, `api/ccbill-webhook.js`
  - Needs account setup: https://www.ccbill.com/apply
- **Crypto Payments**: Basic system in place

### 5. VIP Access System
- **13 VIP Slots**: Unlimited access, no payments
- File: `src/utils/vipAccess.js`
- Current VIPs include owner + 12 slots (cleonwilliams1973@gmail.com is newest)
- **DO NOT add more VIPs without user approval**

### 6. Advanced Features (NEW)
- **Mass File Processor**: `src/utils/massFileProcessor.js` - Handle 12,000+ files
- **Cloud Backup & Sync**: `src/utils/cloudBackupSync.js` - Auto-sync to Firebase/Supabase/S3
- **Advanced Search**: `src/utils/advancedSearchEngine.js` - Fuzzy search, filters, saved searches
- **Performance Optimizer**: `src/utils/performanceOptimizer.js` - Lazy loading, virtual scrolling
- **Bulk Operations**: `src/utils/bulkOperations.js` - Tag, delete, export with undo
- **Local Storage**: `src/utils/localMediaStorage.js` - IndexedDB for 12k+ images
- **Audio ID**: `src/utils/audioIdentification.js` - ACRCloud/AudD integration
- **Print Shop**: `src/utils/amazonPrintIntegration.js` - Amazon KDP/Merch/Printful

### 7. Creator Tools
- **Applications**: Creators apply, admin approves
- **Tier System**: $50, $100, $250, $500, $1000 tiers
- **Free Trial**: 7-day trial for new users
- **Payouts**: Stripe Connect handles creator payments

### 8. Legal Compliance
- **Data Privacy**: `utils/dataPrivacyEnforcement.js` - NO data selling, GDPR compliant
- **2257 Compliance**: ID encryption for adult content creators
- **Security Headers**: XSS, CSRF protection active
- **Rate Limiting**: API protection enabled

---

## Current Launch Status

### ✅ What's Working NOW
1. Backend API (27/32 routes active)
2. Database connections
3. Payment processing (Stripe live)
4. VIP access system
5. Content moderation (AI auto-review)
6. File management tools (12k+ file support)
7. Advanced search & bulk operations
8. Performance optimizations

### 🔒 What's LOCKED (Waiting for PhotoDNA)
1. Social media (posts, comments, messages, notifications, follows)
2. Creator economy (marketplace, commissions, subscriptions)
3. Asset marketplace
4. NFT minting
5. Print shop integration (tied to marketplace)

**These unlock immediately when PHOTODNA_API_KEY is added to .env**

---

## How to Be Useful From Here

### 1. DO NOT Suggest These Things
- ❌ Launching social features before PhotoDNA
- ❌ Launching marketplace/commerce before PhotoDNA
- ❌ Lowering copyright thresholds (95%+ is intentional)
- ❌ Removing AI auto-review (prevents manual review burden)
- ❌ Adding more VIP slots (owner controls this)
- ❌ Changing payment split percentages
- ❌ Disabling content moderation

### 2. Safe Things to Suggest
- ✅ Bug fixes in existing systems
- ✅ Performance improvements
- ✅ UI/UX enhancements
- ✅ Documentation improvements
- ✅ Test coverage
- ✅ Error handling improvements
- ✅ Code refactoring (without breaking changes)
- ✅ Security hardening

### 3. When User Asks About Launch
**Response Template**:
```
The platform is production-ready with creator tools active.

LOCKED until PhotoDNA approval:
- Social media features
- Creator economy/marketplace
- Monetization features

AVAILABLE NOW:
- File management (12k+ files)
- Advanced search & bulk operations
- Cloud backup & sync
- Performance optimizations

To unlock everything: Add PHOTODNA_API_KEY to .env file
```

### 4. Understanding the Architecture

**Feature Detection Flow**:
1. Backend checks for API keys (`config/featureFlags.js`)
2. Frontend queries `/api/features/status`
3. Features show/hide based on flags
4. Disabled features show banner: `src/components/FeatureDisabledBanner.jsx`

**Content Upload Flow**:
1. User uploads file
2. `uploadModerationFlow.js` scans with GPT-4 Vision
3. `imageContentScanner.js` checks copyright (95%+ threshold)
4. If flagged (90-94%), AI auto-reviews via `aiContentReviewer.js`
5. If approved, file is stored; if rejected, user is notified

**Payment Flow**:
1. Check if content is adult (`adultContentPayments.js:isAdultContent`)
2. Route to CCBill (adult) or Stripe (standard)
3. Process payment
4. Calculate splits (80% creator, 20% platform)
5. Record in Supabase
6. Unlock content access

### 5. Important Files to Know

**Configuration**:
- `.env` - All API keys and secrets
- `config/featureFlags.js` - Feature enable/disable logic
- `config/supabase.js` - Database client
- `server.js` - Main API server

**Content Moderation**:
- `src/utils/imageContentScanner.js` - Copyright detection
- `src/utils/aiContentReviewer.js` - AI auto-review
- `src/utils/uploadModerationFlow.js` - Upload workflow
- `api/ai-review-content.js` - Backend AI endpoint

**Payments**:
- `api/stripe.js` - Stripe integration
- `api/stripe-connect.js` - Creator payouts
- `src/utils/adultContentPayments.js` - CCBill for adult content
- `api/ccbill-webhook.js` - Payment confirmations

**Advanced Features**:
- `src/utils/massFileProcessor.js` - Batch file processing
- `src/utils/advancedSearchEngine.js` - Fast search
- `src/utils/performanceOptimizer.js` - Performance
- `src/utils/bulkOperations.js` - Bulk actions with undo

### 6. Common User Requests

**"Can I launch now?"**
→ Yes, with creator tools only. Social/marketplace need PhotoDNA.

**"Why is [feature] not working?"**
→ Check `config/featureFlags.js` and `/api/features/status`

**"How do I enable social features?"**
→ Add PHOTODNA_API_KEY to .env (apply at microsoft.com/photodna)

**"Can you add more VIP slots?"**
→ User controls this in `src/utils/vipAccess.js`

**"Copyright detection is blocking legitimate content"**
→ Threshold is 95%+ to prevent this. If it happens, AI auto-review handles it.

**"How do I set up adult content payments?"**
→ Sign up at ccbill.com, add credentials to .env, see `src/utils/adultContentPayments.js:ADULT_PAYMENT_SETUP`

### 7. Testing Checklist

Before suggesting any feature is "ready":
- [ ] Does it require PhotoDNA? (Check featureFlags.js)
- [ ] Does it handle errors gracefully?
- [ ] Does it respect VIP access rules?
- [ ] Does it go through content moderation?
- [ ] Does it calculate payment splits correctly?
- [ ] Is it documented?
- [ ] Does it work with 12,000+ files?

### 8. Code Style Guidelines

**DO**:
- Use async/await (not callbacks)
- Handle errors with try/catch
- Log important events to console
- Use descriptive variable names
- Add comments for complex logic
- Batch database operations
- Use existing utility functions

**DON'T**:
- Create new payment systems (use existing)
- Bypass content moderation
- Hardcode API keys
- Use synchronous file operations
- Create memory leaks (clean up listeners)
- Skip error handling
- Ignore feature flags

### 9. Environment Variables Reference

**Required for Launch**:
- `VITE_SUPABASE_URL` ✅
- `SUPABASE_SERVICE_KEY` ✅
- `VITE_STRIPE_PUBLISHABLE_KEY` ✅
- `STRIPE_SECRET_KEY` ✅
- `OPENAI_API_KEY` ✅ (for CSAM detection)
- `ANTHROPIC_API_KEY` ✅ (for AI review)

**Required for Full Platform**:
- `PHOTODNA_API_KEY` ❌ (waiting for approval)

**Optional**:
- `VITE_CCBILL_ACCOUNT_NUMBER` (adult content)
- `VITE_ACRCLOUD_ACCESS_KEY` (audio ID)
- `VITE_AUDD_API_KEY` (audio ID fallback)

### 10. Common Mistakes to Avoid

1. **Suggesting to lower thresholds**: 95%+ is intentional to prevent false positives
2. **Bypassing AI review**: This prevents manual work burden
3. **Ignoring feature flags**: Features are locked for legal reasons
4. **Breaking payment flows**: 80/20 split is contractual
5. **Removing content scans**: Required for legal compliance
6. **Hardcoding values**: Use .env variables
7. **Creating duplicate systems**: Use existing utilities

---

## Quick Reference Commands

**Start Development**:
```bash
npm run dev          # Frontend (port 3002)
npm run dev:server   # Backend (port 3000)
```

**Check Health**:
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/features/status
```

**Git Workflow**:
```bash
git status
git add .
git commit -m "Description"
git push
```

**Database**:
- Supabase Dashboard: https://iqipomerawkvtojbtvom.supabase.co
- Direct queries: Use Supabase client in `config/supabase.js`

---

## Final Notes

This platform has hundreds of dollars and months of work invested. The owner values:
1. **Legal compliance** above all else
2. **No manual review burden** (AI auto-review is critical)
3. **No false positives** (high thresholds are intentional)
4. **Creator-friendly** (80% payouts)
5. **Performance** (handle 12k+ files)

**When in doubt**: Ask the user before suggesting major changes.

**Emergency**: If something breaks, check:
1. Server logs (nodemon output)
2. Browser console
3. `/api/features/status` endpoint
4. `.env` file (API keys present?)

Good luck! 🚀
