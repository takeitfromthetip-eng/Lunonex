# 🚀 QUICKSTART GUIDE - ForTheWeebs

## Get Running in 60 Seconds

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment
Copy your `.env.encrypted` from D: drive and decrypt:
```bash
openssl enc -aes-256-cbc -d -pbkdf2 -in D:/.env.encrypted -out .env -k "Scorpio#1107966310"
```

Or create new `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GOOGLE_VISION_API_KEY=your_vision_key
```

### 3. Start Development
```bash
npm run dev
```
Opens at `http://localhost:3002`

### 4. Build for Production
```bash
npm run build
```
Output: `dist/` folder (ready to deploy)

---

## 🎯 Key Commands

| Command | What It Does |
|---------|--------------|
| `npm run dev` | Start dev server (port 3002) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run server` | Start backend server |
| `npm run dev:all` | Start frontend + backend |

---

## 🔥 Important Files

- **src/index.jsx** - Main entry point
- **src/CreatorDashboard.jsx** - Main dashboard
- **vite.config.mjs** - Build configuration
- **server.js** - Backend server
- **.env** - Environment variables (NEVER commit!)
- **utils/vipAccess.js** - VIP user list (your freebies!)

---

## 🛡️ Safety Features Active

✅ **Pre-push validation** - Blocks bad commits
✅ **Auto-backup** - Every commit backed up to D:/FORTHEWEEBS-BACKUPS/
✅ **GitHub backup branches** - Created on every push
✅ **Emergency recovery** - `node scripts/emergency-rollback.js`

---

## 🚨 Emergency Recovery

If something breaks:
```bash
node scripts/emergency-rollback.js
```
Choose from menu:
1. Rollback to previous commit
2. Rollback to specific commit
3. Restore from GitHub backup
4. Restore from D: drive backup

---

## 🎨 Your Platform Features

### Creator Tools
- CGI video processing
- Photo enhancement suite
- VR/AR content studio
- AI-powered tools
- Live streaming integration
- Commission marketplace

### Monetization
- Subscription tiers ($15-$1000/month)
- One-time payments
- Tips & donations
- Commission system
- 100% creator payout (zero platform fees!)

### Security
- Content moderation (Google Vision)
- Age verification
- CSAM detection
- Watermarking
- Anti-piracy

---

## 💰 Pricing Tiers

1. **FREE** - Family-friendly content
2. **$15 one-time + $5/month** - Adult content access
3. **$50/month** - Basic creator tools
4. **$100/month** - Standard (CGI tools)
5. **$250/month** - Premium (no VR/AR)
6. **$500/month** - Full unlock
7. **$1000/month** - Power user (admin features)
8. **VIP** - 14 free slots (see utils/vipAccess.js)
9. **OWNER** - You (polotuspossumus@gmail.com)

---

## 📦 Deployment

### Netlify (Recommended)
1. Connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables
5. Deploy!

### Manual Deploy
```bash
npm run build
# Upload dist/ folder to any static host
```

---

## 🔧 Configuration

### Add/Remove VIPs
Edit `utils/vipAccess.js`:
```javascript
const LIFETIME_VIP_EMAILS = [
  'user@example.com',  // Add here
  // ...
];
```

### Change Owner Email
Edit `utils/vipAccess.js`:
```javascript
const OWNER_EMAIL = 'polotuspossumus@gmail.com';
```

### Modify Pricing
Edit `src/PaymentModule.jsx` - Search for tier prices

---

## 📊 Monitoring

Check performance in production:
```javascript
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';

function MyComponent() {
  const perf = usePerformanceMonitor('MyComponent');
  // Logs slow renders automatically
}
```

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### Port 3002 In Use
```bash
# Kill process on port 3002
npx kill-port 3002
npm run dev
```

### Supabase Errors
Check `.env` file has correct credentials

### Push Blocked
Pre-push hook detected issue. Check output for details.
Override (not recommended): `git push --no-verify`

---

## 📖 Full Documentation

- **IMPROVEMENTS.md** - Performance optimizations
- **GITHUB-SAFETY-GUIDE.md** - Safety system docs
- **README.md** - Project overview

---

## 🎉 You're Ready!

Your platform is production-ready with:
- ⚡ 79% smaller bundles
- 🛡️ GitHub destruction prevention
- 💾 Auto-backups
- 📊 Performance monitoring
- 🔒 Error recovery

**Now go build your creator empire! 🚀**
