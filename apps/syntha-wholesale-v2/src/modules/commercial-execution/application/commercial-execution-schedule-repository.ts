import type { CommercialExecutionSchedule } from "../domain/commercial-execution-schedule";

export interface CommercialExecutionScheduleRepository {
  findById(
    organizationId: string,
    workflowId: string,
  ): Promise<CommercialExecutionSchedule | null>;
  upsert(
    schedule: CommercialExecutionSchedule,
  ): Promise<CommercialExecutionSchedule>;
  claimDue(input: {
    readonly workerId: string;
    readonly now: string;
    readonly leaseSeconds: number;
    readonly maximumSchedules: number;
  }): Promise<readonly CommercialExecutionSchedule[]>;
  complete(input: {
    readonly organizationId: string;
    readonly workflowId: string;
    readonly workerId: string;
    readonly completedAt: string;
    readonly nextRunAt: string;
    readonly error?: string;
  }): Promise<boolean>;
}
