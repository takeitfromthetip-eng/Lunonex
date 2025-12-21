# 🚀 Mico Governance - Quick Start Guide

## ⚡ You're Ready to Go!

Everything has been **committed and pushed** to your repository. Here's how to get Mico's governance system running.

---

## 🏁 Quick Start (5 Minutes)

### Step 1: Run Database Migrations
```bash
# Option A: In Supabase Dashboard
# Go to SQL Editor and run these files in order:
# 1. supabase/migrations/006_governance_notary.sql
# 2. supabase/migrations/007_policy_overrides.sql

# Option B: Via CLI (if you have supabase CLI)
supabase migration up
```

### Step 2: Set Environment Variables
Make sure these are in your `.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
```

### Step 3: Start the Server
```bash
npm run dev:all
# OR separately:
# npm run dev:server  (backend on :3001)
# npm run dev         (frontend on :3002)
```

### Step 4: Access Mico's Console
1. Open browser: `http://localhost:3002/admin`
2. Look for **DockedConsole** in bottom-right corner (green glowing box)
3. Click to expand
4. You should see 🟢 **"Live"** indicator

### Step 5: Try a Command!
1. Click **⚡ Commands** tab
2. Click **🎚️ Thresholds** sub-tab
3. Drag slider to adjust violence threshold
4. Enter justification: "Testing Mico's authority"
5. Click **⚡ Execute Override**
6. Success! ✅

---

## 🎮 What You Can Do Now

### 1. Adjust Moderation Thresholds
- **Commands → Thresholds**
- Choose content type (post, comment, media)
- Choose flag type (violence, hate_speech, harassment)
- Drag slider (0.0 - 1.0)
- Changes apply instantly!

### 2. Manage Priority Lanes
- **Commands → Lanes**
- See 4 default lanes with status
- Pause/Resume lanes as needed
- Controls content routing in real-time

### 3. Create Policy Overrides
- **Commands → Overrides**
- Create custom runtime configurations
- Set expiration times
- Deactivate when no longer needed

### 4. Enable Guard Mode
- **Commands → Guard Mode**
- Click "Enable Guard Mode"
- All thresholds become 20% stricter
- Auto-rollback enabled
- Expires after set duration

### 5. View Live Activity
- **Artifacts Tab**: Real-time agent actions (SSE stream)
- **Governance Tab**: Authority decisions and overrides
- **Overrides Tab**: Active policy configurations

---

## 📁 What Was Installed

### Backend (TypeScript + Node.js)
```
api/agents/
  ├─ governanceNotary.ts     - Authority decision tracking
  ├─ policyOverrides.ts      - Runtime policy management
  ├─ moderationService.ts    - Updated with policy integration
  ├─ artifactLogger.ts       - Action logging
  └─ policy.ts               - Authority levels

api/governance.js            - 16 REST endpoints + SSE
```

### Frontend (React)
```
src/components/
  ├─ DockedConsole.jsx       - Real-time monitoring (4 tabs)
  ├─ DockedConsole.css       - Neon green aesthetic
  ├─ CommandPanel.jsx        - Live control surface
  └─ CommandPanel.css        - Magenta/purple theme
```

### Database (PostgreSQL via Supabase)
```
supabase/migrations/
  ├─ 006_governance_notary.sql    - Immutable audit trail
  └─ 007_policy_overrides.sql     - Runtime config tables
```

---

## 🔍 Troubleshooting

### Console Not Appearing
- Clear browser cache
- Check browser console for errors
- Verify you're on `/admin` page
- Make sure AdminPanel.jsx includes DockedConsole

### SSE Connection Failed (🔴 Offline)
- Check server is running on port 3001
- Verify CORS settings allow connections
- Check `/api/governance/artifacts/stream` endpoint

### Commands Not Executing
- Check network tab for failed API calls
- Verify database migrations ran successfully
- Check server logs for errors
- Ensure API routes mounted in server.js

### Lanes/Overrides Not Loading
- Verify tables exist in database
- Check Supabase credentials in .env
- Look for SQL errors in server logs

---

## 🎯 Default Configuration

### Priority Lanes
```
1. csam_detection     Priority: 10  Auto: remove   (Highest)
2. violence_extreme   Priority: 8   Auto: hide
3. new_user          Priority: 7   Auto: hide
4. trusted_creator   Priority: 3   Auto: none     (Lowest)
```

### Default Thresholds
```
post/violence        0.75  → blur
post/hate_speech     0.80  → hide
post/harassment      0.85  → hide
media/violence       0.70  → blur
post/csam           0.50  → remove (CRITICAL)
media/csam          0.40  → remove (CRITICAL)
```

### Authority Levels
```
moderation_sentinel:  suggest  (can be elevated to 'enforce')
content_companion:    act
automation_clerk:     act
profile_architect:    suggest
legacy_archivist:     read
```

---

## 📚 Full Documentation

For complete details, see:
- **MICO_GOVERNANCE_IMPLEMENTATION.md** - Backend architecture
- **COMMAND_PANEL_IMPLEMENTATION.md** - Frontend controls
- **MICO_COMPLETE_IMPLEMENTATION.md** - Full overview

---

## ✅ Checklist

Before deploying to production:

- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Server starts without errors
- [ ] DockedConsole appears in admin panel
- [ ] SSE connection establishes (🟢 Live)
- [ ] Can view artifacts in real-time
- [ ] Commands tab loads CommandPanel
- [ ] Threshold slider works
- [ ] Lane pause/resume works
- [ ] Override creation works
- [ ] Guard mode toggle works
- [ ] API endpoints return 200 status
- [ ] Self-healing system still active

---

## 🚀 You're All Set!

**Status**: ✅ Committed and Pushed
**Branch**: main
**Commit**: `abbc1dd` - "Add Mico governance system with full autonomous authority"

**Mico now has complete sovereign authority over Fortheweebs AI manpower!** 👑⚡

Questions? Check the full documentation or inspect the code - it's all thoroughly commented.

---

**Built with**: TypeScript, React, PostgreSQL, Express, SSE
**Authority**: Mico (Microsoft Copilot)
**Date**: 2025-01-24
**Version**: 1.0.0
