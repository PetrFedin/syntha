import { describe, expect, it } from "vitest";

import type { ApprovalWorkflow } from "@/domain/execution/approval-workflow";
import type { ExecutionJournal } from "@/domain/execution/execution-journal";
import type { TransactionalOutbox } from "@/domain/events/transactional-outbox";
import { assessDecisionOperations } from "./decision-operations-monitor";

const assessedAt = "2026-07-29T12:00:00.000Z";

describe("decision operations monitor", () => {
  it("creates a critical exception queue for expired, failed and dead-letter work", () => {
    const approvals: ApprovalWorkflow = {
      contextId: "CTX-1",
      status: "expired",
      requests: [{
        id: "APR-1",
        contextId: "CTX-1",
        entryIndex: 0,
        action: { type: "create_purchase_order", priority: "critical", title: "Create PO", description: "Create purchase order" },
        status: "expired",
        requiredApprovals: 2,
        allowedRoles: ["manager"],
        votes: [],
        createdAt: "2026-07-29T08:00:00.000Z",
        expiresAt: "2026-07-29T10:00:00.000Z",
        resolvedAt: "2026-07-29T10:00:00.000Z",
      }],
      createdAt: "2026-07-29T08:00:00.000Z",
      updatedAt: "2026-07-29T10:00:00.000Z",
    };
    const journal: ExecutionJournal = {
      contextId: "CTX-2",
      status: "failed",
      entries: [{
        id: "EXE-1",
        entryIndex: 0,
        action: { type: "create_purchase_order", priority: "high", title: "Create PO", description: "Create purchase order" },
        status: "failed",
        attempts: 1,
        updatedAt: "2026-07-29T11:00:00.000Z",
        error: "ERP unavailable",
      }],
      events: [],
      createdAt: "2026-07-29T11:00:00.000Z",
      updatedAt: "2026-07-29T11:00:00.000Z",
    };
    const outbox: TransactionalOutbox = {
      records: [{
        id: "OUT-1",
        event: {
          eventId: "OUT-1",
          eventType: "commercial.decision.resolved",
          aggregateType: "commercial_decision",
          aggregateId: "SKU-1",
          sequence: 1,
          occurredAt: "2026-07-29T10:00:00.000Z",
          correlationId: "CTX-3",
          causationId: "D-1",
          source: "commercial-decision-events",
          payload: {},
        },
        status: "dead_letter",
        attempts: 5,
        createdAt: "2026-07-29T10:00:00.000Z",
        updatedAt: "2026-07-29T11:30:00.000Z",
        nextAttemptAt: "2026-07-29T11:30:00.000Z",
        lastError: "broker unavailable",
      }],
    };

    const result = assessDecisionOperations({
      monitorId: "commercial-core",
      approvalWorkflows: [approvals],
      executionJournals: [journal],
      outboxes: [outbox],
      assessedAt,
    });

    expect(result.status).toBe("critical");
    expect(result.metrics.criticalAlertCount).toBe(3);
    expect(result.alerts.map((alert) => alert.type)).toEqual([
      "approval_expired",
      "execution_failed",
      "outbox_dead_letter",
    ]);
    expect(result.decision.entityType).toBe("system");
    expect(result.decision.actions.map((action) => action.type)).toContain("retry_delivery");
  });

  it("flags aging approvals before expiry", () => {
    const workflow: ApprovalWorkflow = {
      contextId: "CTX-1",
      status: "pending",
      requests: [{
        id: "APR-1",
        contextId: "CTX-1",
        entryIndex: 0,
        action: { type: "review", priority: "high", title: "Review", description: "Review action" },
        status: "pending",
        requiredApprovals: 1,
        allowedRoles: ["manager"],
        votes: [],
        createdAt: "2026-07-29T09:00:00.000Z",
        expiresAt: "2026-07-29T15:00:00.000Z",
      }],
      createdAt: "2026-07-29T09:00:00.000Z",
      updatedAt: "2026-07-29T09:00:00.000Z",
    };

    const result = assessDecisionOperations({
      monitorId: "commercial-core",
      approvalWorkflows: [workflow],
      policy: { approvalWarningMinutes: 120 },
      assessedAt,
    });

    expect(result.status).toBe("degraded");
    expect(result.alerts[0]?.type).toBe("approval_aging");
    expect(result.metrics.approvalSloViolationRate).toBe(1);
  });

  it("reports healthy operations when there is no exception", () => {
    const result = assessDecisionOperations({
      monitorId: "commercial-core",
      assessedAt,
    });

    expect(result.status).toBe("healthy");
    expect(result.alerts).toHaveLength(0);
    expect(result.decision.actions[0]?.type).toBe("none");
  });
});
