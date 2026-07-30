import { describe, expect, it } from "vitest";

import type { RecommendedAction } from "@/domain/decision/decision";

import {
  createCommercialWorkflowState,
  createIntegrationCommand,
  dispatchNextIntegrationCommand,
  InMemoryCommercialWorkflowRepository,
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
          idempotencyKey: "CMD-1",
          createdAt: "2026-07-29T00:00:00.000Z",
        }),
      ]),
    }),
    0,
  );
  return repository;
}

describe("integration command dispatcher", () => {
  it("leases and completes a command exactly once", async () => {
    const repository = await repositoryWithCommand();
    const result = await dispatchNextIntegrationCommand({
      repository,
      workflowId: "WF-1",
      integrationId: "erp",
      workerId: "worker-1",
      now: "2026-07-29T00:01:00.000Z",
      transport: {
        async execute(command) {
          expect(command.idempotencyKey).toBe("CMD-1");
          return { externalReference: "ERP-PO-100" };
        },
      },
    });
    const state = await repository.findById("WF-1");
    const replay = await dispatchNextIntegrationCommand({
      repository,
      workflowId: "WF-1",
      integrationId: "erp",
      workerId: "worker-2",
      now: "2026-07-29T00:02:00.000Z",
      transport: { async execute() { return {}; } },
    });

    expect(result.status).toBe("succeeded");
    expect(state?.integrationCommands[0]?.status).toBe("succeeded");
    expect(state?.integrationCommands[0]?.externalReference).toBe("ERP-PO-100");
    expect(replay.status).toBe("no_command");
  });

  it("opens the circuit and schedules a controlled retry", async () => {
    const repository = await repositoryWithCommand();
    const first = await dispatchNextIntegrationCommand({
      repository,
      workflowId: "WF-1",
      integrationId: "erp",
      workerId: "worker-1",
      now: "2026-07-29T00:01:00.000Z",
      policy: { failureThreshold: 1, openDurationSeconds: 60 },
      transport: { async execute() { throw new Error("ERP unavailable"); } },
    });
    const second = await dispatchNextIntegrationCommand({
      repository,
      workflowId: "WF-1",
      integrationId: "erp",
      workerId: "worker-2",
      now: "2026-07-29T00:01:30.000Z",
      policy: { failureThreshold: 1, openDurationSeconds: 60 },
      transport: { async execute() { return {}; } },
    });

    expect(first.status).toBe("retry_scheduled");
    expect(second.status).toBe("circuit_open");
    expect(second.retryAt).toBe("2026-07-29T00:02:00.000Z");
  });

  it("dead-letters a non-retryable command", async () => {
    const repository = await repositoryWithCommand();
    const result = await dispatchNextIntegrationCommand({
      repository,
      workflowId: "WF-1",
      integrationId: "erp",
      workerId: "worker-1",
      now: "2026-07-29T00:01:00.000Z",
      retryable: () => false,
      transport: { async execute() { throw new Error("Invalid ERP payload"); } },
    });
    const state = await repository.findById("WF-1");

    expect(result.status).toBe("dead_letter");
    expect(state?.integrationCommands[0]?.status).toBe("dead_letter");
  });
});
