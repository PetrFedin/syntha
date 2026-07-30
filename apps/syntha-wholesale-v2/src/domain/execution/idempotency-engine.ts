export type IdempotencyStatus = "in_progress" | "completed" | "failed";

export interface IdempotencyRecord {
  readonly key: string;
  readonly scope: string;
  readonly fingerprint: string;
  readonly status: IdempotencyStatus;
  readonly attempts: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly expiresAt: string;
  readonly resultRef?: string;
  readonly error?: string;
}

export interface IdempotencyRegistry {
  readonly records: readonly IdempotencyRecord[];
}

export type IdempotencyBeginOutcome =
  | "started"
  | "retry_started"
  | "replay"
  | "in_progress"
  | "conflict";

export interface IdempotencyBeginResult {
  readonly outcome: IdempotencyBeginOutcome;
  readonly record: IdempotencyRecord;
  readonly registry: IdempotencyRegistry;
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

function replaceRecord(
  registry: IdempotencyRegistry,
  record: IdempotencyRecord,
): IdempotencyRegistry {
  const records = registry.records.filter(
    (candidate) =>
      !(candidate.scope === record.scope && candidate.key === record.key),
  );
  return Object.freeze({
    records: Object.freeze([...records, Object.freeze(record)]),
  });
}

export function createIdempotencyRegistry(
  records: readonly IdempotencyRecord[] = [],
): IdempotencyRegistry {
  const seen = new Set<string>();
  for (const record of records) {
    const compositeKey = `${record.scope}:${record.key}`;
    if (seen.has(compositeKey)) {
      throw new Error(`Duplicate idempotency record: ${compositeKey}`);
    }
    seen.add(compositeKey);
  }
  return Object.freeze({ records: Object.freeze([...records]) });
}

export function beginIdempotentOperation(input: {
  readonly registry: IdempotencyRegistry;
  readonly key: string;
  readonly scope: string;
  readonly fingerprint: string;
  readonly now?: string;
  readonly ttlSeconds?: number;
}): IdempotencyBeginResult {
  if (!input.key.trim()) throw new Error("Idempotency key is required.");
  if (!input.scope.trim()) throw new Error("Idempotency scope is required.");
  if (!input.fingerprint.trim()) {
    throw new Error("Idempotency fingerprint is required.");
  }

  const now = parseDate(input.now ?? new Date().toISOString(), "Idempotency time");
  const ttlSeconds = Math.max(1, Math.floor(input.ttlSeconds ?? 300));
  const existing = input.registry.records.find(
    (record) => record.scope === input.scope && record.key === input.key,
  );

  if (!existing) {
    const record: IdempotencyRecord = {
      key: input.key,
      scope: input.scope,
      fingerprint: input.fingerprint,
      status: "in_progress",
      attempts: 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: addSeconds(now, ttlSeconds),
    };
    return Object.freeze({
      outcome: "started",
      record: Object.freeze(record),
      registry: replaceRecord(input.registry, record),
    });
  }

  if (existing.fingerprint !== input.fingerprint) {
    return Object.freeze({
      outcome: "conflict",
      record: existing,
      registry: input.registry,
    });
  }

  if (existing.status === "completed") {
    return Object.freeze({
      outcome: "replay",
      record: existing,
      registry: input.registry,
    });
  }

  const expired = parseDate(existing.expiresAt, "Idempotency expiry") <= now;
  if (existing.status === "in_progress" && !expired) {
    return Object.freeze({
      outcome: "in_progress",
      record: existing,
      registry: input.registry,
    });
  }

  const record: IdempotencyRecord = {
    ...existing,
    status: "in_progress",
    attempts: existing.attempts + 1,
    updatedAt: now.toISOString(),
    expiresAt: addSeconds(now, ttlSeconds),
    resultRef: undefined,
    error: undefined,
  };
  return Object.freeze({
    outcome: "retry_started",
    record: Object.freeze(record),
    registry: replaceRecord(input.registry, record),
  });
}

export function completeIdempotentOperation(input: {
  readonly registry: IdempotencyRegistry;
  readonly key: string;
  readonly scope: string;
  readonly resultRef: string;
  readonly now?: string;
}): IdempotencyRegistry {
  const existing = input.registry.records.find(
    (record) => record.scope === input.scope && record.key === input.key,
  );
  if (!existing) throw new Error("Idempotency record was not started.");
  if (existing.status === "completed") return input.registry;
  if (existing.status !== "in_progress") {
    throw new Error("Only an in-progress idempotency record can be completed.");
  }
  const now = parseDate(input.now ?? new Date().toISOString(), "Completion time");
  return replaceRecord(input.registry, {
    ...existing,
    status: "completed",
    updatedAt: now.toISOString(),
    expiresAt: now.toISOString(),
    resultRef: input.resultRef,
    error: undefined,
  });
}

export function failIdempotentOperation(input: {
  readonly registry: IdempotencyRegistry;
  readonly key: string;
  readonly scope: string;
  readonly error: string;
  readonly now?: string;
}): IdempotencyRegistry {
  const existing = input.registry.records.find(
    (record) => record.scope === input.scope && record.key === input.key,
  );
  if (!existing) throw new Error("Idempotency record was not started.");
  if (existing.status === "completed") return input.registry;
  const now = parseDate(input.now ?? new Date().toISOString(), "Failure time");
  return replaceRecord(input.registry, {
    ...existing,
    status: "failed",
    updatedAt: now.toISOString(),
    expiresAt: now.toISOString(),
    error: input.error,
    resultRef: undefined,
  });
}
