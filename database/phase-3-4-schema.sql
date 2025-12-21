-- Phase 3 & 4 Database Schema
-- Discovery, Community, Marketplace, Partnerships, Education, Revenue Optimization

-- ============================================================================
-- PHASE 3: SOCIAL FEATURES (NO PHOTODNA REQUIRED)
-- ============================================================================

-- Creator Discovery & Search
CREATE TABLE IF NOT EXISTS creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    niche TEXT,
    tags TEXT[] DEFAULT '{}',
    follower_count INTEGER DEFAULT 0,
    subscriber_count INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    featured_order INTEGER,
    status TEXT DEFAULT 'active',
    stripe_account_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_creators_niche ON creators(niche);
CREATE INDEX idx_creators_tags ON creators USING GIN(tags);
CREATE INDEX idx_creators_status ON creators(status);
CREATE INDEX idx_creators_featured ON creators(featured, featured_order);

-- Follows/Connections (Note: exists but ensure schema)
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- Community Forums
CREATE TABLE IF NOT EXISTS forums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    rules TEXT[] DEFAULT '{}',
    is_private BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    post_count INTEGER DEFAULT 0,
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forums_creator ON forums(creator_id);
CREATE INDEX idx_forums_category ON forums(category);
CREATE INDEX idx_forums_active ON forums(active);

-- Forum Members
CREATE TABLE IF NOT EXISTS forum_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forum_id UUID NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(forum_id, user_id)
);

CREATE INDEX idx_forum_members_forum ON forum_members(forum_id);
CREATE INDEX idx_forum_members_user ON forum_members(user_id);

-- Forum Posts
CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forum_id UUID NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    reply_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forum_posts_forum ON forum_posts(forum_id);
CREATE INDEX idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX idx_forum_posts_created ON forum_posts(created_at);

-- Creator Events
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    location TEXT DEFAULT 'online',
    max_attendees INTEGER,
    is_paid BOOLEAN DEFAULT false,
    ticket_price INTEGER DEFAULT 0,
    attendee_count INTEGER DEFAULT 0,
    cancelled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_creator ON events(creator_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_cancelled ON events(cancelled);

-- Event RSVPs
CREATE TABLE IF NOT EXISTS event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rsvp_status TEXT DEFAULT 'attending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX idx_event_rsvps_user ON event_rsvps(user_id);

-- Community Discussions
CREATE TABLE IF NOT EXISTS discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    topic TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    reply_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_discussions_user ON discussions(user_id);
CREATE INDEX idx_discussions_topic ON discussions(topic);
CREATE INDEX idx_discussions_created ON discussions(created_at);

-- ============================================================================
-- PHASE 4: CREATOR ECONOMY
-- ============================================================================

-- Marketplace Items
CREATE TABLE IF NOT EXISTS marketplace_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'other',
    type TEXT DEFAULT 'asset',
    price INTEGER NOT NULL,
    files JSONB NOT NULL,
    preview_images TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    license TEXT DEFAULT 'standard',
    status TEXT DEFAULT 'active',
    sales_count INTEGER DEFAULT 0,
    rating_avg NUMERIC(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketplace_items_seller ON marketplace_items(seller_id);
CREATE INDEX idx_marketplace_items_category ON marketplace_items(category);
CREATE INDEX idx_marketplace_items_status ON marketplace_items(status);
CREATE INDEX idx_marketplace_items_price ON marketplace_items(price);

-- Marketplace Purchases
CREATE TABLE IF NOT EXISTS marketplace_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES marketplace_items(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES creators(id),
    amount INTEGER NOT NULL,
    platform_fee INTEGER NOT NULL,
    payment_intent_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_marketplace_purchases_item ON marketplace_purchases(item_id);
CREATE INDEX idx_marketplace_purchases_buyer ON marketplace_purchases(buyer_id);
CREATE INDEX idx_marketplace_purchases_seller ON marketplace_purchases(seller_id);
CREATE INDEX idx_marketplace_purchases_status ON marketplace_purchases(status);

-- Marketplace Access (file access after purchase)
CREATE TABLE IF NOT EXISTS marketplace_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES marketplace_purchases(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    item_id UUID NOT NULL REFERENCES marketplace_items(id),
    files JSONB NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketplace_access_buyer ON marketplace_access(buyer_id);
CREATE INDEX idx_marketplace_access_item ON marketplace_access(item_id);

-- Marketplace Reviews
CREATE TABLE IF NOT EXISTS marketplace_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES marketplace_purchases(id),
    item_id UUID NOT NULL REFERENCES marketplace_items(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(purchase_id)
);

CREATE INDEX idx_marketplace_reviews_item ON marketplace_reviews(item_id);
CREATE INDEX idx_marketplace_reviews_buyer ON marketplace_reviews(buyer_id);

-- Partnership Opportunities
CREATE TABLE IF NOT EXISTS partnership_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    budget_min INTEGER,
    budget_max INTEGER,
    categories TEXT[] DEFAULT '{}',
    requirements TEXT,
    status TEXT DEFAULT 'open',
    application_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_partnership_opportunities_brand ON partnership_opportunities(brand_id);
CREATE INDEX idx_partnership_opportunities_type ON partnership_opportunities(type);
CREATE INDEX idx_partnership_opportunities_status ON partnership_opportunities(status);

-- Partnership Applications
CREATE TABLE IF NOT EXISTS partnership_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES partnership_opportunities(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    pitch TEXT NOT NULL,
    portfolio TEXT[] DEFAULT '{}',
    metrics JSONB,
    desired_compensation INTEGER,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    UNIQUE(opportunity_id, creator_id)
);

CREATE INDEX idx_partnership_applications_opportunity ON partnership_applications(opportunity_id);
CREATE INDEX idx_partnership_applications_creator ON partnership_applications(creator_id);
CREATE INDEX idx_partnership_applications_status ON partnership_applications(status);

-- Active Partnerships
CREATE TABLE IF NOT EXISTS partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id),
    creator_id UUID NOT NULL REFERENCES creators(id),
    campaign_id UUID REFERENCES campaigns(id),
    compensation INTEGER NOT NULL,
    deliverables_required INTEGER DEFAULT 1,
    deliverables_submitted INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_partnerships_brand ON partnerships(brand_id);
CREATE INDEX idx_partnerships_creator ON partnerships(creator_id);
CREATE INDEX idx_partnerships_status ON partnerships(status);

-- Partnership Deliverables
CREATE TABLE IF NOT EXISTS partnership_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partnership_id UUID NOT NULL REFERENCES partnerships(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES creators(id),
    deliverable_type TEXT NOT NULL,
    content_url TEXT NOT NULL,
    metrics JSONB,
    status TEXT DEFAULT 'pending_review',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ
);

CREATE INDEX idx_partnership_deliverables_partnership ON partnership_deliverables(partnership_id);
CREATE INDEX idx_partnership_deliverables_creator ON partnership_deliverables(creator_id);

-- Affiliate Programs
CREATE TABLE IF NOT EXISTS affiliate_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    commission_rate NUMERIC(5,2) NOT NULL,
    cookie_duration INTEGER DEFAULT 30,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_affiliate_programs_merchant ON affiliate_programs(merchant_id);
CREATE INDEX idx_affiliate_programs_category ON affiliate_programs(category);
CREATE INDEX idx_affiliate_programs_status ON affiliate_programs(status);

-- Affiliate Memberships
CREATE TABLE IF NOT EXISTS affiliate_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES affiliate_programs(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    affiliate_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    earnings INTEGER DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    UNIQUE(program_id, creator_id)
);

CREATE INDEX idx_affiliate_memberships_program ON affiliate_memberships(program_id);
CREATE INDEX idx_affiliate_memberships_creator ON affiliate_memberships(creator_id);
CREATE INDEX idx_affiliate_memberships_code ON affiliate_memberships(affiliate_code);

-- Affiliate Conversions
CREATE TABLE IF NOT EXISTS affiliate_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id UUID NOT NULL REFERENCES affiliate_memberships(id) ON DELETE CASCADE,
    affiliate_code TEXT NOT NULL,
    amount INTEGER NOT NULL,
    commission_earned INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_affiliate_conversions_membership ON affiliate_conversions(membership_id);
CREATE INDEX idx_affiliate_conversions_created ON affiliate_conversions(created_at);

-- Sponsorship Requests
CREATE TABLE IF NOT EXISTS sponsorship_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    proposed_content TEXT NOT NULL,
    audience_metrics JSONB,
    desired_compensation INTEGER,
    timeline TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

CREATE INDEX idx_sponsorship_requests_creator ON sponsorship_requests(creator_id);
CREATE INDEX idx_sponsorship_requests_brand ON sponsorship_requests(brand_id);
CREATE INDEX idx_sponsorship_requests_status ON sponsorship_requests(status);

-- Education: Courses
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    category TEXT,
    level TEXT DEFAULT 'beginner',
    price INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT false,
    enrollment_count INTEGER DEFAULT 0,
    rating_avg NUMERIC(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_published ON courses(published);

-- Course Modules
CREATE TABLE IF NOT EXISTS course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    lesson_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_modules_course ON course_modules(course_id);
CREATE INDEX idx_course_modules_order ON course_modules(order_index);

-- Course Enrollments
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_intent_id TEXT,
    status TEXT DEFAULT 'active',
    progress NUMERIC(5,2) DEFAULT 0,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(course_id, user_id)
);

CREATE INDEX idx_course_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_status ON course_enrollments(status);

-- Lesson Completions
CREATE TABLE IF NOT EXISTS lesson_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(enrollment_id, lesson_id)
);

CREATE INDEX idx_lesson_completions_enrollment ON lesson_completions(enrollment_id);
CREATE INDEX idx_lesson_completions_user ON lesson_completions(user_id);

-- Course Reviews
CREATE TABLE IF NOT EXISTS course_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, user_id)
);

CREATE INDEX idx_course_reviews_course ON course_reviews(course_id);
CREATE INDEX idx_course_reviews_user ON course_reviews(user_id);

-- Tutorials
CREATE TABLE IF NOT EXISTS tutorials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    topic TEXT DEFAULT 'general',
    difficulty TEXT DEFAULT 'beginner',
    tags TEXT[] DEFAULT '{}',
    video_url TEXT,
    published BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tutorials_author ON tutorials(author_id);
CREATE INDEX idx_tutorials_topic ON tutorials(topic);
CREATE INDEX idx_tutorials_published ON tutorials(published);

-- Mentors
CREATE TABLE IF NOT EXISTS mentors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialties TEXT[] DEFAULT '{}',
    hourly_rate INTEGER NOT NULL,
    accepting_students BOOLEAN DEFAULT true,
    session_count INTEGER DEFAULT 0,
    rating_avg NUMERIC(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_mentors_user ON mentors(user_id);
CREATE INDEX idx_mentors_accepting ON mentors(accepting_students);

-- Mentorship Requests
CREATE TABLE IF NOT EXISTS mentorship_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES mentors(user_id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    preferred_time TIMESTAMPTZ,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

CREATE INDEX idx_mentorship_requests_mentor ON mentorship_requests(mentor_id);
CREATE INDEX idx_mentorship_requests_student ON mentorship_requests(student_id);
CREATE INDEX idx_mentorship_requests_status ON mentorship_requests(status);

-- Certifications
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    requirements TEXT,
    active BOOLEAN DEFAULT true,
    issued_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_certifications_category ON certifications(category);
CREATE INDEX idx_certifications_active ON certifications(active);

-- User Certifications
CREATE TABLE IF NOT EXISTS user_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    certification_id UUID NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
    certification_number TEXT UNIQUE NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, certification_id)
);

CREATE INDEX idx_user_certifications_user ON user_certifications(user_id);
CREATE INDEX idx_user_certifications_cert ON user_certifications(certification_id);

-- Revenue Optimization: Creator Earnings History
CREATE TABLE IF NOT EXISTS creator_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    total_earnings INTEGER NOT NULL,
    subscriptions INTEGER DEFAULT 0,
    tips INTEGER DEFAULT 0,
    commissions INTEGER DEFAULT 0,
    sales INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(creator_id, month)
);

CREATE INDEX idx_creator_earnings_creator ON creator_earnings(creator_id);
CREATE INDEX idx_creator_earnings_month ON creator_earnings(month);

-- Pricing Benchmarks
CREATE TABLE IF NOT EXISTS pricing_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type TEXT NOT NULL,
    niche TEXT NOT NULL,
    avg_price INTEGER NOT NULL,
    percentile_25 INTEGER NOT NULL,
    percentile_75 INTEGER NOT NULL,
    sample_size INTEGER NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(content_type, niche)
);

CREATE INDEX idx_pricing_benchmarks_type_niche ON pricing_benchmarks(content_type, niche);

-- A/B Tests
CREATE TABLE IF NOT EXISTS ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    variant_a JSONB NOT NULL,
    variant_b JSONB NOT NULL,
    success_metric TEXT NOT NULL,
    duration_days INTEGER DEFAULT 14,
    status TEXT DEFAULT 'active',
    variant_a_impressions INTEGER DEFAULT 0,
    variant_b_impressions INTEGER DEFAULT 0,
    variant_a_conversions INTEGER DEFAULT 0,
    variant_b_conversions INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

CREATE INDEX idx_ab_tests_creator ON ab_tests(creator_id);
CREATE INDEX idx_ab_tests_status ON ab_tests(status);

-- A/B Test Events
CREATE TABLE IF NOT EXISTS ab_test_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
    variant TEXT NOT NULL CHECK (variant IN ('a', 'b')),
    event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'conversion')),
    user_id UUID REFERENCES users(id),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ab_test_events_test ON ab_test_events(test_id);
CREATE INDEX idx_ab_test_events_timestamp ON ab_test_events(timestamp);

-- Supporting Tables (if not exist)
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id),
    name TEXT NOT NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DATABASE FUNCTIONS & TRIGGERS
-- ============================================================================

-- Increment functions for counters
CREATE OR REPLACE FUNCTION increment_opportunity_applications(opportunity_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE partnership_opportunities 
    SET application_count = application_count + 1 
    WHERE id = opportunity_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_item_sales(item_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE marketplace_items 
    SET sales_count = sales_count + 1 
    WHERE id = item_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_course_enrollments(course_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE courses 
    SET enrollment_count = enrollment_count + 1 
    WHERE id = course_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_certification_issued(certification_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE certifications 
    SET issued_count = issued_count + 1 
    WHERE id = certification_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_forum_posts(forum_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE forums 
    SET post_count = post_count + 1 
    WHERE id = forum_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_event_attendees(event_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE events 
    SET attendee_count = attendee_count + 1 
    WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- Update item rating average
CREATE OR REPLACE FUNCTION update_item_rating(item_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE marketplace_items 
    SET 
        rating_avg = (SELECT AVG(rating) FROM marketplace_reviews WHERE marketplace_reviews.item_id = item_id),
        rating_count = (SELECT COUNT(*) FROM marketplace_reviews WHERE marketplace_reviews.item_id = item_id)
    WHERE id = item_id;
END;
$$ LANGUAGE plpgsql;

-- Update course progress
CREATE OR REPLACE FUNCTION update_course_progress(enrollment_id UUID)
RETURNS VOID AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    progress_percent NUMERIC;
BEGIN
    -- Get total lessons in course
    SELECT COUNT(*) INTO total_lessons
    FROM course_modules cm
    JOIN course_enrollments ce ON ce.course_id = cm.course_id
    WHERE ce.id = enrollment_id;
    
    -- Get completed lessons
    SELECT COUNT(*) INTO completed_lessons
    FROM lesson_completions
    WHERE lesson_completions.enrollment_id = enrollment_id;
    
    -- Calculate progress
    IF total_lessons > 0 THEN
        progress_percent := (completed_lessons::NUMERIC / total_lessons::NUMERIC) * 100;
        
        UPDATE course_enrollments
        SET progress = progress_percent,
            completed_at = CASE WHEN progress_percent >= 100 THEN NOW() ELSE NULL END
        WHERE id = enrollment_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- A/B test metric incrementer
CREATE OR REPLACE FUNCTION increment_ab_test_metric(test_id UUID, metric_column TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('UPDATE ab_tests SET %I = %I + 1 WHERE id = $1', metric_column, metric_column)
    USING test_id;
END;
$$ LANGUAGE plpgsql;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_creators_updated_at BEFORE UPDATE ON creators
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forums_updated_at BEFORE UPDATE ON forums
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_items_updated_at BEFORE UPDATE ON marketplace_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Public read access for active items
CREATE POLICY "Public read active creators" ON creators FOR SELECT USING (status = 'active');
CREATE POLICY "Public read active forums" ON forums FOR SELECT USING (active = true);
CREATE POLICY "Public read marketplace items" ON marketplace_items FOR SELECT USING (status = 'active');
CREATE POLICY "Public read published courses" ON courses FOR SELECT USING (published = true);

-- Creators can manage their own content
CREATE POLICY "Creators manage own profile" ON creators FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Creators manage own items" ON marketplace_items FOR ALL USING (seller_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));
CREATE POLICY "Instructors manage own courses" ON courses FOR ALL USING (instructor_id IN (SELECT id FROM creators WHERE user_id = auth.uid()));

-- Users can view their own purchases and enrollments
CREATE POLICY "Users view own purchases" ON marketplace_purchases FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Users view own enrollments" ON course_enrollments FOR SELECT USING (user_id = auth.uid());

COMMIT;
