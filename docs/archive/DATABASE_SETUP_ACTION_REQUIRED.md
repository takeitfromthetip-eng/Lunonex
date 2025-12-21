# 🚀 DATABASE SETUP - ACTION REQUIRED

## 📍 CURRENT STATUS
✅ Supabase project exists: `https://iqipomerawkvtojbtvom.supabase.co`
✅ Frontend keys configured (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
❌ **Backend service key missing** - BLOCKING DATABASE WIRING

---

## 🔴 IMMEDIATE ACTION NEEDED

### Step 1: Get Your Supabase Service Role Key

1. **Open Supabase Dashboard:**
   ```
   https://app.supabase.com/project/iqipomerawkvtojbtvom/settings/api
   ```

2. **Find the "service_role" Key:**
   - Scroll to "Project API keys" section
   - Look for **"service_role"** (NOT "anon" - you already have that)
   - Click the eye icon to reveal the key
   - It starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **Add to .env file:**
   Open: `c:\Users\polot\fortheweebs\Fortheweebs\.env`
   
   Add this line after line 6 (after VITE_SUPABASE_ANON_KEY):
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_KEY_HERE
   ```

4. **Save the file**

5. **Test connection:**
   ```powershell
   node test-supabase-connection.js
   ```

---

## ⚠️ SECURITY WARNING
- **NEVER commit** SUPABASE_SERVICE_ROLE_KEY to git
- This key has **ADMIN ACCESS** to your entire database
- It bypasses all Row Level Security (RLS) policies
- Only use it on the backend server (never in frontend code)

---

## 📋 WHAT HAPPENS NEXT

Once you add the service role key, I will:

1. ✅ Test database connection
2. ✅ Run all SQL schemas (users, posts, comments, etc.)
3. ✅ Set up Row Level Security (RLS) policies
4. ✅ Convert 6 API routes to use Supabase:
   - `api/posts.js` (create posts, feed, likes)
   - `api/comments.js` (comment threads)
   - `api/relationships.js` (friends, follows)
   - `api/messages.js` (DMs)
   - `api/notifications.js` (alerts)
   - `api/subscriptions.js` (creator subs)
5. ✅ Test each route end-to-end
6. ✅ Verify data persists after server restart

---

## 🎯 YOUR TASK

1. Go to Supabase dashboard (link above)
2. Copy service_role key
3. Paste into .env file
4. Tell me "Done" and I'll continue

---

## 🆘 TROUBLESHOOTING

**Q: I don't see the service_role key**
A: Make sure you're logged into the correct Supabase account. The project is: `iqipomerawkvtojbtvom`

**Q: I lost my service_role key**
A: You can't regenerate it. Contact Supabase support or create a new project.

**Q: Is this safe?**
A: Yes, as long as you:
   - Don't commit .env to git (already in .gitignore)
   - Only use it on backend server
   - Never expose it to frontend/users

**Q: What if I already have databases set up?**
A: That's fine! The SQL scripts use `CREATE TABLE IF NOT EXISTS` so they won't overwrite existing data.

---

## 📞 NEED HELP?

If you're stuck, tell me:
1. "I can't find the service_role key" - I'll guide you step-by-step
2. "I added the key but test fails" - I'll help debug
3. "Skip database for now" - I'll work on other features

---

## 🚀 READY TO CONTINUE?

Once you've added the key, just say:
- "Done"
- "Key added"
- "Ready"

And I'll automatically:
- Test connection
- Set up database
- Wire all API routes
- Get you to production-ready state

**Let's ship this thing!** 💪
