# 🖥️ Monitoring Slab - Supabase Integration Guide

Complete integration guide for streaming live resource stats into Supabase for governance console visualization.

## Quick Start

```bash
# Install dependencies
npm install @supabase/supabase-js

# Set environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your_service_role_key_here"

# Run monitoring
npx ts-node utils/monitoringSlab.ts
```

## Features

✅ **Resource Sampling** - Every 5 seconds: CPU, RAM, swap, disk, FD count  
✅ **Sentinel Events** - Auto-detect threshold breaches (memory >80%, CPU >85%, etc.)  
✅ **Crash Artifacts** - Immortalize every system failure with full state snapshot  
✅ **Supabase Storage** - All data stored in `resource_samples`, `sentinel_events`, `crash_artifacts` tables  
✅ **Realtime Updates** - Governance console can subscribe to live changes  

## Database Schema

Apply the migration first:

```bash
supabase db push
```

This creates:

- `resource_samples` - System heartbeat (CPU, RAM, swap, FD, disk)
- `sentinel_events` - Threshold breach warnings
- `crash_artifacts` - Complete crash state snapshots
- 4 views for easy querying
- `check_sentinel_thresholds()` function for auto-detection

## GitHub Actions Integration

Add to your workflow:

```yaml
env:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
  NODE_ENV: production
  CI: true

jobs:
  build:
    steps:
      - name: 🖥️ Start Monitoring
        run: |
          npx ts-node utils/monitoringSlab.ts &
          echo $! > monitoring.pid

      - name: 📦 Install & Build
        run: |
          npm install --legacy-peer-deps
          npm run build

      - name: 🛑 Stop Monitoring
        if: always()
        run: kill $(cat monitoring.pid) || true

      - name: 💀 Log Crash
        if: failure()
        run: |
          npx ts-node -e "
            import { logCrashArtifact } from './utils/monitoringSlab';
            await logCrashArtifact('build_timeout', undefined, 1, 'Build failed');
          "
```

## Required Secrets

Add to GitHub repository settings:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Service role key (bypasses RLS)

Get these from: Supabase Dashboard → Project Settings → API

## Querying Artifacts

```sql
-- Recent samples (last 10 min)
SELECT * FROM recent_resource_samples;

-- Active warnings
SELECT * FROM active_sentinels WHERE severity = 'critical';

-- Recent crashes
SELECT * FROM recent_crashes;

-- System health (1 hour aggregate)
SELECT * FROM system_health_summary;
```

## Governance Console Integration

Subscribe to Realtime updates:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Live resource samples
supabase
  .channel('resource-monitoring')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'resource_samples'
  }, (payload) => {
    console.log('New sample:', payload.new)
    updateCharts(payload.new)
  })
  .subscribe()

// Live sentinel events
supabase
  .channel('sentinels')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'sentinel_events'
  }, (payload) => {
    console.warn('Threshold breached:', payload.new)
    showAlert(payload.new)
  })
  .subscribe()
```

## Thresholds

Default thresholds (configurable in `utils/monitoringSlab.ts`):

- **Memory**: 80% warning, 90% critical, 95% fatal
- **CPU**: 85% warning, 95% critical
- **Swap**: 60% warning, 80% critical
- **File Descriptors**: 30k warning, 50k critical

## Local Development

Monitoring runs automatically when:

1. Module imported: `import { startMonitoring } from './utils/monitoringSlab'`
2. Executed directly: `npx ts-node utils/monitoringSlab.ts`
3. Wrapped command: `./scripts/monitor-with-logging.sh npm install`

## Benefits

🎯 **No more guessing** - Every build has full resource timeline  
📊 **Visual governance** - See exactly when/why things fail  
🔍 **Root cause analysis** - Stack traces + system state in one place  
📈 **Performance trends** - Historical data for optimization  
💀 **Immortalized crashes** - Every failure becomes part of the mythic legacy  

## Next Steps

1. ✅ Apply Supabase migration (`supabase db push`)
2. ✅ Add secrets to GitHub repository
3. ✅ Update GitHub Actions workflow
4. ✅ Build governance console UI
5. ✅ Test end-to-end monitoring flow
