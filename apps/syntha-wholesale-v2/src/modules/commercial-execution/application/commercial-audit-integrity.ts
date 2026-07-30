import { createHash } from "node:crypto";

import { canonicalStringify } from "@/domain/execution/stable-fingerprint";

import type {
  CommercialAuditIntegrityReport,
  CommercialAuditStream,
} from "../domain/commercial-audit-chain";
import type { CommercialOperationsAuditRecord } from "../domain/commercial-operations-audit";
import type { IntegrationReconciliationAuditRecord } from "../domain/integration-reconciliation-audit";

const GENESIS_HASH = "sha256:genesis";

type AuditRecord =
  | CommercialOperationsAuditRecord
  | IntegrationReconciliationAuditRecord;

export type SealedCommercialAuditRecord<RecordType extends AuditRecord> =
  RecordType & {
    readonly sequence: number;
    readonly previousHash: string;
    readonly recordHash: string;
  };

type SealedAuditRecord = SealedCommercialAuditRecord<AuditRecord>;

interface StreamRecord {
  readonly stream: CommercialAuditStream;
  readonly record: AuditRecord;
}

function payload(record: AuditRecord): Readonly<Record<string, unknown>> {
  const { sequence, previousHash, recordHash, ...content } = record;
  void sequence;
  void previousHash;
  void recordHash;
  return content;
}

function digest(input: {
  readonly stream: CommercialAuditStream;
  readonly sequence: number;
  readonly previousHash: string;
  readonly record: AuditRecord;
}): string {
  const value = canonicalStringify({
    stream: input.stream,
    sequence: input.sequence,
    previousHash: input.previousHash,
    record: payload(input.record),
  });
  return `sha256:${createHash("sha256").update(value, "utf8").digest("hex")}`;
}

function records(input: {
  readonly operationsAudit: readonly CommercialOperationsAuditRecord[];
  readonly reconciliationAudit: readonly IntegrationReconciliationAuditRecord[];
}): readonly StreamRecord[] {
  return Object.freeze([
    ...input.operationsAudit.map((record) => ({
      stream: "operations" as const,
      record,
    })),
    ...input.reconciliationAudit.map((record) => ({
      stream: "reconciliation" as const,
      record,
    })),
  ]);
}

function isSealed(record: AuditRecord): record is SealedAuditRecord {
  return (
    Number.isInteger(record.sequence) &&
    (record.sequence ?? 0) > 0 &&
    typeof record.previousHash === "string" &&
    record.previousHash.length > 0 &&
    typeof record.recordHash === "string" &&
    record.recordHash.length > 0
  );
}

export function verifyCommercialAuditChain(input: {
  readonly operationsAudit: readonly CommercialOperationsAuditRecord[];
  readonly reconciliationAudit: readonly IntegrationReconciliationAuditRecord[];
}): CommercialAuditIntegrityReport {
  const all = records(input);
  const legacyRecords = all.filter(({ record }) => !isSealed(record)).length;
  const sealed = all
    .filter(
      (item): item is StreamRecord & { readonly record: SealedAuditRecord } =>
        isSealed(item.record),
    )
    .sort((left, right) => left.record.sequence - right.record.sequence);

  let previousHash = GENESIS_HASH;
  for (let index = 0; index < sealed.length; index += 1) {
    const item = sealed[index];
    const expectedSequence = index + 1;
    if (item.record.sequence !== expectedSequence) {
      return Object.freeze({
        status: "invalid",
        sealedRecords: sealed.length,
        legacyRecords,
        latestSequence: sealed.at(-1)?.record.sequence ?? 0,
        latestHash: sealed.at(-1)?.record.recordHash,
        firstInvalidSequence: item.record.sequence,
        reason: `Audit sequence ${item.record.sequence} should be ${expectedSequence}.`,
      });
    }
    if (item.record.previousHash !== previousHash) {
      return Object.freeze({
        status: "invalid",
        sealedRecords: sealed.length,
        legacyRecords,
        latestSequence: sealed.at(-1)?.record.sequence ?? 0,
        latestHash: sealed.at(-1)?.record.recordHash,
        firstInvalidSequence: item.record.sequence,
        reason: `Audit record ${item.record.sequence} has an invalid previous hash.`,
      });
    }
    const expectedHash = digest({
      stream: item.stream,
      sequence: item.record.sequence,
      previousHash: item.record.previousHash,
      record: item.record,
    });
    if (item.record.recordHash !== expectedHash) {
      return Object.freeze({
        status: "invalid",
        sealedRecords: sealed.length,
        legacyRecords,
        latestSequence: sealed.at(-1)?.record.sequence ?? 0,
        latestHash: sealed.at(-1)?.record.recordHash,
        firstInvalidSequence: item.record.sequence,
        reason: `Audit record ${item.record.sequence} payload hash is invalid.`,
      });
    }
    previousHash = item.record.recordHash;
  }

  return Object.freeze({
    status: legacyRecords > 0 ? "partially_sealed" : "valid",
    sealedRecords: sealed.length,
    legacyRecords,
    latestSequence: sealed.at(-1)?.record.sequence ?? 0,
    latestHash: sealed.at(-1)?.record.recordHash,
  });
}

export function sealCommercialAuditRecord<RecordType extends AuditRecord>(input: {
  readonly stream: CommercialAuditStream;
  readonly record: RecordType;
  readonly operationsAudit: readonly CommercialOperationsAuditRecord[];
  readonly reconciliationAudit: readonly IntegrationReconciliationAuditRecord[];
}): SealedCommercialAuditRecord<RecordType> {
  const integrity = verifyCommercialAuditChain({
    operationsAudit: input.operationsAudit,
    reconciliationAudit: input.reconciliationAudit,
  });
  if (integrity.status === "invalid") {
    throw new Error(
      `Commercial audit chain is invalid: ${integrity.reason ?? "unknown integrity failure"}`,
    );
  }
  const sequence = integrity.latestSequence + 1;
  const previousHash = integrity.latestHash ?? GENESIS_HASH;
  const recordHash = digest({
    stream: input.stream,
    sequence,
    previousHash,
    record: input.record,
  });
  return Object.freeze({
    ...input.record,
    sequence,
    previousHash,
    recordHash,
  }) as unknown as SealedCommercialAuditRecord<RecordType>;
}
