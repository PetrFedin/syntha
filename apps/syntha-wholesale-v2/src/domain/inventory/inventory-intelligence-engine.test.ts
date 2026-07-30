import { describe, expect, it } from "vitest";

import { analyzeInventoryPosition } from "./inventory-intelligence-engine";

const observations = Array.from({ length: 28 }, (_value, index) => ({
  date: `2026-06-${String(index + 1).padStart(2, "0")}`,
  units: 10,
}));

describe("analyzeInventoryPosition", () => {
  it("connects forecast demand to a replenishment decision", () => {
    const result = analyzeInventoryPosition({
      skuId: "SKU-LOW",
      warehouseId: "WH-1",
      analysisAt: "2026-07-01T12:00:00.000Z",
      forecast: {
        observations,
        horizonDays: 7,
      },
      inventory: {
        availableUnits: 10,
        reservedUnits: 0,
        inboundUnits: 0,
        safetyStockUnits: 10,
        targetCoverageDays: 30,
        leadTimeDays: 7,
        daysSinceLastSale: 1,
        unitCost: 1000,
        currency: "RUB",
      },
    });

    expect(result.demandProjection.averageDailyDemand).toBe(10);
    expect(result.demandProjection.forecastDemandDuringLeadTime).toBe(70);
    expect(result.health.shortageUnits).toBe(70);
    expect(result.decisions[0]?.actions[0]?.type).toBe(
      "create_replenishment",
    );
  });

  it("extends the forecast horizon to cover supplier lead time", () => {
    const result = analyzeInventoryPosition({
      skuId: "SKU-LONG-LEAD",
      warehouseId: "WH-1",
      analysisAt: "2026-07-01T12:00:00.000Z",
      forecast: {
        observations,
        horizonDays: 3,
      },
      inventory: {
        availableUnits: 200,
        reservedUnits: 0,
        inboundUnits: 0,
        safetyStockUnits: 20,
        targetCoverageDays: 30,
        leadTimeDays: 14,
        daysSinceLastSale: 1,
        unitCost: 1000,
        currency: "RUB",
      },
    });

    expect(result.forecast.horizonDays).toBe(14);
    expect(result.forecast.points).toHaveLength(14);
    expect(result.demandProjection.forecastDemandDuringLeadTime).toBe(140);
  });

  it("propagates forecast confidence into the commercial decision", () => {
    const result = analyzeInventoryPosition({
      skuId: "SKU-CONFIDENCE",
      warehouseId: "WH-1",
      analysisAt: "2026-07-01T12:00:00.000Z",
      forecast: {
        observations,
        horizonDays: 7,
      },
      inventory: {
        availableUnits: 100,
        reservedUnits: 0,
        inboundUnits: 0,
        safetyStockUnits: 10,
        targetCoverageDays: 7,
        leadTimeDays: 7,
        daysSinceLastSale: 1,
        unitCost: 1000,
        currency: "RUB",
      },
    });

    expect(result.health.decision.confidence).toBe(
      result.forecast.diagnostics.confidence,
    );
  });
});
