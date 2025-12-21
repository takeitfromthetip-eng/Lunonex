# ForTheWeebs - Sovereign Creator Platform

A creator-first platform built with React, Vite, Supabase, and Stripe.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account

### Installation

```bash
# Install dependencies
npm install

# Start development servers (frontend + backend)
npm run dev:all

# Or run separately:
npm run dev        # Frontend only (port 3000)
npm run dev:server # Backend only (port 3001)
```

### Build for Production

```bash
npm run build
npm run server
```

## 📋 Configuration

All configuration is in `.env` file:

### Required (Already Configured)
- ✅ Supabase (database & auth)
- ✅ Firebase (file storage & analytics)
- ✅ Stripe (payments)
- ✅ Claude API (Mico AI assistant)
- ✅ OpenAI API (content generation)
- ✅ GitHub (auto-deploy)

### Admin Access
- **Username:** `polotuspossumus`
- **Password:** `Scorpio#96`

### Optional Setup
- Set `OWNER_USER_ID` in `.env` to your Supabase user ID for 0% platform fees

## 🏗️ Architecture

```
src/
├── components/       React components
├── routes/          API endpoints
├── utils/           Helper functions
├── lib/             External service clients
public/              Static assets
api/                 Backend API routes
server.js            Express server
```

## 💳 Payment System

- **Stripe** handles all payments including crypto
- Tiered subscriptions: $50, $100, $250, $500, $1000/month
- Adult content access: $50/month
- Creator payouts via Stripe Connect
- Platform takes 10% (0% for owner)

## 🤖 AI Features

- **Mico**: AI assistant powered by Claude
- **Bug Reports**: Auto-triaged by AI
- **Content Moderation**: AI-powered safety filters
- **DMCA Handling**: Automated takedown processing

## 📱 Mobile Apps

```bash
# Build Android APK
npm run android:build

# Build Android release
npm run android:release

# Build Android App Bundle
npm run android:bundle
```

## 🔒 Security

- Data privacy enforcement (user data selling is BLOCKED)
- Age verification for adult content
- DMCA compliance with auto-takedown
- Rate limiting on all APIs
- Strike system for violations

## 📊 Database

Using Supabase PostgreSQL. SQL schemas are in `archive/sql/`

Key tables:
- `users` - User accounts
- `content` - Uploaded content
- `subscriptions` - Stripe subscriptions
- `payments` - Payment history
- `bug_reports` - User-submitted bugs
- `admin_alerts` - System notifications

## 🛠️ Development

```bash
npm run lint        # Run ESLint
npm run test        # Run tests
npm run analyze     # Analyze bundle size
```

## 📚 Documentation

Additional guides in `archive/docs/`:
- Payment system setup
- Stripe webhook configuration
- Mobile app deployment
- Security & compliance

## 🎯 Production Checklist

- [x] Environment variables configured
- [x] Stripe webhooks set up
- [x] Database tables created
- [x] Build completes successfully
- [x] Admin credentials set
- [ ] Set your `OWNER_USER_ID` in `.env`
- [ ] Deploy to production host
- [ ] Point domain to server
- [ ] Enable SSL certificate

## 🐛 Issues?

Check server logs or submit via in-app bug reporter (auto-triaged by Mico AI).

## 📄 License

MIT License - See LICENSE file

---

Built with ❤️ by Jacob Morris
