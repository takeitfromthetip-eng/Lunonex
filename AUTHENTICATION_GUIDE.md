# 🔐 Authentication Guide - ForTheWeebs

## How to Logout

### Desktop/Web App:
1. **Look in the top-right corner** of your dashboard
2. Click on your **user avatar/name button** (shows 👑 for owner, ⭐ for VIP, or 👤 for regular users)
3. Click **"Logout"** at the bottom of the dropdown menu

### Manual Logout (If Button Missing):
Open browser console (F12) and run:
```javascript
// Clear session
localStorage.clear();
sessionStorage.clear();
window.location.href = '/';
```

---

## How to Create a New Account

### Option 1: Sign Up Through Web Interface

1. **Go to ForTheWeebs website**
   - URL: `https://fortheweebs-2cpc9wi0r-jacobs-projects-eac77986.vercel.app`
   
2. **Click "Sign Up" or "Create Account"**
   - Found on the login page or homepage

3. **Fill in the form:**
   - **Display Name**: Your public username
   - **Email**: Your email address
   - **Password**: At least 6 characters
   - **Confirm Password**: Retype your password

4. **Verify your email**
   - Check inbox for confirmation email from Supabase
   - Click the verification link

5. **Complete onboarding**
   - Accept Terms of Service & Privacy Policy
   - Choose your tier (Free or Paid)
   - Start creating!

### Option 2: Sign Up with Google

1. Click **"Continue with Google"** on signup page
2. Select your Google account
3. Grant permissions
4. Complete onboarding

---

## Account Types

### Owner Account (polotuspossumus@gmail.com)
- 👑 **Full Admin Access**
- 🆓 **All Features FREE**
- ⚡ **No Paywalls**
- 🔧 **Admin Panel Access**

### VIP Accounts (14 slots filled)
- ⭐ **Lifetime VIP Status**
- 🆓 **All Features FREE**
- ⚡ **No Paywalls**
- ❌ **No Admin Access**

### Paid Lifetime VIP (86 slots remaining)
- Pay **$1,000 one-time**
- Get same benefits as free VIPs
- No subscriptions, no creator fees

### Regular Users
- Free tier available
- Paid tiers: $50, $100, $250, $500, $1000
- One-time payments (no subscriptions)

---

## Current Session Info

Check your current login status:

### In Browser Console (F12):
```javascript
// Check logged in email
console.log('Email:', localStorage.getItem('userEmail'));

// Check owner status
console.log('Owner:', localStorage.getItem('ownerEmail'));

// Check tier
console.log('Tier:', localStorage.getItem('userTier'));

// Check user ID
console.log('User ID:', localStorage.getItem('userId'));
```

---

## Troubleshooting

### Can't Log Out?
Run this in console (F12):
```javascript
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

### Want to Switch Accounts?
1. Logout completely (clear localStorage)
2. Go to homepage
3. Click "Sign Up" for new account or "Login" for existing

### Forgot Password?
1. Click "Forgot Password?" on login page
2. Enter your email
3. Check email for reset link
4. Create new password

---

## Social Features (Coming Soon)

When social features launch, you'll be able to:
- Follow other creators
- Comment on posts
- Share content
- Join communities
- Send direct messages

**For now:** Focus on creating content and testing features as the owner!

---

## Quick Commands

### Logout Shortcut:
1. Press `Ctrl+Shift+P` (opens Command Palette)
2. Type "logout"
3. Hit Enter

### Owner Access Restore (if paywalls appear):
```javascript
// Paste in browser console (F12)
localStorage.setItem('userEmail', 'polotuspossumus@gmail.com');
localStorage.setItem('ownerEmail', 'polotuspossumus@gmail.com');
localStorage.setItem('userId', 'owner');
localStorage.setItem('userTier', 'OWNER');
localStorage.setItem('adminAuthenticated', 'true');
location.reload();
```

---

## Next Steps

1. ✅ **Test logout** - Make sure you can log out and back in
2. ✅ **Test features** - Try all the features without paywalls
3. ⏳ **Wait for social features** - Create additional accounts when social launches
4. 🚀 **AI Orchestrator** - Coming in 2-3 weeks (offline AI capabilities)

---

**Need Help?**
- Check UniversalDebugger panel (if visible)
- Look for Mico AI assistant (bottom-right)
- Check browser console for errors (F12)
