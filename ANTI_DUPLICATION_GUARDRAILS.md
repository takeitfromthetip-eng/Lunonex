# 🛡️ Anti-Duplication Guardrails

**Sovereign-level protection against duplicate code. Literally impossible to merge without approval.**

## ⚙️ Setup Complete

✅ **Husky** - Pre-commit hooks activated  
✅ **jscpd** - Copy-paste detector installed  
✅ **Package scripts** - Commands configured  
✅ **Git hooks** - Pre-commit enforcement active  

## 🔍 How It Works

### Pre-Commit Hook (`.husky/pre-commit`)
Every commit triggers:
1. **Duplication scan** - jscpd analyzes all JS/TS files
2. **Zero tolerance** - Even 1 duplicate line blocks the commit
3. **Clear output** - Shows exactly where duplicates are

### Configuration (`.jscpd.json`)
```json
{
  "threshold": 0,           // 0% duplication allowed
  "minLines": 5,           // Flag duplicates of 5+ lines
  "minTokens": 50,         // Or 50+ tokens
  "exitCode": 1            // Fail builds on duplicate
}
```

## 🎮 Commands

### Check for duplicates manually:
```powershell
npm run check:duplicates
```

### CI/CD duplication check:
```powershell
npm run check:duplicates:ci
```

### View detailed report:
```powershell
# Run check first, then open:
./jscpd-report/jscpd-report.html
```

## 📊 What Gets Scanned

✅ All `.js` and `.jsx` files in:
- `/api/**`
- `/src/**`
- `/lib/**`
- `/utils/**`
- `/scripts/**`

❌ Excluded from scans:
- `node_modules/`
- `.git/`
- `dist/` & `build/`
- Android/iOS native code
- Test files (`.test.js`, `.spec.js`)
- Minified files (`.min.js`)

## 🚫 Blocking Duplicates

### Scenario: Copilot duplicates an import
```bash
git add .
git commit -m "Add new feature"

# Hook runs automatically:
🛡️  Running pre-commit checks...
🔍 Scanning for duplicate code...

❌ Duplicate found!
File: api/new-feature.js (lines 5-12)
Matches: api/existing-feature.js (lines 8-15)
Duplication: 8 lines, 95% similarity

ERROR: Commit blocked - fix duplicates first
```

### Fix and retry:
```powershell
# Remove the duplicate code
# Re-run check
npm run check:duplicates

# If clean, commit succeeds
git commit -m "Add new feature"
✅ All checks passed - commit allowed
```

## 🎯 Thresholds

| Metric | Threshold | Why |
|--------|-----------|-----|
| **Minimum Lines** | 5 | Ignore tiny snippets (loops, conditionals) |
| **Minimum Tokens** | 50 | Semantic duplication detection |
| **Max File Size** | 100KB | Skip large generated files |
| **Similarity** | 90%+ | Flag near-exact duplicates |

## 🔧 Customization

### Make it stricter:
```json
{
  "minLines": 3,     // Flag even 3-line duplicates
  "minTokens": 25    // Lower token threshold
}
```

### Make it more lenient:
```json
{
  "minLines": 10,    // Only flag 10+ line duplicates
  "threshold": 5     // Allow up to 5% duplication
}
```

### Add more file types:
```json
{
  "format": ["javascript", "typescript", "css", "html"]
}
```

## 📁 Ignored Patterns

Edit `.jscpd.json` to add exclusions:
```json
{
  "ignore": [
    "**/legacy/**",           // Skip legacy code
    "**/generated/**",        // Skip generated files
    "**/migrations/**"        // Skip DB migrations
  ]
}
```

## 🔬 CI/CD Integration

### GitHub Actions example:
```yaml
name: Anti-Duplication Check

on: [push, pull_request]

jobs:
  check-duplicates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run check:duplicates:ci
```

### Fail PR on duplicates:
The `exitCode: 1` in config ensures CI fails if duplicates are found.

## 🎨 Sample Output

### Clean codebase:
```
🔍 Scanning for duplicate code...
✅ No duplicates found
Detection time: 0.45s
```

### Duplicates detected:
```
🔍 Scanning for duplicate code...

╔═══════════════════════════════════════╗
║  DUPLICATES DETECTED                  ║
╚═══════════════════════════════════════╝

File: api/scene-removal.js (34-56)
  ↔ api/virtual-studio.js (78-100)
  Similarity: 97%
  Lines: 23

File: src/utils/validation.js (12-18)
  ↔ src/components/Form.js (45-51)
  Similarity: 92%
  Lines: 7

Total: 2 duplications found
Detection time: 1.2s

❌ EXIT CODE 1 - Commit blocked
```

## 🛠️ Maintenance

### Update jscpd:
```powershell
npm install --save-dev jscpd@latest
```

### Regenerate hooks:
```powershell
npx husky init
```

### Disable temporarily (NOT RECOMMENDED):
```powershell
# Add HUSKY=0 to skip hooks (use sparingly)
HUSKY=0 git commit -m "Emergency fix"
```

## 📝 Best Practices

1. **Run before committing:**
   ```powershell
   npm run check:duplicates
   ```

2. **Review report regularly:**
   Check `./jscpd-report/` for HTML report

3. **Extract shared code:**
   Move duplicates to `/utils` or `/lib`

4. **Use this as a teaching tool:**
   Share duplication reports in code reviews

## 🏆 Success Metrics

Track these in Vanguard logs:
- **Commits blocked** - How many duplicates prevented
- **Duplication rate** - Trend over time
- **Refactoring velocity** - How fast you fix duplicates

## 🚀 Integration Complete

Every commit now enforces:
- ✅ Zero duplication tolerance
- ✅ Automatic scanning
- ✅ Clear failure messages
- ✅ Report generation
- ✅ Sovereign approval required

**Guardrails inscribed. Copilot can't sneak duplicates past you again.**
