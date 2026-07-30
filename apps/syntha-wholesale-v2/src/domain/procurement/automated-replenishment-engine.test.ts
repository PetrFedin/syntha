import { describe, expect, it } from "vitest";

import type { AtpProjection } from "@/domain/inventory/available-to-promise";

import { analyzeAutomatedReplenishment } from "./automated-replenishment-engine";

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
  id: "AUTO-1",
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

describe("analyzeAutomatedReplenishment", () => {
  it("produces an executable plan and correlated events", () => {
    const result = analyzeAutomatedReplenishment({
      ...baseInput,
      executionPolicy: {
        minimumConfidence: 0.5,
        maximumAutomaticPriority: "critical",
        automaticActionTypes: [
          "create_replenishment",
          "create_purchase_order",
          "none",
        ],
      },
    });

    expect(result.analysis.status).toBe("ready");
    expect(result.executionPlan.status).toBe("automatic");
    expect(result.executionPlan.automaticActions.length).toBeGreaterThan(0);
    expect(result.events[0]?.eventType).toBe("commercial.decision.resolved");
  });

  it("blocks execution when critical data quality fails", () => {
    const result = analyzeAutomatedReplenishment({
      ...baseInput,
      inventory: {
        ...baseInput.inventory,
        availableUnits: -1,
      },
    });

    expect(result.analysis.status).toBe("blocked");
    expect(result.executionPlan.status).toBe("blocked");
    expect(result.events.map((event) => event.eventType)).toContain(
      "commercial.action.blocked",
    );
  });
});
