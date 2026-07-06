-- Wave WO: floor tablet WIP status on production orders (workshop2_purchase_orders).

ALTER TABLE workshop2_purchase_orders
  ADD COLUMN IF NOT EXISTS wip_status TEXT NOT NULL DEFAULT 'queued';

COMMENT ON COLUMN workshop2_purchase_orders.wip_status IS
  'Wave WO: floor tablet WIP (queued | cut | sew | qc | released) — SoT with mes_release_stage';

UPDATE workshop2_purchase_orders
SET wip_status = mes_release_stage
WHERE payload->>'source' = 'b2b_production_handoff'
  AND wip_status = 'queued'
  AND mes_release_stage <> 'queued';

CREATE INDEX IF NOT EXISTS idx_workshop2_po_wip_status_handoff
  ON workshop2_purchase_orders (wip_status, updated_at DESC)
  WHERE payload->>'source' = 'b2b_production_handoff';
