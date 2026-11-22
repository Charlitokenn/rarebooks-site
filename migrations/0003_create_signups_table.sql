-- Spec 0014: one row per Clerk user, pointing at their Books Signup on the control site. It never holds the
-- password link or the site address.
CREATE TABLE IF NOT EXISTS signups (
  clerk_user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  request_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  ready_emailed_at TEXT,
  failed_emailed_at TEXT
);
CREATE INDEX IF NOT EXISTS signups_request_id ON signups (request_id);
