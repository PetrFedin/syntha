CREATE TABLE IF NOT EXISTS syntha_commercial_workflow_state (
  workflow_id text PRIMARY KEY,
  version bigint NOT NULL CHECK (version > 0),
  state jsonb NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS syntha_commercial_workflow_state_updated_at_idx
  ON syntha_commercial_workflow_state (updated_at);
