-- Brand CRM segment display order for drag-sort / priority in assign UI.

ALTER TABLE brand_crm_segments
  ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_brand_crm_segments_org_order
  ON brand_crm_segments (organization_id, display_order ASC, segment_key ASC);
