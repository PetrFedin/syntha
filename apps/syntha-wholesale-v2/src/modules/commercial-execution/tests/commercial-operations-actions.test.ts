import { describe, expect, it } from "vitest";

import type { RecommendedAction } from "@/domain/decision/decision";
import {
  createIntegrationCircuit,
  recordIntegrationFailure,
} from "@/domain/execution/integration-resilience";

import {
  applyCommercialOperationsAction,
  createCommercialWorkflowState,
  createIntegrationCommand,
  InMemoryCommercialWorkflowRepository,
} from "../index";

const action: RecommendedAction = {
  type: "create_purchase_order",
  priority: "medium",
  title: "Create PO",
  description: "Create purchase order in ERP.",
};

async function setup() {
  const repository = new InMemoryCommercialWorkflowRepository();
  const state = createCommercialWorkflowState({
    id: "WF-1",
    createdAt: "2026-07-29T00:00:00.000Z",
  });
  const command = Object.freeze({
    ...createIntegrationCommand({
      id: "CMD-1",
      workflowId: "WF-1",
      integrationId: "erp",
      action,
      idempotencyKey: "CMD-1",
      createdAt: "2026-07-29T00:00:00.000Z",
    }),
    status: "dead_letter" as const,
    attempts: 5,
    completedAt: "2026-07-29T00:01:00.000Z",
    lastError: "ERP unavailable",
  });
  const failedCircuit = recordIntegrationFailure({
    circuit: createIntegrationCircuit({
      integrationId: "erp",
      createdAt: "2026-07-29T00:00:00.000Z",
    }),
    attempt: 1,
    error: "ERP unavailable",
    retryable: true,
    policy: { failureThreshold: 1 },
    failedAt: "2026-07-29T00:01:00.000Z",
  }).circuit;
  await repository.save(
    Object.freeze({
      ...state,
      integrationCommands: Object.freeze([command]),
      integrationCircuits: Object.freeze([failedCircuit]),
    }),
    0,
  );
  return repository;
}

describe("applyCommercialOperationsAction", () => {
  it("requeues a dead-letter command and audits the actor", async () => {
    const repository = await setup();
    const result = await applyCommercialOperationsAction({
      repository,
      workflowId: "WF-1",
      action: {
        actionId: "ACTION-1",
        actionType: "retry_command",
        targetId: "CMD-1",
        actorId: "ops-user-1",
        reason: "ERP recovered",
      },
      occurredAt: "2026-07-29T00:02:00.000Z",
    });

    expect(result.status).toBe("applied");
    expect(result.state?.integrationCommands[0]?.status).toBe("pending");
    expect(result.state?.integrationCommands[0]?.attempts).toBe(0);
    expect(result.audit?.actorId).toBe("ops-user-1");
  });

  it("makes repeated operator actions idempotent", async () => {
    const repository = await setup();
    const input = {
      repository,
      workflowId: "WF-1",
      action: {
        actionId: "ACTION-1",
        actionType: "reset_circuit" as const,
        targetId: "erp",
        actorId: "ops-user-1",
      },
      occurredAt: "2026-07-29T00:02:00.000Z",
    };
    const first = await applyCommercialOperationsAction(input);
    const duplicate = await applyCommercialOperationsAction(input);

    expect(first.status).toBe("applied");
    expect(first.state?.integrationCircuits[0]?.state).toBe("closed");
    expect(duplicate.status).toBe("duplicate");
    expect(duplicate.state?.operationsAudit).toHaveLength(1);
  });

  it("audits invalid state without changing a succeeded command", async () => {
    const repository = await setup();
    const current = await repository.findById("WF-1");
    await repository.save(
      Object.freeze({
        ...current!,
        integrationCommands: Object.freeze([
          Object.freeze({
            ...current!.integrationCommands[0]!,
            status: "succeeded" as const,
          }),
        ]),
      }),
      current!.version,
    );

    const result = await applyCommercialOperationsAction({
      repository,
      workflowId: "WF-1",
      action: {
        actionId: "ACTION-2",
        actionType: "cancel_command",
        targetId: "CMD-1",
        actorId: "ops-user-1",
      },
    });

    expect(result.status).toBe("invalid_state");
    expect(result.state?.integrationCommands[0]?.status).toBe("succeeded");
    expect(result.audit?.outcome).toBe("invalid_state");
  });
});
