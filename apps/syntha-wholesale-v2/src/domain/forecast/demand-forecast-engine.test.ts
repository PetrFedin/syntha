import { describe, expect, it } from "vitest";

import {
  deriveInventoryDemandProjection,
  forecastDemand,
} from "./demand-forecast-engine";

const datedSeries = (values: number[]) =>
  values.map((units, index) => ({
    date: `2026-07-${String(index + 1).padStart(2, "0")}`,
    units,
  }));

describe("forecastDemand", () => {
  it("produces a stable forecast for stable demand", () => {
    const result = forecastDemand({
      skuId: "SKU-STABLE",
      observations: datedSeries(Array.from({ length: 14 }, () => 10)),
      horizonDays: 3,
      generatedAt: "2026-07-20T12:00:00.000Z",
    });

    expect(result.totalUnits).toBe(30);
    expect(result.averageDailyDemand).toBe(10);
    expect(result.points.map((point) => point.adjustedUnits)).toEqual([
      10, 10, 10,
    ]);
    expect(result.diagnostics.selectedScore.mae).toBe(0);
  });

  it("selects a trend-capable model for linear demand", () => {
    const result = forecastDemand({
      skuId: "SKU-TREND",
      observations: datedSeries(
        Array.from({ length: 14 }, (_value, index) => index + 1),
      ),
      horizonDays: 2,
      generatedAt: "2026-07-20T12:00:00.000Z",
    });

    expect(result.method).toBe("linear_trend");
    expect(result.points[0]?.baselineUnits).toBe(15);
    expect(result.points[1]?.baselineUnits).toBe(16);
    expect(result.points[0]?.lowerUnits).toBeLessThanOrEqual(15);
    expect(result.points[0]?.upperUnits).toBeGreaterThanOrEqual(15);
  });

  it("applies commercial adjustments and derives lead-time demand", () => {
    const result = forecastDemand({
      skuId: "SKU-PROMO",
      observations: datedSeries(Array.from({ length: 14 }, () => 10)),
      horizonDays: 3,
      adjustments: [
        {
          dayOffset: 1,
          multiplier: 2,
          additiveUnits: 5,
          reason: "Campaign launch",
        },
      ],
      generatedAt: "2026-07-20T12:00:00.000Z",
    });

    expect(result.points[1]?.adjustedUnits).toBe(25);
    expect(result.points[1]?.appliedAdjustments).toEqual([
      "Campaign launch",
    ]);

    const inventoryProjection = deriveInventoryDemandProjection(result, 2);
    expect(inventoryProjection.averageDailyDemand).toBe(15);
    expect(inventoryProjection.forecastDemandDuringLeadTime).toBe(35);
  });

  it("rejects an empty demand history", () => {
    expect(() =>
      forecastDemand({
        skuId: "SKU-EMPTY",
        observations: [],
        horizonDays: 7,
      }),
    ).toThrow("Demand forecast requires at least one observation.");
  });
});
