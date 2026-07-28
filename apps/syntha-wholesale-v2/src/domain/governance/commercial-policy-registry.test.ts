import { describe, expect, it } from "vitest";

import {
  activateCommercialPolicy,
  createCommercialPolicyRegistry,
  registerCommercialPolicy,
  resolveCommercialPolicy,
} from "./commercial-policy-registry";

describe("commercial policy registry", () => {
  it("versions policies and resolves the version effective on a date", () => {
    const first = registerCommercialPolicy({
      registry: createCommercialPolicyRegistry(),
      kind: "execution",
      config: { minimumConfidence: 0.8 },
      effectiveFrom: "2026-01-01T00:00:00.000Z",
      createdAt: "2025-12-01T00:00:00.000Z",
    });
    let registry = activateCommercialPolicy({
      registry: first.registry,
      policyId: first.policy.id,
      activatedAt: "2025-12-15T00:00:00.000Z",
    });
    const second = registerCommercialPolicy({
      registry,
      kind: "execution",
      config: { minimumConfidence: 0.9 },
      effectiveFrom: "2026-07-01T00:00:00.000Z",
      createdAt: "2026-06-01T00:00:00.000Z",
    });
    registry = activateCommercialPolicy({
      registry: second.registry,
      policyId: second.policy.id,
      activatedAt: "2026-06-15T00:00:00.000Z",
    });

    expect(
      resolveCommercialPolicy({
        registry,
        kind: "execution",
        at: "2026-06-30T00:00:00.000Z",
      })?.version,
    ).toBe(1);
    expect(
      resolveCommercialPolicy({
        registry,
        kind: "execution",
        at: "2026-07-01T00:00:00.000Z",
      })?.version,
    ).toBe(2);
  });

  it("copies and fingerprints policy configuration immutably", () => {
    const config = { thresholds: { confidence: 0.8 } };
    const registered = registerCommercialPolicy({
      registry: createCommercialPolicyRegistry(),
      kind: "execution",
      config,
    });
    config.thresholds.confidence = 0.1;

    expect(
      (registered.policy.config.thresholds as { confidence: number }).confidence,
    ).toBe(0.8);
    expect(registered.policy.configFingerprint).toMatch(/^fnv1a64:/);
  });
});
