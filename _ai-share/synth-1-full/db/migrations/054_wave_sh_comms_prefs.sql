-- Wave SH: unified comms notification prefs for all Platform Core roles (S2).

CREATE TABLE IF NOT EXISTS platform_core_comms_notification_prefs (
  role TEXT NOT NULL,
  scope_key TEXT NOT NULL,
  order_status BOOLEAN NOT NULL DEFAULT TRUE,
  chat_messages BOOLEAN NOT NULL DEFAULT TRUE,
  calendar_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  chain_status_push BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role, scope_key)
);

CREATE INDEX IF NOT EXISTS idx_platform_core_comms_prefs_updated
  ON platform_core_comms_notification_prefs (updated_at DESC);
