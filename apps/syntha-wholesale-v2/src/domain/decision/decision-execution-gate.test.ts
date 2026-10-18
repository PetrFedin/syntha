import { describe, expect, it } from "vitest";

import type { CommercialDecision } from "./decision";
import { createDecisionExecutionPlan } from "./decision-execution-gate";
import { resolveCommercialDecisions } from "./unified-decision-engine";

function resolutionFor(decision: CommercialDecision) {
  return resolveCommercialDecisions({
    contextId: "CTX-1",
    decisions: [decision],
    generatedAt: "2026-07-29T00:00:00.000Z",
  });
}

function decision(action: CommercialDecision["actions"][number]): CommercialDecision {
  return {
    id: "DEC-1",
    entityType: "sku",
    entityId: "SKU-1",
    decisionType: "test",
    severity: action.priority,
    confidence: 0.95,
    reasons: [],
    impacts: [],
    actions: [action],
    createdAt: "2026-07-29T00:00:00.000Z",
    source: "test",
    version: 1,
  };
}

describe("createDecisionExecutionPlan", () => {
  it("allows an explicitly permitted low-risk action", () => {
    const plan = createDecisionExecutionPlan({
      resolution: resolutionFor(
        decision({
          type: "create_purchase_order",
          priority: "medium",
          title: "Create PO",
          description: "Create PO",
        }),
      ),
      policy: {
        minimumConfidence: 0.8,
        maximumAutomaticPriority: "medium",
        automaticActionTypes: ["create_purchase_order"],
      },
      generatedAt: "2026-07-29T00:00:00.000Z",
    });

    expect(plan.status).toBe("automatic");
    expect(plan.automaticActions).toHaveLength(1);
  });

  it("requires approval for high-priority purchase execution", () => {
    const plan = createDecisionExecutionPlan({
      resolution: resolutionFor(
        decision({
          type: "create_purchase_order",
          priority: "high",
          title: "Create PO",
          description: "Create PO",
        }),
      ),
      policy: {
        maximumAutomaticPriority: "medium",
        automaticActionTypes: ["create_purchase_order"],
      },
    });

    expect(plan.status).toBe("approval_required");
    expect(plan.approvalActions).toHaveLength(1);
  });

  it("blocks execution for critical data repair", () => {
    const plan = createDecisionExecutionPlan({
      resolution: resolutionFor(
        decision({
          type: "repair_data",
          priority: "critical",
          title: "Repair data",
          description: "Repair data",
        }),
      ),
    });

    expect(plan.status).toBe("blocked");
    expect(plan.blockedActions[0]?.type).toBe("repair_data");
  });

  it("never auto-executes a markdown review", () => {
    const plan = createDecisionExecutionPlan({
      resolution: resolutionFor(
        decision({
          type: "markdown_review",
          priority: "medium",
          title: "Markdown",
          description: "Markdown",
        }),
      ),
      policy: {
        automaticActionTypes: ["markdown_review"],
        maximumAutomaticPriority: "critical",
      },
    });

    expect(plan.status).toBe("approval_required");
  });
});
