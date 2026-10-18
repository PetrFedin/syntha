import type { DecisionExecutionPlan } from "@/domain/decision/decision-execution-gate";
import type { UnifiedDecisionResult } from "@/domain/decision/unified-decision-engine";

export type CommercialDecisionEventType =
  | "commercial.decision.resolved"
  | "commercial.decision.provenance_recorded"
  | "commercial.action.informational"
  | "commercial.action.auto_approved"
  | "commercial.action.approval_required"
  | "commercial.action.blocked";

export interface CommercialDecisionEvent {
  readonly eventId: string;
  readonly eventType: CommercialDecisionEventType;
  readonly aggregateType: "commercial_decision";
  readonly aggregateId: string;
  readonly sequence: number;
  readonly occurredAt: string;
  readonly correlationId: string;
  readonly causationId: string;
  readonly source: "commercial-decision-events";
  readonly payload: Readonly<Record<string, unknown>>;
}

function eventTypeForDisposition(
  disposition: DecisionExecutionPlan["entries"][number]["disposition"],
): CommercialDecisionEventType {
  if (disposition === "auto_execute") return "commercial.action.auto_approved";
  if (disposition === "approval_required") {
    return "commercial.action.approval_required";
  }
  if (disposition === "blocked") return "commercial.action.blocked";
  return "commercial.action.informational";
}

export function createCommercialDecisionEvents(input: {
  resolution: UnifiedDecisionResult;
  executionPlan: DecisionExecutionPlan;
  occurredAt?: string;
}): readonly CommercialDecisionEvent[] {
  if (input.resolution.contextId !== input.executionPlan.contextId) {
    throw new Error("Decision resolution and execution plan context must match.");
  }

  const occurredAt = input.occurredAt ?? new Date().toISOString();
  const correlationId = input.resolution.contextId;
  const causationId = input.resolution.resolutionDecision.id;
  const events: CommercialDecisionEvent[] = [];

  events.push({
    eventId: `${correlationId}:1:decision-resolved`,
    eventType: "commercial.decision.resolved",
    aggregateType: "commercial_decision",
    aggregateId: input.resolution.resolutionDecision.entityId,
    sequence: 1,
    occurredAt,
    correlationId,
    causationId,
    source: "commercial-decision-events",
    payload: Object.freeze({
      status: input.resolution.status,
      severity: input.resolution.maxSeverity,
      confidence: input.resolution.confidence,
      decisionCount: input.resolution.orderedDecisions.length,
      conflictCount: input.resolution.conflicts.length,
    }),
  });

  for (const [index, entry] of input.executionPlan.entries.entries()) {
    const sequence = index + 2;
    events.push({
      eventId: `${correlationId}:${sequence}:${entry.action.type}`,
      eventType: eventTypeForDisposition(entry.disposition),
      aggregateType: "commercial_decision",
      aggregateId: input.resolution.resolutionDecision.entityId,
      sequence,
      occurredAt,
      correlationId,
      causationId: input.executionPlan.decision.id,
      source: "commercial-decision-events",
      payload: Object.freeze({
        actionType: entry.action.type,
        priority: entry.action.priority,
        title: entry.action.title,
        quantity: entry.action.quantity,
        dueAt: entry.action.dueAt,
        disposition: entry.disposition,
        reasons: entry.reasons,
        metadata: entry.action.metadata,
      }),
    });
  }

  return Object.freeze(events);
}
