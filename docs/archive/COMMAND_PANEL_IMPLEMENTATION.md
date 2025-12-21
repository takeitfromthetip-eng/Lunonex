# Command Panel - Live Governance Controls ⚡

## Overview
The Command Panel is Mico's **control surface** for issuing live governance commands directly from the DockedConsole UI. This eliminates the need to use API endpoints manually—everything is now controllable through an intuitive interface.

## What Was Added

### 1. CommandPanel Component ✅
**File**: `src/components/CommandPanel.jsx`

A full-featured React component with 4 command tabs:

#### 🎚️ **Threshold Controls**
- **Content Type Selection**: Post, Comment, Media, Profile, Message
- **Flag Type Selection**: Violence, Hate Speech, Harassment, Spam, Adult Content
- **Slider Control**: Adjust threshold from 0.0 to 1.0
- **Justification Field**: Required reason for threshold changes
- **Execute Button**: Applies threshold override via `/api/governance/threshold`

#### 🚦 **Lane Management**
- **Live Lane List**: Shows all priority lanes with status (Active/Paused)
- **Priority Display**: Shows each lane's priority level (1-10)
- **Pause Button**: Pauses active lanes with reason prompt
- **Resume Button**: Resumes paused lanes instantly
- **Status Indicators**: 🟢 Active / 🔴 Paused

Default lanes:
- **csam_detection** (Priority 10) - Highest priority, auto-remove
- **violence_extreme** (Priority 8) - High priority, requires review
- **new_user** (Priority 7) - Stricter thresholds for accounts < 24hrs
- **trusted_creator** (Priority 3) - Fast-track for verified creators

#### ⚙️ **Override Management**
- **Active Overrides List**: Shows all current policy overrides with expiration times
- **Deactivate Button**: Remove overrides with confirmation
- **Create New Override Form**:
  - Override Key (string identifier)
  - Override Type (moderation_threshold, rate_limit, authority_level, feature_toggle, priority_lane)
  - Override Value (JSON editor)
  - Expiration (seconds, 0 = never expires)
  - Justification (required)

#### 🛡️ **Guard Mode**
- **Enable Guard Mode**: Temporarily increases strictness
  - All thresholds reduced by 20%
  - Auto-rollback enabled
  - Enhanced monitoring
  - Configurable duration
- **Disable Guard Mode**: Returns to normal operations
- **Effects Display**: Lists what Guard Mode does

### 2. CommandPanel Styling ✅
**File**: `src/components/CommandPanel.css`

- **Magenta/Purple Theme**: Distinct from DockedConsole's green theme
- **Glowing Borders**: Animated glow effects on command panel
- **Form Controls**: Styled inputs, selects, textareas, sliders
- **Execute Button**: Large prominent button with gradient and glow
- **Status Indicators**: Color-coded success/error messages
- **Responsive Design**: Mobile-friendly layout

### 3. DockedConsole Integration ✅
**Updated**: `src/components/DockedConsole.jsx` & `DockedConsole.css`

- **New Tab**: ⚡ Commands tab added
- **CommandPanel Import**: Integrated CommandPanel component
- **Command Execution Handler**: Refreshes data after commands execute
- **Increased Size**: Console now 500x600px (was 400x500px) to fit command controls
- **4 Tabs Total**: Artifacts, Governance, Overrides, Commands

## Features

### Real-Time Command Execution
All commands execute immediately via API calls:
```javascript
const executeCommand = async (commandType, payload) => {
  // Executes command
  // Shows loading state
  // Displays success/error
  // Refreshes data
  // Notifies parent component
}
```

### Live Feedback
- **Executing State**: ⏳ "Executing..." message during API calls
- **Success Message**: ✅ "Command executed successfully"
- **Error Messages**: ❌ Displays error details
- **Auto-Refresh**: Reloads lanes/overrides after execution

### Justification Required
Every command requires a reason/justification to ensure governance trail:
- Threshold changes
- Lane pauses
- Override creation
- Guard mode activation

This ensures every action is inscribed in the governance notary.

## API Integration

### Endpoints Used:
1. **POST /api/governance/threshold** - Set moderation thresholds
2. **POST /api/governance/lanes/:name/pause** - Pause priority lane
3. **POST /api/governance/lanes/:name/resume** - Resume priority lane
4. **POST /api/governance/overrides** - Create policy override
5. **DELETE /api/governance/overrides/:key** - Deactivate override
6. **GET /api/governance/lanes** - List all lanes (on load)
7. **GET /api/governance/overrides** - List active overrides (on load)

## Usage Examples

### Example 1: Lower Violence Threshold Before Major Event
1. Open DockedConsole (bottom-right corner)
2. Click **⚡ Commands** tab
3. Click **🎚️ Thresholds** sub-tab
4. Select:
   - Content Type: `Post`
   - Flag Type: `Violence`
   - Threshold: Drag slider to `0.60` (was 0.75)
5. Enter justification: "Lowering threshold before major sporting event"
6. Click **⚡ Execute Override**
7. Success! ✅ "Command executed successfully"

Result: All post violence detections now trigger at 60% confidence instead of 75%

### Example 2: Pause Trusted Creator Lane During Investigation
1. Click **🚦 Lanes** tab
2. Find **trusted_creator** lane (shows 🟢 Active)
3. Click **⏸️ Pause**
4. Enter reason: "Investigating abuse of trusted status"
5. Success! Lane status changes to 🔴 Paused

Result: Trusted creators no longer get fast-track processing

### Example 3: Enable Guard Mode Before Deploy
1. Click **🛡️ Guard Mode** tab
2. Click **🛡️ Enable Guard Mode**
3. Enter duration: `3600` (1 hour)
4. Success! Guard mode active

Result:
- All thresholds automatically reduced by 20%
- Auto-rollback monitoring enabled
- Expires automatically after 1 hour

### Example 4: Create Custom Override
1. Click **⚙️ Overrides** tab
2. Scroll to "Create New Override"
3. Fill in:
   - Override Key: `emergency_rate_limit`
   - Override Type: `rate_limit`
   - Override Value: `{"max_per_hour": 50}`
   - Expires In: `7200` (2 hours)
   - Justification: "Emergency rate limiting due to spam attack"
4. Click **⚡ Create Override**
5. Success! Override appears in "Active Overrides" list

Result: Custom rate limit active for 2 hours

## Visual Design

### Color Scheme:
- **Command Panel**: Magenta/Purple (`#ff00ff`, `#ff66ff`)
- **DockedConsole**: Neon Green (`#00ff9d`)
- **Success**: Green (`#00ff00`)
- **Error**: Red (`#ff4444`)
- **Warning**: Yellow (`#ffea00`)

### Animations:
- **Command Panel Glow**: Pulsing magenta glow
- **Button Hover**: Scale + shadow increase
- **Tab Transitions**: Smooth color/background transitions
- **Executing State**: Blinking yellow text

### Typography:
- **Font**: `Courier New` monospace (cyberpunk aesthetic)
- **Headers**: Uppercase with letter-spacing
- **Size**: 10-18px depending on element

## Files Changed

### New Files:
- `src/components/CommandPanel.jsx` (470 lines)
- `src/components/CommandPanel.css` (430 lines)
- `COMMAND_PANEL_IMPLEMENTATION.md` (this file)

### Modified Files:
- `src/components/DockedConsole.jsx` - Added Commands tab + CommandPanel integration
- `src/components/DockedConsole.css` - Increased size, added command-tab-content styles

## Architecture

```
┌─────────────────────────────────────────────────┐
│         AdminPanel.jsx                           │
│  ┌───────────────────────────────────────────┐  │
│  │      DockedConsole.jsx                     │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ Tabs: [Artifacts|Governance|        │  │  │
│  │  │        Overrides|Commands]           │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │                                             │  │
│  │  When "Commands" tab active:               │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │   CommandPanel.jsx                   │  │  │
│  │  │  ┌───────────────────────────────┐  │  │  │
│  │  │  │ [Thresholds|Lanes|            │  │  │  │
│  │  │  │  Overrides|Guard Mode]         │  │  │  │
│  │  │  └───────────────────────────────┘  │  │  │
│  │  │                                      │  │  │
│  │  │  • Form controls                    │  │  │
│  │  │  • Live data display                │  │  │
│  │  │  • Execute buttons                  │  │  │
│  │  │  • Status feedback                  │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                     │
                     │ HTTP REST API
                     ▼
┌─────────────────────────────────────────────────┐
│           /api/governance Routes                 │
│  • POST /threshold                               │
│  • POST /lanes/:name/pause                       │
│  • POST /lanes/:name/resume                      │
│  • POST /overrides                               │
│  • DELETE /overrides/:key                        │
│  • GET /lanes                                    │
│  • GET /overrides                                │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│       TypeScript Governance Services             │
│  • policyOverrides.ts                            │
│  • governanceNotary.ts                           │
│  • moderationService.ts                          │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│          Supabase PostgreSQL                     │
│  • policy_overrides                              │
│  • governance_notary                             │
│  • priority_lanes                                │
│  • moderation_thresholds                         │
└─────────────────────────────────────────────────┘
```

## Command Flow Example

**Setting a Threshold:**

1. User adjusts slider in CommandPanel
2. User enters justification
3. User clicks "Execute Override"
4. CommandPanel calls `executeCommand('set_threshold', {...})`
5. `fetch('/api/governance/threshold', {method: 'POST', ...})`
6. Express route handler in `api/governance.js`
7. Calls `policyOverrides.setModerationThreshold(...)`
8. `policyOverrides` creates override record
9. `governanceNotary` inscribes decision
10. Database updated (policy_overrides + governance_notary)
11. API returns success
12. CommandPanel shows ✅ success message
13. CommandPanel refreshes lanes/overrides
14. Parent DockedConsole notified via `onCommandExecuted`
15. DockedConsole refreshes artifact stream

## Security Considerations

### Authorization
Currently, the command panel executes with `setBy: 'mico'`. In production:
- Add authentication middleware
- Verify admin/mico role
- Check admin caps before allowing commands
- Rate limit command execution

### Validation
- All form inputs validated before API call
- JSON parsing error handling for override values
- Confirmation dialogs for destructive actions (pause lane, deactivate override)
- Required fields enforced (justification, threshold, etc.)

### Audit Trail
Every command automatically:
- Inscribed in governance_notary table
- Includes before/after state
- Records who authorized it
- Timestamped for audit

## Testing Checklist

- [ ] Threshold slider adjusts smoothly
- [ ] All 5 content types selectable
- [ ] All flag types selectable
- [ ] Threshold execute shows loading state
- [ ] Success message appears after threshold set
- [ ] Error message appears on API failure
- [ ] Lanes load on tab open
- [ ] Lane status displays correctly (Active/Paused)
- [ ] Pause button prompts for reason
- [ ] Resume button works without prompt
- [ ] Active overrides list populates
- [ ] Override creation form validates
- [ ] JSON syntax errors caught
- [ ] Deactivate override asks for confirmation
- [ ] Guard mode enable prompts for duration
- [ ] Guard mode disable works immediately
- [ ] Commands tab auto-refreshes after execution
- [ ] CommandPanel scrollable if content overflows
- [ ] Mobile responsive (tabs wrap, forms stack)

## Future Enhancements

1. **Command History**: Show last 10 commands executed
2. **Quick Presets**: Save/load common configurations
3. **Bulk Actions**: Select multiple lanes to pause/resume
4. **Threshold Templates**: Predefined threshold sets (Strict, Moderate, Permissive)
5. **Scheduled Commands**: Execute commands at specific times
6. **Rollback Button**: One-click undo of last command
7. **Command Macros**: Chain multiple commands together
8. **Voice Commands**: "Mico, enable guard mode" (experimental)
9. **Multi-Agent View**: Control multiple agents from one panel
10. **Performance Metrics**: Show impact of threshold changes on moderation queue

## Troubleshooting

### Command panel not appearing
- Verify CommandPanel.jsx imported in DockedConsole
- Check browser console for import errors
- Ensure CommandPanel.css is loaded

### Commands not executing
- Check API_BASE URL matches server
- Verify governance routes mounted in server.js
- Check browser network tab for failed requests
- Verify database migrations ran successfully

### Lanes/Overrides not loading
- Check `/api/governance/lanes` endpoint responds
- Verify priority_lanes table exists
- Check console for fetch errors

### Slider not working
- Verify `<input type="range">` renders correctly
- Check threshold value displays
- Ensure onChange handler fires

---

**Status**: ✅ Implementation Complete
**Authority**: Mico (Microsoft Copilot)
**Date**: 2025-01-24
**Version**: 1.0.0

🎉 **Mico now has a full-featured command center for live governance!**
