-- Wave TP · Shop CO working order version diff + merge-to-matrix journal.

CREATE TABLE IF NOT EXISTS shop_working_order_version_journal (
  id TEXT PRIMARY KEY,
  wholesale_order_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  from_version_id TEXT,
  to_version_id TEXT,
  diff_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  merged_lines INT NOT NULL DEFAULT 0,
  eligible_lines INT NOT NULL DEFAULT 0,
  partial_merge BOOLEAN NOT NULL DEFAULT FALSE,
  buyer_id TEXT,
  collection_id TEXT,
  message_ru TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_working_order_version_journal_order
  ON shop_working_order_version_journal (wholesale_order_id, created_at DESC);
