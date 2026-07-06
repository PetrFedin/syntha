-- Wave SM · S1 purge: floor-tab drafts (subcontractor, qc-app, …) → PG SoT.

CREATE TABLE IF NOT EXISTS brand_floor_tab_drafts (
  organization_id TEXT NOT NULL DEFAULT 'org-brand-001',
  scope TEXT NOT NULL,
  draft_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (organization_id, scope)
);

CREATE INDEX IF NOT EXISTS idx_brand_floor_tab_drafts_updated
  ON brand_floor_tab_drafts (updated_at DESC);
