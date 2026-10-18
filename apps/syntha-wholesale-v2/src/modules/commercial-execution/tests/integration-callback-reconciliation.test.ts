import { describe, expect, it } from "vitest";

import type { RecommendedAction } from "@/domain/decision/decision";

import {
  createCommercialWorkflowState,
  createIntegrationCommand,
  InMemoryCommercialWorkflowRepository,
  reconcileIntegrationCallback,
} from "../index";

const action: RecommendedAction = {
  type: "create_purchase_order",
  priority: "medium",
  title: "Create PO",
  description: "Create purchase order in ERP.",
  quantity: 20,
};

async function repositoryWithCommand() {
  const repository = new InMemoryCommercialWorkflowRepository();
  const state = createCommercialWorkflowState({
    id: "WF-1",
    createdAt: "2026-07-29T00:00:00.000Z",
  });
  await repository.save(
    Object.freeze({
      ...state,
      integrationCommands: Object.freeze([
        createIntegrationCommand({
          id: "CMD-1",
          workflowId: "WF-1",
          integrationId: "erp",
          action,
          idempotencyKey: "IDEMP-1",
          createdAt: "2026-07-29T00:00:00.000Z",
        }),
      ]),
    }),
    0,
  );
  return repository;
}

describe("integration callback reconciliation", () => {
  it("applies a success callback and deduplicates its replay", async () => {
    const repository = await repositoryWithCommand();
    const callback = {
      externalEventId: "ERP-EVENT-1",
      integrationId: "erp",
      outcome: "succeeded" as const,
      occurredAt: "2026-07-29T00:05:00.000Z",
      idempotencyKey: "IDEMP-1",
      externalReference: "ERP-PO-100",
    };
    const applied = await reconcileIntegrationCallback({
      repository,
      workflowId: "WF-1",
      callback,
      receivedAt: "2026-07-29T00:05:01.000Z",
    });
    const replay = await reconcileIntegrationCallback({
      repository,
      workflowId: "WF-1",
      callback,
      receivedAt: "2026-07-29T00:06:00.000Z",
    });

    expect(applied.status).toBe("applied");
    expect(applied.state.integrationCommands[0]?.status).toBe("succeeded");
    expect(applied.state.integrationCommands[0]?.externalReference).toBe(
      "ERP-PO-100",
    );
    expect(replay.status).toBe("duplicate");
    expect(replay.state.integrationInbox).toHaveLength(1);
  });

  it("stores an orphaned callback for later investigation", async () => {
    const repository = await repositoryWithCommand();
    const result = await reconcileIntegrationCallback({
      repository,
      workflowId: "WF-1",
      callback: {
        externalEventId: "ERP-EVENT-2",
        integrationId: "erp",
        outcome: "rejected",
        occurredAt: "2026-07-29T00:05:00.000Z",
        commandId: "UNKNOWN",
        error: "Unknown purchase order",
      },
    });

    expect(result.status).toBe("orphaned");
    expect(result.inboxRecord.commandId).toBeUndefined();
  });

  it("rejects a contradictory callback for a succeeded command", async () => {
    const repository = await repositoryWithCommand();
    await reconcileIntegrationCallback({
      repository,
      workflowId: "WF-1",
      callback: {
        externalEventId: "ERP-EVENT-1",
        integrationId: "erp",
        outcome: "succeeded",
        occurredAt: "2026-07-29T00:05:00.000Z",
        commandId: "CMD-1",
      },
    });
    const conflict = await reconcileIntegrationCallback({
      repository,
      workflowId: "WF-1",
      callback: {
        externalEventId: "ERP-EVENT-3",
        integrationId: "erp",
        outcome: "rejected",
        occurredAt: "2026-07-29T00:07:00.000Z",
        commandId: "CMD-1",
        error: "Late rejection",
      },
    });

    expect(conflict.status).toBe("conflict");
    expect(conflict.state.integrationCommands[0]?.status).toBe("succeeded");
    expect(conflict.inboxRecord.conflictReason).toContain("cannot be changed");
  });
});
