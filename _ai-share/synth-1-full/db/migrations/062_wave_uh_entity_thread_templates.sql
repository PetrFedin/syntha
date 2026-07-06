-- Wave UH: entity thread message templates (extends SR b2b message templates).

CREATE TABLE IF NOT EXISTS workshop2_entity_thread_templates (
  id TEXT NOT NULL,
  owner_key TEXT NOT NULL,
  label_ru TEXT NOT NULL,
  thread_kind TEXT NOT NULL,
  body_template TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (owner_key, id)
);

CREATE INDEX IF NOT EXISTS idx_workshop2_entity_thread_templates_owner_kind
  ON workshop2_entity_thread_templates (owner_key, thread_kind, created_at DESC);
