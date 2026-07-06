-- Wave WI: partial ship qty + backorder flag on material requisitions (PG columns).

ALTER TABLE workshop2_material_requisitions
  ADD COLUMN IF NOT EXISTS partial_ship_qty NUMERIC,
  ADD COLUMN IF NOT EXISTS backorder_flag BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_workshop2_material_req_backorder
  ON workshop2_material_requisitions (backorder_flag)
  WHERE backorder_flag = true;
