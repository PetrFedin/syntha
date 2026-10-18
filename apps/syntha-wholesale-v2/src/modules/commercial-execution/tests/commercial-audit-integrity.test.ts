import { describe, expect, it } from "vitest";

import {
  sealCommercialAuditRecord,
  verifyCommercialAuditChain,
  type CommercialOperationsAuditRecord,
  type IntegrationReconciliationAuditRecord,
} from "../index";

function operation(actionId: string): CommercialOperationsAuditRecord {
  return {
    actionId,
    actionType: "cancel_command",
    targetId: "CMD-1",
    actorId: "operator-1",
    outcome: "applied",
    occurredAt: "2026-07-29T00:00:00.000Z",
  };
}

function reconciliation(jobId: string): IntegrationReconciliationAuditRecord {
  return {
    jobId,
    actorId: "scheduler-1",
    workflowId: "WF-1",
    status: "completed",
    scannedRecords: 1,
    appliedRecords: 1,
    unresolvedRecords: 0,
    occurredAt: "2026-07-29T00:01:00.000Z",
  };
}

describe("commercial audit integrity", () => {
  it("creates one ordered hash chain across operations and reconciliation", () => {
    const first = sealCommercialAuditRecord({
      stream: "operations",
      record: operation("ACTION-1"),
      operationsAudit: [],
      reconciliationAudit: [],
    });
    const second = sealCommercialAuditRecord({
      stream: "reconciliation",
      record: reconciliation("JOB-1"),
      operationsAudit: [first],
      reconciliationAudit: [],
    });

    const report = verifyCommercialAuditChain({
      operationsAudit: [first],
      reconciliationAudit: [second],
    });

    expect(first.sequence).toBe(1);
    expect(second.sequence).toBe(2);
    expect(second.previousHash).toBe(first.recordHash);
    expect(report.status).toBe("valid");
    expect(report.latestSequence).toBe(2);
  });

  it("detects payload tampering and prevents appending", () => {
    const first = sealCommercialAuditRecord({
      stream: "operations",
      record: operation("ACTION-1"),
      operationsAudit: [],
      reconciliationAudit: [],
    });
    const tampered = { ...first, actorId: "attacker" };
    const report = verifyCommercialAuditChain({
      operationsAudit: [tampered],
      reconciliationAudit: [],
    });

    expect(report.status).toBe("invalid");
    expect(() =>
      sealCommercialAuditRecord({
        stream: "operations",
        record: operation("ACTION-2"),
        operationsAudit: [tampered],
        reconciliationAudit: [],
      }),
    ).toThrow("audit chain is invalid");
  });

  it("keeps legacy records readable while sealing new history", () => {
    const legacy = operation("LEGACY-1");
    const sealed = sealCommercialAuditRecord({
      stream: "operations",
      record: operation("ACTION-1"),
      operationsAudit: [legacy],
      reconciliationAudit: [],
    });
    const report = verifyCommercialAuditChain({
      operationsAudit: [legacy, sealed],
      reconciliationAudit: [],
    });

    expect(report.status).toBe("partially_sealed");
    expect(report.legacyRecords).toBe(1);
    expect(report.sealedRecords).toBe(1);
  });
});
