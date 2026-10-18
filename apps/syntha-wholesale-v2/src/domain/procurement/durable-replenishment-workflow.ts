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
import { createStableFingerprint } from "@/domain/execution/stable-fingerprint";
import {
  createDecisionProvenanceEvent,
  createDecisionProvenanceManifest,
  type DecisionEngineReference,
  type DecisionPolicyReference,
  type DecisionProvenanceManifest,
  type DecisionSourceDataReference,
} from "@/domain/decision/decision-provenance";
import type { CommercialDecisionEvent } from "@/domain/events/commercial-decision-events";
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

export const DEFAULT_REPLENISHMENT_ENGINE_REFERENCES: readonly DecisionEngineReference[] =
  Object.freeze([
    { name: "commercial-data-quality-engine", version: "1" },
    { name: "demand-forecast-engine", version: "1" },
    { name: "inventory-health-engine", version: "1" },
    { name: "supply-planning-engine", version: "1" },
    { name: "purchase-recommendation-engine", version: "1" },
    { name: "unified-decision-engine", version: "1" },
    { name: "decision-execution-gate", version: "1" },
  ]);

export interface DurableReplenishmentInput extends AutomatedReplenishmentInput {
  readonly idempotencyKey: string;
  readonly requestFingerprint?: string;
  readonly idempotencyRegistry: IdempotencyRegistry;
  readonly existingOutbox?: TransactionalOutbox;
  readonly approvalPolicy?: ApprovalWorkflowPolicy;
  readonly policyReferences?: readonly DecisionPolicyReference[];
  readonly engineReferences?: readonly DecisionEngineReference[];
  readonly sourceDataReferences?: readonly DecisionSourceDataReference[];
  readonly idempotencyTtlSeconds?: number;
}

export interface DurableReplenishmentAccepted {
  readonly status: "accepted";
  readonly beginOutcome: "started" | "retry_started";
  readonly requestFingerprint: string;
  readonly inputSnapshotFingerprint: string;
  readonly result: AutomatedReplenishmentResult;
  readonly approvals: ApprovalWorkflow;
  readonly journal: ExecutionJournal;
  readonly provenance: DecisionProvenanceManifest;
  readonly events: readonly CommercialDecisionEvent[];
  readonly outbox: TransactionalOutbox;
  readonly idempotencyRegistry: IdempotencyRegistry;
}

export interface DurableReplenishmentDeferred {
  readonly status: "replay" | "in_progress" | "conflict";
  readonly beginOutcome: IdempotencyBeginOutcome;
  readonly requestFingerprint: string;
  readonly record: IdempotencyRecord;
  readonly idempotencyRegistry: IdempotencyRegistry;
}

export interface DurableReplenishmentFailed {
  readonly status: "failed";
  readonly requestFingerprint: string;
  readonly error: string;
  readonly idempotencyRegistry: IdempotencyRegistry;
}

export type DurableReplenishmentResult =
  | DurableReplenishmentAccepted
  | DurableReplenishmentDeferred
  | DurableReplenishmentFailed;

export function createDurableReplenishmentFingerprint(
  input: DurableReplenishmentInput,
): string {
  return createStableFingerprint({
    id: input.id,
    organizationId: input.organizationId,
    warehouseId: input.warehouseId,
    skuId: input.skuId,
    planningDate: input.planningDate,
    inventory: input.inventory,
    forecast: input.forecast,
    atp: input.atp,
    supplyPolicy: input.supplyPolicy,
    classification: input.classification,
    supplier: input.supplier,
    budget: input.budget,
    openPurchaseOrderUnits: input.openPurchaseOrderUnits ?? 0,
    minimumDataQualityScore: input.minimumDataQualityScore ?? null,
    executionPolicy: input.executionPolicy ?? null,
    approvalPolicy: input.approvalPolicy ?? null,
    policyReferences: input.policyReferences ?? [],
    engineReferences:
      input.engineReferences ?? DEFAULT_REPLENISHMENT_ENGINE_REFERENCES,
    sourceDataReferences: input.sourceDataReferences ?? [],
  });
}

export function runDurableReplenishment(
  input: DurableReplenishmentInput,
): DurableReplenishmentResult {
  const generatedAt = input.analysisAt ?? new Date().toISOString();
  const inputSnapshotFingerprint = createDurableReplenishmentFingerprint(input);
  const requestFingerprint = input.requestFingerprint ?? inputSnapshotFingerprint;
  const begin = beginIdempotentOperation({
    registry: input.idempotencyRegistry,
    key: input.idempotencyKey,
    scope: "automated_replenishment",
    fingerprint: requestFingerprint,
    now: generatedAt,
    ttlSeconds: input.idempotencyTtlSeconds,
  });

  if (
    begin.outcome === "replay" ||
    begin.outcome === "in_progress" ||
    begin.outcome === "conflict"
  ) {
    return Object.freeze({
      status: begin.outcome,
      beginOutcome: begin.outcome,
      requestFingerprint,
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
    const provenance = createDecisionProvenanceManifest({
      contextId: result.id,
      aggregateId:
        result.analysis.decisionResolution.resolutionDecision.entityId,
      requestFingerprint,
      inputSnapshotFingerprint,
      policyReferences: input.policyReferences,
      engineReferences:
        input.engineReferences ?? DEFAULT_REPLENISHMENT_ENGINE_REFERENCES,
      sourceDataReferences: input.sourceDataReferences,
      decisionIds: [
        ...result.analysis.decisionResolution.orderedDecisions.map(
          (decision) => decision.id,
        ),
        result.executionPlan.decision.id,
      ],
      generatedAt,
    });
    const provenanceEvent = createDecisionProvenanceEvent({
      manifest: provenance,
      causationId: result.executionPlan.decision.id,
      sequence: result.events.length + 1,
    });
    const events = Object.freeze([...result.events, provenanceEvent]);
    const outbox = enqueueOutboxEvents({
      outbox: input.existingOutbox ?? createTransactionalOutbox(),
      events,
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
      requestFingerprint,
      inputSnapshotFingerprint,
      result,
      approvals,
      journal,
      provenance,
      events,
      outbox,
      idempotencyRegistry,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown replenishment failure";
    return Object.freeze({
      status: "failed",
      requestFingerprint,
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
