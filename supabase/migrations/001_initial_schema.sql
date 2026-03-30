-- ContentOps Dashboard Schema

-- Content posts table
CREATE TABLE content_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  primary_keyword TEXT DEFAULT '',
  search_volume TEXT DEFAULT '',
  keyword_difficulty INTEGER DEFAULT 0,
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  url_slug TEXT DEFAULT '',
  date_written DATE,
  date_published DATE,
  author TEXT DEFAULT '',
  status TEXT DEFAULT 'IDEA' CHECK (status IN (
    'IDEA', 'ASSIGNED', 'IN PROGRESS', 'WRITTEN',
    'IN REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'
  )),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  due_date DATE,
  content_cluster TEXT DEFAULT '',
  reviewer TEXT DEFAULT '',
  word_count INTEGER DEFAULT 0,
  word_count_target INTEGER DEFAULT 2000,
  draft_url TEXT DEFAULT '',
  live_url TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'writer' CHECK (role IN ('writer', 'editor', 'publisher', 'admin')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE content_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT REFERENCES content_posts(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log table
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT REFERENCES content_posts(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  old_value TEXT DEFAULT '',
  new_value TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_posts_status ON content_posts(status);
CREATE INDEX idx_posts_author ON content_posts(author);
CREATE INDEX idx_posts_due_date ON content_posts(due_date);
CREATE INDEX idx_comments_post ON content_comments(post_id);
CREATE INDEX idx_activity_post ON activity_log(post_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_posts_updated_at
  BEFORE UPDATE ON content_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE content_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE content_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
