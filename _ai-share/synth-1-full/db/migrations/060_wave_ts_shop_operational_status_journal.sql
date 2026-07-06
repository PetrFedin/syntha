-- Wave TS · shop CO operational status mirror (brand amend outcome → shop PG journal).

CREATE TABLE IF NOT EXISTS shop_b2b_operational_status_journal (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  status TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'brand_amend_mirror',
  amendment_id TEXT,
  idempotency_key TEXT UNIQUE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_b2b_operational_status_journal_order
  ON shop_b2b_operational_status_journal (order_id, created_at DESC);
