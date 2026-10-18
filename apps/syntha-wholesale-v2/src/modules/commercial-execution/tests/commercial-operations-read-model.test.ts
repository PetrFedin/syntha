import { describe, expect, it } from "vitest";

import type { RecommendedAction } from "@/domain/decision/decision";
import type { IntegrationInboxRecord } from "../domain/integration-inbox";

import {
  createCommercialWorkflowState,
  createIntegrationCommand,
  getCommercialOperationsReadModel,
  InMemoryCommercialWorkflowRepository,
} from "../index";

const action: RecommendedAction = {
  type: "create_purchase_order",
  priority: "medium",
  title: "Create PO",
  description: "Create purchase order in ERP.",
};

const callback: IntegrationInboxRecord = {
  id: "erp:EVENT-1",
  integrationId: "erp",
  externalEventId: "EVENT-1",
  outcome: "succeeded",
  status: "orphaned",
  occurredAt: "2026-07-29T00:00:30.000Z",
  receivedAt: "2026-07-29T00:01:00.000Z",
  payload: Object.freeze({}),
};

describe("getCommercialOperationsReadModel", () => {
  it("returns operational queues without exposing command payloads", async () => {
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
        integrationInbox: Object.freeze([callback]),
      }),
      0,
    );

    const readModel = await getCommercialOperationsReadModel({
      repository,
      workflowId: "WF-1",
      assessedAt: "2026-07-29T00:02:00.000Z",
    });

    expect(readModel?.metrics.pendingCommands).toBe(1);
    expect(readModel?.metrics.orphanedCallbacks).toBe(1);
    expect(readModel?.callbacks[0]?.occurredAt).toBe(
      "2026-07-29T00:00:30.000Z",
    );
    expect(readModel?.commands[0]).not.toHaveProperty("payload");
  });
});
