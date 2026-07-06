-- Wave ST: shop B2B matrix draft PG (Wave SE table + ST index for buyer restore).

CREATE TABLE IF NOT EXISTS shop_b2b_matrix_drafts (
  session_id TEXT NOT NULL PRIMARY KEY,
  buyer_id TEXT NOT NULL,
  collection_id TEXT NOT NULL,
  draft_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_b2b_matrix_drafts_buyer_collection
  ON shop_b2b_matrix_drafts (buyer_id, collection_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_shop_b2b_matrix_drafts_updated
  ON shop_b2b_matrix_drafts (updated_at DESC);
