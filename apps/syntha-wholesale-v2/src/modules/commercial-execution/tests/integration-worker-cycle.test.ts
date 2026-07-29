import { describe, expect, it } from "vitest";

import type { RecommendedAction } from "@/domain/decision/decision";

import {
  createCommercialWorkflowState,
  createIntegrationCommand,
  InMemoryCommercialWorkflowRepository,
  runIntegrationWorkerCycle,
} from "../index";

const action: RecommendedAction = {
  type: "create_purchase_order",
  priority: "medium",
  title: "Create PO",
  description: "Create purchase order in ERP.",
};

describe("runIntegrationWorkerCycle", () => {
  it("drains available commands and stops when the queue is empty", async () => {
    const repository = new InMemoryCommercialWorkflowRepository();
    const state = createCommercialWorkflowState({
      id: "WF-1",
      createdAt: "2026-07-29T00:00:00.000Z",
    });
    await repository.save(
      Object.freeze({
        ...state,
        integrationCommands: Object.freeze(
          ["CMD-1", "CMD-2"].map((id) =>
            createIntegrationCommand({
              id,
              workflowId: "WF-1",
              integrationId: "erp",
              action,
              idempotencyKey: id,
              createdAt: "2026-07-29T00:00:00.000Z",
            }),
          ),
        ),
      }),
      0,
    );
    const result = await runIntegrationWorkerCycle({
      repository,
      workflowId: "WF-1",
      workerId: "worker-1",
      integrationIds: ["erp"],
      now: "2026-07-29T00:01:00.000Z",
      transports: {
        get() {
          return { async execute(command) { return { externalReference: `EXT-${command.id}` }; } };
        },
      },
    });

    expect(result.processedCommands).toBe(2);
    expect(result.results.at(-1)?.status).toBe("no_command");
    expect(result.exhausted).toBe(false);
  });

  it("reports missing transports without touching the queue", async () => {
    const repository = new InMemoryCommercialWorkflowRepository();
    await repository.save(createCommercialWorkflowState({ id: "WF-1" }), 0);

    const result = await runIntegrationWorkerCycle({
      repository,
      workflowId: "WF-1",
      workerId: "worker-1",
      integrationIds: ["erp"],
      transports: { get() { return null; } },
    });

    expect(result.missingIntegrations).toEqual(["erp"]);
    expect(result.results).toHaveLength(0);
  });
});
