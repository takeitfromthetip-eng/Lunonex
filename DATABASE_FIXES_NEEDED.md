# Database Schema Fixes Required

This document lists database schema issues that need to be fixed in Supabase.

## Critical Issues

### 1. Missing `likes_count` Column in `posts` Table
**Error:** `Could not find the 'likes_count' column of 'posts' in the schema cache`

**Current Schema:** The table uses `likes` (integer)
**Fix:** The code has been updated to use `likes` instead of `likes_count`. No database change needed - code is now aligned with schema.

### 2. UUID Validation Errors in Likes
**Error:** `invalid input syntax for type uuid: "1765467311913"`

**Root Cause:** When post creation failed, the API returned a mock post with `id: Date.now()` (timestamp) instead of a UUID. This timestamp was then used when trying to like the post, causing UUID validation errors.

**Fixes Applied:**
- ✅ Removed mock post fallback in `api/social.js:176` - now returns proper error instead
- ✅ Added UUID validation to like/unlike endpoints to prevent invalid IDs from reaching database
- ✅ Returns clear error messages for invalid UUID formats

## Non-Critical Issues

### 3. Governance Module Path
**Fixed:** Changed import path from `../agents/governanceNotary` to `./agents/governanceNotary` in `api/governance.js`

### 4. Stripe URL Validation
**Fixed:** Added URL scheme validation to ensure `VITE_APP_URL` always has `https://` prefix

## Database Schema Verification Checklist

Run these queries in Supabase to verify schema:

```sql
-- Verify posts table schema
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'posts';

-- Expected columns: id (uuid), author_id (uuid), content (text),
-- likes (integer), comments_count (integer), shares (integer)

-- Verify likes table schema
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'likes';

-- Expected columns: id (uuid), user_id (uuid), post_id (uuid), created_at (timestamp)
```

## Testing Steps

1. Create a post via API: `POST /api/social/post`
2. Verify post creation returns valid UUID
3. Like the post: `POST /api/social/post/:postId/like`
4. Verify no UUID errors in logs
5. Unlike the post: `DELETE /api/social/post/:postId/like`

## Recommendations

1. **Add Database Constraints:** Ensure all ID columns have proper UUID constraints
2. **Add Foreign Keys:** Verify likes.post_id references posts.id
3. **Add Indexes:** Index frequently queried columns (user_id, post_id)
4. **Schema Migration:** Use proper migration tools instead of manual schema changes
