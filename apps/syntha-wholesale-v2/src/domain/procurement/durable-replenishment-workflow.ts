import {
  createApprovalWorkflow,
  type ApprovalWorkflow,
  type ApprovalWorkflowPolicy,
} from "@/domain/execution/approval-workflow";
import {
  beginIdempotentOperation,
  completeIdempotentOperation,
  failIdempotentOperation,
  type IdempotencyBeginOutcome,
  type IdempotencyRecord,
  type IdempotencyRegistry,
} from "@/domain/execution/idempotency-engine";
import {
  createExecutionJournal,
  type ExecutionJournal,
} from "@/domain/execution/execution-journal";
import {
  createTransactionalOutbox,
  enqueueOutboxEvents,
  type TransactionalOutbox,
} from "@/domain/events/transactional-outbox";
import {
  analyzeAutomatedReplenishment,
  type AutomatedReplenishmentInput,
  type AutomatedReplenishmentResult,
} from "./automated-replenishment-engine";

export interface DurableReplenishmentInput extends AutomatedReplenishmentInput {
  readonly idempotencyKey: string;
  readonly requestFingerprint: string;
  readonly idempotencyRegistry: IdempotencyRegistry;
  readonly existingOutbox?: TransactionalOutbox;
  readonly approvalPolicy?: ApprovalWorkflowPolicy;
  readonly idempotencyTtlSeconds?: number;
}

export interface DurableReplenishmentAccepted {
  readonly status: "accepted";
  readonly beginOutcome: "started" | "retry_started";
  readonly result: AutomatedReplenishmentResult;
  readonly approvals: ApprovalWorkflow;
  readonly journal: ExecutionJournal;
  readonly outbox: TransactionalOutbox;
  readonly idempotencyRegistry: IdempotencyRegistry;
}

export interface DurableReplenishmentDeferred {
  readonly status: "replay" | "in_progress" | "conflict";
  readonly beginOutcome: IdempotencyBeginOutcome;
  readonly record: IdempotencyRecord;
  readonly idempotencyRegistry: IdempotencyRegistry;
}

export interface DurableReplenishmentFailed {
  readonly status: "failed";
  readonly error: string;
  readonly idempotencyRegistry: IdempotencyRegistry;
}

export type DurableReplenishmentResult =
  | DurableReplenishmentAccepted
  | DurableReplenishmentDeferred
  | DurableReplenishmentFailed;

export function runDurableReplenishment(
  input: DurableReplenishmentInput,
): DurableReplenishmentResult {
  const generatedAt = input.analysisAt ?? new Date().toISOString();
  const begin = beginIdempotentOperation({
    registry: input.idempotencyRegistry,
    key: input.idempotencyKey,
    scope: "automated_replenishment",
    fingerprint: input.requestFingerprint,
    now: generatedAt,
    ttlSeconds: input.idempotencyTtlSeconds,
  });

  if (begin.outcome === "replay" || begin.outcome === "in_progress" || begin.outcome === "conflict") {
    return Object.freeze({
      status: begin.outcome,
      beginOutcome: begin.outcome,
      record: begin.record,
      idempotencyRegistry: begin.registry,
    });
  }

  try {
    const result = analyzeAutomatedReplenishment(input);
    const approvals = createApprovalWorkflow({
      executionPlan: result.executionPlan,
      policy: input.approvalPolicy,
      createdAt: generatedAt,
    });
    const journal = createExecutionJournal({
      executionPlan: result.executionPlan,
      createdAt: generatedAt,
    });
    const outbox = enqueueOutboxEvents({
      outbox: input.existingOutbox ?? createTransactionalOutbox(),
      events: result.events,
      createdAt: generatedAt,
    });
    const idempotencyRegistry = completeIdempotentOperation({
      registry: begin.registry,
      key: input.idempotencyKey,
      scope: "automated_replenishment",
      resultRef: result.id,
      now: generatedAt,
    });

    return Object.freeze({
      status: "accepted",
      beginOutcome: begin.outcome,
      result,
      approvals,
      journal,
      outbox,
      idempotencyRegistry,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown replenishment failure";
    return Object.freeze({
      status: "failed",
      error: message,
      idempotencyRegistry: failIdempotentOperation({
        registry: begin.registry,
        key: input.idempotencyKey,
        scope: "automated_replenishment",
        error: message,
        now: generatedAt,
      }),
    });
  }
}
