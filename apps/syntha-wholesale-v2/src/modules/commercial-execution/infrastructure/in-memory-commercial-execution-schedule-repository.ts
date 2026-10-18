import type { CommercialExecutionScheduleRepository } from "../application/commercial-execution-schedule-repository";
import type { CommercialExecutionSchedule } from "../domain/commercial-execution-schedule";

function key(organizationId: string, workflowId: string): string {
  return `${organizationId}\u0000${workflowId}`;
}

function clone(schedule: CommercialExecutionSchedule): CommercialExecutionSchedule {
  return Object.freeze({
    ...schedule,
    integrationIds: Object.freeze([...schedule.integrationIds]),
  });
}

export class InMemoryCommercialExecutionScheduleRepository
  implements CommercialExecutionScheduleRepository
{
  private readonly schedules = new Map<string, CommercialExecutionSchedule>();

  async findById(
    organizationId: string,
    workflowId: string,
  ): Promise<CommercialExecutionSchedule | null> {
    const schedule = this.schedules.get(key(organizationId, workflowId));
    return schedule ? clone(schedule) : null;
  }

  async upsert(
    schedule: CommercialExecutionSchedule,
  ): Promise<CommercialExecutionSchedule> {
    const current = this.schedules.get(
      key(schedule.organizationId, schedule.workflowId),
    );
    const next = clone({
      ...current,
      ...schedule,
      leaseOwner: schedule.enabled ? current?.leaseOwner : undefined,
      leaseUntil: schedule.enabled ? current?.leaseUntil : undefined,
      lastStartedAt: current?.lastStartedAt,
      lastCompletedAt: current?.lastCompletedAt,
      lastError: current?.lastError,
    });
    this.schedules.set(key(next.organizationId, next.workflowId), next);
    return clone(next);
  }

  async claimDue(input: {
    readonly workerId: string;
    readonly now: string;
    readonly leaseSeconds: number;
    readonly maximumSchedules: number;
  }): Promise<readonly CommercialExecutionSchedule[]> {
    const now = new Date(input.now);
    const leaseUntil = new Date(
      now.getTime() + Math.max(1, input.leaseSeconds) * 1000,
    ).toISOString();
    const due = [...this.schedules.values()]
      .filter((schedule) => schedule.enabled)
      .filter((schedule) => Date.parse(schedule.nextRunAt) <= now.getTime())
      .filter(
        (schedule) =>
          !schedule.leaseUntil || Date.parse(schedule.leaseUntil) <= now.getTime(),
      )
      .sort(
        (left, right) =>
          left.nextRunAt.localeCompare(right.nextRunAt) ||
          left.organizationId.localeCompare(right.organizationId) ||
          left.workflowId.localeCompare(right.workflowId),
      )
      .slice(0, Math.max(1, Math.floor(input.maximumSchedules)));
    const claimed = due.map((schedule) =>
      clone({
        ...schedule,
        leaseOwner: input.workerId,
        leaseUntil,
        lastStartedAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }),
    );
    for (const schedule of claimed) {
      this.schedules.set(
        key(schedule.organizationId, schedule.workflowId),
        schedule,
      );
    }
    return Object.freeze(claimed);
  }

  async complete(input: {
    readonly organizationId: string;
    readonly workflowId: string;
    readonly workerId: string;
    readonly completedAt: string;
    readonly nextRunAt: string;
    readonly error?: string;
  }): Promise<boolean> {
    const schedule = this.schedules.get(
      key(input.organizationId, input.workflowId),
    );
    if (!schedule || schedule.leaseOwner !== input.workerId) return false;
    const completed = clone({
      ...schedule,
      leaseOwner: undefined,
      leaseUntil: undefined,
      lastCompletedAt: new Date(input.completedAt).toISOString(),
      nextRunAt: new Date(input.nextRunAt).toISOString(),
      updatedAt: new Date(input.completedAt).toISOString(),
      lastError: input.error,
    });
    this.schedules.set(key(input.organizationId, input.workflowId), completed);
    return true;
  }
}
