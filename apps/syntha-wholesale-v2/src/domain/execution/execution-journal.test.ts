import { describe, expect, it } from "vitest";

import type { DecisionExecutionPlan } from "@/domain/decision/decision-execution-gate";
import type { CommercialDecision } from "@/domain/decision/decision";
import {
  createApprovalWorkflow,
  recordApprovalVote,
} from "./approval-workflow";
import {
  createExecutionJournal,
  releaseApprovedActions,
  transitionExecutionEntry,
} from "./execution-journal";

const decision: CommercialDecision = {
  id: "execution-1",
  entityType: "sku",
  entityId: "SKU-1",
  decisionType: "decision_execution_gate",
  severity: "high",
  confidence: 0.9,
  reasons: [],
  impacts: [],
  actions: [],
  createdAt: "2026-07-29T00:00:00.000Z",
  source: "test",
  version: 1,
};

const plan: DecisionExecutionPlan = {
  contextId: "CTX-1",
  status: "approval_required",
  confidence: 0.9,
  entries: [
    {
      action: {
        type: "create_purchase_order",
        priority: "high",
        title: "Create PO",
        description: "Create purchase order",
      },
      disposition: "approval_required",
      reasons: [],
    },
  ],
  automaticActions: [],
  approvalActions: [],
  blockedActions: [],
  decision,
};

describe("execution journal", () => {
  it("releases an approved action and records execution transitions", () => {
    const workflow = createApprovalWorkflow({ executionPlan: plan });
    const approved = recordApprovalVote({
      workflow,
      requestId: workflow.requests[0]!.id,
      approverId: "manager-1",
      role: "manager",
      outcome: "approve",
    });
    const initial = createExecutionJournal({ executionPlan: plan });
    const released = releaseApprovedActions({ journal: initial, workflow: approved });
    const running = transitionExecutionEntry({
      journal: released,
      entryId: released.entries[0]!.id,
      toStatus: "running",
      idempotencyKey: "run-1",
    });
    const completed = transitionExecutionEntry({
      journal: running,
      entryId: running.entries[0]!.id,
      toStatus: "succeeded",
      idempotencyKey: "complete-1",
      resultRef: "PO-100",
    });

    expect(released.entries[0]?.status).toBe("queued");
    expect(completed.status).toBe("completed");
    expect(completed.entries[0]?.resultRef).toBe("PO-100");
  });

  it("makes repeated transition commands idempotent", () => {
    const automaticPlan: DecisionExecutionPlan = {
      ...plan,
      status: "automatic",
      entries: [
        {
          ...plan.entries[0]!,
          disposition: "auto_execute",
        },
      ],
    };
    const journal = createExecutionJournal({ executionPlan: automaticPlan });
    const running = transitionExecutionEntry({
      journal,
      entryId: journal.entries[0]!.id,
      toStatus: "running",
      idempotencyKey: "run-1",
    });
    const replay = transitionExecutionEntry({
      journal: running,
      entryId: running.entries[0]!.id,
      toStatus: "running",
      idempotencyKey: "run-1",
    });

    expect(replay).toBe(running);
    expect(replay.events).toHaveLength(running.events.length);
  });
});
