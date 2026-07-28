import { describe, expect, it } from "vitest";

import type {
  CommercialDecision,
  DecisionActionType,
  DecisionSeverity,
} from "./decision";
import { resolveCommercialDecisions } from "./unified-decision-engine";

function decision(input: {
  id: string;
  severity: DecisionSeverity;
  confidence?: number;
  action: DecisionActionType;
  priority?: DecisionSeverity;
}): CommercialDecision {
  return {
    id: input.id,
    entityType: "sku",
    entityId: "SKU-1",
    decisionType: input.id,
    severity: input.severity,
    confidence: input.confidence ?? 0.8,
    reasons: [],
    impacts: [],
    actions: [
      {
        type: input.action,
        priority: input.priority ?? input.severity,
        title: input.action,
        description: input.action,
      },
    ],
    createdAt: "2026-07-29T00:00:00.000Z",
    source: "test",
    version: 1,
  };
}

describe("resolveCommercialDecisions", () => {
  it("ranks decisions by severity and removes duplicate actions", () => {
    const repeated = decision({
      id: "inventory-1",
      severity: "high",
      action: "markdown_review",
    });
    const result = resolveCommercialDecisions({
      contextId: "SKU-1",
      decisions: [
        decision({
          id: "purchase-1",
          severity: "critical",
          action: "create_purchase_order",
        }),
        repeated,
        { ...repeated, id: "inventory-2" },
      ],
      generatedAt: "2026-07-29T00:00:00.000Z",
    });

    expect(result.orderedDecisions[0]?.id).toBe("purchase-1");
    expect(result.actions).toHaveLength(2);
    expect(result.status).toBe("clear");
  });

  it("suppresses conflicting automatic actions", () => {
    const result = resolveCommercialDecisions({
      contextId: "SKU-1",
      decisions: [
        decision({
          id: "inventory",
          severity: "high",
          action: "stop_replenishment",
        }),
        decision({
          id: "purchase",
          severity: "high",
          action: "create_purchase_order",
        }),
      ],
      generatedAt: "2026-07-29T00:00:00.000Z",
    });

    expect(result.status).toBe("requires_review");
    expect(result.conflicts).toHaveLength(1);
    expect(result.suppressedActions).toHaveLength(2);
    expect(result.actions.map((action) => action.type)).toEqual(["review"]);
  });

  it("blocks execution for a critical supplier or budget blocker", () => {
    const result = resolveCommercialDecisions({
      contextId: "SKU-1",
      decisions: [
        decision({
          id: "supplier",
          severity: "critical",
          action: "supplier_review",
          priority: "critical",
        }),
      ],
      generatedAt: "2026-07-29T00:00:00.000Z",
    });

    expect(result.status).toBe("blocked");
    expect(result.maxSeverity).toBe("critical");
  });
});
