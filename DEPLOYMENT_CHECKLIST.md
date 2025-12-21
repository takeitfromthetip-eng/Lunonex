# 🚀 Deployment Checklist - ForTheWeebs Self-Healing System

## ✅ Phase 1: Local Setup (COMPLETE)
- [x] Created 30+ self-healing infrastructure files
- [x] Updated `.env.example` with all new variables
- [x] Server boots successfully on port 3002
- [x] 126/130 routes loaded
- [x] Health endpoints operational
- [x] Artifact logging working
- [x] SLO monitoring active
- [x] Crash handlers installed

---

## ⏳ Phase 2: Database Setup (5 minutes)

### Step 1: Run SQL Schema
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project: `iqipomerawkvtojbtvom`
3. Go to **SQL Editor**
4. Copy entire content from: `supabase/self-healing-schema.sql`
5. Paste and click **Run**
6. Verify tables created:
   - `ftw_flags`
   - `ftw_reports`
   - `ftw_repairs`
   - `ftw_cms`
   - `ftw_config`
   - `ftw_hero_credits`
   - `idempotency_keys`

### Step 2: Create Storage Bucket
1. Go to **Storage** in Supabase
2. Create new bucket: `ftw-artifacts`
3. Set as **private**
4. Enable **append-only** policy:
```sql
CREATE POLICY "Service role can upload artifacts"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'ftw-artifacts');
```

---

## ⏳ Phase 3: Install Dependencies (2 minutes)

```powershell
cd C:\Users\polot\Desktop\FORTHEWEEBS
npm install @google-cloud/vision socket.io
```

This will fix:
- ✅ Bug Fixer Console (needs Google Vision)
- ✅ Payment Webhooks (needs server-safety import)
- ✅ WebRTC signaling (needs socket.io)

---

## ⏳ Phase 4: Code Fixes (5 minutes)

### Fix 1: Metrics Route
**File**: `server.js`  
**Location**: After route loading, before server start  
**Code**:
```javascript
// Explicit metrics endpoint
app.get('/metrics', (req, res) => {
  const m = require('./utils/observability');
  res.set('Content-Type', 'text/plain');
  res.send(m.MetricsCollector.instance.getMetrics());
});
```

### Fix 2: Trust Proxy
**File**: `server.js`  
**Location**: Before CORS configuration  
**Code**:
```javascript
// Trust first proxy (Railway/Vercel)
app.set('trust proxy', 1);
```

### Fix 3: User Feedback API
**File**: `api/userfix/feedback.js`  
**Change**: Line ~15, update validation:
```javascript
// FROM:
if (!report_type || !message) {

// TO:
if (!message) {
  // report_type is optional, severity is optional
```

---

## ⏳ Phase 5: Local Testing (3 minutes)

```powershell
# Kill existing server
Get-Process -Name node | Stop-Process -Force

# Set all env vars
$env:PORT=3002
$env:BUGFIXER_TOKEN='your-secure-token-here'
$env:COINBASE_API_KEY='00b1d938-c101-492d-82f1-30b113679944'
$env:SUPABASE_URL='https://iqipomerawkvtojbtvom.supabase.co'
$env:SUPABASE_SERVICE_KEY='your-service-key'
$env:STRIPE_SECRET_KEY='your-stripe-key'
$env:GOOGLE_VISION_KEY='your-google-vision-key'
$env:ARTIFACT_BUCKET='ftw-artifacts'

# Start server
node server.js
```

### Test All Endpoints:
```powershell
# Health
Invoke-RestMethod http://localhost:3002/api/health/live
Invoke-RestMethod http://localhost:3002/api/health/ready

# Metrics
Invoke-WebRequest http://localhost:3002/metrics

# User Feedback
Invoke-RestMethod -Uri http://localhost:3002/userfix/feedback/report `
  -Method Post `
  -Body (@{ message='Test'; severity='low'; pageUrl='http://test' } | ConvertTo-Json) `
  -ContentType 'application/json'

# Autonomous Suggestions
Invoke-RestMethod http://localhost:3002/userfix/auto/recent

# Bug Fixer (with token)
$headers = @{ 'x-bugfixer-token' = 'your-secure-token-here' }
Invoke-RestMethod -Uri http://localhost:3002/bugfixer/heal `
  -Method Post -Headers $headers
```

---

## ⏳ Phase 6: Railway Deployment (10 minutes)

### Step 1: Update Railway Environment Variables
Go to Railway dashboard → Your project → Variables:

```bash
# Core
PORT=3002
NODE_ENV=production

# Database
SUPABASE_URL=https://iqipomerawkvtojbtvom.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
VITE_SUPABASE_URL=https://iqipomerawkvtojbtvom.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Self-Healing
BUGFIXER_TOKEN=your-secure-production-token-32-chars
ARTIFACT_BUCKET=ftw-artifacts
ARTIFACT_DIR=/app/artifacts
MEM_THRESH_MB=512
APP_VERSION=2.1.0

# Security
ADMIN_IPS=your-admin-ip-here,1.2.3.4
JWT_SECRET=your-jwt-secret

# Payments
STRIPE_SECRET_KEY=sk_live_your-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
COINBASE_API_KEY=00b1d938-c101-492d-82f1-30b113679944
COINBASE_WEBHOOK_SECRET=b3823365-be22-4129-b9be-a9dd4f535c54

# AI
OPENAI_API_KEY=sk-your-openai-key
GOOGLE_VISION_KEY=your-google-vision-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# URLs
RAILWAY_BACKEND_URL=https://your-app.up.railway.app
VITE_FRONTEND_URL=https://fortheweebs.vercel.app
VITE_API_URL=https://your-app.up.railway.app
```

### Step 2: Configure Webhooks

**Stripe Webhooks**:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-app.up.railway.app/webhooks/stripe`
3. Select events: `transfer.*`, `account.updated`
4. Copy webhook secret → Update `STRIPE_WEBHOOK_SECRET`

**Coinbase Webhooks**:
1. Go to Coinbase Commerce Dashboard → Settings → Webhook subscriptions
2. Add endpoint: `https://your-app.up.railway.app/webhooks/coinbase`
3. Select events: `charge:confirmed`, `charge:failed`, `charge:pending`
4. Verify webhook secret matches: `b3823365-be22-4129-b9be-a9dd4f535c54`

### Step 3: Push to Deploy
```powershell
git add .
git commit -m "feat: sovereign self-healing system v2.1.0"
git push origin main
```

Railway will auto-deploy. Monitor logs for:
- ✅ `Server is running on http://0.0.0.0:3002`
- ✅ `Routes loaded: 130/130` (all routes should load with deps installed)
- ✅ `SLO monitor started`
- ✅ `Nightly artifact upload scheduled`

---

## ⏳ Phase 7: Vercel Frontend (5 minutes)

### Update Frontend Environment Variables
Vercel Dashboard → Your project → Settings → Environment Variables:

```bash
VITE_API_URL=https://your-app.up.railway.app
VITE_SUPABASE_URL=https://iqipomerawkvtojbtvom.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-key
VITE_FRONTEND_URL=https://fortheweebs.vercel.app
```

### Deploy Frontend
```powershell
cd src
git add .
git commit -m "chore: update API URLs for self-healing backend"
git push origin main
```

---

## ✅ Phase 8: Verification (5 minutes)

### Test Production Endpoints:
```powershell
$baseUrl = "https://your-app.up.railway.app"

# Health
Invoke-RestMethod "$baseUrl/api/health/live"
Invoke-RestMethod "$baseUrl/api/health/ready"

# Metrics
Invoke-WebRequest "$baseUrl/metrics"

# User Feedback
Invoke-RestMethod -Uri "$baseUrl/userfix/feedback/report" `
  -Method Post `
  -Body (@{ message='Production test'; severity='low'; pageUrl="$baseUrl" } | ConvertTo-Json) `
  -ContentType 'application/json'

# Autonomous Suggestions
Invoke-RestMethod "$baseUrl/userfix/auto/recent"
```

### Monitor Artifacts:
1. Go to Supabase Storage → `ftw-artifacts` bucket
2. Artifacts should appear after first nightly run (03:00 UTC)
3. Check artifact types:
   - `configValidationWarnings_*.json`
   - `autoSuggestionApplied_*.json`
   - `sloBreachDetected_*.json`
   - `shutdown_*.json`

---

## 🎉 Success Criteria

Your system is **production-ready** when:

- ✅ All 130 routes load successfully
- ✅ Health endpoints return 200 OK
- ✅ Metrics export working
- ✅ Database tables created with RLS policies
- ✅ Artifacts uploading to Supabase Storage
- ✅ SLO monitor active and detecting breaches
- ✅ Auto-revert on SLO breach functional
- ✅ Webhooks receiving Stripe/Coinbase events
- ✅ User feedback system accepting reports
- ✅ Autonomous suggestions applying safely
- ✅ Rate limiting protecting endpoints
- ✅ HMAC authentication on admin routes
- ✅ Frontend ErrorBoundary catching crashes

---

## 📞 Support

If something goes wrong:

1. **Check Railway Logs**: Railway Dashboard → Your project → Deployments → Latest → Logs
2. **Check Artifacts**: Supabase Storage → `ftw-artifacts` bucket
3. **Check Health**: `https://your-app.up.railway.app/api/health/ready`
4. **Check Metrics**: `https://your-app.up.railway.app/metrics`

Common issues:
- **404 on routes**: Dependencies not installed → Run `npm install @google-cloud/vision socket.io`
- **Rate limit errors**: Trust proxy not set → Add `app.set('trust proxy', 1)`
- **DB errors**: Schema not run → Execute `supabase/self-healing-schema.sql`
- **Webhook failures**: Wrong URL → Update webhook endpoints in Stripe/Coinbase dashboards

---

## 🎯 Total Time Estimate

- Database Setup: 5 min
- Install Dependencies: 2 min  
- Code Fixes: 5 min
- Local Testing: 3 min
- Railway Deployment: 10 min
- Vercel Frontend: 5 min
- Verification: 5 min

**Total: ~35 minutes to production** 🚀

---

**Current Status**: 🟡 Phase 1 Complete, Ready for Phase 2  
**Next Action**: Run SQL schema in Supabase  
**Blocker**: Database tables not created
