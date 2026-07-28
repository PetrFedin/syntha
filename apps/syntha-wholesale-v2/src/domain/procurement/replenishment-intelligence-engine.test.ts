import { describe, expect, it } from "vitest";

import type { AtpProjection } from "@/domain/inventory/available-to-promise";

import { analyzeReplenishment } from "./replenishment-intelligence-engine";

const observations = Array.from({ length: 28 }, (_, index) => ({
  date: `2026-07-${String(index + 1).padStart(2, "0")}`,
  units: 5,
}));

const atp: AtpProjection = {
  organizationId: "ORG-1",
  warehouseId: "WH-1",
  skuId: "SKU-1",
  asOf: "2026-07-29",
  horizonEnd: "2026-08-31",
  currentOnHand: 20,
  currentCommitted: 0,
  currentAvailable: 20,
  firstShortageDate: "2026-08-03",
  minimumAtp: -15,
  buckets: [
    {
      date: "2026-08-03",
      openingAvailable: 20,
      incomingSupply: 0,
      outgoingDemand: 35,
      safetyStock: 10,
      availableToPromise: -25,
      shortage: 25,
    },
  ],
};

const baseInput = {
  id: "RI-1",
  organizationId: "ORG-1",
  warehouseId: "WH-1",
  skuId: "SKU-1",
  planningDate: "2026-07-29",
  inventory: {
    availableUnits: 20,
    reservedUnits: 0,
    inboundUnits: 0,
    daysSinceLastSale: 1,
    unitCost: 1000,
    currency: "RUB",
  },
  forecast: {
    observations,
    horizonDays: 7,
    forecastStartDate: "2026-07-29",
    generatedAt: "2026-07-29T00:00:00.000Z",
  },
  atp,
  supplyPolicy: {
    leadTimeDays: 7,
    reviewPeriodDays: 7,
    safetyStock: 10,
    targetCoverDays: 21,
    minimumOrderQuantity: 10,
    orderMultiple: 10,
  },
  classification: {
    segment: "AX" as const,
    coefficientOfVariation: 0,
    policy: {
      serviceLevelTarget: 0.98,
      reviewCadence: "daily" as const,
      replenishmentMode: "continuous" as const,
      priority: "critical" as const,
    },
  },
  supplier: {
    supplierId: "SUP-1",
    active: true,
    approved: true,
    unitCost: 1000,
    currency: "RUB",
    availableCapacityUnits: 500,
  },
  budget: {
    currency: "RUB",
    availableAmount: 500000,
  },
  analysisAt: "2026-07-29T00:00:00.000Z",
} as const;

describe("analyzeReplenishment", () => {
  it("runs and resolves the connected replenishment decision flow", () => {
    const result = analyzeReplenishment(baseInput);

    expect(result.inventory.forecast.averageDailyDemand).toBe(5);
    expect(result.supplyPlan.recommendedOrderQuantity).toBeGreaterThan(0);
    expect(result.purchase.status).toBe("ready");
    expect(result.purchase.recommendedUnits).toBeGreaterThan(0);
    expect(result.decisions).toHaveLength(2);
    expect(result.decisions[1]?.decisionType).toBe(
      "purchase_recommendation",
    );
    expect(result.decisionResolution.status).toBe("clear");
    expect(result.decisionResolution.resolutionDecision.decisionType).toBe(
      "unified_commercial_decision",
    );
  });

  it("propagates supplier blocking into the unified resolution", () => {
    const result = analyzeReplenishment({
      ...baseInput,
      supplier: { ...baseInput.supplier, active: false },
    });

    expect(result.purchase.status).toBe("blocked");
    expect(result.purchase.decision.actions[0]?.type).toBe("supplier_review");
    expect(result.decisionResolution.status).toBe("blocked");
  });

  it("suppresses automation when inventory and ATP sources conflict", () => {
    const result = analyzeReplenishment({
      ...baseInput,
      inventory: {
        ...baseInput.inventory,
        availableUnits: 1000,
      },
    });

    expect(result.inventory.health.decision.actions.map((action) => action.type)).toContain(
      "stop_replenishment",
    );
    expect(result.purchase.decision.actions.map((action) => action.type)).toContain(
      "create_purchase_order",
    );
    expect(result.decisionResolution.status).toBe("requires_review");
    expect(result.decisionResolution.conflicts).toHaveLength(1);
    expect(result.decisionResolution.actions.map((action) => action.type)).toEqual([
      "transfer_stock",
      "review",
    ]);
  });

  it("rejects an ATP projection from another warehouse", () => {
    expect(() =>
      analyzeReplenishment({
        ...baseInput,
        atp: { ...atp, warehouseId: "WH-2" },
      }),
    ).toThrow("scope must match the ATP projection scope");
  });
});
