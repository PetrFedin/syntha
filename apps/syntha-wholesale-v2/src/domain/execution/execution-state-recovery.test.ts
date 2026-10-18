import { describe, expect, it } from "vitest";

import type { DecisionExecutionPlan } from "@/domain/decision/decision-execution-gate";
import type { CommercialDecision } from "@/domain/decision/decision";
import {
  createExecutionJournal,
  transitionExecutionEntry,
} from "./execution-journal";
import {
  recoverExecutionState,
  verifyExecutionJournalIntegrity,
} from "./execution-state-recovery";

const decision: CommercialDecision = {
  id: "execution-1",
  entityType: "sku",
  entityId: "SKU-1",
  decisionType: "decision_execution_gate",
  severity: "medium",
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
  status: "automatic",
  confidence: 0.9,
  entries: [
    {
      action: {
        type: "create_purchase_order",
        priority: "medium",
        title: "Create PO",
        description: "Create purchase order",
      },
      disposition: "auto_execute",
      reasons: [],
    },
  ],
  automaticActions: [],
  approvalActions: [],
  blockedActions: [],
  decision,
};

describe("execution state recovery", () => {
  it("rebuilds completed state from journal events", () => {
    const initial = createExecutionJournal({
      executionPlan: plan,
      createdAt: "2026-07-29T00:00:00.000Z",
    });
    const running = transitionExecutionEntry({
      journal: initial,
      entryId: initial.entries[0]!.id,
      toStatus: "running",
      idempotencyKey: "run-1",
      occurredAt: "2026-07-29T00:01:00.000Z",
    });
    const completed = transitionExecutionEntry({
      journal: running,
      entryId: running.entries[0]!.id,
      toStatus: "succeeded",
      idempotencyKey: "complete-1",
      occurredAt: "2026-07-29T00:02:00.000Z",
      resultRef: "PO-1",
    });

    const recovered = recoverExecutionState(completed.events);
    const verified = verifyExecutionJournalIntegrity(completed);

    expect(recovered.status).toBe("completed");
    expect(recovered.entries[0]?.attempts).toBe(1);
    expect(recovered.entries[0]?.resultRef).toBe("PO-1");
    expect(verified.integrityErrors).toHaveLength(0);
  });

  it("detects an invalid transition history", () => {
    const recovered = recoverExecutionState([
      {
        eventId: "e1",
        entryId: "entry-1",
        toStatus: "queued",
        occurredAt: "2026-07-29T00:00:00.000Z",
      },
      {
        eventId: "e2",
        entryId: "entry-1",
        fromStatus: "running",
        toStatus: "succeeded",
        occurredAt: "2026-07-29T00:01:00.000Z",
      },
    ]);

    expect(recovered.integrityErrors.length).toBeGreaterThan(0);
    expect(recovered.entries[0]?.status).toBe("queued");
  });
});
