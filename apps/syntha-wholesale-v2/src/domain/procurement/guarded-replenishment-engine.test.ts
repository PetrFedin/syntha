import { describe, expect, it } from "vitest";

import type { AtpProjection } from "@/domain/inventory/available-to-promise";

import { analyzeGuardedReplenishment } from "./guarded-replenishment-engine";

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
  id: "GR-1",
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

describe("analyzeGuardedReplenishment", () => {
  it("runs replenishment when commercial data passes", () => {
    const result = analyzeGuardedReplenishment(baseInput);

    expect(result.dataQuality.status).toBe("pass");
    expect(result.replenishment).toBeDefined();
    expect(result.status).toBe("ready");
  });

  it("blocks all downstream automation for critical inventory data", () => {
    const result = analyzeGuardedReplenishment({
      ...baseInput,
      inventory: {
        ...baseInput.inventory,
        availableUnits: -10,
      },
    });

    expect(result.status).toBe("blocked");
    expect(result.dataQuality.status).toBe("block");
    expect(result.replenishment).toBeUndefined();
    expect(result.decisionResolution.actions[0]?.type).toBe("repair_data");
  });

  it("continues in review mode for non-critical quality warnings", () => {
    const result = analyzeGuardedReplenishment({
      ...baseInput,
      forecast: {
        ...baseInput.forecast,
        observations: observations.slice(0, 10),
      },
    });

    expect(result.dataQuality.status).toBe("review");
    expect(result.replenishment).toBeDefined();
    expect(result.status).toBe("review");
  });
});
