import { describe, expect, it } from "vitest";

import {
  createDecisionProvenanceEvent,
  createDecisionProvenanceManifest,
  verifyDecisionProvenanceManifest,
} from "./decision-provenance";

describe("decision provenance", () => {
  it("creates a deterministic, verifiable manifest", () => {
    const manifest = createDecisionProvenanceManifest({
      contextId: "CTX-1",
      aggregateId: "SKU-1",
      requestFingerprint: "request-1",
      inputSnapshotFingerprint: "input-1",
      policyReferences: [
        {
          kind: "execution",
          policyId: "execution:v1",
          version: 1,
          configFingerprint: "policy-hash",
        },
      ],
      engineReferences: [{ name: "execution-gate", version: "1" }],
      sourceDataReferences: [{ sourceType: "sales", sourceId: "sales-v1" }],
      decisionIds: ["D-2", "D-1", "D-1"],
      generatedAt: "2026-07-29T00:00:00.000Z",
    });

    expect(manifest.decisionIds).toEqual(["D-1", "D-2"]);
    expect(verifyDecisionProvenanceManifest(manifest).valid).toBe(true);
    expect(
      createDecisionProvenanceEvent({
        manifest,
        causationId: "D-2",
        sequence: 4,
      }).eventType,
    ).toBe("commercial.decision.provenance_recorded");
  });

  it("detects manifest tampering", () => {
    const manifest = createDecisionProvenanceManifest({
      contextId: "CTX-1",
      aggregateId: "SKU-1",
      requestFingerprint: "request-1",
      inputSnapshotFingerprint: "input-1",
      decisionIds: ["D-1"],
    });
    const tampered = { ...manifest, requestFingerprint: "changed" };

    expect(verifyDecisionProvenanceManifest(tampered).valid).toBe(false);
  });
});
