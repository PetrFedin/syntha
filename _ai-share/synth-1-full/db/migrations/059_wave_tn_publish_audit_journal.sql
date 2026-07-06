-- Wave TN · Brand SC publish audit journal (cabinet + release publish panels).

CREATE TABLE IF NOT EXISTS brand_sc_publish_audit_journal (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'showroom.published',
  source TEXT NOT NULL DEFAULT 'showroom_publish',
  campaign_name TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  organization_id TEXT NOT NULL DEFAULT 'org-brand-001',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_sc_publish_audit_journal_collection
  ON brand_sc_publish_audit_journal (collection_id, created_at DESC);
