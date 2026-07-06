-- Wave SS · S1: create-article wizard draft → PG SoT (fail-closed LS in core mode).

CREATE TABLE IF NOT EXISTS brand_create_article_wizard_drafts (
  organization_id TEXT NOT NULL DEFAULT 'org-brand-001',
  collection_id TEXT NOT NULL,
  draft_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (organization_id, collection_id)
);

CREATE INDEX IF NOT EXISTS idx_brand_create_article_wizard_drafts_updated
  ON brand_create_article_wizard_drafts (updated_at DESC);
