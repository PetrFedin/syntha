import type { DecisionExecutionPlan } from "@/domain/decision/decision-execution-gate";
import type { RecommendedAction } from "@/domain/decision/decision";
import type { ApprovalWorkflow } from "./approval-workflow";

export type ExecutionEntryStatus =
  | "informational"
  | "blocked"
  | "pending_approval"
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface ExecutionJournalEvent {
  readonly eventId: string;
  readonly entryId: string;
  readonly fromStatus?: ExecutionEntryStatus;
  readonly toStatus: ExecutionEntryStatus;
  readonly occurredAt: string;
  readonly actorId?: string;
  readonly idempotencyKey?: string;
  readonly resultRef?: string;
  readonly error?: string;
}

export interface ExecutionJournalEntry {
  readonly id: string;
  readonly entryIndex: number;
  readonly action: RecommendedAction;
  readonly status: ExecutionEntryStatus;
  readonly attempts: number;
  readonly updatedAt: string;
  readonly resultRef?: string;
  readonly error?: string;
}

export interface ExecutionJournal {
  readonly contextId: string;
  readonly status:
    | "idle"
    | "pending_approval"
    | "queued"
    | "running"
    | "completed"
    | "failed"
    | "blocked"
    | "cancelled";
  readonly entries: readonly ExecutionJournalEntry[];
  readonly events: readonly ExecutionJournalEvent[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

function parseDate(value: string, field: string): Date {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    throw new Error(`${field} must be a valid ISO date string.`);
  }
  return new Date(timestamp);
}

function journalStatus(entries: readonly ExecutionJournalEntry[]): ExecutionJournal["status"] {
  const mutable = entries.filter(
    (entry) => entry.status !== "informational",
  );
  if (mutable.length === 0) return "idle";
  if (mutable.some((entry) => entry.status === "blocked")) return "blocked";
  if (mutable.some((entry) => entry.status === "running")) return "running";
  if (mutable.some((entry) => entry.status === "failed")) return "failed";
  if (mutable.some((entry) => entry.status === "pending_approval")) {
    return "pending_approval";
  }
  if (mutable.some((entry) => entry.status === "queued")) return "queued";
  if (mutable.every((entry) => entry.status === "succeeded")) return "completed";
  if (mutable.every((entry) => entry.status === "cancelled")) return "cancelled";
  if (
    mutable.every(
      (entry) => entry.status === "succeeded" || entry.status === "cancelled",
    )
  ) {
    return "completed";
  }
  return "idle";
}

function initialStatus(
  disposition: DecisionExecutionPlan["entries"][number]["disposition"],
): ExecutionEntryStatus {
  if (disposition === "informational") return "informational";
  if (disposition === "blocked") return "blocked";
  if (disposition === "approval_required") return "pending_approval";
  return "queued";
}

export function createExecutionJournal(input: {
  readonly executionPlan: DecisionExecutionPlan;
  readonly createdAt?: string;
}): ExecutionJournal {
  const createdAt = parseDate(
    input.createdAt ?? new Date().toISOString(),
    "Journal creation time",
  ).toISOString();
  const entries = input.executionPlan.entries.map((entry, entryIndex) =>
    Object.freeze({
      id: `${input.executionPlan.contextId}:execution:${entryIndex}:${entry.action.type}`,
      entryIndex,
      action: entry.action,
      status: initialStatus(entry.disposition),
      attempts: 0,
      updatedAt: createdAt,
    }),
  );
  const events = entries.map((entry, index) =>
    Object.freeze({
      eventId: `${entry.id}:event:1`,
      entryId: entry.id,
      toStatus: entry.status,
      occurredAt: createdAt,
      idempotencyKey: `${input.executionPlan.contextId}:initial:${index}`,
    }),
  );
  return Object.freeze({
    contextId: input.executionPlan.contextId,
    status: journalStatus(entries),
    entries: Object.freeze(entries),
    events: Object.freeze(events),
    createdAt,
    updatedAt: createdAt,
  });
}

export function releaseApprovedActions(input: {
  readonly journal: ExecutionJournal;
  readonly workflow: ApprovalWorkflow;
  readonly occurredAt?: string;
}): ExecutionJournal {
  if (input.journal.contextId !== input.workflow.contextId) {
    throw new Error("Approval workflow and execution journal context must match.");
  }
  const occurredAt = parseDate(
    input.occurredAt ?? new Date().toISOString(),
    "Approval release time",
  ).toISOString();
  const newEvents: ExecutionJournalEvent[] = [];
  const entries = input.journal.entries.map((entry) => {
    if (entry.status !== "pending_approval") return entry;
    const request = input.workflow.requests.find(
      (candidate) => candidate.entryIndex === entry.entryIndex,
    );
    if (!request || request.status === "pending") return entry;
    const nextStatus: ExecutionEntryStatus =
      request.status === "approved" ? "queued" : "cancelled";
    const next = Object.freeze({
      ...entry,
      status: nextStatus,
      updatedAt: occurredAt,
    });
    newEvents.push({
      eventId: `${entry.id}:event:${input.journal.events.length + newEvents.length + 1}`,
      entryId: entry.id,
      fromStatus: entry.status,
      toStatus: nextStatus,
      occurredAt,
      actorId: "approval-workflow",
      idempotencyKey: `${request.id}:${request.status}`,
    });
    return next;
  });
  const events = Object.freeze([...input.journal.events, ...newEvents]);
  return Object.freeze({
    ...input.journal,
    status: journalStatus(entries),
    entries: Object.freeze(entries),
    events,
    updatedAt: occurredAt,
  });
}

const allowedTransitions: Record<ExecutionEntryStatus, readonly ExecutionEntryStatus[]> = {
  informational: [],
  blocked: [],
  pending_approval: [],
  queued: ["running", "cancelled"],
  running: ["succeeded", "failed", "cancelled"],
  succeeded: [],
  failed: ["queued", "cancelled"],
  cancelled: [],
};

export function transitionExecutionEntry(input: {
  readonly journal: ExecutionJournal;
  readonly entryId: string;
  readonly toStatus: ExecutionEntryStatus;
  readonly idempotencyKey: string;
  readonly occurredAt?: string;
  readonly actorId?: string;
  readonly resultRef?: string;
  readonly error?: string;
}): ExecutionJournal {
  if (!input.idempotencyKey.trim()) {
    throw new Error("Execution transition idempotency key is required.");
  }
  if (
    input.journal.events.some(
      (event) => event.idempotencyKey === input.idempotencyKey,
    )
  ) {
    return input.journal;
  }
  const target = input.journal.entries.find((entry) => entry.id === input.entryId);
  if (!target) throw new Error("Execution journal entry was not found.");
  if (!allowedTransitions[target.status].includes(input.toStatus)) {
    throw new Error(
      `Invalid execution transition: ${target.status} -> ${input.toStatus}.`,
    );
  }
  const occurredAt = parseDate(
    input.occurredAt ?? new Date().toISOString(),
    "Execution transition time",
  ).toISOString();
  const entries = input.journal.entries.map((entry) =>
    entry.id === input.entryId
      ? Object.freeze({
          ...entry,
          status: input.toStatus,
          attempts:
            input.toStatus === "running" ? entry.attempts + 1 : entry.attempts,
          updatedAt: occurredAt,
          resultRef: input.resultRef,
          error: input.error,
        })
      : entry,
  );
  const event: ExecutionJournalEvent = Object.freeze({
    eventId: `${target.id}:event:${input.journal.events.length + 1}`,
    entryId: target.id,
    fromStatus: target.status,
    toStatus: input.toStatus,
    occurredAt,
    actorId: input.actorId,
    idempotencyKey: input.idempotencyKey,
    resultRef: input.resultRef,
    error: input.error,
  });
  return Object.freeze({
    ...input.journal,
    status: journalStatus(entries),
    entries: Object.freeze(entries),
    events: Object.freeze([...input.journal.events, event]),
    updatedAt: occurredAt,
  });
}
