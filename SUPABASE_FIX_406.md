# FIX SUPABASE 406 ERROR - MANUAL STEPS

## Problem
Your frontend gets **406 (Not Acceptable)** errors when trying to query Supabase:
```
GET https://iqipomerawkvtojbtvom.supabase.co/rest/v1/users?select=username%2Cdisplay_name%2Cuse_real_name&email=eq.polotuspossumus%40gmail.com 406 (Not Acceptable)
```

This happens because **Row Level Security (RLS)** is blocking the query.

## Solution - Apply RLS Policies

### Option 1: Via Supabase Dashboard (RECOMMENDED)

1. **Go to Supabase Dashboard:**
   - Open: https://supabase.com/dashboard
   - Select your project: `iqipomerawkvtojbtvom`

2. **Navigate to Table Editor:**
   - Click "Table Editor" in left sidebar
   - Find the `users` table

3. **Configure RLS Policies:**
   - Click on `users` table
   - Click "RLS" tab or go to Authentication > Policies
   - Click "New Policy"

4. **Add Policy #1: Allow public read for basic profile info**
   ```sql
   Policy name: Public profiles readable
   Policy command: SELECT
   Target roles: anon, authenticated
   
   USING expression:
   true
   ```

5. **Add Policy #2: Users can read their own data**
   ```sql
   Policy name: Users can read their own data
   Policy command: SELECT
   Target roles: authenticated
   
   USING expression:
   auth.uid()::text = id::text OR email = current_setting('request.jwt.claims', true)::json->>'email'
   ```

6. **Add Policy #3: Users can update their own data**
   ```sql
   Policy name: Users can update their own data
   Policy command: UPDATE
   Target roles: authenticated
   
   USING expression:
   auth.uid()::text = id::text OR email = current_setting('request.jwt.claims', true)::json->>'email'
   ```

7. **Enable RLS:**
   - Make sure "Enable RLS" toggle is ON for the users table

### Option 2: Via SQL Editor (FASTER)

1. Go to SQL Editor in Supabase Dashboard
2. Paste the contents of `supabase/migrations/fix_rls_policies.sql`
3. Click "Run"

### Option 3: Via Supabase CLI

```bash
npx supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.iqipomerawkvtojbtvom.supabase.co:5432/postgres"
```

## Verify Fix

After applying policies, test in browser console:

```javascript
// Should return data without 406 error
const { data, error } = await supabase
  .from('users')
  .select('username, display_name, use_real_name')
  .eq('email', 'polotuspossumus@gmail.com')
  .single();

console.log('Data:', data);
console.log('Error:', error);
```

## Expected Result

✅ **Before:** 406 (Not Acceptable)  
✅ **After:** 200 OK with user data

The 406 error will be gone and your frontend will load user profiles correctly!
