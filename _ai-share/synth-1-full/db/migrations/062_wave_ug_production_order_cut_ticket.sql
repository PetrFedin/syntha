-- Wave UG: cut_ticket JSONB on B2B production orders (workshop2_purchase_orders).

ALTER TABLE workshop2_purchase_orders
  ADD COLUMN IF NOT EXISTS cut_ticket JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN workshop2_purchase_orders.cut_ticket IS
  'Wave UG: cut ticket stub mirror on production order (B2B handoff PO)';

CREATE INDEX IF NOT EXISTS idx_workshop2_po_cut_ticket_nonempty
  ON workshop2_purchase_orders ((cut_ticket IS NOT NULL AND cut_ticket <> '{}'::jsonb))
  WHERE cut_ticket <> '{}'::jsonb;
