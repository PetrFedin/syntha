-- Wave TB · Shop CO replenishment saved filter slices sidebar (PG SoT, fail-closed LS in core).

CREATE TABLE IF NOT EXISTS shop_replenishment_filter_slices (
  buyer_id TEXT NOT NULL,
  slice_id TEXT NOT NULL,
  org_id TEXT NOT NULL DEFAULT 'shop1',
  season_id TEXT NOT NULL DEFAULT 'all',
  collection_id TEXT NOT NULL DEFAULT 'all',
  label_ru TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (buyer_id, slice_id)
);

CREATE INDEX IF NOT EXISTS idx_shop_replenishment_filter_slices_active
  ON shop_replenishment_filter_slices (buyer_id, is_active DESC, updated_at DESC);
