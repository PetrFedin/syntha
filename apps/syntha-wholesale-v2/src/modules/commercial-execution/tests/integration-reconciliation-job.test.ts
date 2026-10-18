import { describe, expect, it } from "vitest";

import type { RecommendedAction } from "@/domain/decision/decision";
import {
  createCommercialWorkflowState,
  createIntegrationCommand,
  InMemoryCommercialWorkflowRepository,
  runIntegrationReconciliationJob,
} from "../index";

const action: RecommendedAction = {
  type: "create_purchase_order",
  priority: "medium",
  title: "Create PO",
  description: "Create order",
};

describe("runIntegrationReconciliationJob", () => {
  it("applies an orphaned callback after the command becomes available", async () => {
    const repository = new InMemoryCommercialWorkflowRepository();
    const state = createCommercialWorkflowState({ id: "WF-1" });
    const command = createIntegrationCommand({
      id: "CMD-1",
      workflowId: "WF-1",
      integrationId: "erp",
      action,
      idempotencyKey: "IDEMP-1",
    });
    await repository.save(
      Object.freeze({
        ...state,
        integrationCommands: Object.freeze([command]),
        integrationInbox: Object.freeze([
          {
            id: "erp:EVENT-1",
            integrationId: "erp",
            externalEventId: "EVENT-1",
            outcome: "succeeded" as const,
            status: "orphaned" as const,
            occurredAt: "2026-07-29T00:00:00.000Z",
            receivedAt: "2026-07-29T00:01:00.000Z",
            payload: Object.freeze({ idempotencyKey: "IDEMP-1" }),
          },
        ]),
      }),
      0,
    );

    const result = await runIntegrationReconciliationJob({
      repository,
      workflowId: "WF-1",
      jobId: "JOB-1",
      actorId: "worker-1",
      occurredAt: "2026-07-29T00:02:00.000Z",
    });

    expect(result.status).toBe("completed");
    expect(result.state?.integrationCommands[0]?.status).toBe("succeeded");
    expect(result.state?.integrationInbox[0]?.status).toBe("applied");
  });

  it("keeps a dangerous contradiction unresolved", async () => {
    const repository = new InMemoryCommercialWorkflowRepository();
    const state = createCommercialWorkflowState({ id: "WF-1" });
    const command = Object.freeze({
      ...createIntegrationCommand({
        id: "CMD-1",
        workflowId: "WF-1",
        integrationId: "erp",
        action,
        idempotencyKey: "IDEMP-1",
      }),
      status: "succeeded" as const,
    });
    await repository.save(
      Object.freeze({
        ...state,
        integrationCommands: Object.freeze([command]),
        integrationInbox: Object.freeze([
          {
            id: "erp:EVENT-1",
            integrationId: "erp",
            externalEventId: "EVENT-1",
            outcome: "rejected" as const,
            status: "conflict" as const,
            occurredAt: "2026-07-29T00:00:00.000Z",
            receivedAt: "2026-07-29T00:01:00.000Z",
            payload: Object.freeze({ commandId: "CMD-1" }),
            commandId: "CMD-1",
          },
        ]),
      }),
      0,
    );

    const result = await runIntegrationReconciliationJob({
      repository,
      workflowId: "WF-1",
      jobId: "JOB-1",
      actorId: "worker-1",
    });

    expect(result.status).toBe("completed_with_unresolved");
    expect(result.state?.integrationCommands[0]?.status).toBe("succeeded");
    expect(result.state?.integrationInbox[0]?.status).toBe("conflict");
  });
});
