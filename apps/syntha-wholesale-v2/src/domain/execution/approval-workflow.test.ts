import { describe, expect, it } from "vitest";

import type { DecisionExecutionPlan } from "@/domain/decision/decision-execution-gate";
import type { CommercialDecision } from "@/domain/decision/decision";

import {
  createApprovalWorkflow,
  recordApprovalVote,
  refreshApprovalWorkflow,
} from "./approval-workflow";

const decision: CommercialDecision = {
  id: "execution-1",
  entityType: "sku",
  entityId: "SKU-1",
  decisionType: "decision_execution_gate",
  severity: "high",
  confidence: 0.8,
  reasons: [],
  impacts: [],
  actions: [],
  createdAt: "2026-07-29T00:00:00.000Z",
  source: "test",
  version: 1,
};

const executionPlan: DecisionExecutionPlan = {
  contextId: "CTX-1",
  status: "approval_required",
  confidence: 0.8,
  entries: [
    {
      action: {
        type: "create_purchase_order",
        priority: "critical",
        title: "Create PO",
        description: "Create purchase order",
        quantity: 100,
      },
      disposition: "approval_required",
      reasons: ["Critical priority"],
    },
  ],
  automaticActions: [],
  approvalActions: [],
  blockedActions: [],
  decision,
};

describe("approval workflow", () => {
  it("requires two approvals for a critical action", () => {
    const workflow = createApprovalWorkflow({
      executionPlan,
      createdAt: "2026-07-29T00:00:00.000Z",
    });
    const first = recordApprovalVote({
      workflow,
      requestId: workflow.requests[0]!.id,
      approverId: "buyer-1",
      role: "buyer",
      outcome: "approve",
      decidedAt: "2026-07-29T01:00:00.000Z",
    });
    const second = recordApprovalVote({
      workflow: first,
      requestId: workflow.requests[0]!.id,
      approverId: "manager-1",
      role: "manager",
      outcome: "approve",
      decidedAt: "2026-07-29T02:00:00.000Z",
    });

    expect(first.status).toBe("pending");
    expect(second.status).toBe("approved");
  });

  it("rejects the workflow immediately after a rejection", () => {
    const workflow = createApprovalWorkflow({ executionPlan });
    const rejected = recordApprovalVote({
      workflow,
      requestId: workflow.requests[0]!.id,
      approverId: "manager-1",
      role: "manager",
      outcome: "reject",
    });

    expect(rejected.status).toBe("rejected");
  });

  it("expires unresolved requests", () => {
    const workflow = createApprovalWorkflow({
      executionPlan,
      policy: { expiresInHours: 1 },
      createdAt: "2026-07-29T00:00:00.000Z",
    });
    const expired = refreshApprovalWorkflow(
      workflow,
      "2026-07-29T02:00:00.000Z",
    );

    expect(expired.status).toBe("expired");
  });
});
