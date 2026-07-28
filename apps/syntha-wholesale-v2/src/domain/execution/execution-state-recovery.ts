import type {
  ExecutionEntryStatus,
  ExecutionJournal,
  ExecutionJournalEvent,
} from "./execution-journal";

export interface RecoveredExecutionEntry {
  readonly entryId: string;
  readonly status: ExecutionEntryStatus;
  readonly attempts: number;
  readonly updatedAt: string;
  readonly resultRef?: string;
  readonly error?: string;
}

export interface RecoveredExecutionState {
  readonly status: ExecutionJournal["status"];
  readonly entries: readonly RecoveredExecutionEntry[];
  readonly processedEventIds: readonly string[];
  readonly processedIdempotencyKeys: readonly string[];
  readonly integrityErrors: readonly string[];
  readonly lastEventAt?: string;
}

const allowedTransitions: Record<ExecutionEntryStatus, readonly ExecutionEntryStatus[]> = {
  informational: [],
  blocked: [],
  pending_approval: ["queued", "cancelled"],
  queued: ["running", "cancelled"],
  running: ["succeeded", "failed", "cancelled"],
  succeeded: [],
  failed: ["queued", "cancelled"],
  cancelled: [],
};

function aggregateStatus(
  entries: readonly RecoveredExecutionEntry[],
): ExecutionJournal["status"] {
  const mutable = entries.filter((entry) => entry.status !== "informational");
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

function isValidDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

export function recoverExecutionState(
  events: readonly ExecutionJournalEvent[],
): RecoveredExecutionState {
  const states = new Map<string, RecoveredExecutionEntry>();
  const eventIds = new Set<string>();
  const idempotencyKeys = new Set<string>();
  const integrityErrors: string[] = [];
  let lastEventAt: string | undefined;

  for (const event of events) {
    if (eventIds.has(event.eventId)) {
      integrityErrors.push(`Duplicate execution event id: ${event.eventId}`);
      continue;
    }
    eventIds.add(event.eventId);

    if (!isValidDate(event.occurredAt)) {
      integrityErrors.push(`Invalid occurredAt for event ${event.eventId}.`);
      continue;
    }
    if (lastEventAt && Date.parse(event.occurredAt) < Date.parse(lastEventAt)) {
      integrityErrors.push(
        `Execution event ${event.eventId} is out of chronological order.`,
      );
    }
    lastEventAt =
      !lastEventAt || Date.parse(event.occurredAt) >= Date.parse(lastEventAt)
        ? event.occurredAt
        : lastEventAt;

    if (event.idempotencyKey) {
      if (idempotencyKeys.has(event.idempotencyKey)) {
        integrityErrors.push(
          `Duplicate execution idempotency key: ${event.idempotencyKey}`,
        );
        continue;
      }
      idempotencyKeys.add(event.idempotencyKey);
    }

    const current = states.get(event.entryId);
    if (!current) {
      if (event.fromStatus !== undefined) {
        integrityErrors.push(
          `First event for ${event.entryId} must not declare fromStatus.`,
        );
        continue;
      }
      states.set(event.entryId, {
        entryId: event.entryId,
        status: event.toStatus,
        attempts: event.toStatus === "running" ? 1 : 0,
        updatedAt: event.occurredAt,
        resultRef: event.resultRef,
        error: event.error,
      });
      continue;
    }

    if (event.fromStatus !== current.status) {
      integrityErrors.push(
        `Execution event ${event.eventId} expected ${current.status} but declared ${event.fromStatus ?? "undefined"}.`,
      );
      continue;
    }
    if (!allowedTransitions[current.status].includes(event.toStatus)) {
      integrityErrors.push(
        `Invalid recovered transition for ${event.entryId}: ${current.status} -> ${event.toStatus}.`,
      );
      continue;
    }

    states.set(event.entryId, {
      entryId: event.entryId,
      status: event.toStatus,
      attempts:
        event.toStatus === "running" ? current.attempts + 1 : current.attempts,
      updatedAt: event.occurredAt,
      resultRef: event.resultRef ?? current.resultRef,
      error: event.error,
    });
  }

  const entries = [...states.values()].sort((left, right) =>
    left.entryId.localeCompare(right.entryId),
  );
  return Object.freeze({
    status: aggregateStatus(entries),
    entries: Object.freeze(entries.map((entry) => Object.freeze(entry))),
    processedEventIds: Object.freeze([...eventIds]),
    processedIdempotencyKeys: Object.freeze([...idempotencyKeys]),
    integrityErrors: Object.freeze(integrityErrors),
    lastEventAt,
  });
}

export function verifyExecutionJournalIntegrity(
  journal: ExecutionJournal,
): RecoveredExecutionState {
  const recovered = recoverExecutionState(journal.events);
  const errors = [...recovered.integrityErrors];
  const journalEntries = new Map(journal.entries.map((entry) => [entry.id, entry]));

  for (const entry of recovered.entries) {
    const persisted = journalEntries.get(entry.entryId);
    if (!persisted) {
      errors.push(`Recovered entry ${entry.entryId} is missing from the journal.`);
      continue;
    }
    if (persisted.status !== entry.status) {
      errors.push(
        `Journal status drift for ${entry.entryId}: persisted ${persisted.status}, recovered ${entry.status}.`,
      );
    }
    if (persisted.attempts !== entry.attempts) {
      errors.push(
        `Journal attempt drift for ${entry.entryId}: persisted ${persisted.attempts}, recovered ${entry.attempts}.`,
      );
    }
    if (persisted.resultRef !== entry.resultRef) {
      errors.push(`Journal result reference drift for ${entry.entryId}.`);
    }
  }

  for (const entry of journal.entries) {
    if (!recovered.entries.some((candidate) => candidate.entryId === entry.id)) {
      errors.push(`Journal entry ${entry.id} has no recovery event history.`);
    }
  }
  if (journal.status !== recovered.status) {
    errors.push(
      `Journal aggregate status drift: persisted ${journal.status}, recovered ${recovered.status}.`,
    );
  }

  return Object.freeze({
    ...recovered,
    integrityErrors: Object.freeze(errors),
  });
}
