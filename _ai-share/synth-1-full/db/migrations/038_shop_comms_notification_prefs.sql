-- Shop comms notification prefs (Platform Core S4 — PG вместо localStorage-only).

CREATE TABLE IF NOT EXISTS shop_comms_notification_prefs (
  buyer_id TEXT PRIMARY KEY,
  order_status BOOLEAN NOT NULL DEFAULT TRUE,
  chat_messages BOOLEAN NOT NULL DEFAULT TRUE,
  calendar_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shop_comms_notification_prefs_updated
  ON shop_comms_notification_prefs (updated_at DESC);
