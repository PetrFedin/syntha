import { describe, expect, it } from "vitest";

import { assessInventoryHealth } from "./inventory-health-engine";

describe("assessInventoryHealth", () => {
  it("recommends replenishment when projected stock is insufficient", () => {
    const result = assessInventoryHealth({
      skuId: "SKU-1",
      warehouseId: "WH-1",
      availableUnits: 20,
      reservedUnits: 5,
      inboundUnits: 0,
      averageDailyDemand: 5,
      forecastDemandDuringLeadTime: 50,
      safetyStockUnits: 20,
      targetCoverageDays: 30,
      leadTimeDays: 10,
      daysSinceLastSale: 2,
      unitCost: 1000,
      currency: "RUB",
      calculatedAt: "2026-07-28T12:00:00.000Z",
    });

    expect(result.shortageUnits).toBe(55);
    expect(result.status).toBe("risk");
    expect(result.decision.actions[0]?.type).toBe("create_replenishment");
  });

  it("detects excess and capital at risk", () => {
    const result = assessInventoryHealth({
      skuId: "SKU-2",
      warehouseId: "WH-1",
      availableUnits: 500,
      reservedUnits: 0,
      inboundUnits: 0,
      averageDailyDemand: 2,
      forecastDemandDuringLeadTime: 20,
      safetyStockUnits: 10,
      targetCoverageDays: 60,
      leadTimeDays: 10,
      daysSinceLastSale: 30,
      unitCost: 2500,
      currency: "RUB",
      calculatedAt: "2026-07-28T12:00:00.000Z",
    });

    expect(result.excessUnits).toBe(370);
    expect(result.capitalAtRisk).toBe(925000);
    expect(result.decision.actions.map((action) => action.type)).toContain(
      "stop_replenishment",
    );
  });

  it("classifies inventory with no sale for one year as dead", () => {
    const result = assessInventoryHealth({
      skuId: "SKU-3",
      warehouseId: "WH-1",
      availableUnits: 10,
      reservedUnits: 0,
      inboundUnits: 0,
      averageDailyDemand: 0,
      forecastDemandDuringLeadTime: 0,
      safetyStockUnits: 0,
      targetCoverageDays: 0,
      leadTimeDays: 0,
      daysSinceLastSale: 365,
      unitCost: 500,
      currency: "RUB",
      calculatedAt: "2026-07-28T12:00:00.000Z",
    });

    expect(result.velocity).toBe("dead");
    expect(result.decision.actions.map((action) => action.type)).toContain(
      "liquidate",
    );
  });
});
