import { describe, expect, it } from "vitest";

import { selectSupplier } from "./supplier-intelligence-engine";

const baseInput = {
  id: "SS-1",
  skuId: "SKU-1",
  requestedUnits: 100,
  planningDate: "2026-07-29",
  requiredByDate: "2026-08-15",
  budget: {
    currency: "RUB",
    availableAmount: 200000,
  },
  generatedAt: "2026-07-29T00:00:00.000Z",
} as const;

describe("selectSupplier", () => {
  it("selects the strongest commercial supplier rather than the cheapest one", () => {
    const result = selectSupplier({
      ...baseInput,
      candidates: [
        {
          supplierId: "CHEAP-RISKY",
          active: true,
          approved: true,
          unitCost: 900,
          currency: "RUB",
          leadTimeDays: 12,
          availableCapacityUnits: 200,
          reliabilityScore: 0.5,
          onTimeDeliveryScore: 0.55,
          qualityAcceptanceScore: 0.65,
          paymentTermsDays: 15,
        },
        {
          supplierId: "RELIABLE",
          active: true,
          approved: true,
          unitCost: 1000,
          currency: "RUB",
          leadTimeDays: 8,
          availableCapacityUnits: 200,
          reliabilityScore: 0.98,
          onTimeDeliveryScore: 0.97,
          qualityAcceptanceScore: 0.99,
          paymentTermsDays: 45,
        },
      ],
    });

    expect(result.status).toBe("selected");
    expect(result.selected?.supplierId).toBe("RELIABLE");
    expect(result.selectedTerms?.supplierId).toBe("RELIABLE");
    expect(result.decision.actions[0]?.type).toBe("select_supplier");
  });

  it("excludes inactive and wrong-currency candidates", () => {
    const result = selectSupplier({
      ...baseInput,
      candidates: [
        {
          supplierId: "INACTIVE",
          active: false,
          approved: true,
          unitCost: 800,
          currency: "RUB",
          leadTimeDays: 5,
          availableCapacityUnits: 200,
          reliabilityScore: 1,
          onTimeDeliveryScore: 1,
          qualityAcceptanceScore: 1,
        },
        {
          supplierId: "USD-SUPPLIER",
          active: true,
          approved: true,
          unitCost: 10,
          currency: "USD",
          leadTimeDays: 5,
          availableCapacityUnits: 200,
          reliabilityScore: 1,
          onTimeDeliveryScore: 1,
          qualityAcceptanceScore: 1,
        },
        {
          supplierId: "VALID",
          active: true,
          approved: true,
          unitCost: 1100,
          currency: "RUB",
          leadTimeDays: 7,
          availableCapacityUnits: 200,
          reliabilityScore: 0.9,
          onTimeDeliveryScore: 0.9,
          qualityAcceptanceScore: 0.95,
        },
      ],
    });

    expect(result.selected?.supplierId).toBe("VALID");
    expect(result.rankedCandidates.filter((candidate) => candidate.eligible)).toHaveLength(1);
  });

  it("returns a partial selection when capacity cannot cover demand", () => {
    const result = selectSupplier({
      ...baseInput,
      candidates: [
        {
          supplierId: "PARTIAL",
          active: true,
          approved: true,
          unitCost: 1000,
          currency: "RUB",
          leadTimeDays: 7,
          availableCapacityUnits: 40,
          orderMultiple: 10,
          reliabilityScore: 0.95,
          onTimeDeliveryScore: 0.95,
          qualityAcceptanceScore: 0.98,
        },
      ],
    });

    expect(result.status).toBe("partial");
    expect(result.selected?.executableUnits).toBe(40);
    expect(result.selected?.coverageRatio).toBe(0.4);
  });

  it("blocks selection when no candidate is executable", () => {
    const result = selectSupplier({
      ...baseInput,
      candidates: [
        {
          supplierId: "BLOCKED",
          active: false,
          approved: false,
          unitCost: 1000,
          currency: "RUB",
          leadTimeDays: 7,
          availableCapacityUnits: 0,
          reliabilityScore: 0,
          onTimeDeliveryScore: 0,
          qualityAcceptanceScore: 0,
        },
      ],
    });

    expect(result.status).toBe("blocked");
    expect(result.selected).toBeUndefined();
    expect(result.decision.actions[0]?.type).toBe("supplier_review");
  });
});
