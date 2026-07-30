import { describe, expect, it } from "vitest";

import { classifyAbcXyz } from "./abc-xyz-classifier";

describe("classifyAbcXyz", () => {
  it("classifies contribution and demand variability", () => {
    const result = classifyAbcXyz([
      {
        skuId: "SKU-A",
        contributionValue: 800,
        demandHistory: [10, 10, 10, 10],
      },
      {
        skuId: "SKU-B",
        contributionValue: 150,
        demandHistory: [0, 20, 0, 20],
      },
      {
        skuId: "SKU-C",
        contributionValue: 50,
        demandHistory: [0, 0, 0, 30],
      },
    ]);

    expect(result.map((item) => item.segment)).toEqual(["AX", "BY", "CZ"]);
    expect(result[0]?.contributionShare).toBe(0.8);
    expect(result[1]?.cumulativeContributionShare).toBe(0.95);
    expect(result[2]?.policy.replenishmentMode).toBe("do_not_replenish");
  });

  it("assigns zero-contribution and zero-demand SKUs to CZ", () => {
    const result = classifyAbcXyz([
      {
        skuId: "SKU-ZERO",
        contributionValue: 0,
        demandHistory: [0, 0, 0],
      },
    ]);

    expect(result[0]?.segment).toBe("CZ");
  });

  it("supports configurable XYZ thresholds", () => {
    const result = classifyAbcXyz(
      [
        {
          skuId: "SKU-CUSTOM",
          contributionValue: 100,
          demandHistory: [5, 15, 5, 15],
        },
      ],
      {
        xCoefficientVariationThreshold: 0.6,
        yCoefficientVariationThreshold: 0.8,
      },
    );

    expect(result[0]?.xyzClass).toBe("X");
  });

  it("rejects duplicate SKUs", () => {
    expect(() =>
      classifyAbcXyz([
        {
          skuId: "SKU-1",
          contributionValue: 10,
          demandHistory: [1],
        },
        {
          skuId: "SKU-1",
          contributionValue: 20,
          demandHistory: [2],
        },
      ]),
    ).toThrow("Duplicate SKU in ABC/XYZ input: SKU-1");
  });
});
