# Mico Governance System - Implementation Complete ⚡

## Overview
Complete implementation of Mico's (Microsoft Copilot's) enhanced capabilities and authorities inside Fortheweebs. This system gives Mico runtime governance controls, immutable decision tracking, and real-time visibility into all AI agent operations.

## What Was Implemented

### 1. Database Migrations ✅
- **006_governance_notary.sql** - Immutable authority trail
  - Tracks every override, escalation, and decision made by Mico
  - Action types: threshold_override, policy_escalation, emergency_action, authority_grant, authority_revoke, guard_mode_toggle, manual_review

- **007_policy_overrides.sql** - Runtime governance controls
  - Policy overrides table for live threshold/cap adjustments
  - Priority lanes for content processing (CSAM detection, violence extreme, trusted creators, new users)
  - Admin caps to limit superpowers and ensure oversight

### 2. Backend Services (TypeScript) ✅

#### governanceNotary.ts
- `inscribeDecision()` - Immutable recording of governance actions
- `queryGovernanceHistory()` - Query governance decisions with filters
- `getGovernanceSummary()` - Dashboard stats (24hr default)
- `getAuditTrail()` - Entity-specific audit trails

#### policyOverrides.ts
- `setOverride()` / `getOverride()` / `getAllOverrides()` - Policy management
- `getModerationThreshold()` / `setModerationThreshold()` - Runtime threshold control
- `getPriorityLanes()` / `checkPriorityLane()` - Priority lane management
- `pausePriorityLane()` / `resumePriorityLane()` - Lane controls
- `checkAdminCap()` - Admin superpower enforcement

#### moderationService.ts (Updated) ✅
- Integrated policy override lookups for thresholds
- Now uses `getModerationThreshold()` instead of hardcoded values
- Priority lane checking for content routing

### 3. API Routes ✅
**api/governance.js** - Complete REST API for Mico's governance

#### Governance Notary Endpoints:
- `GET /api/governance/notary/history` - Query governance history
- `GET /api/governance/notary/summary` - Get summary stats
- `GET /api/governance/notary/audit/:entityType/:entityId` - Entity audit trail
- `POST /api/governance/notary/inscribe` - Inscribe new decision

#### Policy Override Endpoints:
- `GET /api/governance/overrides` - Get all active overrides
- `GET /api/governance/overrides/:key` - Get specific override
- `POST /api/governance/overrides` - Set policy override
- `DELETE /api/governance/overrides/:key` - Deactivate override
- `POST /api/governance/threshold` - Set moderation threshold

#### Priority Lane Endpoints:
- `GET /api/governance/lanes` - Get all priority lanes
- `POST /api/governance/lanes/:name/pause` - Pause a lane
- `POST /api/governance/lanes/:name/resume` - Resume a lane

#### Artifact Streaming Endpoints:
- `GET /api/governance/artifacts/stream` - **SSE stream** for real-time artifacts
- `GET /api/governance/artifacts/recent` - Get recent 50 artifacts

### 4. Frontend Components ✅

#### DockedConsole.jsx
Real-time governance visibility component with:
- **SSE streaming** connection for live artifact updates
- Three tabs: Artifacts, Governance, Overrides
- Neon console aesthetic with glow animations
- Minimizable widget (bottom-right corner)
- Auto-reconnect on connection loss

#### DockedConsole.css
- Cyberpunk/neon styling with glowing borders
- Smooth animations and transitions
- Responsive design (mobile-friendly)
- Color-coded authority badges (read/suggest/act/enforce)
- Scrollable lists with custom scrollbar

### 5. Integration ✅
- **AdminPanel.jsx** - DockedConsole integrated into admin panel
- **server.js** - Governance API route mounted as `/api/governance`

## Default Priority Lanes

1. **csam_detection** (Priority 10 - HIGHEST)
   - Auto-action: remove
   - No human review needed
   - Notify NCMEC automatically

2. **violence_extreme** (Priority 8)
   - Auto-action: hide
   - Requires human review
   - Escalates to admin

3. **new_user** (Priority 7)
   - Account age < 24 hours
   - Auto-action: hide
   - Stricter thresholds applied

4. **trusted_creator** (Priority 3)
   - Verified creators with clean history
   - No auto-action
   - Fast-track processing

## Mico's Authority Powers

### What Mico Can Do:
1. **Set runtime thresholds** - Adjust moderation sensitivity without redeploy
2. **Pause/resume priority lanes** - Control content routing
3. **Inscribe governance decisions** - Create immutable audit trail
4. **Override policies** - Temporary or permanent policy changes
5. **View real-time artifacts** - Monitor all AI agent activity
6. **Cap admin superpowers** - Enforce limits on admin actions

### Authority Levels:
- **READ** - Can observe and report
- **SUGGEST** - Can recommend actions
- **ACT** - Can execute non-critical actions
- **ENFORCE** - Can execute critical actions (remove/ban)

## Example API Usage

### Set a moderation threshold:
```bash
curl -X POST http://localhost:3001/api/governance/threshold \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "post",
    "flagType": "violence",
    "threshold": 0.65,
    "reason": "Lowering threshold before major event",
    "setBy": "mico"
  }'
```

### Inscribe a governance decision:
```bash
curl -X POST http://localhost:3001/api/governance/notary/inscribe \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "threshold_override",
    "justification": "Emergency response to spike in violent content",
    "authorizedBy": "mico",
    "beforeState": {"threshold": 0.75},
    "afterState": {"threshold": 0.65}
  }'
```

### Pause a priority lane:
```bash
curl -X POST http://localhost:3001/api/governance/lanes/trusted_creator/pause \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Investigating abuse of trusted status"
  }'
```

## Deployment Steps

### 1. Run Database Migrations
```bash
# In Supabase dashboard or via CLI:
psql -f supabase/migrations/006_governance_notary.sql
psql -f supabase/migrations/007_policy_overrides.sql
```

### 2. Install Dependencies
```bash
npm install --save-dev @types/node
```

### 3. Set Environment Variables
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
```

### 4. Compile TypeScript (Optional)
```bash
npm run build:agents
```
Or run with ts-node:
```bash
npm install -g ts-node
```

### 5. Start Server
```bash
npm run dev:server  # Development
# or
npm run server      # Production
```

### 6. Verify Installation
- Visit admin panel: `http://localhost:3002/admin`
- Check for DockedConsole in bottom-right corner
- Click to expand and verify SSE connection (green "Live" indicator)
- Check server logs for: `✅ Mico Governance (Notary + Policy Overrides)`

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                 Fortheweebs Frontend                 │
│  ┌──────────────────────────────────────────────┐   │
│  │          AdminPanel.jsx                       │   │
│  │   ┌──────────────────────────────────────┐   │   │
│  │   │     DockedConsole.jsx                 │   │   │
│  │   │  • SSE Stream (artifacts)             │   │   │
│  │   │  • Governance Records                 │   │   │
│  │   │  • Policy Overrides                   │   │   │
│  │   └──────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────┘
                  │ HTTP/SSE
                  ▼
┌─────────────────────────────────────────────────────┐
│              Express.js Backend                      │
│  ┌──────────────────────────────────────────────┐   │
│  │        /api/governance (governance.js)        │   │
│  │  • Notary endpoints                           │   │
│  │  • Override endpoints                         │   │
│  │  • Lane endpoints                             │   │
│  │  • SSE artifact stream                        │   │
│  └────────┬─────────────────────────────────────┘   │
└───────────┼─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────┐
│          TypeScript Agent Services                   │
│  ┌──────────────────────────────────────────────┐   │
│  │  governanceNotary.ts                          │   │
│  │  • inscribeDecision()                         │   │
│  │  • queryGovernanceHistory()                   │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  policyOverrides.ts                           │   │
│  │  • setOverride() / getOverride()              │   │
│  │  • getModerationThreshold()                   │   │
│  │  • checkPriorityLane()                        │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │  moderationService.ts (updated)               │   │
│  │  • Uses policy overrides for thresholds       │   │
│  │  • Priority lane routing                      │   │
│  └──────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              Supabase PostgreSQL                     │
│  • governance_notary (immutable log)                 │
│  • policy_overrides (runtime config)                 │
│  • priority_lanes (content routing)                  │
│  • admin_caps (superpower limits)                    │
│  • artifact_log (agent actions)                      │
│  • moderation_flags (content flags)                  │
│  • moderation_thresholds (default thresholds)        │
└─────────────────────────────────────────────────────┘
```

## Files Created/Modified

### New Files:
- `supabase/migrations/006_governance_notary.sql`
- `supabase/migrations/007_policy_overrides.sql`
- `api/agents/governanceNotary.ts`
- `api/agents/policyOverrides.ts`
- `api/governance.js`
- `src/components/DockedConsole.jsx`
- `src/components/DockedConsole.css`
- `tsconfig.agents.json`
- `MICO_GOVERNANCE_IMPLEMENTATION.md` (this file)

### Modified Files:
- `api/agents/moderationService.ts` - Added policy override integration
- `src/components/AdminPanel.jsx` - Added DockedConsole component
- `server.js` - Mounted governance API routes
- `package.json` - Added `build:agents` script

## Next Steps (Optional Enhancements)

1. **Command Panel** - Allow live overrides directly from DockedConsole UI
2. **Alert System** - Push notifications for critical governance actions
3. **Analytics Dashboard** - Visualize governance trends over time
4. **Rollback Mechanism** - One-click rollback of policy overrides
5. **Governance Templates** - Pre-configured override sets for common scenarios
6. **Multi-tenancy** - Support multiple Mico instances with isolated governance

## Testing Checklist

- [ ] Database migrations applied successfully
- [ ] TypeScript modules compile without errors
- [ ] Server starts and governance routes load
- [ ] DockedConsole appears in admin panel
- [ ] SSE connection establishes (green "Live" indicator)
- [ ] Can view artifacts in real-time
- [ ] Can view governance history
- [ ] Can view active overrides
- [ ] API endpoints respond correctly
- [ ] Moderation service uses policy overrides

## Troubleshooting

### TypeScript compilation errors
- Install @types/node: `npm install --save-dev @types/node`
- Or use ts-node to run without compilation: `npm install -g ts-node`

### SSE connection fails
- Check CORS settings in server.js
- Verify API_BASE URL in DockedConsole.jsx matches server
- Check browser console for errors

### Governance routes not loading
- Check server.js logs for route loading errors
- Verify `api/governance.js` exists and exports a router
- Check for TypeScript module import errors

### DockedConsole not appearing
- Verify DockedConsole imported in AdminPanel.jsx
- Check browser console for React errors
- Ensure DockedConsole.css is imported

## Support

For issues or questions about Mico's governance system:
1. Check server logs for detailed error messages
2. Verify all migrations ran successfully
3. Test API endpoints with curl/Postman
4. Check browser console for frontend errors

---

**Status**: ✅ Implementation Complete
**Authority**: Mico (Microsoft Copilot)
**Deployed**: 2025-01-24
**Version**: 1.0.0

🚀 Mico now has full governance authority over Fortheweebs AI manpower!
