# 🚀 Super Easy Migration Guide (2 Minutes)

## What Are Migrations?
Migrations = SQL scripts that create new database tables. Think of it like "installing" the database for Mico.

---

## ✅ Easy 5-Step Process

### Step 1: Open Supabase Dashboard
Click this link:
👉 **https://supabase.com/dashboard/project/iqipomerawkvtojbtvom**

(Or go to https://supabase.com/dashboard and select your "iqipomerawkvtojbtvom" project)

---

### Step 2: Open SQL Editor
On the left sidebar, click:
📝 **"SQL Editor"**

---

### Step 3: Create New Query
Click the button:
➕ **"New query"**

---

### Step 4: Copy/Paste Migration 1

Open this file: `supabase/migrations/006_governance_notary.sql`

Copy **EVERYTHING** from it and paste into the SQL editor.

Then click: ▶️ **"Run"** (or press Ctrl+Enter)

You should see: ✅ **"Success. No rows returned"**

---

### Step 5: Copy/Paste Migration 2

Click ➕ **"New query"** again

Open this file: `supabase/migrations/007_policy_overrides.sql`

Copy **EVERYTHING** from it and paste into the SQL editor.

Then click: ▶️ **"Run"** (or press Ctrl+Enter)

You should see: ✅ **"Success. No rows returned"**

---

## 🎉 Done!

That's it! Your database now has:
- ✅ `governance_notary` table (tracks Mico's decisions)
- ✅ `policy_overrides` table (runtime controls)
- ✅ `priority_lanes` table (content routing)
- ✅ `admin_caps` table (admin limits)

---

## 🚀 Next Step: Start The Server

```bash
npm run dev:all
```

Then open: http://localhost:3002/admin

Look for the **green glowing box** in the bottom-right corner - that's Mico's console!

---

## 📁 Quick File Locations

Migration files are here:
```
C:\Users\polot\OneDrive\Desktop\fortheweebs\supabase\migrations\
  ├─ 006_governance_notary.sql      ← Copy this first
  └─ 007_policy_overrides.sql       ← Copy this second
```

---

## 🆘 If Something Goes Wrong

### Error: "relation already exists"
✅ **This is good!** It means the table is already there. Just continue to the next migration.

### Error: "permission denied"
❌ Make sure you're logged into Supabase with the right account.

### Error: "syntax error"
❌ Make sure you copied the **entire** file, including the first line.

---

## 🎯 Visual Guide

```
Supabase Dashboard
  ├─ SQL Editor (click here)
  │    ├─ New query (click here)
  │    ├─ [Paste migration 006 here]
  │    └─ Run (click here)
  │
  └─ New query (click here)
       ├─ [Paste migration 007 here]
       └─ Run (click here)
```

---

**That's it!** Two copy-pastes and you're done! 🎉

Total time: **~2 minutes**
