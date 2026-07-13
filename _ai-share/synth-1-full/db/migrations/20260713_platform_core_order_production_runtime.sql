CREATE TABLE IF NOT EXISTS platform_core_order_production_snapshots (
  order_id text PRIMARY KEY,
  snapshot jsonb NOT NULL,
  version integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_core_order_production_events (
  event_id text PRIMARY KEY,
  order_id text NOT NULL,
  event_type text NOT NULL,
  actor jsonb NOT NULL,
  payload jsonb NOT NULL,
  version integer NOT NULL,
  occurred_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_core_order_production_events_order
  ON platform_core_order_production_events(order_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS platform_core_order_production_idempotency (
  idempotency_key text PRIMARY KEY,
  result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
