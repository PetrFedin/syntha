import { describe, expect, it } from "vitest";

import type { DurableReplenishmentAccepted } from "@/domain/procurement/durable-replenishment-workflow";

import {
  createCommercialWorkflowState,
  InMemoryCommercialWorkflowRepository,
  persistDurableReplenishment,
  WorkflowVersionConflictError,
} from "../index";

function acceptedResult(): DurableReplenishmentAccepted {
  return {
    status: "accepted",
    beginOutcome: "started",
    result: {
      id: "AUTO-1",
      executionPlan: {
        contextId: "CTX-1",
        automaticActions: [
          {
            type: "create_purchase_order",
            priority: "medium",
            title: "Create purchase order",
            description: "Create an approved purchase order.",
            quantity: 20,
          },
        ],
      },
    },
    approvals: { contextId: "CTX-1" },
    journal: { contextId: "CTX-1" },
    outbox: { records: [] },
    idempotencyRegistry: { records: [] },
  } as unknown as DurableReplenishmentAccepted;
}

describe("commercial workflow persistence", () => {
  it("enforces optimistic concurrency", async () => {
    const repository = new InMemoryCommercialWorkflowRepository();
    const initial = createCommercialWorkflowState({
      id: "WF-1",
      createdAt: "2026-07-29T00:00:00.000Z",
    });
    const saved = await repository.save(initial, 0);

    await expect(repository.save(saved, 0)).rejects.toBeInstanceOf(
      WorkflowVersionConflictError,
    );
    expect(saved.version).toBe(1);
  });

  it("persists durable workflow state and creates external commands once", async () => {
    const repository = new InMemoryCommercialWorkflowRepository();
    const first = await persistDurableReplenishment({
      repository,
      workflowId: "WF-1",
      accepted: acceptedResult(),
      updatedAt: "2026-07-29T00:00:00.000Z",
    });
    const second = await persistDurableReplenishment({
      repository,
      workflowId: "WF-1",
      accepted: acceptedResult(),
      updatedAt: "2026-07-29T00:01:00.000Z",
    });

    expect(first.integrationCommands).toHaveLength(1);
    expect(second.integrationCommands).toHaveLength(1);
    expect(second.approvalWorkflows).toHaveLength(1);
    expect(second.executionJournals).toHaveLength(1);
    expect(second.version).toBe(2);
  });
});
