# 📊 SQL Scripts for Supabase - ForTheWeebs

## Instructions
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your ForTheWeebs project
3. Go to **SQL Editor** (left sidebar)
4. Create a new query
5. Copy and paste each section below
6. Click "Run" for each section

---

## 1. Template Marketplace Schema

**Run this first** - Creates all tables, indexes, and functions for template marketplace:

```sql
-- Supabase Database Schema for Template Marketplace
-- Run this in Supabase SQL Editor

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'social-media', 'manga-panels', 'album-covers', 'vr-scenes', 'audio-presets'
  type TEXT NOT NULL, -- 'graphic-design', 'audio', 'vr', 'animation'
  tags TEXT[], -- Array of tags for search
  template_data JSONB NOT NULL, -- Full template configuration (layers, settings, etc.)
  preview_url TEXT NOT NULL, -- Public URL of preview image
  price DECIMAL(10, 2) DEFAULT 0, -- 0 for free templates
  license TEXT DEFAULT 'personal', -- 'personal', 'commercial', 'cc0'
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  trending_score DECIMAL(10, 2) DEFAULT 0, -- Calculated field for trending sort
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Template purchases
CREATE TABLE IF NOT EXISTS template_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  price_paid DECIMAL(10, 2) NOT NULL,
  stripe_payment_id TEXT, -- For paid templates
  purchased_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, template_id) -- Prevent duplicate purchases
);

-- Template reviews
CREATE TABLE IF NOT EXISTS template_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, template_id) -- One review per user per template
);

-- Template likes
CREATE TABLE IF NOT EXISTS template_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, template_id)
);

-- Template stats (denormalized for performance)
CREATE TABLE IF NOT EXISTS template_stats (
  template_id UUID PRIMARY KEY REFERENCES templates(id) ON DELETE CASCADE,
  downloads INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  revenue_total DECIMAL(10, 2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(type);
CREATE INDEX IF NOT EXISTS idx_templates_status ON templates(status);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_download_count ON templates(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_templates_trending_score ON templates(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_template_purchases_user_id ON template_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_template_purchases_template_id ON template_purchases(template_id);

-- RPC function to increment view count
CREATE OR REPLACE FUNCTION increment_template_views(template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE templates SET view_count = view_count + 1 WHERE id = template_id;
  UPDATE template_stats SET views = views + 1, last_updated = NOW() WHERE template_id = template_id;
END;
$$ LANGUAGE plpgsql;

-- RPC function to increment download count
CREATE OR REPLACE FUNCTION increment_template_downloads(template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE templates SET download_count = download_count + 1 WHERE id = template_id;
  UPDATE template_stats SET downloads = downloads + 1, last_updated = NOW() WHERE template_id = template_id;
END;
$$ LANGUAGE plpgsql;

-- RPC function to update average rating
CREATE OR REPLACE FUNCTION update_template_rating(template_id UUID)
RETURNS VOID AS $$
DECLARE
  avg_rating DECIMAL(3, 2);
BEGIN
  SELECT AVG(rating) INTO avg_rating FROM template_reviews WHERE template_id = template_id;
  UPDATE templates SET average_rating = avg_rating WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

-- RPC function to calculate trending score (views + downloads + likes weighted)
CREATE OR REPLACE FUNCTION update_trending_scores()
RETURNS VOID AS $$
BEGIN
  UPDATE templates
  SET trending_score = (
    (view_count * 0.1) +
    (download_count * 5) +
    (like_count * 2) +
    (average_rating * 10)
  ) / EXTRACT(EPOCH FROM (NOW() - created_at)) * 86400; -- Decay over time
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create template_stats entry
CREATE OR REPLACE FUNCTION create_template_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO template_stats (template_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_template_stats
AFTER INSERT ON templates
FOR EACH ROW EXECUTE FUNCTION create_template_stats();

-- Row Level Security (RLS) policies
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view published templates
CREATE POLICY "Public templates are viewable by everyone"
  ON templates FOR SELECT
  USING (status = 'published');

-- Users can insert their own templates
CREATE POLICY "Users can insert own templates"
  ON templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own templates
CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON template_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own reviews
CREATE POLICY "Users can view own reviews"
  ON template_reviews FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert reviews
CREATE POLICY "Users can insert reviews"
  ON template_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON template_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable realtime for template updates
ALTER PUBLICATION supabase_realtime ADD TABLE templates;
ALTER PUBLICATION supabase_realtime ADD TABLE template_likes;
```

---

## 2. Verify Users Table Has Required Columns

Check if `users` table needs influencer columns:

```sql
-- Check existing columns in users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
```

**If missing these columns, run this:**

```sql
-- Add influencer-related columns to users table (if not already present)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS influencer_free BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_platform TEXT,
ADD COLUMN IF NOT EXISTS verified_username TEXT,
ADD COLUMN IF NOT EXISTS verified_followers INTEGER,
ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'none';
```

---

## 3. Create Cron Job for Trending Scores (Optional)

This updates trending scores every hour:

```sql
-- Create pg_cron extension if not enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule trending score updates every hour
SELECT cron.schedule(
  'update-template-trending-scores',
  '0 * * * *', -- Every hour at minute 0
  $$ SELECT update_trending_scores(); $$
);
```

**Note:** pg_cron requires Supabase Pro plan or higher. If on free tier, call `update_trending_scores()` manually or via backend cron job.

---

## 4. Seed Initial Starter Template (Optional)

Creates a free manga panel template:

```sql
-- Seed initial starter template (optional)
INSERT INTO templates (
  user_id, 
  title, 
  description, 
  category, 
  type, 
  template_data, 
  preview_url, 
  price, 
  license, 
  status
)
VALUES (
  (SELECT id FROM auth.users LIMIT 1), -- Use first user as template creator
  'Manga Panel Layout - 4 Panel Grid',
  'Classic 4-panel manga layout with speech bubble placeholders',
  'manga-panels',
  'graphic-design',
  '{"panels": [{"x": 0, "y": 0, "width": 400, "height": 300}, {"x": 410, "y": 0, "width": 400, "height": 300}, {"x": 0, "y": 310, "width": 400, "height": 300}, {"x": 410, "y": 310, "width": 400, "height": 300}]}'::jsonb,
  'https://placeholder.com/manga-4panel.png',
  0,
  'cc0',
  'published'
)
ON CONFLICT DO NOTHING;
```

---

## 5. Verify Everything Worked

Check table creation:

```sql
-- List all template-related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'template%';

-- Count templates (should be 0 or 1 if seed ran)
SELECT COUNT(*) FROM templates;

-- Test functions exist
SELECT proname 
FROM pg_proc 
WHERE proname LIKE '%template%';
```

---

## Troubleshooting

### Error: "relation templates already exists"
**Solution:** Tables already exist, skip to verification step

### Error: "function auth.uid() does not exist"
**Solution:** RLS policies require user context, run from authenticated session or skip RLS for testing

### Error: "permission denied for table users"
**Solution:** Use service role key in backend, not anon key

### Can't find pg_cron
**Solution:** Upgrade to Supabase Pro or use backend cron job instead

---

## Next Steps After Running SQL

1. ✅ Verify tables created in Supabase Dashboard → Table Editor
2. ✅ Test template creation via API: `POST /api/templates`
3. ✅ Check RLS policies work: Try accessing templates as different users
4. ✅ Monitor database usage in Supabase Dashboard → Database → Usage
5. ✅ Set up database backups: Dashboard → Settings → Backups

---

**File Location:** `database/template-marketplace-schema.sql` (already exists)

**All SQL scripts are safe to re-run** - They use `IF NOT EXISTS` and `ON CONFLICT DO NOTHING`
