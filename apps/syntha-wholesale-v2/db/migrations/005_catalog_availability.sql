BEGIN;

ALTER TABLE catalog_skus
  ADD COLUMN IF NOT EXISTS minimum_order_quantity integer NOT NULL DEFAULT 1 CHECK (minimum_order_quantity > 0),
  ADD COLUMN IF NOT EXISTS available_quantity integer NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
  ADD COLUMN IF NOT EXISTS reserved_quantity integer NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0);

ALTER TABLE catalog_skus
  DROP CONSTRAINT IF EXISTS catalog_skus_reserved_not_above_available,
  ADD CONSTRAINT catalog_skus_reserved_not_above_available CHECK (reserved_quantity <= available_quantity);

CREATE TABLE IF NOT EXISTS order_inventory_reservations (
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sku text NOT NULL REFERENCES catalog_skus(sku),
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz NOT NULL,
  PRIMARY KEY (order_id, sku)
);

CREATE INDEX IF NOT EXISTS order_inventory_reservations_sku_idx
  ON order_inventory_reservations (sku, order_id);

UPDATE catalog_skus
SET payload = payload || jsonb_build_object(
  'minimumOrderQuantity', minimum_order_quantity,
  'availableQuantity', available_quantity,
  'reservedQuantity', reserved_quantity,
  'availableToSell', available_quantity - reserved_quantity
);

COMMIT;
