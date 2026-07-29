import type {
  CommercialWorkflowRepository,
  CommercialWorkflowState,
} from "../application/commercial-workflow-repository";
import { WorkflowVersionConflictError } from "../application/commercial-workflow-repository";

export interface SqlQueryResult<Row> {
  readonly rows: readonly Row[];
  readonly rowCount: number;
}

export interface SqlExecutor {
  query<Row>(
    sql: string,
    parameters?: readonly unknown[],
  ): Promise<SqlQueryResult<Row>>;
}

interface WorkflowRow {
  readonly version: number;
  readonly state: CommercialWorkflowState | string;
}

function decode(row: WorkflowRow): CommercialWorkflowState {
  const state =
    typeof row.state === "string"
      ? (JSON.parse(row.state) as CommercialWorkflowState)
      : row.state;
  return Object.freeze({
    ...state,
    version: Number(row.version),
    integrationInbox: Object.freeze([...(state.integrationInbox ?? [])]),
    operationsAudit: Object.freeze([...(state.operationsAudit ?? [])]),
  });
}

export class PostgresCommercialWorkflowRepository
  implements CommercialWorkflowRepository
{
  constructor(private readonly executor: SqlExecutor) {}

  async findById(id: string): Promise<CommercialWorkflowState | null> {
    const result = await this.executor.query<WorkflowRow>(
      `SELECT version, state
       FROM syntha_commercial_workflow_state
       WHERE workflow_id = $1`,
      [id],
    );
    const row = result.rows[0];
    return row ? decode(row) : null;
  }

  async save(
    state: CommercialWorkflowState,
    expectedVersion: number,
  ): Promise<CommercialWorkflowState> {
    const next: CommercialWorkflowState = Object.freeze({
      ...state,
      version: expectedVersion + 1,
    });
    const serialized = JSON.stringify(next);
    const result =
      expectedVersion === 0
        ? await this.executor.query<WorkflowRow>(
            `INSERT INTO syntha_commercial_workflow_state
               (workflow_id, version, state, updated_at)
             VALUES ($1, 1, $2::jsonb, $3::timestamptz)
             ON CONFLICT (workflow_id) DO NOTHING
             RETURNING version, state`,
            [state.id, serialized, state.updatedAt],
          )
        : await this.executor.query<WorkflowRow>(
            `UPDATE syntha_commercial_workflow_state
             SET version = $2,
                 state = $3::jsonb,
                 updated_at = $4::timestamptz
             WHERE workflow_id = $1 AND version = $5
             RETURNING version, state`,
            [
              state.id,
              expectedVersion + 1,
              serialized,
              state.updatedAt,
              expectedVersion,
            ],
          );
    const row = result.rows[0];
    if (!row) {
      const current = await this.findById(state.id);
      throw new WorkflowVersionConflictError(
        state.id,
        expectedVersion,
        current?.version ?? null,
      );
    }
    return decode(row);
  }
}
