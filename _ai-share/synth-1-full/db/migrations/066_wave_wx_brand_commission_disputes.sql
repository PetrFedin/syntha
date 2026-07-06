-- Wave WX: brand agent rep commission dispute journal (PG stub for core fail-closed).

CREATE TABLE IF NOT EXISTS brand_agent_rep_commission_disputes (
  dispute_id TEXT NOT NULL PRIMARY KEY,
  organization_id TEXT NOT NULL DEFAULT 'org-brand-001',
  commission_id TEXT NOT NULL,
  reason_ru TEXT NOT NULL,
  rep_name TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_agent_rep_commission_disputes_org_created
  ON brand_agent_rep_commission_disputes (organization_id, created_at DESC);
