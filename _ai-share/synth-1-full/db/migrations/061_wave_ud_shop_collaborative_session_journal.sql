-- Wave UD · Shop collaborative session journal (brand co-approve + shop steps audit).

CREATE TABLE IF NOT EXISTS shop_collaborative_session_journal (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  step_id TEXT,
  brand_actor TEXT,
  message_ru TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_collaborative_session_journal_order
  ON shop_collaborative_session_journal (buyer_id, order_id, created_at DESC);

COMMENT ON TABLE shop_collaborative_session_journal IS 'Audit trail for shared shop/brand collaborative PG session.';
