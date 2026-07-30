import type { CommercialDecisionEvent } from "./commercial-decision-events";

export type OutboxStatus =
  | "pending"
  | "processing"
  | "published"
  | "dead_letter";

export interface OutboxRecord {
  readonly id: string;
  readonly event: CommercialDecisionEvent;
  readonly status: OutboxStatus;
  readonly attempts: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly nextAttemptAt: string;
  readonly lockedBy?: string;
  readonly lockedUntil?: string;
  readonly publishedAt?: string;
  readonly lastError?: string;
}

export interface TransactionalOutbox {
  readonly records: readonly OutboxRecord[];
}

function parseDate(value: string, field: string): Date {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    throw new Error(`${field} must be a valid ISO date string.`);
  }
  return new Date(timestamp);
}

function addSeconds(date: Date, seconds: number): string {
  return new Date(date.getTime() + seconds * 1000).toISOString();
}

export function createTransactionalOutbox(
  records: readonly OutboxRecord[] = [],
): TransactionalOutbox {
  const ids = new Set<string>();
  for (const record of records) {
    if (ids.has(record.id)) throw new Error(`Duplicate outbox record: ${record.id}`);
    ids.add(record.id);
  }
  return Object.freeze({ records: Object.freeze([...records]) });
}

export function enqueueOutboxEvents(input: {
  readonly outbox: TransactionalOutbox;
  readonly events: readonly CommercialDecisionEvent[];
  readonly createdAt?: string;
}): TransactionalOutbox {
  const createdAt = parseDate(
    input.createdAt ?? new Date().toISOString(),
    "Outbox creation time",
  ).toISOString();
  const knownIds = new Set(input.outbox.records.map((record) => record.id));
  const additions: OutboxRecord[] = [];

  for (const event of input.events) {
    if (knownIds.has(event.eventId)) continue;
    knownIds.add(event.eventId);
    additions.push(
      Object.freeze({
        id: event.eventId,
        event,
        status: "pending" as const,
        attempts: 0,
        createdAt,
        updatedAt: createdAt,
        nextAttemptAt: createdAt,
      }),
    );
  }

  return Object.freeze({
    records: Object.freeze([...input.outbox.records, ...additions]),
  });
}

export function claimOutboxBatch(input: {
  readonly outbox: TransactionalOutbox;
  readonly workerId: string;
  readonly now?: string;
  readonly batchSize?: number;
  readonly leaseSeconds?: number;
}): { readonly outbox: TransactionalOutbox; readonly claimed: readonly OutboxRecord[] } {
  if (!input.workerId.trim()) throw new Error("Outbox worker id is required.");
  const now = parseDate(input.now ?? new Date().toISOString(), "Outbox claim time");
  const batchSize = Math.max(1, Math.floor(input.batchSize ?? 50));
  const leaseSeconds = Math.max(1, Math.floor(input.leaseSeconds ?? 60));
  const claimable = input.outbox.records
    .filter((record) => {
      if (record.status === "published" || record.status === "dead_letter") {
        return false;
      }
      if (parseDate(record.nextAttemptAt, "Outbox next attempt") > now) {
        return false;
      }
      if (record.status === "processing" && record.lockedUntil) {
        return parseDate(record.lockedUntil, "Outbox lock expiry") <= now;
      }
      return record.status === "pending";
    })
    .sort(
      (left, right) =>
        left.event.sequence - right.event.sequence ||
        left.createdAt.localeCompare(right.createdAt),
    )
    .slice(0, batchSize);
  const ids = new Set(claimable.map((record) => record.id));
  const records = input.outbox.records.map((record) =>
    ids.has(record.id)
      ? Object.freeze({
          ...record,
          status: "processing" as const,
          attempts: record.attempts + 1,
          updatedAt: now.toISOString(),
          lockedBy: input.workerId,
          lockedUntil: addSeconds(now, leaseSeconds),
        })
      : record,
  );
  const claimed = records.filter((record) => ids.has(record.id));
  return Object.freeze({
    outbox: Object.freeze({ records: Object.freeze(records) }),
    claimed: Object.freeze(claimed),
  });
}

export function markOutboxPublished(input: {
  readonly outbox: TransactionalOutbox;
  readonly recordId: string;
  readonly workerId: string;
  readonly publishedAt?: string;
}): TransactionalOutbox {
  const publishedAt = parseDate(
    input.publishedAt ?? new Date().toISOString(),
    "Outbox publication time",
  ).toISOString();
  const target = input.outbox.records.find((record) => record.id === input.recordId);
  if (!target) throw new Error("Outbox record was not found.");
  if (target.status === "published") return input.outbox;
  if (target.status !== "processing" || target.lockedBy !== input.workerId) {
    throw new Error("Only the worker holding the outbox lease can publish the record.");
  }
  const records = input.outbox.records.map((record) =>
    record.id === input.recordId
      ? Object.freeze({
          ...record,
          status: "published" as const,
          updatedAt: publishedAt,
          publishedAt,
          lockedBy: undefined,
          lockedUntil: undefined,
          lastError: undefined,
        })
      : record,
  );
  return Object.freeze({ records: Object.freeze(records) });
}

export function markOutboxFailed(input: {
  readonly outbox: TransactionalOutbox;
  readonly recordId: string;
  readonly workerId: string;
  readonly error: string;
  readonly failedAt?: string;
  readonly maximumAttempts?: number;
  readonly baseRetrySeconds?: number;
}): TransactionalOutbox {
  const failedAt = parseDate(
    input.failedAt ?? new Date().toISOString(),
    "Outbox failure time",
  );
  const maximumAttempts = Math.max(1, Math.floor(input.maximumAttempts ?? 5));
  const baseRetrySeconds = Math.max(
    1,
    Math.floor(input.baseRetrySeconds ?? 30),
  );
  const target = input.outbox.records.find((record) => record.id === input.recordId);
  if (!target) throw new Error("Outbox record was not found.");
  if (target.status !== "processing" || target.lockedBy !== input.workerId) {
    throw new Error("Only the worker holding the outbox lease can fail the record.");
  }
  const deadLetter = target.attempts >= maximumAttempts;
  const retrySeconds = baseRetrySeconds * 2 ** Math.max(0, target.attempts - 1);
  const records = input.outbox.records.map((record) =>
    record.id === input.recordId
      ? Object.freeze({
          ...record,
          status: deadLetter ? ("dead_letter" as const) : ("pending" as const),
          updatedAt: failedAt.toISOString(),
          nextAttemptAt: deadLetter
            ? failedAt.toISOString()
            : addSeconds(failedAt, retrySeconds),
          lockedBy: undefined,
          lockedUntil: undefined,
          lastError: input.error,
        })
      : record,
  );
  return Object.freeze({ records: Object.freeze(records) });
}
