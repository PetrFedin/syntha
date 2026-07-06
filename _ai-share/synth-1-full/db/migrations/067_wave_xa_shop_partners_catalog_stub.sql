-- Wave XA · Shop SC partners catalog PG stub (invite journal from UW 061).

CREATE INDEX IF NOT EXISTS idx_shop_b2b_partnership_invite_journal_brand
  ON shop_b2b_partnership_invite_journal (brand_id, created_at DESC);
