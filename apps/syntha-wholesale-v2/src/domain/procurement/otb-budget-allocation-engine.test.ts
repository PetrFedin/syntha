import { describe, expect, it } from "vitest";

import { allocateOtbBudget } from "./otb-budget-allocation-engine";

const candidate = {
  requestedUnits: 100,
  unitCost: 1000,
  currency: "RUB",
  stockoutRisk: 0.5,
  expectedGrossMarginRate: 0.5,
  decisionConfidence: 0.9,
} as const;

describe("allocateOtbBudget", () => {
  it("funds the highest-priority SKU first", () => {
    const result = allocateOtbBudget({
      id: "OTB-1",
      budgetId: "FW26",
      currency: "RUB",
      availableBudget: 100000,
      candidates: [
        {
          ...candidate,
          skuId: "CZ-SKU",
          segment: "CZ",
          urgency: "none",
          stockoutRisk: 0.1,
        },
        {
          ...candidate,
          skuId: "AX-SKU",
          segment: "AX",
          urgency: "urgent",
          stockoutRisk: 0.95,
        },
      ],
      generatedAt: "2026-07-29T00:00:00.000Z",
    });

    expect(result.lines[0]?.skuId).toBe("AX-SKU");
    expect(result.lines[0]?.status).toBe("full");
    expect(result.lines[1]?.status).toBe("unfunded");
    expect(result.allocatedBudget).toBe(100000);
  });

  it("creates a partial allocation respecting the order multiple", () => {
    const result = allocateOtbBudget({
      id: "OTB-2",
      budgetId: "FW26",
      currency: "RUB",
      availableBudget: 55000,
      candidates: [
        {
          ...candidate,
          skuId: "SKU-1",
          segment: "AX",
          urgency: "urgent",
          orderMultiple: 10,
        },
      ],
      generatedAt: "2026-07-29T00:00:00.000Z",
    });

    expect(result.lines[0]?.allocatedUnits).toBe(50);
    expect(result.lines[0]?.status).toBe("partial");
    expect(result.remainingBudget).toBe(5000);
  });

  it("does not allocate below the minimum executable quantity", () => {
    const result = allocateOtbBudget({
      id: "OTB-3",
      budgetId: "FW26",
      currency: "RUB",
      availableBudget: 50000,
      candidates: [
        {
          ...candidate,
          skuId: "SKU-1",
          segment: "AX",
          urgency: "overdue",
          minimumAllocationUnits: 60,
          orderMultiple: 10,
        },
      ],
      generatedAt: "2026-07-29T00:00:00.000Z",
    });

    expect(result.lines[0]?.allocatedUnits).toBe(0);
    expect(result.lines[0]?.reason).toBe("minimum_allocation_not_funded");
    expect(result.decision.severity).toBe("critical");
  });

  it("marks another currency as ineligible without conversion", () => {
    const result = allocateOtbBudget({
      id: "OTB-4",
      budgetId: "FW26",
      currency: "RUB",
      availableBudget: 100000,
      candidates: [
        {
          ...candidate,
          skuId: "USD-SKU",
          segment: "AX",
          urgency: "urgent",
          currency: "USD",
        },
      ],
      generatedAt: "2026-07-29T00:00:00.000Z",
    });

    expect(result.lines[0]?.status).toBe("ineligible");
    expect(result.lines[0]?.reason).toBe("currency_mismatch");
    expect(result.allocatedBudget).toBe(0);
  });
});
