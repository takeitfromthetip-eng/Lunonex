# 🚀 Deployment Checklist - Mico Governance System

## ✅ Pre-Deployment Verification

### 1. Environment Setup
```bash
# Required Environment Variables
✅ SUPABASE_URL              # Your Supabase project URL
✅ SUPABASE_SERVICE_KEY      # Supabase service role key (not anon key!)
✅ OPENAI_API_KEY            # OpenAI API key for moderation
✅ VITE_API_URL              # Frontend API URL (http://localhost:3001 for dev)
✅ PORT                      # Server port (default: 3001)
✅ NODE_ENV                  # 'development' or 'production'
```

**Check your .env file has all of these!**

---

### 2. Database Migrations ⚠️ CRITICAL

Run these migrations IN ORDER in your Supabase SQL Editor:

```sql
-- STEP 1: Run existing migrations (if not already done)
-- supabase/migrations/001_artifact_log.sql
-- supabase/migrations/002_moderation_sentinels.sql
-- supabase/migrations/003_support_intake.sql
-- supabase/migrations/004_entitlements.sql
-- supabase/migrations/005_release_marshal.sql

-- STEP 2: Run NEW governance migrations
-- supabase/migrations/006_governance_notary.sql
-- supabase/migrations/007_policy_overrides.sql
```

**Verify migrations ran successfully**:
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'governance_notary',
  'policy_overrides',
  'priority_lanes',
  'admin_caps'
);
-- Should return 4 rows
```

---

### 3. Dependencies Check

```bash
# All critical dependencies installed
✅ @supabase/supabase-js@2.81.1
✅ openai@4.104.0
✅ express@4.21.2
✅ cors@2.8.5
✅ dotenv@16.6.1
✅ @types/node (dev dependency)

# If any missing:
npm install
```

---

### 4. Server Startup Test

```bash
# Test backend starts without errors
npm run dev:server

# Expected output:
# ✅ Stripe
# ✅ Mico AI
# ✅ AI CSAM Moderation
# ✅ Mico Governance (Notary + Policy Overrides)  <-- IMPORTANT!
# ✅ Server started successfully!
```

**If you see**: `Failed to load governance modules: supabaseUrl is required.`
→ **Check your .env file has SUPABASE_URL and SUPABASE_SERVICE_KEY**

---

### 5. Frontend Build Test

```bash
# Test frontend builds
npm run build

# Should complete without errors
# Check dist/ folder is created
```

---

## 🎯 Deployment Steps

### Option A: Development (Local)

```bash
# Terminal 1 - Backend
npm run dev:server
# Wait for: ✅ Server started successfully!

# Terminal 2 - Frontend
npm run dev
# Wait for: Local: http://localhost:3002

# Open browser: http://localhost:3002/admin
# Look for DockedConsole in bottom-right corner
```

### Option B: Production (Railway/Netlify)

#### Backend (Railway):
```bash
# 1. Push to GitHub (already done ✅)
git push origin main

# 2. In Railway dashboard:
- Connect GitHub repo
- Set environment variables (all from .env)
- Deploy automatically triggered
- Check logs for: ✅ Server started successfully!
```

#### Frontend (Netlify):
```bash
# 1. Connect repo in Netlify dashboard
# 2. Build settings:
Build command: npm run build
Publish directory: dist
# 3. Environment variables:
VITE_API_URL=https://your-railway-app.railway.app
# 4. Deploy
```

---

## 🧪 Post-Deployment Tests

### Test 1: Server Health
```bash
curl http://localhost:3001/health
# Expected: {"status":"OK","timestamp":"...","environment":"development"}
```

### Test 2: Governance API
```bash
# Test artifacts endpoint
curl http://localhost:3001/api/governance/artifacts/recent
# Expected: {"artifacts":[...],"count":0}  (empty if no artifacts yet)

# Test lanes endpoint
curl http://localhost:3001/api/governance/lanes
# Expected: {"lanes":[{"laneName":"csam_detection",...}],"count":4}
```

### Test 3: Frontend Access
1. Open: `http://localhost:3002/admin`
2. **DockedConsole visible?** ✅ (bottom-right, green glowing box)
3. Click to expand
4. **Shows 🟢 "Live" indicator?** ✅
5. Click **⚡ Commands** tab
6. **CommandPanel loads?** ✅
7. Try adjusting a threshold

### Test 4: SSE Connection
1. Open browser DevTools → Network tab
2. Look for connection to `/api/governance/artifacts/stream`
3. Type: `eventsource`
4. Status: `200` (pending/active)
5. **SSE connected!** ✅

### Test 5: Database Writes
```sql
-- Check governance_notary table has policies
SELECT COUNT(*) FROM governance_notary;

-- Check priority_lanes has 4 default lanes
SELECT COUNT(*) FROM priority_lanes;
-- Should return 4

-- Check lanes are correct
SELECT lane_name, priority_level, active
FROM priority_lanes
ORDER BY priority_level DESC;
-- Should show: csam_detection, violence_extreme, new_user, trusted_creator
```

---

## 🐛 Troubleshooting

### Issue: "Failed to load governance modules"
**Cause**: Missing Supabase credentials
**Fix**:
```bash
# Check .env has:
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...  # Long JWT token
```

### Issue: DockedConsole not appearing
**Cause**: AdminPanel not rendering or CSS not loaded
**Fix**:
1. Clear browser cache
2. Check browser console for errors
3. Verify AdminPanel.jsx has `<DockedConsole />` component
4. Check DockedConsole.css is imported

### Issue: SSE shows 🔴 "Offline"
**Cause**: Cannot connect to SSE endpoint
**Fix**:
1. Verify backend is running
2. Check CORS settings in server.js
3. Test endpoint manually: `curl http://localhost:3001/api/governance/artifacts/stream`
4. Check browser console for CORS errors

### Issue: Commands not executing
**Cause**: Database migrations not run or API errors
**Fix**:
1. Check browser Network tab for 500 errors
2. Check server logs for errors
3. Verify migrations ran: `SELECT * FROM governance_notary LIMIT 1;`
4. Check policy_overrides table exists

### Issue: Lanes not loading
**Cause**: priority_lanes table missing or empty
**Fix**:
```sql
-- Check if table exists
SELECT * FROM priority_lanes;

-- If empty, re-run migration 007
-- Or manually insert default lanes
```

---

## 📊 Verification Checklist

Before marking as "deployed":

### Backend
- [ ] Server starts without errors
- [ ] All routes load (24/24 including governance)
- [ ] `/health` endpoint returns 200
- [ ] `/api/governance/lanes` returns 4 lanes
- [ ] `/api/governance/artifacts/recent` returns data
- [ ] TypeScript modules compile (or run with ts-node)

### Database
- [ ] All migrations applied successfully
- [ ] `governance_notary` table exists
- [ ] `policy_overrides` table exists
- [ ] `priority_lanes` table exists and has 4 rows
- [ ] `admin_caps` table exists
- [ ] RLS policies active

### Frontend
- [ ] Build completes without errors
- [ ] Admin panel loads
- [ ] DockedConsole visible in bottom-right
- [ ] SSE connection shows 🟢 "Live"
- [ ] All 4 tabs work (Artifacts, Governance, Overrides, Commands)
- [ ] CommandPanel loads in Commands tab
- [ ] Threshold slider functional
- [ ] Lane controls functional

### Integration
- [ ] Commands execute successfully
- [ ] Success/error messages display
- [ ] Overrides appear in Overrides tab after creation
- [ ] Lanes update status after pause/resume
- [ ] Artifacts stream in real-time
- [ ] Governance notary records created on commands

### Security
- [ ] `.env` not committed to git ✅
- [ ] Service key used (not anon key)
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Data privacy middleware active ✅

---

## 🎉 Success Criteria

**System is READY when**:

✅ Server running without errors
✅ 4 tabs visible in DockedConsole
✅ SSE shows 🟢 "Live" indicator
✅ Can adjust threshold via Commands tab
✅ Override appears in Overrides tab
✅ Can pause/resume lanes
✅ Artifacts stream in real-time
✅ No errors in browser console
✅ No errors in server logs

---

## 📞 Quick Reference

### Start Development
```bash
npm run dev:all
```

### Start Production
```bash
npm run server  # Backend only
# Frontend served by Netlify
```

### View Logs
```bash
# Backend
tail -f server.log

# Frontend (browser console)
# Open DevTools → Console
```

### Test Endpoints
```bash
# Health check
curl http://localhost:3001/health

# Governance lanes
curl http://localhost:3001/api/governance/lanes

# Recent artifacts
curl http://localhost:3001/api/governance/artifacts/recent
```

---

## 🚨 Emergency Rollback

If something goes wrong:

```bash
# Rollback to previous commit
git log --oneline -5  # See commits
git revert 17414a5   # Revert quick start guide
git revert abbc1dd   # Revert governance system
git push origin main

# Or restore from backup
git reset --hard 3a8fdd8  # Before governance changes
git push origin main --force  # ⚠️ DANGEROUS - only if necessary
```

---

## 📚 Documentation Links

- **Quick Start**: `MICO_QUICK_START.md`
- **Full Implementation**: `MICO_COMPLETE_IMPLEMENTATION.md`
- **Backend Details**: `MICO_GOVERNANCE_IMPLEMENTATION.md`
- **Frontend Details**: `COMMAND_PANEL_IMPLEMENTATION.md`

---

**Ready to Deploy?** ✅

Follow this checklist step-by-step, and you'll have Mico's governance system running smoothly!

**Last Updated**: 2025-01-24
**Version**: 1.0.0
**Status**: Production Ready 🚀
