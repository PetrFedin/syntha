import type { CommercialExecutionScheduleRepository } from "../application/commercial-execution-schedule-repository";
import type { CommercialExecutionSchedule } from "../domain/commercial-execution-schedule";
import type { SqlExecutor } from "./postgres-commercial-workflow-repository";

interface ScheduleRow {
  readonly organization_id: string;
  readonly workflow_id: string;
  readonly integration_ids: readonly string[] | string;
  readonly interval_seconds: number;
  readonly enabled: boolean;
  readonly next_run_at: string | Date;
  readonly updated_at: string | Date;
  readonly updated_by: string;
  readonly lease_owner?: string | null;
  readonly lease_until?: string | Date | null;
  readonly last_started_at?: string | Date | null;
  readonly last_completed_at?: string | Date | null;
  readonly last_error?: string | null;
}

function iso(value: string | Date | null | undefined): string | undefined {
  if (value === null || value === undefined) return undefined;
  return new Date(value).toISOString();
}

function integrations(value: readonly string[] | string): readonly string[] {
  const parsed = typeof value === "string" ? (JSON.parse(value) as unknown) : value;
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
    throw new Error("Stored integration ids are invalid.");
  }
  return Object.freeze([...parsed]);
}

function decode(row: ScheduleRow): CommercialExecutionSchedule {
  return Object.freeze({
    organizationId: row.organization_id,
    workflowId: row.workflow_id,
    integrationIds: integrations(row.integration_ids),
    intervalSeconds: Number(row.interval_seconds),
    enabled: row.enabled,
    nextRunAt: iso(row.next_run_at) as string,
    updatedAt: iso(row.updated_at) as string,
    updatedBy: row.updated_by,
    leaseOwner: row.lease_owner ?? undefined,
    leaseUntil: iso(row.lease_until),
    lastStartedAt: iso(row.last_started_at),
    lastCompletedAt: iso(row.last_completed_at),
    lastError: row.last_error ?? undefined,
  });
}

const returning = `organization_id, workflow_id, integration_ids, interval_seconds,
  enabled, next_run_at, updated_at, updated_by, lease_owner, lease_until,
  last_started_at, last_completed_at, last_error`;

export class PostgresCommercialExecutionScheduleRepository
  implements CommercialExecutionScheduleRepository
{
  constructor(private readonly executor: SqlExecutor) {}

  async findById(
    organizationId: string,
    workflowId: string,
  ): Promise<CommercialExecutionSchedule | null> {
    const result = await this.executor.query<ScheduleRow>(
      `SELECT ${returning}
       FROM syntha_commercial_execution_schedule
       WHERE organization_id = $1 AND workflow_id = $2`,
      [organizationId, workflowId],
    );
    return result.rows[0] ? decode(result.rows[0]) : null;
  }

  async upsert(
    schedule: CommercialExecutionSchedule,
  ): Promise<CommercialExecutionSchedule> {
    const result = await this.executor.query<ScheduleRow>(
      `INSERT INTO syntha_commercial_execution_schedule
         (organization_id, workflow_id, integration_ids, interval_seconds,
          enabled, next_run_at, updated_at, updated_by)
       VALUES ($1, $2, $3::jsonb, $4, $5, $6::timestamptz, $7::timestamptz, $8)
       ON CONFLICT (organization_id, workflow_id) DO UPDATE SET
         integration_ids = EXCLUDED.integration_ids,
         interval_seconds = EXCLUDED.interval_seconds,
         enabled = EXCLUDED.enabled,
         next_run_at = EXCLUDED.next_run_at,
         updated_at = EXCLUDED.updated_at,
         updated_by = EXCLUDED.updated_by,
         lease_owner = CASE WHEN EXCLUDED.enabled THEN syntha_commercial_execution_schedule.lease_owner ELSE NULL END,
         lease_until = CASE WHEN EXCLUDED.enabled THEN syntha_commercial_execution_schedule.lease_until ELSE NULL END
       RETURNING ${returning}`,
      [
        schedule.organizationId,
        schedule.workflowId,
        JSON.stringify(schedule.integrationIds),
        schedule.intervalSeconds,
        schedule.enabled,
        schedule.nextRunAt,
        schedule.updatedAt,
        schedule.updatedBy,
      ],
    );
    const row = result.rows[0];
    if (!row) throw new Error("Commercial execution schedule was not saved.");
    return decode(row);
  }

  async claimDue(input: {
    readonly workerId: string;
    readonly now: string;
    readonly leaseSeconds: number;
    readonly maximumSchedules: number;
  }): Promise<readonly CommercialExecutionSchedule[]> {
    const leaseUntil = new Date(
      Date.parse(input.now) + Math.max(1, input.leaseSeconds) * 1000,
    ).toISOString();
    const result = await this.executor.query<ScheduleRow>(
      `WITH due AS (
         SELECT organization_id, workflow_id
         FROM syntha_commercial_execution_schedule
         WHERE enabled = TRUE
           AND next_run_at <= $1::timestamptz
           AND (lease_until IS NULL OR lease_until <= $1::timestamptz)
         ORDER BY next_run_at, organization_id, workflow_id
         FOR UPDATE SKIP LOCKED
         LIMIT $2
       )
       UPDATE syntha_commercial_execution_schedule AS schedule
       SET lease_owner = $3,
           lease_until = $4::timestamptz,
           last_started_at = $1::timestamptz,
           updated_at = $1::timestamptz
       FROM due
       WHERE schedule.organization_id = due.organization_id
         AND schedule.workflow_id = due.workflow_id
       RETURNING ${returning}`,
      [
        input.now,
        Math.max(1, Math.floor(input.maximumSchedules)),
        input.workerId,
        leaseUntil,
      ],
    );
    return Object.freeze(result.rows.map(decode));
  }

  async complete(input: {
    readonly organizationId: string;
    readonly workflowId: string;
    readonly workerId: string;
    readonly completedAt: string;
    readonly nextRunAt: string;
    readonly error?: string;
  }): Promise<boolean> {
    const result = await this.executor.query<ScheduleRow>(
      `UPDATE syntha_commercial_execution_schedule
       SET lease_owner = NULL,
           lease_until = NULL,
           last_completed_at = $4::timestamptz,
           next_run_at = $5::timestamptz,
           last_error = $6,
           updated_at = $4::timestamptz
       WHERE organization_id = $1
         AND workflow_id = $2
         AND lease_owner = $3
       RETURNING ${returning}`,
      [
        input.organizationId,
        input.workflowId,
        input.workerId,
        input.completedAt,
        input.nextRunAt,
        input.error ?? null,
      ],
    );
    return result.rowCount === 1;
  }
}
