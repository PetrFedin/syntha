-- Wave WD · Brand SC syndication / unpublish / rollback → publish audit PG index.

CREATE INDEX IF NOT EXISTS idx_brand_sc_publish_audit_journal_event_type
  ON brand_sc_publish_audit_journal (collection_id, event_type, created_at DESC);
