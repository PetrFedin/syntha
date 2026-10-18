import { describe, expect, it } from "vitest";

import { canonicalStringify, createStableFingerprint } from "./stable-fingerprint";

describe("stable fingerprint", () => {
  it("is independent of object key insertion order", () => {
    const left = { skuId: "SKU-1", budget: { currency: "RUB", amount: 1000 } };
    const right = { budget: { amount: 1000, currency: "RUB" }, skuId: "SKU-1" };

    expect(canonicalStringify(left)).toBe(canonicalStringify(right));
    expect(createStableFingerprint(left)).toBe(createStableFingerprint(right));
  });

  it("changes when a nested commercial input changes", () => {
    const left = { skuId: "SKU-1", budget: { amount: 1000 } };
    const right = { skuId: "SKU-1", budget: { amount: 1001 } };

    expect(createStableFingerprint(left)).not.toBe(createStableFingerprint(right));
  });

  it("rejects cyclic values", () => {
    const value: { self?: unknown } = {};
    value.self = value;

    expect(() => createStableFingerprint(value)).toThrow("cyclic");
  });
});
