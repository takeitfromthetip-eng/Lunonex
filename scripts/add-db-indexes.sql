-- Performance Optimization: Add Database Indexes
-- These indexes will speed up queries and reduce Supabase costs

-- Tier Unlocks - Frequently queried by user_id
CREATE INDEX IF NOT EXISTS idx_tier_unlocks_user_id ON tier_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_tier_unlocks_stripe_payment ON tier_unlocks(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_tier_unlocks_amount ON tier_unlocks(tier_amount) WHERE tier_amount >= 5000;

-- Subscriptions - Queried by user and customer
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status) WHERE status IN ('active', 'trialing', 'sovereign');
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);

-- Users - Email lookups for auth
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);

-- Posts - Social feed queries
CREATE INDEX IF NOT EXISTS idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

-- Comments - Thread lookups
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at DESC);

-- Likes - User activity
CREATE INDEX IF NOT EXISTS idx_likes_user_post ON likes(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);

-- Follows - Social graph
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- Legal Receipts - Compliance lookups
CREATE INDEX IF NOT EXISTS idx_legal_receipts_user ON legal_receipts(user_id, document_id);
CREATE INDEX IF NOT EXISTS idx_legal_receipts_timestamp ON legal_receipts(acceptance_timestamp DESC);

-- Face Signatures - Deepfake detection
CREATE INDEX IF NOT EXISTS idx_face_signatures_asset ON face_signatures(asset_id);
CREATE INDEX IF NOT EXISTS idx_face_signatures_creator ON face_signatures(creator_id);

-- Misuse Detections - Copyright protection
CREATE INDEX IF NOT EXISTS idx_misuse_detections_signature ON misuse_detections(original_signature_id);
CREATE INDEX IF NOT EXISTS idx_misuse_detections_uploader ON misuse_detections(uploader_id);
CREATE INDEX IF NOT EXISTS idx_misuse_detections_status ON misuse_detections(status) WHERE status = 'pending';

ANALYZE; -- Update query planner statistics
