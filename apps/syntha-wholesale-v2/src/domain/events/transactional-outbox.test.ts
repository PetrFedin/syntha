import { describe, expect, it } from "vitest";

import type { CommercialDecisionEvent } from "./commercial-decision-events";
import {
  claimOutboxBatch,
  createTransactionalOutbox,
  enqueueOutboxEvents,
  markOutboxFailed,
  markOutboxPublished,
} from "./transactional-outbox";

const event: CommercialDecisionEvent = {
  eventId: "CTX-1:1:decision-resolved",
  eventType: "commercial.decision.resolved",
  aggregateType: "commercial_decision",
  aggregateId: "SKU-1",
  sequence: 1,
  occurredAt: "2026-07-29T00:00:00.000Z",
  correlationId: "CTX-1",
  causationId: "DEC-1",
  source: "commercial-decision-events",
  payload: {},
};

describe("transactional outbox", () => {
  it("deduplicates events and publishes a claimed record", () => {
    const queued = enqueueOutboxEvents({
      outbox: createTransactionalOutbox(),
      events: [event, event],
      createdAt: "2026-07-29T00:00:00.000Z",
    });
    const claimed = claimOutboxBatch({
      outbox: queued,
      workerId: "worker-1",
      now: "2026-07-29T00:00:01.000Z",
    });
    const published = markOutboxPublished({
      outbox: claimed.outbox,
      recordId: event.eventId,
      workerId: "worker-1",
      publishedAt: "2026-07-29T00:00:02.000Z",
    });

    expect(queued.records).toHaveLength(1);
    expect(published.records[0]?.status).toBe("published");
  });

  it("retries with backoff and then moves to dead letter", () => {
    let outbox = enqueueOutboxEvents({
      outbox: createTransactionalOutbox(),
      events: [event],
      createdAt: "2026-07-29T00:00:00.000Z",
    });

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const claimed = claimOutboxBatch({
        outbox,
        workerId: "worker-1",
        now: `2026-07-29T00:0${attempt}:00.000Z`,
      });
      outbox = markOutboxFailed({
        outbox: claimed.outbox,
        recordId: event.eventId,
        workerId: "worker-1",
        error: "broker unavailable",
        failedAt: `2026-07-29T00:0${attempt}:01.000Z`,
        maximumAttempts: 2,
        baseRetrySeconds: 1,
      });
    }

    expect(outbox.records[0]?.status).toBe("dead_letter");
  });
});
