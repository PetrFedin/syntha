import { describe, expect, it } from "vitest";

import type { RecommendedAction } from "@/domain/decision/decision";
import {
  createCommercialExecutionSchedule,
  createCommercialWorkflowState,
  createIntegrationCommand,
  InMemoryCommercialExecutionScheduleRepository,
  InMemoryCommercialWorkflowRepository,
  runCommercialExecutionSchedulerCycle,
  scopeCommercialWorkflowRepository,
  type CommercialExecutionUnitOfWork,
} from "../index";

const action: RecommendedAction = {
  type: "create_purchase_order",
  priority: "medium",
  title: "Create PO",
  description: "Create purchase order.",
};

describe("runCommercialExecutionSchedulerCycle", () => {
  it("claims and processes tenant-scoped schedules exactly once", async () => {
    const repository = new InMemoryCommercialWorkflowRepository();
    const scoped = scopeCommercialWorkflowRepository(repository, "ORG-A");
    const state = createCommercialWorkflowState({
      id: "WF-1",
      createdAt: "2026-07-29T00:00:00.000Z",
    });
    await scoped.save(
      Object.freeze({
        ...state,
        integrationCommands: Object.freeze([
          createIntegrationCommand({
            id: "CMD-1",
            workflowId: "WF-1",
            integrationId: "erp",
            action,
            idempotencyKey: "CMD-1",
            createdAt: "2026-07-29T00:00:00.000Z",
          }),
        ]),
      }),
      0,
    );
    const schedules = new InMemoryCommercialExecutionScheduleRepository();
    await schedules.upsert(
      createCommercialExecutionSchedule({
        organizationId: "ORG-A",
        workflowId: "WF-1",
        integrationIds: ["erp"],
        intervalSeconds: 300,
        nextRunAt: "2026-07-29T00:00:00.000Z",
        updatedAt: "2026-07-29T00:00:00.000Z",
        updatedBy: "operator-1",
      }),
    );
    const unitOfWork: CommercialExecutionUnitOfWork = {
      async execute(work) {
        return work(repository);
      },
    };

    const result = await runCommercialExecutionSchedulerCycle({
      repository,
      unitOfWork,
      schedules,
      transports: {
        get() {
          return {
            async execute(command) {
              return { externalReference: `ERP-${command.id}` };
            },
          };
        },
      },
      workerId: "scheduler-1",
      now: "2026-07-29T00:01:00.000Z",
    });
    const saved = await scoped.findById("WF-1");
    const replay = await runCommercialExecutionSchedulerCycle({
      repository,
      unitOfWork,
      schedules,
      transports: { get() { return null; } },
      workerId: "scheduler-2",
      now: "2026-07-29T00:01:30.000Z",
    });

    expect(result.claimedSchedules).toBe(1);
    expect(result.results[0]?.status).toBe("completed");
    expect(saved?.integrationCommands[0]?.status).toBe("succeeded");
    expect(saved?.integrationCommands[0]?.organizationId).toBe("ORG-A");
    expect(replay.claimedSchedules).toBe(0);
  });
});
