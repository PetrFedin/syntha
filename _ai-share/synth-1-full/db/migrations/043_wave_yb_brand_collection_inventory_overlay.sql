-- Wave YB: brand collection inventory overlay PG (core mode SoT; no localStorage dual-write).

CREATE TABLE IF NOT EXISTS brand_collection_inventory_overlay (
  organization_id TEXT NOT NULL DEFAULT 'org-brand-001',
  collection_id TEXT NOT NULL,
  overlay_json JSONB NOT NULL DEFAULT '{"v":1,"articles":[]}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (organization_id, collection_id)
);
