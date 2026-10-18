import { describe, expect, it } from "vitest";

import {
  beginIdempotentOperation,
  completeIdempotentOperation,
  createIdempotencyRegistry,
  failIdempotentOperation,
} from "./idempotency-engine";

describe("idempotency engine", () => {
  it("starts, completes and replays the same operation", () => {
    const started = beginIdempotentOperation({
      registry: createIdempotencyRegistry(),
      key: "REQ-1",
      scope: "replenishment",
      fingerprint: "hash-a",
      now: "2026-07-29T00:00:00.000Z",
    });
    const completed = completeIdempotentOperation({
      registry: started.registry,
      key: "REQ-1",
      scope: "replenishment",
      resultRef: "AUTO-1",
      now: "2026-07-29T00:01:00.000Z",
    });
    const replay = beginIdempotentOperation({
      registry: completed,
      key: "REQ-1",
      scope: "replenishment",
      fingerprint: "hash-a",
      now: "2026-07-29T00:02:00.000Z",
    });

    expect(started.outcome).toBe("started");
    expect(replay.outcome).toBe("replay");
    expect(replay.record.resultRef).toBe("AUTO-1");
  });

  it("rejects key reuse with another payload fingerprint", () => {
    const started = beginIdempotentOperation({
      registry: createIdempotencyRegistry(),
      key: "REQ-1",
      scope: "replenishment",
      fingerprint: "hash-a",
      now: "2026-07-29T00:00:00.000Z",
    });
    const conflict = beginIdempotentOperation({
      registry: started.registry,
      key: "REQ-1",
      scope: "replenishment",
      fingerprint: "hash-b",
      now: "2026-07-29T00:01:00.000Z",
    });

    expect(conflict.outcome).toBe("conflict");
  });

  it("allows a failed operation to be retried", () => {
    const started = beginIdempotentOperation({
      registry: createIdempotencyRegistry(),
      key: "REQ-1",
      scope: "replenishment",
      fingerprint: "hash-a",
      now: "2026-07-29T00:00:00.000Z",
    });
    const failed = failIdempotentOperation({
      registry: started.registry,
      key: "REQ-1",
      scope: "replenishment",
      error: "temporary failure",
      now: "2026-07-29T00:01:00.000Z",
    });
    const retry = beginIdempotentOperation({
      registry: failed,
      key: "REQ-1",
      scope: "replenishment",
      fingerprint: "hash-a",
      now: "2026-07-29T00:02:00.000Z",
    });

    expect(retry.outcome).toBe("retry_started");
    expect(retry.record.attempts).toBe(2);
  });
});
