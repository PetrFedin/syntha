-- Wave XK · Shop accept-invite PG partner session (table from SE 042; index for checkout lookup).

CREATE INDEX IF NOT EXISTS idx_shop_b2b_partner_sessions_session_accepted
  ON shop_b2b_partner_sessions (session_id, accepted_at DESC);
