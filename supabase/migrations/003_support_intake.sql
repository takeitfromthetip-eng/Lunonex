-- Migration 003: Support intake and automation clerk system
-- Bug reports, feature requests, and GitHub issue sync

-- Support tickets: user-submitted issues
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email TEXT,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('bug', 'feature_request', 'question', 'feedback', 'abuse_report')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'triaged', 'in_progress', 'resolved', 'closed', 'duplicate')),
  github_issue_number INTEGER,
  github_issue_url TEXT,
  assigned_to UUID,
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_type ON support_tickets(ticket_type);
CREATE INDEX idx_support_tickets_github ON support_tickets(github_issue_number);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- Support ticket comments: conversation thread
CREATE TABLE IF NOT EXISTS support_ticket_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_id UUID,
  author_type TEXT NOT NULL CHECK (author_type IN ('user', 'admin', 'automation_clerk')),
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_support_comments_ticket ON support_ticket_comments(ticket_id);
CREATE INDEX idx_support_comments_created_at ON support_ticket_comments(created_at);

-- Auto-triage rules: automation clerk decision logic
CREATE TABLE IF NOT EXISTS support_triage_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  priority INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default triage rules
INSERT INTO support_triage_rules (rule_name, conditions, actions) VALUES
  ('CSAM report urgent',
   '{"ticket_type": "abuse_report", "keywords": ["child", "minor", "underage"]}'::jsonb,
   '{"priority": "urgent", "github_labels": ["security", "urgent"], "notify": ["security@fortheweebs.com"]}'::jsonb
  ),
  ('Payment issues high priority',
   '{"ticket_type": "bug", "keywords": ["payment", "charge", "refund", "billing"]}'::jsonb,
   '{"priority": "high", "github_labels": ["bug", "payments"]}'::jsonb
  ),
  ('Feature requests auto-label',
   '{"ticket_type": "feature_request"}'::jsonb,
   '{"github_labels": ["enhancement"], "priority": "medium"}'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Row Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_triage_rules ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.jwt()->>'role' IN ('admin', 'support')
  );

-- Users can create tickets
CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Admins can update tickets
CREATE POLICY "Admins can update tickets" ON support_tickets
  FOR UPDATE USING (auth.jwt()->>'role' IN ('admin', 'support'));

-- Users can view comments on their tickets
CREATE POLICY "Users can view ticket comments" ON support_ticket_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE id = ticket_id
      AND (user_id = auth.uid() OR auth.jwt()->>'role' IN ('admin', 'support'))
    )
    AND (is_internal = false OR auth.jwt()->>'role' IN ('admin', 'support'))
  );

-- Users can comment on their tickets
CREATE POLICY "Users can comment on tickets" ON support_ticket_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE id = ticket_id
      AND user_id = auth.uid()
    )
  );

-- Admins can manage triage rules
CREATE POLICY "Admins can manage triage rules" ON support_triage_rules
  FOR ALL USING (auth.jwt()->>'role' = 'admin');
