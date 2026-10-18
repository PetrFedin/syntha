export type IntegrationCircuitState = "closed" | "open" | "half_open";

export interface IntegrationResiliencePolicy {
  readonly failureThreshold?: number;
  readonly openDurationSeconds?: number;
  readonly halfOpenSuccessThreshold?: number;
  readonly maximumRetryAttempts?: number;
  readonly baseRetrySeconds?: number;
  readonly maximumRetrySeconds?: number;
}

export interface IntegrationCircuit {
  readonly integrationId: string;
  readonly state: IntegrationCircuitState;
  readonly consecutiveFailures: number;
  readonly halfOpenSuccesses: number;
  readonly updatedAt: string;
  readonly openedAt?: string;
  readonly retryAt?: string;
  readonly lastFailureAt?: string;
  readonly lastSuccessAt?: string;
  readonly lastError?: string;
}

export interface IntegrationAttemptDecision {
  readonly status: "allowed" | "circuit_open" | "retry_exhausted";
  readonly allowed: boolean;
  readonly circuit: IntegrationCircuit;
  readonly attempt: number;
  readonly retryAt?: string;
  readonly reason: string;
}

export interface IntegrationFailureResult {
  readonly circuit: IntegrationCircuit;
  readonly retry: boolean;
  readonly retryAt?: string;
  readonly attempt: number;
  readonly exhausted: boolean;
}

function parseDate(value: string, field: string): Date {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    throw new Error(`${field} must be a valid ISO date string.`);
  }
  return new Date(timestamp);
}

function normalizedPolicy(
  policy: IntegrationResiliencePolicy = {},
): Required<IntegrationResiliencePolicy> {
  const failureThreshold = Math.max(1, Math.floor(policy.failureThreshold ?? 3));
  const openDurationSeconds = Math.max(
    1,
    Math.floor(policy.openDurationSeconds ?? 60),
  );
  const halfOpenSuccessThreshold = Math.max(
    1,
    Math.floor(policy.halfOpenSuccessThreshold ?? 2),
  );
  const maximumRetryAttempts = Math.max(
    1,
    Math.floor(policy.maximumRetryAttempts ?? 5),
  );
  const baseRetrySeconds = Math.max(
    1,
    Math.floor(policy.baseRetrySeconds ?? 5),
  );
  const maximumRetrySeconds = Math.max(
    baseRetrySeconds,
    Math.floor(policy.maximumRetrySeconds ?? 300),
  );
  return {
    failureThreshold,
    openDurationSeconds,
    halfOpenSuccessThreshold,
    maximumRetryAttempts,
    baseRetrySeconds,
    maximumRetrySeconds,
  };
}

function addSeconds(date: Date, seconds: number): string {
  return new Date(date.getTime() + seconds * 1000).toISOString();
}

function retryDelaySeconds(
  attempt: number,
  policy: Required<IntegrationResiliencePolicy>,
): number {
  const exponent = Math.max(0, attempt - 1);
  return Math.min(
    policy.maximumRetrySeconds,
    policy.baseRetrySeconds * 2 ** exponent,
  );
}

export function createIntegrationCircuit(input: {
  readonly integrationId: string;
  readonly createdAt?: string;
}): IntegrationCircuit {
  if (!input.integrationId.trim()) {
    throw new Error("Integration id is required.");
  }
  const createdAt = parseDate(
    input.createdAt ?? new Date().toISOString(),
    "Circuit creation time",
  ).toISOString();
  return Object.freeze({
    integrationId: input.integrationId,
    state: "closed",
    consecutiveFailures: 0,
    halfOpenSuccesses: 0,
    updatedAt: createdAt,
  });
}

export function evaluateIntegrationAttempt(input: {
  readonly circuit: IntegrationCircuit;
  readonly attempt: number;
  readonly policy?: IntegrationResiliencePolicy;
  readonly now?: string;
}): IntegrationAttemptDecision {
  const policy = normalizedPolicy(input.policy);
  const attempt = Math.max(1, Math.floor(input.attempt));
  const now = parseDate(
    input.now ?? new Date().toISOString(),
    "Integration attempt time",
  );

  if (attempt > policy.maximumRetryAttempts) {
    return Object.freeze({
      status: "retry_exhausted",
      allowed: false,
      circuit: input.circuit,
      attempt,
      reason: "Maximum integration retry attempts have been exhausted.",
    });
  }

  if (input.circuit.state === "open") {
    const retryAt = input.circuit.retryAt
      ? parseDate(input.circuit.retryAt, "Circuit retry time")
      : now;
    if (now < retryAt) {
      return Object.freeze({
        status: "circuit_open",
        allowed: false,
        circuit: input.circuit,
        attempt,
        retryAt: retryAt.toISOString(),
        reason: "Integration circuit is open until the recovery window begins.",
      });
    }
    const halfOpen: IntegrationCircuit = Object.freeze({
      ...input.circuit,
      state: "half_open",
      halfOpenSuccesses: 0,
      updatedAt: now.toISOString(),
    });
    return Object.freeze({
      status: "allowed",
      allowed: true,
      circuit: halfOpen,
      attempt,
      reason: "Integration circuit entered half-open recovery mode.",
    });
  }

  return Object.freeze({
    status: "allowed",
    allowed: true,
    circuit: input.circuit,
    attempt,
    reason:
      input.circuit.state === "half_open"
        ? "Integration recovery probe is allowed."
        : "Integration circuit is closed.",
  });
}

export function recordIntegrationSuccess(input: {
  readonly circuit: IntegrationCircuit;
  readonly policy?: IntegrationResiliencePolicy;
  readonly succeededAt?: string;
}): IntegrationCircuit {
  const policy = normalizedPolicy(input.policy);
  const succeededAt = parseDate(
    input.succeededAt ?? new Date().toISOString(),
    "Integration success time",
  ).toISOString();

  if (input.circuit.state === "half_open") {
    const halfOpenSuccesses = input.circuit.halfOpenSuccesses + 1;
    if (halfOpenSuccesses < policy.halfOpenSuccessThreshold) {
      return Object.freeze({
        ...input.circuit,
        halfOpenSuccesses,
        consecutiveFailures: 0,
        lastSuccessAt: succeededAt,
        updatedAt: succeededAt,
        lastError: undefined,
      });
    }
  }

  return Object.freeze({
    integrationId: input.circuit.integrationId,
    state: "closed",
    consecutiveFailures: 0,
    halfOpenSuccesses: 0,
    lastSuccessAt: succeededAt,
    updatedAt: succeededAt,
  });
}

export function recordIntegrationFailure(input: {
  readonly circuit: IntegrationCircuit;
  readonly attempt: number;
  readonly error: string;
  readonly retryable: boolean;
  readonly policy?: IntegrationResiliencePolicy;
  readonly failedAt?: string;
}): IntegrationFailureResult {
  const policy = normalizedPolicy(input.policy);
  const attempt = Math.max(1, Math.floor(input.attempt));
  const failedAt = parseDate(
    input.failedAt ?? new Date().toISOString(),
    "Integration failure time",
  );
  const exhausted = !input.retryable || attempt >= policy.maximumRetryAttempts;
  const consecutiveFailures = input.circuit.consecutiveFailures + 1;
  const mustOpen =
    input.circuit.state === "half_open" ||
    consecutiveFailures >= policy.failureThreshold;
  const circuit: IntegrationCircuit = mustOpen
    ? Object.freeze({
        ...input.circuit,
        state: "open",
        consecutiveFailures,
        halfOpenSuccesses: 0,
        openedAt: failedAt.toISOString(),
        retryAt: addSeconds(failedAt, policy.openDurationSeconds),
        lastFailureAt: failedAt.toISOString(),
        lastError: input.error,
        updatedAt: failedAt.toISOString(),
      })
    : Object.freeze({
        ...input.circuit,
        consecutiveFailures,
        halfOpenSuccesses: 0,
        lastFailureAt: failedAt.toISOString(),
        lastError: input.error,
        updatedAt: failedAt.toISOString(),
      });

  if (exhausted) {
    return Object.freeze({
      circuit,
      retry: false,
      attempt,
      exhausted: true,
    });
  }

  const retryAt = mustOpen
    ? circuit.retryAt
    : addSeconds(failedAt, retryDelaySeconds(attempt, policy));
  return Object.freeze({
    circuit,
    retry: true,
    retryAt,
    attempt,
    exhausted: false,
  });
}
