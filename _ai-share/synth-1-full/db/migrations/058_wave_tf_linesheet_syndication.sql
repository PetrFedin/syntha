-- Wave TF · Brand SC linesheet syndication journal + shop auto-ingest + unpublish rollback snapshots.

CREATE TABLE IF NOT EXISTS brand_linesheet_syndication_journal (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL,
  article_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  shop_buyer_id TEXT NOT NULL DEFAULT 'shop1',
  ingested_count INT NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'syndicate_publish',
  message_ru TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_linesheet_syndication_journal_collection
  ON brand_linesheet_syndication_journal (collection_id, created_at DESC);

CREATE TABLE IF NOT EXISTS brand_linesheet_unpublish_rollback_snapshots (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL,
  article_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  rolled_back_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_linesheet_unpublish_rollback_collection
  ON brand_linesheet_unpublish_rollback_snapshots (collection_id, created_at DESC);

CREATE TABLE IF NOT EXISTS shop_showroom_auto_ingest_journal (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL DEFAULT 'shop1',
  collection_id TEXT NOT NULL,
  article_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  source TEXT NOT NULL DEFAULT 'linesheet_syndicate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_showroom_auto_ingest_buyer
  ON shop_showroom_auto_ingest_journal (buyer_id, collection_id, created_at DESC);
