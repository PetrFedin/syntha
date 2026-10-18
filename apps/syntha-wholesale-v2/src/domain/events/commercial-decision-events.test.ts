import { describe, expect, it } from "vitest";

import type { CommercialDecision } from "@/domain/decision/decision";
import { createDecisionExecutionPlan } from "@/domain/decision/decision-execution-gate";
import { resolveCommercialDecisions } from "@/domain/decision/unified-decision-engine";

import { createCommercialDecisionEvents } from "./commercial-decision-events";

const decision: CommercialDecision = {
  id: "DEC-1",
  entityType: "sku",
  entityId: "SKU-1",
  decisionType: "purchase",
  severity: "medium",
  confidence: 0.95,
  reasons: [],
  impacts: [],
  actions: [
    {
      type: "create_purchase_order",
      priority: "medium",
      title: "Create PO",
      description: "Create PO",
      quantity: 50,
    },
  ],
  createdAt: "2026-07-29T00:00:00.000Z",
  source: "test",
  version: 1,
};

describe("createCommercialDecisionEvents", () => {
  it("creates an ordered and correlated outbox event stream", () => {
    const resolution = resolveCommercialDecisions({
      contextId: "CTX-1",
      decisions: [decision],
      generatedAt: "2026-07-29T00:00:00.000Z",
    });
    const executionPlan = createDecisionExecutionPlan({
      resolution,
      policy: {
        automaticActionTypes: ["create_purchase_order"],
        maximumAutomaticPriority: "medium",
      },
      generatedAt: "2026-07-29T00:00:00.000Z",
    });
    const events = createCommercialDecisionEvents({
      resolution,
      executionPlan,
      occurredAt: "2026-07-29T00:00:00.000Z",
    });

    expect(events).toHaveLength(2);
    expect(events[0]?.eventType).toBe("commercial.decision.resolved");
    expect(events[1]?.eventType).toBe("commercial.action.auto_approved");
    expect(events[1]?.sequence).toBe(2);
    expect(events.every((event) => event.correlationId === "CTX-1")).toBe(true);
  });

  it("rejects mismatched contexts", () => {
    const resolution = resolveCommercialDecisions({
      contextId: "CTX-1",
      decisions: [decision],
    });
    const executionPlan = createDecisionExecutionPlan({ resolution });

    expect(() =>
      createCommercialDecisionEvents({
        resolution: { ...resolution, contextId: "CTX-2" },
        executionPlan,
      }),
    ).toThrow("context must match");
  });
});
