-- Wave SD: S4 notification center + brand production ops PG + greenfield shop2 onboarding.

CREATE TABLE IF NOT EXISTS platform_core_notification_events (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  scope_key TEXT NOT NULL DEFAULT '',
  order_id TEXT,
  collection_id TEXT,
  article_id TEXT,
  kind TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  body_ru TEXT,
  href TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_core_notification_events_scope
  ON platform_core_notification_events (role, scope_key, order_id, created_at DESC);

CREATE TABLE IF NOT EXISTS brand_production_ops_state (
  organization_id TEXT NOT NULL DEFAULT 'org-brand-001',
  state_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (organization_id)
);

CREATE TABLE IF NOT EXISTS shop_greenfield_onboarding (
  buyer_id TEXT NOT NULL,
  collection_id TEXT NOT NULL,
  crm_ready BOOLEAN NOT NULL DEFAULT FALSE,
  pricelist_ready BOOLEAN NOT NULL DEFAULT FALSE,
  first_order_id TEXT,
  matrix_seed_href TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (buyer_id, collection_id)
);
