-- Wave SE: matrix draft autosave PG, collection stage modules PG, partner invite session PG.

CREATE TABLE IF NOT EXISTS shop_b2b_matrix_drafts (
  session_id TEXT NOT NULL PRIMARY KEY,
  buyer_id TEXT NOT NULL,
  collection_id TEXT NOT NULL,
  draft_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_b2b_matrix_drafts_buyer_collection
  ON shop_b2b_matrix_drafts (buyer_id, collection_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS brand_collection_stage_modules (
  organization_id TEXT NOT NULL DEFAULT 'org-brand-001',
  collection_id TEXT NOT NULL,
  modules_json JSONB NOT NULL DEFAULT '{"v":1,"steps":{}}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (organization_id, collection_id)
);

CREATE TABLE IF NOT EXISTS shop_b2b_partner_sessions (
  session_id TEXT NOT NULL PRIMARY KEY,
  buyer_email TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'standard',
  invite_token TEXT,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_b2b_partner_sessions_email
  ON shop_b2b_partner_sessions (buyer_email, accepted_at DESC);
