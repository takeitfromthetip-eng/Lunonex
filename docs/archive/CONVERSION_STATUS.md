# 🔄 DATABASE CONVERSION STATUS

**Last Updated:** 2025-11-25
**Session:** Claude Code Database Wiring

---

## ✅ COMPLETED (2/6 Routes)

### 1. **api/routes/posts.js** ✅ DONE
**Status:** 100% converted to Supabase

**Endpoints Converted:**
- ✅ `GET /api/posts/feed` - Uses `get_user_feed()` function
- ✅ `POST /api/posts/create` - Inserts into `posts` table
- ✅ `DELETE /api/posts/:postId` - Deletes with RLS check
- ✅ `POST /api/posts/:postId/like` - Toggles in `post_likes` table
- ✅ `POST /api/posts/:postId/share` - Tracks in `post_shares` table
- ✅ `GET /api/posts/:postId` - Gets with author info + counts

**Features:**
- Uses Supabase JS client
- Proper error handling
- Joins with users table for author info
- Aggregates likes/comments/shares counts
- RLS enforced automatically

---

### 2. **api/routes/comments.js** ✅ DONE
**Status:** 100% converted to Supabase

**Endpoints Converted:**
- ✅ `GET /api/comments/:postId` - Gets comments with author info + counts
- ✅ `POST /api/comments/create` - Inserts into `comments` table
- ✅ `DELETE /api/comments/:commentId` - Deletes with RLS check
- ✅ `POST /api/comments/:commentId/like` - Toggles in `comment_likes` table
- ✅ `GET /api/comments/:commentId/replies` - Gets threaded replies

**Features:**
- Supports threaded replies (parent_comment_id)
- Gets reply counts per comment
- Like/unlike functionality
- Author info included in response

---

## ⚠️ REMAINING (4/6 Routes)

### 3. **api/routes/relationships.js** ⚠️ TODO
**Status:** Still using mock data (340 lines)

**Endpoints To Convert:**
- ❌ `POST /api/relationships/follow` → Insert into `follows` table
- ❌ `DELETE /api/relationships/follow/:id` → Delete from `follows`
- ❌ `GET /api/relationships/followers` → Select from `follows` where `following_id = userId`
- ❌ `GET /api/relationships/following` → Select from `follows` where `follower_id = userId`
- ❌ `POST /api/relationships/friend-request` → Insert into `friendships` (status='pending')
- ❌ `POST /api/relationships/friend-request/:id/accept` → Update `friendships` (status='accepted')
- ❌ `DELETE /api/relationships/friend/:id` → Delete from `friendships`
- ❌ `GET /api/relationships/friends` → Select from `friendships` where status='accepted'
- ❌ `POST /api/relationships/block` → Insert into `blocks` table

**Complexity:** Medium (multiple relationship types)

---

### 4. **api/routes/messages.js** ⚠️ TODO
**Status:** Still using mock data (280 lines)

**Endpoints To Convert:**
- ❌ `GET /api/messages/conversations` → Select from `conversations` + participants
- ❌ `GET /api/messages/conversation/:id` → Select from `messages` where `conversation_id`
- ❌ `POST /api/messages/send` → Insert into `messages` (create conversation if needed)
- ❌ `POST /api/messages/:id/read` → Update `messages` set `read_at`
- ❌ `DELETE /api/messages/:id` → Delete from `messages`
- ❌ `GET /api/messages/unread-count` → Count where `read_at IS NULL`

**Complexity:** High (conversation management)

---

### 5. **api/routes/notifications.js** ⚠️ TODO
**Status:** Still using mock data (199 lines)

**Endpoints To Convert:**
- ❌ `GET /api/notifications` → Select from `notifications` where `user_id`
- ❌ `GET /api/notifications/unread-count` → Count where `read_at IS NULL`
- ❌ `POST /api/notifications/:id/read` → Update set `read_at`
- ❌ `POST /api/notifications/mark-all-read` → Update all where `user_id`
- ❌ `DELETE /api/notifications/:id` → Delete from `notifications`

**Complexity:** Low (simple CRUD)

---

### 6. **api/routes/subscriptions.js** ⚠️ TODO
**Status:** Still using mock data (259 lines)

**Endpoints To Convert:**
- ❌ `POST /api/subscriptions/create-checkout` → Stripe + insert into `subscriptions`
- ❌ `GET /api/subscriptions/check/:creatorId` → Select from `subscriptions`
- ❌ `GET /api/subscriptions/my-subscriptions` → Select where `subscriber_id = userId`
- ❌ `GET /api/subscriptions/my-subscribers` → Select where `creator_id = userId`
- ❌ `DELETE /api/subscriptions/:id` → Update status='cancelled', set `cancelled_at`

**Complexity:** Medium (Stripe integration)

---

## 📊 OVERALL PROGRESS

```
Posts API:           ████████████████████ 100% ✅
Comments API:        ████████████████████ 100% ✅
Relationships API:   ░░░░░░░░░░░░░░░░░░░░   0% ⚠️
Messages API:        ░░░░░░░░░░░░░░░░░░░░   0% ⚠️
Notifications API:   ░░░░░░░░░░░░░░░░░░░░   0% ⚠️
Subscriptions API:   ░░░░░░░░░░░░░░░░░░░░   0% ⚠️

OVERALL:             ████████░░░░░░░░░░░░  33%
```

---

## 🎯 FOR VS CODE: HOW TO FINISH

### **Quick Convert Pattern:**

For each remaining file, follow this pattern:

1. **Add Supabase import at top:**
```javascript
const { supabase } = require('../lib/supabaseServer');
```

2. **Remove mock data:**
```javascript
// DELETE THESE LINES:
let relationships = [];
let relationshipIdCounter = 1;
```

3. **Convert each endpoint:**

**Example - Follow User:**
```javascript
// BEFORE (mock):
router.post('/follow', authenticateToken, async (req, res) => {
  const { userId } = req.user;
  const { targetUserId } = req.body;

  follows.push({ followerId: userId, followingId: targetUserId });
  res.json({ success: true });
});

// AFTER (Supabase):
router.post('/follow', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { targetUserId } = req.body;

    const { error } = await supabase
      .from('follows')
      .insert([{
        follower_id: userId,
        following_id: targetUserId
      }]);

    if (error) {
      console.error('Follow error:', error);
      return res.status(500).json({ error: 'Failed to follow user' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});
```

4. **Test after each conversion:**
```bash
node test-api-health.js --jwt YOUR_TOKEN
```

---

## 🔧 CONVERSION HELPERS

### **Relationships API Conversion:**

```javascript
// Get followers
const { data } = await supabase
  .from('follows')
  .select('follower:users(id, email, display_name, avatar_url)')
  .eq('following_id', userId);

// Get following
const { data } = await supabase
  .from('follows')
  .select('following:users(id, email, display_name, avatar_url)')
  .eq('follower_id', userId);

// Friend request
const { data, error } = await supabase
  .from('friendships')
  .insert([{
    user_id_1: Math.min(userId, targetUserId), // Smaller ID first
    user_id_2: Math.max(userId, targetUserId),
    status: 'pending'
  }]);

// Accept friend request
const { error } = await supabase
  .from('friendships')
  .update({ status: 'accepted', accepted_at: new Date().toISOString() })
  .eq('id', friendshipId);

// Block user
const { error } = await supabase
  .from('blocks')
  .insert([{
    blocker_id: userId,
    blocked_id: targetUserId
  }]);
```

### **Messages API Conversion:**

```javascript
// Get conversations
const { data: convos } = await supabase
  .from('conversations')
  .select(`
    *,
    participants:conversation_participants(
      user:users(id, email, display_name, avatar_url)
    )
  `)
  .in('id', [
    // Get conversation IDs where user is participant
  ]);

// Send message (create conversation first if needed)
// 1. Check if conversation exists
const { data: existingConvo } = await supabase
  .from('conversation_participants')
  .select('conversation_id')
  .eq('user_id', userId)
  .single();

// 2. If no conversation, create one
const { data: newConvo } = await supabase
  .from('conversations')
  .insert([{}])
  .select()
  .single();

// 3. Add participants
await supabase.from('conversation_participants').insert([
  { conversation_id: newConvo.id, user_id: userId },
  { conversation_id: newConvo.id, user_id: recipientId }
]);

// 4. Send message
await supabase.from('messages').insert([{
  conversation_id: newConvo.id,
  sender_id: userId,
  body: messageBody
}]);
```

### **Notifications API Conversion:**

```javascript
// Get notifications
const { data } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50);

// Mark as read
const { error } = await supabase
  .from('notifications')
  .update({ read_at: new Date().toISOString() })
  .eq('id', notificationId)
  .eq('user_id', userId);

// Mark all as read
const { error } = await supabase
  .from('notifications')
  .update({ read_at: new Date().toISOString() })
  .eq('user_id', userId)
  .is('read_at', null);

// Unread count
const { count } = await supabase
  .from('notifications')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .is('read_at', null);
```

### **Subscriptions API Conversion:**

```javascript
// Check subscription
const { data } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('subscriber_id', userId)
  .eq('creator_id', creatorId)
  .eq('status', 'active')
  .single();

// Create subscription (after Stripe checkout)
const { data, error } = await supabase
  .from('subscriptions')
  .insert([{
    subscriber_id: userId,
    creator_id: creatorId,
    tier: 'premium',
    stripe_subscription_id: stripeSubId,
    stripe_customer_id: stripeCustomerId,
    status: 'active',
    renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }]);

// Cancel subscription
const { error } = await supabase
  .from('subscriptions')
  .update({
    status: 'cancelled',
    cancelled_at: new Date().toISOString()
  })
  .eq('id', subscriptionId)
  .eq('subscriber_id', userId);
```

---

## ⏱️ TIME ESTIMATE

Per route:
- **Notifications:** 20-30 minutes (simple CRUD)
- **Relationships:** 45-60 minutes (multiple types)
- **Subscriptions:** 30-45 minutes (Stripe logic)
- **Messages:** 60-90 minutes (complex conversation logic)

**Total:** 3-4 hours to complete all 4 routes

---

## ✅ TESTING CHECKLIST

After converting each route:

- [ ] Run `node test-api-health.js` - Should show endpoint responding
- [ ] Test in Postman/curl with real JWT token
- [ ] Check Supabase dashboard - Should see data in tables
- [ ] Test error cases (invalid IDs, unauthorized access)
- [ ] Verify RLS policies are working (can't access others' data)

---

## 🚀 COMMIT STRATEGY

**Current commit:**
- Posts API: 100% converted ✅
- Comments API: 100% converted ✅

**Next commits:**
- Relationships API conversion (commit separately)
- Messages API conversion (commit separately)
- Notifications API conversion (commit separately)
- Subscriptions API conversion (commit separately)
- Final test + documentation update

---

## 📝 NOTES FOR VS CODE

**What's Already Done:**
- ✅ Posts and Comments are 100% wired to Supabase
- ✅ Database schema is ready
- ✅ Test scripts are ready
- ✅ Conversion patterns documented above

**What You Need To Do:**
1. Open `api/routes/relationships.js`
2. Add Supabase import at top
3. Remove mock data arrays
4. Convert each endpoint using patterns above
5. Test with `node test-api-health.js`
6. Commit
7. Repeat for messages, notifications, subscriptions

**Don't Overthink It:**
- It's mechanical work
- Follow the patterns above
- Copy from posts.js / comments.js as examples
- Test frequently

---

**Generated by:** Claude Code
**Status:** 2/6 routes complete, 4 remaining
**Time to Complete:** 3-4 hours

🔌 **KEEP GOING - YOU'RE 33% DONE!** 🔌
