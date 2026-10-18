import { createStableFingerprint } from "@/domain/execution/stable-fingerprint";
import type { CommercialDecisionEvent } from "@/domain/events/commercial-decision-events";
import type { CommercialPolicyKind } from "@/domain/governance/commercial-policy-registry";

export interface DecisionPolicyReference {
  readonly kind: CommercialPolicyKind;
  readonly policyId: string;
  readonly version: number;
  readonly configFingerprint: string;
}

export interface DecisionEngineReference {
  readonly name: string;
  readonly version: string;
  readonly build?: string;
}

export interface DecisionSourceDataReference {
  readonly sourceType: string;
  readonly sourceId: string;
  readonly version?: string;
  readonly fingerprint?: string;
}

export interface DecisionProvenanceManifest {
  readonly contextId: string;
  readonly aggregateId: string;
  readonly generatedAt: string;
  readonly requestFingerprint: string;
  readonly inputSnapshotFingerprint: string;
  readonly policyReferences: readonly DecisionPolicyReference[];
  readonly engineReferences: readonly DecisionEngineReference[];
  readonly sourceDataReferences: readonly DecisionSourceDataReference[];
  readonly decisionIds: readonly string[];
  readonly manifestFingerprint: string;
}

function uniqueSorted<T>(
  values: readonly T[],
  key: (value: T) => string,
): readonly T[] {
  const byKey = new Map<string, T>();
  for (const value of values) byKey.set(key(value), value);
  return Object.freeze(
    [...byKey.values()].sort((left, right) => key(left).localeCompare(key(right))),
  );
}

function manifestBody(input: Omit<DecisionProvenanceManifest, "manifestFingerprint">) {
  return {
    contextId: input.contextId,
    aggregateId: input.aggregateId,
    generatedAt: input.generatedAt,
    requestFingerprint: input.requestFingerprint,
    inputSnapshotFingerprint: input.inputSnapshotFingerprint,
    policyReferences: input.policyReferences,
    engineReferences: input.engineReferences,
    sourceDataReferences: input.sourceDataReferences,
    decisionIds: input.decisionIds,
  };
}

export function createDecisionProvenanceManifest(input: {
  readonly contextId: string;
  readonly aggregateId: string;
  readonly requestFingerprint: string;
  readonly inputSnapshotFingerprint: string;
  readonly policyReferences?: readonly DecisionPolicyReference[];
  readonly engineReferences?: readonly DecisionEngineReference[];
  readonly sourceDataReferences?: readonly DecisionSourceDataReference[];
  readonly decisionIds: readonly string[];
  readonly generatedAt?: string;
}): DecisionProvenanceManifest {
  if (!input.contextId.trim()) throw new Error("Provenance context id is required.");
  if (!input.aggregateId.trim()) throw new Error("Provenance aggregate id is required.");
  if (!input.requestFingerprint.trim()) {
    throw new Error("Provenance request fingerprint is required.");
  }
  if (!input.inputSnapshotFingerprint.trim()) {
    throw new Error("Provenance input snapshot fingerprint is required.");
  }
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  if (Number.isNaN(Date.parse(generatedAt))) {
    throw new Error("Provenance generation time must be a valid ISO date string.");
  }
  const body = Object.freeze({
    contextId: input.contextId,
    aggregateId: input.aggregateId,
    generatedAt,
    requestFingerprint: input.requestFingerprint,
    inputSnapshotFingerprint: input.inputSnapshotFingerprint,
    policyReferences: uniqueSorted(
      input.policyReferences ?? [],
      (reference) => `${reference.kind}:${reference.policyId}:${reference.version}`,
    ),
    engineReferences: uniqueSorted(
      input.engineReferences ?? [],
      (reference) => `${reference.name}:${reference.version}:${reference.build ?? ""}`,
    ),
    sourceDataReferences: uniqueSorted(
      input.sourceDataReferences ?? [],
      (reference) =>
        `${reference.sourceType}:${reference.sourceId}:${reference.version ?? ""}`,
    ),
    decisionIds: Object.freeze([...new Set(input.decisionIds)].sort()),
  });
  return Object.freeze({
    ...body,
    manifestFingerprint: createStableFingerprint(body),
  });
}

export function verifyDecisionProvenanceManifest(
  manifest: DecisionProvenanceManifest,
): { readonly valid: boolean; readonly expectedFingerprint: string } {
  const expectedFingerprint = createStableFingerprint(
    manifestBody(manifest),
  );
  return Object.freeze({
    valid: expectedFingerprint === manifest.manifestFingerprint,
    expectedFingerprint,
  });
}

export function createDecisionProvenanceEvent(input: {
  readonly manifest: DecisionProvenanceManifest;
  readonly causationId: string;
  readonly sequence: number;
}): CommercialDecisionEvent {
  if (!Number.isInteger(input.sequence) || input.sequence <= 0) {
    throw new Error("Provenance event sequence must be a positive integer.");
  }
  return Object.freeze({
    eventId: `${input.manifest.contextId}:${input.sequence}:provenance-recorded`,
    eventType: "commercial.decision.provenance_recorded",
    aggregateType: "commercial_decision",
    aggregateId: input.manifest.aggregateId,
    sequence: input.sequence,
    occurredAt: input.manifest.generatedAt,
    correlationId: input.manifest.contextId,
    causationId: input.causationId,
    source: "commercial-decision-events",
    payload: Object.freeze({ ...input.manifest }),
  });
}
