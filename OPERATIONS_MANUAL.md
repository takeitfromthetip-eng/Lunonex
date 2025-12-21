# ForTheWeebs Sovereign Self-Healing Operations Manual

## 🚀 Quick Start

### Development
```powershell
# Windows
cd C:\Users\polot\Desktop\FORTHEWEEBS
$env:PORT=3002
node server.js
```

### Production (Railway)
- Auto-deploys on push to main
- Health check: `GET /health/liveness`
- Port: 3002 (auto-assigned by Railway)

---

## 🩹 Self-Healing System

### Health Endpoints
```bash
# Liveness (basic vitals)
GET /api/health/live

# Readiness (DB + dependencies)
GET /api/health/ready

# Startup probe
GET /api/health/startup

# Full health summary
GET /api/health/health

# Artifacts list
GET /api/health/artifacts

# Prometheus metrics
GET /metrics
```

---

## 🔧 Bug Fixer Console

### Public Endpoints (No Auth)
```bash
# Run diagnostics
POST /bugfixer/diagnostics/run

# Run self-test
POST /bugfixer/selftest
```

### Admin Endpoints (Token + HMAC Required)
```bash
# Full heal (auto-restart if degraded)
POST /bugfixer/heal
Headers:
  x-bugfixer-token: YOUR_TOKEN
  x-bugfixer-timestamp: UNIX_TIMESTAMP_MS
  x-bugfixer-nonce: RANDOM_STRING
  x-bugfixer-signature: HMAC_SHA256

# Restart app
POST /bugfixer/remediation
Body: { "action": "restart-app" }

# Upload artifacts to Supabase Storage
POST /bugfixer/artifacts/upload

# Pause risky flags
POST /bugfixer/flags/pause
Body: { "flags": ["newProfileUI", "useV2Encoder"] }

# Request rollback
POST /bugfixer/rollback/undo
Body: { "target": "previous" }

# Batch full heal (all-in-one)
POST /bugfixer/batch/full-heal
```

---

## 👥 User-Driven Healing

### Submit Bug Report
```bash
POST /userfix/feedback/report
Body: {
  "report_type": "bug",
  "message": "Description of issue",
  "page_url": "https://fortheweebs.vercel.app/page",
  "severity": "high"
}
```

### Autonomous Suggestion (Auto-Apply)
```bash
POST /userfix/auto/propose
Body: {
  "repair_type": "flag",
  "proposed_change": {
    "flag_name": "newProfileUI",
    "active": false
  },
  "reason": "Causing layout issues on mobile"
}
```

**What happens:**
1. Validates against allowlist
2. Runs sandbox test
3. Auto-applies if safe
4. Records revert stack entry
5. Runs diagnostics
6. Auto-reverts on SLO breach

---

## 💳 Payment System

### Payment Router (AI-Powered)
```bash
POST /api/payment-router/route
Body: {
  "contentUrl": "https://example.com/content.jpg",
  "amount": 10.00,
  "creatorId": "uuid"
}
```

**Routing Logic:**
- **Safe content** (Google Vision SafeSearch) → Stripe Connect
- **Adult content** → Coinbase Commerce (crypto)
- **API failure** → Defaults to crypto for safety

### Stripe Connect Payout
```bash
POST /api/stripe-connect/payout
Headers:
  Idempotency-Key: UNIQUE_KEY
Body: {
  "creatorStripeAccountId": "acct_123",
  "amount": 50.00,
  "currency": "usd"
}
```

### Coinbase Commerce Charge
```bash
POST /api/coinbase/charge
Headers:
  Idempotency-Key: UNIQUE_KEY
Body: {
  "name": "Premium Content Access",
  "amount": "25.00",
  "currency": "USD"
}
```

---

## 🔒 Security Features

### Protections Active
- ✅ **HMAC Authentication** - Token + timestamp + nonce + signature
- ✅ **IP Allowlist** - Admin endpoints restricted to trusted IPs
- ✅ **Rate Limiting** - 100 req/15min public, 10 req/hour suggestions
- ✅ **Soft Bans** - 1-hour ban on excessive abuse
- ✅ **WAF Filters** - Regex blocks for XSS/SQLi/path traversal
- ✅ **Input Validation** - Allowlists, sanitization, bounds checks
- ✅ **CSP Headers** - No inline scripts, trusted origins only
- ✅ **HSTS** - Force HTTPS
- ✅ **Crash Handlers** - Auto-restart with artifact logging
- ✅ **Memory Watchdog** - Heap snapshot + restart on threshold

### Allowlists
**Feature Flags:**
- `newProfileUI`
- `useV2Encoder`
- `enableAIChat`
- `betaFeatures`

**CMS Keys:**
- `homepage_title`
- `homepage_description`
- `announcement`
- `tos_text`

**Config Keys:**
- `max_upload_size` (1-500 MB)
- `rate_limit_requests` (10-1000)
- `session_timeout` (300-86400 seconds)

---

## 📊 Monitoring & SLOs

### Target SLOs
- **Availability**: Liveness pass rate ≥ 99.9%
- **Latency**: p95 < 500ms for core API routes
- **Error Rate**: < 1% 5xx on public routes

### Auto-Response on Breach
**Triggers:**
- p95 latency > 500ms for 3 consecutive minutes
- Error rate > 2%
- Memory usage > 512MB

**Actions:**
1. Pause risky feature flags
2. Revert last N auto-applied changes
3. Restart application
4. Run self-test
5. Upload artifacts
6. Log breach receipt

---

## 📦 Artifacts & Receipts

### Artifact Types
- `uncaughtException` - Crash logs
- `unhandledRejection` - Promise rejections
- `paymentRouterDecision` - Payment routing choices
- `stripeTransfer` - Stripe payouts
- `coinbaseCharge` - Crypto charges
- `stripeWebhook` / `coinbaseWebhook` - Webhook events
- `autoSuggestionApplied` - User suggestions applied
- `sloBreachDetected` - SLO violations
- `autoRevertExecuted` - Auto-revert actions
- `fullHeal` / `batchFullHeal` - Healing operations
- `tamperAttempt` - Security violations
- `ipBlocked` / `wafBlocked` - Attack attempts

### Storage
- **Local**: `./artifacts/` directory
- **Remote**: Supabase Storage bucket `ftw-artifacts`
- **Format**: JSON + SHA256 sidecar
- **Retention**: Append-only, nightly upload at 03:00
- **Policy**: No overwrites, no deletions

---

## 🎯 Common Operations

### Daily Operations
```bash
# Check health
curl http://localhost:3002/api/health/health

# View metrics
curl http://localhost:3002/metrics

# Check recent suggestions
GET /userfix/auto/recent
```

### Incident Response
```powershell
# 1. Run diagnostics
Invoke-RestMethod -Uri "http://localhost:3002/bugfixer/diagnostics/run" -Method Post

# 2. If degraded, run full heal (with token)
Invoke-RestMethod -Uri "http://localhost:3002/bugfixer/heal" `
  -Method Post `
  -Headers @{ "x-bugfixer-token" = $env:BUGFIXER_TOKEN }

# 3. Verify with self-test
Invoke-RestMethod -Uri "http://localhost:3002/bugfixer/selftest" -Method Post
```

### Emergency Rollback
```bash
POST /bugfixer/rollback/undo
Headers:
  x-bugfixer-token: YOUR_TOKEN
Body: { "target": "previous" }
```

---

## 🔐 Environment Variables

### Required
```env
PORT=3002
SUPABASE_URL=https://iqipomerawkvtojbtvom.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
BUGFIXER_TOKEN=strong_random_string
STRIPE_SECRET_KEY=rk_live_...
COINBASE_API_KEY=00b1d938-c101-492d-82f1-30b113679944
COINBASE_WEBHOOK_SECRET=b3823365-be22-4129-b9be-a9dd4f535c54
```

### Optional
```env
GOOGLE_VISION_KEY={"type":"service_account",...}
ARTIFACT_BUCKET=ftw-artifacts
ARTIFACT_DIR=./artifacts
ADMIN_IPS=1.2.3.4,5.6.7.8
MEM_THRESH_MB=512
APP_VERSION=commit_sha+timestamp
REDIS_URL=redis://...
```

---

## 📱 Frontend Integration

### Wrap App with Error Boundary
```tsx
import ErrorBoundary from './components/ErrorBoundary';

<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Use Safe Fetch
```tsx
import safeFetch from './lib/safeFetch';

const data = await safeFetch('/api/endpoint', {
  timeout: 10000,
  retries: 3,
});
```

### Offline Queue (Capacitor)
```tsx
import { offlineQueue } from './mobile/offlineQueue';

offlineQueue.enqueue('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data),
});
```

---

## 🧪 Testing

### Smoke Tests
```bash
# Crash recovery
curl -X POST http://localhost:3002/bugfixer/test/crash

# Memory spike
curl -X POST http://localhost:3002/bugfixer/test/memory

# SLO breach simulation
curl -X POST http://localhost:3002/bugfixer/test/breach

# WAF test (should be blocked)
curl -X POST http://localhost:3002/userfix/auto/propose \
  -d '{"payload":"<script>alert(1)</script>"}'
```

---

## 🚨 Troubleshooting

### Server Won't Start
1. Check port availability: `netstat -ano | findstr :3002`
2. Validate environment: All required vars set?
3. Check logs: `./artifacts/` directory

### High Error Rate
1. Check `/metrics` endpoint
2. Review recent artifacts
3. Run diagnostics: `POST /bugfixer/diagnostics/run`
4. Trigger heal if needed: `POST /bugfixer/heal`

### Payments Failing
1. Check payment router health
2. Verify Stripe/Coinbase credentials
3. Check webhook signatures
4. Review `paymentRouterDecision` artifacts

---

## 📞 Support Contacts

- **Documentation**: This file
- **Artifacts**: `./artifacts/` or Supabase Storage `ftw-artifacts`
- **Metrics**: `http://localhost:3002/metrics`
- **Health**: `http://localhost:3002/api/health/health`

---

**Last Updated**: December 11, 2025
**System Version**: 2.1.0 Sovereign Self-Healing
**Status**: Production Ready ✅
