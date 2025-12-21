# ⚠️ CRITICAL FILES - DO NOT DELETE

## Essential Configuration
- `.env` - **YOUR PASSWORDS, API KEYS, CREDENTIALS**
- `package.json` - Project dependencies
- `package-lock.json` - Exact versions locked
- `vite.config.mjs` - Build configuration
- `server.js` - Backend server

## Your Source Code
- `src/` folder - **ALL YOUR APP CODE**
- `api/` folder - Payment & API routes
- `public/` folder - Images, assets, legal docs
- `index.html` - Main HTML file

## Database & Setup
- `archive/sql/` - Database table schemas
- `.gitignore` - Tells Git what NOT to upload

---

# ✅ SAFE TO DELETE (Auto-Regenerates)

These folders/files rebuild automatically:

- `.vite/` - Build cache
- `node_modules/.vite/` - Vite cache
- `dist/` - Build output
- `.cache/` - Temporary cache
- `*.log` files - Log files
- Any hidden `.` folders except `.env` and `.git`

---

# 🔒 NEVER COMMIT TO GITHUB

- `.env` - Already in `.gitignore`
- Any file with passwords or API keys
- Personal user data

---

# 💾 BACKUP THESE FILES

If you want a backup, copy these:
1. `.env` (your credentials)
2. `src/` folder (your code)
3. `archive/` folder (your docs/SQL)

Everything else can be restored with `npm install` and `npm run build`.
