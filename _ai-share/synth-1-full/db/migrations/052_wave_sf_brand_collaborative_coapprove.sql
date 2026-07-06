/** Wave SF — brand co-approve margin in shared PG collaborative session. */
ALTER TABLE shop_collaborative_approvals
  ADD COLUMN IF NOT EXISTS brand_actor TEXT;

COMMENT ON COLUMN shop_collaborative_approvals.brand_actor IS 'Last brand actor label on margin approve (audit).';
