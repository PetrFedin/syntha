-- Wave TL · Shop SC showroom eligible-for-matrix filter journal.

CREATE TABLE IF NOT EXISTS shop_showroom_eligible_for_matrix_journal (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL DEFAULT 'shop1',
  collection_id TEXT NOT NULL,
  published_count INT NOT NULL DEFAULT 0,
  eligible_count INT NOT NULL DEFAULT 0,
  filter_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_showroom_eligible_for_matrix_journal_buyer
  ON shop_showroom_eligible_for_matrix_journal (buyer_id, collection_id, created_at DESC);
