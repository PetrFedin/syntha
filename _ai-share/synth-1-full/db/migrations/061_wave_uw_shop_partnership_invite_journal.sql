-- Wave UW · Shop SC partnership invite PG journal.

CREATE TABLE IF NOT EXISTS shop_b2b_partnership_invite_journal (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL DEFAULT 'shop1',
  brand_id TEXT NOT NULL,
  collection_id TEXT,
  action TEXT NOT NULL DEFAULT 'request',
  status TEXT NOT NULL DEFAULT 'requested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_b2b_partnership_invite_journal_buyer
  ON shop_b2b_partnership_invite_journal (buyer_id, brand_id, created_at DESC);
