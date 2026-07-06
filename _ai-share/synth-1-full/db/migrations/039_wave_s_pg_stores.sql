-- Wave S: localStorage → PG (range planner overlay, rep offline drafts, sketch templates).

CREATE TABLE IF NOT EXISTS brand_range_planner_overlay (
  organization_id TEXT NOT NULL DEFAULT 'org-brand-001',
  collection_id TEXT NOT NULL,
  overlay_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (organization_id, collection_id)
);

CREATE INDEX IF NOT EXISTS idx_brand_range_planner_overlay_updated
  ON brand_range_planner_overlay (updated_at DESC);

CREATE TABLE IF NOT EXISTS shop_rep_offline_drafts (
  rep_id TEXT NOT NULL PRIMARY KEY,
  drafts_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brand_sketch_org_templates (
  organization_id TEXT NOT NULL DEFAULT 'org-brand-001',
  collection_id TEXT NOT NULL,
  templates_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (organization_id, collection_id)
);
