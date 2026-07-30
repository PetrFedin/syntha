import { describe, expect, it } from "vitest";

import { assessCommercialDataQuality } from "./commercial-data-quality-engine";

const observations = Array.from({ length: 28 }, (_, index) => ({
  date: `2026-07-${String(index + 1).padStart(2, "0")}`,
  units: 5,
}));

const baseInput = {
  id: "DQ-1",
  skuId: "SKU-1",
  warehouseId: "WH-1",
  currency: "RUB",
  unitCost: 1000,
  availableUnits: 20,
  reservedUnits: 2,
  inboundUnits: 10,
  daysSinceLastSale: 1,
  observations,
  asOfDate: "2026-07-29",
  generatedAt: "2026-07-29T00:00:00.000Z",
} as const;

describe("assessCommercialDataQuality", () => {
  it("passes a complete and current commercial dataset", () => {
    const result = assessCommercialDataQuality(baseInput);

    expect(result.status).toBe("pass");
    expect(result.score).toBe(100);
    expect(result.automationReady).toBe(true);
    expect(result.decision.actions[0]?.type).toBe("none");
  });

  it("blocks automation for a negative inventory balance", () => {
    const result = assessCommercialDataQuality({
      ...baseInput,
      availableUnits: -1,
    });

    expect(result.status).toBe("block");
    expect(result.automationReady).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain(
      "data.negative_value",
    );
    expect(result.decision.actions[0]?.type).toBe("repair_data");
  });

  it("requires review for duplicate and limited demand history", () => {
    const result = assessCommercialDataQuality({
      ...baseInput,
      observations: [
        { date: "2026-07-20", units: 2 },
        { date: "2026-07-20", units: 3 },
        { date: "2026-07-21", units: 4 },
        { date: "2026-07-22", units: 5 },
        { date: "2026-07-23", units: 6 },
        { date: "2026-07-24", units: 7 },
        { date: "2026-07-25", units: 8 },
        { date: "2026-07-26", units: 9 },
      ],
    });

    expect(result.status).toBe("review");
    expect(result.duplicateDateCount).toBe(1);
    expect(result.issues.map((issue) => issue.code)).toContain(
      "data.duplicate_observation_dates",
    );
  });

  it("blocks stale demand history", () => {
    const result = assessCommercialDataQuality({
      ...baseInput,
      observations: Array.from({ length: 14 }, (_, index) => ({
        date: `2026-05-${String(index + 1).padStart(2, "0")}`,
        units: 5,
      })),
    });

    expect(result.status).toBe("block");
    expect(result.issues.map((issue) => issue.code)).toContain(
      "data.stale_demand_history",
    );
  });
});
