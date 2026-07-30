import { describe, expect, it } from "vitest";

import {
  createIntegrationCircuit,
  evaluateIntegrationAttempt,
  recordIntegrationFailure,
  recordIntegrationSuccess,
} from "./integration-resilience";

const policy = {
  failureThreshold: 2,
  openDurationSeconds: 60,
  halfOpenSuccessThreshold: 2,
  maximumRetryAttempts: 4,
  baseRetrySeconds: 5,
  maximumRetrySeconds: 20,
};

describe("integration resilience", () => {
  it("opens the circuit after the failure threshold and blocks early retries", () => {
    const initial = createIntegrationCircuit({
      integrationId: "erp",
      createdAt: "2026-07-29T00:00:00.000Z",
    });
    const first = recordIntegrationFailure({
      circuit: initial,
      attempt: 1,
      error: "timeout",
      retryable: true,
      policy,
      failedAt: "2026-07-29T00:00:01.000Z",
    });
    const second = recordIntegrationFailure({
      circuit: first.circuit,
      attempt: 2,
      error: "timeout",
      retryable: true,
      policy,
      failedAt: "2026-07-29T00:00:10.000Z",
    });
    const blocked = evaluateIntegrationAttempt({
      circuit: second.circuit,
      attempt: 3,
      policy,
      now: "2026-07-29T00:00:30.000Z",
    });

    expect(first.circuit.state).toBe("closed");
    expect(second.circuit.state).toBe("open");
    expect(blocked.status).toBe("circuit_open");
    expect(blocked.allowed).toBe(false);
  });

  it("moves through half-open probes and closes after successful recovery", () => {
    const initial = createIntegrationCircuit({
      integrationId: "erp",
      createdAt: "2026-07-29T00:00:00.000Z",
    });
    const opened = recordIntegrationFailure({
      circuit: { ...initial, state: "half_open" },
      attempt: 1,
      error: "timeout",
      retryable: true,
      policy,
      failedAt: "2026-07-29T00:00:00.000Z",
    });
    const probe = evaluateIntegrationAttempt({
      circuit: opened.circuit,
      attempt: 2,
      policy,
      now: "2026-07-29T00:01:01.000Z",
    });
    const firstSuccess = recordIntegrationSuccess({
      circuit: probe.circuit,
      policy,
      succeededAt: "2026-07-29T00:01:02.000Z",
    });
    const secondSuccess = recordIntegrationSuccess({
      circuit: firstSuccess,
      policy,
      succeededAt: "2026-07-29T00:01:03.000Z",
    });

    expect(probe.circuit.state).toBe("half_open");
    expect(firstSuccess.state).toBe("half_open");
    expect(secondSuccess.state).toBe("closed");
  });

  it("caps exponential retry delay and stops non-retryable failures", () => {
    const initial = createIntegrationCircuit({
      integrationId: "erp",
      createdAt: "2026-07-29T00:00:00.000Z",
    });
    const retry = recordIntegrationFailure({
      circuit: initial,
      attempt: 4,
      error: "timeout",
      retryable: true,
      policy: { ...policy, failureThreshold: 10, maximumRetryAttempts: 5 },
      failedAt: "2026-07-29T00:00:00.000Z",
    });
    const terminal = recordIntegrationFailure({
      circuit: initial,
      attempt: 1,
      error: "validation failed",
      retryable: false,
      policy,
      failedAt: "2026-07-29T00:00:00.000Z",
    });

    expect(retry.retryAt).toBe("2026-07-29T00:00:20.000Z");
    expect(terminal.retry).toBe(false);
    expect(terminal.exhausted).toBe(true);
  });
});
