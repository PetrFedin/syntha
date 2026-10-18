import type { CommercialExecutionUnitOfWork } from "./commercial-execution-unit-of-work";
import type { CommercialExecutionScheduleRepository } from "./commercial-execution-schedule-repository";
import type { CommercialWorkflowRepository } from "./commercial-workflow-repository";
import { scopeCommercialWorkflowRepository } from "./organization-scoped-commercial-workflow-repository";
import { runIntegrationReconciliationJob } from "./run-integration-reconciliation-job";
import {
  runIntegrationWorkerCycle,
  type IntegrationTransportRegistry,
  type IntegrationWorkerCycleResult,
} from "./run-integration-worker-cycle";

export interface CommercialExecutionSchedulerItemResult {
  readonly organizationId: string;
  readonly workflowId: string;
  readonly status: "completed" | "retry_scheduled" | "lease_lost";
  readonly nextRunAt: string;
  readonly worker?: IntegrationWorkerCycleResult;
  readonly error?: string;
}

export interface CommercialExecutionSchedulerCycleResult {
  readonly workerId: string;
  readonly claimedSchedules: number;
  readonly completedSchedules: number;
  readonly results: readonly CommercialExecutionSchedulerItemResult[];
}

function addSeconds(value: string, seconds: number): string {
  return new Date(Date.parse(value) + seconds * 1000).toISOString();
}

export async function runCommercialExecutionSchedulerCycle(input: {
  readonly repository: CommercialWorkflowRepository;
  readonly unitOfWork: CommercialExecutionUnitOfWork;
  readonly schedules: CommercialExecutionScheduleRepository;
  readonly transports: IntegrationTransportRegistry;
  readonly workerId: string;
  readonly now?: string;
  readonly leaseSeconds?: number;
  readonly maximumSchedules?: number;
  readonly maximumCommandsPerWorkflow?: number;
}): Promise<CommercialExecutionSchedulerCycleResult> {
  if (!input.workerId.trim()) throw new Error("Scheduler worker id is required.");
  const now = new Date(input.now ?? new Date().toISOString()).toISOString();
  const schedules = await input.schedules.claimDue({
    workerId: input.workerId,
    now,
    leaseSeconds: Math.max(30, Math.floor(input.leaseSeconds ?? 300)),
    maximumSchedules: Math.max(1, Math.floor(input.maximumSchedules ?? 50)),
  });
  const results: CommercialExecutionSchedulerItemResult[] = [];

  for (const schedule of schedules) {
    const scopedRepository = scopeCommercialWorkflowRepository(
      input.repository,
      schedule.organizationId,
    );
    try {
      const worker = await runIntegrationWorkerCycle({
        repository: scopedRepository,
        transports: input.transports,
        workflowId: schedule.workflowId,
        integrationIds: schedule.integrationIds,
        workerId: input.workerId,
        now,
        maximumCommands: Math.max(
          1,
          Math.floor(input.maximumCommandsPerWorkflow ?? 100),
        ),
      });
      await input.unitOfWork.execute((repository) =>
        runIntegrationReconciliationJob({
          repository: scopeCommercialWorkflowRepository(
            repository,
            schedule.organizationId,
          ),
          workflowId: schedule.workflowId,
          jobId: `scheduler:${schedule.organizationId}:${schedule.workflowId}:${schedule.lastStartedAt ?? now}`,
          actorId: input.workerId,
          maximumRecords: 100,
        }),
      );
      const missing = worker.missingIntegrations.length > 0;
      const error = missing
        ? `Missing transports: ${worker.missingIntegrations.join(", ")}.`
        : undefined;
      const nextRunAt = addSeconds(
        now,
        missing ? Math.min(300, schedule.intervalSeconds) : schedule.intervalSeconds,
      );
      const completed = await input.schedules.complete({
        organizationId: schedule.organizationId,
        workflowId: schedule.workflowId,
        workerId: input.workerId,
        completedAt: now,
        nextRunAt,
        error,
      });
      results.push(
        Object.freeze({
          organizationId: schedule.organizationId,
          workflowId: schedule.workflowId,
          status: completed
            ? error
              ? "retry_scheduled"
              : "completed"
            : "lease_lost",
          nextRunAt,
          worker,
          error,
        }),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown scheduler failure.";
      const nextRunAt = addSeconds(now, Math.min(300, schedule.intervalSeconds));
      const completed = await input.schedules.complete({
        organizationId: schedule.organizationId,
        workflowId: schedule.workflowId,
        workerId: input.workerId,
        completedAt: now,
        nextRunAt,
        error: message,
      });
      results.push(
        Object.freeze({
          organizationId: schedule.organizationId,
          workflowId: schedule.workflowId,
          status: completed ? "retry_scheduled" : "lease_lost",
          nextRunAt,
          error: message,
        }),
      );
    }
  }

  return Object.freeze({
    workerId: input.workerId,
    claimedSchedules: schedules.length,
    completedSchedules: results.filter((result) => result.status === "completed")
      .length,
    results: Object.freeze(results),
  });
}
